'use client';

import React from 'react';
import { LearningMode } from '@/lib/types';
import DOMPurify from 'dompurify';

interface AdaptiveContentViewerProps {
  content: string;
  mode: LearningMode;
  wordSpacing?: number;
  lineHeight?: number;
  fontSize?: number;
  backgroundColor?: string;
  dyslexiaFontEnabled?: boolean;
}

export function AdaptiveContentViewer({
  content,
  mode,
  wordSpacing = 0.1,
  lineHeight = 1.6,
  fontSize = 16,
  backgroundColor = '#ffffff',
  dyslexiaFontEnabled = false,
}: AdaptiveContentViewerProps) {
  const getModeStyles = () => {
    switch (mode) {
      case 'dyslexia':
        return {
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          wordSpacing: `${wordSpacing}em`,
          fontFamily: dyslexiaFontEnabled
            ? '"OpenDyslexic", "Courier New", monospace'
            : 'inherit',
          fontWeight: '500',
          letterSpacing: '0.02em',
          backgroundColor: backgroundColor,
          color: '#1f2937',
          padding: '2rem',
          borderRadius: '0.5rem',
        };
      case 'adhd':
        return {
          fontSize: `${Math.max(fontSize - 2, 14)}px`,
          lineHeight: 1.7,
          wordSpacing: '0.1em',
          fontWeight: '600',
          color: '#6b21a8',
          backgroundColor: '#faf5ff',
          padding: '2rem',
          borderRadius: '0.5rem',
        };
      default:
        return {
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          wordSpacing: `${wordSpacing}em`,
          color: '#1f2937',
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '0.5rem',
        };
    }
  };

  const styles = getModeStyles();

  return (
    <div
      className="prose dark:prose-invert max-w-none"
      style={styles as React.CSSProperties}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(content),
      }}
    />
  );
}
