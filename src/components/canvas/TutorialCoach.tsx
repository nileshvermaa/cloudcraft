'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useGameStore } from '@/store/useGameStore';
import { Nimbus } from '@/components/cast/CastRenderer';

const STEPS = [
  'Tap a part on the left to drop it on the board.',
  "Connect the pieces — drag from a tile's dot to the next tile.",
  'Hit Run to pour traffic on it and see what breaks.',
];

/** First-run, step-aware coaching for the sandbox. Auto-finishes after a run. */
export function TutorialCoach() {
  const reduced = useReducedMotion();
  const { nodes, edges, result, tutorialSeen, markTutorialSeen } = useGameStore();

  // Finish once a run has produced a result.
  useEffect(() => {
    if (!tutorialSeen && result) markTutorialSeen();
  }, [result, tutorialSeen, markTutorialSeen]);

  if (tutorialSeen) return null;

  const nonClient = nodes.filter((n) => n.data.type !== 'client').length;
  const step = nonClient === 0 ? 0 : edges.length === 0 ? 1 : 2;

  return (
    <motion.div
      className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 pl-2 pr-2 py-2 rounded-2xl pointer-events-none max-w-[92%]"
      style={{
        background: 'var(--color-panel)',
        border: '1px solid var(--color-panel-line)',
        boxShadow: '0 8px 24px rgba(27,23,51,0.12)',
      }}
      initial={{ opacity: 0, y: reduced ? 0 : -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 }}
    >
      <div className="flex-shrink-0">
        <Nimbus state="point" size={44} />
      </div>
      <motion.div key={step} className="min-w-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.2 }}>
        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9A92AD' }}>
          Step {step + 1} of 3
        </div>
        <div className="text-[13px] font-semibold leading-snug" style={{ color: '#1B1733' }}>
          {STEPS[step]}
        </div>
      </motion.div>
      <button
        onClick={markTutorialSeen}
        className="pointer-events-auto flex-shrink-0 text-[11px] font-bold rounded-full px-3 py-1 ml-1 transition-colors"
        style={{ color: '#9A92AD', background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}
      >
        Skip
      </button>
    </motion.div>
  );
}
