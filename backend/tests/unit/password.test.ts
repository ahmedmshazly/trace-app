import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/lib/password';

describe('password hashing', () => {
  it('verifies a correct password against its hash', async () => {
    const hash = await hashPassword('correct horse battery');
    expect(hash).not.toBe('correct horse battery');
    await expect(verifyPassword('correct horse battery', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('correct horse battery');
    await expect(verifyPassword('wrong password', hash)).resolves.toBe(false);
  });

  it('produces distinct salted hashes for the same input', async () => {
    const a = await hashPassword('same input');
    const b = await hashPassword('same input');
    expect(a).not.toBe(b);
  });
});
