'use client';

import { Bomb } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatRps } from '@/lib/utils';

/** On-canvas verdict for a chaos / fault-injection run. */
export function ChaosBanner() {
  const { chaosResult, isChaosRunning } = useGameStore();
  if (!isChaosRunning && !chaosResult) return null;

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      {isChaosRunning ? (
        <div
          className="px-4 py-2 rounded-full text-[12px] font-semibold animate-pulse"
          style={{ background: 'var(--color-panel)', border: '1px solid var(--color-panel-line)', color: '#1B1733' }}
        >
          💥 Injecting fault…
        </div>
      ) : chaosResult ? (
        <div
          className="px-4 py-2 rounded-2xl flex items-center gap-2.5"
          style={{
            background: 'var(--color-panel)',
            border: `1px solid ${chaosResult.resilient ? '#1DD3A0' : '#FF4D4D'}`,
            boxShadow: '0 8px 24px rgba(27,23,51,0.12)',
          }}
        >
          <Bomb size={16} style={{ color: chaosResult.resilient ? '#1DA97F' : '#E23B3B' }} />
          <div>
            <div className="text-[13px] font-bold" style={{ color: '#1B1733' }}>
              {chaosResult.downedNodeLabel} went down
            </div>
            <div
              className="text-[11px] font-bold"
              style={{ color: chaosResult.resilient ? '#1DA97F' : '#E23B3B', fontFamily: 'var(--font-jetbrains)' }}
            >
              {chaosResult.resilient
                ? `Redundancy held · ${formatRps(chaosResult.survivedRps)} still served`
                : `Single point of failure · dropped to ${formatRps(chaosResult.survivedRps)}`}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
