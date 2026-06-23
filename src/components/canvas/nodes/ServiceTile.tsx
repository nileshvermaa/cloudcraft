'use client';

import { memo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Globe, Zap, GitMerge, Network, Server, Layers, Cpu,
  Gauge, Database, Table, HardDrive, MessageSquare, Cog, DatabaseBackup,
  Boxes, Search, Activity, Radio, RefreshCw, Calendar, GitBranch,
  ShieldAlert, Shield, Lock, Key, Eye, FileText, Bell, Route,
  type LucideIcon,
} from 'lucide-react';
import { CATALOG, CATEGORY_COLOR, getNodeLabel } from '@/lib/catalog';
import { TILE_W, TILE_H, TOP_FACE, LEFT_WALL, RIGHT_WALL, ICON_CX, ICON_CY, tileFaces } from './tile-geometry';
import { useGameStore } from '@/store/useGameStore';
import { TheCrewCharacter, TheLeakCharacter } from '@/components/cast/CastRenderer';
import type { ServiceNodeData } from '@/types';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  Globe, Zap, GitMerge, Network, Server, Layers, Cpu,
  Gauge, Database, Table, HardDrive, MessageSquare, Cog, DatabaseBackup,
  Boxes, Search, Activity, Radio, RefreshCw, Calendar, GitBranch,
  ShieldAlert, Shield, Lock, Key, Eye, FileText, Bell, Route,
};

/** Units: stacked-tile badge (×N). */
function StackedBadge({ units, color }: { units: number; color: string }) {
  return (
    <div
      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
      style={{ backgroundColor: color, fontFamily: 'var(--font-jetbrains)' }}
    >
      ×{units}
    </div>
  );
}

export const ServiceTile = memo(function ServiceTile({
  id,
  data,
  selected,
}: NodeProps & { data: ServiceNodeData }) {
  const spec = CATALOG[data.type as keyof typeof CATALOG];
  const { removeNode, updateUnits, result, liveResult, providerSkin } = useGameStore();
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion();

  if (!spec) return null;

  const r = result ?? liveResult;

  const baseColor = CATEGORY_COLOR[spec.category];
  const faces = tileFaces(baseColor);
  const IconComponent = ICONS[spec.icon] ?? Server;
  const units = (data.units as number | undefined) ?? spec.scalable?.default ?? 1;
  // Provider skin label (custom label in config takes priority)
  const displayLabel = getNodeLabel(data.type, providerSkin, data.config?.label ?? (data.label !== spec.label ? data.label : undefined));

  const isOverloaded = r?.overloadedNodeIds.includes(id) ?? false;
  const isSpof = r?.spofs.includes(id) ?? false;
  const servedRatio = r
    ? Math.min(1, r.servedRps / (r.servedRps + Math.max(0, r.errorRatePct * r.servedRps / 100)))
    : null;
  const isWarn = servedRatio !== null && !isOverloaded && servedRatio < 0.95;
  const isHealthy = r !== null && !isOverloaded && !isWarn;
  const showCrew = isOverloaded && (spec.category === 'compute' || data.type === 'worker');
  // The Leak appears on an exposed data store (violation strings end with the target's label).
  const showLeak = spec.category === 'data' && (r?.securityViolations ?? []).some((v) => v.endsWith(String(data.label)));

  // Determine ring/glow state class
  const tileStateClass = cn(
    isOverloaded && 'tile-overloaded',
    isWarn && !isOverloaded && 'tile-warn'
  );

  return (
    <motion.div
      className="relative cursor-default select-none"
      style={{ width: TILE_W, height: TILE_H + 30, transformOrigin: '55px 110px' }}
      initial={reduced ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 16 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── The isometric SVG cuboid ── */}
      <div className={cn('relative', tileStateClass)}>
        <svg
          width={TILE_W}
          height={TILE_H}
          viewBox={`0 0 ${TILE_W} ${TILE_H}`}
          overflow="visible"
        >
          {/* Drop shadow ellipse */}
          <ellipse
            cx={55}
            cy={118}
            rx={44}
            ry={7}
            fill="rgba(11,18,32,0.15)"
          />

          {/* Left wall */}
          <polygon
            points={LEFT_WALL}
            fill={faces.left}
          />

          {/* Right wall */}
          <polygon
            points={RIGHT_WALL}
            fill={faces.right}
          />

          {/* Top face */}
          <polygon
            points={TOP_FACE}
            fill={faces.top}
          />

          {/* Selected — dashed outline in category color */}
          {selected && (
            <polygon
              points={TOP_FACE}
              fill="none"
              stroke={baseColor}
              strokeWidth={2}
              strokeDasharray="4 3"
            />
          )}

          {/* State ring on top face */}
          {isOverloaded && (
            <polygon
              points={TOP_FACE}
              fill="none"
              stroke="#EF4444"
              strokeWidth={3}
              opacity={0.9}
            />
          )}
          {isSpof && !isOverloaded && (
            <polygon
              points={TOP_FACE}
              fill="none"
              stroke="#F59E0B"
              strokeWidth={2.5}
              opacity={0.85}
            />
          )}
          {isHealthy && (
            <polygon
              points={TOP_FACE}
              fill="none"
              stroke="#22C55E"
              strokeWidth={2}
              opacity={0.6}
            />
          )}

          {/* Lucide icon on top face — white */}
          <foreignObject
            x={ICON_CX - 12}
            y={ICON_CY - 14}
            width={24}
            height={24}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
              }}
            >
              <IconComponent size={18} color="white" strokeWidth={2} />
            </div>
          </foreignObject>

          {/* Overload chip */}
          {isOverloaded && (
            <g>
              <rect x={37} y={2} width={36} height={14} rx={4} fill="#EF4444" />
              <text
                x={55}
                y={13}
                textAnchor="middle"
                fill="white"
                fontSize={8}
                fontFamily="var(--font-jetbrains)"
                fontWeight="700"
              >
                504
              </text>
            </g>
          )}

          {/* SPOF chip */}
          {isSpof && !isOverloaded && (
            <g>
              <rect x={34} y={2} width={42} height={14} rx={4} fill="#F59E0B" />
              <text
                x={55}
                y={13}
                textAnchor="middle"
                fill="white"
                fontSize={8}
                fontFamily="var(--font-jetbrains)"
                fontWeight="700"
              >
                SPOF
              </text>
            </g>
          )}

          {/* Healthy check */}
          {isHealthy && (
            <g>
              <circle cx={92} cy={15} r={8} fill="#22C55E" />
              <text
                x={92}
                y={19}
                textAnchor="middle"
                fill="white"
                fontSize={10}
                fontWeight="700"
              >
                ✓
              </text>
            </g>
          )}
        </svg>

        {/* ×N stacked badge for scalable types */}
        {spec.scalable && units > 1 && (
          <StackedBadge units={units} color={baseColor} />
        )}
      </div>

      {/* The Crew scrambles onto overloaded compute/worker tiles */}
      {showCrew && (
        <TheCrewCharacter state="panic" style={{ top: -14, left: 2, zIndex: 20, pointerEvents: 'none' }} />
      )}

      {/* The Leak slips onto an exposed data store */}
      {showLeak && (
        <TheLeakCharacter state="grab" style={{ top: -12, left: 64, zIndex: 21, pointerEvents: 'none' }} />
      )}

      {/* Label below the tile */}
      <div
        className="text-center mt-1 px-1"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <div
          className="text-[11px] font-semibold leading-tight truncate"
          style={{ color: '#1B1733' }}
        >
          {displayLabel}
        </div>
        {spec.costPerMonth > 0 && (
          <div
            className="text-[9px] mt-0.5"
            style={{ color: '#94A3B8', fontFamily: 'var(--font-jetbrains)' }}
          >
            ${spec.costPerMonth}{spec.scalable ? '/unit' : ''}/mo
          </div>
        )}
      </div>

      {/* Unit slider — shown when selected and scalable */}
      {selected && spec.scalable && (
        <div className="absolute -bottom-10 left-0 right-0 flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-lg px-2 py-1.5 shadow-md">
          <span className="text-[9px] text-[#94A3B8] font-mono flex-shrink-0">units</span>
          <input
            type="range"
            min={spec.scalable.min}
            max={spec.scalable.max}
            value={units}
            onChange={(e) => updateUnits(id, Number(e.target.value))}
            className="flex-1 h-1 accent-[var(--color-cat-compute)] cursor-pointer"
            style={{ accentColor: baseColor }}
          />
          <span
            className="text-[10px] font-bold w-4 text-right flex-shrink-0"
            style={{ color: baseColor, fontFamily: 'var(--font-jetbrains)' }}
          >
            {units}
          </span>
        </div>
      )}

      {/* Delete button — show on hover (not for client) */}
      {hovered && data.type !== 'client' && (
        <button
          className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-[#EF4444] text-white text-[10px] flex items-center justify-center shadow hover:bg-[#DC2626] transition-colors z-10 cursor-pointer"
          onClick={() => removeNode(id)}
          title="Remove"
        >
          ×
        </button>
      )}

      {/* React Flow handles — positioned at tile's left/right vertices */}
      {/* Target handle: left vertex of top face = (5, 38) relative to SVG */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          top: 38,
          left: 4,
          width: 10,
          height: 10,
          background: baseColor,
          border: '2px solid white',
          borderRadius: '50%',
        }}
      />
      {/* Source handle: right vertex of top face = (105, 38) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          top: 38,
          right: 4,
          width: 10,
          height: 10,
          background: baseColor,
          border: '2px solid white',
          borderRadius: '50%',
        }}
      />
    </motion.div>
  );
});
