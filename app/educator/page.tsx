'use client';

import React from 'react';
import { useProfile } from '@/lib/profile-context';
import { EducatorChat } from '@/components/educator/EducatorChat';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, BookOpen } from 'lucide-react';

export default function EducatorPage() {
  const { profile } = useProfile();

  if (!profile) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50 dark:to-purple-950 flex items-center justify-center p-4">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <Lightbulb className="w-12 h-12 mx-auto text-orange-600" />
          <h2 className="text-2xl font-bold">Set Up Your Profile First</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please complete the onboarding to access your personalized AI educator
          </p>
          <Button
            className="w-full bg-orange-600"
            onClick={() => (window.location.href = '/onboarding')}
          >
            Start Onboarding
          </Button>
        </Card>
      </main>
    );
  }

  const sampleContent = `Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. 
  This occurs in the chloroplasts of plant cells. The light-dependent reactions use sunlight to create ATP and NADPH. 
  The light-independent reactions (Calvin cycle) use these energy carriers to produce glucose from carbon dioxide.`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50 dark:to-purple-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
            AI Educator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Ask me anything about your learning material. I'll explain it in a way that works for your learning style.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <EducatorChat
              studentProfile={profile}
              contentContext={sampleContent}
            />
          </div>

          {/* Sidebar - Tips & Features */}
          <div className="space-y-4">
            {/* Learning Profile */}
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-lg">Your Profile</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Learning Mode</p>
                  <p className="font-semibold capitalize text-orange-600">
                    {profile.preferredMode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Reading Speed</p>
                  <p className="font-semibold capitalize">{profile.readingSpeed}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Focus Preference</p>
                  <p className="font-semibold capitalize">{profile.focusSpan}</p>
                </div>
              </div>
            </Card>

            {/* Features */}
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-lg">How to Use</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-xl">🎤</span>
                  <p>
                    <strong>Voice Input:</strong> Click the microphone to ask questions by voice
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">📝</span>
                  <p>
                    <strong>Type Questions:</strong> Type your question in the text field
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🧠</span>
                  <p>
                    <strong>Personalized:</strong> Responses adapt to your learning style
                  </p>
                </div>
              </div>
            </Card>

            {/* Question Suggestions */}
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-lg">Try These Questions</h3>
              <div className="space-y-2">
                {profile.preferredMode === 'dyslexia' && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2 px-3 text-sm"
                      onClick={() => {
                        // Trigger question in chat
                        const chatInput = document.querySelector(
                          'input[placeholder*="type your question"]'
                        ) as HTMLInputElement;
                        if (chatInput) {
                          chatInput.value = 'Can you explain photosynthesis in simple words?';
                          chatInput.focus();
                        }
                      }}
                    >
                      "Can you explain photosynthesis simply?"
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2 px-3 text-sm"
                      onClick={() => {
                        const chatInput = document.querySelector(
                          'input[placeholder*="type your question"]'
                        ) as HTMLInputElement;
                        if (chatInput) {
                          chatInput.value = 'What does chlorophyll do?';
                          chatInput.focus();
                        }
                      }}
                    >
                      "What does chlorophyll do?"
                    </Button>
                  </>
                )}

                {profile.preferredMode === 'adhd' && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2 px-3 text-sm"
                      onClick={() => {
                        const chatInput = document.querySelector(
                          'input[placeholder*="type your question"]'
                        ) as HTMLInputElement;
                        if (chatInput) {
                          chatInput.value = 'What are the 3 main steps?';
                          chatInput.focus();
                        }
                      }}
                    >
                      "What are the 3 main steps?"
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2 px-3 text-sm"
                      onClick={() => {
                        const chatInput = document.querySelector(
                          'input[placeholder*="type your question"]'
                        ) as HTMLInputElement;
                        if (chatInput) {
                          chatInput.value = 'Why is this important?';
                          chatInput.focus();
                        }
                      }}
                    >
                      "Why is this important?"
                    </Button>
                  </>
                )}

                {profile.preferredMode === 'standard' && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2 px-3 text-sm"
                      onClick={() => {
                        const chatInput = document.querySelector(
                          'input[placeholder*="type your question"]'
                        ) as HTMLInputElement;
                        if (chatInput) {
                          chatInput.value = 'How does photosynthesis work?';
                          chatInput.focus();
                        }
                      }}
                    >
                      "How does photosynthesis work?"
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2 px-3 text-sm"
                      onClick={() => {
                        const chatInput = document.querySelector(
                          'input[placeholder*="type your question"]'
                        ) as HTMLInputElement;
                        if (chatInput) {
                          chatInput.value = 'Can you give an example?';
                          chatInput.focus();
                        }
                      }}
                    >
                      "Can you give an example?"
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
