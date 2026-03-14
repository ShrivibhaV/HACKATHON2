'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PreSessionChecklistProps {
  onComplete: () => void;
  onCancel: () => void;
}

const CHECKLIST_ITEMS = [
  { id: 'silent', label: 'Put phone on silent' },
  { id: 'tabs', label: 'Close other browser tabs' },
  { id: 'dnd', label: 'Enable Do Not Disturb on your device' },
  { id: 'snacks', label: 'Get water or snacks ready' },
];

export function PreSessionChecklist({ onComplete, onCancel }: PreSessionChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPercentage = (completedCount / totalCount) * 100;
  const isAllChecked = completedCount === totalCount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-in">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
            PRE-SESSION CHECKLIST
          </h2>
          <p className="text-slate-900 dark:text-slate-100 font-medium">
            Let's get ready for optimal focus.
          </p>
        </div>

        {/* Checklist */}
        <div className="p-6 space-y-4">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = checkedItems[item.id] || false;
            
            return (
              <label 
                key={item.id} 
                className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                  isChecked ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="relative flex items-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={isChecked} 
                    onChange={() => toggleItem(item.id)} 
                  />
                  <div 
                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors border ${
                      isChecked 
                        ? 'bg-indigo-500 border-indigo-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>
                </div>
                
                <span 
                  className={`text-sm font-medium transition-all ${
                    isChecked 
                      ? 'text-slate-500 dark:text-slate-400 line-through' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>

        {/* Footer / Progress */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <div className="mb-6">
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs font-medium text-slate-500">
              {completedCount} of {totalCount} ready
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 border-slate-200 dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button 
              disabled={!isAllChecked}
              onClick={onComplete}
              className={`flex-1 font-semibold ${
                isAllChecked 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
              }`}
            >
              Start Focus Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
