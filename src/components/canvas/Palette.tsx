'use client';

import { useRef, useState } from 'react';
import {
  Globe, Zap, GitMerge, Network, Server, Layers, Cpu,
  Gauge, Database, Table, HardDrive, MessageSquare, Cog, DatabaseBackup,
  Boxes, Search, Activity, Radio, RefreshCw, Calendar, GitBranch,
  ShieldAlert, Shield, Lock, Key, Eye, FileText, Bell, Route, GripVertical,
  type LucideIcon,
} from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { CATALOG, CATEGORY_COLOR, CATEGORY_LABEL, CATEGORIES, PALETTE_ORDER, getNodeLabel, SERVICE_DESC } from '@/lib/catalog';
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

function MiniTile({ faces, Icon }: { faces: { top: string; left: string; right: string }; Icon: LucideIcon }) {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32">
      <polygon points="16,3 29,10 16,17 3,10" fill={faces.top} />
      <polygon points="3,10 16,17 16,27 3,20" fill={faces.left} />
      <polygon points="29,10 16,17 16,27 29,20" fill={faces.right} />
      <foreignObject x={8} y={4} width={16} height={16}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16 }}>
          <Icon size={10} color="white" strokeWidth={2.5} />
        </div>
      </foreignObject>
    </svg>
  );
}

function PaletteItem({ type, onPlace }: { type: ServiceType; onPlace?: () => void }) {
  const spec = CATALOG[type];
  const { providerSkin, addNode } = useGameStore();
  const { screenToFlowPosition } = useReactFlow();

  const drag = useRef<{ startX: number; startY: number; dragging: boolean; pointerId: number } | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);

  if (!spec) return null;

  const baseColor = CATEGORY_COLOR[spec.category];
  const faces = tileFaces(baseColor);
  const IconComponent = ICONS[spec.icon] ?? Server;
  const displayLabel = getNodeLabel(type, providerSkin);

  // Desktop HTML5 drag (mouse).
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/cloudcraft', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Place at the current viewport center (tap / keyboard / desktop click).
  const placeAtCenter = () => {
    const c = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    addNode(type, { x: c.x - 55, y: c.y - 55 });
    onPlace?.();
  };

  // Pointer drag from the grip handle — works on touch (HTML5 DnD does not).
  const onGripPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();
    drag.current = { startX: e.clientX, startY: e.clientY, dragging: false, pointerId: e.pointerId };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const onGripPointerMove = (e: React.PointerEvent) => {
    const st = drag.current;
    if (!st) return;
    if (!st.dragging && Math.hypot(e.clientX - st.startX, e.clientY - st.startY) > 8) st.dragging = true;
    if (st.dragging) {
      e.preventDefault();
      setGhost({ x: e.clientX, y: e.clientY });
    }
  };
  const onGripPointerUp = (e: React.PointerEvent) => {
    const st = drag.current;
    drag.current = null;
    setGhost(null);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    if (!st) return;
    if (st.dragging) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el && el.closest('.react-flow')) {
        const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        addNode(type, { x: pos.x - 55, y: pos.y - 55 });
        onPlace?.();
      }
    } else {
      placeAtCenter(); // a tap on the grip also adds
    }
  };

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        onClick={placeAtCenter}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            placeAtCenter();
          }
        }}
        role="button"
        tabIndex={0}
        title={`Add ${displayLabel}`}
        className={cn(
          'group flex items-start gap-2 pl-2 pr-1.5 py-2 rounded-xl',
          'bg-[#FFFCF5] border border-[var(--color-panel-line)]',
          'cursor-pointer select-none',
          'transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0',
          'focus:outline-none focus-visible:ring-2'
        )}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = baseColor)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
      >
        <div className="relative flex-shrink-0 w-8 h-8 group-hover:scale-105 transition-transform duration-150">
          <MiniTile faces={faces} Icon={IconComponent} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-bold truncate leading-tight" style={{ color: '#1B1733' }}>
            {displayLabel}
          </div>
          <p className="text-[10.5px] leading-snug mt-0.5 line-clamp-2" style={{ color: '#7A7290' }}>
            {SERVICE_DESC[type]}
          </p>
          <div className="text-[10px] mt-1 leading-none" style={{ color: '#9A92AD', fontFamily: 'var(--font-jetbrains)' }}>
            {spec.costPerMonth === 0 ? 'Free' : `$${spec.costPerMonth}${spec.scalable ? '/u' : ''}`}
            {' · '}
            {formatCap(spec.capacityRps)} rps
          </div>
        </div>

        {/* Drag handle — touch-friendly (pointer drag onto the board) */}
        <div
          onPointerDown={onGripPointerDown}
          onPointerMove={onGripPointerMove}
          onPointerUp={onGripPointerUp}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0 flex items-center justify-center w-7 h-8 -mr-0.5 rounded-lg cursor-grab active:cursor-grabbing text-[#C9BFA6] hover:text-[#9A92AD]"
          style={{ touchAction: 'none' }}
          title="Drag onto the board"
          aria-hidden
        >
          <GripVertical size={16} />
        </div>
      </div>

      {/* Floating ghost while dragging */}
      {ghost && (
        <div
          className="fixed z-[60] pointer-events-none -translate-x-1/2 -translate-y-1/2 drop-shadow-lg"
          style={{ left: ghost.x, top: ghost.y }}
        >
          <MiniTile faces={faces} Icon={IconComponent} />
        </div>
      )}
    </>
  );
}

export function Palette({ onPlace }: { onPlace?: () => void }) {
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
          Tap to add, or drag the <GripVertical size={10} className="inline -mt-0.5" /> handle onto the board
        </p>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-3.5">
        {CATEGORIES.filter((cat) => grouped[cat]?.length).map((cat) => (
          <div key={cat} className="space-y-1.5">
            <div className="flex items-center gap-2 px-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLOR[cat] }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9A92AD' }}>
                {CATEGORY_LABEL[cat]}
              </span>
            </div>
            <div className="space-y-1">
              {grouped[cat]!.map((type) => (
                <PaletteItem key={type} type={type} onPlace={onPlace} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
