import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';

async function freePort() {
  const socket = net.createServer(); socket.listen(0, '127.0.0.1'); await once(socket, 'listening');
  const port = socket.address().port; await new Promise(resolve => socket.close(resolve)); return port;
}
test('HTTP app supports onboarding, auth, private project CRUD and origin checks', async t => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), 'clearbrief-test-'));
  const port = await freePort();
  const child = spawn(process.execPath, ['server.js'], { cwd: process.cwd(), env: { ...process.env, PORT: String(port), DATA_DIR: dataDir }, stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  child.stderr.setEncoding('utf8'); child.stderr.on('data', chunk => { stderr += chunk; });
  t.after(async () => { child.kill(); await rm(dataDir, { recursive: true, force: true }); });
  let ready = false;
  for (let n = 0; n < 60; n++) {
    if (child.exitCode !== null) throw new Error(`Server exited early: ${stderr}`);
    try { await fetch(`http://127.0.0.1:${port}/api/me`); ready = true; break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  assert.equal(ready, true, `server did not become ready: ${stderr}`);
  const base = `http://127.0.0.1:${port}`;
  const call = async (route, { method = 'GET', data, cookie, origin } = {}) => {
    const response = await fetch(base + route, { method, headers: { ...(data ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...(origin ? { origin } : {}) }, body: data ? JSON.stringify(data) : undefined });
    return { response, body: await response.json() };
  };
  const created = await call('/api/register', { method: 'POST', data: { name: 'Riley Example', email: 'Riley@example.test', password: 'a safe password 123' } });
  assert.equal(created.response.status, 201);
  assert.match(created.response.headers.get('set-cookie'), /HttpOnly; SameSite=Lax/);
  const cookie = created.response.headers.get('set-cookie').split(';')[0];
  assert.equal((await call('/api/register', { method: 'POST', data: { name: 'Riley', email: 'riley@example.test', password: 'a safe password 123' } })).response.status, 409);
  assert.equal((await call('/api/login', { method: 'POST', data: { email: 'riley@example.test', password: 'wrong wrong' } })).response.status, 401);
  assert.equal((await call('/api/projects')).response.status, 401);
  assert.equal((await call('/api/projects', { method: 'POST', cookie, origin: 'https://attacker.test', data: {} })).response.status, 403);
  assert.equal((await call('/api/projects', { method: 'POST', cookie, data: { title: 'x', client: '', estimate: -3 } })).response.status, 400);
  const saved = await call('/api/projects', { method: 'POST', cookie, data: { title: 'Brand system', client: 'Acme', description: 'Initial direction', estimate: 4200 } });
  assert.equal(saved.response.status, 201); assert.equal(saved.body.project.estimate, 4200);
  const id = saved.body.project.id;
  assert.equal((await call('/api/projects', { cookie })).body.projects.length, 1);
  const update = await call(`/api/projects/${id}`, { method: 'PUT', cookie, data: { title: 'Brand refresh', client: 'Acme', description: '', estimate: 5000 } });
  assert.equal(update.body.project.title, 'Brand refresh');
  const otherUser = await call('/api/register', { method: 'POST', data: { name: 'Second Person', email: 'second@example.test', password: 'another safe pass 5' } });
  const otherCookie = otherUser.response.headers.get('set-cookie').split(';')[0];
  assert.equal((await call(`/api/projects/${id}`, { method: 'DELETE', cookie: otherCookie })).response.status, 404);
  assert.equal((await call(`/api/projects/${id}`, { method: 'DELETE', cookie })).response.status, 200);
  assert.equal((await call('/api/logout', { method: 'POST', cookie })).response.status, 200);
});
