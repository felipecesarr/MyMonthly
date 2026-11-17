type PublicEnv = {
  supabaseUrl: string;
  supabasePublishableKey: string;
  revenueCatTestStoreApiKey?: string;
  revenueCatIosApiKey?: string;
  revenueCatAndroidApiKey?: string;
};

function requirePublicEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and provide the project value.`,
    );
  }

  return value.trim();
}

function optionalPublicEnv(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

export const env: PublicEnv = {
  supabaseUrl: requirePublicEnv(
    'EXPO_PUBLIC_SUPABASE_URL',
    process.env.EXPO_PUBLIC_SUPABASE_URL,
  ),
  supabasePublishableKey: requirePublicEnv(
    'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
  revenueCatTestStoreApiKey: optionalPublicEnv(
    process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY,
  ),
  revenueCatIosApiKey: optionalPublicEnv(
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
  ),
  revenueCatAndroidApiKey: optionalPublicEnv(
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  ),
};
