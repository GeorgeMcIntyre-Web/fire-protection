# ⚡ Cloudflare Setup - Do This NOW

## Current Status
- ✅ Supabase credentials found in .env
- ✅ Need to add to Cloudflare Pages
- ✅ Then app will connect to database

---

## 🎯 Add These 2 Variables to Cloudflare

**Go to:** https://dash.cloudflare.com

### **Steps:**

1. Click: **Workers & Pages** (left sidebar)
2. Click: **Pages**
3. Click on: **fire-protection-tracker** project
4. Click: **Settings** tab
5. Scroll down to: **Environment Variables**
6. Click: **Add variable**

### **Add Variable 1:**
```
Name: VITE_SUPABASE_URL
Value: https://your-project.supabase.co
(Get from .env file or Supabase Dashboard)
```

### **Add Variable 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: (your anon key from .env)
```

7. Click: **Save**
8. Go to: **Deployments** tab
9. Click: **Retry deployment** on the latest deployment
10. Wait 2-3 minutes

✅ **Done!**

---

## 🎯 Your Supabase Credentials

I can see your .env has:
- ✅ VITE_SUPABASE_URL configured
- ✅ VITE_SUPABASE_ANON_KEY configured

**Now add these SAME values to Cloudflare Pages!**

---

## 📊 After Adding to Cloudflare

**Next steps:**
1. ✅ Credentials in Cloudflare
2. ⏳ Run SQL migration (COPY_PASTE_READY.md)
3. ⏳ Upload documents (npm run upload-docs)
4. ✅ Test app (visit your URL)

---

## 🚀 One-Command Cloudflare Setup

Once you're logged in to Cloudflare, run:

```bash
npx wrangler pages deploy dist --project-name=fire-protection-tracker --env VITE_SUPABASE_URL="your-url" --env VITE_SUPABASE_ANON_KEY="your-key"
```

**Or manually add via dashboard** (easier)

---

## ✅ Verify It Worked

**After adding env vars and redeploying:**

1. Visit: https://fire-protection-tracker.pages.dev
2. Try to register/login
3. Should connect to Supabase

**If errors:**
- Check Cloudflare deployment logs
- Check browser console for errors
- Verify credentials are correct

---

**Ready to proceed?** Add those 2 environment variables to Cloudflare Pages now!

