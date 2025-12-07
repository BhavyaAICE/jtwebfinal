# AuroraServices

A premium digital services marketplace built with React, Vite, and Supabase.

## Features

- Product catalog with variants support
- Shopping cart functionality
- Customer reviews and ratings
- Admin dashboard for product management
- SellAuth integration for checkout
- Email-based authentication (OTP)
- Responsive design with modern UI

## Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Styling**: CSS3 with custom design system
- **Payment**: SellAuth integration
- **Deployment**: Vercel

## Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd auroraservices
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SELLAUTH_SHOP_ID=0
```

### 4. Run development server

```bash
npm run dev
```

Visit http://localhost:5173

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed Vercel deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. Click the button above or go to https://vercel.com/new
2. Import your repository
3. Add environment variables
4. Deploy

## Database Setup

Your Supabase database should have the following tables:
- `users` - User accounts
- `products` - Product catalog
- `product_variants` - Product variants
- `reviews` - Customer reviews
- `cart_items` - Shopping cart
- `orders` - Order history
- `site_settings` - Site configuration

All migrations and RLS policies should be set up via Supabase.

## Project Structure

```
├── src/
│   ├── assets/          # Images and static assets
│   ├── components/      # React components
│   │   ├── Footer.jsx
│   │   ├── LoginModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductVariantsModal.jsx
│   │   ├── ReviewModal.jsx
│   │   └── Toast.jsx
│   ├── contexts/        # React contexts
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── lib/            # Utilities and configurations
│   │   ├── sellauth.js
│   │   └── supabase.js
│   ├── pages/          # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── CartPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── ProductsPage.jsx
│   │   └── ReviewsPage.jsx
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── .env.example        # Environment variables template
├── vercel.json         # Vercel configuration
└── package.json        # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `VITE_SELLAUTH_SHOP_ID` | Your SellAuth shop ID (set to 0 to disable) | No |

## Admin Access

To access the admin dashboard:
1. Create a user account
2. Update the user's role to 'admin' in the Supabase users table
3. Log in and navigate to the admin panel

## Features Overview

### Customer Features
- Browse products and variants
- Add items to cart
- Checkout via SellAuth
- Leave reviews
- Email-based authentication

### Admin Features
- Product management (CRUD)
- Variant management
- Review moderation
- Site settings configuration
- Order tracking
- Quick stock management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

All rights reserved.

## Support

For issues or questions, please contact the project maintainer.
