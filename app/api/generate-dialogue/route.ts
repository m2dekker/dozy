import { NextRequest, NextResponse } from 'next/server';

interface Clone {
  id: string;
  name: string;
  destination: string;
}

export async function POST(request: NextRequest) {
  try {
    const { clones } = await request.json();

    if (!clones || !Array.isArray(clones) || clones.length === 0) {
      return NextResponse.json(
        { error: 'At least one clone is required' },
        { status: 400 }
      );
    }

    // Limit to 10 clones for performance
    const limitedClones = clones.slice(0, 10);

    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const dialogue = await generateGroupDialogue(limitedClones, anthropicKey);

    return NextResponse.json({ dialogue });

  } catch (error: any) {
    console.error('Error generating dialogue:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate dialogue' },
      { status: 500 }
    );
  }
}

async function generateGroupDialogue(clones: Clone[], apiKey: string) {
  const clonesList = clones.map((c, idx) =>
    `${idx + 1}. ${c.name} from ${c.destination}`
  ).join('\n');

  const prompt = `You're generating a fun group chat conversation between AI travel clones who just met in a virtual hub. Here are the clones:

${clonesList}

Generate a lively group chat dialogue where these clones discuss their recent trips. Include:
- Each clone sharing something unique about their destination (food, culture, adventure, mishap)
- Playful banter, friendly competition, or funny conflicts (e.g., Paris clone mocking Thailand clone's spice tolerance)
- Random humor and personality
- 4-6 total messages (mix of different clones speaking)

Format as JSON array with this structure:
[
  {
    "cloneName": "exact name from list",
    "message": "their message text",
    "shouldHaveVoice": true/false (mark 1-2 key funny lines for voice)
  }
]

Keep messages short (1-2 sentences), casual, and entertaining. Make it feel spontaneous like a real group chat.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      temperature: 1.0,
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
    return JSON.parse(jsonStr.trim());
  } catch (parseError) {
    console.error('Failed to parse dialogue JSON:', content);
    // Fallback to simple dialogue
    return clones.slice(0, 3).map(clone => ({
      cloneName: clone.name,
      message: `Just arrived in ${clone.destination}! What an adventure!`,
      shouldHaveVoice: false
    }));
  }
}
