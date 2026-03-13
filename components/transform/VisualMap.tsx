'use client';

/**
 * VisualMap.tsx
 * Smart grouped concept map — groups keyTerms into categories,
 * renders an interactive SVG radial map with filter chips.
 * Zero API calls, works instantly.
 */

import React, { useRef, useState, useMemo } from 'react';

interface KeyTerm {
  term: string;
  explanation: string;
}

interface VisualMapProps {
  title: string;
  keyTerms: KeyTerm[];
  rawText: string;
}

const GROUP_CONFIG = [
  { label: 'Core', color: '#534AB7', light: 'rgba(83,74,183,0.12)', border: '#7c5bf9', keywords: ['main', 'central', 'primary', 'core', 'key', 'fundamental', 'basic', 'essential'] },
  { label: 'Process', color: '#0F6E56', light: 'rgba(15,110,86,0.12)', border: '#1D9E75', keywords: ['process', 'cycle', 'reaction', 'stage', 'phase', 'step', 'convert', 'produce', 'generate', 'form', 'occur'] },
  { label: 'Structure', color: '#185FA5', light: 'rgba(24,95,165,0.12)', border: '#378ADD', keywords: ['cell', 'structure', 'organ', 'system', 'layer', 'membrane', 'part', 'contain', 'region', 'area', 'zone', 'molecule', 'atom'] },
  { label: 'Outcome', color: '#854F0B', light: 'rgba(133,79,11,0.12)', border: '#EF9F27', keywords: ['result', 'output', 'product', 'effect', 'cause', 'lead', 'create', 'release', 'enable', 'allow', 'provide'] },
];

function categoriseTerm(term: string, explanation: string): number {
  const text = (term + ' ' + explanation).toLowerCase();
  let best = 0, bestScore = -1;
  GROUP_CONFIG.forEach((g, i) => {
    const score = g.keywords.filter(k => text.includes(k)).length;
    if (score > bestScore) { bestScore = score; best = i; }
  });
  return best;
}

export function VisualMap({ title, keyTerms }: VisualMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; term: string; def: string } | null>(null);
  const [activeGroup, setActiveGroup] = useState<number | null>(null);

  const W = 680, H = 420, cx = W / 2, cy = H / 2, R = 150;

  const grouped = useMemo(() => {
    return keyTerms.slice(0, 8).map((t, i) => ({
      ...t,
      groupIdx: categoriseTerm(t.term, t.explanation),
      origIdx: i,
    }));
  }, [keyTerms]);

  const visible = activeGroup !== null
    ? grouped.filter(t => t.groupIdx === activeGroup)
    : grouped;

  const nodes = visible.map((t, i) => {
    const angle = (2 * Math.PI * i / visible.length) - Math.PI / 2;
    return { ...t, x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
  });

  const truncate = (s: string, max = 16) => s.length > max ? s.slice(0, max - 1) + '…' : s;
  const splitLabel = (s: string) => {
    const t = truncate(s);
    if (t.length <= 11) return [t];
    const mid = t.lastIndexOf(' ', 11);
    return mid > 0 ? [t.slice(0, mid), t.slice(mid + 1)] : [t.slice(0, 11), t.slice(11)];
  };

  const handleMouseEnter = (e: React.MouseEvent<SVGGElement>, i: number) => {
    setHovered(i);
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, term: nodes[i].term, def: nodes[i].explanation });
  };
  const handleMouseMove = (e: React.MouseEvent<SVGGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip(t => t ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
  };
  const handleMouseLeave = () => { setHovered(null); setTooltip(null); };

  const usedGroups = GROUP_CONFIG
    .map((g, i) => ({ ...g, i, count: grouped.filter(t => t.groupIdx === i).length }))
    .filter(g => g.count > 0);

  return (
    <div className="glass-card overflow-hidden" style={{ border: '1px solid rgba(124,91,249,0.25)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(124,91,249,0.15)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)' }}>🗺️</div>
        <div>
          <p className="font-bold text-sm text-[#f0f0ff]">Visual Concept Map</p>
          <p className="text-xs text-[#8888b0] truncate max-w-[220px]">{title}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 flex-wrap justify-end">
          <button onClick={() => setActiveGroup(null)}
            className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
            style={activeGroup === null
              ? { background: '#7c5bf9', color: '#fff', border: '1px solid #7c5bf9' }
              : { background: 'transparent', color: '#8888b0', border: '1px solid rgba(255,255,255,0.1)' }}>
            All
          </button>
          {usedGroups.map(g => (
            <button key={g.i} onClick={() => setActiveGroup(activeGroup === g.i ? null : g.i)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
              style={activeGroup === g.i
                ? { background: g.color, color: '#fff', border: `1px solid ${g.color}` }
                : { background: 'transparent', color: g.border, border: `1px solid ${g.border}55` }}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG map */}
      <div className="relative px-4 pt-4 pb-2 flex justify-center">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%"
          style={{ maxHeight: 420, fontFamily: 'Lexend, system-ui, sans-serif', overflow: 'visible' }}>
          <defs>
            <filter id="vm-glow">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="vm-center">
              <stop offset="0%" stopColor="#9d7dff" />
              <stop offset="100%" stopColor="#5a3fc0" />
            </radialGradient>
            <pattern id="vm-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(124,91,249,0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>

          <rect width={W} height={H} rx="12" fill="rgba(10,10,36,0.5)" />
          <rect width={W} height={H} rx="12" fill="url(#vm-grid)" />

          {/* Sector backgrounds */}
          {activeGroup === null && usedGroups.map(g => {
            const groupNodes = nodes.filter(n => n.groupIdx === g.i);
            if (groupNodes.length === 0) return null;
            const idxs = groupNodes.map(n => nodes.indexOf(n));
            const first = idxs[0], last = idxs[idxs.length - 1];
            const total = nodes.length;
            const a1 = (2 * Math.PI * first / total) - Math.PI / 2 - (Math.PI / total);
            const a2 = (2 * Math.PI * (last + 1) / total) - Math.PI / 2 - (Math.PI / total);
            const r1 = 56, r2 = 186;
            const large = (a2 - a1) > Math.PI ? 1 : 0;
            const d = `M${cx + r1 * Math.cos(a1)},${cy + r1 * Math.sin(a1)} A${r1},${r1} 0 ${large} 1 ${cx + r1 * Math.cos(a2)},${cy + r1 * Math.sin(a2)} L${cx + r2 * Math.cos(a2)},${cy + r2 * Math.sin(a2)} A${r2},${r2} 0 ${large} 0 ${cx + r2 * Math.cos(a1)},${cy + r2 * Math.sin(a1)} Z`;
            return <path key={g.i} d={d} fill={g.light} opacity="0.7" />;
          })}

          {/* Connector lines */}
          {nodes.map((node, i) => {
            const g = GROUP_CONFIG[node.groupIdx];
            return <line key={`l${i}`} x1={cx} y1={cy} x2={node.x} y2={node.y}
              stroke={hovered === i ? g.border : 'rgba(124,91,249,0.2)'}
              strokeWidth={hovered === i ? 1.5 : 1}
              strokeDasharray={hovered === i ? 'none' : '4 4'}
              style={{ transition: 'all .2s' }} />;
          })}

          {/* Outer nodes */}
          {nodes.map((node, i) => {
            const g = GROUP_CONFIG[node.groupIdx];
            const isHov = hovered === i;
            const lines = splitLabel(node.term);
            return (
              <g key={`n${i}`} style={{ cursor: 'pointer' }}
                onMouseEnter={e => handleMouseEnter(e, i)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}>
                {isHov && <circle cx={node.x} cy={node.y} r={42} fill="none"
                  stroke={g.color} strokeWidth={10} opacity={0.2} filter="url(#vm-glow)" />}
                <circle cx={node.x} cy={node.y} r={isHov ? 36 : 32}
                  fill={isHov ? g.color : 'rgba(15,10,45,0.95)'}
                  stroke={g.border} strokeWidth={isHov ? 2 : 1.5}
                  style={{ transition: 'all .2s' }} />
                <circle cx={node.x} cy={node.y - (isHov ? 20 : 18)} r={3.5} fill={g.border} opacity={isHov ? 1 : 0.7} />
                {lines.map((line, li) => (
                  <text key={li} x={node.x} textAnchor="middle"
                    y={node.y + (lines.length === 1 ? 5 : li === 0 ? -1 : 12)}
                    fill={isHov ? '#fff' : g.border}
                    fontSize={lines.length > 1 ? 10 : 11} fontWeight="600"
                    style={{ transition: 'fill .2s', userSelect: 'none' }}>{line}</text>
                ))}
              </g>
            );
          })}

          {/* Group labels at perimeter */}
          {activeGroup === null && usedGroups.map(g => {
            const groupNodes = nodes.filter(n => n.groupIdx === g.i);
            if (groupNodes.length === 0) return null;
            const midX = groupNodes.reduce((s, n) => s + n.x, 0) / groupNodes.length;
            const midY = groupNodes.reduce((s, n) => s + n.y, 0) / groupNodes.length;
            const dx = midX - cx, dy = midY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const lx = cx + (dx / dist) * 212;
            const ly = cy + (dy / dist) * 212;
            return <text key={g.i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
              fill={g.border} fontSize={10} fontWeight="700" letterSpacing="0.8"
              style={{ userSelect: 'none' }}>{g.label.toUpperCase()}</text>;
          })}

          {/* Centre node */}
          <circle cx={cx} cy={cy} r={54} fill="rgba(124,91,249,0.08)" stroke="rgba(124,91,249,0.18)" strokeWidth={1} />
          <circle cx={cx} cy={cy} r={44} fill="url(#vm-center)" filter="url(#vm-glow)" />
          {(() => {
            const label = truncate(title, 18);
            const lines = label.length > 10
              ? [label.slice(0, Math.ceil(label.length / 2)), label.slice(Math.ceil(label.length / 2))]
              : [label];
            return lines.map((l, i) => (
              <text key={i} x={cx} y={cy + (lines.length === 1 ? 5 : i === 0 ? -3 : 13)}
                textAnchor="middle" fill="#fff" fontSize={12} fontWeight="700"
                style={{ userSelect: 'none' }}>{l}</text>
            ));
          })()}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div className="absolute z-20 pointer-events-none max-w-[200px] p-3 rounded-xl text-xs"
            style={{
              left: Math.min(tooltip.x + 14, 460),
              top: Math.max(tooltip.y - 70, 4),
              background: 'rgba(16,10,46,0.97)',
              border: '1px solid rgba(124,91,249,0.4)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)',
            }}>
            <p className="font-bold mb-1" style={{ color: '#a78bfa' }}>{tooltip.term}</p>
            <p className="leading-relaxed" style={{ color: '#c0c0e0' }}>{tooltip.def}</p>
          </div>
        )}
      </div>

      {/* Legend pills */}
      <div className="px-5 pb-4 pt-1 flex flex-wrap gap-2" style={{ borderTop: '1px solid rgba(124,91,249,0.08)' }}>
        <span className="text-xs text-[#444466] w-full">Hover a node to see its definition:</span>
        {nodes.map((node, i) => {
          const g = GROUP_CONFIG[node.groupIdx];
          return (
            <span key={i}
              className="px-2.5 py-1 rounded-full text-xs font-medium cursor-default transition-all"
              style={{
                background: hovered === i ? `${g.color}33` : g.light,
                color: g.border,
                border: `1px solid ${hovered === i ? g.border : `${g.border}44`}`,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}>{node.term}</span>
          );
        })}
      </div>
    </div>
  );
}