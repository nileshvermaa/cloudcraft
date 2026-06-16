'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ModeCard } from '@/components/home/ModeCard';
import { ScenarioCard } from '@/components/home/ScenarioCard';
import { SCENARIOS } from '@/lib/scenarios';
import { useGameStore } from '@/store/useGameStore';
import { Nimbus, PingsLayer } from '@/components/cast/CastRenderer';
import { Cpu, Zap, Layout, Hammer, Terminal, Map, Package, Settings } from 'lucide-react';
import Link from 'next/link';

const spring = { type: 'spring' as const, stiffness: 260, damping: 22 };

export default function HomePage() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { bestScores, loadBestScores, startSandbox } = useGameStore();
  const [showScenarios, setShowScenarios] = useState(false);

  useEffect(() => {
    loadBestScores();
  }, [loadBestScores]);

  const handleStartSandbox = () => {
    startSandbox();
    router.push('/sandbox');
  };

  const handleSelectScenario = (id: string) => {
    router.push(`/scenario/${id}`);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col justify-between"
      style={{ background: 'linear-gradient(160deg, #EEEAFE 0%, #FFF7ED 55%, #FFEAF2 100%)' }}
    >
      {/* ── Soft floating backdrop blobs ─────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large soft orbs */}
        <div
          className="absolute -top-24 -left-20 w-[520px] h-[520px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, #C4B5FD 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[30%] -right-32 w-[440px] h-[440px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #86EFAC 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-[30%] w-[360px] h-[360px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #FCA5A5 0%, transparent 70%)' }}
        />

        {/* Floating isometric cubes — candy palette */}
        {[
          { x: '8%',  y: '18%', s: 50, c1: '#9B5DE5', c2: '#8852CA', c3: '#7849B2', delay: 0 },
          { x: '88%', y: '38%', s: 68, c1: '#22B8FF', c2: '#1EA2E0', c3: '#1A8FC7', delay: 1.5 },
          { x: '75%', y: '72%', s: 38, c1: '#FF6FA5', c2: '#E06191', c3: '#C75681', delay: 0.8 },
          { x: '15%', y: '68%', s: 44, c1: '#1DD3A0', c2: '#19B98C', c3: '#16A47D', delay: 2.1 },
          { x: '50%', y: '8%',  s: 32, c1: '#FF8A3D', c2: '#E07935', c3: '#C76C2F', delay: 0.4 },
        ].map((cube, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: cube.x, top: cube.y }}
            animate={reduced ? {} : {
              y: [0, -14, 0],
              rotate: [0, cube.delay % 2 === 0 ? 4 : -4, 0],
            }}
            transition={reduced ? {} : {
              duration: 6 + cube.delay,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: cube.delay,
            }}
          >
            <svg width={cube.s} height={cube.s} viewBox="0 0 32 32" opacity={0.4}>
              <polygon points="16,3 29,10 16,17 3,10" fill={cube.c1} />
              <polygon points="3,10 16,17 16,27 3,20" fill={cube.c2} />
              <polygon points="29,10 16,17 16,27 29,20" fill={cube.c3} />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="relative max-w-5xl mx-auto px-6 py-14 w-full flex-grow flex flex-col justify-center">

        {/* Hero */}
        <motion.div
          className="text-center mb-12 select-none"
          initial={{ opacity: 0, y: reduced ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { ...spring, delay: 0.05 }}
        >
          {/* Nimbus + version pill */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Nimbus state="idle" size={72} />
            <div className="text-left">
              <div className="inline-flex items-center gap-2 mb-1.5 px-3 py-1 rounded-full border shadow-md"
                style={{ background: 'rgba(255,255,255,0.7)', borderColor: '#DDD6FE' }}>
                <Cpu size={11} className="text-violet-500" />
                <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-violet-600 uppercase">
                  Simulation Console v3.0
                </span>
              </div>
              <h1
                className="text-5xl md:text-6xl font-black leading-none tracking-tight"
                style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}
              >
                CloudCraft<span style={{ color: '#1DD3A0' }}>.</span>Studio
              </h1>
            </div>
          </div>

          {/* Tagline */}
          <div
            className="text-[10px] font-black tracking-[0.3em] uppercase mb-4"
            style={{ color: '#9B5DE5', fontFamily: 'var(--font-mono)' }}
          >
            Build it • Break it • Scale it
          </div>

          <p
            className="text-[15px] max-w-md mx-auto leading-relaxed font-medium"
            style={{ color: '#5B5470' }}
          >
            Architect systems on an isometric workbench, inject heavy traffic loads,
            and watch where the nodes fail — and why.
          </p>
        </motion.div>

        {/* Mode cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full mb-10"
          initial={{ opacity: 0, y: reduced ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { ...spring, delay: 0.15 }}
        >
          <ModeCard
            title="Sandbox Workbench"
            description="Build whatever you want on an empty board. Crank up traffic to 1M RPS to stress-test your abstractions and watch them overflow."
            icon={<Hammer size={20} className="text-teal-400" />}
            actionText="ENTER WORKBENCH"
            onClick={handleStartSandbox}
            accentColor="var(--color-cat-compute)"
          />

          <ModeCard
            title="Mission Simulator"
            description="Diagnose and repair pre-existing broken deployments. Re-wire to meet strict latency, SLA, and budget bounds to earn high scores."
            icon={<Layout size={20} className="text-violet-400" />}
            actionText="LAUNCH MISSIONS"
            onClick={() => router.push('/scenarios')}
            accentColor="var(--color-cat-source)"
          />
        </motion.div>

        {/* Scenarios grid */}
        <AnimatePresence>
          {showScenarios && (
            <motion.div
              className="max-w-3xl mx-auto w-full"
              style={{ borderTop: '1px solid rgba(155,93,229,0.2)', paddingTop: '2.5rem' }}
              initial={{ opacity: 0, y: reduced ? 0 : 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              transition={reduced ? { duration: 0 } : spring}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-violet-500" />
                  <h3
                    className="font-black text-xl tracking-wide uppercase"
                    style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}
                  >
                    Mission Directory
                  </h3>
                </div>
                <span
                  className="text-[10px] font-mono uppercase"
                  style={{ color: '#9A92AD' }}
                >
                  {SCENARIOS.length} deployments active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SCENARIOS.map((scenario, i) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: reduced ? 0 : 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduced ? { duration: 0 } : { ...spring, delay: i * 0.05 }}
                  >
                    <ScenarioCard
                      scenario={scenario}
                      bestScore={bestScores[scenario.id]}
                      onClick={() => handleSelectScenario(scenario.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle Pings wandering on menu */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <PingsLayer count={5} state="happy" />
        </div>
      </div>

      {/* Footer */}
      <footer
        className="relative text-center py-5 text-[10px] font-mono border-t"
        style={{
          color: '#9A92AD',
          borderColor: 'rgba(155,93,229,0.15)',
          background: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>CloudCraft Studio • v3.0 — Dumb Ways Your Stack Dies</span>
          <div className="flex gap-4 items-center">
            <Link href="/scenarios">
              <button className="flex items-center gap-1.5 text-[10px] uppercase font-bold hover:opacity-80 transition-opacity" style={{ color: '#22B8FF' }}>
                <Map size={10} /> Scenario Map

              </button>
            </Link>
            <Link href="/collection">
              <button className="flex items-center gap-1.5 text-[10px] uppercase font-bold hover:opacity-80 transition-opacity" style={{ color: '#FF6FA5' }}>
                <Package size={10} /> Collection
              </button>
            </Link>
            <Link href="/settings">
              <button className="flex items-center gap-1.5 text-[10px] uppercase font-bold hover:opacity-80 transition-opacity" style={{ color: '#9A92AD' }}>
                <Settings size={10} /> Settings
              </button>
            </Link>
            <span className="flex items-center gap-1.5 uppercase font-bold" style={{ color: '#1DD3A0' }}>
              <Zap size={10} className="animate-pulse" /> Simulation Ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
