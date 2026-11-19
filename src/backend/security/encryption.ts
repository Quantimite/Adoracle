import crypto from 'crypto';

/**
 * Token vault encryption (AES-256-GCM, authenticated).
 *
 * Key comes from TOKEN_ENCRYPTION_SECRET (or ENCRYPTION_KEY for older setups).
 * In production the app refuses to encrypt without a real secret, so tokens are never
 * protected by a key that is public in the source code.
 */
function getKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_SECRET || process.env.ENCRYPTION_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TOKEN_ENCRYPTION_SECRET is not set. Add it in your Vercel environment variables.');
    }
    return crypto.createHash('sha256').update('adoracle-dev-only-key').digest();
  }
  return crypto.createHash('sha256').update(secret).digest();
}

const IV_LENGTH = 12;

export function encryptToken(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v2:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptToken(encryptedString: string): string {
  const parts = encryptedString.split(':');

  if (parts[0] === 'v2' && parts.length === 4) {
    const [, ivHex, tagHex, dataHex] = parts;
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
  }

  // Legacy AES-256-CBC format (iv:data)
  if (parts.length === 2) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), Buffer.from(parts[0], 'hex'));
    let out = decipher.update(parts[1], 'hex', 'utf8');
    out += decipher.final('utf8');
    return out;
  }

  throw new Error('Invalid encrypted token format');
}

export function maskToken(token: string): string {
  if (token.length <= 8) return '********';
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
}
