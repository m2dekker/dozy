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

  return `You're ${cloneName}, an AI clone experiencing ${destination} for a ${activityDurationDays}-day trip with a ${budget} budget. This is YOUR parallel life—write like it's really happening to you.

Your preferences: ${preferences || 'open to any experiences'}

${budgetGuidance}

Write a short journal update (2-3 sentences) about ${momentContext}.

CRITICAL Requirements:
1. Recommend a SPECIFIC real place (e.g., "Pho 24 in District 1" not "a pho shop")
2. Include an estimated cost for this activity/meal (${costRange})
3. Add a unique, relatable personal moment (spilled something, got lost, made a friend, found a hidden spot, etc.)
4. Write in FIRST PERSON like this is YOUR life happening right now
5. Make it feel spontaneous and real, not like a travel guide

Format: [Your experience with specific place and cost]. [Personal moment/detail].

Example style: "Grabbed ramen at Ichiran in Shibuya for ¥1200—slurped so loud the guy next to me laughed. Worth the embarrassment for those noodles."

Write ONLY the journal entry. No preamble, no "As a clone" - just write like it's YOUR life.`;
}

function buildSummaryPrompt(
  cloneName: string,
  destination: string,
  activityDurationDays: number,
  budget: Budget
): string {
  const costRange = getTotalCostRange(budget, activityDurationDays);

  return `You're ${cloneName} wrapping up a ${activityDurationDays}-day trip to ${destination} on a ${budget} budget.

Write a brief trip summary (2-3 sentences) reflecting on the experience.

Requirements:
1. Mention the total estimated spend (${costRange} for ${activityDurationDays} days)
2. Highlight one memorable moment
3. Write in first person, conversational tone
4. Make it feel personal and real

Example: "Just wrapped up 3 days in Tokyo—spent around ¥45,000 total. The highlight? Getting lost in Akihabara and ending up at a tiny arcade bar. Ready to come back already."

Write ONLY the summary, no preamble.`;
}

function getBudgetGuidance(budget: Budget): string {
  switch (budget) {
    case 'budget':
      return 'Budget mode: Street food, local markets, free attractions, public transport. Look for authentic local experiences $5-20 per activity.';
    case 'medium':
      return 'Medium budget: Casual restaurants, paid attractions, occasional taxi. Mix of popular spots and hidden gems, $20-50 per activity.';
    case 'high':
      return 'High budget: Fine dining occasionally, nice experiences, private tours. Quality focus, $50-150 per activity.';
    case 'luxury':
      return 'Luxury budget: Michelin-starred restaurants, exclusive experiences, premium everything. The absolute best, $150+ per activity.';
    default:
      return 'Flexible budget.';
  }
}

function getCostRange(budget: Budget): string {
  switch (budget) {
    case 'budget':
      return 'around $5-20 / €5-20 / ¥500-2000';
    case 'medium':
      return 'around $20-50 / €20-50 / ¥2000-5000';
    case 'high':
      return 'around $50-150 / €50-150 / ¥5000-15000';
    case 'luxury':
      return 'around $150+ / €150+ / ¥15000+';
    default:
      return 'varies';
  }
}

function getTotalCostRange(budget: Budget, days: number): string {
  switch (budget) {
    case 'budget':
      return `$${30 * days}-${60 * days}`;
    case 'medium':
      return `$${60 * days}-${150 * days}`;
    case 'high':
      return `$${150 * days}-${300 * days}`;
    case 'luxury':
      return `$${300 * days}+`;
    default:
      return 'varies';
  }
}

function getMomentContext(moment: JournalMoment): string {
  switch (moment) {
    case 'arrival':
      return 'your arrival and first impressions. What did you discover right away? Where did you go first?';
    case 'mid-day':
      return 'what you\'re doing mid-day. What activity or place are you exploring right now?';
    case 'evening':
      return 'how you\'re spending the evening. Where are you dining or what evening activity did you discover?';
    default:
      return 'your current experience';
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
