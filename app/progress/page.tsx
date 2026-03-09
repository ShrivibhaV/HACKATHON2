'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/lib/profile-context';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Flame, Trophy, BookOpen, TrendingUp } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', words: 1200, minutes: 35 },
  { day: 'Tue', words: 1800, minutes: 45 },
  { day: 'Wed', words: 1500, minutes: 40 },
  { day: 'Thu', words: 2100, minutes: 55 },
  { day: 'Fri', words: 1900, minutes: 50 },
  { day: 'Sat', words: 800, minutes: 25 },
  { day: 'Sun', words: 1300, minutes: 35 },
];

const modeUsage = [
  { name: 'Dyslexia', value: 45, fill: '#f97316' },
  { name: 'ADHD', value: 35, fill: '#a855f7' },
  { name: 'Standard', value: 20, fill: '#3b82f6' },
];

const achievements = [
  { id: 1, name: 'First Steps', description: 'Complete first reading', icon: '🎯', unlocked: true },
  { id: 2, name: 'Marathon', description: 'Read 5,000 words', icon: '📚', unlocked: true },
  { id: 3, name: 'On Fire', description: '7-day streak', icon: '🔥', unlocked: false },
  { id: 4, name: 'Voice Master', description: 'Ask 10 questions', icon: '🎤', unlocked: true },
  { id: 5, name: 'Speedrunner', description: '30-min session', icon: '⚡', unlocked: false },
  { id: 6, name: 'Comprehension King', description: 'Score 90% on quiz', icon: '👑', unlocked: true },
];

export default function ProgressPage() {
  const { profile } = useProfile();

  if (!profile) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50 dark:to-purple-950 flex items-center justify-center">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <TrendingUp className="w-12 h-12 mx-auto text-purple-600" />
          <h2 className="text-2xl font-bold">Set Up Your Profile First</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Complete onboarding to start tracking your progress
          </p>
          <Button
            className="w-full bg-purple-600"
            onClick={() => (window.location.href = '/onboarding')}
          >
            Start Onboarding
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50 dark:to-purple-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Your Learning Progress
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            See how far you've come
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600">5 days</p>
              </div>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Words Read</p>
                <p className="text-3xl font-bold text-blue-600">9,600</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Study Time</p>
                <p className="text-3xl font-bold text-purple-600">4h 25m</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Badges</p>
                <p className="text-3xl font-bold text-yellow-600">4/6</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Weekly Activity */}
          <div className="lg:col-span-2">
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-lg">Weekly Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15,23,42,0.9)',
                      border: '1px solid rgba(148,163,184,0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="words" fill="#a855f7" name="Words Read" />
                  <Bar dataKey="minutes" fill="#3b82f6" name="Minutes" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Mode Usage */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-lg">Mode Usage</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={modeUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {modeUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="p-6 space-y-6">
          <h3 className="font-bold text-lg">Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 text-center space-y-2 ${
                  achievement.unlocked
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-50'
                }`}
              >
                <div className="text-4xl">{achievement.icon}</div>
                <div>
                  <p className="font-semibold text-sm">{achievement.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {achievement.description}
                  </p>
                </div>
                {achievement.unlocked && (
                  <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                    ✓ Unlocked
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
