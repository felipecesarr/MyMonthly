import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { isValidPin, isWeakPin } from './pin-rules';

export { isValidPin, isWeakPin, normalizePin } from './pin-rules';

const PIN_KEY_PREFIX = 'mymonthly.pin.v1.';
const PENDING_PIN_SLOT = 'mymonthly.pending-pin.v1';
const PENDING_PIN_TTL_MS = 60 * 60 * 1000;
const ATTEMPTS_BEFORE_COOLDOWN = 5;

type StoredPin = {
  pin: string;
  failedAttempts: number;
  lockedUntil: number | null;
};

type PendingPin = {
  email: string;
  pin: string;
  createdAt: number;
};

export type PinVerificationResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds?: number };

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value, secureStoreOptions);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

function pinKey(userId: string): string {
  return `${PIN_KEY_PREFIX}${userId}`;
}

function parseStoredPin(value: string | null): StoredPin | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<StoredPin>;
    if (!isValidPin(parsed.pin ?? '')) return null;

    return {
      pin: parsed.pin!,
      failedAttempts: Number(parsed.failedAttempts) || 0,
      lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : null,
    };
  } catch {
    return null;
  }
}

function cooldownSeconds(failedAttempts: number): number {
  const tier = Math.floor((failedAttempts - ATTEMPTS_BEFORE_COOLDOWN) / 5);
  return Math.min(5 * 60, 30 * 2 ** Math.max(0, tier));
}

function assertAllowedPin(pin: string): void {
  if (!isValidPin(pin)) throw new Error('PIN must contain exactly four digits.');
  if (isWeakPin(pin)) throw new Error('PIN is too easy to guess.');
}

export async function rememberPendingPin(email: string, pin: string): Promise<void> {
  assertAllowedPin(pin);

  const pending: PendingPin = {
    email: email.trim().toLowerCase(),
    pin,
    createdAt: Date.now(),
  };
  await setItem(PENDING_PIN_SLOT, JSON.stringify(pending));
}

export async function clearPendingPin(): Promise<void> {
  await removeItem(PENDING_PIN_SLOT);
}

export async function claimPendingPin(
  userId: string,
  email: string | undefined,
): Promise<boolean> {
  const value = await getItem(PENDING_PIN_SLOT);
  if (!value || !email) return false;

  try {
    const pending = JSON.parse(value) as PendingPin;
    const isCurrentEmail = pending.email === email.trim().toLowerCase();
    const isFresh = Date.now() - pending.createdAt <= PENDING_PIN_TTL_MS;

    if (!isCurrentEmail || !isFresh || !isValidPin(pending.pin)) {
      if (!isFresh) await clearPendingPin();
      return false;
    }

    await savePin(userId, pending.pin);
    await clearPendingPin();
    return true;
  } catch {
    await clearPendingPin();
    return false;
  }
}

export async function hasPin(userId: string): Promise<boolean> {
  return Boolean(parseStoredPin(await getItem(pinKey(userId))));
}

export async function savePin(userId: string, pin: string): Promise<void> {
  assertAllowedPin(pin);

  const record: StoredPin = {
    pin,
    failedAttempts: 0,
    lockedUntil: null,
  };
  await setItem(pinKey(userId), JSON.stringify(record));
}

export async function removePin(userId: string): Promise<void> {
  await removeItem(pinKey(userId));
}

export async function verifyPin(
  userId: string,
  candidate: string,
): Promise<PinVerificationResult> {
  const key = pinKey(userId);
  const record = parseStoredPin(await getItem(key));
  if (!record) return { ok: false };

  const now = Date.now();
  if (record.lockedUntil && record.lockedUntil > now) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000),
    };
  }

  if (record.pin === candidate) {
    await setItem(
      key,
      JSON.stringify({ ...record, failedAttempts: 0, lockedUntil: null }),
    );
    return { ok: true };
  }

  const failedAttempts = record.failedAttempts + 1;
  const shouldCoolDown = failedAttempts >= ATTEMPTS_BEFORE_COOLDOWN;
  const retryAfterSeconds = shouldCoolDown
    ? cooldownSeconds(failedAttempts)
    : undefined;
  await setItem(
    key,
    JSON.stringify({
      ...record,
      failedAttempts,
      lockedUntil: retryAfterSeconds ? now + retryAfterSeconds * 1000 : null,
    }),
  );

  return { ok: false, retryAfterSeconds };
}
