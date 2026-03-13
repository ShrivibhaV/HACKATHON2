'use client';

import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, RefreshCw } from 'lucide-react';

interface SoundBallSimulatorProps {
  word: string;
  syllables: string[];
}

export function SoundBallSimulator({ word, syllables }: SoundBallSimulatorProps) {
  const [items, setItems] = useState(syllables);
  const [isCorrect, setIsCorrect] = useState(false);

  const checkOrder = () => {
    if (items.join('') === word.replace(/-/g, '')) {
      setIsCorrect(true);
      // Play success confetti or sound here
    }
  };

  const playSyllable = (syllable: string) => {
    const utterance = new SpeechSynthesisUtterance(syllable);
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card className="glass-card p-6 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-[#f0f0ff]">Tactile Phonics: Sound Balls</h3>
        <p className="text-xs text-slate-400">Drag the balls to reassemble the word "{word}"</p>
      </div>

      <Reorder.Group 
        axis="x" 
        values={items} 
        onReorder={setItems} 
        className="flex gap-4 justify-center py-8"
      >
        {items.map((item) => (
          <Reorder.Item
            key={item}
            value={item}
            className="cursor-grab active:cursor-grabbing"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => playSyllable(item)}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c5bf9] to-[#00d4ff] flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white/20"
            >
              {item}
            </motion.button>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <div className="flex gap-3 justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setItems([...syllables].sort(() => Math.random() - 0.5))}
          className="border-white/10 text-slate-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Scramble
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={checkOrder}
          className="bg-[#00d4ff] text-white hover:bg-[#00b8e6]"
        >
          Check
        </Button>
      </div>

      {isCorrect && (
        <motion.p 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-[#4ade80] font-bold"
        >
          ✨ Correct! Sound retrieval complete. ✨
        </motion.p>
      )}
    </Card>
  );
}
