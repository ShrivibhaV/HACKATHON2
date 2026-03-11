'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeightedProfile } from '@/lib/types';

interface CognitiveGameProps {
  onComplete: (stats: { timeTaken: number; errors: number; hesitation: number }) => void;
}

export function CognitiveGame({ onComplete }: CognitiveGameProps) {
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [startTime] = useState(Date.now());
  const [errors, setErrors] = useState(0);
  const [hesitation, setHesitation] = useState(0);
  const lastMoveTime = useRef(Date.now());

  const targetSentence = ['Plants', 'convert', 'light', 'to', 'energy'];
  
  useEffect(() => {
    setShuffledWords([...targetSentence].sort(() => Math.random() - 0.5));
  }, []);

  const handleWordClick = (word: string, fromPlaced: boolean) => {
    const now = Date.now();
    const timeSinceLast = now - lastMoveTime.current;
    if (timeSinceLast > 3000) setHesitation(prev => prev + 1); // 3s pause = hesitation
    lastMoveTime.current = now;

    if (fromPlaced) {
      setPlacedWords(prev => prev.filter(w => w !== word));
      setShuffledWords(prev => [...prev, word]);
    } else {
      setShuffledWords(prev => prev.filter(w => w !== word));
      setPlacedWords(prev => [...prev, word]);
    }
  };

  const checkSentence = () => {
    if (placedWords.join(' ') === targetSentence.join(' ')) {
      onComplete({
        timeTaken: Date.now() - startTime,
        errors,
        hesitation
      });
    } else {
      setErrors(prev => prev + 1);
      // Give feedback or reset partially
      const shakeElement = document.getElementById('sentence-box');
      shakeElement?.classList.add('animate-shake');
      setTimeout(() => shakeElement?.classList.remove('animate-shake'), 500);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold mb-3">
          <span className="gradient-text">Warm-up Game</span>
        </h2>
        <p className="text-[#8888b0] max-w-md mx-auto">
          Arrange the words into a logical sentence. This helps us understand how you process structures.
        </p>
      </div>

      <div id="sentence-box" className="glass-card p-10 min-h-[120px] flex flex-wrap gap-3 items-center justify-center border-dashed border-2 border-white/10">
        {placedWords.length === 0 && (
          <span className="text-white/20 italic">Click words below to arrange them...</span>
        )}
        {placedWords.map((word, i) => (
          <button
            key={`placed-${i}`}
            onClick={() => handleWordClick(word, true)}
            className="px-5 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all active:scale-95"
          >
            {word}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {shuffledWords.map((word, i) => (
          <button
            key={`shuffle-${i}`}
            onClick={() => handleWordClick(word, false)}
            className="px-5 py-2 rounded-xl bg-[#7c5bf9]/20 border border-[#7c5bf9]/30 text-[#a78bfa] font-medium hover:bg-[#7c5bf9]/30 transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
          >
            {word}
          </button>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={checkSentence}
          disabled={placedWords.length !== targetSentence.length}
          className="glow-btn px-10"
        >
          Check Sentence →
        </Button>
      </div>
    </div>
  );
}
