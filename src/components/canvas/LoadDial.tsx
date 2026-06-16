'use client';

import { Users, Activity } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

const STEPS = [
  { rps: 100,       label: '100',   sub: 'RPS' },
  { rps: 1_000,     label: '1k',    sub: 'RPS' },
  { rps: 10_000,    label: '10k',   sub: 'RPS' },
  { rps: 100_000,   label: '100k',  sub: 'RPS' },
  { rps: 1_000_000, label: '1M',    sub: 'RPS' },
];

export function LoadDial() {
  const { loadRps, setLoad } = useGameStore();

  const currentIdx = STEPS.findIndex((s) => s.rps === loadRps);
  const current = STEPS[currentIdx] ?? STEPS[0];

  return (
    <div className="p-4 border-b border-[var(--color-chrome-border)] bg-slate-950/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Activity size={11} className="text-teal-400 animate-pulse" />
          <h3 className="text-[10px] font-bold text-[var(--color-chrome-bright)] uppercase tracking-wider">
            Simulated Load
          </h3>
        </div>
        <span className="text-[8px] font-mono text-teal-500/70 uppercase">RPS level {currentIdx + 1}/5</span>
      </div>

      {/* Current value display as cockpit readout */}
      <div className="bg-slate-950/65 border border-[var(--color-chrome-border)]/90 py-3 rounded-lg flex flex-col items-center justify-center shadow-inner relative overflow-hidden mb-3">
        {/* Subtle grid pattern inside readout */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.3)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />
        
        <div className="flex items-baseline gap-1">
          <span
            className="text-4xl font-extrabold text-teal-400 drop-shadow-[0_0_6px_rgba(20,184,166,0.5)] tracking-tight font-mono"
            style={{ fontFamily: 'var(--font-jetbrains)' }}
          >
            {current.label}
          </span>
          <span className="text-[11px] text-teal-500/60 font-black uppercase font-mono">
            {current.sub}
          </span>
        </div>
      </div>

      {/* Stepped dial toggles */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const isSelected = step.rps === loadRps;
          return (
            <button
              key={step.rps}
              onClick={() => setLoad(step.rps)}
              className={cn(
                "flex-1 py-1.5 rounded text-[9px] font-black font-mono transition-all duration-100 cursor-pointer text-center",
                isSelected
                  ? "bg-teal-400 text-slate-950 border border-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.25)] relative top-[0.5px]"
                  : "bg-[var(--color-chrome-soft)] text-[var(--color-chrome-text)] hover:text-[var(--color-chrome-bright)] hover:bg-slate-700/50 border border-[var(--color-chrome-border)] active:translate-y-[0.5px]"
              )}
              title={`Set load to ${step.label} ${step.sub}`}
            >
              {step.label}
            </button>
          );
        })}
      </div>

      {/* Capacity hint */}
      <p className="text-[9px] text-[var(--color-chrome-text)]/50 text-center mt-2.5 font-medium italic">
        Crank it. Watch it break.
      </p>
    </div>
  );
}
