# TaskTracker + Supabase - Quick Start

## 🚀 What's Ready

✅ Supabase client installed  
✅ Database schema created (`SUPABASE_SETUP.sql`)  
✅ Authentication components ready  
✅ TypeScript types generated  
✅ Environment file template  

---

## ⚡ 3-Minute Setup Checklist

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create new project
- Wait for it to initialize

### 2. Run SQL Setup
- Open SQL Editor in Supabase
- Copy/paste entire `SUPABASE_SETUP.sql`
- Click Run

### 3. Enable Google OAuth
- Google Cloud Console → Create OAuth credentials
- Supabase Dashboard → Authentication → Providers → Google
- Add Client ID & Secret
- Update redirect URIs

### 4. Add Environment Variables
```bash
# Create .env.local file
cp .env.local.example .env.local

# Edit and add your values:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
```

### 5. Update Code (3 files)

**src/main.tsx**:
```typescript
import { AuthProvider } from './components/AuthProvider'

<AuthProvider>
  <App />
</AuthProvider>
```

**src/App.tsx** (at the top):
```typescript
import { useAuth } from './components/AuthProvider'
import { AuthPage } from './components/AuthPage'

export default function App() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <AuthPage />
  
  // Your existing app code...
}
```

**src/App.tsx** (add sign out button):
```typescript
import { LogOut } from 'lucide-react'
const { signOut } = useAuth()

<button onClick={signOut}>
  <LogOut className="h-4 w-4" />
  Sign Out
</button>
```

### 6. Test It!
```bash
npm run dev
```

Open http://localhost:5173 → Click "Continue with Google" → Done! 🎉

---

## 📚 Detailed Guide

See `SUPABASE_SETUP_GUIDE.md` for step-by-step instructions with screenshots.

---

## 🔑 Where to Find Keys

### Supabase Keys
Dashboard → Settings → API:
- Project URL
- anon public key

### Google OAuth
Cloud Console → Credentials → OAuth client:
- Client ID
- Client Secret

---

## ✅ Verification

After setup, you should see:
1. ✅ Login page loads
2. ✅ Google sign-in button works
3. ✅ Redirects to Google
4. ✅ Returns to app authenticated
5. ✅ User email shows in UI
6. ✅ Sign out works

---

## 🐛 Common Issues

**"Missing environment variables"**
→ Check `.env.local` exists and has correct variable names

**"OAuth redirect mismatch"**
→ Add Supabase callback URL to Google Console

**"Failed to fetch"**
→ Check Supabase project is running (green in dashboard)

---

## 📞 Need Help?

Check `SUPABASE_SETUP_GUIDE.md` for troubleshooting section!
