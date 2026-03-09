'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FocusModeProps {
  content: string;
  isActive: boolean;
  onClose: () => void;
}

export function FocusMode({ content, isActive, onClose }: FocusModeProps) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  // Split content into sentences
  const sentences = content
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0)
    .map((s) => s.trim());

  const currentSentence = sentences[currentSentenceIndex] || '';
  const progress = ((currentSentenceIndex / sentences.length) * 100).toFixed(0);

  const handleNext = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex((prev) => prev - 1);
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-6 right-6"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Main Content */}
      <div className="max-w-2xl w-full space-y-12">
        {/* Sentence Display */}
        <div className="text-center space-y-6">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Focus Mode - One Sentence at a Time
          </p>

          <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-purple-200 dark:border-purple-800">
            <p className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              {currentSentence}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {currentSentenceIndex + 1} of {sentences.length}
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            onClick={handlePrev}
            disabled={currentSentenceIndex === 0}
            variant="outline"
            size="lg"
          >
            ← Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={currentSentenceIndex === sentences.length - 1}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
            size="lg"
          >
            Next →
          </Button>
        </div>

        {/* Exit Button */}
        <div className="text-center">
          <Button variant="ghost" onClick={onClose} className="text-slate-600">
            Exit Focus Mode
          </Button>
        </div>
      </div>
    </div>
  );
}
