'use client';

import React, { useState, useEffect } from 'react';

interface ReadingRulerProps {
  visible: boolean;
  color?: string;
}

export function ReadingRuler({ visible, color = 'rgba(124, 91, 249, 0.2)' }: ReadingRulerProps) {
  const [position, setPosition] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!visible || isLocked) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [visible, isLocked]);

  useEffect(() => {
    if (!visible) return;

    const handleClick = () => {
      setIsLocked(!isLocked);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [visible, isLocked]);

  if (!visible) return null;

  return (
    <div
      className={`fixed left-0 right-0 h-12 z-40 transition-all duration-150 border-y-2 border-dashed ${
        isLocked ? 'border-[#7c5bf9] bg-[#7c5bf9]/10' : 'border-white/20'
      }`}
      style={{
        top: `${position - 24}px`,
        backgroundColor: color,
        boxShadow: isLocked ? '0 0 15px rgba(124, 91, 249, 0.3)' : 'none',
        cursor: 'ns-resize'
      }}
    >
      <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/50 uppercase tracking-tight">
        {isLocked ? '🔒 Locked' : '🖱️ Follow'}
      </div>
    </div>
  );
}
