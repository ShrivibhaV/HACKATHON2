'use client';

import React, { useState } from 'react';
import { useProfile } from '@/lib/profile-context';
import { transformTextForLearner } from '@/lib/text-transformers';
import { SplitScreenView } from '@/components/transform/SplitScreenView';
import { FocusNudge } from '@/components/learn/FocusNudge';
import { LearningMode, TextTransformationResult } from '@/lib/types';
import { AgeGroup, getAgeConfig } from '@/lib/age-config';
import { Sparkles, Loader2, Copy, Download, ChevronDown, ChevronUp } from 'lucide-react';

/* ─── Sample texts ─────────────────────────────────────────── */
const SAMPLES = {
  photosynthesis: {
    title: '🌿 Photosynthesis',
    desc: 'Complex biochemical process',
    text: `Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. This process occurs primarily in the leaves of plants, specifically in structures called chloroplasts that contain the pigment chlorophyll. During the light-dependent reactions, chlorophyll absorbs photons from sunlight and transfers their energy to electrons. These high-energy electrons are used to generate adenosine triphosphate (ATP) and nicotinamide adenine dinucleotide phosphate (NADPH), which are energy carriers. Subsequently, during the light-independent reactions, also known as the Calvin cycle, these energy carriers are utilized to convert carbon dioxide into glucose through a series of enzymatic reactions. This process is essential for life on Earth because it converts light energy into chemical energy that plants use for growth, and it also produces the oxygen that most organisms need to breathe. When sunlight strikes a leaf, the chlorophyll molecules in the chloroplasts become excited and release electrons that enter an electron transport chain. This chain generates a proton gradient across the thylakoid membrane, which drives the synthesis of ATP through a process called photophosphorylation. The NADPH produced is also an important energy carrier used in the subsequent biochemical reactions.`,
  },
  waterCycle: {
    title: '💧 Water Cycle',
    desc: 'Earth science concept',
    text: `The hydrological cycle, commonly called the water cycle, describes the continuous movement of water between the Earth's surface and the atmosphere. Water undergoes phase transitions through evaporation, where solar radiation causes water from oceans, lakes, and soil to transform into water vapor. This water vapor rises through the atmosphere, and as it encounters cooler air at higher altitudes, condensation occurs, forming water droplets that constitute clouds. Precipitation subsequently returns this water to Earth's surface as rain, snow, or hail. The water that falls on land may infiltrate the soil and replenish groundwater aquifers, percolate into underground reservoirs, or run off into rivers and streams that ultimately return to the ocean. Transpiration from plant leaves also contributes to atmospheric moisture. The energy driving the water cycle comes primarily from solar radiation and gravity, making it a critical mechanism for distributing heat energy and freshwater around the planet. Human activities have significantly modified the water cycle through urbanization, deforestation, and climate change, which alter evaporation rates, precipitation patterns, and runoff characteristics.`,
  },
  humanBrain: {
    title: '🧠 Human Brain',
    desc: 'Neuroscience overview',
    text: `The human brain is a complex organ comprising approximately 86 billion neurons interconnected through trillions of synaptic connections. These neurons communicate through electrochemical processes, transmitting signals across synaptic gaps via neurotransmitters. The brain's structure can be delineated into several primary divisions: the cerebrum, which orchestrates higher cognitive functions such as reasoning and language; the cerebellum, which coordinates motor control and balance; and the brainstem, which regulates vital autonomous functions including respiration and cardiovascular regulation. The cerebral cortex, the brain's outermost layer, exhibits functional specialization across distinct regions termed Brodmann areas, each specializing in particular sensory, motor, or cognitive processes. Memory formation involves the hippocampus and is influenced by the amygdala, which processes emotional responses. The brain consumes approximately 20% of the body's energy despite comprising only 2% of body weight, highlighting its extraordinary metabolic demands. Neuroplasticity, the brain's ability to reorganize and form new neural connections throughout life, underlies learning, memory, and recovery from injury.`,
  },
  climate: {
    title: '🌍 Climate Change',
    desc: 'Environmental science',
    text: `Climate change, characterized by long-term alterations in global temperature and precipitation patterns, is primarily attributed to anthropogenic emissions of greenhouse gases. The greenhouse effect occurs when atmospheric gases such as carbon dioxide, methane, and nitrous oxide absorb thermal radiation reflected from Earth's surface, causing atmospheric warming. Industrialization has substantially increased atmospheric CO2 concentrations from approximately 280 parts per million in pre-industrial times to over 420 ppm today. This elevated concentration enhances the greenhouse effect, resulting in global mean surface temperature increases. The consequences of climate change encompass rising sea levels due to thermal expansion of ocean water and melting of polar ice caps, intensification of extreme weather phenomena such as hurricanes and droughts, ecosystem disruption affecting biodiversity, and agricultural implications that threaten global food security. International efforts to mitigate climate change have resulted in agreements such as the Paris Agreement, which aims to limit global temperature rise to well below 2 degrees Celsius above pre-industrial levels through nationally determined contributions to greenhouse gas emission reductions.`,
  },
};

type SampleKey = keyof typeof SAMPLES;

export default function TransformPage() {
  const { profile } = useProfile();
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<LearningMode>('dyslexia');
  const [result, setResult] = useState<TextTransformationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showActionItems, setShowActionItems] = useState(true);
  const [nudgeResetTrigger, setNudgeResetTrigger] = useState(0);

  // Auto-select mode from profile if available
  const effectiveMode: LearningMode = profile
    ? profile.weightedProfile.dyslexia > profile.weightedProfile.adhd ? 'dyslexia' : 'adhd'
    : selectedMode;

  const ageGroup: AgeGroup = profile?.ageGroup ?? 'teen';
  const cfg = getAgeConfig(ageGroup);

  const handleLoadSample = (key: SampleKey) => {
    setInputText(SAMPLES[key].text);
    setResult(null);
    setError(null);
  };

  const handleTransform = async () => {
    if (!inputText.trim()) { setError('Please enter some text to transform'); return; }
    if (inputText.trim().split(/\s+/).length < 30) {
      setError('Please enter at least 30 words for a meaningful transformation');
      return;
    }
    setLoading(true);
    setError(null);
    // Simulate brief processing delay for UX
    await new Promise((r) => setTimeout(r, 600));
    try {
      const transformed = transformTextForLearner(inputText, effectiveMode, ageGroup);
      setResult(transformed);
      setNudgeResetTrigger((t) => t + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transformation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.transformed.replace(/<[^>]+>/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const el = document.createElement('a');
    el.href = `data:text/plain;charset=utf-8,${encodeURIComponent(result.transformed.replace(/<[^>]+>/g, ''))}`;
    el.download = 'neurolearn-adapted.txt';
    el.click();
  };

  return (
    <main className="min-h-screen">
      {/* Focus nudge at 45 seconds — perfect for demo */}
      {result && (
        <FocusNudge
          intervalMinutes={0.75}
          resetTrigger={nudgeResetTrigger}
          onSimplify={() => {
            // Re-transform at a simpler age level
            const simplerAge: AgeGroup = ageGroup === 'adult' ? 'teen' : ageGroup === 'teen' ? 'preteen' : 'child';
            const simplified = transformTextForLearner(inputText, effectiveMode, simplerAge);
            setResult(simplified);
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', boxShadow: '0 0 30px rgba(124,91,249,0.4)' }}
          >
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="section-pill mb-4 inline-flex">✨ Module A — Text Transformation</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="gradient-text">Transform Any Text</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Paste dense academic text — we'll convert it into a neuro-friendly workspace in under a second.
          </p>
          {profile && (
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Profile loaded:</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(124,91,249,0.15)', color: '#a78bfa', border: '1px solid rgba(124,91,249,0.3)' }}>
                {cfg.emoji} {profile.name} · {cfg.label}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT: Input ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Mode selector (only shows if no profile) */}
            {!profile && (
              <div className="glass-card p-5 space-y-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Adaptation Mode</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['dyslexia', 'adhd', 'standard'] as const).map((mode) => {
                    const colors: Record<string, string> = { dyslexia: '#f59e0b', adhd: '#7c5bf9', standard: '#00d4ff' };
                    const labels = { dyslexia: '📖 Dyslexia', adhd: '⚡ ADHD', standard: '🧠 Standard' };
                    return (
                      <button
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className="py-2.5 px-3 rounded-xl text-sm font-semibold transition-all"
                        style={selectedMode === mode
                          ? { background: `${colors[mode]}22`, border: `1px solid ${colors[mode]}66`, color: colors[mode] }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }
                        }
                      >
                        {labels[mode]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Text input */}
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Paste Your Text</p>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {inputText.trim().split(/\s+/).filter(Boolean).length} words
                  {inputText.length > 0 && (
                    <span className={inputText.trim().split(/\s+/).length >= 500 ? ' text-[#34d399]' : ' text-[#f59e0b]'}>
                      {' '}(min 500 for full effect)
                    </span>
                  )}
                </span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => { setInputText(e.target.value); setResult(null); }}
                placeholder="Paste any dense academic paragraph here — a textbook excerpt, scientific paper, history lesson... At least 30 words for best results."
                rows={10}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all focus:ring-1"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)',
                  '--tw-placeholder-opacity': '1',
                  placeholderColor: 'var(--text-muted)',
                  fontFamily: 'Lexend, sans-serif',
                  lineHeight: 1.7,
                } as any}
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleTransform}
              disabled={loading || !inputText.trim()}
              className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Transforming...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Transform Text</>
              )}
            </button>
          </div>

          {/* ── RIGHT: Samples ── */}
          <div className="space-y-3">
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>📚 Try a Sample</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Load a 500+ word academic text to see the transformation in action.</p>
              <div className="space-y-2">
                {(Object.entries(SAMPLES) as [SampleKey, typeof SAMPLES[SampleKey]][]).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => handleLoadSample(key)}
                    className="w-full p-3 rounded-xl text-left transition-all hover:scale-[1.01]"
                    style={{
                      background: inputText === s.text ? 'rgba(124,91,249,0.12)' : 'rgba(255,255,255,0.03)',
                      border: inputText === s.text ? '1px solid rgba(124,91,249,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* What happens info card */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>⚙️ What happens?</h3>
              <ol className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                {[
                  'Text split into age-sized chunks',
                  'Complex words simplified to your level',
                  'Key scientific terms highlighted',
                  'Action items flagged (must/should/first)',
                  'Side-by-side before/after comparison',
                  'Read-aloud with word-by-word highlight',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }}
                    >{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* ── RESULTS ── */}
        {result && (
          <div className="mt-10 space-y-8 animate-fade-in-up">
            <hr className="glow-divider" />

            {/* Headline */}
            <div className="text-center">
              <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
                ✨ Your Neuro-Friendly Version
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Left: the original dense text. Right: adapted for your brain.
              </p>
            </div>

            {/* Split screen */}
            <div className="glass-card p-6">
              <SplitScreenView
                original={inputText}
                result={result}
                mode={effectiveMode}
                ageGroup={ageGroup}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={handleCopy}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>
                {copied ? '✓ Copied!' : <><Copy className="w-4 h-4" /> Copy Adapted Text</>}
              </button>
              <button onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>
                <Download className="w-4 h-4" /> Download .txt
              </button>
            </div>

            {/* Action items */}
            {result.actionItems.length > 0 && (
              <div className="glass-card p-5 space-y-3">
                <button
                  onClick={() => setShowActionItems(!showActionItems)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    📌 Action Items & Key Steps ({result.actionItems.length})
                  </span>
                  {showActionItems ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />}
                </button>
                {showActionItems && (
                  <div className="space-y-2">
                    {result.actionItems.map((item, i) => (
                      <div key={i} className={`action-item ${item.type}`}>
                        <span className="text-xs font-bold uppercase opacity-70 flex-shrink-0">
                          {item.type === 'must' ? '⚠️' : item.type === 'should' ? '💡' : item.type === 'step' ? '🔢' : '📝'}
                        </span>
                        {item.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Key terms */}
            {result.keyTerms.length > 0 && (
              <div className="glass-card p-5 space-y-4">
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>📚 Key Terms Glossary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.keyTerms.map((term, i) => (
                    <div key={i} className="p-4 rounded-xl"
                      style={{ background: 'rgba(124,91,249,0.07)', border: '1px solid rgba(124,91,249,0.15)' }}>
                      <p className="font-bold text-sm mb-1" style={{ color: '#a78bfa' }}>
                        <mark className="keyword" style={{ background: 'none', color: '#a78bfa', border: 'none', fontWeight: 700 }}>
                          {term.term}
                        </mark>
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{term.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz */}
            {result.quiz.length > 0 && <QuizSection quiz={result.quiz} />}
          </div>
        )}
      </div>
    </main>
  );
}

/* ─── Quiz sub-component ─────────────────────────────────────── */
function QuizSection({ quiz }: { quiz: TextTransformationResult['quiz'] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = quiz.filter((q, i) => answers[i] === q.correctAnswer).length;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>🎯 Quick Comprehension Check</h3>
        {submitted && (
          <span className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: score === quiz.length ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                     color: score === quiz.length ? '#34d399' : '#f59e0b',
                     border: `1px solid ${score === quiz.length ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
            {score}/{quiz.length} Correct {score === quiz.length ? '🎉' : ''}
          </span>
        )}
      </div>
      {quiz.map((q, qi) => (
        <div key={qi} className="p-4 rounded-xl space-y-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{qi + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const isSelected = answers[qi] === oi;
              const isCorrect = q.correctAnswer === oi;
              let bg = 'rgba(255,255,255,0.04)'; let bc = 'rgba(255,255,255,0.08)'; let col = '#a0a0c0';
              if (submitted) {
                if (isCorrect) { bg = 'rgba(16,185,129,0.12)'; bc = 'rgba(16,185,129,0.3)'; col = '#34d399'; }
                else if (isSelected) { bg = 'rgba(239,68,68,0.1)'; bc = 'rgba(239,68,68,0.25)'; col = '#f87171'; }
              } else if (isSelected) { bg = 'rgba(124,91,249,0.12)'; bc = 'rgba(124,91,249,0.4)'; col = '#a78bfa'; }
              return (
                <button key={oi} disabled={submitted}
                  onClick={() => !submitted && setAnswers((p) => ({ ...p, [qi]: oi }))}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all"
                  style={{ background: bg, border: `1px solid ${bc}`, color: col }}>
                  {submitted && isCorrect && '✓ '}{submitted && isSelected && !isCorrect && '✗ '}{opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted && (
        <button onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < quiz.length}
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
          style={Object.keys(answers).length >= quiz.length
            ? { background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }
            : { background: 'rgba(255,255,255,0.04)', color: '#555580', cursor: 'not-allowed' }}>
          ✓ Check My Answers
        </button>
      )}
    </div>
  );
}
