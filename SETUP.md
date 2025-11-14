# CloneWander - Detailed Setup Guide

Complete step-by-step instructions to get CloneWander running locally and deployed to Vercel.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Supabase Setup (Optional)](#supabase-setup-optional)
3. [Testing the Application](#testing-the-application)
4. [Deployment to Vercel](#deployment-to-vercel)
5. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- Anthropic SDK
- Supabase client
- Tailwind CSS
- TypeScript

### Step 2: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-...`)

### Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Anthropic API key:
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ```

3. **(Optional)** For now, you can skip Supabase - the app will use localStorage

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the CloneWander home page!

---

## Supabase Setup (Optional)

For persistent storage across devices and browsers, set up Supabase.

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign in with GitHub
4. Click **New Project**
5. Fill in:
   - **Name**: CloneWander
   - **Database Password**: (generate a strong password - save it!)
   - **Region**: Choose closest to your users
6. Click **Create new project**
7. Wait 2-3 minutes for project to provision

### Step 2: Create Database Tables

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `supabase-schema.sql` from this project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

You should see: "Success. No rows returned"

### Step 3: Get API Credentials

1. In Supabase dashboard, go to **Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy two values:
   - **Project URL** (under "Project URL")
   - **anon/public** key (under "Project API keys")

### Step 4: Update Environment Variables

Edit your `.env.local` file:

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# Add these Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Restart Development Server

Stop your dev server (Ctrl+C) and restart:

```bash
npm run dev
```

Now your data will persist in Supabase!

---

## Testing the Application

### Create Your First Clone

1. **Fill out the form**:
   - Destination: `Paris`
   - Trip Duration: `1` (for faster testing - 1 hour real-time)
   - Traveler: Choose `Lila` (Budget)
   - Categories: Check `Food` and `Culture`

2. **Click "Send Lila to Paris"**

3. **Observe**:
   - Clone appears in "Active Clones" section immediately
   - Status shows "Traveling"
   - Progress bar at 0%

### Wait for Updates

- First update arrives in **~10 minutes** (morning update)
- Second update at **~30 minutes** (afternoon update)
- Third update at **~50 minutes** (evening update)
- Final summary at **~60 minutes** (trip complete)

**Tip**: You don't need to keep the page open - updates are generated server-side and will appear when you refresh.

### View the Journal

1. Click **"View Full Journal"** or go to `/journal`
2. See all updates from your clone
3. Filter by clone if you have multiple
4. Check expense tracking, routes, and transportation

### Test Different Scenarios

Try creating clones with different configurations:

**Budget vs Luxury**:
- Lila (Budget): €5-20 activities, buses/metro
- Sofia (Luxury): €100-500 activities, private cars

**Different Interests**:
- Food + Shopping: Restaurants and markets
- History + Culture: Museums and landmarks
- Adventure + Hiking: Outdoor activities

**Longer Trips**:
- 3-day trip = 3 hours real-time = 9 updates
- 7-day trip = 7 hours real-time = 21 updates

---

## Deployment to Vercel

### Prerequisites

- GitHub account
- Vercel account (free tier is fine)

### Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - CloneWander app"
   ```

2. **Create GitHub repository**:
   - Go to [github.com/new](https://github.com/new)
   - Name: `clonewander`
   - Visibility: Public or Private
   - Don't initialize with README (you already have one)
   - Click **Create repository**

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/clonewander.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click **Sign Up** or **Log In**
   - Sign in with GitHub

2. **Import Project**:
   - Click **Add New** → **Project**
   - Find your `clonewander` repository
   - Click **Import**

3. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables**:
   Click **Environment Variables** and add:

   ```
   Name: ANTHROPIC_API_KEY
   Value: sk-ant-your-actual-key-here
   ```

   If using Supabase, also add:
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://abcdefgh.supabase.co

   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. **Deploy**:
   - Click **Deploy**
   - Wait 2-3 minutes for build to complete
   - You'll get a URL like `clonewander-abc123.vercel.app`

6. **Test Deployment**:
   - Click the URL to open your live app
   - Create a clone and verify it works

### Step 3: Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-60 minutes)

---

## Troubleshooting

### Issue: "Failed to generate update"

**Cause**: Anthropic API key missing or invalid

**Solution**:
1. Check `.env.local` has correct `ANTHROPIC_API_KEY`
2. Verify key is active at [console.anthropic.com](https://console.anthropic.com/)
3. Restart dev server: `npm run dev`

### Issue: Updates not appearing

**Cause**: Timing issue or polling not working

**Solution**:
1. Wait at least 10 minutes for first update
2. Check browser console for errors (F12)
3. Manually refresh the page
4. Verify clone status is "active" not "completed"

### Issue: Supabase connection failed

**Cause**: Invalid credentials or tables not created

**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Check Supabase project is active
3. Re-run schema: Copy `supabase-schema.sql` to SQL Editor
4. App will automatically fall back to localStorage if Supabase fails

### Issue: Build fails on Vercel

**Cause**: TypeScript errors or missing dependencies

**Solution**:
1. Test build locally: `npm run build`
2. Fix any TypeScript errors
3. Verify all dependencies: `npm install`
4. Push fixes to GitHub (Vercel auto-redeploys)

### Issue: localStorage data lost

**Cause**: Browser data cleared or different device

**Solution**:
- Set up Supabase for persistent storage (see above)
- Data in localStorage is device/browser specific

### Issue: Too many active clones

**Cause**: Maximum limit of 5 active clones

**Solution**:
- Wait for existing clones to complete
- Or manually update status to "completed" in Supabase

---

## Performance Tips

### For Development

- **Use 1-day trips** for faster testing (1 hour real-time)
- **Check console logs** for API errors
- **Use localStorage** for quick iteration (no Supabase setup needed)

### For Production

- **Set up Supabase** for data persistence
- **Monitor API usage** at [console.anthropic.com](https://console.anthropic.com/)
- **Consider rate limiting** for multiple users
- **Add error boundaries** in React components

---

## Next Steps

After successful setup:

1. **Customize traveler profiles** in `lib/types.ts`
2. **Adjust time scaling** in `lib/time.ts`
3. **Modify AI prompts** in `app/api/generate-update/route.ts`
4. **Add weather API** integration (replace simulated weather)
5. **Implement user authentication** with Supabase Auth

---

## Support

If you encounter issues:

1. Check this SETUP.md guide
2. Review README.md for configuration options
3. Check browser console for errors
4. Verify all environment variables
5. Test with a minimal setup (localStorage only, 1-day trip)

---

**Happy wandering! 🌍**
