import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, validatePassword, normalizeRut } from '../security.js';

test('passwords are hashed with a unique salt and verified safely', async () => {
  const first=await hashPassword('SecurePassword123'),second=await hashPassword('SecurePassword123');
  assert.notEqual(first.hash,second.hash);assert.equal(await verifyPassword('SecurePassword123',first.salt,first.hash),true);assert.equal(await verifyPassword('wrong',first.salt,first.hash),false);
});
test('password policy and RUT normalization',()=>{assert.equal(validatePassword('SecurePassword123'),true);assert.equal(validatePassword('short'),false);assert.equal(normalizeRut('78.425.213-2'),'784252132');});
