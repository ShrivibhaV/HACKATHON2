'use client';

import React from 'react';
import { LearningMode, TextTransformationResult } from '@/lib/types';
import DOMPurify from 'dompurify';
import { SoundBallSimulator } from '../learning/SoundBallSimulator';
import { TTSWordHighlight } from '@/hooks/useTTS';
import { Card } from '@/components/ui/card';

interface AdaptiveContentViewerProps {
  transformation: TextTransformationResult;
  mode: LearningMode;
  wordSpacing?: number;
  lineHeight?: number;
  fontSize?: number;
  backgroundColor?: string;
  dyslexiaFontEnabled?: boolean;
  ttsActiveWordIndex?: number;
  ttsIsPlaying?: boolean;
  rawText: string;
}

export function AdaptiveContentViewer({
  transformation,
  mode,
  wordSpacing = 0.1,
  lineHeight = 1.6,
  fontSize = 16,
  backgroundColor = '#ffffff',
  dyslexiaFontEnabled = false,
  ttsActiveWordIndex = -1,
  ttsIsPlaying = false,
  rawText,
}: AdaptiveContentViewerProps) {
  const [selectedComplexWord, setSelectedComplexWord] = React.useState<{ word: string, syllables: string[] } | null>(null);

  const getModeStyles = () => {
    const isLightBg = backgroundColor === '#fffbf0' || backgroundColor?.toLowerCase() === '#ffffff';
    const textColor = isLightBg ? '#1e293b' : '#f0f0ff';

    switch (mode) {
      case 'dyslexia':
        return {
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          wordSpacing: `${wordSpacing}em`,
          fontFamily: dyslexiaFontEnabled
            ? '"OpenDyslexic", "Courier New", monospace'
            : 'inherit',
          backgroundColor: backgroundColor,
          color: textColor,
          padding: '2rem',
          borderRadius: '1rem',
          border: isLightBg ? '2px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.05)',
        };
      case 'adhd':
        return {
          fontSize: `${Math.max(fontSize, 16)}px`,
          lineHeight: 1.8,
          wordSpacing: '0.05em',
          backgroundColor: '#0f172a',
          color: '#f0f0ff',
          padding: '2rem',
          borderRadius: '1rem',
        };
      default:
        return {
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          wordSpacing: `${wordSpacing}em`,
          color: textColor,
          backgroundColor: backgroundColor,
          padding: '2rem',
          borderRadius: '1rem',
        };
    }
  };

  const styles = getModeStyles();

  // Helper to handle word clicks for phonetic breakdown
  const handleTextClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'B' || target.classList.contains('complex-word')) {
      const wordText = target.innerText.replace(/[.,!?]/g, '');
      const breakdown = transformation.phoneticBreakdown?.find(pb => pb.word.toLowerCase() === wordText.toLowerCase());
      if (breakdown) {
        setSelectedComplexWord({ word: breakdown.word, syllables: breakdown.syllables });
      }
    }
  };

  return (
    <div className="space-y-8">
      {selectedComplexWord && (
        <div className="animate-in slide-in-from-top duration-500">
          <SoundBallSimulator 
            word={selectedComplexWord.word} 
            syllables={selectedComplexWord.syllables} 
          />
        </div>
      )}

      {ttsIsPlaying || ttsActiveWordIndex >= 0 ? (
        <div 
          className="prose dark:prose-invert max-w-none glass-card p-8"
          style={styles as React.CSSProperties}
        >
          <p style={{ lineHeight: 'inherit', fontSize: 'inherit' }}>
            <TTSWordHighlight
              text={rawText}
              activeWordIndex={ttsActiveWordIndex}
            />
          </p>
        </div>
      ) : (
        <div
          className="prose dark:prose-invert max-w-none glass-card cursor-text"
          style={styles as React.CSSProperties}
          onClick={handleTextClick}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(transformation.transformed),
          }}
        />
      )}
    </div>
  );
}
