# Hemplifier

<div align="center">
  <img src="public/favicon.svg" alt="Hemplifier Logo" width="80" />
  <h3>Organic Technology for Quiet Living</h3>
  <p>Technology designed to disappear into your life.</p>
</div>

---

## Overview

Hemplifier is a premium e-commerce platform for organic lifestyle technology products. Built with React 19, TypeScript, and Tailwind CSS, featuring:

- Multi-currency support (NPR/USD)
- Multi-language support (English/Nepali)
- Dark/Light theme
- AI-powered shopping assistant (Gemini)
- Admin dashboard for product management
- Journal/Blog system

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6
- **Styling**: Tailwind CSS 3.4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Google Gemini API
- **Validation**: Zod
- **Deployment**: Vercel / Netlify

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (free tier works)
- Google AI Studio API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/arpit768/New-Hemplifier.git
   cd New-Hemplifier
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys:
   ```env
   # Required for AI Assistant
   GEMINI_API_KEY=your_gemini_api_key

   # Required for production (database & auth)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database** (for production)
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor
   - Run the migration file: `supabase/migrations/001_initial_schema.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Run TypeScript type checking |

## Project Structure

```
hemplifier/
├── components/          # React components
│   ├── Admin.tsx       # Admin dashboard
│   ├── Checkout.tsx    # Checkout flow
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   └── ...
├── lib/                 # Utilities & services
│   ├── supabase.ts     # Supabase client
│   ├── validations.ts  # Zod schemas
│   └── database.types.ts
├── services/            # API services
│   └── geminiService.ts
├── public/              # Static assets
├── supabase/            # Database migrations
├── App.tsx              # Main application
├── types.ts             # TypeScript types
├── constants.ts         # App constants & data
└── index.tsx            # Entry point
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI assistant |
| `VITE_SUPABASE_URL` | Production | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Production | Supabase anonymous key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe public key |
| `VITE_GA_TRACKING_ID` | Optional | Google Analytics ID |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Netlify

1. Push to GitHub
2. Import project in [Netlify](https://netlify.com)
3. Add environment variables
4. Deploy (uses `netlify.toml` configuration)

## Demo Mode

The app works without Supabase in "demo mode":
- Products and articles are stored in `constants.ts`
- User data is stored in localStorage
- Perfect for development and testing

## Features Roadmap

- [x] Product catalog with variants
- [x] Shopping cart
- [x] User authentication (mock)
- [x] Admin dashboard
- [x] AI shopping assistant
- [x] Dark mode
- [x] Multi-currency
- [ ] Payment integration (Stripe, eSewa)
- [ ] Order management
- [ ] Email notifications
- [ ] Inventory tracking
- [ ] Analytics dashboard

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Apache-2.0 License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Made with care for quiet living.</p>
  <p>
    <a href="https://hemplifier.com">Website</a> •
    <a href="https://github.com/arpit768/New-Hemplifier">GitHub</a>
  </p>
</div>
