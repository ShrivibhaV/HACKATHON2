import { TextTransformationResult } from './types';

/**
 * Bionic Reading: Bold the first part of each word for natural reading rhythm
 */
export function applyBionicReading(text: string): string {
  return text
    .split(/(\s+|[.!?,;:—–-])/) // Split on whitespace and punctuation
    .map((word) => {
      if (word.match(/^\s+$/) || word.match(/^[.!?,;:—–-]$/)) {
        return word; // Keep whitespace and punctuation as-is
      }
      if (word.length <= 1) return word;

      // Bold approximately first 30-40% of the word
      const boldLength = Math.ceil(word.length * 0.35);
      return (
        `<b>${word.substring(0, boldLength)}</b>${word.substring(boldLength)}`
      );
    })
    .join('');
}

/**
 * Break text into syllable-based chunks for readability
 * Uses a simpler regex-based approach for local fallback
 */
export function applySyllableBreaks(text: string): string {
  // Pattern: splits between vowels if followed by two consonants, or after a vowel-consonant-vowel
  return text
    .split(/\b/)
    .map(word => {
      if (word.length < 4) return word;
      return word
        .replace(/([aeiouy]{1,2})([bcdfghjklmnpqrstvwxz]{2,})([aeiouy]{1,2})/gi, '$1-$2$3')
        .replace(/([aeiouy]{1,2})([bcdfghjklmnpqrstvwxz])([aeiouy]{1,2})/gi, '$1-$2$3');
    })
    .join('');
}

/**
 * Split text into logical chunks for ADHD mode
 */
export function chunkTextForADHD(text: string, maxLength: number = 150): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  sentences.forEach((sentence) => {
    if ((currentChunk + sentence).length > maxLength && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  });

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Simplify vocabulary to a lower grade level
 * (In production, would call OpenAI API)
 */
export function simplifyVocabulary(text: string): {
  simplified: string;
  replacements: Array<{ original: string; replacement: string }>;
} {
  // Mock simplification - real version uses OpenAI
  const simplifications: Record<string, string> = {
    photosynthesis: 'plant food-making',
    mitochondria: 'cell power part',
    enzyme: 'protein helper',
    organism: 'living thing',
    cellular: 'cell-related',
    biochemical: 'chemical life process',
  };

  let simplified = text;
  const replacements: Array<{ original: string; replacement: string }> = [];

  Object.entries(simplifications).forEach(([original, replacement]) => {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    if (regex.test(simplified)) {
      simplified = simplified.replace(
        regex,
        `<span class="simplified" title="${original}">${replacement}</span>`
      );
      replacements.push({ original, replacement });
    }
  });

  return { simplified, replacements };
}

/**
 * Extract key terms and concepts from text
 * (In production, would call OpenAI API)
 */
export function extractKeyTerms(text: string): Array<{ term: string; explanation: string }> {
  // Mock implementation
  const mockTerms: Record<string, string> = {
    photosynthesis:
      'The process where plants convert light energy into chemical energy (glucose) stored in their cells.',
    chloroplast:
      'The part of plant cells where photosynthesis happens, containing the green pigment chlorophyll.',
    glucose: 'A simple sugar that serves as an energy source for cells.',
  };

  return Object.entries(mockTerms)
    .filter(([term]) => text.toLowerCase().includes(term.toLowerCase()))
    .map(([term, explanation]) => ({ term, explanation }));
}

/**
 * Generate comprehension quiz questions
 * (In production, would call OpenAI API)
 */
export function generateQuizQuestions(
  text: string
): Array<{
  question: string;
  options: string[];
  correctAnswer: number;
}> {
  // Mock questions
  if (text.toLowerCase().includes('photosynthesis')) {
    return [
      {
        question: 'What is the main purpose of photosynthesis?',
        options: [
          'To convert light energy into chemical energy',
          'To break down food for energy',
          'To remove oxygen from the air',
          'To warm the plant',
        ],
        correctAnswer: 0,
      },
      {
        question: 'Which part of the plant is primarily responsible for photosynthesis?',
        options: ['Roots', 'Leaves', 'Stem', 'Flowers'],
        correctAnswer: 1,
      },
    ];
  }

  return [
    {
      question: 'What was the main idea in this passage?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
    },
  ];
}

/**
 * Main transformation function that applies all adaptations
 */
export function transformTextForLearner(
  text: string,
  mode: 'standard' | 'dyslexia' | 'adhd' | 'simplified'
): TextTransformationResult {
  let bionicReading = '';
  let adapted = text;
  const chunks: string[] = [];

  // Apply mode-specific transformations
  if (mode === 'dyslexia') {
    bionicReading = applyBionicReading(text);
    adapted = bionicReading;
  } else if (mode === 'adhd') {
    chunks.push(...chunkTextForADHD(text));
    adapted = chunks
      .map((chunk, idx) => `<div class="chunk chunk-${idx}">${chunk}</div>`)
      .join('');
  } else if (mode === 'simplified') {
    const { simplified } = simplifyVocabulary(text);
    adapted = simplified;
  }

  const keyTerms = extractKeyTerms(text);
  const quiz = generateQuizQuestions(text);

  return {
    original: text,
    transformed: adapted,
    bionicReading,
    chunks,
    keyTerms,
    quiz,
  };
}
