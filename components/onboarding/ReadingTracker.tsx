'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface ReadingTrackerProps {
  onComplete: (stats: { scrollCount: number; timeSpent: number; reReads: number }) => void;
}

export function ReadingTracker({ onComplete }: ReadingTrackerProps) {
  const [timeSpent, setTimeSpent] = useState(0);
  const [scrollCount, setScrollCount] = useState(0);
  const [reReads, setReReads] = useState(0);
  const startTime = useRef(Date.now());
  const lastScrollY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);

    const handleScroll = () => {
      if (!containerRef.current) return;
      const currentY = containerRef.current.scrollTop;
      setScrollCount(prev => prev + 1);
      
      // If scrolling UP significantly, count as a re-read
      if (currentY < lastScrollY.current - 50) {
        setReReads(prev => prev + 1);
      }
      lastScrollY.current = currentY;
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(interval);
      container?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold mb-3">
          <span className="gradient-text">Reading Pattern</span>
        </h2>
        <p className="text-[#8888b0] max-w-md mx-auto">
          Take a moment to read this scientific extract. We're observing how your eyes naturally navigate dense information.
        </p>
      </div>

      <div 
        ref={containerRef}
        className="glass-card p-8 h-[300px] overflow-y-auto custom-scrollbar leading-relaxed text-[#c0c0e0] space-y-4"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <p>
          Photosynthesis is a multi-stage biochemical process through which photoautotrophic organisms, primarily terrestrial plants and phytoplankton, transduce solar electromagnetic radiation into stored chemical enthalpy within the covalent bonds of carbohydrate molecules. 
        </p>
        <p>
          This complex transformation occurs within specialized organelle structures known as chloroplasts, specifically localized in the thylakoid membrane systems. The light-dependent reactions utilize photosystem II and photosystem I complexes to initiate an electron transport chain, facilitating the photolysis of water molecules and the concomitant generation of ATP and NADPH.
        </p>
        <p>
          Subsequently, the light-independent Calvin Cycle utilizes these high-energy intermediates to achieve carbon fixation, enzymatically converting inorganic CO2 into organic triose phosphates via the catalytic action of RuBisCO. This fundamental process not only sustains the primary productivity of global biomes but also maintains the atmospheric equilibrium by sequestering carbon and liberating oxygen gas as a byproduct.
        </p>
        <div className="h-4" /> {/* Spacer to ensure scrollability */}
      </div>

      <div className="flex justify-between items-center text-xs text-[#555580] px-2 font-mono">
        <span>POLLING: ACTIVE</span>
        <span>TIME: {timeSpent}s</span>
        <span>VELOCITY: {Math.min(100, scrollCount)}%</span>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={() => onComplete({ scrollCount, timeSpent, reReads })}
          className="glow-btn px-10"
        >
          Finished Reading →
        </Button>
      </div>
    </div>
  );
}
