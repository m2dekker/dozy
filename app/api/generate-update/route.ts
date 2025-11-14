import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { TRAVELER_PROFILES, TravelerType } from '@/lib/types';
import { getWeather } from '@/lib/time';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      travelerType,
      destination,
      duration,
      categories,
      timeOfDay,
      dayNumber,
      isFinalSummary,
      totalSpend,
      previousLocations,
    } = body;

    if (!travelerType || !destination) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const profile = TRAVELER_PROFILES[travelerType as TravelerType];
    const weather = getWeather();

    let prompt: string;

    if (isFinalSummary) {
      // Final summary prompt
      prompt = `You are ${profile.name}, a ${profile.type} traveler who just completed a ${duration}-day trip to ${destination}. You were interested in ${categories.join(', ')}.

Write a brief final summary (3-4 sentences) of your trip including:
1. Overall experience and highlights
2. Total amount spent (around €${totalSpend})
3. Key locations you visited: ${previousLocations.join(', ')}
4. Main transportation modes you used

Write in first person as ${profile.name}, keeping your ${profile.type} traveler personality. Be warm and reflective.`;
    } else {
      // Regular update prompt
      const transportMode =
        profile.transportModes[
          Math.floor(Math.random() * profile.transportModes.length)
        ];

      prompt = `You are ${profile.name}, a ${profile.type} traveler currently on day ${dayNumber} of your ${duration}-day trip to ${destination}. You're interested in ${categories.join(', ')}.

It's ${timeOfDay} and the weather is ${weather}.

Write a short update (2-3 sentences) for this ${timeOfDay} that includes:
1. A specific activity, restaurant, or sight you're visiting/doing right now
2. Why you chose it (based on your interests and the weather)
3. A relatable human detail or feeling
4. The cost (within €${profile.costRange.min}-${profile.costRange.max} range)
5. The specific location name
6. How you're getting there (use ${transportMode} or similar ${profile.type} transport)

Format your response EXACTLY like this example:
"Just grabbed a delicious croissant at Café de Flore (€8) - the rain made me crave something cozy! Taking the metro from Notre-Dame area. This place has such a classic Parisian vibe."

Write in first person as ${profile.name}. Be specific about location names and keep your ${profile.type} budget personality. Don't use quotes around your response.`;
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the response to extract cost, location, and transport
    const parsed = parseUpdateResponse(
      responseText,
      profile,
      timeOfDay,
      isFinalSummary
    );

    return NextResponse.json({
      message: responseText,
      ...parsed,
    });
  } catch (error) {
    console.error('Error generating update:', error);
    return NextResponse.json(
      { error: 'Failed to generate update' },
      { status: 500 }
    );
  }
}

/**
 * Parse the AI response to extract structured data
 */
function parseUpdateResponse(
  text: string,
  profile: typeof TRAVELER_PROFILES[TravelerType],
  timeOfDay: string,
  isFinalSummary: boolean
) {
  // Extract cost using regex
  const costMatch = text.match(/€(\d+(?:,\d+)?)/);
  let cost = 0;

  if (costMatch) {
    cost = parseInt(costMatch[1].replace(',', ''));
  } else if (!isFinalSummary) {
    // Default to mid-range if not found
    cost = Math.floor(
      (profile.costRange.min + profile.costRange.max) / 2
    );
  }

  // Extract location (simple heuristic: look for capitalized words/phrases)
  const locationMatches = text.match(/at ([A-Z][a-zA-Z\s'-]+?)(?=\s*\(|,|\.|\s+in\s+)/g);
  const location = locationMatches
    ? locationMatches[0].replace('at ', '').trim()
    : 'exploring the area';

  // Extract transportation
  const transportPatterns = [
    'metro',
    'bus',
    'taxi',
    'walking',
    'walked',
    'walk',
    'private car',
    'Uber',
    'bike',
    'rental car',
    'limousine',
    'helicopter',
  ];
  let transportation = 'walking';

  for (const pattern of transportPatterns) {
    if (text.toLowerCase().includes(pattern)) {
      transportation = pattern.replace('walked', 'walking').replace('walk', 'walking');
      break;
    }
  }

  return {
    cost,
    location,
    transportation,
  };
}
