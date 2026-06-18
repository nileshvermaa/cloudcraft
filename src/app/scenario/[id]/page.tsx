'use client';

import React, { useEffect, useRef, useState, use } from 'react';
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
import { PillButton } from '@/components/ui/PillButton';

interface ScenarioPageProps {
  params: Promise<{ id: string }>;
}

export default function ScenarioPage({ params }: ScenarioPageProps) {
  const { id } = use(params);
  const { loadScenario, result, loadBestScores, nodes, paletteTheme, sceneBg } =
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
  const hasResult = result != null;
  const isFailingGrade = hasResult && (result.grade === 'C' || result.grade === 'F');
  const prevHasResult = useRef(hasResult);

  useEffect(() => {
    if (hasResult && !prevHasResult.current) {
      setShowResult(true);
    }
    prevHasResult.current = hasResult;
  }, [hasResult]);

  useEffect(() => {
    if (!isFailingGrade) return;
    const timer = setTimeout(() => setShowVignette(true), 400);
    return () => clearTimeout(timer);
  }, [isFailingGrade]);

  const selectedNode = nodes.find((n) => n.selected);
  const sceneClass = `scene-${sceneBg}`;
  const themeClass = `theme-${paletteTheme}`;

  if (!targetScenario) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-6"
        style={{ background: 'linear-gradient(160deg, #EEEAFE 0%, #FFF7ED 55%, #FFEAF2 100%)' }}
      >
        <div
          className="rounded-3xl p-8 max-w-sm text-center"
          style={{ background: 'var(--color-panel)', border: '1px solid var(--color-panel-line)' }}
        >
          <AlertTriangle className="mx-auto mb-4" style={{ color: '#FFB81C' }} size={40} />
          <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
            Scenario not found
          </h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: '#5B5470' }}>
            That mission has been decommissioned or moved.
          </p>
          <Link href="/" className="inline-block">
            <PillButton variant="primary" size="sm">Back to menu</PillButton>
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
            <div className="mt-auto" style={{ borderTop: '1px solid var(--color-panel-line)' }}>
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
