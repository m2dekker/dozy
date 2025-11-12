# CloneWander - Context & Documentation

## App Purpose
CloneWander lets users send AI clones to destinations worldwide, set travel and activity times (accelerated 1600x for ultra-fast testing - complete journey in ~1 minute), and receive personalized activity recommendations with expense tracking. Clones behave like real travelers with time-appropriate activities (morning breakfast, afternoon sightseeing, evening dining) that adapt to weather conditions. Users can dismiss clones to stop updates and view deduplicated journals simulating a realistic parallel life experience.

## Features
- **Clone Creation**: Create up to 5 AI clones (all named "Dart") with custom destinations
- **Ultra-Fast Testing**: 1600x acceleration (2-hour travel = ~4.5s, 1-day trip = ~54s real-time)
- **Human-Like Daily Routines**: Clones behave like real travelers with time-appropriate activities
- **Weather-Based Activities**: Activities adapt to current weather conditions (sunny = outdoor, rainy = museums)
- **Time-of-Day Activities**: Morning breakfast/museums, afternoon lunch/parks, evening dinner/nightlife
- **Adventure Packs**: 7 themed recommendation packs (1 free, 6 premium)
  - Standard Explorer (free): Balanced mix for all travelers
  - Foodie Explorer (premium): Culinary adventures, local markets, cooking experiences
  - Art & Culture (premium): Museums, galleries, historical sites, cultural events
  - Night Owl (premium): Nightlife, bars, clubs, evening entertainment
  - Budget Backpacker (premium): Free attractions, street food, hostel culture
  - Luxury Escape (premium): Michelin dining, 5-star experiences, exclusive venues
  - Nature Seeker (premium): Parks, gardens, hiking, outdoor adventures
- **Premium Mode**: Unlock all Adventure Packs and unlimited email journals
- **Email Journal Entries**: Send journal entries to email (free: 1 entry, premium: unlimited)
- **Personalized Recommendations**: Budget-aware suggestions (budget/medium/high/luxury)
- **Preference-Based Content**: Tailor experiences to user interests (food, art, nature, etc.)
- **Real-Time Journal**: Clones generate updates every 3-5 simulated hours with deduplication
- **Expense Tracking**: Each journal update includes estimated costs in euros (€), with running totals
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
name: text (always 'Dart')
destination: text
travel_time_hours: numeric
activity_duration_days: integer
preferences: text
budget: text (budget, medium, high, luxury)
pack: text (standard, foodie-explorer, art-culture, night-owl, budget-backpacker, luxury-escape, nature-seeker)
is_premium: boolean (default false)
status: text (traveling, active, finished, dismissed)
departure_time: bigint
arrival_time: bigint
activity_end_time: bigint
last_journal_update: bigint
total_spend: numeric (default 0)
created_at: bigint
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
- **Acceleration Factor**: 1600x (for rapid testing - complete journey in ~1 minute)
- **Travel Time**: User input (hours) ÷ 1600 = real seconds (2 hours = ~4.5s)
- **Activity Duration**: User input (days) × 24 hours ÷ 1600 = real seconds (1 day = ~54s)
- **Update Frequency**: Every 3-5 simulated hours = every few seconds real-time
- **Total Journey**: Default 2h travel + 1 day activity = ~59 seconds real-time

## AI Prompt Strategy
Clones generate practical, human-like travel journal entries using Claude API:
- **Time-Appropriate Activities**: Morning (breakfast, museums), afternoon (lunch, parks), evening (dinner, nightlife)
- **Weather-Adaptive**: Sunny = outdoor activities, rainy = museums/cafes, warm = air-conditioned venues
- **Realistic Daily Flow**: Activities match what humans actually do at specific times
- **Specific Details**: Real venue names with exact addresses (e.g., "Café Central, Herrengasse 14")
- **Practical Information**: Cost in euros (€), travel time, transport method (metro lines, walking)
- **Budget Matching**: Street food for budget, Michelin stars for luxury
- **Brief & Informative**: No jokes, just useful travel tips (2-3 sentences)
- **Weather Reporting**: Current conditions and temperature included
- **Trip Summaries**: Auto-generated at activity end with total expenses and best tips

## Future Enhancements (Not Implemented)
- Integration with Google Places API for real venue data
- Photo generation with Stable Diffusion
- Multi-language support
- Social sharing of clone journals
- Clone personality customization
- Weather data integration

## Update Log

### 2025-11-12: Adventure Packs & Email Journal Features
- **Adventure Packs System**: Added 7 themed recommendation packs for personalized experiences
  - Standard Explorer (free): Balanced mix suitable for all travelers
  - Foodie Explorer (premium): Culinary adventures, local markets, cooking classes, specialty restaurants
  - Art & Culture (premium): Museums, galleries, historical sites, theaters, cultural performances
  - Night Owl (premium): Nightlife, bars, clubs, live music venues, late-night eateries
  - Budget Backpacker (premium): Free attractions, street food, public parks, hostel culture
  - Luxury Escape (premium): Michelin dining, 5-star hotels, private tours, exclusive experiences
  - Nature Seeker (premium): Parks, gardens, hiking trails, outdoor activities, scenic viewpoints
- **Premium Mode Toggle**: Enable premium to unlock all Adventure Packs and unlimited email journals
- **Email Journal Entries**: SendGrid integration to email selected journal entries
  - Free tier: Limited to 1 journal entry per email
  - Premium tier: Unlimited entries per email
  - Custom HTML email template with gradient design, trip summary, costs, and branding
  - Entry selection UI with checkboxes and "Select All" functionality
  - Email modal with address input and tier information
- **Pack-Themed AI Prompts**: AI generates activities matching selected Adventure Pack theme
  - Pack guidance layers on top of time-of-day, weather, and budget considerations
  - Example: Foodie Explorer + rainy evening = indoor cooking class or cozy restaurant
- **Clone Naming Convention**: All clones now named "Dart" by default
- **Database Schema Updates**: Added `pack` and `is_premium` fields to clones table
- **UI Enhancements**: Pack dropdown with premium lock, premium modal, email controls on journal page

### 2025-11-12: Human-Like Daily Routines & Ultra-Fast Testing
- **1600x Acceleration**: Complete journey now takes ~1 minute (2h travel + 1 day = 59s)
- **Time-of-Day Activities**: Clones follow realistic daily schedules
  - Morning (6am-12pm): Breakfast spots, museums, cultural sites
  - Afternoon (12pm-5pm): Lunch, outdoor activities, shopping
  - Evening (5pm-10pm): Dinner, nightlife, entertainment
  - Night (10pm-6am): Bars, clubs, late-night eateries
- **Weather-Based Behavior**: Activities adapt to weather conditions
  - Sunny/clear: Outdoor activities, parks, walking tours
  - Rainy/overcast: Museums, cafes, indoor attractions
  - Warm: Air-conditioned venues, shaded areas
- **Enhanced Prompts**: AI generates time and weather-appropriate activities
- **New Time Functions**: `getTimeOfDay()` and `getWeatherCondition()` for realistic simulation
- **Updated Defaults**: 2 hours travel, 1 day activity, clone name "Dart"
- **Faster Updates**: Journal entries every 3-5 simulated hours
- **Improved UX**: Time remaining displayed in seconds for fast testing

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
