import { TextTransformationResult, LearningMode } from './types';
import { AgeGroup, VOCAB_MAPS, getAgeConfig } from './age-config';

// ─── Bionic Reading ──────────────────────────────────────────
export function applyBionicReading(text: string): string {
  return text
    .split(/(\s+|[.!?,;:—–-])/)
    .map((word) => {
      if (word.match(/^\s+$/) || word.match(/^[.!?,;:—–-]$/)) return word;
      if (word.length <= 1) return word;
      const boldLength = Math.ceil(word.length * 0.4);
      return `<b>${word.substring(0, boldLength)}</b>${word.substring(boldLength)}`;
    })
    .join('');
}

// ─── Syllable breaks ─────────────────────────────────────────
export function applySyllableBreaks(text: string): string {
  return text
    .split(/\b/)
    .map((word) => {
      if (word.length < 4) return word;
      return word
        .replace(/([aeiouy]{1,2})([bcdfghjklmnpqrstvwxz]{2,})([aeiouy]{1,2})/gi, '$1-$2$3')
        .replace(/([aeiouy]{1,2})([bcdfghjklmnpqrstvwxz])([aeiouy]{1,2})/gi, '$1-$2$3');
    })
    .join('');
}

// ─── Sentence splitter ───────────────────────────────────────
function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [text.trim()];
}

// ─── Chunk by age config ─────────────────────────────────────
export function chunkByAge(text: string, ageGroup: AgeGroup): string[] {
  const cfg = getAgeConfig(ageGroup);
  const sentences = splitSentences(text);
  const chunks: string[] = [];

  for (let i = 0; i < sentences.length; i += cfg.chunkSentences) {
    const group = sentences.slice(i, i + cfg.chunkSentences).join(' ');
    chunks.push(group);
  }
  return chunks.filter(Boolean);
}

// Legacy ADHD chunk (kept for backwards compat)
export function chunkTextForADHD(text: string, maxLength = 150): string[] {
  return chunkByAge(text, 'teen');
}

// ─── Vocabulary simplification (age-aware) ───────────────────
export function simplifyVocabulary(
  text: string,
  ageGroup: AgeGroup = 'teen'
): { simplified: string; replacements: Array<{ original: string; replacement: string }> } {
  const cfg = getAgeConfig(ageGroup);
  const level = cfg.vocabLevel;
  const replacements: Array<{ original: string; replacement: string }> = [];

  let simplified = text;

  // Multi-word terms first (longest first to avoid partial matches)
  const sortedTerms = Object.keys(VOCAB_MAPS).sort((a, b) => b.length - a.length);

  for (const original of sortedTerms) {
    const map = VOCAB_MAPS[original];
    if (!map) continue;
    const replacement = level === 'academic' ? null : map[level as 'very_simple' | 'simple' | 'moderate'];
    if (!replacement) continue;

    const regex = new RegExp(`\\b${original.replace(/[-()]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(simplified)) {
      simplified = simplified.replace(
        regex,
        `<span class="simplified-word" title="Original: ${original}">${replacement}</span>`
      );
      replacements.push({ original, replacement });
    }
  }

  return { simplified, replacements };
}

// ─── Keyword highlighter ─────────────────────────────────────
const SCIENCE_TERMS = new Set([
  'photosynthesis', 'chlorophyll', 'chloroplast', 'glucose', 'ATP', 'NADPH',
  'Calvin cycle', 'mitochondria', 'enzyme', 'nucleus', 'carbon dioxide', 'oxygen',
  'neuron', 'synapse', 'neurotransmitter', 'cerebrum', 'cerebellum', 'brainstem',
  'evaporation', 'condensation', 'precipitation', 'groundwater',
  'greenhouse gas', 'carbon dioxide', 'methane', 'atmosphere',
  'DNA', 'RNA', 'protein', 'cell membrane', 'organelle',
]);

export function highlightKeywords(text: string): string {
  let result = text;
  for (const term of SCIENCE_TERMS) {
    const regex = new RegExp(`\\b(${term})\\b`, 'gi');
    result = result.replace(regex, '<mark class="keyword">$1</mark>');
  }
  return result;
}

// ─── Action item detector ────────────────────────────────────
const ACTION_PATTERNS = [
  { regex: /\b(must|need to|needs to|required to|have to)\b/gi, type: 'must' as const },
  { regex: /\b(should|ought to|is important to)\b/gi, type: 'should' as const },
  { regex: /\b(first|second|third|then|next|finally|step \d)\b/gi, type: 'step' as const },
  { regex: /\b(remember|note that|keep in mind|important:)\b/gi, type: 'remember' as const },
];

export function extractActionItems(text: string) {
  const sentences = splitSentences(text);
  const items: { text: string; type: 'must' | 'should' | 'step' | 'remember' | 'key' }[] = [];

  for (const sentence of sentences) {
    for (const { regex, type } of ACTION_PATTERNS) {
      regex.lastIndex = 0;
      if (regex.test(sentence)) {
        items.push({ text: sentence.trim(), type });
        break;
      }
    }
  }
  return items;
}

// ─── Key terms extractor ─────────────────────────────────────
const KEY_TERMS_DB: Record<string, string> = {
  photosynthesis: 'The process where plants use sunlight, water and CO₂ to make food (glucose).',
  chloroplast: 'The green organelle in plant cells where photosynthesis happens.',
  chlorophyll: 'The green pigment in chloroplasts that captures light energy.',
  glucose: 'A simple sugar — the food plants produce via photosynthesis.',
  'Calvin cycle': 'The second stage of photosynthesis where CO₂ is turned into glucose.',
  ATP: 'Adenosine triphosphate — the energy "currency" of cells.',
  'water cycle': 'The continuous movement of water through evaporation, precipitation and collection.',
  evaporation: 'Liquid water turning into water vapor due to heat.',
  condensation: 'Water vapor cooling and turning back into liquid water, forming clouds.',
  precipitation: 'Water falling from clouds as rain, snow, sleet or hail.',
  neuron: 'A nerve cell that transmits electrical signals in the brain and nervous system.',
  synapse: 'The tiny gap between two neurons where signals jump across.',
  neurotransmitter: 'Chemical messengers that carry signals across synapses.',
  cerebrum: 'The largest part of the brain, responsible for thinking, memory and movement.',
  cerebellum: 'Controls balance and coordination of body movements.',
  greenhouse: 'Gases like CO₂ that trap heat in the atmosphere, warming the planet.',
  'climate change': 'Long-term shifts in global temperatures and weather patterns, mainly caused by human activity.',
};

export function extractKeyTerms(text: string, ageGroup: AgeGroup = 'teen') {
  const lower = text.toLowerCase();
  return Object.entries(KEY_TERMS_DB)
    .filter(([term]) => lower.includes(term.toLowerCase()))
    .map(([term, explanation]) => ({ term, explanation }));
}

// ─── Quiz generator ──────────────────────────────────────────
export function generateQuizQuestions(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('photosynthesis')) {
    return [
      { question: 'What does photosynthesis produce for plants?', options: ['Glucose (sugar)', 'Protein', 'Water', 'Salt'], correctAnswer: 0 },
      { question: 'Where in plant cells does photosynthesis happen?', options: ['Nucleus', 'Mitochondria', 'Chloroplasts', 'Cell wall'], correctAnswer: 2 },
    ];
  }
  if (lower.includes('water cycle') || lower.includes('hydrological')) {
    return [
      { question: 'What causes water to evaporate from oceans?', options: ['Wind', 'Solar radiation (heat)', 'Gravity', 'Rainfall'], correctAnswer: 1 },
      { question: 'What is it called when water falls from clouds?', options: ['Evaporation', 'Condensation', 'Precipitation', 'Infiltration'], correctAnswer: 2 },
    ];
  }
  if (lower.includes('neuron') || lower.includes('brain')) {
    return [
      { question: 'What do neurons do?', options: ['Make food', 'Transmit signals', 'Store water', 'Filter blood'], correctAnswer: 1 },
      { question: 'What controls balance and coordination?', options: ['Cerebrum', 'Brainstem', 'Cerebellum', 'Synapse'], correctAnswer: 2 },
    ];
  }
  if (lower.includes('climate') || lower.includes('greenhouse')) {
    return [
      { question: 'What is the main human cause of climate change?', options: ['Deforestation', 'Greenhouse gas emissions', 'Ocean pollution', 'Farming'], correctAnswer: 1 },
      { question: 'What gas has increased most dramatically due to industry?', options: ['Oxygen', 'Methane', 'Carbon dioxide', 'Nitrogen'], correctAnswer: 2 },
    ];
  }
  return [
    { question: 'What is the main topic of this passage?', options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 0 },
  ];
}

// ─── Reading time estimate ───────────────────────────────────
function estimateReadingTime(text: string, ageGroup: AgeGroup): number {
  const wordCount = text.trim().split(/\s+/).length;
  const wpm = { child: 80, preteen: 120, teen: 160, adult: 200, teacher: 220 }[ageGroup] ?? 150;
  return Math.ceil(wordCount / wpm);
}

// ─── MAIN TRANSFORM FUNCTION (Module A) ─────────────────────
export function transformTextForLearner(
  text: string,
  mode: LearningMode | 'simplified',
  ageGroup: AgeGroup = 'teen'
): TextTransformationResult {
  const cfg = getAgeConfig(ageGroup);
  const wordCount = text.trim().split(/\s+/).length;
  const readingTimeMinutes = estimateReadingTime(text, ageGroup);

  let bionicReading = '';
  let adapted = text;
  let chunks: string[] = [];

  // ── Step 1: Vocabulary simplification (all modes) ──
  const { simplified } = simplifyVocabulary(text, ageGroup);

  // ── Step 2: Mode-specific transformation ──
  if (mode === 'dyslexia') {
    bionicReading = applyBionicReading(simplified);
    adapted = highlightKeywords(bionicReading);
    chunks = chunkByAge(text, ageGroup);

  } else if (mode === 'adhd') {
    chunks = chunkByAge(simplified, ageGroup);
    adapted = chunks
      .map((chunk, idx) => {
        const emoji = cfg.useEmojiGuides ? `<span class="chunk-num">${idx + 1}️⃣</span> ` : `<span class="chunk-num">${idx + 1}.</span> `;
        return `<div class="chunk chunk-${idx}">${emoji}${chunk}</div>`;
      })
      .join('');

  } else if (mode === 'simplified' || mode === 'standard') {
    adapted = highlightKeywords(simplified);
    chunks = chunkByAge(text, ageGroup);
  }

  const keyTerms = extractKeyTerms(text, ageGroup);
  const actionItems = extractActionItems(text);
  const quiz = generateQuizQuestions(text);

  return {
    original: text,
    transformed: adapted,
    bionicReading,
    chunks,
    keyTerms,
    actionItems,
    readingTimeMinutes,
    wordCount,
    quiz,
  };
}
