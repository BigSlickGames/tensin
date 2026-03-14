# Quick Start: Authentication Setup

## 🚀 What Works Right Now (No Setup Needed)

### Email/Password Authentication
1. Open your app
2. Users can immediately register and sign in with email/password
3. That's it - it works!

## 📝 5-Minute Setup: Enable Google OAuth

### Step 1: Get Google Credentials
1. Go to https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add redirect URI: `https://ezenrsowgzktjkabvalm.supabase.co/auth/v1/callback`
5. Copy the Client ID and Client Secret

### Step 2: Add to Supabase
1. Go to https://supabase.com/dashboard/project/ezenrsowgzktjkabvalm/auth/providers
2. Find "Google" and toggle it ON
3. Paste Client ID
4. Paste Client Secret
5. Click Save

### Step 3: Test
1. Open your app
2. Click "Continue with Google"
3. Done!

## 🔐 Callback URL Reference

Your Supabase callback URL (needed for Google OAuth setup):
```
https://ezenrsowgzktjkabvalm.supabase.co/auth/v1/callback
```

## 📱 SMS/Phone Verification (Optional - Requires Paid Service)

If you want SMS verification codes:
1. Sign up for Twilio: https://www.twilio.com/try-twilio
2. Get Account SID and Auth Token
3. Go to Supabase Dashboard → Authentication → Providers → Phone
4. Enable Phone provider
5. Add Twilio credentials

**Cost**: ~$0.01-0.05 per SMS

## 🎯 Summary

- ✅ **Email/Password**: Works now, no setup
- ⚠️ **Google OAuth**: 5 min setup (see above)
- 💰 **SMS/Phone**: Optional, requires paid Twilio account
- ✅ **Telegram**: Already working

## Need Help?

See `GOOGLE_OAUTH_SETUP.md` for detailed Google OAuth instructions.
See `AUTHENTICATION_STATUS.md` for complete system overview.
