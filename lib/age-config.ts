// ============================================================
// age-config.ts — Age-based learning configuration
// Maps age groups to content rules used throughout the app
// ============================================================

export type AgeGroup = 'child' | 'preteen' | 'teen' | 'adult' | 'teacher';

export interface AgeConfig {
  label: string;
  emoji: string;
  ageRange: string;
  fontSize: number;           // px
  lineHeight: number;
  letterSpacing: string;
  chunkSentences: number;     // sentences per chunk
  maxSentenceWords: number;   // sentences simplified if longer
  vocabLevel: 'very_simple' | 'simple' | 'moderate' | 'academic';
  useEmojiGuides: boolean;
  useVisualAids: boolean;
  focusTimerMinutes: number;  // minutes before nudge
  breakDurationSeconds: number;
  quizDifficulty: 'easy' | 'medium' | 'hard';
  encouragementStyle: 'playful' | 'friendly' | 'neutral' | 'professional';
}

export const AGE_CONFIGS: Record<AgeGroup, AgeConfig> = {
  child: {
    label: 'Young Learner',
    emoji: '🐣',
    ageRange: '6–10 years',
    fontSize: 20,
    lineHeight: 2.0,
    letterSpacing: '0.04em',
    chunkSentences: 1,
    maxSentenceWords: 10,
    vocabLevel: 'very_simple',
    useEmojiGuides: true,
    useVisualAids: true,
    focusTimerMinutes: 2,
    breakDurationSeconds: 20,
    quizDifficulty: 'easy',
    encouragementStyle: 'playful',
  },
  preteen: {
    label: 'Middle School',
    emoji: '🧒',
    ageRange: '11–14 years',
    fontSize: 18,
    lineHeight: 1.85,
    letterSpacing: '0.02em',
    chunkSentences: 2,
    maxSentenceWords: 15,
    vocabLevel: 'simple',
    useEmojiGuides: true,
    useVisualAids: true,
    focusTimerMinutes: 3,
    breakDurationSeconds: 25,
    quizDifficulty: 'easy',
    encouragementStyle: 'friendly',
  },
  teen: {
    label: 'High School',
    emoji: '🎒',
    ageRange: '15–18 years',
    fontSize: 16,
    lineHeight: 1.7,
    letterSpacing: '0.01em',
    chunkSentences: 3,
    maxSentenceWords: 20,
    vocabLevel: 'moderate',
    useEmojiGuides: false,
    useVisualAids: false,
    focusTimerMinutes: 4,
    breakDurationSeconds: 30,
    quizDifficulty: 'medium',
    encouragementStyle: 'friendly',
  },
  adult: {
    label: 'University / Adult',
    emoji: '🎓',
    ageRange: '18+ years',
    fontSize: 15,
    lineHeight: 1.6,
    letterSpacing: '0',
    chunkSentences: 4,
    maxSentenceWords: 999,
    vocabLevel: 'academic',
    useEmojiGuides: false,
    useVisualAids: false,
    focusTimerMinutes: 5,
    breakDurationSeconds: 30,
    quizDifficulty: 'hard',
    encouragementStyle: 'neutral',
  },
  teacher: {
    label: 'Teacher / Parent',
    emoji: '👩‍🏫',
    ageRange: 'Educator',
    fontSize: 15,
    lineHeight: 1.6,
    letterSpacing: '0',
    chunkSentences: 5,
    maxSentenceWords: 999,
    vocabLevel: 'academic',
    useEmojiGuides: false,
    useVisualAids: false,
    focusTimerMinutes: 10,
    breakDurationSeconds: 30,
    quizDifficulty: 'hard',
    encouragementStyle: 'professional',
  },
};

export function getAgeConfig(ageGroup: AgeGroup): AgeConfig {
  return AGE_CONFIGS[ageGroup] ?? AGE_CONFIGS.teen;
}

// ─── Vocabulary simplification maps per level ───────────────
export const VOCAB_MAPS: Record<string, Record<'very_simple' | 'simple' | 'moderate', string>> = {
  photosynthesis:         { very_simple: 'how plants make food',    simple: 'plant food-making',    moderate: 'plant food production' },
  chloroplast:            { very_simple: 'green part of plant',     simple: 'plant cell part',       moderate: 'plant cell organelle' },
  chlorophyll:            { very_simple: 'green stuff in leaves',   simple: 'green leaf pigment',    moderate: 'light-absorbing pigment' },
  mitochondria:           { very_simple: 'power center of cell',    simple: 'cell power part',       moderate: 'cell energy organelle' },
  enzyme:                 { very_simple: 'helper tiny thing',       simple: 'protein helper',        moderate: 'biological catalyst' },
  organism:               { very_simple: 'living thing',            simple: 'living creature',       moderate: 'living organism' },
  cellular:               { very_simple: 'cell-related',            simple: 'about cells',           moderate: 'cellular' },
  subsequently:           { very_simple: 'then',                    simple: 'after that',            moderate: 'following that' },
  approximately:          { very_simple: 'about',                   simple: 'around',                moderate: 'approximately' },
  facilitate:             { very_simple: 'help',                    simple: 'help make',             moderate: 'assist in' },
  utilize:                { very_simple: 'use',                     simple: 'use',                   moderate: 'use' },
  comprise:               { very_simple: 'has',                     simple: 'is made of',            moderate: 'consists of' },
  atmospheric:            { very_simple: 'in the sky',              simple: 'in the air',            moderate: 'atmospheric' },
  evaporation:            { very_simple: 'water turning to steam',  simple: 'water turning to gas',  moderate: 'water evaporation' },
  precipitation:          { very_simple: 'rain or snow',            simple: 'rain or snow',          moderate: 'precipitation' },
  neuron:                 { very_simple: 'brain cell',              simple: 'nerve cell',            moderate: 'nerve cell' },
  electrochemical:        { very_simple: 'electrical messages',     simple: 'electrical signals',    moderate: 'electrochemical signals' },
  anthropogenic:          { very_simple: 'made by humans',          simple: 'caused by humans',      moderate: 'human-caused' },
  concentration:          { very_simple: 'amount',                  simple: 'amount',                moderate: 'concentration' },
  consequently:           { very_simple: 'so',                      simple: 'as a result',           moderate: 'consequently' },
  furthermore:            { very_simple: 'also',                    simple: 'also',                  moderate: 'furthermore' },
  nevertheless:           { very_simple: 'but',                     simple: 'however',               moderate: 'nevertheless' },
  'adenosine triphosphate': { very_simple: 'cell energy',           simple: 'energy carrier (ATP)',  moderate: 'ATP (energy carrier)' },
  'nicotinamide adenine dinucleotide phosphate': { very_simple: 'energy helper', simple: 'NADPH (energy helper)', moderate: 'NADPH' },
};

// ─── Encouragement messages per style ───────────────────────
export const ENCOURAGEMENT: Record<AgeConfig['encouragementStyle'], string[]> = {
  playful: [
    '🌟 Amazing! You read that super fast!',
    '🎉 WOW! You are doing SO great!',
    '🚀 Keep going, superstar!',
    '🦸 You are a learning hero!',
  ],
  friendly: [
    '✨ Great job! Keep it up!',
    '🎯 You\'re crushing it!',
    '💪 Nice work! Next section!',
    '🔥 You\'re on a roll!',
  ],
  neutral: [
    'Well done. Keep going.',
    'Good progress. Continue.',
    'Section complete.',
  ],
  professional: [
    'Section completed.',
    'Progress recorded.',
    'Continue when ready.',
  ],
};
