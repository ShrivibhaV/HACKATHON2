'use client';

import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, BookOpen, AlertCircle, X } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  mode: 'dyslexia' | 'adhd' | 'standard';
  sessionsCompleted: number;
  averageScore: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'struggling';
  loadScore: number; // 0-100, for heatmap colouring
  trend: number[];   // engagement over last 4 weeks
}

const DEMO_STUDENTS: Student[] = [
  { id: '1', name: 'Emma Johnson',  email: 'emma@example.com',   mode: 'dyslexia', sessionsCompleted: 12, averageScore: 85, lastActive: 'Today',      status: 'active',     loadScore: 30, trend: [78, 81, 83, 85] },
  { id: '2', name: 'Alex Chen',     email: 'alex@example.com',   mode: 'adhd',     sessionsCompleted: 8,  averageScore: 78, lastActive: '2 days ago',   status: 'active',     loadScore: 45, trend: [70, 74, 76, 78] },
  { id: '3', name: 'Jordan Smith',  email: 'jordan@example.com', mode: 'standard', sessionsCompleted: 5,  averageScore: 72, lastActive: '1 week ago',   status: 'inactive',   loadScore: 60, trend: [74, 73, 72, 72] },
  { id: '4', name: 'Sam Wilson',    email: 'sam@example.com',    mode: 'dyslexia', sessionsCompleted: 3,  averageScore: 65, lastActive: '3 days ago',   status: 'struggling', loadScore: 85, trend: [72, 68, 66, 65] },
];

const classData = [
  { date: 'Week 1', completed: 12, avgScore: 78 },
  { date: 'Week 2', completed: 18, avgScore: 81 },
  { date: 'Week 3', completed: 15, avgScore: 79 },
  { date: 'Week 4', completed: 20, avgScore: 83 },
];

function getHeatColor(score: number): string {
  if (score < 40) return 'rgba(16,185,129,0.15)';   // green — low load
  if (score < 65) return 'rgba(245,158,11,0.15)';   // amber — medium load
  return 'rgba(239,68,68,0.15)';                     // red — high load / struggling
}
function getHeatBorder(score: number): string {
  if (score < 40) return 'rgba(16,185,129,0.35)';
  if (score < 65) return 'rgba(245,158,11,0.35)';
  return 'rgba(239,68,68,0.35)';
}

function getModeLabel(mode: string): string {
  const map: Record<string, string> = { dyslexia: '📖 Dyslexia', adhd: '⚡ ADHD', standard: '🧠 Standard' };
  return map[mode] ?? mode;
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'active':     return { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' };
    case 'inactive':   return { background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)' };
    case 'struggling': return { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' };
    default:           return {};
  }
}

export default function TeacherDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const stats = [
    { label: 'Total Students', value: '24 (demo)', icon: Users,       color: '#00d4ff' },
    { label: 'Active This Week', value: '18 (demo)',  icon: TrendingUp, color: '#10b981' },
    { label: 'Avg. Performance', value: '81% (demo)', icon: BookOpen,   color: '#7c5bf9' },
    { label: 'Need Support',     value: '3 (demo)',   icon: AlertCircle, color: '#f59e0b' },
  ];

  return (
    <main className="min-h-screen">
      {/* Student detail modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedStudent(null)}>
          <div className="glass-card p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-[#8888b0] hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)' }}>
                {selectedStudent.mode === 'dyslexia' ? '📖' : selectedStudent.mode === 'adhd' ? '⚡' : '🧠'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#f0f0ff]">{selectedStudent.name}</h2>
                <p className="text-sm text-[#8888b0]">{selectedStudent.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Mode', value: getModeLabel(selectedStudent.mode) },
                { label: 'Sessions', value: `${selectedStudent.sessionsCompleted}` },
                { label: 'Avg Score', value: `${selectedStudent.averageScore}%` },
                { label: 'Last Active', value: selectedStudent.lastActive },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-xs text-[#8888b0] mb-1">{item.label}</p>
                  <p className="font-semibold text-[#f0f0ff] text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#8888b0] mb-2">ENGAGEMENT TREND</p>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={selectedStudent.trend.map((v, i) => ({ week: `W${i + 1}`, score: v }))}>
                  <Line type="monotone" dataKey="score" stroke="#7c5bf9" strokeWidth={2} dot={false} />
                  <XAxis dataKey="week" tick={{ fill: '#8888b0', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,30,0.95)', border: '1px solid rgba(124,91,249,0.3)', borderRadius: '8px', fontSize: '12px' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {selectedStudent.status === 'struggling' && (
              <button className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #e040fb)' }}
                onClick={() => alert(`Report generated for ${selectedStudent.name}: Switch to Audio Sync mode and reduce chunk size.`)}>
                📋 Teach This Differently
              </button>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#f0f0ff] mb-1">Teacher Dashboard</h1>
            <p className="text-[#8888b0]">Monitor engagement and support your students</p>
          </div>
        </div>

        {/* Demo Data Banner */}
        <div className="mb-6 px-5 py-3 rounded-xl flex items-center gap-3 text-sm"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}>
          <span className="text-xl">🎭</span>
          <p className="text-[#8888b0]">
            <span className="font-semibold text-[#00d4ff]">Demo Mode:</span>{' '}
            Student data shown here is sample data for demonstration. In production, this connects to your class roster.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="glass-card p-5">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-[#8888b0] font-semibold uppercase tracking-wider">{stat.label}</p>
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold text-[#f0f0ff]">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Cognitive Heatmap */}
        <div className="glass-card p-6 mb-8">
          <h2 className="font-bold text-[#f0f0ff] mb-1">Cognitive Load Heatmap</h2>
          <p className="text-xs text-[#8888b0] mb-4">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />Green = thriving &nbsp;
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1" />Amber = watch &nbsp;
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />Red = struggling
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DEMO_STUDENTS.map((s) => (
              <div key={s.id} className="p-4 rounded-xl cursor-pointer transition-all hover:scale-105"
                style={{ background: getHeatColor(s.loadScore), border: `1px solid ${getHeatBorder(s.loadScore)}` }}
                onClick={() => setSelectedStudent(s)}>
                <p className="font-semibold text-sm text-[#f0f0ff] mb-1">{s.name}</p>
                <p className="text-xs text-[#8888b0]">{getModeLabel(s.mode)}</p>
                <p className="text-xs text-[#8888b0] mt-1">{s.averageScore}% avg</p>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.averageScore}%`, background: getHeatBorder(s.loadScore) }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Class Performance Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <h2 className="font-bold text-[#f0f0ff] mb-4">Class Performance Trend</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fill: '#8888b0', fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fill: '#8888b0', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" domain={[60, 100]} tick={{ fill: '#8888b0', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,30,0.95)', border: '1px solid rgba(124,91,249,0.3)', borderRadius: '8px' }} />
                <Legend formatter={(v) => <span style={{ color: '#8888b0', fontSize: 12 }}>{v}</span>} />
                <Line yAxisId="left" type="monotone" dataKey="completed" stroke="#7c5bf9" strokeWidth={2} name="Sessions Completed" />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#00d4ff" strokeWidth={2} name="Avg Score (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Class Overview */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-bold text-[#f0f0ff]">Class Overview</h2>
            {[
              { label: 'Dyslexia Mode', count: '8 students', pct: 33, color: '#f59e0b' },
              { label: 'ADHD Mode',     count: '10 students', pct: 42, color: '#7c5bf9' },
              { label: 'Standard',      count: '6 students',  pct: 25, color: '#00d4ff' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-semibold text-[#c0c0e0]">{item.label}</span>
                  <span className="text-xs text-[#8888b0]">{item.count}</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student List */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#f0f0ff]">Student List</h2>
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.25)' }}>
              Demo Data
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Student', 'Mode', 'Sessions', 'Avg Score', 'Last Active', 'Status', ''].map((h, i) => (
                    <th key={i} className="text-left py-3 px-4 text-xs font-semibold text-[#8888b0] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEMO_STUDENTS.map((student) => (
                  <tr key={student.id} className="transition-colors hover:bg-white/[0.02]"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-sm text-[#f0f0ff]">{student.name}</p>
                      <p className="text-xs text-[#8888b0]">{student.email}</p>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#c0c0e0]">{getModeLabel(student.mode)}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-[#f0f0ff]">{student.sessionsCompleted}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-[#f0f0ff]">{student.averageScore}%</td>
                    <td className="py-4 px-4 text-xs text-[#8888b0]">{student.lastActive}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 rounded text-xs font-semibold" style={getStatusStyle(student.status)}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button onClick={() => setSelectedStudent(student)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                        style={{ background: 'rgba(124,91,249,0.15)', border: '1px solid rgba(124,91,249,0.3)', color: '#a78bfa' }}>
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
