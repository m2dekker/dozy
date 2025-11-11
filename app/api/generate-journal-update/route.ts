import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { AIModel, JournalMoment, getMomentDescription } from '@/lib/journal';

export async function POST(request: NextRequest) {
  try {
    const { cloneName, destination, bio, moment, aiModel } = await request.json();

    if (!cloneName || !destination || !moment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get API keys from environment
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Build the prompt
    const userBio = bio || 'a curious traveler';
    const momentDesc = getMomentDescription(moment as JournalMoment);

    const prompt = `You're a clone of someone with this personality: "${userBio}"

You're currently in ${destination} and you're ${momentDesc}.

Write a short, vivid journal update (2-3 sentences) about this moment. Stay true to the personality described above. Add a random interesting detail about the location or your experience to make it feel authentic and varied. Write in first person.

Be conversational and natural - this is a personal journal entry, not a formal report.`;

    let message = '';
    let usedModel: AIModel = aiModel;

    // Try selected model first
    if (aiModel === 'chatgpt' && openaiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are writing personal journal entries from the perspective of an AI clone traveling the world. Be authentic, vivid, and conversational.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.9,
          max_tokens: 150
        });

        message = response.choices[0]?.message?.content || '';
      } catch (error) {
        console.error('ChatGPT API error:', error);
        // Fall back to Claude
        if (anthropicKey) {
          usedModel = 'claude';
        } else {
          throw new Error('ChatGPT failed and no Claude API key available');
        }
      }
    }

    // Use Claude if selected or as fallback
    if (!message && anthropicKey) {
      const anthropic = new Anthropic({ apiKey: anthropicKey });

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 150,
        temperature: 0.9,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        message = content.text;
      }
      usedModel = 'claude';
    }

    if (!message) {
      return NextResponse.json(
        { error: 'No API keys configured. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: message.trim(),
      usedModel
    });

  } catch (error: any) {
    console.error('Journal update generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate journal update' },
      { status: 500 }
    );
  }
}
