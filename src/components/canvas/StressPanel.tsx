'use client';

import { Gauge } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatRps } from '@/lib/utils';

/** Sandbox stress-test result: breaking point + a load-sweep bar chart. */
export function StressPanel() {
  const { stressResult, isStressing } = useGameStore();
  if (!isStressing && !stressResult) return null;

  const maxServed = stressResult ? Math.max(1, ...stressResult.points.map((p) => p.servedRps)) : 1;
  const survived = (stressResult?.breakingPoint ?? 0) > 0;

  return (
    <div className="p-4" style={{ borderBottom: '1px solid var(--color-panel-line)' }}>
      <div className="flex items-center gap-1.5 mb-2">
        <Gauge size={13} style={{ color: '#FF8A3D' }} />
        <h3 className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
          Stress Test
        </h3>
      </div>

      {isStressing ? (
        <div className="py-3 text-center text-[12px] font-semibold animate-pulse" style={{ color: '#9A92AD' }}>
          Ramping load…
        </div>
      ) : stressResult ? (
        <>
          <div
            className="py-2.5 rounded-xl flex items-baseline justify-center gap-1.5 mb-3"
            style={{ background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9A92AD' }}>
              Survives
            </span>
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-jetbrains)', color: survived ? '#1DA97F' : '#E23B3B' }}
            >
              {survived ? formatRps(stressResult.breakingPoint) : '—'}
            </span>
          </div>

          <div className="flex items-end gap-0.5 h-16">
            {stressResult.points.map((p) => {
              const h = Math.max(4, (p.servedRps / maxServed) * 100);
              const ok = p.errorRatePct < 0.5;
              return (
                <div
                  key={p.rps}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{ height: `${h}%`, background: ok ? '#1DD3A0' : '#FF8A8A' }}
                  title={`${formatRps(p.rps)} offered → ${formatRps(p.servedRps)} served (${p.errorRatePct.toFixed(0)}% errors)`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[8px] mt-1" style={{ color: '#9A92AD', fontFamily: 'var(--font-jetbrains)' }}>
            <span>100</span>
            <span>offered load →</span>
            <span>1M</span>
          </div>
        </>
      ) : null}
    </div>
  );
}
