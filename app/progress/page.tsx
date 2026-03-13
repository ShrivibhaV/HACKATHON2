'use client';

import React, { useEffect, useState } from 'react';
import { useProfile } from '@/lib/profile-context';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, BookOpen, Clock, Zap, Star, 
  Award, Target, Brain, ArrowUpRight, Calendar
} from 'lucide-react';

export default function ProgressPage() {
  const { profile } = useProfile();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalWords: 0,
    timeSpent: 0,
    averageAccuracy: 0,
    streak: 0
  });

  useEffect(() => {
    if (!profile) return;

    const fetchProgress = async () => {
      // Mock data for now since we're just setting up the full-stack
      // In a real scenario, we'd fetch from learning_progress table
      const mockData = [
        { day: 'Mon', words: 120, time: 15, accuracy: 85 },
        { day: 'Tue', words: 250, time: 25, accuracy: 92 },
        { day: 'Wed', words: 180, time: 20, accuracy: 88 },
        { day: 'Thu', words: 310, time: 35, accuracy: 95 },
        { day: 'Fri', words: 220, time: 22, accuracy: 90 },
        { day: 'Sat', words: 450, time: 45, accuracy: 98 },
        { day: 'Sun', words: 380, time: 40, accuracy: 94 },
      ];
      
      setProgressData(mockData);
      setStats({
        totalWords: mockData.reduce((acc, curr) => acc + curr.words, 0),
        timeSpent: mockData.reduce((acc, curr) => acc + curr.time, 0),
        averageAccuracy: Math.round(mockData.reduce((acc, curr) => acc + curr.accuracy, 0) / mockData.length),
        streak: 5
      });
    };

    fetchProgress();
  }, [profile]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Loading your progress profile...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="gradient-text">Personal Analytics</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Tracking your adaptive learning journey, {profile.userId ? 'Student' : 'Scholar'}.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">Last 7 Days</span>
            </div>
            <button className="glow-btn px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" /> Export Data
            </button>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Words Read', value: stats.totalWords, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Minutes Focused', value: stats.timeSpent, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
            { label: 'Learning Accuracy', value: `${stats.averageAccuracy}%`, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Day Streak', value: stats.streak, icon: Zap, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          ].map((s, i) => (
            <Card key={i} className="glass-card p-6 border-white/5 hover:border-white/10 transition-all group">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${s.bg}`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                  +12% <TrendingUp className="w-3 h-3 ml-1" />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-3xl font-black text-white group-hover:scale-105 transition-transform origin-left">{s.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          <Card className="lg:col-span-2 glass-card p-8 border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" /> Reading Activity
                </h3>
                <p className="text-xs text-slate-500 font-medium">Daily word count across adaptive modules</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-md text-[10px] font-bold bg-white/10 text-white">Words</button>
                <button className="px-3 py-1 rounded-md text-[10px] font-bold text-slate-500 hover:text-white transition-colors">Time</button>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#a78bfa' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="words" 
                    stroke="#a78bfa" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorWords)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Right Sidebar Stats */}
          <div className="space-y-8">
            {/* Cognitive Profile Summary */}
            <Card className="glass-card p-6 border-white/5 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-400" /> Cognitive Balance
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Dyslexia Adaptation', value: 75, color: '#f59e0b' },
                  { label: 'ADHD Focus Tools', value: 45, color: '#7c5bf9' },
                  { label: 'Standard Learning', value: 30, color: '#00d4ff' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">{item.label}</span>
                      <span style={{ color: item.color }}>{item.value}% Utilization</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="glass-card p-6 border-white/5 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-400" /> Recent Awards
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className={`aspect-square rounded-xl bg-white/5 flex items-center justify-center border border-white/5 transition-all cursor-help hover:border-orange-400/40 ${idx > 3 ? 'grayscale opacity-30' : ''}`}
                       title={idx <= 3 ? "Unlocked achievement!" : "Keep learning to unlock"}>
                    <Star className={`w-6 h-6 ${idx <= 3 ? 'text-orange-400' : 'text-slate-600'}`} />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest pt-2">
                3 more to next rank
              </p>
            </Card>
          </div>
        </div>

      </div>
    </main>
  );
}
