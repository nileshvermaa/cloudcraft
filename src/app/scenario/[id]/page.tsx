'use client';

import React, { useEffect, useState, use } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { AnimatePresence, motion } from 'motion/react';
import { Palette } from '@/components/canvas/Palette';
import { FlowCanvas } from '@/components/canvas/FlowCanvas';
import { Toolbar } from '@/components/canvas/Toolbar';
import { ChallengePanel } from '@/components/panels/ChallengePanel';
import { MetricsPanel } from '@/components/panels/MetricsPanel';
import { ResultDialog } from '@/components/panels/ResultDialog';
import { ConfigPanel } from '@/components/panels/ConfigPanel';
import { CastBar } from '@/components/cast/CastRenderer';
import { FailureVignette } from '@/components/cast/FailureVignette';
import { useGameStore } from '@/store/useGameStore';
import { SCENARIO_MAP } from '@/lib/scenarios';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

interface ScenarioPageProps {
  params: Promise<{ id: string }>;
}

export default function ScenarioPage({ params }: ScenarioPageProps) {
  const { id } = use(params);
  const { scenario, loadScenario, result, loadBestScores, nodes, paletteTheme, sceneBg } =
    useGameStore();
  const [showResult, setShowResult] = useState(false);
  const [showVignette, setShowVignette] = useState(false);

  const targetScenario = SCENARIO_MAP[id];

  useEffect(() => {
    loadBestScores();
    if (targetScenario) {
      loadScenario(targetScenario);
    }
  }, [id, targetScenario, loadScenario, loadBestScores]);

  // Open dialog when simulation finishes and yields a result
  useEffect(() => {
    if (result) {
      setShowResult(true);
      // Show vignette for failing grades after a brief delay
      if (result.grade === 'C' || result.grade === 'F') {
        const timer = setTimeout(() => setShowVignette(true), 400);
        return () => clearTimeout(timer);
      }
    }
  }, [result]);

  const selectedNode = nodes.find((n) => n.selected);
  const sceneClass = `scene-${sceneBg}`;
  const themeClass = `theme-${paletteTheme}`;

  if (!targetScenario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 relative">
        <div className="absolute w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="chrome-panel border border-[var(--color-chrome-border)] rounded-2xl p-8 max-w-sm text-center shadow-lg relative z-10">
          <AlertTriangle className="mx-auto text-amber-500 mb-4 animate-bounce" size={40} />
          <h2 className="font-display font-extrabold text-xl text-[var(--color-chrome-bright)] mb-2">
            Scenario Not Found
          </h2>
          <p className="text-sm text-[var(--color-chrome-text)] mb-6 leading-relaxed">
            The mission briefing you are looking for has been decommissioned or moved.
          </p>
          <Link href="/">
            <button className="h-9 text-[11px] font-black uppercase tracking-wider flex items-center justify-center mx-auto px-5 rounded-md bg-teal-400 text-slate-950 hover:bg-teal-300 transition-all shadow-[0_3px_0_#0D9488] active:shadow-none active:translate-y-[3px]">
              Return to Base
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className={`flex flex-col h-screen overflow-hidden ${themeClass}`}>
        {/* Toolbar */}
        <Toolbar title={`Scenario: ${targetScenario.title}`} backHref="/" />

        {/* Workspace */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Palette (240px) */}
          <div className="w-[240px] flex-shrink-0 h-full">
            <Palette />
          </div>

          {/* Center Canvas */}
          <div className={`flex-1 h-full relative ${sceneClass}`}>
            <FlowCanvas />

            {/* Cast Bar — anchored bottom-left of canvas */}
            <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
              <CastBar result={result} />
            </div>
          </div>

          {/* Right Sidebar (280px) */}
          <div className="w-[280px] flex-shrink-0 h-full chrome-panel border-y-0 border-r-0 border-l border-[var(--color-chrome-border)] overflow-y-auto flex flex-col justify-between z-20">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div
                  key="config"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <ConfigPanel node={selectedNode} />
                </motion.div>
              ) : (
                <motion.div
                  key="challenge"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <ChallengePanel />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Metrics Readout */}
            <div className="border-t border-[var(--color-chrome-border)] bg-slate-950/20 mt-auto">
              <MetricsPanel />
            </div>
          </div>
        </div>

        {/* Scoring result dialog */}
        <ResultDialog open={showResult} onClose={() => setShowResult(false)} />

        {/* Failure vignette */}
        <FailureVignette
          result={result}
          show={showVignette && !showResult}
          onDismiss={() => setShowVignette(false)}
        />
      </div>
    </ReactFlowProvider>
  );
}
