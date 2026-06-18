'use client';

/**
 * FailureVignette — Phase V2
 *
 * "Dumb Ways Your Stack Dies" failure vignettes.
 * Triggered by SimResult — never faked.
 *
 * Vignettes:
 *  - overworked  → tile sweats, Pings pile up, Crew panics
 *  - domino      → SPOF chain collapse
 *  - break-in    → The Leak grabs DATA
 *  - big-sleep   → Pings yawn and fall asleep
 *  - bill-shock  → Billy faints on the invoice
 */

import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Nimbus, TheLeakCharacter, TheCrewCharacter, BillyCharacter } from './CastRenderer';
import { PillButton } from '@/components/ui/PillButton';
import type { SimResult } from '@/types';

type VignetteType = 'overworked' | 'domino' | 'break-in' | 'big-sleep' | 'bill-shock' | null;

function detectVignette(result: SimResult): VignetteType {
  if ((result.securityViolations ?? []).length > 0) return 'break-in';
  if ((result.overloadedNodeIds ?? []).length > 0) return 'overworked';
  if ((result.spofs ?? []).length > 0) return 'domino';
  if ((result.p50LatencyMs ?? 0) > 800) return 'big-sleep';
  if ((result.monthlyCost ?? 0) > 5_000) return 'bill-shock';
  return null;
}

const VIGNETTE_META: Record<
  NonNullable<VignetteType>,
  { emoji: string; title: string; subtitle: string; lesson: string; nimbusLine: string }
> = {
  overworked: {
    emoji: '💦',
    title: 'Overworked',
    subtitle: 'The servers are sweating.',
    lesson: 'Scale out — add more units, an ASG, or a container cluster.',
    nimbusLine: 'Your compute is doing ALL the work. Give it some help, mate.',
  },
  domino: {
    emoji: '🀄',
    title: 'The Domino',
    subtitle: 'One tile faints → everything downstream collapses.',
    lesson: 'Add redundancy — multi-AZ, replica sets, or standby nodes.',
    nimbusLine: 'One tiny failure took everything down. Add redundancy!',
  },
  'break-in': {
    emoji: '🦹',
    title: 'The Break-In',
    subtitle: 'An intruder strolled right into your database.',
    lesson: 'Add a WAF or Auth service in front of any exposed data store.',
    nimbusLine: 'Someone walked off with your data. Add a WAF or Auth gate!',
  },
  'big-sleep': {
    emoji: '💤',
    title: 'The Big Sleep',
    subtitle: 'Requests trudged in, yawned, and fell asleep.',
    lesson: 'Add a cache or CDN, and right-size your compute.',
    nimbusLine: 'Your latency is putting users to sleep. Cache something!',
  },
  'bill-shock': {
    emoji: '💸',
    title: 'Bill Shock',
    subtitle: 'Billy fainted on the invoice.',
    lesson: 'Cut overprovisioning — smaller tiers or serverless for spiky workloads.',
    nimbusLine: 'You broke the budget! Billy is not happy about this.',
  },
};

interface FailureVignetteProps {
  result: SimResult | null;
  show: boolean;
  onDismiss: () => void;
}

export function FailureVignette({ result, show, onDismiss }: FailureVignetteProps) {
  const reduced = useReducedMotion();

  if (!result || result.grade === 'S' || result.grade === 'A' || result.grade === 'B') return null;

  const vignette = detectVignette(result);
  if (!vignette) return null;

  const meta = VIGNETTE_META[vignette];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.3 }}
          onClick={onDismiss}
        >
          {/* Dark radial vignette background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(11,4,26,0.72) 0%, rgba(11,4,26,0.92) 100%)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 rounded-2xl overflow-hidden max-w-sm w-full"
            style={{
              background: 'linear-gradient(135deg, #1B1F2E 0%, #12172A 100%)',
              border: '1px solid #2E3447',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            }}
            initial={reduced ? {} : { scale: 0.7, rotate: -4, y: 40 }}
            animate={reduced ? {} : { scale: 1, rotate: 0, y: 0 }}
            exit={reduced ? {} : { scale: 0.6, opacity: 0 }}
            transition={
              reduced ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 22 }
            }
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top band — scene tint */}
            <div
              className="px-5 pt-5 pb-4 flex items-start gap-4"
              style={{
                background:
                  vignette === 'break-in'
                    ? 'rgba(239,68,68,0.12)'
                    : vignette === 'bill-shock'
                    ? 'rgba(245,158,11,0.12)'
                    : 'rgba(99,102,241,0.12)',
              }}
            >
              {/* Giant emoji */}
              <span className="text-5xl leading-none select-none">{meta.emoji}</span>

              <div className="flex-1">
                <h2
                  className="text-xl font-black text-white leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {meta.title}
                </h2>
                <p className="text-[12px] text-slate-300 mt-0.5 font-semibold">{meta.subtitle}</p>
              </div>
            </div>

            {/* Cast tableau */}
            <div className="px-5 py-3 flex items-end gap-3 border-b border-[#2E3447] min-h-[80px] relative">
              <Nimbus state="faint" size={56} />

              {vignette === 'overworked' && (
                <>
                  <TheCrewCharacter state="panic" />
                  <TheCrewCharacter state="panic" style={{ left: 44 }} />
                </>
              )}
              {vignette === 'break-in' && <TheLeakCharacter state="grab" />}
              {vignette === 'domino' && <TheCrewCharacter state="faint" />}
              {vignette === 'bill-shock' && <BillyCharacter state="faint" />}
            </div>

            {/* Nimbus speech bubble */}
            <div className="px-5 py-3 bg-slate-950/30">
              <div className="flex gap-2 items-start">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5 flex-shrink-0">
                  NIMBUS:
                </span>
                <p
                  className="text-[12px] text-slate-200 italic leading-relaxed"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  &ldquo;{meta.nimbusLine}&rdquo;
                </p>
              </div>
            </div>

            {/* Lesson + Dismiss */}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div
                className="flex items-start gap-1.5 text-[11px] text-slate-400 flex-1 leading-relaxed"
              >
                <span className="text-amber-400 flex-shrink-0 mt-px">💡</span>
                <span>{meta.lesson}</span>
              </div>

              <div className="flex-shrink-0">
                <PillButton variant="primary" size="sm" onClick={onDismiss}>
                  Got it
                </PillButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
