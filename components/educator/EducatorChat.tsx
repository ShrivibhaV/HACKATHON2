'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VoiceInput } from './VoiceInput';
import { getTutorResponse } from '@/lib/openai-integration';
import { StudentProfile, LearningMode } from '@/lib/types';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EducatorChatProps {
  studentProfile: StudentProfile;
  contentContext?: string;
  injectedQuestion?: string;
}

export function EducatorChat({ studentProfile, contentContext = '', injectedQuestion }: EducatorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi there! I'm your AI educator. I'm here to help you understand the material better. Feel free to ask me any questions about what you're learning. You can type your question or use the voice input to speak to me.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevInjected = useRef<string | undefined>(undefined);

  // Auto-inject question from parent when it changes
  useEffect(() => {
    if (injectedQuestion && injectedQuestion !== prevInjected.current) {
      prevInjected.current = injectedQuestion;
      handleSendMessage(injectedQuestion);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [injectedQuestion]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (question: string) => {
    if (!question.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get AI response
      const response = await getTutorResponse(question, contentContext, {
        preferredMode: studentProfile.preferredMode,
        readingSpeed: studentProfile.readingSpeed,
        focusSpan: studentProfile.focusSpan,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[v0] Failed to get tutor response:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content:
          "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getModeSpecificPrompt = () => {
    switch (studentProfile.preferredMode) {
      case 'dyslexia':
        return 'Try asking: "Can you explain photosynthesis in simple words?"';
      case 'adhd':
        return 'Try asking: "What are the 3 main steps of photosynthesis?"';
      default:
        return 'Try asking: "How does photosynthesis work?"';
    }
  };

  return (
    <Card className="flex flex-col h-full max-h-96 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.role === 'user'
                    ? 'text-purple-100'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3">
        {/* Voice Input */}
        <VoiceInput onTranscript={handleSendMessage} isLoading={isLoading} />

        {/* Text Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSendMessage(inputValue);
              }
            }}
            placeholder="Or type your question..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Suggestion */}
        <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
          {getModeSpecificPrompt()}
        </p>
      </div>
    </Card>
  );
}
