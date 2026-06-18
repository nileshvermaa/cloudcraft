'use client';

import { Activity, Clock, DollarSign, Shield, Zap, AlertTriangle, Play } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatRps, formatMs, formatUsd } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STATE_COLOR = {
  ok: '#1DA97F',
  warn: '#D9930A',
  danger: '#E23B3B',
  neutral: '#1B1733',
} as const;

interface MetricRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  target?: string;
  state?: 'ok' | 'warn' | 'danger' | 'neutral';
  dimmed?: boolean;
}

function MetricRow({ icon, label, value, target, state = 'neutral', dimmed }: MetricRowProps) {
  return (
    <div
      className={cn(
        'px-3 py-2.5 rounded-xl flex flex-col gap-1.5 transition-all duration-200',
        dimmed && 'opacity-40'
      )}
      style={{ background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span style={{ color: '#9A92AD' }}>{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9A92AD' }}>{label}</span>
        </div>
        {state !== 'neutral' && (
          <span
            className={cn('w-2 h-2 rounded-full', state === 'warn' && 'animate-pulse', state === 'danger' && 'animate-pulse')}
            style={{ backgroundColor: STATE_COLOR[state] }}
          />
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-bold" style={{ color: STATE_COLOR[state], fontFamily: 'var(--font-jetbrains)' }}>
          {value}
        </span>
        {target && (
          <span className="text-[10px]" style={{ color: '#B8B0C4', fontFamily: 'var(--font-jetbrains)' }}>
            → {target}
          </span>
        )}
      </div>
    </div>
  );
}

export function MetricsPanel() {
  const { result, scenario, mode, loadRps, isSimulating } = useGameStore();
  const dimmed = !result && !isSimulating;
  const targetRps = mode === 'scenario' && scenario ? scenario.targetRps : loadRps;

  const servedRps  = result?.servedRps       ?? 0;
  const errPct     = result?.errorRatePct    ?? 0;
  const latency    = result?.p50LatencyMs    ?? 0;
  const avail      = result?.availability    ?? 0;
  const cost       = result?.monthlyCost     ?? 0;

  function rpsState(): 'ok' | 'danger' | 'neutral' {
    if (!result) return 'neutral';
    return errPct === 0 ? 'ok' : 'danger';
  }
  function latencyState(): 'ok' | 'warn' | 'danger' | 'neutral' {
    if (!result || !scenario) return 'neutral';
    if (latency <= scenario.maxLatencyMs) return 'ok';
    if (latency <= scenario.maxLatencyMs * 1.5) return 'warn';
    return 'danger';
  }
  function availState(): 'ok' | 'danger' | 'neutral' {
    if (!result || !scenario) return 'neutral';
    return avail >= scenario.slaAvailability ? 'ok' : 'danger';
  }
  function costState(): 'ok' | 'danger' | 'neutral' {
    if (!result || !scenario) return 'neutral';
    return cost <= scenario.budgetUsd ? 'ok' : 'danger';
  }

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
          Telemetry
        </h3>
        {isSimulating && (
          <span className="text-[10px] font-bold uppercase animate-pulse" style={{ color: '#D9930A' }}>
            Running…
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <MetricRow icon={<Zap size={12} />} label="Served Load" value={result ? formatRps(servedRps) : '—'} target={formatRps(targetRps)} state={rpsState()} dimmed={dimmed} />
        <MetricRow icon={<Activity size={12} />} label="Error Rate" value={result ? `${errPct.toFixed(2)}%` : '—'} state={result ? (errPct === 0 ? 'ok' : 'danger') : 'neutral'} dimmed={dimmed} />
        <MetricRow icon={<Clock size={12} />} label="Latency (p50)" value={result ? formatMs(latency) : '—'} target={scenario ? formatMs(scenario.maxLatencyMs) : undefined} state={latencyState()} dimmed={dimmed} />
        <MetricRow icon={<Shield size={12} />} label="Availability" value={result ? `${(avail * 100).toFixed(3)}%` : '—'} target={scenario ? `${(scenario.slaAvailability * 100).toFixed(2)}%` : undefined} state={availState()} dimmed={dimmed} />
        <MetricRow icon={<DollarSign size={12} />} label="Monthly Cost" value={result ? formatUsd(cost) : '—'} target={scenario ? formatUsd(scenario.budgetUsd) : undefined} state={costState()} dimmed={dimmed} />
      </div>

      {result && result.overloadedNodeIds.length > 0 && (
        <div
          className="flex items-start gap-2 px-3 py-2 rounded-xl"
          style={{ background: '#FFECEC', border: '1px solid #FFC9C9' }}
        >
          <AlertTriangle size={12} style={{ color: '#E23B3B' }} className="mt-0.5 flex-shrink-0" />
          <p className="text-[11px] font-bold leading-snug" style={{ color: '#C42B2B' }}>
            {result.overloadedNodeIds.length} tier{result.overloadedNodeIds.length > 1 ? 's' : ''} overloaded — they need more capacity.
          </p>
        </div>
      )}

      {!result && !isSimulating && (
        <div
          className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-semibold select-none"
          style={{ background: '#FFFCF5', border: '1px solid var(--color-panel-line)', color: '#9A92AD' }}
        >
          <Play size={9} className="fill-current" />
          Press Run to simulate
        </div>
      )}
    </div>
  );
}
