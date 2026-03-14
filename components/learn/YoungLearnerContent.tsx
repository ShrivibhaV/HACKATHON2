'use client';

import React from 'react';
import { LearningMode } from '@/lib/types';
import { AgeConfig } from '@/lib/age-config';
import { Play } from 'lucide-react';

interface YoungLearnerContentProps {
  mode: LearningMode;
  ageConfig: AgeConfig;
  onPlaySpeech: (text: string) => void;
}

const ALPHABET = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'B', word: 'Bear', emoji: '🐻' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'E', word: 'Elephant', emoji: '🐘' },
  { letter: 'F', word: 'Frog', emoji: '🐸' },
  { letter: 'G', word: 'Giraffe', emoji: '🦒' },
  { letter: 'H', word: 'Hat', emoji: '🎩' },
  { letter: 'I', word: 'Ice Cream', emoji: '🍦' },
  { letter: 'J', word: 'Jellyfish', emoji: '🪼' },
  { letter: 'K', word: 'Kite', emoji: '🪁' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'M', word: 'Monkey', emoji: '🐒' },
  { letter: 'N', word: 'Nest', emoji: '🪹' },
  { letter: 'O', word: 'Owl', emoji: '🦉' },
  { letter: 'P', word: 'Penguin', emoji: '🐧' },
  { letter: 'Q', word: 'Queen', emoji: '👑' },
  { letter: 'R', word: 'Rabbit', emoji: '🐰' },
  { letter: 'S', word: 'Sun', emoji: '☀️' },
  { letter: 'T', word: 'Turtle', emoji: '🐢' },
  { letter: 'U', word: 'Umbrella', emoji: '☔' },
  { letter: 'V', word: 'Volcano', emoji: '🌋' },
  { letter: 'W', word: 'Whale', emoji: '🐳' },
  { letter: 'X', word: 'Xylophone', emoji: '🎹' },
  { letter: 'Y', word: 'Yak', emoji: '🐂' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓' },
];

const RHYMES = [
  {
    title: 'Twinkle Twinkle Little Star',
    emoji: '⭐',
    lines: [
      'Twinkle, twinkle, little star,',
      'How I wonder what you are!',
      'Up above the world so high,',
      'Like a diamond in the sky.'
    ]
  },
  {
    title: 'Humpty Dumpty',
    emoji: '🥚',
    lines: [
      'Humpty Dumpty sat on a wall,',
      'Humpty Dumpty had a great fall.',
      'All the king\'s horses and all the king\'s men,',
      'Couldn\'t put Humpty together again.'
    ]
  }
];

export function YoungLearnerContent({ mode, ageConfig, onPlaySpeech }: YoungLearnerContentProps) {
  // Maintaining standard styling based on 'mode' selection
  const isDyslexia = mode === 'dyslexia' || mode === 'mixed';
  
  const cardStyle = {
    fontFamily: isDyslexia ? '"OpenDyslexic", "Comic Sans MS", sans-serif' : 'inherit',
    fontSize: `${ageConfig.fontSize}px`,
    lineHeight: ageConfig.lineHeight,
    letterSpacing: isDyslexia ? '0.05em' : 'inherit',
  };

  const bgStyles = isDyslexia 
    ? { background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.3)', color: '#1e293b' }
    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0ff' };

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Alphabet section */}
      <section className="glass-card p-6 md:p-8" style={isDyslexia ? { background: '#fffbf0' } : {}}>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold mb-2" style={{ color: isDyslexia ? '#b45309' : '#f0f0ff' }}>
            🔤 Alphabet Chart
          </h2>
          <p className="text-lg opacity-80" style={{ color: isDyslexia ? '#92400e' : '#8888b0' }}>
            Click on a letter to hear its sound!
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ALPHABET.map((item) => (
            <button
              key={item.letter}
              onClick={() => onPlaySpeech(`${item.letter}. ${item.letter} is for ${item.word}`)}
              className="flex flex-col items-center justify-center p-4 rounded-2xl transition-transform hover:scale-105"
              style={{ ...bgStyles, ...cardStyle }}
            >
              <div className="text-5xl mb-2">{item.emoji}</div>
              <div className="text-4xl font-extrabold mb-1">{item.letter}</div>
              <div className="text-lg font-medium opacity-80">{item.word}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Rhymes section */}
      <section className="glass-card p-6 md:p-8" style={isDyslexia ? { background: '#fffbf0' } : {}}>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold mb-2" style={{ color: isDyslexia ? '#b45309' : '#f0f0ff' }}>
            🎵 Simple Rhymes
          </h2>
          <p className="text-lg opacity-80" style={{ color: isDyslexia ? '#92400e' : '#8888b0' }}>
            Listen and read along with these fun rhymes!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {RHYMES.map((rhyme) => (
            <div key={rhyme.title} className="p-6 rounded-2xl flex flex-col" style={{ ...bgStyles, ...cardStyle }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{rhyme.emoji}</span>
                  <h3 className="text-xl font-bold">{rhyme.title}</h3>
                </div>
                <button 
                  onClick={() => onPlaySpeech(`${rhyme.title}. ${rhyme.lines.join(' ')}`)}
                  className="p-3 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)', color: 'white' }}
                >
                  <Play className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2 mt-2">
                {rhyme.lines.map((line, i) => (
                  <p key={i} className="font-medium" style={{ letterSpacing: isDyslexia ? '0.05em' : 'inherit' }}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
