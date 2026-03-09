'use client';

import React, { useState, useEffect } from 'react';

interface ReadingRulerProps {
  visible: boolean;
  color?: string;
}

export function ReadingRuler({ visible, color = 'rgba(251, 191, 36, 0.3)' }: ReadingRulerProps) {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed left-0 right-0 h-16 pointer-events-none z-40 transition-opacity"
      style={{
        top: `${position - 32}px`,
        backgroundColor: color,
        borderTop: '2px dashed rgba(251, 146, 60, 0.5)',
        borderBottom: '2px dashed rgba(251, 146, 60, 0.5)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    />
  );
}
