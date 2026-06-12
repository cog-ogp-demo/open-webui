# GoGovSG

The official Singapore government link shortener — built with **Next.js 14**.

## Tech Stack

| Layer          | Technology                                    |
| -------------- | --------------------------------------------- |
| Framework      | Next.js 14 (App Router)                       |
| Language       | TypeScript                                    |
| UI             | Material UI v5 (MUI), Tailwind CSS            |
| Database       | PostgreSQL via Prisma ORM                     |
| Cache          | Redis (ioredis)                               |
| Authentication | NextAuth.js (email OTP)                       |
| State          | TanStack Query (React Query), Zustand         |
| Charts         | Chart.js + react-chartjs-2                    |
| File Storage   | AWS S3                                        |
| Dev Infra      | Docker Compose (Postgres, Redis, LocalStack)  |

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose

### Setup

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start infrastructure (Postgres, Redis, LocalStack, Maildev)
docker compose up -d

# Push the database schema
npx prisma db push

# Start the dev server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

OTPs for local development are captured by Maildev at [http://localhost:1080](http://localhost:1080).

### Key Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start Next.js dev server         |
| `npm run build`   | Build for production             |
| `npm start`       | Start production server          |
| `npm run lint`    | Run ESLint                       |
| `npm run typecheck` | Run TypeScript type checking   |
| `npx prisma studio` | Open Prisma Studio (DB GUI)   |
| `npx prisma db push` | Push schema changes to DB    |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API Route Handlers
│   │   ├── auth/           # Authentication endpoints
│   │   ├── urls/           # URL CRUD
│   │   ├── redirect/       # Short URL redirect handler
│   │   ├── qrcode/         # QR code generation
│   │   ├── link-stats/     # Link analytics
│   │   ├── directory/      # Directory search
│   │   └── v1/             # External API (v1)
│   ├── login/              # Login page
│   ├── user/               # User dashboard
│   ├── directory/          # Directory page
│   ├── apiintegration/     # API integration page
│   └── layout.tsx          # Root layout
├── components/             # Shared React components
├── lib/                    # Server-side utilities
│   ├── prisma.ts           # Prisma client
│   ├── redis.ts            # Redis connections
│   ├── auth.ts             # NextAuth config
│   ├── config.ts           # App configuration
│   ├── email.ts            # Email service
│   ├── validation.ts       # URL/input validation
│   ├── redirect.ts         # Redirect resolution
│   └── statistics.ts       # Click statistics
├── middleware.ts            # URL redirect middleware
prisma/
└── schema.prisma           # Database schema
docker-compose.yml          # Local dev infrastructure
```

## Architecture

### URL Redirect Flow

1. User visits `go.gov.sg/shortUrl`
2. Next.js middleware intercepts the request
3. Rewrites to `/api/redirect/[shortUrl]` route handler
4. Handler checks Redis cache → falls back to Postgres
5. Returns 302 redirect to the long URL (or 404)
6. Click statistics updated asynchronously

### Authentication

Email-based OTP login flow using NextAuth.js:
1. User enters government email
2. Backend generates OTP, stores hash in Redis, sends via SES
3. User enters OTP → NextAuth Credentials provider verifies
4. JWT session created

## License

MIT — see [LICENSE.md](LICENSE.md)
