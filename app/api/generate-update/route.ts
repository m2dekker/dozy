import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { Budget, JournalMoment } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { cloneName, destination, travelTimeHours, activityDurationDays, preferences, budget, moment, isSummary, timeOfDay, weather } = await request.json();

    if (!cloneName || !destination) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    // Build context-aware prompt
    const prompt = isSummary
      ? buildSummaryPrompt(cloneName, destination, activityDurationDays, budget)
      : buildPrompt(cloneName, destination, travelTimeHours, activityDurationDays, preferences, budget, moment, timeOfDay, weather);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 250,
      temperature: 0.9, // High temperature for variety and personality
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const text = content.text.trim();

      // Extract cost from the response (look for patterns like $50, €25, ¥1000, etc.)
      const cost = extractCost(text, budget);

      return NextResponse.json({
        message: text,
        cost: cost
      });
    }

    return NextResponse.json(
      { error: 'Unexpected response format' },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate update' },
      { status: 500 }
    );
  }
}

function buildPrompt(
  cloneName: string,
  destination: string,
  travelTimeHours: number,
  activityDurationDays: number,
  preferences: string,
  budget: Budget,
  moment: JournalMoment,
  timeOfDay?: any,
  weather?: any
): string {
  // Budget-specific guidance
  const budgetGuidance = getBudgetGuidance(budget);
  const costRange = getCostRange(budget);

  // Time and weather context
  const hour = timeOfDay?.hour || 12;
  const period = timeOfDay?.period || 'afternoon';
  const weatherCondition = weather?.condition || 'clear';
  const temperature = weather?.temp || 20;
  const activityType = weather?.activityType || 'outdoor activities';

  // Build context based on time of day
  let timeContext = '';
  if (period === 'morning') {
    timeContext = `It's ${hour}:00 in the morning. Time for breakfast, museums, or cultural sites.`;
  } else if (period === 'afternoon') {
    timeContext = `It's ${hour}:00 in the afternoon. Perfect for lunch, outdoor activities, or shopping.`;
  } else if (period === 'evening') {
    timeContext = `It's ${hour}:00 in the evening. Time for dinner, nightlife, or entertainment.`;
  } else {
    timeContext = `It's ${hour}:00 late at night. Night markets, bars, or clubs might be open.`;
  }

  return `You're ${cloneName} in ${destination} on day ${activityDurationDays} of your trip with a ${budget} budget.

Current situation:
- Time: ${timeContext}
- Weather: ${weatherCondition}, ${temperature}°C
- Best for: ${activityType}
- Your preferences: ${preferences || 'open to any experiences'}
- ${budgetGuidance}

Write a brief journal update (2-3 sentences) like a human would spend their day.

CRITICAL Requirements:
1. Choose an activity appropriate for the TIME OF DAY (${period}) and WEATHER (${weatherCondition})
   - Morning (6am-12pm): breakfast spots, museums, cultural sites
   - Afternoon (12pm-5pm): lunch, parks, shopping, outdoor sights
   - Evening (5pm-10pm): dinner restaurants, bars, evening entertainment
   - Night (10pm-6am): nightlife, late-night eateries, clubs
2. Weather considerations:
   - Sunny/clear: outdoor activities, parks, terraces
   - Rainy/overcast: museums, cafes, indoor venues, covered markets
   - Warm: air-conditioned spaces, shaded areas
3. Include SPECIFIC real place with exact address (e.g., "La Boqueria Market, La Rambla 91")
4. Include cost in EUROS (€) - ${costRange}
5. Include travel time and transport (e.g., "15min on L3 metro" or "10min walk")
6. Keep it brief and practical - NO jokes, just useful travel info

Format: [Place name and address]. [Cost €, travel time, transport]. [Weather note, practical tip].

Example: "Had breakfast at Café de Flore, 172 Boulevard Saint-Germain. €12, 20min on metro line 4 from hotel. Sunny 18°C, outdoor seating available."

Write ONLY the journal entry matching the current time (${hour}:00, ${period}) and weather (${weatherCondition}).`;
}

function buildSummaryPrompt(
  cloneName: string,
  destination: string,
  activityDurationDays: number,
  budget: Budget
): string {
  const costRange = getTotalCostRange(budget, activityDurationDays);

  return `You're ${cloneName} wrapping up a ${activityDurationDays}-day trip to ${destination} on a ${budget} budget.

Write a brief trip summary (2-3 sentences) with practical overview.

Requirements:
1. Mention the total estimated spend in euros (${costRange} for ${activityDurationDays} days)
2. Highlight the most useful tip or discovery
3. Keep it brief and practical
4. Include overall transport or weather notes if relevant

Example: "Completed 3 days in Vienna—spent around €180 total. Best discovery: 24-hour metro pass (€8) saved a lot vs single tickets. Weather was mild 15-18°C, perfect for walking."

Write ONLY the summary, no preamble.`;
}

function getBudgetGuidance(budget: Budget): string {
  switch (budget) {
    case 'budget':
      return 'Budget mode: Street food, local markets, free attractions, public transport. €5-20 per activity.';
    case 'medium':
      return 'Medium budget: Casual restaurants, paid attractions, occasional taxi. €20-50 per activity.';
    case 'high':
      return 'High budget: Fine dining occasionally, nice experiences, private tours. €50-150 per activity.';
    case 'luxury':
      return 'Luxury budget: Michelin-starred restaurants, exclusive experiences, premium everything. €150+ per activity.';
    default:
      return 'Flexible budget.';
  }
}

function getCostRange(budget: Budget): string {
  switch (budget) {
    case 'budget':
      return '€5-20';
    case 'medium':
      return '€20-50';
    case 'high':
      return '€50-150';
    case 'luxury':
      return '€150+';
    default:
      return 'varies';
  }
}

function getTotalCostRange(budget: Budget, days: number): string {
  switch (budget) {
    case 'budget':
      return `€${30 * days}-${60 * days}`;
    case 'medium':
      return `€${60 * days}-${150 * days}`;
    case 'high':
      return `€${150 * days}-${300 * days}`;
    case 'luxury':
      return `€${300 * days}+`;
    default:
      return 'varies';
  }
}

function getMomentContext(moment: JournalMoment): string {
  switch (moment) {
    case 'arrival':
      return 'a place or activity immediately after arrival. Include transport from airport/station to this location.';
    case 'mid-day':
      return 'a mid-day activity or location. Include how to get there and current conditions.';
    case 'evening':
      return 'an evening activity, restaurant, or location. Include transport info and timing.';
    default:
      return 'your current activity';
  }
}

function extractCost(text: string, budget: Budget): number {
  // Look for currency patterns: $50, €25, ¥1000, £30, etc.
  const patterns = [
    /[$€£¥]\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*[$€£¥]/,
    /(\d+)\s*(?:dollars?|euros?|pounds?|yen)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numStr = match[1].replace(/,/g, '');
      return parseFloat(numStr);
    }
  }

  // Fallback: Use budget range midpoint
  return getFallbackCost(budget);
}

function getFallbackCost(budget: Budget): number {
  switch (budget) {
    case 'budget':
      return 12;
    case 'medium':
      return 35;
    case 'high':
      return 100;
    case 'luxury':
      return 250;
    default:
      return 30;
  }
}
