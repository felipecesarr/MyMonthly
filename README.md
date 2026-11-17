# MyMonthly

A personal-finance mobile app for organizing accounts, income, expenses, categories and monthly budgets.

[App Store](https://apps.apple.com/us/app/mymonthly/id6742512923) · [Google Play](https://play.google.com/store/apps/details?id=com.mymonthly.mymontlhy)

## What this repository shows

- Account and transaction screens with category and budget views.
- Expo/React Native and TypeScript for the mobile experience.
- A prepared Supabase/PostgreSQL backend with owner-scoped row-level security and atomic financial operations.
- Server-side Pluggy token creation and account deletion functions, with environment-based configuration.

## Source edition

This is a separately prepared, independently configured source edition dated 17 November 2026. It is not a binary reproduction of the currently published application. It has a new Git history and excludes the private development history and production credentials. The original private repositories and deployments were not changed by this preparation.

Use your own backend and service configuration. Optional integrations may remain disabled until configured; read [SECURITY.md](./SECURITY.md) and the development guide below. No production service access or running demonstration backend is included.

## License and commercial use

The original application code that the licensor is authorized to license is available under **PolyForm Noncommercial License 1.0.0**. Read [LICENSE](./LICENSE), [NOTICE](./NOTICE) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

This is **source-available software**, with use limited to the purposes permitted by that license. Commercial reuse or resale outside those permissions requires a separate license: **felipecesarrf@gmail.com**.

Third-party code, libraries, fonts and assets retain their own licenses and notices. These application terms do not remove rights already granted by their holders. Product names, logos and branding are not offered as a license to market or impersonate the published products. GitHub's platform rights to view and fork public repositories continue to apply.


## Development guide

MyMonthly is an Expo/React Native personal-finance app backed by Supabase. The current backend starts from an empty PostgreSQL database; legacy Firebase data is intentionally not imported.

## Requirements

- Node.js 22.13 or newer
- Bun 1.3.14 or newer
- Xcode and CocoaPods for iOS
- Android Studio/JDK 17 for Android
- A Supabase project

This app uses native modules, so run it as a development build rather than in Expo Go.

## Run the app

1. Install dependencies:

   ```sh
   bun install --frozen-lockfile
   ```

2. Create the local public environment file:

   ```sh
   cp .env.example .env.local
   ```

3. Set these values from the Supabase project API settings:

   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   The publishable key is designed for client apps. Never add the service-role key or Pluggy credentials to an `EXPO_PUBLIC_` variable.

   Subscriptions are disabled when no RevenueCat key is present, which keeps
   ordinary local development independent of StoreKit. To test subscriptions
   in a simulator, create a RevenueCat Test Store and set its public SDK key:

   ```dotenv
   EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY=test_...
   ```

   Release builds must omit the Test Store key and provide the matching public
   platform SDK keys instead:

   ```dotenv
   EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...
   EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_...
   ```

   Never put a RevenueCat secret API key (`sk_...`) in the mobile app.

4. Build and launch a native app:

   ```sh
   bun ios
   ```

   or:

   ```sh
   bun android
   ```

5. For later JavaScript-only development, start Metro and open the installed development build:

   ```sh
   bun start
   ```

Use `bun start:clear` when Metro's cache needs to be reset.

## Backend setup

The source-controlled backend is under [`supabase/`](./supabase):

- `migrations/` defines the schema, indexes, RLS policies, grants, signup bootstrap, and atomic financial functions.
- `functions/delete-account/` performs authenticated account deletion with the server-only service role.
- `functions/pluggy-connect-token/` creates short-lived Pluggy Connect tokens without exposing Pluggy credentials to the mobile app.
- `config.toml` contains the local Supabase/Auth settings.

To apply it with the Supabase CLI after creating a hosted project:

```sh
bunx supabase login
bunx supabase link --project-ref YOUR_PROJECT_REF
bunx supabase db push
bunx supabase functions deploy delete-account
bunx supabase functions deploy pluggy-connect-token
```

Configure fresh, rotated Pluggy credentials only as server-side function secrets:

```sh
bunx supabase secrets set PLUGGY_CLIENT_ID=... PLUGGY_CLIENT_SECRET=...
```

Configure newly issued server-only Pluggy credentials for your own environment. Do not reuse credentials from a private development repository or a production application.

In the hosted project's Auth settings, add `mymonthly://auth/callback` to the redirect allow list and configure production SMTP before launch. The app uses Supabase passwordless email links with PKCE to establish or recover an account session. A four-digit PIN then unlocks that verified session locally; it is stored in iOS Keychain or Android Keystore and is never used as a database credential.

### Optional local backend

Local Supabase requires Docker:

```sh
bunx supabase start
bunx supabase db reset
bunx supabase functions serve --env-file supabase/.env.local
```

Copy `supabase/.env.example` to the ignored `supabase/.env.local` for local Pluggy secrets. Use the local URL and publishable/anon key printed by `supabase start` in the app's `.env.local`.

## Architecture

The mobile app uses a typed Supabase client from `src/lib/supabase.ts`. Native sessions are stored in iOS Keychain/Android Keystore through Expo SecureStore, while web sessions use AsyncStorage. The UI's existing data shapes are isolated behind `src/services/api/legacy-data.ts`; new business operations should be added as typed service methods or Postgres functions rather than issuing coordinated writes from screens.

All financial tables use owner-scoped row-level security. Income, expense, transfer, card-payment, and transaction-deletion workflows execute atomically in PostgreSQL functions, preventing partial balance updates. Privileged operations and third-party credentials stay in Edge Functions.

## Verification

```sh
bun run typecheck
bun run doctor
```

Before a release, also build both native platforms and run Supabase's security and performance advisors against the hosted project.
