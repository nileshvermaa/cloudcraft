'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, ChevronRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/useGameStore';
import { SCENARIOS } from '@/lib/scenarios';
import type { CriterionResult } from '@/types';
import { cn } from '@/lib/utils';
import { Nimbus } from '@/components/cast/CastRenderer';

const GRADE_CONFIG: Record<string, { bg: string; text: string; label: string; glow: string }> = {
  S: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', label: 'PERFECT SCORE', glow: 'rgba(16, 185, 129, 0.45)' },
  A: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', label: 'EXCELLENT', glow: 'rgba(59, 130, 246, 0.45)' },
  B: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8B5CF6', label: 'GOOD EFFORT', glow: 'rgba(139, 92, 246, 0.45)' },
  C: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', label: 'NEEDS RE-DESIGN', glow: 'rgba(245, 158, 11, 0.45)' },
  F: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', label: 'SYSTEM CRASH', glow: 'rgba(239, 68, 68, 0.45)' },
};

function CriterionRow({ criterion }: { criterion: CriterionResult }) {
  const pct = Math.round((criterion.points / criterion.max) * 100);
  return (
    <div className="py-3 border-b border-[var(--color-chrome-border)]/50 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {criterion.passed ? (
            <CheckCircle2 size={13} className="text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]" />
          ) : (
            <XCircle size={13} className="text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.3)]" />
          )}
          <span className="text-[11.5px] font-bold text-[var(--color-chrome-bright)]">{criterion.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-950/60 rounded-full overflow-hidden border border-[var(--color-chrome-border)]/40">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 origin-left scale-x-0 animate-meter-fill",
                criterion.passed ? 'bg-emerald-400' : 'bg-red-400'
              )}
              style={{
                width: `${pct}%`,
              }}
            />
          </div>
          <span
            className="text-[10px] font-bold text-[var(--color-chrome-bright)] w-9 text-right font-mono"
            style={{ fontFamily: 'var(--font-jetbrains)' }}
          >
            {criterion.points}/{criterion.max}
          </span>
        </div>
      </div>
      <p className="text-[9.5px] text-[var(--color-chrome-text)]/75 leading-relaxed ml-[21px]">
        {criterion.detail}
      </p>
    </div>
  );
}

interface ResultDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ResultDialog({ open, onClose }: ResultDialogProps) {
  const { result, scenario } = useGameStore();
  const router = useRouter();

  if (!result || !scenario) return null;

  const g = GRADE_CONFIG[result.grade] ?? GRADE_CONFIG.F;
  const currentIdx = SCENARIOS.findIndex((s) => s.id === scenario.id);
  const next = SCENARIOS[currentIdx + 1];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md border-[var(--color-chrome-border)] bg-[var(--color-chrome)] text-[var(--color-chrome-bright)] p-0 overflow-hidden shadow-2xl rounded-xl bg-[image:url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.02\'/%3E%3C/svg%3E')] bg-repeat"
      >
        {/* Grade header */}
        <motion.div
          className="px-6 py-5 flex items-center justify-between border-b border-[var(--color-chrome-border)] relative"
          style={{ backgroundColor: g.bg }}
          initial={{ opacity: 0, scale: 0.9, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          {/* Animated subtle grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.35)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />
          
          <div>
            <DialogHeader>
              <DialogTitle
                className="text-[12px] font-black uppercase tracking-wider mb-1 flex items-center gap-1.5"
                style={{ color: g.text }}
              >
                <Award size={13} />
                SIMULATION DEBRIEF
              </DialogTitle>
              <DialogDescription className="text-[11px] font-semibold text-[var(--color-chrome-text)]/90 leading-tight">
                {scenario.title}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          {/* Grade Badge + Nimbus */}
          <div className="text-right flex items-center gap-3 relative z-10">
            {/* Nimbus reacts to grade */}
            <Nimbus
              state={result.grade === 'S' || result.grade === 'A' ? 'cheer' : result.grade === 'F' ? 'faint' : 'point'}
              size={52}
            />
            <div className="flex flex-col items-center justify-center">
              <div
                className="text-[11px] font-black uppercase tracking-widest leading-none opacity-85 mb-1"
                style={{ color: g.text }}
              >
                {g.label}
              </div>
              <div
                className="text-[13px] font-black text-[var(--color-chrome-bright)]"
                style={{ fontFamily: 'var(--font-jetbrains)' }}
              >
                {result.score} / 100 PTS
              </div>
            </div>
            <div className="flex flex-col items-center justify-center relative w-14 h-14">
              <div
                className="absolute inset-0 rounded-full border-2 opacity-50"
                style={{ borderColor: g.text, boxShadow: `0 0 16px ${g.glow}` }}
              />
              <div
                className="text-4xl font-black leading-none"
                style={{ color: g.text, fontFamily: 'var(--font-display)' }}
              >
                {result.grade}
              </div>
            </div>
          </div>
        </motion.div>


        {/* Criteria */}
        <div className="px-6 py-3 max-h-72 overflow-y-auto custom-scrollbar bg-slate-950/10">
          {result.criteria.map((c) => <CriterionRow key={c.key} criterion={c} />)}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-[var(--color-chrome-border)] flex gap-3 justify-end bg-slate-950/35">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="text-[11px] font-bold border-[var(--color-chrome-border)] bg-[var(--color-chrome-soft)] text-[var(--color-chrome-text)] hover:bg-slate-700/60 hover:text-[var(--color-chrome-bright)] rounded-md active:translate-y-[1px] transition-all px-4"
          >
            Tweak Architecture
          </Button>
          {next && (
            <button
              onClick={() => { onClose(); router.push(`/scenario/${next.id}`); }}
              className="h-9 text-[11px] font-black uppercase tracking-wider gap-1 flex items-center justify-center px-4 rounded-md bg-teal-400 text-slate-950 hover:bg-teal-300 transition-all shadow-[0_3px_0_#0D9488] active:shadow-none active:translate-y-[3px] border border-teal-500"
            >
              Next Mission <ChevronRight size={11} className="fill-current" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
