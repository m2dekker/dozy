# CloneWander

## Purpose
CloneWander lets users send AI clones (Lila, Evan, Sofia) to any destination, set trip duration, and get human-like recommendations based on interest categories, weather, and time of day. The app tracks expenses, routes, and transportation modes, with accelerated time simulation (1 simulated day = 1 hour real-time).

## Features
- **Clone Creation**: Three predefined traveler types with distinct personalities and budgets
  - Lila (Budget): Cheap eats, hostels, public transport (bus, metro)
  - Evan (Normal): Mid-range hotels, balanced activities, taxis
  - Sofia (Luxury): 5-star dining, private tours, private cars/Ubers
- **Interest Categories**: Users select from Food, History, Entertainment, Hiking, Adventure, Culture, Relaxation, Shopping, Nightlife
- **Instant Travel**: Clones arrive at destinations immediately (0 seconds for testing)
- **Accelerated Time**: 1 simulated day = 1 hour real-time (e.g., 3-day trip = 3 hours)
- **Human-Like Updates**: 2-3 updates per simulated day, varying by time of day and weather
- **Expense Tracking**: Real-time tracking of daily and total spending per traveler type
- **Route Logging**: Records locations visited and paths taken
- **Transportation Tracking**: Logs transport modes used (bus, taxi, private car, etc.)
- **Journal Feed**: Chronological feed of all clone activities and updates
- **Final Trip Summary**: Comprehensive summary at trip completion

## Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS (mobile-friendly)
- **AI**: Anthropic Claude API (claude-sonnet-4-5-20250929)
- **Database**: Supabase (with localStorage fallback)
- **Deployment**: Vercel
- **State Management**: React hooks (useState, useEffect)
- **Polling**: 5-minute intervals for real-time updates

## Data Models
### Clones Table
- ID, traveler name, destination, duration (days), categories, traveler type, status, total spend, start time

### Journals Table
- Clone ID, timestamp, message, cost, route, transportation mode, daily spend, total spend

## Update Log
- **2025-11-14**: Initial build - Created CloneWander app with traveler types, instant travel, accelerated time simulation, human-like activity updates, expense/route/transportation tracking, and journal feed system.

## Future Enhancements
- User-configurable travel time (currently instant)
- Live weather API integration (currently simulated)
- Multiple simultaneous destinations
- Historical trip analytics
- Export trip itineraries
- Social sharing features
