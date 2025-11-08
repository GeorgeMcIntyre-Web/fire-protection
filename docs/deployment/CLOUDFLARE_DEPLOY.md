# Cloudflare Pages Deployment Guide

This guide will help you deploy your Fire Protection Tracker to Cloudflare Pages.

## 🚀 **Quick Deploy Commands**

### **Step 1: Install Wrangler CLI (if not already installed)**
```bash
npm install -D wrangler
# OR
npm install -g wrangler
```

### **Step 2: Login to Cloudflare**
```bash
npm run cf:login
```
This will open a browser window for you to authenticate.

### **Step 3: Deploy to Cloudflare Pages**
```bash
npm run cf:deploy
```

## 📋 **Manual Deployment Steps**

### **1. Build Your Project**
```bash
npm run build
```
This creates the `dist` folder with your production build.

### **2. Authenticate with Cloudflare**
```bash
npx wrangler login
```

### **3. Create a Pages Project (First Time Only)**
```bash
npx wrangler pages project create fire-protection-tracker
```

### **4. Deploy Your Site**
```bash
npx wrangler pages deploy dist --project-name=fire-protection-tracker
```

## 🔧 **Environment Variables**

### **Set Environment Variables in Cloudflare Dashboard:**

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **fire-protection-tracker**
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=Fire Protection Tracker
```

### **Or use Wrangler CLI:**
```bash
npx wrangler pages secret put VITE_SUPABASE_URL
# Enter your value when prompted

npx wrangler pages secret put VITE_SUPABASE_ANON_KEY
# Enter your value when prompted
```

## 🎯 **Production Configuration**

### **Update .env.production (create if doesn't exist):**
```env
# Production Environment Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# App Configuration
VITE_APP_NAME=Fire Protection Tracker
VITE_APP_VERSION=1.0.0
```

## 🔄 **Continuous Deployment (Git Integration)**

### **1. Connect to Git Repository:**

In Cloudflare Dashboard:
1. Go to your Pages project
2. Click **Connect to Git**
3. Select your Git provider (GitHub, GitLab, etc.)
4. Choose your repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (or leave blank)

### **2. Automatic Deployments:**

- Every push to `main` branch deploys to production
- Pull requests create preview deployments
- Deployments are instant after CI build completes

## 📊 **Cloudflare Pages Features**

### **Custom Domain**
1. In project settings, click **Custom domains**
2. Add your domain
3. Follow DNS setup instructions

### **Preview Deployments**
Every pull request gets its own preview URL:
- Example: `fire-protection-tracker-abc123.pages.dev`

### **Analytics**
Cloudflare automatically tracks:
- Page views
- Real user monitoring
- Performance metrics
- Error rates

## 🐛 **Troubleshooting**

### **Build Failures**
If the build fails:
1. Check the build logs in Cloudflare Dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility (specify in `.nvmrc` if needed)

### **Environment Variables Not Working**
1. Verify variables are set as production secrets
2. Ensure variables start with `VITE_` prefix
3. Rebuild and redeploy after adding variables

### **Routing Issues (SPA)**
Cloudflare Pages handles SPA routing automatically with the `cloudflare-pages.json` config.

## 🎉 **Success!**

Once deployed, your Fire Protection Tracker will be live at:
- **Production:** `https://fire-protection-tracker.pages.dev`
- **Custom Domain:** `https://your-domain.com`

## 📝 **Useful Commands**

```bash
# Login to Cloudflare
npm run cf:login

# Deploy to Cloudflare
npm run cf:deploy

# Check deployment status
npx wrangler pages deployment list --project-name=fire-protection-tracker

# View logs
npx wrangler pages deployment tail --project-name=fire-protection-tracker

# Rollback to previous deployment
npx wrangler pages deployment rollback <deployment-id>
```

## 🚀 **What Happens During Deployment**

1. **Build:** Vite compiles your React app to optimized JavaScript
2. **Upload:** Wrangler uploads the `dist` folder to Cloudflare
3. **Deploy:** Cloudflare serves your app from their global CDN
4. **Cache:** Your app is cached at edge locations worldwide
5. **SSL:** Automatic HTTPS is enabled

## 📈 **Performance Benefits**

- **Global CDN:** Content served from closest edge location
- **Fast Loading:** Static assets cached and optimized
- **Auto HTTPS:** SSL certificate automatically managed
- **DDoS Protection:** Included with Cloudflare
- **Analytics:** Built-in analytics dashboard

---

**Your Fire Protection Tracker is ready to deploy!** 🔥








