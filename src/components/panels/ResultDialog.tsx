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
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { PillButton } from '@/components/ui/PillButton';
import { useGameStore } from '@/store/useGameStore';
import { SCENARIOS } from '@/lib/scenarios';
import type { CriterionResult } from '@/types';
import { Nimbus } from '@/components/cast/CastRenderer';

const GRADE_CONFIG: Record<string, { color: string; label: string; nimbus: 'cheer' | 'point' | 'faint' }> = {
  S: { color: '#FFC83D', label: 'Perfect run',     nimbus: 'cheer' },
  A: { color: '#1DD3A0', label: 'Excellent',       nimbus: 'cheer' },
  B: { color: '#22B8FF', label: 'Solid effort',    nimbus: 'point' },
  C: { color: '#FFB81C', label: 'Needs a rethink', nimbus: 'point' },
  F: { color: '#FF4D4D', label: 'It fell over',    nimbus: 'faint' },
};

function CriterionRow({ criterion, index }: { criterion: CriterionResult; index: number }) {
  const pct = Math.round((criterion.points / criterion.max) * 100);
  return (
    <motion.div
      className="py-3"
      style={{ borderBottom: '1px solid var(--color-panel-line)' }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {criterion.passed ? (
            <CheckCircle2 size={14} style={{ color: '#1DA97F' }} />
          ) : (
            <XCircle size={14} style={{ color: '#E23B3B' }} />
          )}
          <span className="text-[12px] font-bold" style={{ color: '#1B1733' }}>{criterion.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#EFE6D3' }}>
            <div
              className="h-full rounded-full transition-all duration-700 origin-left"
              style={{ width: `${pct}%`, background: criterion.passed ? '#1DD3A0' : '#FF6B6B' }}
            />
          </div>
          <span className="text-[10px] font-bold w-9 text-right" style={{ color: '#5B5470', fontFamily: 'var(--font-jetbrains)' }}>
            {criterion.points}/{criterion.max}
          </span>
        </div>
      </div>
      <p className="text-[10.5px] leading-relaxed ml-[22px]" style={{ color: '#5B5470' }}>
        {criterion.detail}
      </p>
    </motion.div>
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
        className="max-w-md p-0 overflow-hidden rounded-3xl"
        style={{ background: 'var(--color-panel)', border: '1px solid var(--color-panel-line)', color: '#1B1733' }}
      >
        {/* Grade header */}
        <div
          className="px-6 py-5 flex items-center gap-4 relative"
          style={{ background: `${g.color}1A`, borderBottom: '1px solid var(--color-panel-line)' }}
        >
          {/* GradeStamp */}
          <motion.div
            className="relative flex items-center justify-center flex-shrink-0"
            style={{ width: 72, height: 72 }}
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: [0, 1.15, 1], rotate: [-12, 4, 0] }}
            transition={{ duration: 0.5, times: [0, 0.6, 1], type: 'spring', stiffness: 260, damping: 14 }}
          >
            <div className="absolute inset-0 rounded-full" style={{ border: `3px solid ${g.color}`, opacity: 0.4 }} />
            <span className="text-6xl font-bold leading-none" style={{ color: g.color, fontFamily: 'var(--font-display)' }}>
              {result.grade}
            </span>
          </motion.div>

          <div className="flex-1">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
                {g.label}
              </DialogTitle>
              <DialogDescription className="text-[12px] font-medium" style={{ color: '#5B5470' }}>
                {scenario.title}
              </DialogDescription>
            </DialogHeader>
            <div className="text-[15px] font-bold mt-1.5" style={{ color: '#1B1733', fontFamily: 'var(--font-jetbrains)' }}>
              {result.score}<span style={{ color: '#9A92AD' }}> / 100 pts</span>
            </div>
          </div>

          <Nimbus state={g.nimbus} size={56} />
        </div>

        {/* Criteria */}
        <div className="px-6 py-2 max-h-72 overflow-y-auto" style={{ background: 'var(--color-panel-2)' }}>
          {result.criteria.map((c, i) => <CriterionRow key={c.key} criterion={c} index={i} />)}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex gap-3 justify-end" style={{ borderTop: '1px solid var(--color-panel-line)' }}>
          <PillButton variant="secondary" size="sm" onClick={onClose}>
            Tweak &amp; rerun
          </PillButton>
          {next && (
            <PillButton
              variant="primary"
              size="sm"
              icon={<ChevronRight size={15} />}
              onClick={() => { onClose(); router.push(`/scenario/${next.id}`); }}
            >
              Next scenario
            </PillButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
