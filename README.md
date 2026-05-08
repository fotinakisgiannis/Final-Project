# NutriTrack AI 🥦

> **The fastest AI nutrition tracker with intelligent coaching.**

A premium, full-stack nutrition and wellness platform built with Next.js 14, powered by Claude AI. Log meals in under 5 seconds using AI photo recognition, voice logging, or barcode scanning.

## ✨ Features

### AI-Powered Logging
- **Photo AI** — Snap a photo, Claude Sonnet identifies food and estimates calories/macros with 90%+ accuracy
- **Voice Logging** — Say what you ate, AI parses and logs it instantly
- **Barcode Scanner** — Scan packaged foods via Open Food Facts database
- **Food Search** — Search USDA database with 1M+ verified foods

### Smart Dashboard
- Animated calorie ring with remaining calories
- Real-time macro tracking (protein, carbs, fat)
- Hydration tracking with quick-add buttons
- Weight trend charts
- AI-powered coaching insights
- Nutrition score (0-100)

### Analytics
- 7-day and 30-day nutrition charts
- Macro breakdown pie charts
- Goal achievement tracking
- AI-generated weekly summaries
- Weight trend analysis

### Security & Auth
- Email/password authentication (NextAuth)
- Google OAuth
- **WebAuthn Passkeys** (Face ID, Touch ID, Windows Hello)
- Biometric login support
- Secure session management

### Gamification
- Logging streaks
- Achievement badges with points
- Daily nutrition score

### Recipes
- Curated healthy recipe database
- Dietary filters (keto, vegan, high-protein, etc.)
- Verified nutritional information
- Save favorites

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth v4 + SimpleWebAuthn |
| AI | Anthropic Claude Sonnet 4.6 |
| State | Zustand |
| Charts | Recharts |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Food Data | USDA FoodData Central + Open Food Facts |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Anthropic API key

### 1. Clone and install

```bash
git clone <repo>
cd nutritrack-ai
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/nutritrack"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."

# Optional
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
USDA_API_KEY="DEMO_KEY"
```

### 3. Database setup

```bash
# Start PostgreSQL (or use Docker)
docker compose up db -d

# Push schema and seed
npm run db:push
npm run db:seed
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo account:** `demo@nutritrack.ai` / `demo123456`

---

## 🐳 Docker (Full Stack)

```bash
docker compose up
```

This starts PostgreSQL, Redis, and the app on port 3000.

---

## 🗄️ Database Schema

Key models:
- `User` — Auth + profile
- `UserProfile` — Goals, BMR/TDEE, dietary preferences
- `DailyLog` — Per-day totals
- `FoodEntry` — Individual meal logs (supports all sources: AI, voice, barcode, manual)
- `WaterEntry` — Hydration tracking
- `WeightLog` — Weight trend data
- `Recipe` — Curated recipe database
- `PasskeyCredential` — WebAuthn credentials
- `Achievement` + `UserAchievement` — Gamification
- `UserStreak` — Logging streak tracking

---

## 🔌 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth |
| `/api/food/analyze` | POST | AI photo analysis |
| `/api/food/voice` | POST | Voice log parsing |
| `/api/food/barcode` | GET | Barcode lookup |
| `/api/food/search` | GET | USDA food search |
| `/api/log/meals` | GET/POST/DELETE | Meal logging |
| `/api/log/water` | GET/POST | Water tracking |
| `/api/analytics` | GET | Nutrition analytics + AI insights |
| `/api/profile` | GET/POST/PATCH | User profile & onboarding |
| `/api/weight` | GET/POST | Weight logging |
| `/api/recipes` | GET/POST | Recipe browser & favorites |
| `/api/achievements` | GET | Achievement progress |
| `/api/webauthn/register` | GET/POST | Passkey registration |
| `/api/webauthn/authenticate` | POST | Passkey authentication |

---

## 📦 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register, Onboarding
│   ├── (dashboard)/     # Protected app pages
│   └── api/             # API routes
├── components/
│   ├── ui/              # Base: Button, Card, Input, Modal
│   ├── dashboard/       # CalorieRing, MacroCard, WaterTracker
│   ├── logging/         # PhotoLogger, VoiceLogger, BarcodeScanner
│   ├── analytics/       # Charts, MacroBreakdown
│   ├── recipes/         # RecipeCard
│   └── layout/          # Navbar, BottomNav
├── hooks/               # useFood, useDashboard, useVoice, useCamera
├── lib/                 # prisma, auth, ai, nutrition, webauthn, utils
├── store/               # Zustand stores
└── types/               # TypeScript type definitions
prisma/
├── schema.prisma        # Full database schema
└── seed.ts              # Demo data + achievements
```

---

## 🔐 Security

- Passwords hashed with bcrypt (12 rounds)
- Sessions via JWT (30 day expiry)
- WebAuthn / FIDO2 passkeys (no biometric data stored on server)
- Zod validation on all API inputs
- Rate limiting recommended for production (add middleware)
- CSRF protection via NextAuth
- Input sanitization throughout

---

## 📱 Mobile Experience

- Bottom navigation bar
- Floating action button (+)
- Mobile-first responsive design
- PWA support (installable)
- Camera capture for photo logging
- Safe area handling for notched phones
- One-handed use optimized

---

## 🌱 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✓ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✓ | Random secret for JWT signing |
| `NEXTAUTH_URL` | ✓ | App URL |
| `ANTHROPIC_API_KEY` | ✓ | Claude AI API key |
| `GOOGLE_CLIENT_ID` | ✗ | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | ✗ | Google OAuth |
| `USDA_API_KEY` | ✗ | USDA FoodData (default: DEMO_KEY) |
| `WEBAUTHN_RP_ID` | ✗ | WebAuthn relying party ID |
| `WEBAUTHN_ORIGIN` | ✗ | WebAuthn origin URL |

---

## 🚀 Production Deployment

```bash
# Build
npm run build

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Start
npm start
```

**Recommended:** Deploy on Vercel + Neon PostgreSQL for zero-config scaling.

---

Built with ❤️ using [Claude AI](https://anthropic.com) by Anthropic.
