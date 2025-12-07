# Vercel Deployment Guide

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A Supabase project (sign up at https://supabase.com)
3. Git repository with your code

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to https://vercel.com/new
3. Import your repository
4. Configure environment variables (see below)
5. Click Deploy

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## Environment Variables

Add these environment variables in your Vercel project settings (Settings > Environment Variables):

### Required Variables

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Optional Variables

```
VITE_SELLAUTH_SHOP_ID=0
```

### Where to Find Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on Settings > API
3. Copy the Project URL (VITE_SUPABASE_URL)
4. Copy the anon/public key (VITE_SUPABASE_ANON_KEY)

## Build Configuration

The project is already configured for Vercel with:
- Build Command: `vite build`
- Output Directory: `dist`
- Install Command: `npm install`

These are automatically detected by Vercel.

## Deployment Steps

1. **Connect Repository**
   - Connect your Git repository to Vercel
   - Vercel will auto-detect it as a Vite project

2. **Configure Environment Variables**
   - Add all required environment variables
   - Make sure to add them for Production, Preview, and Development environments

3. **Deploy**
   - Click Deploy and wait for the build to complete
   - Your site will be live at: `https://your-project.vercel.app`

4. **Custom Domain (Optional)**
   - Go to Settings > Domains
   - Add your custom domain
   - Configure DNS settings as instructed

## Database Setup

Make sure your Supabase database is configured:

1. Run all migrations in your Supabase project
2. Set up Row Level Security (RLS) policies
3. Create an admin user with role 'admin' in the users table
4. Configure site settings in the site_settings table

## Post-Deployment

1. Test all functionality on the live site
2. Configure any additional integrations (Discord, SellAuth)
3. Set up custom domain if needed
4. Enable Vercel Analytics (optional)

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set correctly
- Verify package.json has correct dependencies

### Environment Variables Not Working
- Make sure variables are prefixed with `VITE_`
- Redeploy after adding/changing environment variables
- Check that variables are set for the correct environment (Production/Preview/Development)

### API Errors
- Verify Supabase URL and API keys are correct
- Check Supabase project is not paused
- Ensure RLS policies are properly configured

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to your main/master branch
- **Preview**: Every push to other branches and pull requests

## Performance Optimization

The project includes:
- Static asset caching (31536000s for immutable assets)
- Code splitting via Vite
- Optimized build output
- CDN distribution via Vercel Edge Network

## Support

For issues:
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Project Issues: Contact project maintainer
