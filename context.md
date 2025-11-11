# CloneWander - Context & Documentation

## App Purpose
CloneWander lets users send AI clones to destinations worldwide, set travel and activity times (accelerated 10x for testing), and receive personalized activity recommendations with expense tracking based on their preferences and budget. Users can dismiss clones to stop updates, and view deduplicated journals simulating a parallel life experience where clones journal their adventures in real-time.

## Features
- **Clone Creation**: Create up to 5 AI clones with custom destinations
- **Time Acceleration**: 10x faster time (12-hour travel = 72 minutes real-time, 3-day activity = 7.2 hours)
- **Personalized Recommendations**: Budget-aware suggestions (budget/medium/high/luxury)
- **Preference-Based Content**: Tailor experiences to user interests (food, art, nature, etc.)
- **Real-Time Journal**: Clones generate 2-3 updates daily during activity period with deduplication
- **Expense Tracking**: Each journal update includes estimated costs, with running totals per clone and trip summaries
- **Dismiss Clone**: Stop clone updates without deleting the clone or journal history
- **Status Tracking**: Live updates on clone travel/activity progress
- **Persistent Storage**: Supabase database with localStorage fallback

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude API (claude-sonnet-4-5-20250929)
- **Database**: Supabase (PostgreSQL) with localStorage fallback
- **Deployment**: Vercel
- **State Management**: React hooks with polling mechanism

## Database Schema

### Clones Table
```sql
id: uuid (primary key)
name: text
destination: text
travel_time_hours: integer
activity_duration_days: integer
preferences: text
budget: text (budget, medium, high, luxury)
status: text (traveling, active, finished, dismissed)
departure_time: timestamp
arrival_time: timestamp
activity_end_time: timestamp
last_journal_update: timestamp
total_spend: numeric (default 0)
created_at: timestamp
```

### Journal Entries Table
```sql
id: uuid (primary key)
clone_id: uuid (foreign key -> clones.id)
clone_name: text
destination: text
moment: text (arrival, mid-day, evening)
message: text
cost: numeric (default 0)
timestamp: timestamp
created_at: timestamp
```

## Time Calculation
- **Acceleration Factor**: 10x
- **Travel Time**: User input (hours) ÷ 10 = real minutes
- **Activity Duration**: User input (days) × 24 hours ÷ 10 = real hours
- **Update Frequency**: Every 2-4 hours (accelerated) = every 12-24 minutes real-time

## AI Prompt Strategy
Clones generate vivid, first-person journal entries using Claude API:
- Written in first person as if the clone is living a parallel life (not "as a clone")
- Include specific real venue names with estimated costs
- Match budget level (e.g., street food for budget, Michelin stars for luxury)
- Incorporate user preferences naturally
- Add relatable personal moments (spilled coffee, got lost, made a friend, etc.)
- Avoid travel guide language—write spontaneously and authentically
- Generate trip summaries at activity end with total estimated expenses

## Future Enhancements (Not Implemented)
- Integration with Google Places API for real venue data
- Photo generation with Stable Diffusion
- Multi-language support
- Social sharing of clone journals
- Clone personality customization
- Weather data integration

## Update Log

### 2025-11-11: Expense Tracking, Dismiss Feature & AI Improvements
- **Expense Tracking**: Added cost estimation to each journal update based on budget level
- **Total Spend Tracking**: Display running totals per clone and trip summaries with estimated expenses
- **Dismiss Clone Feature**: Added dismiss button to stop updates without deleting clone or journal
- **Duplicate Prevention**: Implemented time-based deduplication (5-minute windows) to prevent duplicate entries
- **AI Prompt Improvements**: Rewrote Claude prompts for authentic first-person parallel life experience
- **Trip Summaries**: Automatic generation of trip summaries when activity ends
- **Database Schema Updates**: Added `total_spend` to clones, `cost` to journal entries, `dismissed` status
- **UI Enhancements**: Added expense badges, dismiss status indicators, and cost displays throughout app

### 2025-11-11: Initial Build
- Created core CloneWander app with full functionality
- Implemented clone creation with travel/activity time settings
- Built time acceleration system (10x faster)
- Added budget-based recommendation engine
- Created journal feed with real-time updates
- Set up Supabase integration with localStorage fallback
- Deployed to Vercel with environment variable configuration
- Added Tailwind CSS for responsive design
- Implemented polling system for status tracking and journal generation
