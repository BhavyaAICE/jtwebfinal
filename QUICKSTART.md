# Quick Start Guide

Get your Aurora Services site live on Vercel in 10 minutes.

## Step 1: Prepare Your Repository (2 min)

1. Ensure your code is in a Git repository
2. Push to GitHub, GitLab, or Bitbucket

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Set Up Supabase (3 min)

1. Go to https://supabase.com
2. Create a new project
3. Wait for database provisioning
4. Go to Settings > API
5. Copy your credentials:
   - Project URL
   - Anon/Public Key

## Step 3: Deploy to Vercel (3 min)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository
4. Add environment variables:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SELLAUTH_SHOP_ID=0
```

5. Click "Deploy"
6. Wait for build to complete

## Step 4: Set Up Database (2 min)

1. In Supabase, go to SQL Editor
2. Create your database tables using the migrations
3. Enable Row Level Security on all tables
4. Add your site settings

## Done!

Your site is now live at `https://your-project.vercel.app`

## Next Steps

- Add your first product
- Create an admin user
- Configure site settings
- Add custom domain
- Test checkout flow

## Need Help?

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.
