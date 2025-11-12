import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { Budget, JournalMoment } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { cloneName, destination, travelTimeHours, activityDurationDays, preferences, budget, moment, isSummary } = await request.json();

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
      : buildPrompt(cloneName, destination, travelTimeHours, activityDurationDays, preferences, budget, moment);

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
  moment: JournalMoment
): string {
  // Budget-specific guidance
  const budgetGuidance = getBudgetGuidance(budget);
  const costRange = getCostRange(budget);

  // Moment-specific context
  const momentContext = getMomentContext(moment);

  return `You're ${cloneName} in ${destination} on a ${activityDurationDays}-day trip with a ${budget} budget. Write a brief, practical travel tip entry.

Your preferences: ${preferences || 'open to any experiences'}

${budgetGuidance}

Write a short journal update (2-3 sentences) about ${momentContext}.

CRITICAL Requirements:
1. Recommend a SPECIFIC real place with exact name and location (e.g., "Café Central, Herrengasse 14")
2. Include the cost in EUROS (€) - ${costRange}
3. Include travel time to get there (e.g., "20min by metro" or "15min walk from city center")
4. Mention current weather if relevant (e.g., "sunny 18°C" or "rainy afternoon")
5. Include public transport info if used (metro line, bus number, tram, walking route)
6. Keep it brief and practical - focus on useful information, not jokes or personal anecdotes

Format: [Place name and location]. [Cost in €, travel time, transport method]. [Weather if relevant, brief practical tip].

Example style: "Visited Schönbrunn Palace, Schönbrunner Schloßstraße 47. €18 entry, 25min on U4 metro from Karlsplatz. Sunny 16°C, arrive early to avoid crowds."

Write ONLY the journal entry. Be brief and informative.`;
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
