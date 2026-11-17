export function normalizePin(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

export function isValidPin(value: string): boolean {
  return /^\d{4}$/.test(value);
}

export function isWeakPin(value: string): boolean {
  if (!isValidPin(value)) return false;
  if (/^(\d)\1{3}$/.test(value)) return true;
  if (value === '1212' || value === '1122') return true;

  return '01234567890'.includes(value) || '09876543210'.includes(value);
}
