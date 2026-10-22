import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { emailPattern, cleanText, validateProject, hashPassword, verifyPassword } from './lib/core.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, 'data'));
const dbPath = path.join(dataDir, 'database.json');
const secureCookie = process.env.COOKIE_SECURE === 'true';
const sessions = new Map();
let writeQueue = Promise.resolve();
let db;

async function loadDb() {
  await mkdir(dataDir, { recursive: true, mode: 0o700 });
  try { db = JSON.parse(await readFile(dbPath, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw new Error('Database file is invalid or unreadable.');
    db = { users: [], projects: [] };
    await persist();
  }
  if (!Array.isArray(db.users) || !Array.isArray(db.projects)) throw new Error('Database has an invalid structure.');
}
function persist() {
  writeQueue = writeQueue.then(async () => {
    const temp = `${dbPath}.${randomBytes(5).toString('hex')}.tmp`;
    await writeFile(temp, JSON.stringify(db), { mode: 0o600 });
    const { rename } = await import('node:fs/promises');
    await rename(temp, dbPath);
  });
  return writeQueue;
}
function send(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'content-length': Buffer.byteLength(body), ...headers });
  res.end(body);
}
function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map(x => x.trim().split('=').map(decodeURIComponent)).filter(x => x.length === 2));
}
function sessionUser(req) {
  const id = sessions.get(parseCookies(req).clearbrief_session);
  return db.users.find(user => user.id === id);
}
async function body(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 20000) throw Object.assign(new Error('Request is too large.'), { status: 413 });
  }
  try { return JSON.parse(data || '{}'); } catch { throw Object.assign(new Error('Send valid JSON.'), { status: 400 }); }
}
function cookie(value, maxAge = 60 * 60 * 24 * 14) {
  return `clearbrief_session=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secureCookie ? '; Secure' : ''}`;
}
const publicUser = user => ({ id: user.id, name: user.name, email: user.email });

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) {
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
        const origin = req.headers.origin;
        if (origin && origin !== `http://${req.headers.host}` && origin !== `https://${req.headers.host}`) return send(res, 403, { error: 'Request origin was rejected.' });
      }
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      if (req.method === 'POST' && url.pathname === '/api/register') {
        const data = await body(req);
        const name = cleanText(data.name, 80);
        const email = cleanText(data.email, 254).toLowerCase();
        if (name.length < 2 || !emailPattern.test(email) || typeof data.password !== 'string' || data.password.length < 10 || data.password.length > 200) return send(res, 400, { error: 'Use a name, valid email, and password of at least 10 characters.' });
        if (db.users.some(u => u.email === email)) return send(res, 409, { error: 'An account with that email already exists.' });
        const user = { id: randomBytes(16).toString('hex'), name, email, password: await hashPassword(data.password), createdAt: new Date().toISOString() };
        db.users.push(user); await persist();
        const token = randomBytes(32).toString('hex'); sessions.set(token, user.id);
        return send(res, 201, { user: publicUser(user) }, { 'set-cookie': cookie(token) });
      }
      if (req.method === 'POST' && url.pathname === '/api/login') {
        const data = await body(req);
        const email = cleanText(data.email, 254).toLowerCase();
        const user = db.users.find(u => u.email === email);
        if (!user || typeof data.password !== 'string' || !await verifyPassword(data.password, user.password)) return send(res, 401, { error: 'Email or password is incorrect.' });
        const token = randomBytes(32).toString('hex'); sessions.set(token, user.id);
        return send(res, 200, { user: publicUser(user) }, { 'set-cookie': cookie(token) });
      }
      if (req.method === 'POST' && url.pathname === '/api/logout') {
        sessions.delete(parseCookies(req).clearbrief_session);
        return send(res, 200, { ok: true }, { 'set-cookie': cookie('', 0) });
      }
      const user = sessionUser(req);
      if (req.method === 'GET' && url.pathname === '/api/me') return send(res, 200, { user: user ? publicUser(user) : null });
      if (!user) return send(res, 401, { error: 'Please sign in to continue.' });
      if (req.method === 'GET' && url.pathname === '/api/projects') return send(res, 200, { projects: db.projects.filter(p => p.userId === user.id).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)) });
      if (req.method === 'POST' && url.pathname === '/api/projects') {
        const { value, errors } = validateProject(await body(req));
        if (Object.keys(errors).length) return send(res, 400, { error: 'Check the project details.', fields: errors });
        const project = { ...value, id: randomBytes(12).toString('hex'), userId: user.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        db.projects.push(project); await persist(); return send(res, 201, { project });
      }
      const projectMatch = url.pathname.match(/^\/api\/projects\/([a-f0-9]{24})$/);
      if (projectMatch && ['PUT', 'DELETE'].includes(req.method)) {
        const index = db.projects.findIndex(p => p.id === projectMatch[1] && p.userId === user.id);
        if (index < 0) return send(res, 404, { error: 'Project not found.' });
        if (req.method === 'DELETE') { db.projects.splice(index, 1); await persist(); return send(res, 200, { ok: true }); }
        const { value, errors } = validateProject(await body(req));
        if (Object.keys(errors).length) return send(res, 400, { error: 'Check the project details.', fields: errors });
        db.projects[index] = { ...db.projects[index], ...value, updatedAt: new Date().toISOString() };
        await persist(); return send(res, 200, { project: db.projects[index] });
      }
      return send(res, 404, { error: 'Endpoint not found.' });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed.' }, { allow: 'GET, HEAD' });
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/') pathname = '/index.html';
    const file = path.resolve(root, 'public', `.${pathname}`);
    if (!file.startsWith(path.resolve(root, 'public') + path.sep)) return send(res, 404, { error: 'Not found.' });
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
    const content = await readFile(file);
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin', 'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    if (error.code === 'ENOENT') return send(res, 404, { error: 'Not found.' });
    if (error.status) return send(res, error.status, { error: error.message });
    console.error('Request failed:', error.message);
    return send(res, 500, { error: 'Something went wrong. Please try again.' });
  }
});

await loadDb();
server.listen(port, () => console.log(`Clearbrief running at http://localhost:${port}`));
