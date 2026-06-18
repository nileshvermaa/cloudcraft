'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { ChevronLeft, Star, CheckCircle2, Play, Map as MapIcon } from 'lucide-react';
import { SCENARIOS } from '@/lib/scenarios';
import { useGameStore } from '@/store/useGameStore';
import { Nimbus } from '@/components/cast/CastRenderer';
import { PillButton } from '@/components/ui/PillButton';
import type { Scenario } from '@/types';

const spring = { type: 'spring' as const, stiffness: 260, damping: 22 };
const PAGE_BG = 'linear-gradient(180deg, #E7FBF3 0%, #FFF7ED 100%)';

// Scene colors per difficulty
const SCENE_COLORS: Record<string, { pin: string; glow: string }> = {
  Beginner:     { pin: '#1DD3A0', glow: 'rgba(29,211,160,0.35)' },
  Intermediate: { pin: '#22B8FF', glow: 'rgba(34,184,255,0.35)' },
  Advanced:     { pin: '#FF6FA5', glow: 'rgba(255,111,165,0.35)' },
  Expert:       { pin: '#9B5DE5', glow: 'rgba(155,93,229,0.35)' },
};

function DifficultyStars({ difficulty }: { difficulty: Scenario['difficulty'] }) {
  const count = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 }[difficulty];
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Star key={i} size={10} fill={i < count ? '#FFB81C' : 'transparent'} stroke={i < count ? '#FFB81C' : '#D8CFBE'} strokeWidth={1.5} />
      ))}
    </div>
  );
}

function GradePill({ grade }: { grade: string }) {
  const colors: Record<string, string> = { S: '#FFC83D', A: '#1DD3A0', B: '#22B8FF', C: '#FFB81C', F: '#FF4D4D' };
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold text-white"
      style={{ backgroundColor: colors[grade] ?? '#C9BFA6', fontFamily: 'var(--font-display)' }}
    >
      {grade}
    </div>
  );
}

interface LocationCardProps {
  scenario: Scenario;
  bestGrade: string | null;
  isSelected: boolean;
  onSelect: () => void;
}

function LocationCard({ scenario, bestGrade, isSelected, onSelect }: LocationCardProps) {
  const reduced = useReducedMotion();
  const colors = SCENE_COLORS[scenario.difficulty] ?? SCENE_COLORS.Beginner;
  const isCompleted = !!bestGrade;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={onSelect}
        className="relative focus:outline-none"
        whileHover={reduced ? {} : { scale: 1.08 }}
        whileTap={reduced ? {} : { scale: 0.96 }}
        transition={spring}
        title={scenario.title}
      >
        {/* ISO building */}
        <svg width={72} height={72} viewBox="0 0 72 72">
          <ellipse cx={36} cy={64} rx={24} ry={6} fill="rgba(27,23,51,0.08)" />
          <polygon points="36,20 60,34 60,60 36,46" fill={colors.pin} opacity={0.6} />
          <polygon points="12,34 36,20 36,46 12,60" fill={colors.pin} opacity={0.78} />
          <polygon points="12,34 36,20 60,34 36,48" fill={colors.pin} />
          <rect x={18} y={38} width={8} height={8} rx={2} fill="white" opacity={0.45} />
          <rect x={30} y={38} width={8} height={8} rx={2} fill="white" opacity={0.45} />
          <rect x={18} y={50} width={8} height={6} rx={2} fill="white" opacity={0.45} />
          <rect x={30} y={50} width={8} height={6} rx={2} fill="white" opacity={0.45} />
          {isCompleted && <circle cx={54} cy={16} r={10} fill="#1DD3A0" />}
          {isCompleted && <text x={54} y={21} textAnchor="middle" fontSize={12} fill="white" fontWeight="bold">✓</text>}
        </svg>

        {isSelected && (
          <motion.div
            className="absolute -top-3 left-1/2 -translate-x-1/2"
            animate={reduced ? {} : { y: [0, -5, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: colors.pin, boxShadow: `0 0 10px ${colors.glow}` }} />
          </motion.div>
        )}
      </motion.button>

      {/* Banner sign */}
      <div
        className="px-3 py-1.5 rounded-xl text-center"
        style={{ background: '#FFF3DD', border: `1px solid ${isSelected ? colors.pin : 'var(--color-panel-line)'}`, minWidth: 110 }}
      >
        <div className="text-[11px] font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
          {scenario.title}
        </div>
        <div className="flex items-center justify-center gap-2 mt-0.5">
          <DifficultyStars difficulty={scenario.difficulty} />
          {bestGrade && <GradePill grade={bestGrade} />}
        </div>
      </div>
    </div>
  );
}

export default function ScenariosPage() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { bestScores, loadBestScores, loadScenario } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadBestScores();
  }, [loadBestScores]);

  function scoreToGrade(score: number): string {
    if (score >= 95) return 'S';
    if (score >= 80) return 'A';
    if (score >= 65) return 'B';
    if (score >= 45) return 'C';
    return 'F';
  }

  const selectedScenario = SCENARIOS.find((s) => s.id === selectedId);

  const handleStart = () => {
    if (!selectedScenario) return;
    loadScenario(selectedScenario);
    router.push(`/scenario/${selectedScenario.id}`);
  };

  const completed = SCENARIOS.filter((s) => bestScores[s.id] !== undefined).length;

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ background: PAGE_BG }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 h-14 flex-shrink-0"
        style={{ background: 'var(--color-panel)', borderBottom: '1px solid var(--color-panel-line)' }}
      >
        <Link
          href="/"
          className="flex items-center gap-1 text-[13px] font-bold rounded-full pl-2 pr-3.5 py-1.5"
          style={{ color: '#5B5470', background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}
        >
          <ChevronLeft size={15} /> Menu
        </Link>
        <div className="flex items-center gap-2">
          <MapIcon size={16} style={{ color: '#9B5DE5' }} />
          <h1 className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
            Scenario Map
          </h1>
        </div>
        <div
          className="text-[11px] font-bold px-3 py-1 rounded-full"
          style={{ background: '#1DD3A01A', color: '#1DA97F', border: '1px solid #1DD3A040', fontFamily: 'var(--font-jetbrains)' }}
        >
          {completed} / {SCENARIOS.length} cleared
        </div>
      </header>

      {/* World map area */}
      <div className="flex-1 relative overflow-auto">
        {/* Nimbus hosting the map */}
        <motion.div
          className="absolute top-6 left-8 pointer-events-none z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={reduced ? { duration: 0 } : { ...spring, delay: 0.1 }}
        >
          <Nimbus state="point" size={80} />
          <div
            className="mt-1 px-3 py-1.5 rounded-xl text-xs font-medium max-w-[150px] leading-snug"
            style={{ background: '#FFF3DD', color: '#5B5470', border: '1px solid var(--color-panel-line)' }}
          >
            Pick a mission and fix the broken stack!
          </div>
        </motion.div>

        {/* Scenario locations */}
        <div className="flex items-end gap-6 md:gap-10 px-8 pt-28 pb-24 min-w-max" style={{ paddingLeft: '220px' }}>
          {SCENARIOS.map((scenario, i) => {
            const bestScore = bestScores[scenario.id];
            const bestGrade = bestScore !== undefined ? scoreToGrade(bestScore) : null;
            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: reduced ? 0 : 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduced ? { duration: 0 } : { ...spring, delay: i * 0.07 }}
                style={{ marginBottom: [0, 30, 10, 50, 20][i % 5] }}
              >
                <LocationCard
                  scenario={scenario}
                  bestGrade={bestGrade}
                  isSelected={selectedId === scenario.id}
                  onSelect={() => setSelectedId(selectedId === scenario.id ? null : scenario.id)}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Scenario detail popover */}
      <AnimatePresence>
        {selectedScenario && (
          <motion.div
            key={selectedScenario.id}
            className="fixed bottom-0 left-0 right-0 z-30"
            initial={{ y: reduced ? 0 : 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduced ? 0 : 200, opacity: 0 }}
            transition={reduced ? { duration: 0 } : spring}
          >
            <div
              className="mx-auto max-w-2xl rounded-t-3xl p-6"
              style={{ background: 'var(--color-panel)', border: '1px solid var(--color-panel-line)', borderBottom: 'none' }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DifficultyStars difficulty={selectedScenario.difficulty} />
                    <span className="text-[10px] uppercase" style={{ color: '#9A92AD', fontFamily: 'var(--font-jetbrains)' }}>{selectedScenario.difficulty}</span>
                    {bestScores[selectedScenario.id] !== undefined && (
                      <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#1DA97F' }}>
                        <CheckCircle2 size={10} />
                        Best: {Math.round(bestScores[selectedScenario.id])} pts
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
                    {selectedScenario.title}
                  </h2>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: '#5B5470' }}>
                    {selectedScenario.brief}
                  </p>
                </div>
                <button onClick={() => setSelectedId(null)} className="flex-shrink-0 text-lg leading-none transition-colors" style={{ color: '#9A92AD' }}>
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Target RPS', value: selectedScenario.targetRps.toLocaleString() },
                  { label: 'Max Latency', value: `${selectedScenario.maxLatencyMs}ms` },
                  { label: 'Budget', value: `$${selectedScenario.budgetUsd}/mo` },
                  { label: 'SLA', value: `${(selectedScenario.slaAvailability * 100).toFixed(2)}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl px-3 py-2 text-center" style={{ background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}>
                    <div className="text-[9px] font-bold uppercase mb-0.5" style={{ color: '#9A92AD' }}>{label}</div>
                    <div className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-jetbrains)', color: '#1B1733' }}>{value}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <PillButton variant="primary" size="md" icon={<Play size={16} fill="currentColor" />} onClick={handleStart}>
                  Start mission
                </PillButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
