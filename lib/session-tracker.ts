/**
 * Session Tracker — persists learning stats to localStorage.
 * No database needed for demo. Data survives page refreshes.
 */

export interface SessionData {
  date: string; // YYYY-MM-DD
  wordsRead: number;
  minutesSpent: number;
  mode: 'dyslexia' | 'adhd' | 'standard';
  engagementScore: number; // 0–100, computed from time + scroll behaviour
}

export interface ProgressData {
  sessions: SessionData[];
  totalWordsRead: number;
  totalMinutes: number;
  streakDays: number;
  lastSessionDate: string | null;
  badgesUnlocked: string[];
  modeUsage: { dyslexia: number; adhd: number; standard: number };
}

const STORAGE_KEY = 'neurolearn_progress';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function getProgress(): ProgressData {
  if (typeof window === 'undefined') return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return JSON.parse(raw) as ProgressData;
  } catch {
    return defaultProgress();
  }
}

function defaultProgress(): ProgressData {
  return {
    sessions: [],
    totalWordsRead: 0,
    totalMinutes: 0,
    streakDays: 0,
    lastSessionDate: null,
    badgesUnlocked: [],
    modeUsage: { dyslexia: 0, adhd: 0, standard: 0 },
  };
}

function saveProgress(data: ProgressData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Call when a user starts/finishes a reading session */
export function recordSession(
  wordsRead: number,
  minutesSpent: number,
  mode: 'dyslexia' | 'adhd' | 'standard',
  engagementScore = 70
): ProgressData {
  const data = getProgress();
  const sessionDate = today();

  const newSession: SessionData = {
    date: sessionDate,
    wordsRead,
    minutesSpent,
    mode,
    engagementScore,
  };

  data.sessions.push(newSession);
  data.totalWordsRead += wordsRead;
  data.totalMinutes += minutesSpent;
  data.modeUsage[mode] = (data.modeUsage[mode] || 0) + 1;

  // Streak calculation
  if (data.lastSessionDate === null) {
    data.streakDays = 1;
  } else {
    const last = new Date(data.lastSessionDate);
    const todayDate = new Date(sessionDate);
    const diffDays = Math.floor((todayDate.getTime() - last.getTime()) / 86400000);
    if (diffDays === 1) {
      data.streakDays += 1;
    } else if (diffDays === 0) {
      // Same day, no change
    } else {
      data.streakDays = 1; // streak broken
    }
  }
  data.lastSessionDate = sessionDate;

  // Badge unlocking
  data.badgesUnlocked = computeBadges(data);

  saveProgress(data);
  return data;
}

function computeBadges(data: ProgressData): string[] {
  const badges: string[] = [];
  if (data.sessions.length >= 1) badges.push('first-steps');
  if (data.totalWordsRead >= 5000) badges.push('marathon');
  if (data.streakDays >= 7) badges.push('on-fire');
  if (data.sessions.length >= 10) badges.push('voice-master');
  const hasLongSession = data.sessions.some((s) => s.minutesSpent >= 30);
  if (hasLongSession) badges.push('speedrunner');
  const highScore = data.sessions.some((s) => s.engagementScore >= 90);
  if (highScore) badges.push('comprehension-king');
  return badges;
}

/** Returns last 7 sessions grouped by day for charts */
export function getWeeklyData(): { day: string; words: number; minutes: number }[] {
  const data = getProgress();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: { day: string; words: number; minutes: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const datestr = date.toISOString().split('T')[0];
    const daySessions = data.sessions.filter((s) => s.date === datestr);
    result.push({
      day: days[date.getDay()],
      words: daySessions.reduce((sum, s) => sum + s.wordsRead, 0),
      minutes: daySessions.reduce((sum, s) => sum + s.minutesSpent, 0),
    });
  }
  return result;
}

/** Returns last N sessions for growth timeline chart */
export function getGrowthTimeline(n = 10): { session: string; engagement: number; words: number }[] {
  const data = getProgress();
  return data.sessions.slice(-n).map((s, i) => ({
    session: `#${i + 1}`,
    engagement: s.engagementScore,
    words: s.wordsRead,
  }));
}

export function getModeUsagePercents(data: ProgressData): { name: string; value: number; fill: string }[] {
  const total = data.modeUsage.dyslexia + data.modeUsage.adhd + data.modeUsage.standard;
  if (total === 0) {
    return [
      { name: 'Dyslexia', value: 33, fill: '#f97316' },
      { name: 'ADHD', value: 33, fill: '#a855f7' },
      { name: 'Standard', value: 34, fill: '#3b82f6' },
    ];
  }
  return [
    { name: 'Dyslexia', value: Math.round((data.modeUsage.dyslexia / total) * 100), fill: '#f97316' },
    { name: 'ADHD', value: Math.round((data.modeUsage.adhd / total) * 100), fill: '#a855f7' },
    { name: 'Standard', value: Math.round((data.modeUsage.standard / total) * 100), fill: '#3b82f6' },
  ];
}

export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}
