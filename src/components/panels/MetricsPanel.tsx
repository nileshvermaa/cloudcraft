'use client';

import { Activity, Clock, DollarSign, Shield, Zap, AlertTriangle, Play } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatRps, formatMs, formatUsd } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MetricRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  target?: string;
  state?: 'ok' | 'warn' | 'danger' | 'neutral';
  dimmed?: boolean;
}

function MetricRow({ icon, label, value, target, state = 'neutral', dimmed }: MetricRowProps) {
  const valueColor =
    state === 'ok'     ? '#4ade80' :
    state === 'warn'   ? '#fbbf24' :
    state === 'danger' ? '#f87171' :
                         'var(--color-chrome-bright)';

  return (
    <div className={cn(
      'px-3 py-2.5 rounded-lg bg-[var(--color-chrome-soft)]/20 border border-[var(--color-chrome-border)] flex flex-col gap-1.5 transition-all duration-200',
      dimmed && 'opacity-35'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--color-chrome-text)]/75">{icon}</span>
          <span className="text-[10px] font-bold text-[var(--color-chrome-text)] uppercase tracking-wider">{label}</span>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-1">
          {state === 'ok' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#4ade80]" />}
          {state === 'warn' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse" />}
          {state === 'danger' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#f87171] animate-pulse" />}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span
          className="text-[13px] font-extrabold tracking-wide"
          style={{ color: valueColor, fontFamily: 'var(--font-jetbrains)' }}
        >
          {value}
        </span>

        {target && (
          <span className="text-[9px] text-[var(--color-chrome-text)]/50 font-mono">
            Tgt: {target}
          </span>
        )}
      </div>

      {/* Retro meter fill bar */}
      <div className="w-full h-[3px] bg-slate-950/40 rounded-full overflow-hidden relative">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-700 origin-left scale-x-0 animate-meter-fill",
            state === 'ok' ? "bg-emerald-400" :
            state === 'warn' ? "bg-amber-400" :
            state === 'danger' ? "bg-red-400" : "bg-teal-500/40"
          )}
          style={{
            width: '100%',
            transform: value !== '—' && value !== '0 RPS' ? 'scaleX(1)' : 'scaleX(0)'
          }}
        />
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
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-2.5 h-2.5 rounded-full border border-black/40 transition-all duration-300",
            isSimulating
              ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse"
              : result
              ? "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
              : "bg-slate-700"
          )} />
          <h3 className="text-[10px] font-black text-[var(--color-chrome-bright)] uppercase tracking-wider">
            Telemetry Output
          </h3>
        </div>
        
        {isSimulating && (
          <span className="text-[8px] font-mono text-amber-400 font-bold uppercase animate-pulse">
            Receiving...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <MetricRow
          icon={<Zap size={11} />}
          label="Served Load"
          value={result ? formatRps(servedRps) : '—'}
          target={formatRps(targetRps)}
          state={rpsState()}
          dimmed={dimmed}
        />
        <MetricRow
          icon={<Activity size={11} />}
          label="Error Rate"
          value={result ? `${errPct.toFixed(2)}%` : '—'}
          state={result ? (errPct === 0 ? 'ok' : 'danger') : 'neutral'}
          dimmed={dimmed}
        />
        <MetricRow
          icon={<Clock size={11} />}
          label="Latency (p50)"
          value={result ? formatMs(latency) : '—'}
          target={scenario ? `${formatMs(scenario.maxLatencyMs)}` : undefined}
          state={latencyState()}
          dimmed={dimmed}
        />
        <MetricRow
          icon={<Shield size={11} />}
          label="Availability"
          value={result ? `${(avail * 100).toFixed(3)}%` : '—'}
          target={scenario ? `${(scenario.slaAvailability * 100).toFixed(2)}%` : undefined}
          state={availState()}
          dimmed={dimmed}
        />
        <MetricRow
          icon={<DollarSign size={11} />}
          label="Monthly Cost"
          value={result ? formatUsd(cost) : '—'}
          target={scenario ? formatUsd(scenario.budgetUsd) : undefined}
          state={costState()}
          dimmed={dimmed}
        />
      </div>

      {result && result.overloadedNodeIds.length > 0 && (
        <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-red-950/40 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.15)] animate-pulse mt-1">
          <AlertTriangle size={11} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-[9px] text-red-300 font-bold leading-normal uppercase">
            {result.overloadedNodeIds.length} SYSTEM OVERLOAD(S) DETECTED
          </p>
        </div>
      )}

      {!result && !isSimulating && (
        <div className="flex items-center justify-center gap-1.5 bg-slate-950/25 border border-[var(--color-chrome-border)]/50 rounded py-2 text-[9px] text-[var(--color-chrome-text)]/60 font-semibold uppercase tracking-wider select-none">
          <Play size={8} className="fill-current animate-pulse text-teal-500/60" />
          Awaiting simulation run
        </div>
      )}
    </div>
  );
}
