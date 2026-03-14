'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter } from 'recharts';
import { Users, TrendingUp, AlertCircle, Share2, Loader2 } from 'lucide-react';

interface StudentData {
  id: string; // Updated to string for UUID
  name: string;
  mode: string;
  wordsRead: number;
  comprehension: number;
  sessionTime: number;
  lastActive: string;
  struggles: string[];
}

export default function TeacherDashboard() {
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [classProgress, setClassProgress] = useState<any[]>([]);
  const [strugglePoints, setStrugglePoints] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        
        setStudentData(data.studentData);
        setClassProgress(data.classProgress);
        setStrugglePoints(data.strugglePoints);
        if (data.studentData.length > 0) {
          setSelectedStudent(data.studentData[0]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-purple-50 dark:to-purple-950">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Loading student metrics...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50 dark:to-purple-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="space-y-3 mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Teacher Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Monitor your students' learning progress and identify struggle points
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Students</p>
                <p className="text-3xl font-bold">{studentData.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Comprehension</p>
                <p className="text-3xl font-bold">
                  {Math.round(studentData.reduce((sum, s) => sum + s.comprehension, 0) / studentData.length)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Needs Attention</p>
                <p className="text-3xl font-bold text-orange-600">2</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Class Progress */}
          <div className="lg:col-span-2">
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-lg">Class Progress Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={classProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15,23,42,0.9)',
                      border: '1px solid rgba(148,163,184,0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgWords"
                    stroke="#a855f7"
                    name="Avg Words Read"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgTime"
                    stroke="#3b82f6"
                    name="Avg Session Time (min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Mode Distribution */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-lg">Learning Modes</h3>
            <div className="space-y-3">
              {[
                { label: 'Dyslexia', count: 1, color: 'bg-orange-500' },
                { label: 'ADHD', count: 1, color: 'bg-purple-500' },
                { label: 'Standard', count: 1, color: 'bg-blue-500' },
              ].map((mode) => (
                <div key={mode.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{mode.label}</span>
                    <span className="text-slate-600 dark:text-slate-400">{mode.count} student</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`${mode.color} h-2 rounded-full`}
                      style={{ width: `${(mode.count / studentData.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Struggle Points Heatmap */}
        <Card className="p-6 space-y-4 mb-8">
          <h3 className="font-bold text-lg">Content Difficulty Map</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            X-axis: Words Read | Y-axis: Comprehension Score | Bubble: Content Struggle Point
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
              <XAxis type="number" dataKey="x" name="Words Read" />
              <YAxis type="number" dataKey="y" name="Comprehension %" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(148,163,184,0.2)',
                  borderRadius: '8px',
                }}
                label={(props: any) => props.payload?.[0]?.payload?.name || ''}
              />
              <Scatter name="Struggle Points" data={strugglePoints} fill="#f97316" />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        {/* Student List */}
        <Card className="p-6 space-y-6">
          <h3 className="font-bold text-lg">Student Progress</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {studentData.map((student) => (
              <Card
                key={student.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedStudent?.id === student.id
                    ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedStudent(student)}
              >
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Mode: <span className="font-medium">{student.mode}</span>
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Words Read</span>
                      <span className="font-medium">{student.wordsRead}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Comprehension</span>
                      <span className="font-medium">{student.comprehension}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Session Time</span>
                      <span className="font-medium">{student.sessionTime}m</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Last active: {student.lastActive}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Selected Student Details */}
        {selectedStudent && (
          <Card className="p-6 space-y-6 mt-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{selectedStudent.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Learning Mode: <span className="font-semibold">{selectedStudent.mode}</span>
                </p>
              </div>
              <Button className="bg-purple-600" onClick={() => alert('Share link copied!')}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Profile Link
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Words Read</p>
                <p className="text-2xl font-bold">{selectedStudent.wordsRead}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Comprehension</p>
                <p className="text-2xl font-bold">{selectedStudent.comprehension}%</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Session Time</p>
                <p className="text-2xl font-bold">{selectedStudent.sessionTime}m</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Last Active</p>
                <p className="text-sm font-bold">{selectedStudent.lastActive}</p>
              </div>
            </div>

            {selectedStudent.struggles.some((s) => s !== 'None detected') && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="font-semibold text-orange-900 dark:text-orange-300 mb-2">
                  Potential Struggle Areas
                </p>
                <ul className="space-y-1">
                  {selectedStudent.struggles
                    .filter((s) => s !== 'None detected')
                    .map((struggle, idx) => (
                      <li key={idx} className="text-sm text-orange-800 dark:text-orange-200">
                        • {struggle}
                      </li>
                    ))}
                </ul>
                <p className="text-xs text-orange-700 dark:text-orange-400 mt-3">
                  Recommendation: Consider using simpler text or additional scaffolding for these areas
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}
