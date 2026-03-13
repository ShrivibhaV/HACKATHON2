'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface TTSControls {
  isPlaying: boolean;
  activeWordIndex: number;
  words: string[];
  play: (text: string) => void;
  pause: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
}

/**
 * useTTS — Web Speech API hook with word-by-word boundary highlighting
 * Works in all modern browsers (Chrome, Edge, Firefox, Safari)
 */
export function useTTS(): TTSControls {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const rateRef = useRef(0.9);
  const pitchRef = useRef(1.0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setActiveWordIndex(-1);
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  }, []);

  const play = useCallback((rawText: string) => {
    if (!window.speechSynthesis) return;

    // Strip HTML tags for TTS
    const plain = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordList = plain.split(/\s+/).filter(Boolean);
    setWords(wordList);

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = rateRef.current;
    utterance.pitch = pitchRef.current;
    utterance.lang = 'en-US';

    // Pick a clear voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural'))
    ) ?? voices.find((v) => v.lang.startsWith('en')) ?? null;
    if (preferred) utterance.voice = preferred;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Calculate which word index we are on using char index
        const charsSoFar = plain.substring(0, event.charIndex);
        const wordIdx = charsSoFar.split(/\s+/).filter(Boolean).length;
        setActiveWordIndex(wordIdx);
      }
    };

    utterance.onstart = () => { setIsPlaying(true); setActiveWordIndex(0); };
    utterance.onend = () => { setIsPlaying(false); setActiveWordIndex(-1); };
    utterance.onerror = () => { setIsPlaying(false); setActiveWordIndex(-1); };
    utterance.onpause = () => setIsPlaying(false);
    utterance.onresume = () => setIsPlaying(true);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const setRate = useCallback((rate: number) => {
    rateRef.current = rate;
    if (utteranceRef.current) utteranceRef.current.rate = rate;
  }, []);

  const setPitch = useCallback((pitch: number) => {
    pitchRef.current = pitch;
    if (utteranceRef.current) utteranceRef.current.pitch = pitch;
  }, []);

  return { isPlaying, activeWordIndex, words, play, pause, stop, setRate, setPitch };
}

/**
 * TTSWordHighlight — Renders plain text with active-word glow highlight
 */
export function TTSWordHighlight({
  text,
  activeWordIndex,
  className = '',
}: {
  text: string;
  activeWordIndex: number;
  className?: string;
}) {
  // Strip simple HTML (bionic bold tags) and split into words
  const plain = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = plain.split(/\s+/);

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          style={
            i === activeWordIndex
              ? {
                  background: 'linear-gradient(135deg, rgba(124,91,249,0.4), rgba(0,212,255,0.3))',
                  borderRadius: '4px',
                  padding: '0 2px',
                  color: '#ffffff',
                  fontWeight: 700,
                  transition: 'all 0.1s ease',
                  display: 'inline',
                }
              : { transition: 'all 0.1s ease', display: 'inline' }
          }
        >
          {word}{' '}
        </span>
      ))}
    </span>
  );
}
