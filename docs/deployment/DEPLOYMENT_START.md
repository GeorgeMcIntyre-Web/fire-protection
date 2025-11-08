# 🚀 Deployment Instructions

## Current Status
- ✅ Code built successfully
- ✅ All features working
- ✅ Pushed to GitHub
- ⚠️ Cloudflare project needs to be created

---

## Quick Deployment Steps

### Option 1: Deploy via Cloudflare Dashboard (Easiest)

1. **Go to Cloudflare Dashboard:**
   https://dash.cloudflare.com

2. **Navigate to:**
   Workers & Pages → Pages → Create a project

3. **Connect to Git:**
   - Select your GitHub repo: `fire-protection`
   - Choose branch: `main`
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Add Environment Variables:**
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

5. **Deploy:**
   - Click "Save and Deploy"
   - Wait 2-3 minutes
   - App will be live!

---

### Option 2: Deploy via CLI (If you have project)

First create the project:
```bash
npx wrangler pages project create fire-protection-tracker --compatibility-date=2024-01-01
```

Then deploy:
```bash
npx wrangler pages deploy dist --project-name=fire-protection-tracker
```

---

### Option 3: Manual Deploy

```bash
# Build
npm run build

# Then upload dist/ folder to Cloudflare Pages dashboard
# via: Workers & Pages → Pages → Your Project → Upload assets
```

---

## Next Steps After Deployment

### 1. Run SQL Migration

Go to Supabase Dashboard → SQL Editor → Paste and run:

```sql
-- Copy contents of: supabase-documents.sql
```

This creates:
- Document categories
- Document library table
- Storage buckets
- Security policies

### 2. Upload Documents

```bash
npm run upload-docs
```

Uploads all your documents to Supabase.

### 3. Test the App

Visit your deployed URL and test:
- Login/Register
- Dashboard (see PM workflow)
- Create a project
- Test budget tracker
- Check document library

---

## Production URL

Once deployed, your app will be at:
- `https://fire-protection-tracker.pages.dev`
- Or your custom domain (if configured)

---

## Environment Variables to Add

In Cloudflare Pages settings:

**VITE_SUPABASE_URL**
```
Your Supabase project URL
e.g., https://xxxxx.supabase.co
```

**VITE_SUPABASE_ANON_KEY**
```
Your Supabase anon key
Find in Supabase Dashboard → Settings → API
```

---

## Testing Checklist

After deployment:
- [ ] App loads at the URL
- [ ] Login works
- [ ] Can register new user
- [ ] Dashboard shows PM features
- [ ] Budget tracker displays
- [ ] Document library accessible
- [ ] Can create projects
- [ ] Templates work

---

## Troubleshooting

**Build fails:**
- Check logs in Cloudflare
- Verify build command is correct
- Ensure dependencies are in package.json

**App loads but shows errors:**
- Check environment variables are set
- Verify Supabase credentials
- Check browser console for errors

**Can't connect to Supabase:**
- Verify URL and anon key are correct
- Check Supabase project is active
- Ensure RLS policies are set

---

## Ready to Deploy!

Choose one of the deployment options above and you're good to go! 🚀

