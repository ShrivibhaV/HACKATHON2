'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw } from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';

interface ADHDToolsProps {
  onBreakComplete?: () => void;
  onSessionComplete?: () => void;
  totalSections: number;
  currentSection: number;
}

export function ADHDTools({
  onBreakComplete,
  onSessionComplete,
  totalSections,
  currentSection,
}: ADHDToolsProps) {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusTime, setIsFocusTime] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Timer complete - switch between focus and break
      if (isFocusTime) {
        setIsFocusTime(false);
        setTimeLeft(breakMinutes * 60);
        onBreakComplete?.();
        // Confetti animation
        handleConfetti();
      } else {
        setIsFocusTime(true);
        setTimeLeft(focusMinutes * 60);
        setSessionsCompleted((prev) => prev + 1);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, focusMinutes, breakMinutes, isFocusTime, onBreakComplete]);

  const handleConfetti = () => {
    triggerConfetti();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((currentSection / totalSections) * 100).toFixed(0);

  return (
    <Card className="p-6 space-y-6 sticky top-4">
      <h3 className="font-bold text-lg">Focus Booster</h3>

      {/* Pomodoro Timer */}
      <div className="space-y-4 p-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
            {isFocusTime ? '🎯 Focus Time' : '☕ Break Time'}
          </p>
          <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 font-mono">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            onClick={() => setIsRunning(!isRunning)}
            className={isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
          >
            {isRunning ? '⏸ Pause' : '▶ Start'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(isFocusTime ? focusMinutes * 60 : breakMinutes * 60);
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timer Settings */}
      <div className="space-y-3 border-t pt-4">
        <div>
          <label className="font-semibold text-sm">Focus Duration</label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={[focusMinutes]}
              onValueChange={(val) => {
                setFocusMinutes(val[0]);
                if (isFocusTime && !isRunning) {
                  setTimeLeft(val[0] * 60);
                }
              }}
              min={5}
              max={60}
              step={5}
              className="flex-1"
            />
            <span className="text-sm font-medium w-12">{focusMinutes}min</span>
          </div>
        </div>

        <div>
          <label className="font-semibold text-sm">Break Duration</label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={[breakMinutes]}
              onValueChange={(val) => {
                setBreakMinutes(val[0]);
                if (!isFocusTime && !isRunning) {
                  setTimeLeft(val[0] * 60);
                }
              }}
              min={1}
              max={15}
              step={1}
              className="flex-1"
            />
            <span className="text-sm font-medium w-12">{breakMinutes}min</span>
          </div>
        </div>
      </div>

      {/* Streak Counter */}
      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Current Streak</p>
            <p className="text-2xl font-bold text-orange-600">🔥 {sessionsCompleted}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600 dark:text-slate-400">sessions today</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-semibold">Content Progress</span>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {currentSection} of {totalSections}
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          You're {progressPercent}% done! Keep going!
        </p>
      </div>

      {/* Tips */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs">
        <p className="font-semibold text-blue-900 dark:text-blue-400 mb-1">💡 Focus Tip</p>
        <p className="text-blue-800 dark:text-blue-300">
          Take a short walk or stretch during breaks to refresh your mind
        </p>
      </div>
    </Card>
  );
}
