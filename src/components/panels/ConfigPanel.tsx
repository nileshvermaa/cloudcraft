'use client';

import { useGameStore } from '@/store/useGameStore';
import { CATALOG } from '@/lib/catalog';
import type { ServiceNodeData, NodeConfig } from '@/types';
import type { Node } from '@xyflow/react';
import { Settings, Server, Globe, Sliders, Database, Layers } from 'lucide-react';

interface ConfigPanelProps {
  node: Node<ServiceNodeData>;
}

/** Segmented choice row with a candy accent. */
function Segmented<T extends string>({
  options, value, onChange, accent,
}: { options: { v: T; label: string }[]; value: T; onChange: (v: T) => void; accent: string }) {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map(({ v, label }) => {
        const active = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className="py-1.5 rounded-lg text-[9.5px] font-bold uppercase transition-all duration-100 cursor-pointer"
            style={
              active
                ? { background: accent, color: '#fff' }
                : { background: '#FFFCF5', border: '1px solid var(--color-panel-line)', color: '#5B5470' }
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Label({ icon, children, color = '#9A92AD' }: { icon?: React.ReactNode; children: React.ReactNode; color?: string }) {
  return (
    <label className="text-[9px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1" style={{ color }}>
      {icon}{children}
    </label>
  );
}

export function ConfigPanel({ node }: ConfigPanelProps) {
  const { updateConfig } = useGameStore();
  const spec = CATALOG[node.data.type];
  if (!spec) return null;

  const config = node.data.config ?? { size: 'medium', region: 'single-az' };

  const handleUpdate = (updates: Partial<NodeConfig>) => updateConfig(node.id, updates);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value || spec.label;
    useGameStore.setState((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n
      ),
    }));
  };

  const isCompute = spec.category === 'compute';
  const isData = spec.category === 'data';
  const isCache = node.data.type === 'cache' || node.data.type === 'cdn';
  const isASG = node.data.type === 'autoScalingGroup' || node.data.type === 'containerCluster';
  const isDB = node.data.type === 'sqlPrimary' || node.data.type === 'nosqlDb';
  const isStorage = node.data.type === 'objectStorage';

  return (
    <div className="p-4 flex flex-col gap-4" style={{ borderBottom: '1px solid var(--color-panel-line)' }}>
      {/* Header */}
      <div className="flex items-center gap-1.5 pb-2" style={{ borderBottom: '1px solid var(--color-panel-line)' }}>
        <Settings size={13} style={{ color: '#9B5DE5' }} />
        <h3 className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
          Configure
        </h3>
      </div>

      {/* Custom name */}
      <div>
        <Label>Name</Label>
        <input
          type="text"
          value={node.data.label}
          onChange={handleLabelChange}
          placeholder={spec.label}
          className="w-full h-8 px-2.5 rounded-lg text-xs focus:outline-none"
          style={{ background: '#FFFCF5', border: '1px solid var(--color-panel-line)', color: '#1B1733' }}
        />
      </div>

      {/* Size */}
      {(isCompute || isData || isCache) && (
        <div>
          <Label icon={<Server size={10} style={{ color: '#1DD3A0' }} />}>Instance Size</Label>
          <Segmented
            accent="#1DD3A0"
            value={config.size ?? 'medium'}
            onChange={(size) => handleUpdate({ size })}
            options={[
              { v: 'small', label: 'S' }, { v: 'medium', label: 'M' },
              { v: 'large', label: 'L' }, { v: 'xlarge', label: 'XL' },
            ]}
          />
        </div>
      )}

      {/* Region */}
      {(isCompute || isData || isCache || spec.type === 'loadBalancer' || spec.type === 'dns') && (
        <div>
          <Label icon={<Globe size={10} style={{ color: '#22B8FF' }} />}>Region</Label>
          <Segmented
            accent="#22B8FF"
            value={config.region ?? 'single-az'}
            onChange={(region) => handleUpdate({ region })}
            options={[
              { v: 'single-az', label: '1 AZ' }, { v: 'multi-az', label: 'Multi-AZ' },
              { v: 'multi-region', label: 'Multi-Reg' },
            ]}
          />
        </div>
      )}

      {/* Autoscaling */}
      {isASG && (
        <div className="flex flex-col gap-2.5 p-2.5 rounded-xl" style={{ background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}>
          <Label icon={<Sliders size={10} style={{ color: '#1DD3A0' }} />} color="#1DA97F">Autoscaling</Label>
          {(['min', 'max'] as const).map((k) => (
            <div key={k}>
              <div className="flex justify-between text-[9px] mb-1" style={{ color: '#5B5470', fontFamily: 'var(--font-jetbrains)' }}>
                <span>{k === 'min' ? 'Min Units' : 'Max Units'}</span>
                <span>{config.autoscale?.[k] ?? (k === 'min' ? 2 : 8)}</span>
              </div>
              <input
                type="range"
                min={k === 'min' ? 1 : 3}
                max={k === 'min' ? 5 : 20}
                value={config.autoscale?.[k] ?? (k === 'min' ? 2 : 8)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const cur = config.autoscale ?? { min: 2, max: 8, targetUtil: 70 };
                  handleUpdate({
                    autoscale: k === 'min'
                      ? { ...cur, min: val, max: Math.max(val, cur.max) }
                      : { ...cur, max: val, min: Math.min(val, cur.min) },
                  });
                }}
                className="w-full h-1"
                style={{ accentColor: '#1DD3A0' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Cache */}
      {isCache && (
        <div className="flex flex-col gap-2.5 p-2.5 rounded-xl" style={{ background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}>
          <Label icon={<Layers size={10} style={{ color: '#FF6FA5' }} />} color="#D14E84">Cache Policy</Label>
          <Segmented
            accent="#FF6FA5"
            value={config.cachePolicy ?? 'read-through'}
            onChange={(cachePolicy) => handleUpdate({ cachePolicy })}
            options={[
              { v: 'read-through', label: 'Read' }, { v: 'write-through', label: 'Write' },
              { v: 'write-back', label: 'Back' },
            ]}
          />
          <div>
            <div className="flex justify-between text-[9px] mb-1" style={{ color: '#5B5470', fontFamily: 'var(--font-jetbrains)' }}>
              <span>TTL</span><span>{config.ttlSeconds ?? 120}s</span>
            </div>
            <input
              type="range" min={10} max={600} step={10}
              value={config.ttlSeconds ?? 120}
              onChange={(e) => handleUpdate({ ttlSeconds: Number(e.target.value) })}
              className="w-full h-1" style={{ accentColor: '#FF6FA5' }}
            />
          </div>
        </div>
      )}

      {/* DB replication */}
      {isDB && (
        <div className="flex flex-col gap-2.5 p-2.5 rounded-xl" style={{ background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}>
          <Label icon={<Database size={10} style={{ color: '#3D5AFE' }} />} color="#2A3FB8">Replication</Label>
          <Segmented
            accent="#3D5AFE"
            value={config.replication?.mode ?? 'async'}
            onChange={(mode) => handleUpdate({ replication: { factor: config.replication?.factor ?? 2, mode } })}
            options={[{ v: 'sync', label: 'Sync' }, { v: 'async', label: 'Async' }]}
          />
          <div>
            <div className="flex justify-between text-[9px] mb-1" style={{ color: '#5B5470', fontFamily: 'var(--font-jetbrains)' }}>
              <span>Replicas</span><span>{config.replication?.factor ?? 2}×</span>
            </div>
            <input
              type="range" min={1} max={5}
              value={config.replication?.factor ?? 2}
              onChange={(e) => handleUpdate({ replication: { factor: Number(e.target.value), mode: config.replication?.mode ?? 'async' } })}
              className="w-full h-1" style={{ accentColor: '#3D5AFE' }}
            />
          </div>
        </div>
      )}

      {/* Storage class */}
      {isStorage && (
        <div>
          <Label>Storage Class</Label>
          <Segmented
            accent="#3D5AFE"
            value={config.storageClass ?? 'hot'}
            onChange={(storageClass) => handleUpdate({ storageClass })}
            options={[{ v: 'hot', label: 'Hot' }, { v: 'warm', label: 'Warm' }, { v: 'cold', label: 'Cold' }]}
          />
        </div>
      )}
    </div>
  );
}
