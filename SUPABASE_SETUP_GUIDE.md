# TaskTracker + Supabase Setup Guide

Complete step-by-step guide to get TaskTracker working with Supabase and Google Authentication.

---

## 📋 Prerequisites

- Node.js installed
- Google account for OAuth
- Supabase account (free tier works!)

---

## Step 1: Create Supabase Project (5 minutes)

1. **Go to** [https://supabase.com](https://supabase.com)
2. **Sign in** or create account
3. **Click** "New Project"
4. **Fill in**:
   - Project name: `TaskTracker` (or whatever you want)
   - Database Password: (generate strong password - save this!)
   - Region: Choose closest to you
5. **Click** "Create new project"
6. **Wait** ~2 minutes for project to be ready

---

## Step 2: Run Database Setup (5 minutes)

1. **In Supabase Dashboard**, click on your project
2. **Go to** SQL Editor (left sidebar)
3. **Click** "+ New query"
4. **Copy** entire contents of `SUPABASE_SETUP.sql`
5. **Paste** into SQL Editor
6. **Click** "Run" (or Cmd/Ctrl + Enter)
7. **Wait** for success message

You should see: ✅ Success. No rows returned

---

## Step 3: Enable Google OAuth (10 minutes)

### A. Get Google OAuth Credentials

1. **Go to** [Google Cloud Console](https://console.cloud.google.com)
2. **Create new project** or select existing
3. **Enable** Google+ API:
   - Search "Google+ API" in search bar
   - Click "Enable"
4. **Go to** "APIs & Services" > "Credentials"
5. **Click** "Create Credentials" > "OAuth client ID"
6. **Configure consent screen** (if prompted):
   - User type: External
   - App name: TaskTracker
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue" through remaining steps
7. **Create OAuth client**:
   - Application type: Web application
   - Name: TaskTracker
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: Copy from Supabase (see step B)
   - Click "Create"
8. **Copy** Client ID and Client Secret

### B. Configure in Supabase

1. **In Supabase Dashboard** > Authentication > Providers
2. **Find** "Google" and click to expand
3. **Toggle** "Enable" to ON
4. **Paste** Client ID from Google
5. **Paste** Client Secret from Google
6. **Copy** the Callback URL shown in Supabase
7. **Go back to Google Console** > Your OAuth client
8. **Add** the Supabase callback URL to "Authorized redirect URIs"
9. **Click** "Save" in Google Console
10. **Click** "Save" in Supabase Dashboard

---

## Step 4: Get Supabase API Keys (2 minutes)

1. **In Supabase Dashboard**, go to Settings > API (left sidebar)
2. **Find** "Project URL" - Copy this
3. **Find** "anon public" key - Copy this
4. **Keep these safe!** You'll need them next

---

## Step 5: Configure TaskTracker App (3 minutes)

1. **In your TaskTracker project**, create `.env.local` file in root:

```bash
# Create the file
touch .env.local
```

2. **Open** `.env.local` and add:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Replace** with your actual values from Step 4

4. **Save** the file

⚠️ **IMPORTANT**: Never commit `.env.local` to git! (already in `.gitignore`)

---

## Step 6: Update main.tsx (2 minutes)

**Open** `src/main.tsx` and wrap App with AuthProvider:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './components/AuthProvider'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
```

---

## Step 7: Update App.tsx (5 minutes)

**Open** `src/App.tsx` and add authentication check:

```typescript
import { useAuth } from './components/AuthProvider'
import { AuthPage } from './components/AuthPage'

export default function App() {
  const { user, loading } = useAuth()
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Show login page if not authenticated
  if (!user) {
    return <AuthPage />
  }
  
  // Show main app (existing code continues below...)
  const view = useTaskStore((s) => s.view)
  // ... rest of your existing App code
}
```

---

## Step 8: Add Sign Out Button (2 minutes)

**In** `src/App.tsx`, add sign out to the header:

```typescript
import { LogOut } from 'lucide-react'
import { useAuth } from './components/AuthProvider'

export default function App() {
  const { user, signOut } = useAuth()
  
  // ... in your header nav section:
  
  <button
    type="button"
    onClick={signOut}
    className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600"
  >
    <LogOut className="h-4 w-4" />
    Sign Out
  </button>
}
```

---

## Step 9: Test It! (5 minutes)

1. **Start the dev server**:
```bash
npm run dev
```

2. **Open** http://localhost:5173

3. **You should see** the login page with "Continue with Google"

4. **Click** "Continue with Google"

5. **Sign in** with your Google account

6. **You should be redirected** back to TaskTracker

7. **You're now authenticated!** 🎉

---

## Step 10: Add Production URLs (When Deploying)

When you deploy to production (Vercel, Netlify, etc.):

### A. Update Google OAuth

1. **Go to** Google Cloud Console > Credentials
2. **Add production URLs**:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/**` AND your Supabase callback URL

### B. Update Environment Variables

Add the same env vars to your deployment platform:
- Vercel: Settings > Environment Variables
- Netlify: Site settings > Environment variables

---

## 🎯 What You Now Have

✅ **User Authentication** - Google OAuth sign in  
✅ **Secure Database** - PostgreSQL with Row Level Security  
✅ **Multi-user Support** - Each user has their own data  
✅ **Workspaces** - Teams can collaborate  
✅ **Real-time Ready** - Set up for live updates  

---

## 🚀 Next Steps

Now that authentication works, you can:

1. **Migrate Data**: Convert localStorage store to Supabase queries
2. **Add Workspaces**: Let users create/join teams
3. **Enable Real-time**: Live updates when team members make changes
4. **Add Features**: File uploads, notifications, webhooks, etc.

Want me to help with any of these? Let me know!

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists in project root
- Check variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after adding env vars

### "OAuth redirect mismatch"
- Check callback URL in Supabase matches Google Console
- Make sure you added Supabase callback URL to Google "Authorized redirect URIs"
- Format: `https://[project-ref].supabase.co/auth/v1/callback`

### "Failed to fetch"
- Check Supabase project is running (green dot in dashboard)
- Check your internet connection
- Check Supabase URL is correct (no trailing slash)

### SQL script fails
- Make sure you're using SQL Editor (not API docs)
- Copy the ENTIRE file contents
- Run as one query (don't split it up)
- Check for error message details

### Google sign in doesn't work
- Check OAuth consent screen is configured
- Check Google+ API is enabled
- Check both Client ID and Secret are pasted correctly
- Try in incognito window (clears cache)

---

## 📞 Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Google OAuth Docs: https://developers.google.com/identity/protocols/oauth2

---

Happy building! 🚀
