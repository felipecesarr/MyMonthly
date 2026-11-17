import { supabase } from '../../lib/supabase';

export async function getConnectToken(): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{
    connectToken: string;
  }>('pluggy-connect-token', { method: 'POST' });

  if (error) throw error;
  if (!data?.connectToken) throw new Error('Pluggy did not return a connect token');
  return data.connectToken;
}
