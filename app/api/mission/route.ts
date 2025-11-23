import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CloneConfig, Mission } from '@/lib/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function POST(request: NextRequest) {
  try {
    const config: CloneConfig = await request.json();

    if (!config.destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    const personalityGuide = {
      efficient: 'Optimize for time and logistics. Plan the most efficient routes, avoid tourist traps, use time-saving transportation. Focus on getting the best experience with minimal wasted time.',
      luxurious: 'Choose premium experiences only. 5-star hotels, fine dining restaurants, private tours, first-class transportation. Money is no object - prioritize comfort and exclusivity.',
      budget: 'Maximize value on a tight budget. Street food, public transport, free attractions, hostels or budget hotels. Find hidden gems that locals know about.',
      adventurous: 'Seek unique and unusual experiences. Off-the-beaten-path locations, local adventures, unconventional activities. Embrace spontaneity and discovery.',
    };

    const prompt = `You are a travel clone with a "${config.personality}" personality. Your mission is to explore ${config.destination} for ${config.duration} with a budget of $${config.budget}.

PERSONALITY GUIDE: ${personalityGuide[config.personality]}

Generate a detailed, realistic travel log using REAL-WORLD DATA including:
- Actual restaurant names and typical prices
- Real transportation options and costs
- Genuine local attractions and entrance fees
- Realistic timing for activities

Return a JSON object with this exact structure:
{
  "overview": "Brief 2-3 sentence summary of the mission",
  "timeline": [
    {
      "time": "9:00 AM",
      "activity": "Activity description",
      "location": "Specific place name",
      "cost": 15,
      "transport": "How you got there",
      "notes": "Personal observation or tip"
    }
  ],
  "costs": {
    "accommodation": 0,
    "food": 0,
    "transport": 0,
    "activities": 0,
    "misc": 0,
    "total": 0
  },
  "tips": ["3-5 practical tips based on the experience"],
  "improvements": ["2-3 things the clone would do differently next time"]
}

IMPORTANT:
- Include 5-8 activities for short trips, more for longer ones
- All costs must be realistic and add up correctly
- Stay within the $${config.budget} budget (or explain if impossible)
- Be specific with location names (real restaurants, attractions, etc.)
- Include transport between activities
- Respond with ONLY valid JSON, no additional text`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON response
    let missionData;
    try {
      // Clean response: remove markdown code blocks
      let cleanedText = responseText
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();

      // Try to find JSON object
      const startIndex = cleanedText.indexOf('{');
      const endIndex = cleanedText.lastIndexOf('}');

      if (startIndex === -1 || endIndex === -1) {
        console.error('No JSON braces found in:', cleanedText.substring(0, 200));
        throw new Error('No JSON found in response');
      }

      const jsonString = cleanedText.substring(startIndex, endIndex + 1);
      missionData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText.substring(0, 500));
      return NextResponse.json({ error: 'Failed to parse mission data. Please try again.' }, { status: 500 });
    }

    const mission: Mission = {
      id: generateId(),
      config,
      overview: missionData.overview,
      timeline: missionData.timeline,
      costs: missionData.costs,
      tips: missionData.tips,
      improvements: missionData.improvements,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(mission);
  } catch (error) {
    console.error('Mission generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate mission' },
      { status: 500 }
    );
  }
}
