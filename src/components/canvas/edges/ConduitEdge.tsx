'use client';

import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';
import { useGameStore } from '@/store/useGameStore';
import { CATALOG, CATEGORY_COLOR } from '@/lib/catalog';
import type { ServiceNodeData, ServiceType } from '@/types';

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
}: EdgeProps) {
  const { isSimulating, result, nodes } = useGameStore();

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine color from source node's category
  const sourceNode = nodes.find((n) => n.id === source);
  const sourceType = (sourceNode?.data as ServiceNodeData | undefined)?.type as ServiceType | undefined;
  const baseColor = sourceType ? CATEGORY_COLOR[CATALOG[sourceType]?.category] : '#94A3B8';

  // State: is this edge feeding into an overloaded node?
  const isBottleneck = result?.overloadedNodeIds.some(
    (nodeId) => edges_target_map.get(id) === nodeId
  ) ?? false;

  const isAnimated = isSimulating;
  const strokeColor = selected
    ? baseColor
    : isBottleneck
    ? '#EF4444'
    : result && result.errorRatePct > 10
    ? '#F59E0B'
    : baseColor;

  return (
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
  );
});

// Simple map for target lookup — populated at edge render time
const edges_target_map = new Map<string, string>();
