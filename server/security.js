import crypto from 'node:crypto';

export function randomToken(bytes = 32) { return crypto.randomBytes(bytes).toString('base64url'); }
export function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
export function normalizeEmail(value) { return String(value || '').trim().toLowerCase(); }
export function normalizeRut(value) { return String(value || '').trim().toLowerCase().replace(/[^0-9k]/g, ''); }
export function timingSafeEqualString(a, b) {
  const aa = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
export async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = await new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (e, key) => e ? reject(e) : resolve(key.toString('hex'))));
  return { hash, salt };
}
export async function verifyPassword(password, salt, expected) {
  const { hash } = await hashPassword(password, salt);
  return timingSafeEqualString(hash, expected);
}
export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 12 && password.length <= 128 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}
export function clientIp(req) { return String(req.ip || req.socket?.remoteAddress || '').slice(0, 80); }
