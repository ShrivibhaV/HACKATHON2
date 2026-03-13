import { TextTransformationResult, LearningMode } from './types';
import { AgeGroup, VOCAB_MAPS, getAgeConfig } from './age-config';

// ─── HTML Helper ─────────────────────────────────────────────
// Processes text while ignoring HTML tags
function processTextNodes(html: string, processor: (text: string) => string): string {
  // Splits by HTML tags, keeping the tags in the array
  const parts = html.split(/(<[^>]+>)/g);
  return parts
    .map((part) => (part.startsWith('<') ? part : processor(part)))
    .join('');
}

// ─── Bionic Reading ──────────────────────────────────────────
export function applyBionicReading(html: string): string {
  return processTextNodes(html, (text) => {
    return text
      .split(/(\s+|[.!?,;:—–-])/)
      .map((word) => {
        if (word.match(/^\s+$/) || word.match(/^[.!?,;:—–-]$/)) return word;
        if (word.length <= 1) return word;
        const boldLength = Math.ceil(word.length * 0.4);
        return `<b>${word.substring(0, boldLength)}</b>${word.substring(boldLength)}`;
      })
      .join('');
  });
}

// ─── Syllable breaks ─────────────────────────────────────────
export function applySyllableBreaks(html: string): string {
  return processTextNodes(html, (text) => {
    return text
      .split(/\b/)
      .map((word) => {
        if (word.length < 4) return word;
        return word
          .replace(/([aeiouy]{1,2})([bcdfghjklmnpqrstvwxz]{2,})([aeiouy]{1,2})/gi, '$1-$2$3')
          .replace(/([aeiouy]{1,2})([bcdfghjklmnpqrstvwxz])([aeiouy]{1,2})/gi, '$1-$2$3');
      })
      .join('');
  });
}

// ─── Sentence splitter ───────────────────────────────────────
function splitSentences(text: string): string[] {
  // Robust sentence splitter that ignores periods inside HTML attributes (like title="e.g.")
  const sentences = text.match(/[^.!?]+[.!?]+(?=\s+[A-Z\d]|["']?\s*$|$)/g);
  return sentences?.map((s) => s.trim()) ?? [text.trim()];
}

// ─── Short Notes Generator (for ADHD "point-wise" request) ────
function generateShortNotes(text: string, ageGroup: AgeGroup): string {
  const sentences = splitSentences(text);
  const cfg = getAgeConfig(ageGroup);
  
  // Pivot to bullet points
  const importantKeywords = Array.from(SCIENCE_TERMS);
  
  // Filter for sentences that have keywords or are the first in a paragraph
  let notes = sentences.filter((s, i) => {
    const hasKeyword = importantKeywords.some(k => s.toLowerCase().includes(k.toLowerCase()));
    return i === 0 || hasKeyword || s.length < 100;
  });

  // Limit based on age
  const limit = ageGroup === 'child' ? 3 : ageGroup === 'preteen' ? 5 : 8;
  notes = notes.slice(0, limit);

  return `
    <div class="short-notes">
      <h4 class="text-sm font-bold text-[#a78bfa] mb-3">📍 Key Points (Minimized for Focus):</h4>
      <ul class="space-y-3">
        ${notes.map(note => `
          <li class="flex items-start gap-3">
            <span class="text-[#7c5bf9] mt-1.5">•</span>
            <span class="text-sm leading-relaxed">${note}</span>
          </li>
        `).join('')}
      </ul>
      <p class="text-[10px] text-[#555580] mt-4 italic">* Text reduced by ${Math.round((1 - notes.length/sentences.length) * 100)}% to help you focus.</p>
    </div>
  `;
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

// ─── Technical Terms (Only these will be search links) ───────
const TECHNICAL_TERMS = new Set([
  'photosynthesis', 'chloroplast', 'chlorophyll', 'mitochondria', 'enzyme', 
  'organism', 'cellular', 'evaporation', 'precipitation', 'neuron', 
  'electrochemical', 'anthropogenic', 'concentration', 'adenosine triphosphate', 
  'nicotinamide adenine dinucleotide phosphate', 'atp', 'nadph'
]);

export function simplifyVocabulary(
  text: string,
  ageGroup: AgeGroup = 'teen'
): { simplified: string; replacements: Array<{ original: string; replacement: string }> } {
  const cfg = getAgeConfig(ageGroup);
  const level = cfg.vocabLevel;
  const replacements: Array<{ original: string; replacement: string }> = [];

  let resultHtml = text;

  // Multi-word terms first
  const sortedTerms = Object.keys(VOCAB_MAPS).sort((a, b) => b.length - a.length);

  for (const original of sortedTerms) {
    const map = VOCAB_MAPS[original];
    if (!map) continue;
    const replacement = level === 'academic' ? null : map[level as 'very_simple' | 'simple' | 'moderate'];
    if (!replacement) continue;

    const regex = new RegExp(`\\b${original.replace(/[-()]/g, '\\$&')}\\b`, 'gi');
    
    // Process text nodes only to avoid replacing inside already created spans
    resultHtml = processTextNodes(resultHtml, (plain) => {
      // Use a new regex instance inside the callback to avoid state issues
      const localRegex = new RegExp(`\\b${original.replace(/[-()]/g, '\\$&')}\\b`, 'gi');
      
      if (localRegex.test(plain)) {
        replacements.push({ original, replacement });
        
        // Reset regex for the replace call
        localRegex.lastIndex = 0;
        
        // Only wrap in a search link if it's a technical term OR in the global science terms
        const isTechnical = TECHNICAL_TERMS.has(original.toLowerCase()) || 
                           SCIENCE_TERMS.has(original.toLowerCase());

        if (!isTechnical) {
          return plain.replace(
            localRegex,
            `<span class="simplified-word-plain" title="Original: ${original}">${replacement}</span>`
          );
        }

        return plain.replace(
          localRegex,
          `<a href="https://www.google.com/search?q=${encodeURIComponent(replacement)}" target="_blank" rel="noopener noreferrer" class="simplified-word-link"><span class="simplified-word" title="Original: ${original}">${replacement}</span></a>`
        );
      }
      return plain;
    });
  }

  return { simplified: resultHtml, replacements };
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

export function highlightKeywords(html: string): string {
  return processTextNodes(html, (text) => {
    let res = text;
    for (const term of SCIENCE_TERMS) {
      const regex = new RegExp(`\\b(${term})\\b`, 'gi');
      res = res.replace(regex, '<a href="https://www.google.com/search?q=$1" target="_blank" rel="noopener noreferrer" class="keyword-link"><mark class="keyword">$1</mark></a>');
    }
    return res;
  });
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
  
  // ADHD: handled differently down in mode-specific transformation
  const processedText = text; 
  
  const wordCount = processedText.trim().split(/\s+/).length;
  const readingTimeMinutes = estimateReadingTime(processedText, ageGroup);

  let bionicReading = '';
  let adapted = processedText;
  let chunks: string[] = [];

  // ── Step 1: Vocabulary simplification (all modes) ──
  const { simplified } = simplifyVocabulary(processedText, ageGroup);

  // ── Step 2: Mode-specific transformation ──
  if (mode === 'dyslexia') {
    // User feedback: "half bolded" (Bionic Reading) is confusing for some. 
    // We'll prioritize the increased spacing and high contrast instead.
    adapted = highlightKeywords(simplified);
    chunks = chunkByAge(processedText, ageGroup);

  } else if (mode === 'adhd') {
    // ADHD students need minimized, point-wise content
    // Step 1: Generate short notes from ORIGINAL text
    const bulletNotes = generateShortNotes(processedText, ageGroup);
    
    // Step 2: Apply vocabulary simplification and highlights to the generated HTML
    const { simplified: simplifiedAdhd } = simplifyVocabulary(bulletNotes, ageGroup);
    adapted = highlightKeywords(simplifiedAdhd);
    
    // Chunks still exist but are now the bullet points for internal tracking
    chunks = splitSentences(processedText).slice(0, 5); 

  } else if (mode === 'simplified' || mode === 'standard') {
    adapted = highlightKeywords(simplified);
    chunks = chunkByAge(processedText, ageGroup);
  }

  const keyTerms = extractKeyTerms(processedText, ageGroup);
  const actionItems = extractActionItems(processedText);
  const quiz = generateQuizQuestions(processedText);

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
