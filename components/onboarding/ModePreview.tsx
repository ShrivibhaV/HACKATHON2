'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LearningMode } from '@/lib/types';
import { BookOpen, Zap, Lightbulb } from 'lucide-react';

const SAMPLE_TEXT =
  'Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose.';

const modeConfigs = {
  standard: {
    icon: BookOpen,
    title: 'Standard Learner',
    description: 'Clean, balanced layout with standard fonts and neutral colors',
    className: 'font-sans text-base leading-relaxed',
    containerClass: 'bg-white dark:bg-slate-900',
    textColor: 'text-slate-900 dark:text-slate-100',
  },
  dyslexia: {
    icon: BookOpen,
    title: 'Dyslexia Mode',
    description: 'Wide spacing, warm tones, OpenDyslexic font, reading ruler support',
    className: 'font-sans text-lg leading-loose tracking-wider',
    containerClass: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-slate-900 dark:text-slate-100',
  },
  adhd: {
    icon: Zap,
    title: 'ADHD Mode',
    description: 'Chunked content, high contrast, pacing guides, reward animations',
    className: 'font-sans text-base leading-relaxed font-semibold',
    containerClass: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-900 dark:text-purple-100',
  },
};

interface ModePreviewProps {
  onSelect: (mode: LearningMode) => void;
}

export function ModePreview({ onSelect }: ModePreviewProps) {
  const [hoveredMode, setHoveredMode] = useState<LearningMode | null>(null);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Which reading style feels easier for you?
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Choose the layout that makes reading most comfortable
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(modeConfigs) as LearningMode[]).map((mode) => {
          const config = modeConfigs[mode];
          const Icon = config.icon;
          const isHovered = hoveredMode === mode;

          return (
            <Card
              key={mode}
              className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                isHovered ? 'ring-2 ring-purple-500 shadow-lg scale-105' : 'hover:shadow-md'
              }`}
              onMouseEnter={() => setHoveredMode(mode)}
              onMouseLeave={() => setHoveredMode(null)}
              onClick={() => onSelect(mode)}
            >
              <div className="p-6 space-y-4">
                {/* Header with icon and title */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{config.title}</h3>
                      {mode === 'dyslexia' && (
                        <span className="inline-block px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-full mt-1">
                          Popular Choice
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {config.description}
                  </p>
                </div>

                {/* Text Preview */}
                <div className={`p-4 rounded-lg ${config.containerClass} border border-slate-200 dark:border-slate-700`}>
                  <p className={`${config.className} ${config.textColor} text-sm`}>
                    {mode === 'dyslexia' ? (
                      // Bionic Reading for dyslexia preview
                      <>
                        <span className="font-bold">Phot</span>
                        osynthesis is the{' '}
                        <span className="font-bold">pro</span>
                        cess by which{' '}
                        <span className="font-bold">pla</span>
                        nts convert light energy into chemical energy stored in glucose.
                      </>
                    ) : mode === 'adhd' ? (
                      // Chunked for ADHD preview
                      <>
                        <div>
                          <span className="font-bold">Photosynthesis</span> is the process
                        </div>
                        <div>by which plants convert light energy.</div>
                        <div>This energy is stored in glucose.</div>
                      </>
                    ) : (
                      SAMPLE_TEXT
                    )}
                  </p>
                </div>

                {/* Button */}
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
                  size="lg"
                >
                  Choose This Style →
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-4 justify-center pt-6">
        <Button variant="ghost" className="text-slate-600 dark:text-slate-400">
          Skip for now (Use Default)
        </Button>
      </div>
    </div>
  );
}
