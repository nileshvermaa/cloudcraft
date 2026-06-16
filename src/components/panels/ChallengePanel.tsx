'use client';

import { Target, Clock, DollarSign, Shield, Wifi, Zap } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatRps, formatMs, formatUsd } from '@/lib/utils';

export function ChallengePanel() {
  const { scenario } = useGameStore();
  if (!scenario) return null;

  const constraints = [
    { icon: <Zap size={11} />,        label: 'Target RPS',  value: formatRps(scenario.targetRps),                        color: '#14B8A6' },
    { icon: <Clock size={11} />,      label: 'Max Latency', value: `< ${formatMs(scenario.maxLatencyMs)}`,               color: '#06B6D4' },
    { icon: <DollarSign size={11} />, label: 'Budget',      value: formatUsd(scenario.budgetUsd),                        color: '#3B82F6' },
    { icon: <Shield size={11} />,     label: 'SLA Required', value: `${(scenario.slaAvailability * 100).toFixed(2)}%`,    color: '#8B5CF6' },
    { icon: <Wifi size={11} />,       label: 'Read Share',  value: `${Math.round(scenario.readShare * 100)}%`,           color: '#D946EF' },
    { icon: <Target size={11} />,     label: 'Static CDN',  value: `${Math.round(scenario.staticShare * 100)}%`,         color: '#6366F1' },
  ];

  const diffColor: Record<string, string> = {
    Beginner:     '#22C55E',
    Intermediate: '#3B82F6',
    Advanced:     '#F59E0B',
    Expert:       '#EF4444',
  };

  const diffPips: Record<string, number> = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    Expert: 4,
  };

  const pips = diffPips[scenario.difficulty] ?? 1;
  const pipColor = diffColor[scenario.difficulty];

  return (
    <div className="p-4 border-b border-[var(--color-chrome-border)] bg-slate-950/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-bold text-[var(--color-chrome-text)]/80 uppercase tracking-wider">
          Mission Objective
        </h3>
        
        {/* Diamond pips */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 border border-[var(--color-chrome-border)] px-2 py-0.5 rounded">
          <span className="text-[9px] font-black uppercase mr-0.5" style={{ color: pipColor }}>
            {scenario.difficulty}
          </span>
          <span className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rotate-45 border"
                style={{
                  backgroundColor: i <= pips ? pipColor : 'transparent',
                  borderColor: i <= pips ? pipColor : 'rgba(168, 180, 200, 0.3)',
                }}
              />
            ))}
          </span>
        </div>
      </div>

      {/* Title + brief */}
      <h4
        className="text-[14px] font-black text-[var(--color-chrome-bright)] mb-1.5 leading-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {scenario.title}
      </h4>
      <p className="text-[10.5px] text-[var(--color-chrome-text)]/85 leading-relaxed mb-4">
        {scenario.brief}
      </p>

      {/* Constraint grid */}
      <div className="grid grid-cols-2 gap-2">
        {constraints.map(({ icon, label, value, color }) => (
          <div
            key={label}
            className="px-2.5 py-2 rounded-lg border border-[var(--color-chrome-border)] bg-[var(--color-chrome-soft)]/40 hover:bg-[var(--color-chrome-soft)]/70 hover:border-slate-600/50 transition-all duration-100"
          >
            <div className="flex items-center gap-1.5 mb-1" style={{ color }}>
              {icon}
              <span className="text-[8px] font-black uppercase tracking-wider text-[var(--color-chrome-text)]/75">
                {label}
              </span>
            </div>
            <div 
              className="text-[11.5px] font-extrabold text-[var(--color-chrome-bright)] tracking-wide" 
              style={{ fontFamily: 'var(--font-jetbrains)' }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Flags */}
      <div className="flex gap-2 mt-3.5">
        {scenario.requiresHA && (
          <span className="text-[8px] px-2 py-0.5 rounded-md bg-amber-950/40 text-amber-400 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)] font-extrabold uppercase tracking-wider">
            HA Required
          </span>
        )}
        {scenario.requiresPersistence && (
          <span className="text-[8px] px-2 py-0.5 rounded-md bg-blue-950/40 text-blue-400 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.1)] font-extrabold uppercase tracking-wider">
            DB Required
          </span>
        )}
      </div>
    </div>
  );
}
