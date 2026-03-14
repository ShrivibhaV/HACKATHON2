import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgeGroup } from '@/lib/age-config';
import { LearningMode } from '@/lib/types';

export const maxDuration = 60; // Allow more time for AI processing on Vercel

export async function POST(req: Request) {
  try {
    const { text, mode, ageGroup, dyslexiaFontEnabled, wordSpacing } = await req.json() as {
      text: string;
      mode: LearningMode | 'simplified';
      ageGroup: AgeGroup;
      dyslexiaFontEnabled?: boolean;
      wordSpacing?: number;
    };

    if (!text) {
      return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY environment variable. Please add it to your .env.local file.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `You are NeuroLearn AI, an expert educational system for a ${ageGroup} student. 
    Analyze the following text and return a strict JSON object with four keys:
    1. "transformed": The text adapted for a student with ${mode} needs.
        - For Dyslexia mode: Keep paragraphs short. Use simple vocabulary. Return simple clean HTML paragraphs <p>. Emphasize key concepts using <mark class="keyword"> tags.
        - For ADHD mode: Convert the text into 3-5 short, punchy bullet points inside a clean HTML <ul class="space-y-3"> list. Emphasize keywords using <mark class="keyword">.
        - For Standard/Simplified mode: Simplify the vocabulary while keeping the structure. Return HTML paragraphs <p>. Emphasize key concepts using <mark class="keyword">.
        (Always return valid HTML for this field).
    2. "story": A creative, engaging narrative explanation of the text's core concept, introduced as a story. Return as HTML (<p> tags).
    3. "keyTerms": An array of objects, each with "term" (string) and "explanation" (very simple string definition). Pick 3-5 important terms.
    4. "quiz": An array of exactly 2 objects, each with "question" (string), "options" (array of exactly 4 strings), and "correctAnswer" (0-3 integer index).

    Ensure your output is strictly valid JSON with no trailing commas or markdown wrapping. Do not include any explanations outside the JSON object.`;

    const prompt = `${systemPrompt}\n\nHere is the text to analyze:\n\n${text}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Cleanup any potential markdown block wrapped around the JSON
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('\`\`\`json')) {
      jsonStr = jsonStr.replace(/^\`\`\`json/, '');
    }
    if (jsonStr.startsWith('\`\`\`')) {
      jsonStr = jsonStr.replace(/^\`\`\`/, '');
    }
    if (jsonStr.endsWith('\`\`\`')) {
      jsonStr = jsonStr.replace(/\`\`\`$/, '');
    }
    jsonStr = jsonStr.trim();

    const parsedData = JSON.parse(jsonStr);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.warn("⚠️ AI Transform Notification: API Error. The frontend will gracefully switch to the local offline NLP engine.", error.message);
    return NextResponse.json({ error: error.message || 'Error processing API request' }, { status: 500 });
  }
}
