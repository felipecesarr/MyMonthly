import { describe, expect, it } from 'bun:test';
import { isValidPin, isWeakPin, normalizePin } from './pin-rules';

describe('PIN rules', () => {
  it('keeps exactly the first four digits', () => {
    expect(normalizePin('1a2-345')).toBe('1234');
  });

  it('requires exactly four numbers', () => {
    expect(isValidPin('4826')).toBe(true);
    expect(isValidPin('482')).toBe(false);
    expect(isValidPin('48a6')).toBe(false);
  });

  it('rejects repeated, paired, and sequential PINs', () => {
    for (const pin of ['0000', '7777', '0123', '1234', '4321', '9876', '1212', '1122']) {
      expect(isWeakPin(pin)).toBe(true);
    }
    expect(isWeakPin('4826')).toBe(false);
  });
});
