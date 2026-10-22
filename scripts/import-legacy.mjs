/** One-time import from Clearbrief's previous SQLite/JSON store. Never used at runtime. */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createClient } from "@supabase/supabase-js";

const sourceDir = path.resolve(process.env.LEGACY_DATA_DIR || "./data");
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your local shell. Never put the service role key in NEXT_PUBLIC_* variables.");

let users = [];
let projects = [];
try {
  const db = new DatabaseSync(path.join(sourceDir, "clearbrief.sqlite"), { readOnly: true });
  users = db.prepare("select id, name, email from users").all();
  projects = db.prepare("select id, userId, title, client, description, estimate, createdAt, updatedAt from projects").all();
  db.close();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

try {
  const legacy = JSON.parse(await readFile(path.join(sourceDir, "database.json"), "utf8"));
  if (!Array.isArray(legacy.users) || !Array.isArray(legacy.projects)) throw new Error("Legacy JSON has an invalid shape.");
  if (!users.length) users = legacy.users.map(({ id, name, email }) => ({ id, name, email }));
  if (!projects.length) projects = legacy.projects;
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (!users.length && !projects.length) throw new Error(`No legacy SQLite or JSON records found in ${sourceDir}.`);
const client = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
const authUsers = [];
for (let page = 1; ; page += 1) {
  const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw new Error(`Could not list Supabase Auth accounts: ${error.message}`);
  authUsers.push(...data.users);
  if (data.users.length < 1000) break;
}

const byEmail = new Map(authUsers.flatMap((user) => user.email ? [[user.email.toLowerCase(), user]] : []));
const ownerIds = new Map();
const missing = [];
for (const oldUser of users) {
  const current = byEmail.get(String(oldUser.email).toLowerCase());
  if (current) ownerIds.set(oldUser.id, current.id);
  else missing.push(oldUser.email);
}
if (missing.length) throw new Error(`Create these Auth users in Supabase before importing. No records were written: ${missing.join(", ")}`);

const asUuid = (legacyId) => {
  const bytes = createHash("sha256").update(`clearbrief-project:${legacyId}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
const rows = projects.map((project) => {
  const userId = ownerIds.get(project.userId);
  if (!userId) throw new Error(`Project ${project.id} does not have a matching legacy account.`);
  return {
    id: asUuid(project.id), user_id: userId, title: project.title, client: project.client,
    description: project.description || "", estimate: project.estimate,
    created_at: project.createdAt, updated_at: project.updatedAt,
  };
});

if (rows.length) {
  const { error } = await client.from("projects").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`Could not import project records: ${error.message}`);
}
console.log(`Imported ${rows.length} brief(s) for ${ownerIds.size} account(s). Password hashes were not copied; each account owner must set a Supabase password.`);
