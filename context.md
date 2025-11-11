# CloneWander - Context & Documentation

## App Purpose
CloneWander lets users send AI clones to destinations worldwide, set travel and activity times (accelerated 10x for testing), and receive personalized activity recommendations based on their preferences and budget. The app simulates a parallel life experience where clones journal their adventures in real-time.

## Features
- **Clone Creation**: Create up to 5 AI clones with custom destinations
- **Time Acceleration**: 10x faster time (12-hour travel = 72 minutes real-time, 3-day activity = 7.2 hours)
- **Personalized Recommendations**: Budget-aware suggestions (budget/medium/high/luxury)
- **Preference-Based Content**: Tailor experiences to user interests (food, art, nature, etc.)
- **Real-Time Journal**: Clones generate 2-3 updates daily during activity period
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
status: text (traveling, active, finished)
departure_time: timestamp
arrival_time: timestamp
activity_end_time: timestamp
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
timestamp: timestamp
created_at: timestamp
```

## Time Calculation
- **Acceleration Factor**: 10x
- **Travel Time**: User input (hours) ÷ 10 = real minutes
- **Activity Duration**: User input (days) × 24 hours ÷ 10 = real hours
- **Update Frequency**: Every 2-4 hours (accelerated) = every 12-24 minutes real-time

## AI Prompt Strategy
Clones generate vivid, specific recommendations using Claude API:
- Include real venue names, specific activities, and personal details
- Match budget level (e.g., street food for budget, Michelin stars for luxury)
- Incorporate user preferences naturally
- Add relatable moments (spilled coffee, got lost, etc.)
- Avoid generic advice—specificity creates authenticity

## Future Enhancements (Not Implemented)
- Integration with Google Places API for real venue data
- Photo generation with Stable Diffusion
- Multi-language support
- Social sharing of clone journals
- Clone personality customization
- Weather data integration
- Budget tracking and spending summaries

## Update Log

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
