'use client';

import Link from 'next/link';
import { Play, RotateCcw, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  title?: string;
  backHref?: string;
}

export function Toolbar({ title, backHref = '/' }: ToolbarProps) {
  const { isSimulating, runSimulation, reset, mode } = useGameStore();

  return (
    <div className="flex items-center gap-3 px-4 py-2 h-14 chrome-panel border-t-0 border-x-0 border-b border-[var(--color-chrome-border)] shadow-md relative z-20">
      {/* Back link */}
      <Link
        href={backHref}
        className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-chrome-text)] hover:text-[var(--color-chrome-bright)] transition-colors bg-[var(--color-chrome-soft)] px-2.5 py-1 rounded-md border border-[var(--color-chrome-border)] hover:border-slate-600 active:translate-y-[1px]"
      >
        <ArrowLeft size={13} />
        {mode === 'sandbox' ? 'Home' : 'Missions'}
      </Link>

      <div className="w-px h-5 bg-[var(--color-chrome-border)]" />

      {/* Logo + Mode + title */}
      <div className="flex items-center gap-3 flex-1">
        {/* Isometric Cloud Stack Logo Glyph */}
        <div className="flex items-center p-1 bg-slate-950/30 rounded border border-slate-800">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#14B8A6" opacity="0.9" />
            <path d="M2 17L12 22L22 17" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <span
          className={cn(
            "text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border shadow-sm",
            mode === 'sandbox'
              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10'
              : 'bg-indigo-950/50 text-indigo-400 border-indigo-500/30 shadow-indigo-500/10'
          )}
        >
          {mode === 'sandbox' ? 'Sandbox' : 'Mission'}
        </span>

        {/* Title + LED status */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-2.5 h-2.5 rounded-full transition-all duration-300 border border-black/40",
            isSimulating 
              ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" 
              : "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
          )} />
          <span
            className="text-[14px] font-bold text-[var(--color-chrome-bright)] tracking-wide truncate"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title ?? 'CloudCraft Studio'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={reset}
          disabled={isSimulating}
          className="h-8 text-[11px] font-bold border-[var(--color-chrome-border)] bg-[var(--color-chrome-soft)] text-[var(--color-chrome-text)] hover:bg-slate-700/60 hover:text-[var(--color-chrome-bright)] gap-1.5 px-3 rounded-md active:translate-y-[1px] transition-all"
        >
          <RotateCcw size={11} />
          Reset
        </Button>

        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className={cn(
            'h-9 text-[11px] font-black uppercase tracking-wider gap-1.5 flex items-center justify-center px-4 rounded-md',
            'bg-teal-400 text-slate-950 hover:bg-teal-300 transition-all shadow-[0_3px_0_#0D9488] active:shadow-none active:translate-y-[3px]',
            'border border-teal-500 disabled:opacity-50 disabled:pointer-events-none'
          )}
        >
          {isSimulating ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Simulating…
            </>
          ) : (
            <>
              <Play size={11} className="fill-current" />
              Run Simulation
            </>
          )}
        </button>
      </div>
    </div>
  );
}
