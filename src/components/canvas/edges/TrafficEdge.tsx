'use client';

import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

export const TrafficEdge = memo(function TrafficEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const { isSimulating, result } = useGameStore();

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isAnimated = isSimulating || (result !== null && result.overloadedNodeIds.length === 0);
  const isError = result !== null && result.errorRatePct > 0;

  const strokeColor = selected
    ? 'oklch(0.82 0.18 192)'
    : isError
    ? 'oklch(0.65 0.22 25)'
    : 'oklch(0.55 0.12 192)';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: isAnimated ? '8 4' : undefined,
          animation: isAnimated ? 'dash-flow 0.8s linear infinite' : undefined,
          transition: 'stroke 0.3s ease',
        }}
      />
    </>
  );
});
