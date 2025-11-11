import { NextRequest, NextResponse } from 'next/server';

// This API route keeps your API key secret on the server side
export async function POST(request: NextRequest) {
  try {
    const { destination, cloneName } = await request.json();

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    // Check for Anthropic API key
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const xaiKey = process.env.XAI_API_KEY;

    if (!anthropicKey && !xaiKey) {
      return NextResponse.json(
        { error: 'No API key configured. Please set ANTHROPIC_API_KEY or XAI_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    let message = '';

    // Try Anthropic Claude API first
    if (anthropicKey) {
      message = await generateWithClaude(destination, cloneName || 'Your clone', anthropicKey);
    }
    // Fallback to xAI Grok if configured
    else if (xaiKey) {
      message = await generateWithGrok(destination, cloneName || 'Your clone', xaiKey);
    }

    return NextResponse.json({ message });

  } catch (error: any) {
    console.error('Error generating message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate arrival message' },
      { status: 500 }
    );
  }
}

// Generate message using Anthropic Claude API
async function generateWithClaude(destination: string, cloneName: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 200,
      temperature: 1.0, // High temperature for variability
      messages: [{
        role: 'user',
        content: `You are ${cloneName}, a witty AI clone who just arrived in ${destination}. Generate a short, fun arrival message (2-3 sentences max) that includes:
- Your arrival in ${destination}
- Something random/emergent like being hungry, tired, excited, or noticing local culture
- A fun, Grok-like witty tone with personality
- End with a question or invitation for adventure

Keep it casual, variable, and entertaining. Each message should feel unique and spontaneous.`
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Generate message using xAI Grok API (placeholder - adjust based on actual API)
async function generateWithGrok(destination: string, cloneName: string, apiKey: string): Promise<string> {
  // Note: This is a placeholder. xAI API details may differ.
  // Update the endpoint and format when xAI API becomes available
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'grok-1',
      messages: [{
        role: 'user',
        content: `You are ${cloneName}, a witty AI clone who just arrived in ${destination}. Generate a short, fun arrival message (2-3 sentences) that includes something random like hunger or local activities. Keep it casual and entertaining with a question at the end.`
      }],
      temperature: 1.0
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Grok API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
