'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

/* ── Floating particle (pure CSS, no canvas) ── */
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(124,91,249,0.6) 0%, transparent 70%)',
        ...style,
      }}
    />
  );
}

export default function Home() {
  const particles = [
    { width: 300, height: 300, top: '5%', left: '10%', opacity: 0.15, animation: 'float 8s ease-in-out infinite' },
    { width: 200, height: 200, top: '60%', left: '80%', opacity: 0.12, animation: 'float 10s ease-in-out infinite 2s', background: 'radial-gradient(circle, rgba(0,212,255,0.5) 0%, transparent 70%)' },
    { width: 150, height: 150, top: '30%', left: '55%', opacity: 0.1, animation: 'float 7s ease-in-out infinite 1s' },
    { width: 100, height: 100, top: '80%', left: '20%', opacity: 0.12, animation: 'float 9s ease-in-out infinite 3s', background: 'radial-gradient(circle, rgba(224,64,251,0.5) 0%, transparent 70%)' },
  ];

  const modes = [
    {
      emoji: '📖',
      title: 'Dyslexia Mode',
      description: 'Bionic reading, warm backgrounds, adjustable spacing and line height, plus word-by-word TTS.',
      features: ['Bionic Reading', 'Text-to-Speech', 'Reading Ruler', 'Word Spacing Controls'],
      gradient: 'linear-gradient(135deg, #f59e0b, #e040fb)',
      glow: 'card-glow-orange',
      border: 'rgba(245,158,11,0.25)',
      tag: '📖 For Dyslexia',
    },
    {
      emoji: '⚡',
      title: 'ADHD Mode',
      description: 'Micro-content chunks, Pomodoro timer, movement breaks, gamified rewards and focus streaks.',
      features: ['Micro-Content View', 'Focus Timer', 'Movement Breaks', 'Streak Tracking'],
      gradient: 'linear-gradient(135deg, #7c5bf9, #e040fb)',
      glow: 'card-glow-purple',
      border: 'rgba(124,91,249,0.3)',
      tag: '⚡ For ADHD',
    },
    {
      emoji: '🧠',
      title: 'Standard Mode',
      description: 'Full feature access with note-taking, AI educator chat, voice playback, and progress analytics.',
      features: ['AI Educator Chat', 'Voice Navigation', 'Progress Tracking', 'Smart Notes'],
      gradient: 'linear-gradient(135deg, #00d4ff, #7c5bf9)',
      glow: 'card-glow-cyan',
      border: 'rgba(0,212,255,0.2)',
      tag: '🧠 Standard',
    },
  ];

  const features = [
    { icon: '🧬', label: 'Smart Adaptation', desc: 'AI learns your learning style and adapts content in real-time for your brain.', color: '#7c5bf9' },
    { icon: '🔊', label: 'Word-by-Word TTS', desc: 'Each word glows as it\'s read aloud — never lose your place again.', color: '#e040fb' },
    { icon: '⚡', label: 'Gamified Learning', desc: 'Streaks, badges, movement breaks, and confetti keep motivation sky-high.', color: '#f59e0b' },
    { icon: '📊', label: 'Progress Tracking', desc: 'Rich analytics, quiz scores, and daily streaks visualise your growth.', color: '#00d4ff' },
    { icon: '✨', label: 'Transform Any Text', desc: 'Paste any dense paragraph and watch it auto-chunk into neuro-friendly lessons.', color: '#10b981' },
    { icon: '👩‍🏫', label: 'Teacher Dashboard', desc: 'Monitor engagement heatmaps and provide targeted support per student.', color: '#e040fb' },
  ];

  const stats = [
    { value: '10K+', label: 'Students Helped' },
    { value: '3', label: 'Learning Modes' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'AI Support' },
  ];

  const testimonials = [
    { name: 'Sarah M.', role: 'Student with Dyslexia', avatar: '👩‍🎓', stars: 5, quote: 'Finally a platform that works WITH my brain. The bionic reading and warm backgrounds changed everything for me.' },
    { name: 'James T.', role: 'High School Teacher', avatar: '👨‍🏫', stars: 5, quote: 'The teacher dashboard shows me exactly where each student is struggling. I can offer real support now.' },
    { name: 'Alex C.', role: 'Student with ADHD', avatar: '👨‍🎓', stars: 5, quote: "Micro-chunks + movement breaks = I actually finish lessons. I'm excited to study for the first time!" },
  ];

  return (
    <main className="min-h-screen overflow-hidden">

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative mesh-hero pt-24 pb-32 overflow-hidden">
        {/* Particles */}
        <div className="particles-bg">
          {particles.map((p, i) => (
            <Particle
              key={i}
              style={{
                width: p.width, height: p.height,
                top: p.top, left: p.left,
                opacity: p.opacity,
                animation: p.animation,
                background: (p as any).background || undefined,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 section-pill mb-8 animate-fade-in-down">
            <span>🏆</span> Built for Neurodivergent Learners
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            <span className="gradient-text">Adaptive Learning</span>
            <br />
            <span style={{ color: '#f0f0ff' }}>That Works for</span>
            <br />
            <span className="gradient-text-warm">Every Mind</span>
          </h1>

          {/* Sub */}
          <p className="text-xl md:text-2xl text-[#8888b0] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            NeuroLearn adapts educational content for dyslexia, ADHD, and every unique brain —
            with AI tutoring, gamification, and beautiful design.
          </p>

          {/* CTAs */}
          <div className="flex gap-4 justify-center flex-wrap animate-fade-in-up delay-300">
            <Link href="/onboarding" className="glow-btn text-lg">
              Start Learning Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/transform" className="glow-btn-outline text-lg">
              ✨ Try Transform
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 animate-fade-in-up delay-400">
            {stats.map((s, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <div className="stat-value">{s.value}</div>
                <div className="text-sm text-[#8888b0] font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="glow-divider" />

      {/* ════════════════ MODES ════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-pill mb-4 inline-flex">🎯 Personalised Modes</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Choose Your <span className="gradient-text">Learning Style</span>
            </h2>
            <p className="text-lg text-[#8888b0] max-w-xl mx-auto">
              Each mode adapts the entire UI, content chunking, and pacing to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modes.map((mode, idx) => (
              <div
                key={idx}
                className={`glass-card glass-card-hover ${mode.glow} p-8 flex flex-col gap-5`}
                style={{ border: `1px solid ${mode.border}` }}
              >
                {/* Top stripe */}
                <div
                  className="h-1 rounded-full -mx-8 -mt-8 mb-2"
                  style={{ background: mode.gradient }}
                />

                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: mode.gradient }}
                >
                  {mode.emoji}
                </div>

                <div>
                  <div className="text-xs font-bold text-[#8888b0] mb-2 tracking-widest uppercase">{mode.tag}</div>
                  <h3 className="text-xl font-bold mb-2 text-[#f0f0ff]">{mode.title}</h3>
                  <p className="text-[#8888b0] text-sm leading-relaxed">{mode.description}</p>
                </div>

                <ul className="space-y-2 mt-2">
                  {mode.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-[#c0c0e0]">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#00d4ff' }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/onboarding" className="mt-auto">
                  <button
                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-80"
                    style={{ background: mode.gradient, color: 'white' }}
                  >
                    Start {mode.title} →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="glow-divider" />

      {/* ════════════════ FEATURES ════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-pill mb-4 inline-flex">💡 Why NeuroLearn</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Powerful Features, <span className="gradient-text">Beautiful Design</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="glass-card glass-card-hover p-6 flex gap-4">
                <div
                  className="icon-blob flex-shrink-0"
                  style={{ background: `${f.color}22` }}
                >
                  <span>{f.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#f0f0ff] mb-1">{f.label}</h3>
                  <p className="text-sm text-[#8888b0] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="glow-divider" />

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-pill mb-4 inline-flex">💙 Real Stories</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Loved by <span className="gradient-text">Learners & Teachers</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="stars text-lg mb-3">{'★'.repeat(t.stars)}</div>
                <p className="text-[#c0c0e0] italic leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ background: 'rgba(124,91,249,0.2)', border: '1px solid rgba(124,91,249,0.3)' }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[#f0f0ff] text-sm">{t.name}</p>
                    <p className="text-xs text-[#8888b0]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="py-28 px-4 mesh-cta text-center relative overflow-hidden">
        {/* Glow orb */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-96 mx-auto opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 50%, #7c5bf9, transparent)', width: '100%' }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-6xl mb-6 animate-float">🚀</div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#f0f0ff] mb-4">
            Ready to Transform<br />
            <span className="gradient-text">Your Learning?</span>
          </h2>
          <p className="text-lg text-[#8888b0] mb-10 leading-relaxed">
            Join NeuroLearn today. Personalised. Beautiful. Designed for YOUR brain.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/onboarding" className="glow-btn text-lg animate-pulse-glow">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/learn" className="glow-btn-outline text-lg">
              📖 Preview Learn
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="py-12 px-4" style={{ background: '#050510', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)' }}
                >
                  🧠
                </div>
                <span className="gradient-text font-bold text-lg">NeuroLearn</span>
              </div>
              <p className="text-sm text-[#8888b0] leading-relaxed">
                Adaptive learning for every kind of mind. Built with 💙 for neurodivergent students.
              </p>
            </div>
            {[
              { title: 'Product', links: [{ label: 'Learn', href: '/learn' }, { label: 'Transform', href: '/transform' }, { label: 'Progress', href: '/progress' }, { label: 'AI Educator', href: '/educator' }] },
              { title: 'For Teachers', links: [{ label: 'Dashboard', href: '/teacher' }, { label: 'Analytics', href: '/dashboard' }, { label: 'Resources', href: '#' }] },
              { title: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Contact', href: '#' }] },
            ].map((col, ci) => (
              <div key={ci}>
                <p className="font-semibold text-[#f0f0ff] mb-3 text-sm">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((l, li) => (
                    <li key={li}>
                      <Link href={l.href} className="text-sm text-[#8888b0] hover:text-[#a78bfa] transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <hr className="glow-divider mb-6" />
          <p className="text-center text-xs text-[#555580]">
            © 2026 NeuroLearn. Built with ❤️ for every kind of mind.
          </p>
        </div>
      </footer>
    </main>
  );
}
