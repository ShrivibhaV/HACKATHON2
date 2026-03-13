'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isLoading?: boolean;
}

export function VoiceInput({ onTranscript, isLoading = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError('Speech recognition not supported in your browser');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + transcript);
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognition.onerror = (event: any) => {
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error accessing microphone');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSend = () => {
    if (transcript.trim()) {
      onTranscript(transcript);
      setTranscript('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Transcript Display */}
      {transcript && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-slate-700 dark:text-slate-300">{transcript}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isListening ? (
          <Button
            onClick={startListening}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={isLoading}
          >
            <Mic className="w-4 h-4 mr-2" />
            Speak
          </Button>
        ) : (
          <Button
            onClick={stopListening}
            variant="default"
            size="sm"
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}

        {transcript && (
          <Button
            onClick={handleSend}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400">
        {isListening ? '🎤 Listening... Speak now' : 'Click the microphone to ask your question'}
      </p>
    </div>
  );
}
