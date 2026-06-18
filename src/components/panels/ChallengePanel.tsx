'use client';

import { Target, Clock, DollarSign, Shield, Wifi, Zap } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatRps, formatMs, formatUsd } from '@/lib/utils';

export function ChallengePanel() {
  const { scenario } = useGameStore();
  if (!scenario) return null;

  const constraints = [
    { icon: <Zap size={12} />,        label: 'Target RPS',  value: formatRps(scenario.targetRps),                     color: '#1DD3A0' },
    { icon: <Clock size={12} />,      label: 'Max Latency', value: `< ${formatMs(scenario.maxLatencyMs)}`,            color: '#22B8FF' },
    { icon: <DollarSign size={12} />, label: 'Budget',      value: formatUsd(scenario.budgetUsd),                     color: '#3D5AFE' },
    { icon: <Shield size={12} />,     label: 'SLA',         value: `${(scenario.slaAvailability * 100).toFixed(2)}%`, color: '#9B5DE5' },
    { icon: <Wifi size={12} />,       label: 'Read Share',  value: `${Math.round(scenario.readShare * 100)}%`,        color: '#FF6FA5' },
    { icon: <Target size={12} />,     label: 'Static CDN',  value: `${Math.round(scenario.staticShare * 100)}%`,      color: '#FF8A3D' },
  ];

  const diffColor: Record<string, string> = {
    Beginner: '#1DD3A0', Intermediate: '#22B8FF', Advanced: '#FF8A3D', Expert: '#FF4D4D',
  };
  const diffPips: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
  const pips = diffPips[scenario.difficulty] ?? 1;
  const pipColor = diffColor[scenario.difficulty];

  return (
    <div className="p-4" style={{ borderBottom: '1px solid var(--color-panel-line)' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9A92AD' }}>
          Mission
        </h3>
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
          style={{ background: `${pipColor}1A` }}
        >
          <span className="text-[9px] font-bold uppercase" style={{ color: pipColor }}>
            {scenario.difficulty}
          </span>
          <span className="flex gap-0.5">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rotate-45"
                style={{
                  backgroundColor: i <= pips ? pipColor : 'transparent',
                  border: `1px solid ${i <= pips ? pipColor : '#D8CFBE'}`,
                }}
              />
            ))}
          </span>
        </div>
      </div>

      <h4 className="text-[15px] font-semibold mb-1 leading-tight" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
        {scenario.title}
      </h4>
      <p className="text-[11.5px] leading-relaxed mb-4" style={{ color: '#5B5470' }}>
        {scenario.brief}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {constraints.map(({ icon, label, value, color }) => (
          <div
            key={label}
            className="px-2.5 py-2 rounded-xl"
            style={{ background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}
          >
            <div className="flex items-center gap-1.5 mb-1" style={{ color }}>
              {icon}
              <span className="text-[8.5px] font-bold uppercase tracking-wider" style={{ color: '#9A92AD' }}>
                {label}
              </span>
            </div>
            <div className="text-[12px] font-bold" style={{ fontFamily: 'var(--font-jetbrains)', color: '#1B1733' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3.5">
        {scenario.requiresHA && (
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: '#FFF3D6', color: '#9A6B00' }}>
            HA Required
          </span>
        )}
        {scenario.requiresPersistence && (
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: '#E6ECFF', color: '#2A3FB8' }}>
            DB Required
          </span>
        )}
      </div>
    </div>
  );
}
