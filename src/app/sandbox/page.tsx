'use client';

import { useEffect, useRef, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { AnimatePresence, motion } from 'motion/react';
import { BoardFrame } from '@/components/canvas/BoardFrame';
import { FlowCanvas } from '@/components/canvas/FlowCanvas';
import { LoadDial } from '@/components/canvas/LoadDial';
import { MetricsPanel } from '@/components/panels/MetricsPanel';
import { ConfigPanel } from '@/components/panels/ConfigPanel';
import { CosmeticPanel } from '@/components/panels/CosmeticPanel';
import { CastBar } from '@/components/cast/CastRenderer';
import { TutorialCoach } from '@/components/canvas/TutorialCoach';
import { StressPanel } from '@/components/canvas/StressPanel';
import { FailureVignette } from '@/components/cast/FailureVignette';
import { PillButton } from '@/components/ui/PillButton';
import { useGameStore } from '@/store/useGameStore';
import { PRESETS } from '@/lib/presets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Compass, Palette as PaletteIcon, Gauge } from 'lucide-react';

export default function SandboxPage() {
  const { preset, startSandbox, loadBestScores, nodes, result, paletteTheme, sceneBg, runStressTest, isStressing } = useGameStore();

  const [showCosmetics, setShowCosmetics] = useState(false);
  const [showVignette, setShowVignette] = useState(false);

  useEffect(() => {
    loadBestScores();
    startSandbox(PRESETS[0]);
  }, [startSandbox, loadBestScores]);

  const shouldShowVignette =
    result != null && result.grade !== 'S' && result.grade !== 'A' && result.grade !== 'B';
  const prevShouldShow = useRef(shouldShowVignette);
  useEffect(() => {
    if (shouldShowVignette) {
      const timer = setTimeout(() => setShowVignette(true), 600);
      return () => clearTimeout(timer);
    }
    if (prevShouldShow.current && !shouldShowVignette) {
      setShowVignette(false);
    }
    prevShouldShow.current = shouldShowVignette;
  }, [shouldShowVignette]);

  const handlePresetChange = (presetId: string) => {
    const selected = PRESETS.find((p) => p.id === presetId);
    if (selected) startSandbox(selected);
  };

  const selectedNode = nodes.find((n) => n.selected);
  const sceneClass = `scene-${sceneBg}`;
  const themeClass = `theme-${paletteTheme}`;

  const transition = { type: 'spring' as const, stiffness: 300, damping: 22 };

  const rail = (
    <>
      {/* Tab switcher: Setup vs Style (only when no node selected) */}
      {!selectedNode && (
        <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid var(--color-panel-line)' }}>
          <button
            onClick={() => setShowCosmetics(false)}
            className="flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
            style={!showCosmetics ? { color: '#1B1733', borderBottom: '2px solid #1DD3A0' } : { color: '#9A92AD' }}
          >
            Setup
          </button>
          <button
            onClick={() => setShowCosmetics(true)}
            className="flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
            style={showCosmetics ? { color: '#1B1733', borderBottom: '2px solid #1DD3A0' } : { color: '#9A92AD' }}
          >
            <PaletteIcon size={11} />
            Style
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedNode ? (
            <motion.div key="config" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={transition}>
              <ConfigPanel node={selectedNode} />
            </motion.div>
          ) : showCosmetics ? (
            <motion.div key="cosmetics" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={transition}>
              <CosmeticPanel />
            </motion.div>
          ) : (
            <motion.div key="setup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={transition}>
              {/* Preset Selector */}
              <div className="p-3.5" style={{ borderBottom: '1px solid var(--color-panel-line)' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Compass size={12} style={{ color: '#9B5DE5' }} />
                  <h3 className="text-[11px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
                    Product Preset
                  </h3>
                </div>
                <Select value={preset?.id ?? 'freestyle'} onValueChange={handlePresetChange}>
                  <SelectTrigger className="w-full h-9 text-[12px] rounded-lg bg-[#FFFCF5] border-[var(--color-panel-line)] text-[#1B1733] focus:ring-0 focus:ring-offset-0 focus:border-[#1DD3A0]">
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-panel)] border-[var(--color-panel-line)] text-[#1B1733] text-[12px]">
                    {PRESETS.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-[12px] cursor-pointer focus:bg-[#FFFCF5] focus:text-[#1B1733]">
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {preset && (
                  <p className="text-[10px] mt-2 leading-relaxed" style={{ color: '#9A92AD' }}>
                    {preset.hint}
                  </p>
                )}
              </div>

              <LoadDial />

              {/* Stress test — ramp load to the breaking point */}
              <div className="p-3.5" style={{ borderBottom: '1px solid var(--color-panel-line)' }}>
                <PillButton variant="secondary" size="sm" block icon={<Gauge size={14} />} onClick={runStressTest} disabled={isStressing}>
                  {isStressing ? 'Stress testing…' : 'Stress test'}
                </PillButton>
              </div>

              <StressPanel />
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
      <BoardFrame title="Sandbox" backHref="/" themeClass={themeClass} sceneClass={sceneClass} rail={rail}>
        <FlowCanvas />
        <TutorialCoach />
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
          <CastBar result={result} />
        </div>
      </BoardFrame>

      <FailureVignette result={result} show={showVignette} onDismiss={() => setShowVignette(false)} />
    </ReactFlowProvider>
  );
}
