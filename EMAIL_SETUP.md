# Resend Email Setup

The app sends Today's updates through a Supabase Edge Function named `send-devlog-email`.

## 1. Create a Resend API key

Create an API key in Resend. Do not put the key in `index.html` or any GitHub file.

## 2. Set Supabase secrets

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
supabase secrets set RESEND_FROM_EMAIL="Devlog Duo <onboarding@resend.dev>"
supabase secrets set ALLOWED_RECIPIENTS="clem@example.com,ryan@example.com"
```

`ALLOWED_RECIPIENTS` is optional, but recommended so the public site cannot send to arbitrary addresses.

For production, replace `onboarding@resend.dev` with a verified sender/domain in Resend.

## 3. Deploy the function

```bash
supabase functions deploy send-devlog-email
```

After deployment, the `Email` button in the app composer can send Today's updates.
