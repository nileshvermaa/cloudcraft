'use client';

import {
  Globe, Zap, GitMerge, Network, Server, Layers, Cpu,
  Gauge, Database, Table, HardDrive, MessageSquare, Cog, DatabaseBackup,
  Boxes, Search, Activity, Radio, RefreshCw, Calendar, GitBranch,
  ShieldAlert, Shield, Lock, Key, Eye, FileText, Bell, Route,
  type LucideIcon,
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

function formatCap(rps: number): string {
  if (rps === Infinity) return '∞';
  if (rps >= 1_000_000) return `${(rps / 1_000_000).toFixed(0)}M`;
  if (rps >= 1_000) return `${(rps / 1_000).toFixed(0)}k`;
  return `${rps}`;
}

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
      tabIndex={0}
      className={cn(
        'group flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl',
        'bg-[#FFFCF5] border border-[var(--color-panel-line)]',
        'cursor-grab active:cursor-grabbing select-none',
        'transition-all duration-150 hover:-translate-y-0.5',
        'focus:outline-none focus-visible:ring-2'
      )}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = baseColor)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
    >
      {/* Mini isometric tile */}
      <div className="relative flex-shrink-0 w-8 h-8 group-hover:scale-105 transition-transform duration-150">
        <svg width={32} height={32} viewBox="0 0 32 32">
          <polygon points="16,3 29,10 16,17 3,10" fill={faces.top} />
          <polygon points="3,10 16,17 16,27 3,20" fill={faces.left} />
          <polygon points="29,10 16,17 16,27 29,20" fill={faces.right} />
          <foreignObject x={8} y={4} width={16} height={16}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16 }}>
              <IconComponent size={10} color="white" strokeWidth={2.5} />
            </div>
          </foreignObject>
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-bold truncate leading-tight" style={{ color: '#1B1733' }}>
          {displayLabel}
        </div>
        <div className="text-[10px] mt-0.5 leading-none" style={{ color: '#9A92AD', fontFamily: 'var(--font-jetbrains)' }}>
          {spec.costPerMonth === 0 ? 'Free' : `$${spec.costPerMonth}${spec.scalable ? '/u' : ''}`}
          {' · '}
          {formatCap(spec.capacityRps)} rps
        </div>
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
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: 'var(--color-panel)', borderRight: '1px solid var(--color-panel-line)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-panel-line)' }}>
        <h2 className="text-[15px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
          Parts
        </h2>
        <p className="text-[11px] mt-0.5" style={{ color: '#9A92AD' }}>
          Drag a piece onto the board
        </p>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-3.5">
        {CATEGORIES.filter((cat) => grouped[cat]?.length).map((cat) => (
          <div key={cat} className="space-y-1.5">
            <div className="flex items-center gap-2 px-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLOR[cat] }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: '#9A92AD' }}
              >
                {CATEGORY_LABEL[cat]}
              </span>
            </div>
            <div className="space-y-1">
              {grouped[cat]!.map((type) => (
                <PaletteItem key={type} type={type} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
