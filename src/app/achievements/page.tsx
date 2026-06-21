'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import {
  ChevronLeft, Trophy, GraduationCap, Flag, Star, Sparkles, Crown, Zap, Building2, Users, Lock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { SCENARIOS } from '@/lib/scenarios';

const spring = { type: 'spring' as const, stiffness: 260, damping: 22 };
const PAGE_BG = 'linear-gradient(180deg, #EEEAFE 0%, #FFF7ED 100%)';

const starsFor = (s: number) => (s >= 80 ? 3 : s >= 65 ? 2 : s >= 45 ? 1 : 0);

interface AchDef {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  earned: boolean;
  progress?: { cur: number; max: number };
}

export default function AchievementsPage() {
  const reduced = useReducedMotion();
  const { bestScores, bestSandboxLoad, unlockedCharacters, tutorialSeen, loadBestScores } = useGameStore();

  useEffect(() => {
    loadBestScores();
  }, [loadBestScores]);

  const cleared = Object.keys(bestScores).length;
  const totalStars = Object.values(bestScores).reduce((a, v) => a + starsFor(v), 0);
  const bestScore = Object.values(bestScores).reduce((a, v) => Math.max(a, v), 0);
  const maxLoad = Object.values(bestSandboxLoad).reduce((a, v) => Math.max(a, v), 0);
  const charCount = unlockedCharacters.length;

  const achievements: AchDef[] = [
    { id: 'tutorial', name: 'Getting Started', desc: 'Finish the sandbox tutorial.', icon: GraduationCap, color: '#1DD3A0', earned: tutorialSeen },
    { id: 'first', name: 'First Blood', desc: 'Clear your first mission.', icon: Flag, color: '#22B8FF', earned: cleared >= 1 },
    { id: 'stars10', name: 'Star Collector', desc: 'Earn 10 total stars.', icon: Star, color: '#FFB81C', earned: totalStars >= 10, progress: { cur: Math.min(totalStars, 10), max: 10 } },
    { id: 'perfect', name: 'Perfectionist', desc: 'Earn an S grade (95+).', icon: Sparkles, color: '#9B5DE5', earned: bestScore >= 95 },
    { id: 'load', name: 'Load Lord', desc: 'Survive 100k RPS in the sandbox.', icon: Zap, color: '#FF8A3D', earned: maxLoad >= 100_000 },
    { id: 'architect', name: 'Master Architect', desc: 'Clear every mission.', icon: Building2, color: '#3D5AFE', earned: cleared >= SCENARIOS.length, progress: { cur: cleared, max: SCENARIOS.length } },
    { id: 'allstar', name: 'All-Star', desc: 'Earn 30 total stars.', icon: Crown, color: '#FF6FA5', earned: totalStars >= 30, progress: { cur: Math.min(totalStars, 30), max: 30 } },
    { id: 'collector', name: 'Full Roster', desc: 'Unlock every character.', icon: Users, color: '#64748B', earned: charCount >= 5, progress: { cur: charCount, max: 5 } },
  ];

  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: PAGE_BG }}>
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
          <Trophy size={16} style={{ color: '#FFB81C' }} />
          <h1 className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
            Achievements
          </h1>
        </div>
        <div
          className="text-[11px] font-bold px-3 py-1 rounded-full"
          style={{ background: '#FFF7D6', color: '#9A6B00', border: '1px solid #F2D98A', fontFamily: 'var(--font-jetbrains)' }}
        >
          {earnedCount} / {achievements.length}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div
                key={a.id}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{
                  background: a.earned ? '#FFFCF5' : 'rgba(255,252,245,0.6)',
                  border: `2px solid ${a.earned ? a.color : 'var(--color-panel-line)'}`,
                  opacity: a.earned ? 1 : 0.7,
                }}
                initial={{ opacity: 0, y: reduced ? 0 : 14 }}
                animate={{ opacity: a.earned ? 1 : 0.7, y: 0 }}
                transition={reduced ? { duration: 0 } : { ...spring, delay: i * 0.05 }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: a.earned ? a.color : '#ECE0C8' }}
                >
                  {a.earned ? <Icon size={22} color="white" /> : <Lock size={18} color="#9A92AD" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
                    {a.name}
                  </div>
                  <div className="text-[12px] leading-snug" style={{ color: '#9A92AD' }}>{a.desc}</div>
                  {a.progress && !a.earned && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#EFE6D3' }}>
                        <div className="h-full rounded-full" style={{ width: `${(a.progress.cur / a.progress.max) * 100}%`, background: a.color }} />
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: '#9A92AD', fontFamily: 'var(--font-jetbrains)' }}>
                        {a.progress.cur}/{a.progress.max}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
