'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { ArrowLeft, Star, CheckCircle2, Play, ChevronRight, Map } from 'lucide-react';
import { SCENARIOS } from '@/lib/scenarios';
import { useGameStore } from '@/store/useGameStore';
import { Nimbus } from '@/components/cast/CastRenderer';
import type { Scenario } from '@/types';

const spring = { type: 'spring' as const, stiffness: 260, damping: 22 };

// Scene colors per difficulty
const SCENE_COLORS: Record<string, { bg: string; pin: string; glow: string }> = {
  Beginner:     { bg: '#E7FBF3', pin: '#1DD3A0', glow: 'rgba(29,211,160,0.35)' },
  Intermediate: { bg: '#E8F6FF', pin: '#22B8FF', glow: 'rgba(34,184,255,0.35)' },
  Advanced:     { bg: '#FFEAF2', pin: '#FF6FA5', glow: 'rgba(255,111,165,0.35)' },
  Expert:       { bg: '#EEEAFE', pin: '#9B5DE5', glow: 'rgba(155,93,229,0.35)' },
};

function DifficultyStars({ difficulty }: { difficulty: Scenario['difficulty'] }) {
  const count = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 }[difficulty];
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Star
          key={i}
          size={10}
          fill={i < count ? '#FFB81C' : 'transparent'}
          stroke={i < count ? '#FFB81C' : '#CBD5E1'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function GradePill({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    S: '#1DD3A0', A: '#22B8FF', B: '#9B5DE5', C: '#FFB81C', F: '#FF4D4D',
  };
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white shadow-md"
      style={{
        backgroundColor: colors[grade] ?? '#94A3B8',
        fontFamily: 'var(--font-display)',
        boxShadow: `0 2px 8px ${colors[grade] ?? '#94A3B8'}55`,
      }}
    >
      {grade}
    </div>
  );
}

interface LocationCardProps {
  scenario: Scenario;
  index: number;
  bestGrade: string | null;
  isSelected: boolean;
  onSelect: () => void;
  onStart: () => void;
}

function LocationCard({ scenario, bestGrade, isSelected, onSelect }: LocationCardProps) {
  const reduced = useReducedMotion();
  const colors = SCENE_COLORS[scenario.difficulty] ?? SCENE_COLORS.Beginner;
  const isCompleted = !!bestGrade;
  // "locked" if index > 0 and previous scenario never completed — for this demo all are available
  const isLocked = false;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Location building + pin */}
      <motion.button
        onClick={isLocked ? undefined : onSelect}
        className="relative focus:outline-none"
        whileHover={reduced || isLocked ? {} : { scale: 1.08 }}
        whileTap={reduced || isLocked ? {} : { scale: 0.96 }}
        transition={spring}
        title={scenario.title}
      >
        {/* ISO building */}
        <svg width={72} height={72} viewBox="0 0 72 72" style={{ filter: isLocked ? 'grayscale(1) opacity(0.5)' : 'none' }}>
          {/* Ground shadow */}
          <ellipse cx={36} cy={64} rx={24} ry={6} fill="rgba(0,0,0,0.08)" />
          {/* Building right wall */}
          <polygon points="36,20 60,34 60,60 36,46" fill={colors.pin} opacity={0.6} />
          {/* Building left wall */}
          <polygon points="12,34 36,20 36,46 12,60" fill={colors.pin} opacity={0.75} />
          {/* Building roof */}
          <polygon points="12,34 36,20 60,34 36,48" fill={colors.pin} />
          {/* Windows */}
          <rect x={18} y={38} width={8} height={8} rx={2} fill="white" opacity={0.4} />
          <rect x={30} y={38} width={8} height={8} rx={2} fill="white" opacity={0.4} />
          <rect x={18} y={50} width={8} height={6} rx={2} fill="white" opacity={0.4} />
          <rect x={30} y={50} width={8} height={6} rx={2} fill="white" opacity={0.4} />
          {/* Completed check */}
          {isCompleted && (
            <circle cx={54} cy={16} r={10} fill="#1DD3A0" />
          )}
          {isCompleted && (
            <text x={54} y={21} textAnchor="middle" fontSize={12} fill="white" fontWeight="bold">✓</text>
          )}
          {isLocked && (
            <circle cx={54} cy={16} r={10} fill="#64748B" />
          )}
        </svg>

        {/* Bobbing selection pin */}
        {isSelected && !isLocked && (
          <motion.div
            className="absolute -top-3 left-1/2 -translate-x-1/2"
            animate={reduced ? {} : { y: [0, -5, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: colors.pin, boxShadow: `0 0 10px ${colors.glow}` }}
            />
          </motion.div>
        )}
      </motion.button>

      {/* Banner sign below the building */}
      <div
        className="px-3 py-1.5 rounded-lg text-center shadow-sm border"
        style={{
          background: 'rgba(255,255,255,0.85)',
          borderColor: isSelected ? colors.pin : '#E2E8F0',
          backdropFilter: 'blur(8px)',
          minWidth: 110,
        }}
      >
        <div
          className="text-[11px] font-black leading-tight"
          style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}
        >
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

  // Convert best score to grade
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
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #E7FBF3 0%, #E8F6FF 50%, #EEEAFE 100%)' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(155,93,229,0.15)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)' }}>
        <Link href="/">
          <button className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: '#5B5470' }}>
            <ArrowLeft size={16} />
            Back to Menu
          </button>
        </Link>

        <div className="flex items-center gap-2">
          <Map size={16} style={{ color: '#9B5DE5' }} />
          <h1 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
            Scenario Map
          </h1>
        </div>

        <div
          className="text-[11px] font-mono font-bold px-3 py-1 rounded-full"
          style={{ background: 'rgba(29,211,160,0.15)', color: '#1DD3A0', border: '1px solid rgba(29,211,160,0.3)' }}
        >
          {completed} / {SCENARIOS.length} cleared
        </div>
      </header>

      {/* World map area */}
      <div className="flex-1 relative overflow-auto">
        {/* Soft backdrop blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-[10%] w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #86EFAC 0%, transparent 70%)' }} />
          <div className="absolute bottom-20 right-[15%] w-60 h-60 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #93C5FD 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #C4B5FD 0%, transparent 70%)' }} />
        </div>

        {/* Nimbus hosting the map */}
        <motion.div
          className="absolute top-6 left-8 pointer-events-none"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={reduced ? { duration: 0 } : { ...spring, delay: 0.1 }}
        >
          <Nimbus state="point" size={80} />
          <div
            className="mt-1 px-3 py-1.5 rounded-xl text-xs font-medium max-w-[140px] leading-snug"
            style={{ background: 'rgba(255,255,255,0.9)', color: '#5B5470', border: '1px solid #E2E8F0' }}
          >
            Pick a mission and fix the broken stack!
          </div>
        </motion.div>

        {/* Scenario locations */}
        <div className="flex items-end gap-6 md:gap-10 px-8 pt-28 pb-24 min-w-max mx-auto" style={{ paddingLeft: '200px' }}>
          {SCENARIOS.map((scenario, i) => {
            const bestScore = bestScores[scenario.id];
            const bestGrade = bestScore !== undefined ? scoreToGrade(bestScore) : null;

            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: reduced ? 0 : 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduced ? { duration: 0 } : { ...spring, delay: i * 0.07 }}
                style={{
                  // Stagger heights for the map feel
                  marginBottom: [0, 30, 10, 50, 20][i % 5],
                }}
              >
                <LocationCard
                  scenario={scenario}
                  index={i}
                  bestGrade={bestGrade}
                  isSelected={selectedId === scenario.id}
                  onSelect={() => setSelectedId(selectedId === scenario.id ? null : scenario.id)}
                  onStart={handleStart}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Connecting road dashes */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%', zIndex: 0 }}
        >
          <defs>
            <pattern id="road-dash" patternUnits="userSpaceOnUse" width="16" height="4">
              <rect width="10" height="4" rx="2" fill="#CBD5E1" opacity="0.6" />
            </pattern>
          </defs>
        </svg>
      </div>

      {/* Scenario detail popover — fixed at bottom */}
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
              className="mx-auto max-w-2xl rounded-t-2xl p-6 shadow-2xl border-t border-x"
              style={{
                background: 'rgba(255,255,255,0.95)',
                borderColor: '#E2E8F0',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DifficultyStars difficulty={selectedScenario.difficulty} />
                    <span className="text-[10px] font-mono text-[#9A92AD] uppercase">{selectedScenario.difficulty}</span>
                    {bestScores[selectedScenario.id] !== undefined && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#1DD3A0]">
                        <CheckCircle2 size={10} />
                        Best: {Math.round(bestScores[selectedScenario.id])} pts
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
                    {selectedScenario.title}
                  </h2>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: '#5B5470' }}>
                    {selectedScenario.brief}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-[#9A92AD] hover:text-[#1B1733] transition-colors flex-shrink-0 text-lg leading-none"
                >
                  ×
                </button>
              </div>

              {/* Constraint badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Target RPS', value: selectedScenario.targetRps.toLocaleString() },
                  { label: 'Max Latency', value: `${selectedScenario.maxLatencyMs}ms` },
                  { label: 'Budget', value: `$${selectedScenario.budgetUsd}/mo` },
                  { label: 'SLA', value: `${(selectedScenario.slaAvailability * 100).toFixed(2)}%` },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-lg px-3 py-2 text-center"
                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                  >
                    <div className="text-[9px] font-bold uppercase text-[#9A92AD] mb-0.5">{label}</div>
                    <div className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#1B1733' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Start button */}
              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all hover:brightness-105 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #1DD3A0, #22B8FF)',
                  color: 'white',
                  fontFamily: 'var(--font-display)',
                  boxShadow: '0 4px 14px rgba(29,211,160,0.4)',
                }}
              >
                <Play size={16} fill="white" />
                Start Mission
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
