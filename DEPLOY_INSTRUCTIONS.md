# 🚀 **Final Deployment Instructions**

## **Fill in the Cloudflare Dashboard Settings:**

Based on the screenshot, here's exactly what to enter:

### **Project Settings:**
1. **Project name:** `fire-protection`
2. **Build command:** `npm run build`
3. **Deploy command:** Leave EMPTY (delete `npx wrangler deploy`)
4. **Builds for non-production branches:** ✅ Checked

### **Advanced Settings:**

#### **Root directory:**
- Leave empty (or `/`)

#### **Build output directory:**
- Enter: `dist`

#### **Build variables:**
Add these environment variables:
```
NODE_VERSION=18
```

### **API Token:**
The token you're using: `mpS6C4ckWX6xoQVRD7RiZBHsifGKKjMwQbTgzbzg`

**Make sure it has these permissions:**
- Cloudflare Pages → Edit
- Cloudflare Pages → Read  
- Account → Cloudflare Pages → Read
- User → User Details → Read

## **After Deployment:**

1. Go to project settings
2. Add environment variables:
   - `VITE_SUPABASE_URL` - Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

3. Redeploy with:
   - Go to Deployments tab
   - Click "Retry deployment" or push a new commit

## **Your Site Will Be Live At:**
- Production: `https://fire-protection.pages.dev`
- Preview deployments: Each branch gets its own URL

## **✅ Click "Create and deploy" Now!**

Everything is ready! Just complete the form in the browser. 🔥







