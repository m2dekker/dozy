# 🛫 AI Clone Traveler

Send your AI clone on adventures around the world! This Next.js app simulates travel time and generates unique, witty arrival messages using AI.

## Features

### Main App
- 🌍 Send your AI clone to any destination
- 🏷️ Name your clones and create multiple simultaneously
- ⏱️ Realistic travel time simulation based on distance
- 🤖 AI-generated arrival messages (using Claude API)
- 💾 Persistent state (survives page refresh using localStorage)
- 🌐 Bilingual support (English & Thai)
- 📱 Fully responsive mobile-friendly design
- ✨ Beautiful animations and modern UI

### CloneSync Social Hub (NEW!)
- 🎭 Virtual chatroom where arrived clones interact
- 💬 AI-generated group dialogues based on travel experiences
- 🎤 Optional voice snippets (ElevenLabs API integration)
- 🔗 Shareable invite links for friend's clones
- 🌟 Dynamic emoji avatars per destination
- 📊 Real-time clone statistics

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your API key:

**For Anthropic Claude (recommended):**
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

Get your key from: https://console.anthropic.com/

**Alternative - for xAI Grok:**
```
XAI_API_KEY=your_grok_api_key_here
```

Get your key from: https://x.ai/

**Optional - for Voice Features (Hub):**
```
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

Get your key from: https://elevenlabs.io/

**Note:** Voice features are optional. The hub will work without ElevenLabs, just without audio playback.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Test the App

1. Enter a destination (e.g., "Thailand", "Paris", "Tokyo")
2. Click "Send Clone 🚀"
3. Watch the countdown timer
4. Wait for the arrival message (travel times are shortened for demo: 1-10 minutes)

**Note:** Travel times are accelerated for testing:
- Local: ~1 minute
- Regional: ~3 minutes
- International: ~5 minutes
- Intercontinental: ~9 minutes

### 5. Try the CloneSync Hub

1. **Send multiple clones** to different destinations
2. **Wait for them to arrive** (or use test destinations for quick arrival)
3. **Click "Visit CloneSync Hub"** button on main page
4. **Generate group chat** to see your clones interact!
5. **Optional**: Click "Invite Friend" to get a shareable link
6. **Listen to voice** (if ElevenLabs is configured) for key funny lines

The hub will generate witty group conversations where clones share stories, compare experiences, and banter about their adventures!

## Deploy to Vercel

### Option 1: Deploy via CLI

```bash
npm install -g vercel
vercel
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables in Vercel dashboard:
   - Key: `ANTHROPIC_API_KEY`
   - Value: Your actual API key
   - Optional: `ELEVENLABS_API_KEY` for voice features
6. Click "Deploy"

### Option 3: Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/clone-traveler)

**Important:** After deployment, add your `ANTHROPIC_API_KEY` in the Vercel project settings under Environment Variables.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── generate-message/
│   │       └── route.ts          # API route for AI message generation
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page component
├── lib/
│   └── travel.ts                  # Travel time utilities
├── .env.local.example             # Environment variables template
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript configuration
```

## How It Works

1. **Send Clone:** User enters a destination, app calculates travel time based on rough distance estimation
2. **Travel Simulation:** Departure time and arrival time are stored in localStorage
3. **Polling:** App checks every 10 seconds if clone has arrived
4. **AI Generation:** On arrival, calls the `/api/generate-message` route which securely calls Claude/Grok API
5. **Display:** Shows a unique, witty arrival message with random elements (hunger, local activities, etc.)
6. **Persistence:** If you refresh the page, the active journey continues from where it left off

## Customization

### Adjust Travel Times

Edit `lib/travel.ts` to change travel durations. For production, increase the hours values:

```typescript
const destinationEstimates: Record<string, TravelEstimate> = {
  'thailand': { hours: 12, category: 'intercontinental' }, // Real time: 12 hours
  'paris': { hours: 2, category: 'regional' }, // Real time: 2 hours
  // ...
}
```

### Customize AI Prompt

Edit `app/api/generate-message/route.ts` to change the prompt sent to the AI:

```typescript
content: `Your custom prompt here for ${destination}...`
```

### Change Styling

Edit `app/globals.css` to customize colors, fonts, and animations.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** CSS (no dependencies)
- **AI:** Anthropic Claude API (or xAI Grok)
- **Deployment:** Vercel-ready

## Troubleshooting

**"No API key configured" error:**
- Make sure you created `.env.local` file
- Check that `ANTHROPIC_API_KEY` is set correctly
- Restart the dev server after adding env variables

**API errors:**
- Verify your API key is valid
- Check your API usage quota/billing
- Check browser console for detailed error messages

**Clone not arriving:**
- Check browser console for errors
- Make sure localStorage is enabled
- Try clearing localStorage and sending a new clone

## License

MIT

## Credits

Built with Next.js, TypeScript, and Claude AI.
