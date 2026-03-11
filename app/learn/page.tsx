'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/profile-context';
import { DyslexiaTools } from '@/components/learn/DyslexiaTools';
import { ADHDTools } from '@/components/learn/ADHDTools';
import { ReadingRuler } from '@/components/learn/ReadingRuler';
import { AdaptiveContentViewer } from '@/components/learn/AdaptiveContentViewer';
import { recordSession } from '@/lib/session-tracker';
import { CognitiveMonitor } from '@/lib/cognitive-monitor';
import { BookOpen, Settings, Zap, ChevronLeft, X, FileText } from 'lucide-react';

/* ─────────────────────── Topics ─────────────────────────── */
const TOPICS = {
  photosynthesis: {
    label: '🌿 Photosynthesis',
    title: 'Photosynthesis: How Plants Make Food',
    wordCount: 98,
    content: `<p><b>Photo</b>synthesis is the process by which plants convert light energy into chemical energy stored in glucose. This process occurs primarily in the leaves of plants, specifically in structures called <b>chloro</b>plasts that contain the green pigment <b>chloro</b>phyll.</p>
  
  <p>During the light-dependent reactions, chlorophyll absorbs photons from sunlight and transfers their energy to electrons. These high-energy electrons are used to generate adenosine triphosphate (ATP) and nicotinamide adenine dinucleotide phosphate (NADPH), which are energy carriers.</p>
  
  <p>Subsequently, during the light-independent reactions, also known as the Calvin cycle, these energy carriers are utilized to convert carbon dioxide into glucose through a series of enzymatic reactions.</p>
  
  <p>This process is essential for life on Earth because it converts light energy into chemical energy that plants use for growth, and it also produces the oxygen that most organisms need to breathe.</p>`,
  },
  waterCycle: {
    label: '💧 Water Cycle',
    title: 'The Water Cycle: Earth\'s Natural Recycler',
    wordCount: 112,
    content: `<p>The <b>hydro</b>logical cycle, commonly called the water cycle, describes the continuous movement of water between the Earth's surface and the atmosphere. Water undergoes phase transitions through <b>evapo</b>ration, where solar radiation causes water from oceans, lakes, and soil to transform into water vapor.</p>

  <p>This water vapor rises through the atmosphere, and as it encounters cooler air at higher altitudes, condensation occurs, forming water droplets that constitute clouds. <b>Precipi</b>tation subsequently returns this water to Earth's surface as rain, snow, or hail.</p>
  
  <p>The water that falls on land may infiltrate the soil and replenish groundwater aquifers, percolate into underground reservoirs, or run off into rivers and streams that ultimately return to the ocean, completing the cycle.</p>`,
  },
  humanBrain: {
    label: '🧠 Human Brain',
    title: 'The Human Brain: A Neuroscience Overview',
    wordCount: 105,
    content: `<p>The human brain is a complex organ comprising approximately 86 billion <b>neu</b>rons interconnected through trillions of synaptic connections. These neurons communicate through electrochemical processes, transmitting signals across synaptic gaps via <b>neuro</b>transmitters.</p>

  <p>The brain's structure can be divided into several primary regions: the <b>cerebrum</b>, which orchestrates higher cognitive functions such as reasoning and language; the <b>cerebellum</b>, which coordinates motor control and balance; and the brainstem, which regulates vital functions including breathing and heart rate.</p>
  
  <p>The cerebral cortex, the brain's outermost layer, exhibits functional specialization across distinct regions, each responsible for particular sensory, motor, or cognitive processes — making it the seat of human consciousness.</p>`,
  },
  climateChange: {
    label: '🌍 Climate Change',
    title: 'Climate Change: Causes and Consequences',
    wordCount: 108,
    content: `<p><b>Climate</b> change, characterized by long-term alterations in global temperature and precipitation patterns, is primarily attributed to anthropogenic emissions of <b>greenhouse</b> gases. The greenhouse effect occurs when atmospheric gases such as carbon dioxide, methane, and nitrous oxide absorb thermal radiation.</p>

  <p>Industrialization has substantially increased atmospheric CO₂ concentrations from approximately 280 parts per million in pre-industrial times to over 420 ppm today. This elevated concentration enhances the greenhouse effect, resulting in global mean surface temperature increases.</p>
  
  <p>The consequences of climate change encompass rising sea levels, intensification of extreme weather phenomena, ecosystem disruption, and agricultural implications that threaten global food security — making it the defining challenge of our era.</p>`,
  },
};

type TopicKey = keyof typeof TOPICS;

const MODE_CONFIG: Record<string, { label: string; emoji: string; color: string; gradient: string }> = {
  dyslexia: { label: 'Dyslexia Mode', emoji: '📖', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #e040fb)' },
  adhd:     { label: 'ADHD Mode',     emoji: '⚡', color: '#7c5bf9', gradient: 'linear-gradient(135deg, #7c5bf9, #e040fb)' },
  standard: { label: 'Standard Mode', emoji: '🧠', color: '#00d4ff', gradient: 'linear-gradient(135deg, #00d4ff, #7c5bf9)' },
};

export default function LearnPage() {
  const { profile } = useProfile();
  const router = useRouter();
  const [showTools, setShowTools] = useState(true);
  const [showRuler, setShowRuler] = useState(false);
  const [wordSpacing, setWordSpacing] = useState(0.18);
  const [lineHeight, setLineHeight] = useState(2.0);
  const [fontSize, setFontSize] = useState(16);
  const [backgroundColor, setBackgroundColor] = useState('#fffaf0');
  const [selectedTopic, setSelectedTopic] = useState<TopicKey>('photosynthesis');
  const [currentSection, setCurrentSection] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [showBreath, setShowBreath] = useState(false);
  const [rapidScrollToast, setRapidScrollToast] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const adhdToolsRef = useRef<HTMLDivElement>(null);
  const totalSections = 3;

  // COGNIX Pillar 3 — Cognitive Overload Detection
  useEffect(() => {
    if (!profile) return;
    const monitor = new CognitiveMonitor({
      idleThresholdMs: 12000,
      onIdle: () => setShowBreath(true),
      onRapidScroll: () => {
        setRapidScrollToast(true);
        setTimeout(() => setRapidScrollToast(false), 4000);
      },
    });
    monitor.start();
    return () => monitor.stop();
  }, [profile]);

  // Load saved notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('neurolearn_notes') ?? '';
    setNotes(saved);
    const bm = localStorage.getItem(`neurolearn_bookmark_${selectedTopic}`);
    setBookmarked(!!bm);
  }, [selectedTopic]);

  // Record session when the component unmounts (user leaves the page)
  useEffect(() => {
    return () => {
      if (profile) {
        const mins = Math.round((Date.now() - sessionStartTime) / 60000);
        if (mins >= 1) {
          recordSession(
            TOPICS[selectedTopic].wordCount * currentSection,
            mins,
            dominantMode,
            Math.min(100, 50 + currentSection * 15 + Math.min(mins, 20))
          );
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dominantMode: 'dyslexia' | 'adhd' | 'standard' = profile
    ? profile.weightedProfile.dyslexia > profile.weightedProfile.adhd
      ? 'dyslexia'
      : profile.weightedProfile.adhd > profile.weightedProfile.dyslexia
        ? 'adhd'
        : (profile.preferredMode as 'dyslexia' | 'adhd' | 'standard')
    : 'standard';

  const modeInfo = MODE_CONFIG[dominantMode];
  const topic = TOPICS[selectedTopic];

  // Text-to-speech
  const handleListen = useCallback(() => {
    if ('speechSynthesis' in window) {
      if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
      const plain = topic.content.replace(/<[^>]+>/g, ' ');
      const utt = new SpeechSynthesisUtterance(plain);
      utt.rate = 0.9;
      speechSynthesis.speak(utt);
    }
  }, [topic]);

  const handleBookmark = () => {
    const key = `neurolearn_bookmark_${selectedTopic}`;
    if (bookmarked) {
      localStorage.removeItem(key);
      setBookmarked(false);
    } else {
      localStorage.setItem(key, '1');
      setBookmarked(true);
    }
  };

  const saveNotes = (v: string) => {
    setNotes(v);
    localStorage.setItem('neurolearn_notes', v);
  };

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-10 text-center max-w-md w-full animate-scale-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)' }}>
            📚
          </div>
          <h2 className="text-2xl font-bold text-[#f0f0ff] mb-3">Set Up Your Profile First</h2>
          <p className="text-[#8888b0] mb-6 leading-relaxed">
            Complete a quick onboarding to get your personalised learning experience.
          </p>
          <Link href="/onboarding" className="glow-btn w-full justify-center">
            Start Onboarding →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <ReadingRuler visible={showRuler && dominantMode === 'dyslexia'} />

      {/* Breathing modal */}
      {showBreath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card p-10 text-center max-w-sm w-full relative">
            <button onClick={() => setShowBreath(false)}
              className="absolute top-4 right-4 text-[#8888b0] hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="text-6xl mb-4 animate-float">🌬️</div>
            <h3 className="text-xl font-bold text-[#f0f0ff] mb-2">Take a Breath</h3>
            <p className="text-[#8888b0] mb-6">Breathe in for 4 seconds, hold for 4, out for 4.</p>
            <div className="w-20 h-20 rounded-full mx-auto animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)' }} />
            <p className="text-sm text-[#8888b0] mt-4">Click anywhere to close when ready.</p>
          </div>
        </div>
      )}

      {/* Rapid scroll toast — COGNIX Pillar 3 */}
      {rapidScrollToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl"
          style={{ background: 'rgba(124,91,249,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <span className="text-lg">⚡</span>
          <p className="text-white text-sm font-medium">Going fast? Try <strong>Listen Aloud</strong> mode instead</p>
          <button onClick={() => { setRapidScrollToast(false); handleListen(); }}
            className="ml-2 text-xs px-2 py-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            Listen →
          </button>
        </div>
      )}

      {/* Notes panel */}
      {showNotes && (
        <div className="fixed right-0 top-16 bottom-0 w-80 z-40 flex flex-col"
          style={{ background: 'rgba(10,10,30,0.97)', borderLeft: '1px solid rgba(124,91,249,0.25)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <h3 className="font-bold text-[#f0f0ff] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#7c5bf9]" /> My Notes
            </h3>
            <button onClick={() => setShowNotes(false)} className="text-[#8888b0] hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <textarea
            className="flex-1 p-4 bg-transparent text-[#c0c0e0] resize-none text-sm leading-relaxed outline-none"
            placeholder="Jot down your thoughts, key points, questions..."
            value={notes}
            onChange={(e) => saveNotes(e.target.value)}
          />
          <div className="px-4 py-2 text-xs text-[#555580]">Auto-saved to your browser</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#8888b0] hover:text-[#a78bfa] flex items-center gap-1 text-sm transition-colors">
              <ChevronLeft className="w-4 h-4" /> Home
            </Link>
            <span className="text-[#555580]">/</span>
            <span className="text-sm text-[#f0f0ff] font-medium">Learn</span>
          </div>
          <button onClick={() => setShowTools(!showTools)}
            className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[#8888b0] hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Settings className="w-4 h-4" />
            {showTools ? 'Hide Tools' : 'Show Tools'}
          </button>
        </div>

        {/* Topic selector */}
        <div className="glass-card p-4 mb-5 flex gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#8888b0] uppercase tracking-wider self-center mr-2">Topic:</span>
          {(Object.entries(TOPICS) as [TopicKey, typeof TOPICS[TopicKey]][]).map(([key, t]) => (
            <button key={key} onClick={() => { setSelectedTopic(key); setCurrentSection(1); }}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={selectedTopic === key
                ? { background: modeInfo.gradient, color: 'white' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8888b0' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Lesson header */}
        <div className="glass-card p-6 mb-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: modeInfo.gradient }}>
                {modeInfo.emoji}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-[#f0f0ff]">{topic.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="mode-chip text-white text-xs" style={{ background: modeInfo.gradient }}>
                    {modeInfo.emoji} {modeInfo.label}
                  </span>
                  <span className="text-xs text-[#8888b0]">~{Math.ceil(topic.wordCount / 200)} min read · 🌿 Science · Beginner</span>
                </div>
              </div>
            </div>
            <BookOpen className="w-5 h-5 text-[#8888b0]" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Main content */}
          <div className="lg:col-span-3 space-y-4 animate-fade-in-up delay-100">
            <div className="glass-card p-8 min-h-96"
              style={dominantMode === 'dyslexia' ? { backgroundColor } : {}}>
              <AdaptiveContentViewer
                content={topic.content}
                mode={dominantMode}
                wordSpacing={wordSpacing}
                lineHeight={lineHeight}
                fontSize={fontSize}
                backgroundColor={backgroundColor}
              />
            </div>

            {/* Dyslexia action bar */}
            {dominantMode === 'dyslexia' && (
              <div className="flex gap-3 flex-wrap">
                {[
                  {
                    label: showRuler ? '✓ Reading Ruler' : '📏 Reading Ruler',
                    active: showRuler,
                    onClick: () => setShowRuler(!showRuler),
                  },
                  {
                    label: bookmarked ? '✓ Bookmarked' : '📑 Bookmark',
                    active: bookmarked,
                    onClick: handleBookmark,
                  },
                  {
                    label: '📝 Take Notes',
                    active: showNotes,
                    onClick: () => setShowNotes(!showNotes),
                  },
                  {
                    label: '🎤 Listen Aloud',
                    active: false,
                    onClick: handleListen,
                  },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.onClick}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={btn.active
                      ? { background: 'linear-gradient(135deg, #f59e0b, #e040fb)', color: 'white' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a0a0c0' }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            )}

            {/* ADHD action bar */}
            {dominantMode === 'adhd' && (
              <div className="flex gap-3 flex-wrap">
                {[
                  {
                    label: '⏱️ Focus Timer',
                    onClick: () => {
                      adhdToolsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      // Small pulse-highlight effect
                      adhdToolsRef.current?.animate(
                        [{ boxShadow: '0 0 0 0 rgba(124,91,249,0.6)' }, { boxShadow: '0 0 0 12px rgba(124,91,249,0)' }],
                        { duration: 800, iterations: 2 }
                      );
                    },
                  },
                  {
                    label: '📝 Take Notes',
                    onClick: () => setShowNotes(!showNotes),
                  },
                  {
                    label: `🎯 Section ${currentSection < totalSections ? currentSection + 1 : 1}`,
                    onClick: () => setCurrentSection((p) => (p < totalSections ? p + 1 : 1)),
                  },
                  {
                    label: '🌬️ Breathe',
                    onClick: () => setShowBreath(true),
                  },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.onClick}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{ background: 'rgba(124,91,249,0.1)', border: '1px solid rgba(124,91,249,0.2)', color: '#a78bfa' }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            )}

            {/* Standard action bar */}
            {dominantMode === 'standard' && (
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: '📝 Take Notes', onClick: () => setShowNotes(!showNotes) },
                  { label: '🎤 Listen Aloud', onClick: handleListen },
                  { label: '📈 View Progress', onClick: () => router.push('/progress') },
                  { label: '❓ Ask AI Educator', onClick: () => router.push('/educator'), highlight: true },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.onClick}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                    style={(btn as any).highlight
                      ? { background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a0a0c0' }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar tools */}
          {showTools && (
            <div className="lg:col-span-1 space-y-4 animate-fade-in-up delay-200">
              {dominantMode === 'dyslexia' && (
                <DyslexiaTools
                  text={topic.content.replace(/<[^>]+>/g, ' ')}
                  wordSpacing={wordSpacing}
                  lineHeight={lineHeight}
                  fontSize={fontSize}
                  backgroundColor={backgroundColor}
                  onWordSpacingChange={setWordSpacing}
                  onLineHeightChange={setLineHeight}
                  onFontSizeChange={setFontSize}
                  onBackgroundChange={setBackgroundColor}
                />
              )}

              {dominantMode === 'adhd' && (
                <div ref={adhdToolsRef}>
                  <ADHDTools
                    totalSections={totalSections}
                    currentSection={currentSection}
                    onBreakComplete={() => setShowBreath(true)}
                  />
                </div>
              )}

              {dominantMode === 'standard' && (
                <div className="glass-card p-5 space-y-3 sticky top-20">
                  <h3 className="font-bold text-[#f0f0ff]">Learning Tools</h3>
                  {[
                    { label: '📝 Take Notes', onClick: () => setShowNotes(!showNotes), highlight: false },
                    { label: '🎤 Listen Aloud', onClick: handleListen, highlight: false },
                    { label: '📈 View Progress', onClick: () => router.push('/progress'), highlight: false },
                    { label: '❓ Ask AI Educator', onClick: () => router.push('/educator'), highlight: true },
                  ].map((btn, i) => (
                    <button key={i} onClick={btn.onClick}
                      className="w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all hover:opacity-90 text-left"
                      style={btn.highlight
                        ? { background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a0a0c0' }}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
