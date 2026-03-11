import * as crypto from 'crypto';

export function generarTokenPlano() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generarClaveTemporal() {
  return crypto.randomBytes(12).toString('base64url');
}