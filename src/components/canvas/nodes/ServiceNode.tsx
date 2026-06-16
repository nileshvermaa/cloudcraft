'use client';

import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Globe, Zap, GitMerge, Network, Server, Layers, Cpu,
  Gauge, Database, Table, HardDrive, MessageSquare, Cog,
  DatabaseBackup, Trash2, ChevronUp, ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATALOG, CATEGORY_COLOR } from '@/lib/catalog';
import { useGameStore } from '@/store/useGameStore';
import type { ServiceNodeData } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  Globe, Zap, GitMerge, Network, Server, Layers, Cpu,
  Gauge, Database, Table, HardDrive, MessageSquare, Cog, DatabaseBackup,
};

export const ServiceNode = memo(function ServiceNode({
  id,
  data,
  selected,
}: NodeProps & { data: ServiceNodeData }) {
  const spec = CATALOG[data.type as keyof typeof CATALOG];
  const { removeNode, updateUnits, result } = useGameStore();
  const [hovered, setHovered] = useState(false);

  if (!spec) return null;

  const IconComponent = ICONS[spec.icon] ?? Server;
  const color = CATEGORY_COLOR[spec.category];
  const isOverloaded = result?.overloadedNodeIds.includes(id) ?? false;
  const isSpof = result?.spofs.includes(id) ?? false;
  const units = (data.units as number | undefined) ?? spec.scalable?.default ?? 1;

  return (
    <div
      className={cn(
        'relative rounded-xl border transition-all duration-200 select-none',
        'min-w-[140px] max-w-[180px]',
        'bg-[oklch(0.14_0.01_240)] backdrop-blur-sm',
        selected && 'ring-2 ring-[oklch(0.82_0.18_192)]',
        isOverloaded && 'node-overloaded border-[oklch(0.65_0.22_25)]',
        isSpof && !isOverloaded && 'ring-2 ring-yellow-500/70',
        !isOverloaded && 'border-[oklch(0.24_0.02_240)]'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: color }}
      />

      {/* Delete button */}
      {hovered && data.type !== 'client' && (
        <button
          className={cn(
            'absolute -top-2 -right-2 z-10',
            'w-5 h-5 rounded-full flex items-center justify-center',
            'bg-[oklch(0.65_0.22_25)] text-white',
            'hover:bg-[oklch(0.55_0.22_25)] transition-colors',
            'shadow-lg cursor-pointer'
          )}
          onClick={() => removeNode(id)}
          title="Remove node"
        >
          <Trash2 size={10} />
        </button>
      )}

      {/* Overload badge */}
      {isOverloaded && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[oklch(0.65_0.22_25)] text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full">
          504
        </div>
      )}

      {/* SPOF badge */}
      {isSpof && !isOverloaded && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[9px] font-mono px-1.5 py-0.5 rounded-full">
          SPOF
        </div>
      )}

      <div className="p-3 pt-4">
        {/* Icon + label */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}22` }}
          >
            <IconComponent size={14} color={color} />
          </div>
          <span className="text-[11px] font-semibold text-[oklch(0.92_0.01_240)] leading-tight">
            {data.label as string}
          </span>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-0.5 text-[9px] text-[oklch(0.58_0.01_240)] font-mono">
          {spec.costPerMonth > 0 && (
            <span>${spec.costPerMonth}{spec.scalable ? '/unit/mo' : '/mo'}</span>
          )}
          {spec.capacityRps < Infinity && (
            <span>
              {spec.capacityRps >= 1000
                ? `${spec.capacityRps / 1000}k`
                : spec.capacityRps} RPS cap
            </span>
          )}
        </div>

        {/* Units slider for scalable nodes */}
        {spec.scalable && (
          <div className="mt-2 pt-2 border-t border-[oklch(0.24_0.02_240)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-[oklch(0.58_0.01_240)] font-mono">Units</span>
              <span className="text-[9px] font-mono font-bold" style={{ color }}>
                {units}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="w-4 h-4 rounded flex items-center justify-center bg-[oklch(0.18_0.01_240)] hover:bg-[oklch(0.22_0.02_192)] transition-colors"
                onClick={() => updateUnits(id, Math.max(spec.scalable!.min, units - 1))}
              >
                <ChevronDown size={8} className="text-[oklch(0.88_0.01_240)]" />
              </button>
              <div className="flex-1 h-1 bg-[oklch(0.18_0.01_240)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${((units - spec.scalable.min) / (spec.scalable.max - spec.scalable.min)) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <button
                className="w-4 h-4 rounded flex items-center justify-center bg-[oklch(0.18_0.01_240)] hover:bg-[oklch(0.22_0.02_192)] transition-colors"
                onClick={() => updateUnits(id, Math.min(spec.scalable!.max, units + 1))}
              >
                <ChevronUp size={8} className="text-[oklch(0.88_0.01_240)]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* React Flow Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          borderWidth: 2,
          borderRadius: '50%',
          backgroundColor: color,
          borderColor: 'oklch(0.14 0.01 240)',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          borderWidth: 2,
          borderRadius: '50%',
          backgroundColor: color,
          borderColor: 'oklch(0.14 0.01 240)',
        }}
      />
    </div>
  );
});
