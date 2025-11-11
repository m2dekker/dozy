import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { destination, tripLength, preferences, places, scoutName } = await request.json();

    if (!destination || !tripLength) {
      return NextResponse.json(
        { error: 'Destination and trip length are required' },
        { status: 400 }
      );
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const itinerary = await generateItinerary(
      destination,
      tripLength,
      preferences,
      places,
      scoutName,
      anthropicKey
    );

    return NextResponse.json({ itinerary });

  } catch (error: any) {
    console.error('Error generating itinerary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate itinerary' },
      { status: 500 }
    );
  }
}

async function generateItinerary(
  destination: string,
  tripLength: number,
  preferences: any,
  places: any[],
  scoutName: string,
  apiKey: string
) {
  // Format preferences
  const prefList = Object.entries(preferences)
    .filter(([_, value]) => value)
    .map(([key]) => key)
    .join(', ');

  // Format places for context
  const placesContext = places && places.length > 0
    ? `Available attractions:\n${places.slice(0, 10).map((p: any) => `- ${p.name} (${p.types?.[0] || 'attraction'})`).join('\n')}`
    : 'No specific attractions provided - use your knowledge of the destination.';

  const prompt = `You are ${scoutName}, an AI travel scout who just returned from scouting ${destination} for a ${tripLength}-day trip.

User preferences: ${prefList || 'general tourism'}

${placesContext}

Create a detailed day-by-day itinerary as a JSON object with this structure:
{
  "itinerary": [
    {
      "day": 1,
      "morning": [
        {
          "time": "9:00 AM",
          "title": "Activity name",
          "location": "Specific location",
          "description": "What to do and why it's great",
          "tip": "Pro tip or warning (optional)"
        }
      ],
      "afternoon": [...],
      "evening": [...]
    }
  ],
  "summary": "A witty 2-3 sentence summary of the whole trip from the scout's perspective"
}

Requirements:
- ${tripLength} days of activities
- 2-3 activities per time period (morning/afternoon/evening)
- Mix of ${prefList || 'attractions, dining, and leisure'}
- Include specific times (e.g., "10:00 AM", "2:30 PM")
- Add practical tips (avoid crowds, best times, local customs)
- Keep descriptions concise (1-2 sentences)
- Make the summary witty and engaging
- Use actual place names from the provided list when possible

Generate the JSON now:`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 3000,
      temperature: 0.8,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parse JSON from response
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
    const jsonStr = jsonMatch[1] || content;
    const parsed = JSON.parse(jsonStr.trim());

    return {
      itinerary: parsed.itinerary,
      summary: parsed.summary
    };
  } catch (parseError) {
    console.error('Failed to parse itinerary JSON:', content);

    // Fallback itinerary
    return {
      itinerary: generateFallbackItinerary(destination, tripLength),
      summary: `Your ${tripLength}-day adventure in ${destination} is packed with amazing experiences! From local cuisine to must-see attractions, this trip has it all.`
    };
  }
}

function generateFallbackItinerary(destination: string, tripLength: number) {
  const days = [];

  for (let i = 1; i <= tripLength; i++) {
    days.push({
      day: i,
      morning: [
        {
          time: '9:00 AM',
          title: 'Breakfast at Local Café',
          location: `${destination} City Center`,
          description: 'Start your day with authentic local breakfast and coffee.',
          tip: 'Arrive early to avoid crowds'
        },
        {
          time: '10:30 AM',
          title: 'Explore Main Attraction',
          location: `${destination} Landmark`,
          description: 'Visit the most iconic spot in the city.',
          tip: 'Book tickets online to skip the queue'
        }
      ],
      afternoon: [
        {
          time: '1:00 PM',
          title: 'Lunch at Traditional Restaurant',
          location: 'Local District',
          description: 'Try the regional specialty dishes.',
        },
        {
          time: '3:00 PM',
          title: 'Cultural Experience',
          location: `${destination} Cultural Center`,
          description: 'Immerse yourself in local culture and history.',
        }
      ],
      evening: [
        {
          time: '7:00 PM',
          title: 'Sunset View',
          location: 'Scenic Viewpoint',
          description: 'Watch the sunset from the best vantage point.',
        },
        {
          time: '8:30 PM',
          title: 'Dinner & Evening',
          location: 'Entertainment District',
          description: 'Enjoy dinner and explore the nightlife.',
        }
      ]
    });
  }

  return days;
}
