import type { Node, Edge } from '@xyflow/react';
import type { ServiceNodeData, SimulationConstraints } from '@/types';
import { CATALOG } from '@/lib/catalog';
import { primaryPath, buildAdjacency } from './graph';

export function computeLatency(
  nodes: Node<ServiceNodeData>[],
  edges: Edge[],
  challenge: SimulationConstraints,
  effectiveDemand: number,
  computeCapacity: number,
  dataCapacity: number
): number {
  const adj = buildAdjacency(edges);
  const path = primaryPath(nodes, adj);

  if (path.length === 0) return 0;

  let totalLatency = 0;
  const DATA_TYPES = new Set([
    'cache', 'sqlPrimary', 'sqlReplica', 'nosqlDb', 'objectStorage',
    'searchIndex', 'timeSeriesDb', 'dataWarehouse', 'blockStorage'
  ]);
  let firstDataHit = false;

  for (const nodeId of path) {
    if (firstDataHit) break;

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    const spec = CATALOG[node.data.type];
    if (!spec || spec.latencyMs === 0) continue;

    // Determine capacity for this tier
    let tierCapacity: number;
    const COMPUTE_TYPES = new Set([
      'computeInstance', 'autoScalingGroup', 'serverless',
      'containerCluster', 'edgeFunction', 'gpuInstance'
    ]);
    if (COMPUTE_TYPES.has(node.data.type)) {
      tierCapacity = computeCapacity || spec.capacityRps;
    } else if (DATA_TYPES.has(node.data.type)) {
      tierCapacity = dataCapacity || spec.capacityRps;
      firstDataHit = true;
    } else {
      tierCapacity = spec.capacityRps;
    }

    let tierLatency = spec.latencyMs;

    // Queueing penalty: when utilization > 0.8
    const utilization = tierCapacity > 0 ? effectiveDemand / tierCapacity : 1;
    if (utilization > 0.8) {
      tierLatency *= 1 + (utilization - 0.8) * 5;
    }

    totalLatency += tierLatency;
  }

  // CDN / cache hit blending
  const cdnNodes = nodes.filter((n) => n.data.type === 'cdn');
  const cacheNodes = nodes.filter((n) => n.data.type === 'cache');

  if (cdnNodes.length > 0) {
    const hitFraction = challenge.staticShare * (CATALOG.cdn.cacheHitRatio ?? 0.9);
    const edgeLatency = CATALOG.cdn.latencyMs;
    totalLatency = hitFraction * edgeLatency + (1 - hitFraction) * totalLatency;
  } else if (cacheNodes.length > 0) {
    const hitFraction = challenge.readShare * (CATALOG.cache.cacheHitRatio ?? 0.8);
    const cacheLatency = CATALOG.cache.latencyMs;
    totalLatency = hitFraction * cacheLatency + (1 - hitFraction) * totalLatency;
  }

  return Math.round(totalLatency);
}
