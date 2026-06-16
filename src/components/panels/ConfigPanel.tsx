'use client';

import { useGameStore } from '@/store/useGameStore';
import { CATALOG } from '@/lib/catalog';
import type { ServiceNodeData, NodeConfig } from '@/types';
import type { Node } from '@xyflow/react';
import { Settings, Server, Globe, Sliders, Database, Layers } from 'lucide-react';

interface ConfigPanelProps {
  node: Node<ServiceNodeData>;
}

export function ConfigPanel({ node }: ConfigPanelProps) {
  const { updateConfig } = useGameStore();
  const spec = CATALOG[node.data.type];
  if (!spec) return null;

  const config = node.data.config ?? { size: 'medium', region: 'single-az' };

  // Helper to update partial config
  const handleUpdate = (updates: Partial<NodeConfig>) => {
    updateConfig(node.id, updates);
  };

  // Node label renamer
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update local label
    const newLabel = e.target.value || spec.label;
    useGameStore.setState((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n
      ),
    }));
  };

  // Determine which sections to show based on node category or type
  const isCompute = spec.category === 'compute';
  const isData = spec.category === 'data';
  const isCache = node.data.type === 'cache' || node.data.type === 'cdn';
  const isASG = node.data.type === 'autoScalingGroup' || node.data.type === 'containerCluster';
  const isDB = node.data.type === 'sqlPrimary' || node.data.type === 'nosqlDb';
  const isStorage = node.data.type === 'objectStorage';

  return (
    <div className="p-4 border-b border-[var(--color-chrome-border)] bg-slate-950/15 flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-[var(--color-chrome-border)]/50">
        <Settings size={12} className="text-teal-400 animate-spin" style={{ animationDuration: '8s' }} />
        <h3 className="text-[10px] font-bold text-[var(--color-chrome-bright)] uppercase tracking-wider">
          Node Configuration
        </h3>
      </div>

      {/* Rename Custom Label */}
      <div>
        <label className="text-[8px] font-black uppercase text-[var(--color-chrome-text)]/65 tracking-wider block mb-1">
          Custom Node Name
        </label>
        <input
          type="text"
          value={node.data.label}
          onChange={handleLabelChange}
          placeholder={spec.label}
          className="w-full h-8 px-2.5 rounded bg-[var(--color-chrome-soft)] border border-[var(--color-chrome-border)] text-xs text-[var(--color-chrome-bright)] focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* Sizing Tiers */}
      {(isCompute || isData || isCache) && (
        <div>
          <label className="text-[8px] font-black uppercase text-[var(--color-chrome-text)]/65 tracking-wider block mb-1.5 flex items-center gap-1">
            <Server size={10} className="text-teal-400" /> Instance Size (Multiplies Capacity & Cost)
          </label>
          <div className="grid grid-cols-4 gap-1">
            {(['small', 'medium', 'large', 'xlarge'] as const).map((sz) => {
              const isActive = config.size === sz || (!config.size && sz === 'medium');
              return (
                <button
                  key={sz}
                  onClick={() => handleUpdate({ size: sz })}
                  className={`py-1 rounded text-[9px] font-black uppercase transition-all duration-100 ${
                    isActive
                      ? 'bg-teal-400 text-slate-950 shadow-[0_0_8px_rgba(45,212,191,0.2)]'
                      : 'bg-[var(--color-chrome-soft)] text-[var(--color-chrome-text)] border border-[var(--color-chrome-border)] hover:bg-slate-700/50 cursor-pointer'
                  }`}
                >
                  {sz.replace('-instance', '')}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Regional Placement */}
      {(isCompute || isData || isCache || spec.type === 'loadBalancer' || spec.type === 'dns') && (
        <div>
          <label className="text-[8px] font-black uppercase text-[var(--color-chrome-text)]/65 tracking-wider block mb-1.5 flex items-center gap-1">
            <Globe size={10} className="text-cyan-400" /> Regional Availability
          </label>
          <div className="grid grid-cols-3 gap-1">
            {(['single-az', 'multi-az', 'multi-region'] as const).map((reg) => {
              const isActive = config.region === reg || (!config.region && reg === 'single-az');
              const labels: Record<string, string> = {
                'single-az': '1x AZ',
                'multi-az': 'Multi-AZ',
                'multi-region': 'Multi-Reg',
              };
              return (
                <button
                  key={reg}
                  onClick={() => handleUpdate({ region: reg })}
                  className={`py-1 rounded text-[9px] font-black uppercase transition-all duration-100 ${
                    isActive
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                      : 'bg-[var(--color-chrome-soft)] text-[var(--color-chrome-text)] border border-[var(--color-chrome-border)] hover:bg-slate-700/50 cursor-pointer'
                  }`}
                >
                  {labels[reg]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Autoscaling parameters */}
      {isASG && (
        <div className="flex flex-col gap-2 p-2.5 rounded bg-[var(--color-chrome-soft)]/30 border border-[var(--color-chrome-border)]/50">
          <label className="text-[8px] font-black uppercase text-teal-400 tracking-wider flex items-center gap-1">
            <Sliders size={10} /> Autoscaling Rules
          </label>
          <div>
            <div className="flex justify-between text-[9px] text-[var(--color-chrome-text)] mb-1 font-mono">
              <span>Min Units</span>
              <span>{config.autoscale?.min ?? 2}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={config.autoscale?.min ?? 2}
              onChange={(e) =>
                handleUpdate({
                  autoscale: {
                    min: Number(e.target.value),
                    max: Math.max(Number(e.target.value), config.autoscale?.max ?? 8),
                    targetUtil: config.autoscale?.targetUtil ?? 70,
                  },
                })
              }
              className="w-full h-1 accent-teal-400"
            />
          </div>
          <div>
            <div className="flex justify-between text-[9px] text-[var(--color-chrome-text)] mb-1 font-mono">
              <span>Max Units</span>
              <span>{config.autoscale?.max ?? 8}</span>
            </div>
            <input
              type="range"
              min={3}
              max={20}
              value={config.autoscale?.max ?? 8}
              onChange={(e) =>
                handleUpdate({
                  autoscale: {
                    min: Math.min(Number(e.target.value), config.autoscale?.min ?? 2),
                    max: Number(e.target.value),
                    targetUtil: config.autoscale?.targetUtil ?? 70,
                  },
                })
              }
              className="w-full h-1 accent-teal-400"
            />
          </div>
        </div>
      )}

      {/* Cache Rules */}
      {isCache && (
        <div className="flex flex-col gap-2.5 p-2.5 rounded bg-[var(--color-chrome-soft)]/30 border border-[var(--color-chrome-border)]/50">
          <label className="text-[8px] font-black uppercase text-pink-400 tracking-wider flex items-center gap-1">
            <Layers size={10} /> Cache Policy
          </label>
          <div className="grid grid-cols-3 gap-1">
            {(['read-through', 'write-through', 'write-back'] as const).map((p) => {
              const isActive = config.cachePolicy === p || (!config.cachePolicy && p === 'read-through');
              const shortLabel = p.split('-')[0];
              return (
                <button
                  key={p}
                  onClick={() => handleUpdate({ cachePolicy: p })}
                  className={`py-0.5 rounded text-[8px] font-bold uppercase transition-all duration-100 ${
                    isActive
                      ? 'bg-pink-400 text-slate-950 shadow-[0_0_8px_rgba(244,114,182,0.2)]'
                      : 'bg-[var(--color-chrome-soft)] text-[var(--color-chrome-text)] border border-[var(--color-chrome-border)] hover:bg-slate-700/50 cursor-pointer'
                  }`}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>
          <div>
            <div className="flex justify-between text-[9px] text-[var(--color-chrome-text)] mb-1 font-mono">
              <span>TTL</span>
              <span>{config.ttlSeconds ?? 120}s</span>
            </div>
            <input
              type="range"
              min={10}
              max={600}
              step={10}
              value={config.ttlSeconds ?? 120}
              onChange={(e) => handleUpdate({ ttlSeconds: Number(e.target.value) })}
              className="w-full h-1 accent-pink-400"
            />
          </div>
        </div>
      )}

      {/* DB Replication */}
      {isDB && (
        <div className="flex flex-col gap-2.5 p-2.5 rounded bg-[var(--color-chrome-soft)]/30 border border-[var(--color-chrome-border)]/50">
          <label className="text-[8px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1">
            <Database size={10} /> DB Replication
          </label>
          <div className="grid grid-cols-2 gap-1">
            {(['sync', 'async'] as const).map((mode) => {
              const isActive = config.replication?.mode === mode || (!config.replication?.mode && mode === 'async');
              return (
                <button
                  key={mode}
                  onClick={() =>
                    handleUpdate({
                      replication: {
                        factor: config.replication?.factor ?? 2,
                        mode,
                      },
                    })
                  }
                  className={`py-0.5 rounded text-[8px] font-bold uppercase transition-all duration-100 ${
                    isActive
                      ? 'bg-indigo-400 text-slate-950'
                      : 'bg-[var(--color-chrome-soft)] text-[var(--color-chrome-text)] border border-[var(--color-chrome-border)] hover:bg-slate-700/50 cursor-pointer'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
          <div>
            <div className="flex justify-between text-[9px] text-[var(--color-chrome-text)] mb-1 font-mono">
              <span>Repl Factor</span>
              <span>{config.replication?.factor ?? 2}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={config.replication?.factor ?? 2}
              onChange={(e) =>
                handleUpdate({
                  replication: {
                    factor: Number(e.target.value),
                    mode: config.replication?.mode ?? 'async',
                  },
                })
              }
              className="w-full h-1 accent-indigo-400"
            />
          </div>
        </div>
      )}

      {/* Storage Class */}
      {isStorage && (
        <div>
          <label className="text-[8px] font-black uppercase text-[var(--color-chrome-text)]/65 tracking-wider block mb-1.5">
            Storage Class Tier
          </label>
          <div className="grid grid-cols-3 gap-1">
            {(['hot', 'warm', 'cold'] as const).map((cls) => {
              const isActive = config.storageClass === cls || (!config.storageClass && cls === 'hot');
              return (
                <button
                  key={cls}
                  onClick={() => handleUpdate({ storageClass: cls })}
                  className={`py-1 rounded text-[9px] font-black uppercase transition-all duration-100 ${
                    isActive
                      ? 'bg-blue-400 text-slate-950 shadow-[0_0_8px_rgba(96,165,250,0.2)]'
                      : 'bg-[var(--color-chrome-soft)] text-[var(--color-chrome-text)] border border-[var(--color-chrome-border)] hover:bg-slate-700/50 cursor-pointer'
                  }`}
                >
                  {cls}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
