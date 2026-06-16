'use client';

import {
  Globe, Zap, GitMerge, Network, Server, Layers, Cpu,
  Gauge, Database, Table, HardDrive, MessageSquare, Cog, DatabaseBackup,
  Boxes, Search, Activity, Radio, RefreshCw, Calendar, GitBranch,
  ShieldAlert, Shield, Lock, Key, Eye, FileText, Bell, Route,
  type LucideIcon, GripVertical
} from 'lucide-react';
import { CATALOG, CATEGORY_COLOR, CATEGORY_LABEL, CATEGORIES, PALETTE_ORDER, getNodeLabel } from '@/lib/catalog';
import { tileFaces } from './nodes/tile-geometry';
import type { ServiceCategory, ServiceType } from '@/types';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/useGameStore';

const ICONS: Record<string, LucideIcon> = {
  Globe, Zap, GitMerge, Network, Server, Layers, Cpu,
  Gauge, Database, Table, HardDrive, MessageSquare, Cog, DatabaseBackup,
  Boxes, Search, Activity, Radio, RefreshCw, Calendar, GitBranch,
  ShieldAlert, Shield, Lock, Key, Eye, FileText, Bell, Route,
};

function PaletteItem({ type }: { type: ServiceType }) {
  const spec = CATALOG[type];
  const { providerSkin } = useGameStore();
  if (!spec) return null;

  const baseColor = CATEGORY_COLOR[spec.category];
  const faces = tileFaces(baseColor);
  const IconComponent = ICONS[spec.icon] ?? Server;
  const displayLabel = getNodeLabel(type, providerSkin);

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/cloudcraft', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg border border-transparent',
        'cursor-grab active:cursor-grabbing select-none',
        'hover:bg-[var(--color-chrome-soft)] hover:border-[var(--color-chrome-border)] hover:shadow-sm',
        'transition-all duration-150 group animate-slide-in'
      )}
      style={{
        outlineColor: baseColor,
      }}
    >
      {/* Mini isometric icon */}
      <div className="relative flex-shrink-0 w-8 h-8 drop-shadow-sm group-hover:scale-105 transition-transform duration-150">
        <svg width={32} height={32} viewBox="0 0 32 32">
          {/* mini cuboid */}
          <polygon points="16,3 29,10 16,17 3,10" fill={faces.top} />
          <polygon points="3,10 16,17 16,27 3,20" fill={faces.left} />
          <polygon points="29,10 16,17 16,27 29,20" fill={faces.right} />
          {/* icon */}
          <foreignObject x={8} y={4} width={16} height={16}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16 }}>
              <IconComponent size={10} color="white" strokeWidth={2.5} />
            </div>
          </foreignObject>
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-[var(--color-chrome-bright)] truncate leading-tight group-hover:text-teal-400 transition-colors">
          {displayLabel}
        </div>
        <div className="text-[9px] text-[var(--color-chrome-text)]/70 font-mono mt-0.5 leading-none">
          {spec.costPerMonth === 0
            ? 'Free'
            : `$${spec.costPerMonth}${spec.scalable ? '/u' : ''}`}
          {' · '}
          {spec.capacityRps >= 1_000_000
            ? `${(spec.capacityRps / 1_000_000).toFixed(0)}M`
            : spec.capacityRps >= 1_000
            ? `${(spec.capacityRps / 1_000).toFixed(0)}k`
            : spec.capacityRps === Infinity
            ? '∞'
            : spec.capacityRps} RPS
        </div>
      </div>

      {/* Grip dots handle */}
      <div className="flex-shrink-0 text-slate-700 group-hover:text-slate-500 transition-colors">
        <GripVertical size={12} strokeWidth={2.5} />
      </div>
    </div>
  );
}

export function Palette() {
  const grouped: Partial<Record<ServiceCategory, ServiceType[]>> = {};
  for (const type of PALETTE_ORDER) {
    const cat = CATALOG[type].category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat]!.push(type);
  }

  return (
    <div className="flex flex-col h-full chrome-panel border-y-0 border-l-0 border-r border-[var(--color-chrome-border)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[var(--color-chrome-border)] bg-slate-950/15 flex items-center justify-between">
        <div>
          <h2 className="text-[11px] font-black text-[var(--color-chrome-bright)] uppercase tracking-wider flex items-center gap-1.5">
            <Cog size={12} className="text-teal-500 animate-spin" style={{ animationDuration: '6s' }} />
            PARTS DRAWER
          </h2>
          <p className="text-[9px] text-[var(--color-chrome-text)]/75 mt-0.5 font-medium">Drag components onto workbench</p>
        </div>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {CATEGORIES.filter((cat) => grouped[cat]?.length).map((cat) => (
          <div key={cat} className="space-y-1">
            <div
              className="mx-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center justify-between rounded-sm bg-slate-950/40 border-l-2"
              style={{ borderColor: CATEGORY_COLOR[cat], color: CATEGORY_COLOR[cat] }}
            >
              <span>{CATEGORY_LABEL[cat]}</span>
              <span className="text-[8px] opacity-40 font-mono font-normal">drawer</span>
            </div>
            <div className="space-y-0.5 px-0.5">
              {grouped[cat]!.map((type) => (
                <PaletteItem key={type} type={type} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom hint drawer footer */}
      <div className="p-3.5 border-t border-[var(--color-chrome-border)] bg-slate-950/20 text-center select-none">
        <p className="text-[9px] text-[var(--color-chrome-text)]/60 flex items-center justify-center gap-1.5 font-semibold uppercase tracking-wider">
          <Layers size={11} className="text-teal-500/60" />
          Workbench Ready
        </p>
      </div>
    </div>
  );
}
