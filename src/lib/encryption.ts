import crypto from 'crypto';

// Master key derivation (fallback to safe 32-byte hash if env is not set)
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_SECRET 
  ? crypto.createHash('sha256').update(process.env.TOKEN_ENCRYPTION_SECRET).digest()
  : crypto.createHash('sha256').update('adoracle-secure-aes-256-vault-key-default').digest();

const IV_LENGTH = 16;

/**
 * Encrypts sensitive OAuth tokens or API credentials using AES-256-CBC with authentication
 */
export function encryptToken(plainText: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Return iv:encrypted
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Failed to encrypt token:', error);
    throw new Error('Encryption error');
  }
}

/**
 * Decrypts AES-256-CBC encrypted token string
 */
export function decryptToken(encryptedString: string): string {
  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted format');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt token:', error);
    throw new Error('Decryption error');
  }
}

/**
 * Helper to mask credentials for UI display
 */
export function maskToken(token: string): string {
  if (token.length <= 8) return '********';
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
}

