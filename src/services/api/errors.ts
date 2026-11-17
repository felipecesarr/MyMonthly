import type { PostgrestError } from '@supabase/supabase-js';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code = 'UNKNOWN',
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function throwIfError(error: PostgrestError | Error | null): void {
  if (!error) return;
  const code = 'code' in error ? error.code : 'UNKNOWN';
  throw new ApiError(error.message, code, error);
}

