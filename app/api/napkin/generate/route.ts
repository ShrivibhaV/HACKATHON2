import { NextResponse } from 'next/server';

/**
 * Visual Map Generation Route
 * Uses Claude API to generate Mermaid mindmap diagrams
 * Drop-in replacement for the Napkin AI integration
 */

export async function POST(req: Request) {
  try {
    const { text: textContent } = await req.json();

    if (!textContent?.trim()) {
      return NextResponse.json({ error: 'No text provided.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured.' }, { status: 500 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `You are a visual learning expert for neurodivergent students (dyslexia, ADHD).

Analyse the text below and generate a Mermaid MINDMAP diagram that captures the key concepts and their relationships in a clear, hierarchical way.

STRICT RULES:
- Output ONLY valid Mermaid mindmap syntax — no explanation, no markdown fences, no extra text
- Start with: mindmap
- Use exactly 2 spaces for indentation per level
- Root node: the main topic in double quotes e.g. root(("Photosynthesis"))
- Max 3 levels deep
- Max 6 branches from root
- Max 3 sub-items per branch
- Keep labels SHORT (2-5 words max)
- Use plain text only — no special characters, no emoji, no parentheses inside labels except for root
- Every node must be on its own line

Example format:
mindmap
  root(("Water Cycle"))
    Evaporation
      Solar energy
      Ocean surface
    Condensation
      Cloud formation
      Temperature drop
    Precipitation
      Rain
      Snow

Now generate a mindmap for this text:
${textContent.substring(0, 3000)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[Claude API] Error:', response.status, err);
      return NextResponse.json(
        { error: `Claude API error (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const mermaidCode = data.content
      ?.filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('')
      .trim();

    if (!mermaidCode) {
      return NextResponse.json({ error: 'No diagram generated.' }, { status: 500 });
    }

    return NextResponse.json({ mermaidCode, status: 'completed' });
  } catch (error) {
    console.error('Visual Map Generation Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}