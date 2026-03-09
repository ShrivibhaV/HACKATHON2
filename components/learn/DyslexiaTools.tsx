'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, Pause, Play } from 'lucide-react';

interface DyslexiaToolsProps {
  text: string;
  onWordSpacingChange: (value: number) => void;
  onLineHeightChange: (value: number) => void;
  onFontSizeChange: (value: number) => void;
  onBackgroundChange: (color: string) => void;
  wordSpacing: number;
  lineHeight: number;
  fontSize: number;
  backgroundColor: string;
}

export function DyslexiaTools({
  text,
  onWordSpacingChange,
  onLineHeightChange,
  onFontSizeChange,
  onBackgroundChange,
  wordSpacing,
  lineHeight,
  fontSize,
  backgroundColor,
}: DyslexiaToolsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const toggleTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slower speech
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
        speechRef.current = utterance;
        setIsSpeaking(true);
      }
    }
  };

  const backgroundOptions = [
    { label: 'Cream', value: '#fffaf0', color: 'bg-yellow-50' },
    { label: 'Light Yellow', value: '#fffbf0', color: 'bg-yellow-100' },
    { label: 'Light Green', value: '#f0fdf4', color: 'bg-green-50' },
    { label: 'Light Blue', value: '#f0f9ff', color: 'bg-blue-50' },
  ];

  return (
    <Card className="p-6 space-y-6 sticky top-4">
      <h3 className="font-bold text-lg">Reading Tools</h3>

      {/* Text-to-Speech */}
      <div className="space-y-3">
        <label className="font-semibold text-sm">Text-to-Speech</label>
        <Button
          onClick={toggleTextToSpeech}
          className={`w-full ${
            isSpeaking
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-orange-600 hover:bg-orange-700'
          } text-white`}
        >
          {isSpeaking ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Stop Reading
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              Listen
            </>
          )}
        </Button>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Listen while you read to improve comprehension
        </p>
      </div>

      {/* Word Spacing */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="font-semibold text-sm">Word Spacing</label>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {wordSpacing.toFixed(2)}em
          </span>
        </div>
        <Slider
          value={[wordSpacing]}
          onValueChange={(val) => onWordSpacingChange(val[0])}
          min={0.05}
          max={0.4}
          step={0.02}
          className="w-full"
        />
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Wider spacing makes reading easier
        </p>
      </div>

      {/* Line Height */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="font-semibold text-sm">Line Height</label>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {lineHeight.toFixed(1)}
          </span>
        </div>
        <Slider
          value={[lineHeight]}
          onValueChange={(val) => onLineHeightChange(val[0])}
          min={1.2}
          max={2.2}
          step={0.1}
          className="w-full"
        />
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Extra line height improves readability
        </p>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="font-semibold text-sm">Font Size</label>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {fontSize}px
          </span>
        </div>
        <Slider
          value={[fontSize]}
          onValueChange={(val) => onFontSizeChange(val[0])}
          min={12}
          max={24}
          step={1}
          className="w-full"
        />
      </div>

      {/* Background Color */}
      <div className="space-y-3">
        <label className="font-semibold text-sm">Background Color</label>
        <div className="grid grid-cols-2 gap-2">
          {backgroundOptions.map((option) => (
            <Button
              key={option.value}
              variant={backgroundColor === option.value ? 'default' : 'outline'}
              className={`${
                backgroundColor === option.value ? 'ring-2 ring-orange-500' : ''
              } ${option.color}`}
              onClick={() => onBackgroundChange(option.value)}
            >
              <span
                className="w-4 h-4 rounded mr-2 border border-slate-400"
                style={{ backgroundColor: option.value }}
              />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Preset */}
      <div className="space-y-3">
        <label className="font-semibold text-sm">Quick Presets</label>
        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={() => {
            onWordSpacingChange(0.18);
            onLineHeightChange(2.0);
            onFontSizeChange(16);
            onBackgroundChange('#fffaf0');
          }}
        >
          Recommended Settings
        </Button>
      </div>
    </Card>
  );
}
