# CWC AI WORKFORCE — CLOUD DEPLOYMENT GUIDE

This guide walks you through connecting **Supabase**, **Telegram**, **GitHub**, and **Vercel** with zero local storage.

---

### Step 1: Set Up Supabase (Database & Realtime)

1. Go to [supabase.com](https://supabase.com) and create a new project (e.g. `cwc-workforce`).
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Open `supabase/schema.sql` from this repository, paste the entire contents into the SQL Editor, and click **Run**.
   - This creates all 6 tables (`drops`, `departments`, `tasks`, `approvals`, `artifacts`, `audit_logs`).
   - It pre-seeds the **10 CWC specialized departments** with their system prompts and restricted action lists.
   - It enables **Supabase Realtime** so your web dashboard updates live.
4. Go to **Project Settings > API**:
   - Copy **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - Copy **anon public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Copy **service_role secret key** (`SUPABASE_SERVICE_ROLE_KEY`)

---

### Step 2: Create Your Founder Telegram Bot

1. Open Telegram on your phone or desktop and search for **`@BotFather`**.
2. Send `/newbot`, name it (e.g., `CWC Founder Command Bot`), and give it a username (e.g., `cwc_founder_bot`).
3. BotFather will provide an **HTTP API Token** (e.g. `7123456789:ABCDefgh-ijkl...`). This is `TELEGRAM_BOT_TOKEN`.
4. To get your personal **Telegram User ID** (so *only you* can authorize actions):
   - Message **`@userinfobot`** on Telegram.
   - It will reply with your numeric `Id` (e.g. `123456789`). This is `TELEGRAM_FOUNDER_CHAT_ID`.

---

### Step 3: Push Code to GitHub

1. Create a new repository on [GitHub](https://github.com) named `cwc-ai-workforce`.
2. Push this directory to your new repo:
   ```bash
   git init
   git add .
   git commit -m "feat: initial CWC AI workforce OS"
   git branch -M main
   git remote add origin https://github.com/<your-username>/cwc-ai-workforce.git
   git push -u origin main
   ```

---

### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New > Project**.
2. Select your `cwc-ai-workforce` GitHub repository and click **Import**.
3. Under **Environment Variables**, add the following keys from your `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_FOUNDER_CHAT_ID`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel project domain, e.g. `https://cwc-workforce.vercel.app`)
   - `QUICKINK_ENV` (`sandbox` or `production`)
   - `QUICKINK_CLIENT_ID` (from your Qikink Dashboard > Integration > Custom API)
   - `QUICKINK_CLIENT_SECRET` (from your Qikink Dashboard)
4. Click **Deploy**. Your dashboard will be live within 60 seconds!

---

### Step 5: Activate Your Telegram Webhook

Once your Vercel URL is live (e.g., `https://cwc-workforce.vercel.app`), tell Telegram to route messages and approval clicks to your webhook.

Open your browser or terminal and visit this URL (replace with your bot token and Vercel domain):

```
https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<YOUR_VERCEL_DOMAIN>/api/telegram/webhook
```

You will receive this JSON confirmation:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

---

### Step 6: Test the System!

1. Open your bot on Telegram and tap **Start** or send `/status`.
2. Try sending:
   ```
   /drop Karna - Suryaputra Heavyweight Tee
   ```
3. Watch the CEO Agent immediately decompose the drop and trigger tasks in **Supabase**.
4. Open your **Vercel Web Dashboard** — you will see the drop, the 10 departments, and live audit logs updating in real-time!
5. When any department attempts an external action (like publishing live or placing factory orders), you will get an instant push notification on Telegram with **`[✅ Approve]`** and **`[❌ Reject]`** buttons.
