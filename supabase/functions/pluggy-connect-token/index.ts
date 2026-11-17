import { createClient } from 'npm:@supabase/supabase-js@2.110.7';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authorization = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY');
  const clientId = Deno.env.get('PLUGGY_CLIENT_ID');
  const clientSecret = Deno.env.get('PLUGGY_CLIENT_SECRET');

  if (!authorization) return json({ error: 'Authentication required' }, 401);
  if (!supabaseUrl || !publishableKey || !clientId || !clientSecret) {
    return json({ error: 'Server configuration error' }, 500);
  }

  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'Invalid session' }, 401);

  const authResponse = await fetch('https://api.pluggy.ai/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  });
  if (!authResponse.ok) {
    console.error('Pluggy authentication failed', { status: authResponse.status });
    return json({ error: 'Unable to authenticate the bank integration' }, 502);
  }

  const authPayload = await authResponse.json() as { apiKey?: string };
  if (!authPayload.apiKey) return json({ error: 'Invalid response from bank integration' }, 502);

  const connectResponse = await fetch('https://api.pluggy.ai/connect_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': authPayload.apiKey,
    },
    body: JSON.stringify({
      options: {
        clientUserId: userData.user.id,
        avoidDuplicates: true,
      },
    }),
  });
  if (!connectResponse.ok) {
    console.error('Pluggy connect token failed', { status: connectResponse.status });
    return json({ error: 'Unable to start the bank connection' }, 502);
  }

  const connectPayload = await connectResponse.json() as {
    accessToken?: string;
    connectToken?: string;
  };
  const connectToken = connectPayload.connectToken ?? connectPayload.accessToken;
  if (!connectToken) return json({ error: 'Invalid response from bank integration' }, 502);

  return json({ connectToken });
});
