'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface MermaidMapProps {
    title: string;
    rawText: string;
    keyTerms?: { term: string; explanation: string }[];
}

export function MermaidMap({ title, rawText, keyTerms = [] }: MermaidMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'rendered' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [zoom, setZoom] = useState(1);

    const generate = async () => {
        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/napkin/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: rawText }),
            });

            const data = await res.json();

            if (!res.ok || !data.mermaidCode) {
                throw new Error(data.error || 'Failed to generate diagram');
            }

            // Dynamically import mermaid only on client
            const mermaid = (await import('mermaid')).default;
            mermaid.initialize({
                startOnLoad: false,
                theme: 'base',
                themeVariables: {
                    // Purple/cyan palette to match NeuroLearn
                    primaryColor: '#7c5bf9',
                    primaryTextColor: '#f0f0ff',
                    primaryBorderColor: '#9d7dff',
                    lineColor: '#5544aa',
                    secondaryColor: '#1a1a3e',
                    tertiaryColor: '#0d0d2a',
                    background: '#0d0d2a',
                    mainBkg: '#1a1040',
                    nodeBorder: '#7c5bf9',
                    clusterBkg: '#1a1040',
                    titleColor: '#f0f0ff',
                    edgeLabelBackground: '#1a1040',
                    fontFamily: 'Lexend, system-ui, sans-serif',
                    fontSize: '14px',
                },
                mindmap: {
                    padding: 16,
                    useMaxWidth: true,
                },
            });

            const id = `mermaid-${Date.now()}`;
            const { svg } = await mermaid.render(id, data.mermaidCode);

            if (containerRef.current) {
                containerRef.current.innerHTML = svg;
                // Make SVG responsive
                const svgEl = containerRef.current.querySelector('svg');
                if (svgEl) {
                    svgEl.style.width = '100%';
                    svgEl.style.height = 'auto';
                    svgEl.style.maxHeight = '480px';
                }
            }

            setStatus('rendered');
        } catch (err) {
            console.error('[MermaidMap]', err);
            setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
            setStatus('error');
        }
    };

    // Auto-generate on mount
    useEffect(() => {
        generate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rawText]);

    return (
        <div
            className="glass-card overflow-hidden"
            style={{ border: '1px solid rgba(124,91,249,0.25)' }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(124,91,249,0.15)' }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)' }}
                    >
                        🗺️
                    </div>
                    <div>
                        <p className="font-bold text-sm text-[#f0f0ff]">Visual Concept Map</p>
                        <p className="text-xs text-[#8888b0] truncate max-w-[240px]">{title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {status === 'rendered' && (
                        <>
                            <button
                                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                                className="p-1.5 rounded-lg text-[#8888b0] hover:text-white hover:bg-white/5 transition-colors"
                                title="Zoom out"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-[#555580] w-10 text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                                className="p-1.5 rounded-lg text-[#8888b0] hover:text-white hover:bg-white/5 transition-colors"
                                title="Zoom in"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </>
                    )}
                    <button
                        onClick={generate}
                        disabled={status === 'loading'}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-40"
                        style={{ background: 'rgba(124,91,249,0.15)', color: '#a78bfa', border: '1px solid rgba(124,91,249,0.3)' }}
                    >
                        <RefreshCw className={`w-3 h-3 ${status === 'loading' ? 'animate-spin' : ''}`} />
                        {status === 'loading' ? 'Generating...' : 'Regenerate'}
                    </button>
                </div>
            </div>

            {/* Diagram area */}
            <div className="p-5">
                {status === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
                            style={{ background: 'linear-gradient(135deg, rgba(124,91,249,0.3), rgba(0,212,255,0.2))' }}
                        >
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#7c5bf9' }} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-[#f0f0ff]">Building your concept map…</p>
                            <p className="text-xs text-[#8888b0] mt-1">Claude is analysing the key ideas</p>
                        </div>
                        {/* Skeleton shimmer */}
                        <div className="w-full max-w-sm space-y-2 mt-2">
                            {[80, 60, 70, 50].map((w, i) => (
                                <div
                                    key={i}
                                    className="h-3 rounded-full animate-pulse"
                                    style={{ width: `${w}%`, background: 'rgba(124,91,249,0.12)', margin: '0 auto' }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div
                        className="p-4 rounded-xl text-sm text-center space-y-3"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                        <p className="text-[#f87171]">⚠️ {errorMsg}</p>
                        <button
                            onClick={generate}
                            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                            style={{ background: 'rgba(124,91,249,0.15)', color: '#a78bfa', border: '1px solid rgba(124,91,249,0.3)' }}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Mermaid renders here */}
                <div
                    ref={containerRef}
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.2s ease',
                        display: status === 'rendered' ? 'block' : 'none',
                    }}
                />

                {/* Key terms legend */}
                {status === 'rendered' && keyTerms.length > 0 && (
                    <div
                        className="mt-4 pt-4 flex flex-wrap gap-2"
                        style={{ borderTop: '1px solid rgba(124,91,249,0.1)' }}
                    >
                        <span className="text-xs text-[#555580] w-full mb-1">Key concepts in this map:</span>
                        {keyTerms.slice(0, 6).map((t, i) => (
                            <span
                                key={i}
                                className="px-2.5 py-1 rounded-full text-xs font-medium"
                                style={{ background: 'rgba(124,91,249,0.1)', color: '#a78bfa', border: '1px solid rgba(124,91,249,0.2)' }}
                            >
                                {t.term}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}