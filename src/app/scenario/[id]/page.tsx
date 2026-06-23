'use client';

import { useEffect, useRef, useState, use } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { AnimatePresence, motion } from 'motion/react';
import { BoardFrame } from '@/components/canvas/BoardFrame';
import { FlowCanvas } from '@/components/canvas/FlowCanvas';
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
  const { loadScenario, result, loadBestScores, nodes, paletteTheme, sceneBg } = useGameStore();
  const [showResult, setShowResult] = useState(false);
  const [showVignette, setShowVignette] = useState(false);

  const targetScenario = SCENARIO_MAP[id];

  useEffect(() => {
    loadBestScores();
    if (targetScenario) loadScenario(targetScenario);
  }, [id, targetScenario, loadScenario, loadBestScores]);

  const hasResult = result != null;
  const isFailingGrade = hasResult && (result.grade === 'C' || result.grade === 'F');
  const prevHasResult = useRef(hasResult);

  useEffect(() => {
    if (hasResult && !prevHasResult.current) setShowResult(true);
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
  const transition = { type: 'spring' as const, stiffness: 300, damping: 22 };

  if (!targetScenario) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-dvh p-6"
        style={{ background: 'linear-gradient(160deg, #EEEAFE 0%, #FFF7ED 55%, #FFEAF2 100%)' }}
      >
        <div className="rounded-3xl p-8 max-w-sm text-center" style={{ background: 'var(--color-panel)', border: '1px solid var(--color-panel-line)' }}>
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

  const rail = (
    <>
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedNode ? (
            <motion.div key="config" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={transition}>
              <ConfigPanel node={selectedNode} />
            </motion.div>
          ) : (
            <motion.div key="challenge" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={transition}>
              <ChallengePanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto" style={{ borderTop: '1px solid var(--color-panel-line)' }}>
        <MetricsPanel />
      </div>
    </>
  );

  return (
    <ReactFlowProvider>
      <BoardFrame
        title={targetScenario.title}
        backHref="/scenarios"
        themeClass={themeClass}
        sceneClass={sceneClass}
        rail={rail}
      >
        <FlowCanvas />
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
          <CastBar result={result} />
        </div>
      </BoardFrame>

      <ResultDialog open={showResult} onClose={() => setShowResult(false)} />
      <FailureVignette result={result} show={showVignette && !showResult} onDismiss={() => setShowVignette(false)} />
    </ReactFlowProvider>
  );
}
