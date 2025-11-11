# CloneWander 🌍

Send AI clones on adventures worldwide and get personalized travel recommendations based on your preferences and budget.

## Features

- **🚀 Clone Creation**: Create up to 5 AI clones with custom destinations
- **⏱️ Time Acceleration**: 10x faster time (12-hour travel = 72 minutes real-time)
- **💰 Budget-Aware**: Recommendations tailored to budget/medium/high/luxury budgets
- **🎯 Preference-Based**: Customize experiences based on interests (food, art, nature, etc.)
- **📔 Real-Time Journal**: Clones generate 2-3 updates daily during their trip
- **💾 Persistent Storage**: Supabase database with localStorage fallback

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude API
- **Database**: Supabase (PostgreSQL) with localStorage fallback
- **Deployment**: Vercel

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file:

```env
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional (for Supabase - falls back to localStorage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Supabase (Optional)

If using Supabase, create these tables:

#### Clones Table

```sql
create table clones (
  id text primary key,
  name text not null,
  destination text not null,
  travel_time_hours integer not null,
  activity_duration_days integer not null,
  preferences text,
  budget text not null,
  status text not null,
  departure_time bigint not null,
  arrival_time bigint not null,
  activity_end_time bigint not null,
  created_at bigint not null
);

-- Enable Row Level Security
alter table clones enable row level security;

-- Allow all operations (adjust for your security needs)
create policy "Allow all operations on clones"
  on clones for all
  using (true)
  with check (true);
```

#### Journal Entries Table

```sql
create table journal_entries (
  id text primary key,
  clone_id text not null references clones(id) on delete cascade,
  clone_name text not null,
  destination text not null,
  moment text not null,
  message text not null,
  timestamp bigint not null,
  created_at bigint not null
);

-- Enable Row Level Security
alter table journal_entries enable row level security;

-- Allow all operations (adjust for your security needs)
create policy "Allow all operations on journal_entries"
  on journal_entries for all
  using (true)
  with check (true);
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Deploy to Vercel

```bash
npm run build
vercel deploy
```

Set environment variables in Vercel dashboard:
- `ANTHROPIC_API_KEY` (required)
- `NEXT_PUBLIC_SUPABASE_URL` (optional)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional)

## How It Works

1. **Create a Clone**: Fill in destination, travel time, activity duration, preferences, and budget
2. **Travel Phase**: Clone "travels" to destination (10x accelerated)
3. **Activity Phase**: Clone explores and journals their experiences
4. **Journal Updates**: AI generates 2-3 personalized updates daily with specific recommendations
5. **View Journal**: See all clone adventures in the journal feed

## Time Acceleration

All times are accelerated 10x for testing:
- **12-hour travel** = 72 minutes real-time
- **3-day activity** = 7.2 hours real-time
- **Updates every 2-4 hours** (in-universe) = 12-24 minutes real-time

## Budget Levels

- **💰 Budget**: Street food, free attractions, hostels (~$15/activity)
- **💳 Medium**: Casual restaurants, paid attractions, mid-range hotels ($15-50/activity)
- **💎 High**: Fine dining, premium experiences, nice hotels ($50-150/activity)
- **👑 Luxury**: Michelin stars, exclusive access, 5-star hotels ($150+/activity)

## Future Enhancements

See `context.md` for planned features:
- Google Places API integration for real venue data
- Photo generation with Stable Diffusion
- Multi-language support
- Social sharing capabilities
- Weather data integration
- Budget tracking summaries

## Documentation

See `context.md` for complete app documentation, architecture details, and update history.

## License

MIT
