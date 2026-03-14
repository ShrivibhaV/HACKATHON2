'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Coffee, Zap } from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';

interface FocusNudgeProps {
  thresholdMinutes: number;
  onSimplify: () => void;
  onTakeBreak: () => void;
}

export function FocusNudge({ thresholdMinutes, onSimplify, onTakeBreak }: FocusNudgeProps) {
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    // Nudge triggers if there is NO mouse movement for ~thresholdMinutes
    const resetTimer = () => {
      setShowNudge(false);
      clearTimeout(timeout);
      
      // Wait for threshold before triggering nudge
      timeout = setTimeout(() => {
        setShowNudge(true);
      }, thresholdMinutes * 60 * 1000); 
    };

    // Events to track user activity
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));

    // Initial start
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [thresholdMinutes]);

  const handleAction = (action: () => void) => {
    setShowNudge(false);
    triggerConfetti();
    action();
  };

  if (!showNudge) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <Card className="p-5 max-w-sm glass-card border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-[#0f172a] overflow-hidden relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none" />
        
        <div className="relative z-10 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#7c5bf9] to-[#00d4ff] flex-shrink-0">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          
          <div className="space-y-4 flex-1">
            <div>
              <h4 className="font-bold text-[#f0f0ff] flex items-center gap-2">
                Need a hand?
              </h4>
              <p className="text-sm text-[#8888b0] mt-1 leading-relaxed">
                You've been on this section for a while. We can adjust the text or take a quick brain break.
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => handleAction(onSimplify)}
                className="flex-1 bg-gradient-to-r from-[#7c5bf9] to-[#e040fb] text-white hover:opacity-90 transition-opacity border-none shadow-lg shadow-purple-500/20"
              >
                <Zap className="w-3 h-3 mr-1.5" /> Simplify
              </Button>
              
              <Button 
                size="sm"
                variant="outline"
                onClick={() => handleAction(onTakeBreak)}
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#8888b0', background: 'transparent' }}
                className="flex-1 hover:bg-white/5 transition-colors"
              >
                <Coffee className="w-3 h-3 mr-1.5" /> Break
              </Button>
            </div>
            
            {/* Dismiss button */}
            <div className="pt-2 text-center">
              <button 
                onClick={() => setShowNudge(false)}
                className="text-[10px] uppercase tracking-widest text-[#555580] hover:text-[#8888b0] transition-colors font-bold"
              >
                No thanks, I'm good
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
