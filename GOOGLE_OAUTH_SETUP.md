# Google OAuth Setup Instructions

Since you're using Supabase, here's exactly what you need to do to enable Google OAuth:

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Select **External** user type
   - Fill in app name: "Tensins Gaming Platform"
   - Add your email as support email
   - Add scopes: `openid`, `email`, `profile`
   - Save and continue

## Step 2: Configure OAuth Client

1. Application type: **Web application**
2. Name: "Tensins Web App"
3. **Authorized JavaScript origins**:
   - `https://ezenrsowgzktjkabvalm.supabase.co`
   - `http://localhost:5173` (for local development)
4. **Authorized redirect URIs**:
   - `https://ezenrsowgzktjkabvalm.supabase.co/auth/v1/callback`
   - `http://localhost:54321/auth/v1/callback` (for local development)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## Step 3: Enable Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/ezenrsowgzktjkabvalm/auth/providers)
2. Navigate to **Authentication** > **Providers**
3. Find **Google** in the list
4. Toggle it to **Enabled**
5. Paste your **Client ID**
6. Paste your **Client Secret**
7. Click **Save**

## Step 4: Test

Once configured, users will be able to click the "Continue with Google" button and sign in with their Google accounts. Their profiles will be automatically created in your database.

## Callback URL
Your Supabase callback URL is: `https://ezenrsowgzktjkabvalm.supabase.co/auth/v1/callback`

## Note on Phone/SMS Verification

For phone number verification with SMS codes, you'll need to:
1. Go to **Authentication** > **Providers** > **Phone**
2. Configure an SMS provider (Twilio, MessageBird, or Vonage)
3. Add your SMS provider credentials

However, this requires a paid SMS service account. Email/password and Google OAuth are already fully configured in your app and ready to use once you complete the Google setup above.
