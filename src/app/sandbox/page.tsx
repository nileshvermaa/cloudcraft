'use client';

import { useEffect, useRef, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { AnimatePresence, motion } from 'motion/react';
import { Palette } from '@/components/canvas/Palette';
import { FlowCanvas } from '@/components/canvas/FlowCanvas';
import { Toolbar } from '@/components/canvas/Toolbar';
import { LoadDial } from '@/components/canvas/LoadDial';
import { MetricsPanel } from '@/components/panels/MetricsPanel';
import { ConfigPanel } from '@/components/panels/ConfigPanel';
import { CosmeticPanel } from '@/components/panels/CosmeticPanel';
import { CastBar } from '@/components/cast/CastRenderer';
import { FailureVignette } from '@/components/cast/FailureVignette';
import { useGameStore } from '@/store/useGameStore';
import { PRESETS } from '@/lib/presets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Compass, Palette as PaletteIcon } from 'lucide-react';

export default function SandboxPage() {
  const {
    preset,
    startSandbox,
    loadBestScores,
    nodes,
    result,
    paletteTheme,
    sceneBg,
  } = useGameStore();

  const [showCosmetics, setShowCosmetics] = useState(false);
  const [showVignette, setShowVignette] = useState(false);

  useEffect(() => {
    loadBestScores();
    startSandbox(PRESETS[0]);
  }, [startSandbox, loadBestScores]);

  // Show vignette whenever a failing result arrives
  const shouldShowVignette = result != null && result.grade !== 'S' && result.grade !== 'A' && result.grade !== 'B';
  const prevShouldShow = useRef(shouldShowVignette);
  useEffect(() => {
    if (shouldShowVignette) {
      const timer = setTimeout(() => setShowVignette(true), 600);
      return () => clearTimeout(timer);
    }
    // Transitioned from showing to not-showing
    if (prevShouldShow.current && !shouldShowVignette) {
      setShowVignette(false);
    }
    prevShouldShow.current = shouldShowVignette;
  }, [shouldShowVignette]);

  const handlePresetChange = (presetId: string) => {
    const selected = PRESETS.find((p) => p.id === presetId);
    if (selected) {
      startSandbox(selected);
    }
  };

  const selectedNode = nodes.find((n) => n.selected);

  const sceneClass = `scene-${sceneBg}`;
  const themeClass = `theme-${paletteTheme}`;

  return (
    <ReactFlowProvider>
      <div className={`flex flex-col h-screen overflow-hidden ${themeClass}`}>
        {/* Toolbar */}
        <Toolbar title="Sandbox / Freestyle Board" backHref="/" />

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
          <div className="w-[280px] flex-shrink-0 h-full chrome-panel border-y-0 border-r-0 border-l border-[var(--color-chrome-border)] overflow-y-auto flex flex-col z-20">
            {/* Tab switcher: Config vs Cosmetics (only when no node selected) */}
            {!selectedNode && (
              <div className="flex" style={{ borderBottom: '1px solid var(--color-panel-line)' }}>
                <button
                  onClick={() => setShowCosmetics(false)}
                  className="flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
                  style={
                    !showCosmetics
                      ? { color: '#1B1733', borderBottom: '2px solid #1DD3A0' }
                      : { color: '#9A92AD' }
                  }
                >
                  Setup
                </button>
                <button
                  onClick={() => setShowCosmetics(true)}
                  className="flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                  style={
                    showCosmetics
                      ? { color: '#1B1733', borderBottom: '2px solid #1DD3A0' }
                      : { color: '#9A92AD' }
                  }
                >
                  <PaletteIcon size={11} />
                  Style
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
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
                ) : showCosmetics ? (
                  <motion.div
                    key="cosmetics"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    <CosmeticPanel />
                  </motion.div>
                ) : (
                  <motion.div
                    key="setup"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    {/* Preset Selector */}
                    <div className="p-3.5" style={{ borderBottom: '1px solid var(--color-panel-line)' }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Compass size={12} style={{ color: '#9B5DE5' }} />
                        <h3 className="text-[11px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
                          Product Preset
                        </h3>
                      </div>
                      <Select
                        value={preset?.id ?? 'freestyle'}
                        onValueChange={handlePresetChange}
                      >
                        <SelectTrigger className="w-full h-9 text-[12px] rounded-lg bg-[#FFFCF5] border-[var(--color-panel-line)] text-[#1B1733] focus:ring-0 focus:ring-offset-0 focus:border-[#1DD3A0]">
                          <SelectValue placeholder="Select a preset" />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--color-panel)] border-[var(--color-panel-line)] text-[#1B1733] text-[12px]">
                          {PRESETS.map((p) => (
                            <SelectItem
                              key={p.id}
                              value={p.id}
                              className="text-[12px] cursor-pointer focus:bg-[#FFFCF5] focus:text-[#1B1733]"
                            >
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

                    {/* Load Dial */}
                    <LoadDial />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Metrics Readout */}
            <div className="mt-auto" style={{ borderTop: '1px solid var(--color-panel-line)' }}>
              <MetricsPanel />
            </div>
          </div>
        </div>

        {/* Failure Vignette overlay */}
        <FailureVignette
          result={result}
          show={showVignette}
          onDismiss={() => setShowVignette(false)}
        />
      </div>
    </ReactFlowProvider>
  );
}
