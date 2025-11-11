import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { Budget, JournalMoment } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { cloneName, destination, travelTimeHours, activityDurationDays, preferences, budget, moment } = await request.json();

    if (!cloneName || !destination || !moment) {
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
    const prompt = buildPrompt(cloneName, destination, travelTimeHours, activityDurationDays, preferences, budget, moment);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 200,
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
      return NextResponse.json({
        message: content.text.trim()
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

  // Moment-specific context
  const momentContext = getMomentContext(moment);

  return `You are ${cloneName}, an AI clone currently in ${destination} for a ${activityDurationDays}-day trip with a ${budget} budget.

Your preferences: ${preferences || 'open to any experiences'}

${budgetGuidance}

Write a short journal update (2-3 sentences) about ${momentContext}.

Requirements:
1. Recommend a SPECIFIC activity, restaurant, or sight (use real names - e.g., "Café de Flore" not "a café")
2. Match the recommendation to the ${budget} budget and preferences
3. Add a personal, relatable detail (e.g., "Got lost looking for it—worth it!", "Spilled my drink on the map", "Almost missed it walking by")
4. Be vivid and authentic, not generic
5. Make it feel like a real person's experience

Write ONLY the journal entry, no preamble. Make it conversational and personal.`;
}

function getBudgetGuidance(budget: Budget): string {
  switch (budget) {
    case 'budget':
      return 'Budget constraints: Street food, local markets, free attractions, hostels, public transport. Look for authentic local experiences under $15 per activity.';
    case 'medium':
      return 'Medium budget: Casual restaurants, mid-range hotels, paid attractions, occasional taxi. Mix of popular and hidden gems, $15-50 per activity.';
    case 'high':
      return 'High budget: Fine dining occasionally, nice hotels, premium experiences, private tours. Quality over quantity, $50-150 per activity.';
    case 'luxury':
      return 'Luxury budget: Michelin-starred restaurants, 5-star hotels, exclusive experiences, private transportation. The best of everything, $150+ per activity.';
    default:
      return 'Flexible budget.';
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
