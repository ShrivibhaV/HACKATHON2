'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import io from "socket.io-client";
import { useEffect } from 'react';


interface FocusModeProps {
  content: string;
  isActive: boolean;
  onClose: () => void;
}

export function FocusMode({ content, isActive, onClose }: FocusModeProps) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [distance, setDistance] = useState(0);
  // Split content into sentences
  const sentences = content
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0)
    .map((s) => s.trim());

  const currentSentence = sentences[currentSentenceIndex] || '';
  const progress = ((currentSentenceIndex / sentences.length) * 100).toFixed(0);
  const socket = io("http://localhost:3001");


  const [isLocked, setIsLocked] = useState(false);

  // Fullscreen & Tab Change Monitoring
  useEffect(() => {
    if (!isActive) return;

    // 1. Request Fullscreen when active
    const requestFullScreen = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn('Fullscreen request denied or not supported by browser.');
      }
    };
    requestFullScreen();

    // 2. Monitor Tab Switching (Visibility API)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsLocked(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup when component unmounts or becomes inactive
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isActive]);

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

  useEffect(() => {
    socket.on("distance", (data) => {
      setDistance(Number(data));
    });
  }, []);

  if (!isActive) return null;

  // Render the "Hey come back" lockdown screen
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl space-y-6 text-center border-4 border-orange-500">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Focus Interrupted</h2>
          <p className="text-slate-600 dark:text-slate-300">
            You switched tabs or apps! To stay in the zone, please minimize distractions and return to the lesson.
          </p>
          <Button 
            size="lg" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
            onClick={() => {
              setIsLocked(false);
              // Re-request fullscreen since changing tabs usually exits it
              if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
              }
            }}
          >
            I'm Ready to Focus Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-6 right-6"
      >
        <div className="max-w-2xl w-full space-y-12">
          <div className="text-center text-sm text-slate-500">
            Sensor Distance: {distance} cm
          </div>
          <X className="w-6 h-6" />
        </div>
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