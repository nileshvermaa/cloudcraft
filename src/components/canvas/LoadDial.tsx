'use client';

import { Activity } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

const STEPS = [
  { rps: 100,       label: '100' },
  { rps: 1_000,     label: '1k' },
  { rps: 10_000,    label: '10k' },
  { rps: 100_000,   label: '100k' },
  { rps: 1_000_000, label: '1M' },
];

export function LoadDial() {
  const { loadRps, setLoad } = useGameStore();

  const currentIdx = STEPS.findIndex((s) => s.rps === loadRps);
  const current = STEPS[currentIdx] ?? STEPS[0];

  return (
    <div className="p-4" style={{ borderBottom: '1px solid var(--color-panel-line)' }}>
      <div className="flex items-center gap-1.5 mb-3">
        <Activity size={13} style={{ color: '#1DD3A0' }} />
        <h3 className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
          Simulated Load
        </h3>
      </div>

      {/* Readout */}
      <div
        className="py-3 rounded-xl flex items-baseline justify-center gap-1.5 mb-3"
        style={{ background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}
      >
        <span
          className="text-4xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-jetbrains)', color: '#1B1733' }}
        >
          {current.label}
        </span>
        <span className="text-[12px] font-bold uppercase" style={{ color: '#9A92AD', fontFamily: 'var(--font-jetbrains)' }}>
          rps
        </span>
      </div>

      {/* Stepped dial */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((step) => {
          const isSelected = step.rps === loadRps;
          return (
            <button
              key={step.rps}
              onClick={() => setLoad(step.rps)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-100 cursor-pointer text-center',
                isSelected ? 'text-white' : 'hover:-translate-y-0.5'
              )}
              style={
                isSelected
                  ? { background: '#1DD3A0', fontFamily: 'var(--font-jetbrains)' }
                  : {
                      background: '#FFFCF5',
                      border: '1px solid var(--color-panel-line)',
                      color: '#5B5470',
                      fontFamily: 'var(--font-jetbrains)',
                    }
              }
              title={`Set load to ${step.label} rps`}
            >
              {step.label}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-center mt-2.5 font-medium" style={{ color: '#9A92AD' }}>
        Crank it. Watch it break.
      </p>
    </div>
  );
}
