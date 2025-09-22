import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
// Key must be 32 bytes for aes-256-cbc
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'fallback-key-but-set-proper-env-var', 'salt', 32);
// IV must be 16 bytes for aes-256-cbc
const iv = crypto.randomBytes(16);

export const encrypt = (text) => {
  try {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

export const decrypt = (encryptedText) => {
  try {
    const [ivString, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivString, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};