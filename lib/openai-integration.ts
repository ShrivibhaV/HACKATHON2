import { TextTransformationResult } from './types';
import { applyBionicReading, chunkTextForADHD } from './text-transformers';

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface APIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callOpenAI(messages: APIMessage[], temperature: number = 0.7): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.warn(
      '[v0] NEXT_PUBLIC_OPENAI_API_KEY not set. Using mock transformations.'
    );
    return 'Unable to connect to AI service. Using local processing instead.';
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[v0] OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('[v0] Failed to call OpenAI API:', error);
    throw error;
  }
}

/**
 * Simplify text vocabulary using OpenAI
 */
export async function simplifyTextWithAI(text: string, gradeLevel: string = '8th'): Promise<string> {
  const messages: APIMessage[] = [
    {
      role: 'system',
      content: `You are an expert at simplifying complex academic text for students with dyslexia and learning differences. 
      Your goal is to maintain the original meaning while using simpler vocabulary and shorter sentences.
      Always preserve factual accuracy.`,
    },
    {
      role: 'user',
      content: `Simplify this text to approximately ${gradeLevel} grade level. Keep the same meaning.
      
Original text:
${text}

Simplified text (just the text, no explanation):`,
    },
  ];

  return callOpenAI(messages);
}

/**
 * Extract key terms with explanations using OpenAI
 */
export async function extractKeyTermsWithAI(
  text: string
): Promise<Array<{ term: string; explanation: string }>> {
  const messages: APIMessage[] = [
    {
      role: 'system',
      content: `You are an expert educator. Extract key terms and concepts from academic text and provide simple, clear 1-2 sentence explanations.
      Format your response as JSON array with objects containing "term" and "explanation" fields.`,
    },
    {
      role: 'user',
      content: `Extract 5-8 key terms from this text with simple explanations:

${text}

Respond with ONLY valid JSON array, no other text.`,
    },
  ];

  try {
    const response = await callOpenAI(messages, 0.5);
    const parsed = JSON.parse(response);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('[v0] Failed to parse key terms:', error);
    return [];
  }
}

/**
 * Generate quiz questions using OpenAI
 */
export async function generateQuizWithAI(
  text: string,
  count: number = 3
): Promise<
  Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>
> {
  const messages: APIMessage[] = [
    {
      role: 'system',
      content: `You are an expert educator creating comprehension quizzes for middle school students with ADHD and dyslexia.
      Create clear, focused questions. Multiple choice with 4 options each.
      Format response as JSON array with objects containing "question", "options" (array of 4), and "correctAnswer" (index 0-3).`,
    },
    {
      role: 'user',
      content: `Create ${count} comprehension questions from this text:

${text}

Respond with ONLY valid JSON array, no other text.`,
    },
  ];

  try {
    const response = await callOpenAI(messages, 0.5);
    const parsed = JSON.parse(response);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('[v0] Failed to generate quiz:', error);
    return [];
  }
}

/**
 * Full text transformation with AI
 */
export async function transformTextWithAI(
  text: string,
  mode: 'dyslexia' | 'adhd' | 'simplified'
): Promise<TextTransformationResult> {
  try {
    let transformed = text;
    let bionicReading = '';
    let chunks: string[] = [];

    if (mode === 'dyslexia') {
      // Apply Bionic Reading for visual effect
      bionicReading = applyBionicReading(text);
      transformed = bionicReading;
    } else if (mode === 'adhd') {
      // Chunk the text
      chunks = chunkTextForADHD(text, 150);
      transformed = chunks
        .map((chunk, idx) => `<div class="chunk chunk-${idx}">${chunk}</div>`)
        .join('');
    } else if (mode === 'simplified') {
      // Simplify vocabulary
      transformed = await simplifyTextWithAI(text);
    }

    // Extract key terms and generate quiz in parallel
    const [keyTerms, quiz] = await Promise.all([
      extractKeyTermsWithAI(text),
      generateQuizWithAI(text, 3),
    ]);

    return {
      original: text,
      transformed,
      bionicReading,
      chunks,
      keyTerms,
      quiz,
    };
  } catch (error) {
    console.error('[v0] Text transformation failed:', error);
    throw error;
  }
}

/**
 * Get personalized tutor response based on student profile and content
 */
export async function getTutorResponse(
  question: string,
  contentContext: string,
  studentProfile: {
    preferredMode: 'standard' | 'dyslexia' | 'adhd';
    readingSpeed: 'slow' | 'normal' | 'fast';
    focusSpan: 'short' | 'medium' | 'long';
  }
): Promise<string> {
  const modeInstructions = {
    dyslexia: 'Use simple, clear language. Break ideas into small steps. Use examples.',
    adhd: 'Keep response SHORT and engaging. Use bullet points. Include one key takeaway.',
    standard:
      'Provide a balanced explanation. Include examples and details as appropriate.',
  };

  const messages: APIMessage[] = [
    {
      role: 'system',
      content: `You are a patient, encouraging AI tutor helping a student with ${studentProfile.preferredMode}. 
      ${modeInstructions[studentProfile.preferredMode]}
      Keep responses appropriate for middle/high school level.`,
    },
    {
      role: 'user',
      content: `Context from the lesson:
${contentContext}

Student's question:
${question}

Provide a helpful, encouraging response.`,
    },
  ];

  return callOpenAI(messages, 0.7);
}
