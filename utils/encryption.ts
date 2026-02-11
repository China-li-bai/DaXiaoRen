export interface EncryptionKey {
  key: CryptoKey;
  salt: string;
  iv: string;
}

export interface EncryptedData {
  data: string;
  salt: string;
  iv: string;
}

const ENCRYPTION_KEY_STORAGE = 'encryption_key';
const ENCRYPTION_ENABLED_KEY = 'encryption_enabled';

export async function generateEncryptionKey(): Promise<EncryptionKey> {
  const cryptoObj = window.crypto || (globalThis as any).crypto;
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API not available');
  }

  const salt = cryptoObj.getRandomValues(new Uint8Array(16));
  const iv = cryptoObj.getRandomValues(new Uint8Array(12));

  const key = await cryptoObj.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );

  return {
    key,
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv)
  };
}

export async function encryptData(data: string, encryptionKey: EncryptionKey): Promise<EncryptedData> {
  const cryptoObj = window.crypto || (globalThis as any).crypto;
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API not available');
  }

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const encryptedBuffer = await cryptoObj.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: base64ToArrayBuffer(encryptionKey.iv)
    },
    encryptionKey.key,
    dataBuffer
  );

  return {
    data: arrayBufferToBase64(encryptedBuffer),
    salt: encryptionKey.salt,
    iv: encryptionKey.iv
  };
}

export async function decryptData(encryptedData: EncryptedData, encryptionKey: EncryptionKey): Promise<string> {
  const cryptoObj = window.crypto || (globalThis as any).crypto;
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API not available');
  }

  const encryptedBuffer = base64ToArrayBuffer(encryptedData.data);

  const decryptedBuffer = await cryptoObj.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToArrayBuffer(encryptedData.iv)
    },
    encryptionKey.key,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

export async function saveEncryptionKey(encryptionKey: EncryptionKey): Promise<void> {
  const cryptoObj = window.crypto || (globalThis as any).crypto;
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API not available');
  }

  const exportedKey = await cryptoObj.subtle.exportKey('jwk', encryptionKey.key);
  const keyData = {
    key: exportedKey,
    salt: encryptionKey.salt,
    iv: encryptionKey.iv
  };
  localStorage.setItem(ENCRYPTION_KEY_STORAGE, JSON.stringify(keyData));
}

export async function loadEncryptionKey(): Promise<EncryptionKey | null> {
  const keyDataStr = localStorage.getItem(ENCRYPTION_KEY_STORAGE);
  if (!keyDataStr) return null;
  try {
    const keyData = JSON.parse(keyDataStr);
    const cryptoObj = window.crypto || (globalThis as any).crypto;
    if (!cryptoObj || !cryptoObj.subtle) {
      throw new Error('Web Crypto API not available');
    }

    const key = await cryptoObj.subtle.importKey(
      'jwk',
      keyData.key,
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );

    return {
      key,
      salt: keyData.salt,
      iv: keyData.iv
    };
  } catch (error) {
    console.error('Failed to load encryption key:', error);
    return null;
  }
}

export function deleteEncryptionKey(): void {
  localStorage.removeItem(ENCRYPTION_KEY_STORAGE);
}

export function isEncryptionEnabled(): boolean {
  return localStorage.getItem(ENCRYPTION_ENABLED_KEY) === 'true';
}

export function setEncryptionEnabled(enabled: boolean): void {
  localStorage.setItem(ENCRYPTION_ENABLED_KEY, enabled.toString());
}

export async function initializeEncryption(): Promise<EncryptionKey | null> {
  if (!isEncryptionEnabled()) {
    return null;
  }

  const cryptoObj = window.crypto || (globalThis as any).crypto;
  if (!cryptoObj || !cryptoObj.subtle) {
    console.warn('Web Crypto API not available, encryption disabled');
    setEncryptionEnabled(false);
    return null;
  }

  let encryptionKey = await loadEncryptionKey();

  if (!encryptionKey) {
    encryptionKey = await generateEncryptionKey();
    await saveEncryptionKey(encryptionKey);
  }

  return encryptionKey;
}

export async function encryptAndStore(key: string, data: any): Promise<void> {
  const encryptionEnabled = isEncryptionEnabled();

  if (!encryptionEnabled) {
    localStorage.setItem(key, JSON.stringify(data));
    return;
  }

  const cryptoObj = window.crypto || (globalThis as any).crypto;
  if (!cryptoObj || !cryptoObj.subtle) {
    console.warn('Web Crypto API not available, storing data without encryption');
    localStorage.setItem(key, JSON.stringify(data));
    return;
  }

  let encryptionKey = await loadEncryptionKey();

  if (!encryptionKey) {
    console.log('Encryption key not found, generating new key...');
    encryptionKey = await generateEncryptionKey();
    await saveEncryptionKey(encryptionKey);
  }

  const jsonData = JSON.stringify(data);
  const encrypted = await encryptData(jsonData, encryptionKey);
  localStorage.setItem(key, JSON.stringify(encrypted));
}

export async function decryptAndRetrieve<T>(key: string): Promise<T | null> {
  const dataStr = localStorage.getItem(key);
  if (!dataStr) return null;

  try {
    const data = JSON.parse(dataStr);

    if (data.data && data.salt && data.iv) {
      const cryptoObj = window.crypto || (globalThis as any).crypto;
      if (!cryptoObj || !cryptoObj.subtle) {
        console.warn('Web Crypto API not available, cannot decrypt');
        return null;
      }

      const encryptionKey = await loadEncryptionKey();
      if (!encryptionKey) {
        console.log('Encryption key not found, returning encrypted data as-is');
        return null;
      }

      const decrypted = await decryptData(data as EncryptedData, encryptionKey);
      return JSON.parse(decrypted) as T;
    }

    return data as T;
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    console.error('Data string:', dataStr);
    return null;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function migrateToEncryption(key: string): Promise<boolean> {
  const dataStr = localStorage.getItem(key);
  if (!dataStr) return false;
  
  try {
    const data = JSON.parse(dataStr);
    
    if (data.data && data.salt && data.iv) {
      return false;
    }
    
    const encryptionKey = await loadEncryptionKey();
    if (!encryptionKey) {
      return false;
    }
    
    await encryptAndStore(key, data);
    return true;
  } catch (error) {
    console.error('Failed to migrate data:', error);
    return false;
  }
}