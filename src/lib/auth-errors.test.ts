import { describe, expect, it } from 'bun:test';
import { authErrorMessage } from './auth-errors';

describe('auth error messages', () => {
  it('explains a non-deliverable email without exposing the raw API error', () => {
    expect(authErrorMessage({ code: 'email_address_invalid' })).toBe(
      'Esse endereço não consegue receber emails. Use outro email.',
    );
  });

  it('maps rate limits and network failures', () => {
    expect(authErrorMessage({ code: 'over_email_send_rate_limit' })).toContain('Aguarde');
    expect(authErrorMessage(new Error('Network request failed'))).toContain('Sem conexão');
  });
});
