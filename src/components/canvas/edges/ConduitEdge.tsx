'use client';

import { memo, useEffect, useRef } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';
import { useReducedMotion } from 'motion/react';
import { useGameStore } from '@/store/useGameStore';
import { CATALOG, CATEGORY_COLOR } from '@/lib/catalog';
import type { ServiceNodeData, ServiceType } from '@/types';

/** Bright bean colors for the streaming Pings. */
const PING_COLORS = ['#FF6B6B', '#FFD23D', '#4ECDC4', '#A78BFA', '#FF8FB1'];
const PINGS_PER_EDGE = 3;
const PING_SPEED = 110; // px/sec travelled along the conduit

export const ConduitEdge = memo(function ConduitEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  source,
  target,
}: EdgeProps) {
  const { isSimulating, result, nodes } = useGameStore();
  const reduced = useReducedMotion();

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Color from the source node's category
  const sourceNode = nodes.find((n) => n.id === source);
  const sourceType = (sourceNode?.data as ServiceNodeData | undefined)?.type as ServiceType | undefined;
  const baseColor = sourceType ? CATEGORY_COLOR[CATALOG[sourceType]?.category] : '#94A3B8';

  // Does this edge feed an overloaded tier?
  const isBottleneck = result?.overloadedNodeIds.includes(target) ?? false;

  const isAnimated = isSimulating && !reduced;
  const strokeColor = selected
    ? baseColor
    : isBottleneck
    ? '#FF4D4D'
    : result && result.errorRatePct > 10
    ? '#FFB81C'
    : baseColor;

  // ── Pings riding the conduit during a run ──
  const pathRef = useRef<SVGPathElement | null>(null);
  const pingRefs = useRef<(SVGCircleElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  const showPings = isSimulating && !reduced;

  useEffect(() => {
    if (!showPings) return;
    const pathEl = pathRef.current;
    if (!pathEl) return;
    const len = pathEl.getTotalLength();
    if (!len) return;

    let startTs: number | null = null;
    const tick = (ts: number) => {
      if (startTs === null) startTs = ts;
      const elapsed = (ts - startTs) / 1000;
      for (let i = 0; i < PINGS_PER_EDGE; i++) {
        const c = pingRefs.current[i];
        if (!c) continue;
        const phase = i / PINGS_PER_EDGE;
        const frac = (((elapsed * PING_SPEED) / len + phase) % 1 + 1) % 1;
        const pt = pathEl.getPointAtLength(frac * len);
        c.setAttribute('cx', String(pt.x));
        c.setAttribute('cy', String(pt.y));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [showPings, edgePath]);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 2.5 : 2,
          strokeDasharray: isAnimated ? '8 5' : undefined,
          animation: isAnimated ? 'dash-flow 0.9s linear infinite' : undefined,
          opacity: result && !isSimulating ? 0.85 : 0.7,
          transition: 'stroke 0.3s ease, opacity 0.3s ease',
          strokeLinecap: 'round',
        }}
      />

      {/* Invisible twin path used to measure & sample points for the Pings */}
      {showPings && <path ref={pathRef} d={edgePath} fill="none" stroke="none" />}

      {/* Streaming Pings */}
      {showPings &&
        Array.from({ length: PINGS_PER_EDGE }).map((_, i) => (
          <circle
            key={i}
            ref={(el) => {
              pingRefs.current[i] = el;
            }}
            cx={sourceX}
            cy={sourceY}
            r={4}
            fill={isBottleneck ? '#FF4D4D' : PING_COLORS[i % PING_COLORS.length]}
            stroke="#FFFFFF"
            strokeWidth={1.25}
          />
        ))}
    </>
  );
});
