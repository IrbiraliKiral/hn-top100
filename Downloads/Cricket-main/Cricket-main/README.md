# 🏏 Cricket Dashboard

A production-ready Cricket Dashboard management system built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Features

- **Role Selection** - Visitors can watch matches, Panel users can manage them
- **Live Match Viewing** - Real-time scoreboard with batting/bowling stats
- **Match Management** - Create matches with teams and 5-12 players each
- **Ball-by-Ball Tracking** - +/- controls with run selection (0-6, OUT, NOBALL)
- **Dark/Light Theme** - Toggle between themes with smooth transitions
- **Real-time Updates** - Live score updates using Supabase Realtime

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **State**: React hooks + Zustand

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key from Settings → API

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PANEL_PASSWORD=your_16_digit_password
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── visitor/           # Visitor pages (match list, details)
│   └── panel/             # Panel pages (login, dashboard, match management)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, theme toggle
│   ├── modals/            # Role selection modal
│   ├── visitor/           # Match cards, live scoreboard
│   └── panels/            # Ball tracker, batsman selector
├── hooks/                 # Custom React hooks
├── lib/supabase/          # Supabase client configuration
├── types/                 # TypeScript types
├── helpers/               # Utility functions
└── utils/                 # Constants
```

## Demo Credentials

- **Panel Password**: `1234567890123456`

## License

MIT
