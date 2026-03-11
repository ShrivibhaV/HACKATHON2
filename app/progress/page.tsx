'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProfile } from '@/lib/profile-context';
import {
  getProgress,
  getWeeklyData,
  getGrowthTimeline,
  getModeUsagePercents,
  formatMinutes,
  ProgressData,
} from '@/lib/session-tracker';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Flame, Trophy, BookOpen, TrendingUp } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 'first-steps',       name: 'First Steps',          description: 'Complete your first session',   icon: '🎯' },
  { id: 'marathon',          name: 'Marathon',              description: 'Read 5,000 words',              icon: '📚' },
  { id: 'on-fire',           name: 'On Fire',               description: 'Maintain a 7-day streak',       icon: '🔥' },
  { id: 'voice-master',      name: 'Voice Master',          description: 'Complete 10 sessions',          icon: '🎤' },
  { id: 'speedrunner',       name: 'Speedrunner',           description: 'Complete a 30-min session',     icon: '⚡' },
  { id: 'comprehension-king',name: 'Comprehension King',    description: 'Score 90%+ engagement',         icon: '👑' },
];

export default function ProgressPage() {
  const { profile } = useProfile();
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    setData(getProgress());
  }, []);

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-10 text-center max-w-md w-full animate-scale-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)' }}>
            📊
          </div>
          <h2 className="text-2xl font-bold text-[#f0f0ff] mb-3">Set Up Your Profile First</h2>
          <p className="text-[#8888b0] mb-6 leading-relaxed">
            Complete a quick onboarding to start tracking your progress.
          </p>
          <Link href="/onboarding" className="glow-btn w-full justify-center">
            Start Onboarding →
          </Link>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const weeklyData = getWeeklyData();
  const growthData = getGrowthTimeline(10);
  const modeUsage = getModeUsagePercents(data);
  const badgesUnlocked = new Set(data.badgesUnlocked);
  const isNewUser = data.sessions.length === 0;

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-pill mb-4 inline-flex">📊 Your Journey</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="gradient-text">Learning Progress</span>
          </h1>
          <p className="text-lg text-[#8888b0]">
            {isNewUser
              ? 'Your progress will appear here after your first session on the Learn page.'
              : `You've read ${data.totalWordsRead.toLocaleString()} words across ${data.sessions.length} sessions.`}
          </p>
        </div>

        {isNewUser ? (
          /* Empty state for brand-new users */
          <div className="glass-card p-12 text-center max-w-lg mx-auto mb-12">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold text-[#f0f0ff] mb-3">Start Your First Session</h2>
            <p className="text-[#8888b0] mb-6 leading-relaxed">
              Head to the Learn page and start reading. Your stats, streak, and achievements will appear here automatically.
            </p>
            <Link href="/learn" className="glow-btn justify-center">
              Go to Learn →
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Current Streak', value: `${data.streakDays} day${data.streakDays !== 1 ? 's' : ''}`, icon: Flame, color: '#f59e0b' },
                { label: 'Words Read',     value: data.totalWordsRead.toLocaleString(),                          icon: BookOpen, color: '#00d4ff' },
                { label: 'Study Time',     value: formatMinutes(data.totalMinutes),                              icon: TrendingUp, color: '#7c5bf9' },
                { label: 'Badges',         value: `${badgesUnlocked.size}/${ACHIEVEMENTS.length}`,              icon: Trophy, color: '#f59e0b' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="glass-card p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-[#8888b0] font-semibold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold text-[#f0f0ff] mt-1">{stat.value}</p>
                      </div>
                      <Icon className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: stat.color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Weekly Activity */}
              <div className="lg:col-span-2 glass-card p-6">
                <h3 className="font-bold text-[#f0f0ff] mb-4">Weekly Activity</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="day" tick={{ fill: '#8888b0', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#8888b0', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,30,0.95)', border: '1px solid rgba(124,91,249,0.3)', borderRadius: '8px' }} />
                    <Legend formatter={(v) => <span style={{ color: '#8888b0', fontSize: 12 }}>{v}</span>} />
                    <Bar dataKey="words" fill="#7c5bf9" name="Words Read" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="minutes" fill="#00d4ff" name="Minutes" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Mode Usage */}
              <div className="glass-card p-6">
                <h3 className="font-bold text-[#f0f0ff] mb-4">Mode Usage</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={modeUsage} cx="50%" cy="50%" outerRadius={75}
                      label={({ name, value }) => `${name} ${value}%`} labelLine={false} dataKey="value">
                      {modeUsage.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,30,0.95)', border: '1px solid rgba(124,91,249,0.3)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {modeUsage.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#8888b0]">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: m.fill }} />
                      {m.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cognitive Growth Timeline */}
            {growthData.length > 1 && (
              <div className="glass-card p-6 mb-8">
                <h3 className="font-bold text-[#f0f0ff] mb-1">Cognitive Growth Timeline</h3>
                <p className="text-xs text-[#8888b0] mb-4">Your engagement score improving across sessions</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="session" tick={{ fill: '#8888b0', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#8888b0', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,30,0.95)', border: '1px solid rgba(124,91,249,0.3)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="engagement" stroke="#7c5bf9" strokeWidth={2.5}
                      dot={{ fill: '#7c5bf9', r: 4 }} name="Engagement Score" activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* Achievements — always visible */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-[#f0f0ff] mb-5">Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = badgesUnlocked.has(a.id);
              return (
                <div key={a.id}
                  className="p-4 rounded-xl text-center space-y-2 transition-all duration-300"
                  style={{
                    background: unlocked ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${unlocked ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    opacity: unlocked ? 1 : 0.45,
                  }}>
                  <div className="text-4xl">{a.icon}</div>
                  <p className="font-semibold text-sm text-[#f0f0ff]">{a.name}</p>
                  <p className="text-xs text-[#8888b0]">{a.description}</p>
                  {unlocked && (
                    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                      ✓ Unlocked
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
