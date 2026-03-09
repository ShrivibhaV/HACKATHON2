'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProfile } from '@/lib/profile-context';
import { transformTextWithAI } from '@/lib/openai-integration';
import { transformTextForLearner } from '@/lib/text-transformers';
import { BeforeAfterToggle } from '@/components/transform/BeforeAfterToggle';
import { LearningMode, TextTransformationResult } from '@/lib/types';
import { Sparkles, Loader2, Copy, Download } from 'lucide-react';

const SAMPLE_TEXTS = {
  photosynthesis: {
    title: '🌿 Photosynthesis',
    description: 'Complex biochemical process',
    text: `Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. This process occurs primarily in the leaves of plants, specifically in structures called chloroplasts that contain the pigment chlorophyll. During the light-dependent reactions, chlorophyll absorbs photons from sunlight and transfers their energy to electrons. These high-energy electrons are used to generate adenosine triphosphate (ATP) and nicotinamide adenine dinucleotide phosphate (NADPH), which are energy carriers. Subsequently, during the light-independent reactions, also known as the Calvin cycle, these energy carriers are utilized to convert carbon dioxide into glucose through a series of enzymatic reactions.`,
  },
  waterCycle: {
    title: '💧 Water Cycle',
    description: 'Earth science concept',
    text: `The hydrological cycle, commonly called the water cycle, describes the continuous movement of water between the Earth's surface and the atmosphere. Water undergoes phase transitions through evaporation, where solar radiation causes water from oceans, lakes, and soil to transform into water vapor. This water vapor rises through the atmosphere, and as it encounters cooler air at higher altitudes, condensation occurs, forming water droplets that constitute clouds. Precipitation subsequently returns this water to Earth's surface as rain, snow, or hail. The water that falls on land may infiltrate the soil and replenish groundwater aquifers, percolate into underground reservoirs, or run off into rivers and streams that ultimately return to the ocean.`,
  },
  humanBrain: {
    title: '🧠 Human Brain',
    description: 'Neuroscience overview',
    text: `The human brain is a complex organ comprising approximately 86 billion neurons interconnected through trillions of synaptic connections. These neurons communicate through electrochemical processes, transmitting signals across synaptic gaps via neurotransmitters. The brain's structure can be delineated into several primary divisions: the cerebrum, which orchestrates higher cognitive functions such as reasoning and language; the cerebellum, which coordinates motor control and balance; and the brainstem, which regulates vital autonomous functions including respiration and cardiovascular regulation. The cerebral cortex, the brain's outermost layer, exhibits functional specialization across distinct regions termed Brodmann areas, each specializing in particular sensory, motor, or cognitive processes.`,
  },
  climate: {
    title: '🌍 Climate Change',
    description: 'Environmental science',
    text: `Climate change, characterized by long-term alterations in global temperature and precipitation patterns, is primarily attributed to anthropogenic emissions of greenhouse gases. The greenhouse effect occurs when atmospheric gases such as carbon dioxide, methane, and nitrous oxide absorb thermal radiation reflected from Earth's surface, causing atmospheric warming. Industrialization has substantially increased atmospheric CO2 concentrations from approximately 280 parts per million in pre-industrial times to over 420 ppm today. This elevated concentration enhances the greenhouse effect, resulting in global mean surface temperature increases. The consequences of climate change encompass rising sea levels, intensification of extreme weather phenomena, ecosystem disruption, and agricultural implications that threaten global food security.`,
  },
};

export default function TransformPage() {
  const { profile } = useProfile();
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<LearningMode>('dyslexia');
  const [result, setResult] = useState<TextTransformationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dominantMode = profile
    ? profile.weightedProfile.dyslexia > profile.weightedProfile.adhd
      ? 'dyslexia'
      : 'adhd'
    : 'standard';

  const handleLoadSample = (key: keyof typeof SAMPLE_TEXTS) => {
    setInputText(SAMPLE_TEXTS[key].text);
    setResult(null);
  };

  const handleTransform = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to transform');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to use AI, fall back to local processing if API fails
      let transformResult: TextTransformationResult;
      try {
        transformResult = await transformTextWithAI(inputText, selectedMode as 'dyslexia' | 'adhd' | 'simplified');
      } catch (apiError) {
        console.log('[v0] AI API failed, using local processing');
        transformResult = transformTextForLearner(inputText, selectedMode);
      }

      setResult(transformResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transformation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.transformed);
      alert('Copied to clipboard!');
    } catch {
      console.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      `data:text/plain;charset=utf-8,${encodeURIComponent(result.transformed)}`
    );
    element.setAttribute('download', 'adapted-text.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50 dark:to-purple-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Transform Any Text
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Paste any educational content and watch it adapt to your learning style in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Selector */}
            <Card className="p-6 space-y-4">
              <label className="font-semibold text-lg">How should we adapt this text?</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['standard', 'dyslexia', 'adhd'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={selectedMode === mode ? 'default' : 'outline'}
                    className={
                      selectedMode === mode
                        ? mode === 'dyslexia'
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'bg-purple-600 hover:bg-purple-700'
                        : ''
                    }
                    onClick={() => setSelectedMode(mode)}
                  >
                    {mode === 'dyslexia'
                      ? '📖 Dyslexia'
                      : mode === 'adhd'
                        ? '⚡ ADHD'
                        : '📚 Standard'}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Text Input */}
            <Card className="p-6 space-y-4">
              <label className="font-semibold text-lg">Paste Your Text Here</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste any educational text — a textbook paragraph, Wikipedia excerpt, course note, anything dense and hard to read..."
                className="w-full h-48 p-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {inputText.length} characters
              </div>
            </Card>

            {/* Transform Button */}
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold h-12 text-lg"
              onClick={handleTransform}
              disabled={loading || !inputText.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Transforming...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Transform Text
                </>
              )}
            </Button>

            {error && (
              <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </Card>
            )}
          </div>

          {/* Sample Texts Panel */}
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Try a Sample</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Click a sample to load it and see transformation in action
              </p>
              <div className="space-y-2">
                {Object.entries(SAMPLE_TEXTS).map(([key, sample]) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4 text-left"
                    onClick={() => handleLoadSample(key as keyof typeof SAMPLE_TEXTS)}
                  >
                    <div>
                      <p className="font-medium text-sm">{sample.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {sample.description}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-12 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Your Adapted Text</h2>
              <p className="text-slate-600 dark:text-slate-400">
                The transformation shows {selectedMode === 'dyslexia' ? 'Bionic Reading' : selectedMode === 'adhd' ? 'chunked, simplified content' : 'simplified vocabulary'}
              </p>
            </div>

            <BeforeAfterToggle
              original={result.original}
              transformed={result.transformed}
              mode={selectedMode}
              bionicReading={result.bionicReading}
            />

            {/* Actions */}
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={handleCopy} variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Copy Adapted Text
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Key Terms */}
            {result.keyTerms.length > 0 && (
              <Card className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">📚 Key Terms</h3>
                <div className="space-y-3">
                  {result.keyTerms.map((term, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <p className="font-semibold text-sm text-purple-600 dark:text-purple-400">
                        {term.term}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                        {term.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Quiz */}
            {result.quiz.length > 0 && (
              <Card className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">🎯 Quick Check</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Answer these questions to test your understanding
                </p>
                <div className="space-y-4">
                  {result.quiz.map((q, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <p className="font-medium mb-3">{idx + 1}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((option, optIdx) => (
                          <label key={optIdx} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${idx}`}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
