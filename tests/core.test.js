import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProject, hashPassword, verifyPassword } from '../lib/core.js';

test('project validation trims and sanitizes fields and rounds estimates', () => {
  const result = validateProject({ title: ' <Site refresh> ', client: ' Cedar Co ', description: '<hello>', estimate: '1200.236' });
  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.value, { title: 'Site refresh', client: 'Cedar Co', description: 'hello', estimate: 1200.24 });
});

test('project validation rejects missing names and unsafe estimates', () => {
  const { errors } = validateProject({ title: 'x', client: '', estimate: -1 });
  assert.ok(errors.title); assert.ok(errors.client); assert.ok(errors.estimate);
});

test('password hashes verify without storing the original password', async () => {
  const hash = await hashPassword('a secure test password');
  assert.notEqual(hash, 'a secure test password');
  assert.equal(await verifyPassword('a secure test password', hash), true);
  assert.equal(await verifyPassword('wrong password', hash), false);
  assert.equal(await verifyPassword('test', 'malformed'), false);
});
