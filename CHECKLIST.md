# Pre-Deployment Checklist

Use this checklist before deploying to Vercel to ensure everything is configured correctly.

## Database Setup

- [ ] Supabase project created
- [ ] All database migrations applied
- [ ] RLS policies enabled on all tables
- [ ] Admin user created with role 'admin'
- [ ] Site settings populated in site_settings table
- [ ] Test data added (products, categories)

## Environment Variables

- [ ] `.env` file created locally
- [ ] `VITE_SUPABASE_URL` configured
- [ ] `VITE_SUPABASE_ANON_KEY` configured
- [ ] `VITE_SELLAUTH_SHOP_ID` configured (or set to 0)
- [ ] Environment variables added to Vercel dashboard

## Code Quality

- [ ] Build runs successfully (`npm run build`)
- [ ] No console errors in browser
- [ ] All pages load correctly
- [ ] Authentication flow works
- [ ] Cart functionality works
- [ ] Product purchase flow works
- [ ] Admin dashboard accessible

## Vercel Configuration

- [ ] Repository connected to Vercel
- [ ] Environment variables set in Vercel
- [ ] Build settings verified (auto-detected)
- [ ] Custom domain configured (if applicable)

## Third-Party Integrations

- [ ] SellAuth account created (if using)
- [ ] SellAuth products configured
- [ ] SellAuth shop ID added to environment variables
- [ ] Discord invite link updated
- [ ] Social media links updated

## Content

- [ ] Hero image uploaded and URL added to site settings
- [ ] Product images uploaded
- [ ] Product descriptions written
- [ ] FAQ content reviewed
- [ ] Footer links configured
- [ ] About section content added

## Security

- [ ] Supabase RLS policies tested
- [ ] Admin role verification working
- [ ] No sensitive data in repository
- [ ] `.env` file in `.gitignore`
- [ ] API keys are environment variables only

## Performance

- [ ] Images optimized
- [ ] Lighthouse score checked
- [ ] Load time acceptable
- [ ] Mobile responsiveness verified

## Testing

- [ ] All pages tested
- [ ] Navigation works correctly
- [ ] Forms submit successfully
- [ ] Error handling works
- [ ] Loading states display correctly
- [ ] Toasts show appropriate messages

## Post-Deployment

- [ ] Live site tested
- [ ] Authentication works on production
- [ ] Database operations work
- [ ] Payment flow tested
- [ ] Admin dashboard accessible
- [ ] Monitor for errors

## Optional Enhancements

- [ ] Custom domain configured
- [ ] SSL certificate verified
- [ ] Analytics added
- [ ] Error monitoring set up
- [ ] Email notifications configured
- [ ] Backup strategy implemented

## Common Issues to Check

1. **Build fails**: Check all environment variables are set
2. **Blank page**: Check browser console for errors
3. **API errors**: Verify Supabase credentials
4. **Auth not working**: Check RLS policies
5. **Images not loading**: Verify image URLs are accessible

## Deployment Steps

1. Commit and push all changes to your repository
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variables
5. Click Deploy
6. Wait for build to complete
7. Test the live site
8. Configure custom domain (optional)

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev

## Final Check

- [ ] All items above completed
- [ ] Ready to deploy
- [ ] Team notified of deployment
