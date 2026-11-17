import * as ExpoCrypto from 'expo-crypto';
import { Platform } from 'react-native';

function cryptoAlgorithmName(algorithm: AlgorithmIdentifier): string {
  return typeof algorithm === 'string' ? algorithm : algorithm.name;
}

function randomValues<T extends ArrayBufferView | null>(array: T): T {
  if (!array) throw new TypeError('A typed array is required.');

  const random = ExpoCrypto.getRandomBytes(array.byteLength);
  new Uint8Array(array.buffer, array.byteOffset, array.byteLength).set(random);
  return array;
}

const expoSubtleCrypto = {
  async digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer> {
    const name = cryptoAlgorithmName(algorithm).toUpperCase();
    if (name !== 'SHA-256' && name !== 'SHA256') {
      throw new Error(`Unsupported digest algorithm: ${name}`);
    }

    return ExpoCrypto.digest(ExpoCrypto.CryptoDigestAlgorithm.SHA256, data);
  },
} as SubtleCrypto;

export function installNativeWebCrypto(): void {
  if (Platform.OS === 'web') return;

  const current = globalThis.crypto;
  if (current?.subtle && typeof current.subtle.digest === 'function') return;

  const cryptoTarget = (current ?? {}) as Crypto;
  if (typeof cryptoTarget.getRandomValues !== 'function') {
    Object.defineProperty(cryptoTarget, 'getRandomValues', {
      configurable: true,
      value: randomValues,
    });
  }

  Object.defineProperty(cryptoTarget, 'subtle', {
    configurable: true,
    value: expoSubtleCrypto,
  });

  if (!current) {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: cryptoTarget,
    });
  }
}
