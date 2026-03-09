'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, BookOpen, AlertCircle, Plus, Settings } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  mode: 'dyslexia' | 'adhd' | 'standard';
  sessionsCompleted: number;
  averageScore: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'struggling';
}

export default function TeacherDashboard() {
  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'Emma Johnson',
      email: 'emma@example.com',
      mode: 'dyslexia',
      sessionsCompleted: 12,
      averageScore: 85,
      lastActive: 'Today',
      status: 'active',
    },
    {
      id: '2',
      name: 'Alex Chen',
      email: 'alex@example.com',
      mode: 'adhd',
      sessionsCompleted: 8,
      averageScore: 78,
      lastActive: '2 days ago',
      status: 'active',
    },
    {
      id: '3',
      name: 'Jordan Smith',
      email: 'jordan@example.com',
      mode: 'standard',
      sessionsCompleted: 5,
      averageScore: 72,
      lastActive: '1 week ago',
      status: 'inactive',
    },
    {
      id: '4',
      name: 'Sam Wilson',
      email: 'sam@example.com',
      mode: 'dyslexia',
      sessionsCompleted: 3,
      averageScore: 65,
      lastActive: '3 days ago',
      status: 'struggling',
    },
  ]);

  const classData = [
    { date: 'Week 1', active: 4, completed: 12, avgScore: 78 },
    { date: 'Week 2', active: 3, completed: 18, avgScore: 81 },
    { date: 'Week 3', active: 3, completed: 15, avgScore: 79 },
    { date: 'Week 4', active: 4, completed: 20, avgScore: 83 },
  ];

  const stats = [
    {
      label: 'Total Students',
      value: '24',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Active This Week',
      value: '18',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Avg. Performance',
      value: '81%',
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Need Support',
      value: '3',
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'inactive':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
      case 'struggling':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return '';
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'dyslexia':
        return 'Dyslexia Mode';
      case 'adhd':
        return 'ADHD Mode';
      case 'standard':
        return 'Standard';
      default:
        return mode;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your students and track their progress
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className={`p-6 ${stat.bg}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Class Performance Chart */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Class Performance Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={classData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="completed"
                    stroke="#a855f7"
                    strokeWidth={2}
                    name="Sessions Completed"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    name="Avg Score (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Class Overview</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">Dyslexia Mode</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">8 students</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '33%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">ADHD Mode</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">10 students</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">Standard</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">6 students</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-semibold">Engagement</p>
              <div className="text-3xl font-bold text-blue-600">75%</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                This week's average engagement
              </p>
            </div>
          </Card>
        </div>

        {/* Student List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Student List</h2>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Mode</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Sessions</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Avg Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Last Active</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-sm">{student.name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {student.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">{getModeLabel(student.mode)}</td>
                    <td className="py-4 px-4 text-sm font-semibold">{student.sessionsCompleted}</td>
                    <td className="py-4 px-4 text-sm font-semibold">{student.averageScore}%</td>
                    <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {student.lastActive}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                          student.status
                        )}`}
                      >
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
