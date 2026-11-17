type AuthErrorLike = {
  code?: unknown;
  message?: unknown;
};

export function authErrorMessage(error: unknown): string {
  const authError = (error ?? {}) as AuthErrorLike;
  const code = typeof authError.code === 'string' ? authError.code : '';
  const message = typeof authError.message === 'string' ? authError.message.toLowerCase() : '';

  if (
    code === 'email_address_invalid' ||
    (message.includes('email address') && message.includes('invalid'))
  ) {
    return 'Esse endereço não consegue receber emails. Use outro email.';
  }
  if (code === 'over_email_send_rate_limit' || message.includes('rate limit')) {
    return 'Aguarde um instante antes de solicitar outro link.';
  }
  if (message.includes('network request failed') || message.includes('failed to fetch')) {
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }

  return 'Não foi possível enviar o link. Tente novamente.';
}
