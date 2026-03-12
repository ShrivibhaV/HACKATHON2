'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Volume2, Pause, Sparkles, BookOpen, Layers } from 'lucide-react';

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
  const [maxSpacing, setMaxSpacing] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const toggleMaxSpacing = (checked: boolean) => {
    setMaxSpacing(checked);
    if (checked) {
      onWordSpacingChange(0.35);
      onLineHeightChange(2.5);
    } else {
      onWordSpacingChange(0.12);
      onLineHeightChange(1.6);
    }
  };

  const toggleTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
        speechRef.current = utterance;
        setIsSpeaking(true);
      }
    }
  };

  return (
    <Card className="glass-card p-6 space-y-8 sticky top-4 border-white/10 shadow-2xl">
      <div className="flex items-center gap-2 pb-4 border-b border-white/5">
        <Sparkles className="w-5 h-5 text-[#7c5bf9]" />
        <h3 className="font-bold text-lg text-[#f0f0ff]">Dyslexia Lens</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#f0f0ff]">Max Spacing</p>
            <p className="text-[10px] text-slate-400">Combat visual crowding</p>
          </div>
          <Switch 
            checked={maxSpacing}
            onCheckedChange={toggleMaxSpacing}
          />
        </div>

        <Button
          onClick={toggleTextToSpeech}
          className={`w-full h-12 rounded-xl font-bold transition-all ${
            isSpeaking
              ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30'
              : 'bg-[#7c5bf9] text-white hover:bg-[#6b4ae0] shadow-lg shadow-purple-500/20'
          }`}
        >
          {isSpeaking ? <Pause className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
          {isSpeaking ? 'Stop Reading' : 'Listen with Audio'}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>WORD SPACING</span>
            <span>{wordSpacing}em</span>
          </div>
          <Slider value={[wordSpacing]} onValueChange={(v) => onWordSpacingChange(v[0])} min={0.05} max={0.5} step={0.01} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>LINE HEIGHT</span>
            <span>{lineHeight}</span>
          </div>
          <Slider value={[lineHeight]} onValueChange={(v) => onLineHeightChange(v[0])} min={1.2} max={3.0} step={0.1} />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mnemonic Anchors</p>
        <div className="grid grid-cols-4 gap-2">
          {['b', 'd', 'p', 'q'].map((l) => (
            <button
              key={l}
              className="h-10 rounded-lg bg-white/5 border border-white/5 text-[#7c5bf9] font-bold hover:bg-white/10 transition-colors"
              title={`Show mnemonic for ${l}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-[#7c5bf9]/10 rounded-xl border border-[#7c5bf9]/20 space-y-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#7c5bf9]" />
          <p className="text-xs font-bold text-[#f0f0ff]">Phonetic Status</p>
        </div>
        <p className="text-[10px] text-slate-400">Syllable breakdown is active for complex words. Click any word to hear sounds.</p>
      </div>
    </Card>
  );
}
