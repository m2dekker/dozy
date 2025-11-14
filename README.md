# 🌍 CloneWander

Send AI travel clones to any destination and get real-time, human-like travel updates based on weather, time of day, and traveler preferences. Built with Next.js 14, Anthropic Claude API, and Supabase.

## ✨ Features

- **Three Traveler Types**:
  - 🎒 Lila (Budget): Cheap eats, hostels, public transport
  - 🧳 Evan (Normal): Mid-range hotels, balanced activities, taxis
  - 💎 Sofia (Luxury): 5-star dining, private tours, private cars

- **Interest Categories**: Food, History, Entertainment, Hiking, Adventure, Culture, Relaxation, Shopping, Nightlife

- **Accelerated Time**: 1 simulated day = 1 hour real-time
  - 3-day trip = 3 hours in real life
  - 2-3 updates per simulated day
  - Instant travel (0 seconds for testing)

- **Smart Updates**: AI-generated activities based on:
  - Time of day (morning, afternoon, evening)
  - Weather conditions
  - Traveler budget and personality
  - Selected interest categories

- **Comprehensive Tracking**:
  - Real-time expense tracking per traveler type
  - Route logging (locations visited)
  - Transportation mode tracking
  - Daily and total spending summaries

- **Live Journal**: Real-time feed of all clone activities with auto-refresh

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Anthropic API key ([Get one here](https://console.anthropic.com/))
- Supabase account (optional, falls back to localStorage)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:

   Create a `.env.local` file in the project root:
   ```env
   # Required: Anthropic API Key
   ANTHROPIC_API_KEY=your_anthropic_api_key_here

   # Optional: Supabase (if not provided, uses localStorage)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up Supabase (optional)**:

   If you want persistent storage across devices:

   a. Create a new project at [supabase.com](https://supabase.com)

   b. Go to SQL Editor and run the schema from `supabase-schema.sql`:
      ```sql
      -- Copy and paste the contents of supabase-schema.sql
      ```

   c. Get your project credentials:
      - Project URL: Settings → API → Project URL
      - Anon Key: Settings → API → Project API keys → anon/public

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   ```
   http://localhost:3000
   ```

## 📦 Project Structure

```
clonewander/
├── app/
│   ├── api/
│   │   └── generate-update/
│   │       └── route.ts          # Claude API integration
│   ├── journal/
│   │   └── page.tsx              # Journal feed page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page with clone management
├── components/
│   ├── ActiveClones.tsx          # Active clones display
│   ├── CloneForm.tsx             # Clone creation form
│   └── JournalFeed.tsx           # Journal entries feed
├── lib/
│   ├── supabase.ts               # Supabase client & localStorage fallback
│   ├── time.ts                   # Time utilities (1 day = 1 hour)
│   └── types.ts                  # TypeScript types
├── context.md                    # Project context and updates
├── supabase-schema.sql           # Database schema
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🎮 How to Use

1. **Create a Clone**:
   - Enter a destination (e.g., "Paris", "Tokyo")
   - Set trip duration (1-7 days)
   - Choose traveler type (Lila, Evan, or Sofia)
   - Select interest categories
   - Click "Send [Name] to [Destination]"

2. **Watch Updates**:
   - Travel is instant (clone arrives immediately)
   - Updates appear every ~20 minutes (2-3 per simulated day)
   - Each update includes activity, cost, location, and transport mode

3. **Track Progress**:
   - View active clones on home page
   - See real-time expense tracking
   - Monitor trip progress (e.g., "Day 2 of 3 • afternoon")

4. **View Journal**:
   - Click "View Full Journal" or navigate to `/journal`
   - Filter by specific clone
   - See all updates with detailed breakdowns

## ⏱️ Time System

- **Accelerated Time**: 1 simulated day = 1 hour real-time
  - 1-day trip = 1 hour
  - 3-day trip = 3 hours
  - 7-day trip = 7 hours

- **Update Schedule**: 2-3 updates per simulated day
  - Morning update: ~10 minutes into the hour
  - Afternoon update: ~30 minutes into the hour
  - Evening update: ~50 minutes into the hour

- **Polling**: App checks for new updates every 5 minutes

## 🔧 Configuration

### Traveler Types

Edit `lib/types.ts` to customize traveler profiles:

```typescript
export const TRAVELER_PROFILES = {
  budget: {
    name: 'Lila',
    costRange: { min: 5, max: 20 },
    transportModes: ['bus', 'metro', 'walking'],
    // ...
  },
  // ...
};
```

### Interest Categories

Add or remove categories in `lib/types.ts`:

```typescript
export const CATEGORIES: Category[] = [
  'Food',
  'History',
  // Add your own categories here
];
```

### Time Settings

Modify time acceleration in `lib/time.ts`:

```typescript
// Change this to adjust time scale (currently 1 hour = 1 day)
export const REAL_TIME_PER_DAY_MS = 60 * 60 * 1000;

// Change polling interval (currently 5 minutes)
export const POLL_INTERVAL_MS = 5 * 60 * 1000;
```

## 🚢 Deployment to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - CloneWander app"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

3. **Deploy to Vercel**:

   **Option A: Using Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `ANTHROPIC_API_KEY`
     - `NEXT_PUBLIC_SUPABASE_URL` (optional)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional)
   - Click "Deploy"

   **Option B: Using Vercel CLI**
   ```bash
   vercel
   # Follow the prompts
   # Add environment variables when prompted
   ```

4. **Set Environment Variables**:
   - In Vercel Dashboard → Settings → Environment Variables
   - Add all variables from `.env.local`
   - Redeploy if needed

## 🛠️ Future Enhancements

These features can be added in the future:

- **Live Weather API**: Replace simulated weather with real-time data
- **User-Configurable Travel Time**: Allow users to set custom travel durations
- **Multiple Destinations**: Send clones to different cities simultaneously
- **Trip History & Analytics**: View past trips and spending trends
- **Social Sharing**: Share trip highlights on social media
- **Custom Traveler Profiles**: Let users create their own traveler types
- **Itinerary Export**: Download trip summaries as PDF
- **Budget Alerts**: Notify when spending exceeds limits

## 📝 Development Notes

### Storage Fallback

The app automatically uses localStorage if Supabase credentials are not provided. This is perfect for:
- Local development
- Quick testing
- Single-device demos

For production or multi-device sync, use Supabase.

### AI Prompts

Claude API prompts are in `app/api/generate-update/route.ts`. Customize them to:
- Change update tone/style
- Add more context
- Include additional details
- Modify response format

### Edge Cases Handled

- Invalid destinations (empty input)
- Trip duration < 1 day
- No categories selected
- Maximum 5 active clones limit
- Network failures (retry logic recommended for production)

## 🐛 Troubleshooting

**Updates not appearing?**
- Check browser console for errors
- Verify `ANTHROPIC_API_KEY` is set correctly
- Ensure polling is working (5-minute intervals)

**Supabase connection issues?**
- Verify environment variables are correct
- Check Supabase project status
- App will fall back to localStorage automatically

**Build errors?**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+ required)
- Clear `.next` folder: `rm -rf .next && npm run dev`

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Credits

Built with:
- [Next.js 14](https://nextjs.org/)
- [Anthropic Claude API](https://www.anthropic.com/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Happy Wandering! 🌍✈️**
