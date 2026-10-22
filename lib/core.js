import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function cleanText(value, max = 120) {
  return typeof value === 'string' ? value.trim().replace(/[<>]/g, '').slice(0, max) : '';
}
export function validateProject(input) {
  const title = cleanText(input?.title, 100);
  const client = cleanText(input?.client, 100);
  const description = cleanText(input?.description, 1000);
  const estimate = Number(input?.estimate);
  const errors = {};
  if (title.length < 2) errors.title = 'Add a project name (at least 2 characters).';
  if (!client) errors.client = 'Add a client name.';
  if (!Number.isFinite(estimate) || estimate < 0 || estimate > 10000000) errors.estimate = 'Enter an estimate from 0 to 10,000,000.';
  return { value: { title, client, description, estimate: Math.round(estimate * 100) / 100 }, errors };
}
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = String(stored).split(':');
  if (!/^[a-f0-9]{32}$/.test(saltHex || '') || !/^[a-f0-9]{128}$/.test(hashHex || '')) return false;
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), 64);
  return timingSafeEqual(actual, Buffer.from(hashHex, 'hex'));
}
