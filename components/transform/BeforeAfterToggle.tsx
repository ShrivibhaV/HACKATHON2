'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LearningMode } from '@/lib/types';
import DOMPurify from 'dompurify';

interface BeforeAfterToggleProps {
  original: string;
  transformed: string;
  mode: LearningMode;
  bionicReading?: string;
}

export function BeforeAfterToggle({
  original,
  transformed,
  mode,
  bionicReading,
}: BeforeAfterToggleProps) {
  const [showAfter, setShowAfter] = useState(true);
  const [syncScroll, setSyncScroll] = useState(false);

  const getDisplayText = () => {
    if (mode === 'dyslexia' && bionicReading) {
      return bionicReading;
    }
    return transformed;
  };

  const getModeStyles = () => {
    switch (mode) {
      case 'dyslexia':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-orange-500',
          text: 'text-lg leading-loose tracking-wider font-serif',
          background: 'text-yellow-900/70 dark:text-yellow-100/70',
        };
      case 'adhd':
        return {
          container: 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500',
          text: 'text-base leading-relaxed font-medium',
          background: 'text-purple-900/70 dark:text-purple-100/70',
        };
      default:
        return {
          container: 'bg-slate-50 dark:bg-slate-800/50 border-l-4 border-slate-400',
          text: 'text-base leading-relaxed',
          background: 'text-slate-900/70 dark:text-slate-100/70',
        };
    }
  };

  const styles = getModeStyles();
  const displayText = showAfter ? getDisplayText() : original;

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <div className="flex gap-3 items-center justify-between flex-wrap">
        <div className="flex gap-2">
          <Button
            variant={!showAfter ? 'default' : 'outline'}
            onClick={() => setShowAfter(false)}
            className={!showAfter ? 'bg-slate-600' : ''}
          >
            Original
          </Button>
          <Button
            variant={showAfter ? 'default' : 'outline'}
            onClick={() => setShowAfter(true)}
            className={showAfter ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
          >
            ✨ Adapted
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sync-scroll"
            checked={syncScroll}
            onChange={(e) => setSyncScroll(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="sync-scroll" className="text-sm text-slate-600 dark:text-slate-400">
            Sync scroll
          </label>
        </div>
      </div>

      {/* Content Display */}
      <Card className={`p-6 min-h-96 overflow-y-auto ${styles.container}`}>
        <div
          className={`${styles.text} ${styles.background} whitespace-pre-wrap prose dark:prose-invert max-w-none`}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(displayText),
          }}
        />
      </Card>

      {/* Adaptation Info */}
      {showAfter && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div className="space-y-1">
              <p className="font-semibold text-sm">
                {mode === 'dyslexia'
                  ? 'Bionic Reading Applied'
                  : mode === 'adhd'
                    ? 'Content Chunked & Simplified'
                    : 'Text Simplified'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {mode === 'dyslexia'
                  ? 'Bold word starts help your eyes flow naturally through text'
                  : mode === 'adhd'
                    ? 'Content broken into manageable chunks with key ideas highlighted'
                    : 'Complex vocabulary replaced with simpler alternatives'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
