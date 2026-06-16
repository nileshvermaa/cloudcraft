import type { Node, Edge } from '@xyflow/react';
import type { ServiceNodeData, SimulationConstraints, ServiceType } from '@/types';
import { CATALOG } from '@/lib/catalog';
import { buildAdjacency, nodeCapacity, nodeUnits } from './graph';

export interface ThroughputResult {
  servedRps: number;
  errorRatePct: number;
  overloadedNodeIds: string[];
  computeCapacity: number;
  dataCapacity: number;
  effectiveDemand: number;
  cdnAbsorbed: number;
  cacheAbsorbed: number;
}

export function computeThroughput(
  nodes: Node<ServiceNodeData>[],
  edges: Edge[],
  challenge: SimulationConstraints
): ThroughputResult {
  const adj = buildAdjacency(edges);
  const overloadedNodeIds: string[] = [];
  let demand = challenge.targetRps;

  // ─── DDoS Protection Gate ───
  // If DDoS protection is present and connected, it filters malicious traffic spikes
  const ddosNodes = nodes.filter((n) => n.data.type === 'ddosProtection');
  const hasDdos = ddosNodes.some((n) => adj.forward.has(n.id) || adj.backward.has(n.id));
  if (hasDdos) {
    if (challenge.targetRps > 50_000) {
      // Absorb 90% of spike traffic, representing the DDoS filter
      demand = challenge.targetRps * 0.1;
    }
  }

  // ─── Rate Limiter Gate ───
  const rateLimiterNodes = nodes.filter((n) => n.data.type === 'rateLimiter');
  const hasRateLimiting = rateLimiterNodes.some((n) => adj.forward.has(n.id) || adj.backward.has(n.id));
  if (hasRateLimiting) {
    const limitCap = rateLimiterNodes.reduce((sum, n) => sum + nodeCapacity(n), 0);
    if (demand > limitCap) {
      rateLimiterNodes.forEach((n) => overloadedNodeIds.push(n.id));
      demand = limitCap; // cap traffic passing to downstream nodes
    }
  }

  // ─── CDN tier ───
  const cdnNodes = nodes.filter((n) => n.data.type === 'cdn');
  let cdnAbsorbed = 0;
  for (const cdn of cdnNodes) {
    const hitRatio = CATALOG.cdn.cacheHitRatio ?? 0.9;
    cdnAbsorbed = demand * challenge.staticShare * hitRatio;
    demand *= 1 - challenge.staticShare * hitRatio;

    // Check CDN capacity
    const cap = nodeCapacity(cdn);
    if (challenge.targetRps > cap) {
      overloadedNodeIds.push(cdn.id);
    }
  }
  const demandAfterCdn = demand;

  // ─── Compute tier ───
  const COMPUTE_TYPES = new Set<ServiceType>([
    'computeInstance', 'autoScalingGroup', 'serverless',
    'containerCluster', 'edgeFunction', 'gpuInstance'
  ]);
  const computeNodes = nodes.filter((n) => COMPUTE_TYPES.has(n.data.type));

  let computeCapacity = 0;
  for (const cn of computeNodes) {
    computeCapacity += nodeCapacity(cn);
  }

  if (computeNodes.length === 0) {
    // No compute — nothing can be served unless it's a direct cdn->storage path
    const objectStorageNodes = nodes.filter((n) => n.data.type === 'objectStorage');
    if (objectStorageNodes.length > 0 && cdnNodes.length > 0) {
      computeCapacity = Math.min(...objectStorageNodes.map(nodeCapacity));
    }
  }

  // Flag overloaded compute
  for (const cn of computeNodes) {
    const cap = nodeCapacity(cn);
    const share = computeCapacity > 0 ? cap / computeCapacity : 1;
    if (demandAfterCdn * share > cap * 1.0) {
      overloadedNodeIds.push(cn.id);
    }
  }

  // ─── Gateway/Load Balancer capacity ───
  const GATEWAY_TYPES = new Set<ServiceType>([
    'apiGateway', 'loadBalancer', 'dns', 'rateLimiter', 'waf', 'ddosProtection'
  ]);
  for (const n of nodes) {
    if (GATEWAY_TYPES.has(n.data.type)) {
      const cap = nodeCapacity(n);
      if (demandAfterCdn > cap) {
        overloadedNodeIds.push(n.id);
      }
    }
  }

  // ─── Data tier ───
  const cacheNodes = nodes.filter((n) => n.data.type === 'cache');
  const sqlPrimary = nodes.filter((n) => n.data.type === 'sqlPrimary');
  const sqlReplica = nodes.filter((n) => n.data.type === 'sqlReplica');
  const nosqlNodes = nodes.filter((n) => n.data.type === 'nosqlDb');
  const searchIndexNodes = nodes.filter((n) => n.data.type === 'searchIndex');
  const timeSeriesNodes = nodes.filter((n) => n.data.type === 'timeSeriesDb');
  const warehouseNodes = nodes.filter((n) => n.data.type === 'dataWarehouse');
  const blockStorageNodes = nodes.filter((n) => n.data.type === 'blockStorage');

  let demandOnData = demandAfterCdn;
  let cacheAbsorbed = 0;
  if (cacheNodes.length > 0) {
    const hitRatio = CATALOG.cache.cacheHitRatio ?? 0.8;
    cacheAbsorbed = demandOnData * challenge.readShare * hitRatio;
    demandOnData *= 1 - challenge.readShare * hitRatio;
  }

  // Add search index and time series db capacity
  const searchCap = searchIndexNodes.reduce((sum, n) => sum + nodeCapacity(n), 0);
  const tsCap = timeSeriesNodes.reduce((sum, n) => sum + nodeCapacity(n), 0);

  // Total data capacity
  let dataCapacity = 0;
  if (sqlPrimary.length > 0) {
    // Primary handles writes + some reads
    const primaryCap = sqlPrimary.reduce((sum, n) => sum + nodeCapacity(n), 0);
    // Replicas add read capacity
    const replicaCap = sqlReplica.reduce((sum, n) => sum + nodeCapacity(n) * nodeUnits(n), 0);
    const readCapacity = primaryCap + replicaCap + searchCap;
    const writeCapacity = primaryCap + tsCap;
    // Reads
    const readDemand = demandOnData * challenge.readShare;
    // Writes
    const writeDemand = demandOnData * (1 - challenge.readShare);

    const readRatio = readCapacity > 0 ? Math.min(1, readCapacity / Math.max(readDemand, 1)) : 0;
    const writeRatio = writeCapacity > 0 ? Math.min(1, writeCapacity / Math.max(writeDemand, 1)) : 0;
    dataCapacity = demandOnData * Math.min(readRatio, writeRatio);

    // Flag overloaded data nodes
    if (readDemand > readCapacity) {
      sqlPrimary.forEach((n) => overloadedNodeIds.push(n.id));
      sqlReplica.forEach((n) => overloadedNodeIds.push(n.id));
      searchIndexNodes.forEach((n) => overloadedNodeIds.push(n.id));
    }
    if (writeDemand > writeCapacity) {
      sqlPrimary.forEach((n) => {
        if (!overloadedNodeIds.includes(n.id)) overloadedNodeIds.push(n.id);
      });
      timeSeriesNodes.forEach((n) => {
        if (!overloadedNodeIds.includes(n.id)) overloadedNodeIds.push(n.id);
      });
    }
  } else if (nosqlNodes.length > 0) {
    const nosqlCap = nosqlNodes.reduce((sum, n) => sum + nodeCapacity(n), 0) + tsCap + searchCap;
    dataCapacity = nosqlCap;
    if (demandOnData > dataCapacity) {
      nosqlNodes.forEach((n) => overloadedNodeIds.push(n.id));
      timeSeriesNodes.forEach((n) => overloadedNodeIds.push(n.id));
      searchIndexNodes.forEach((n) => overloadedNodeIds.push(n.id));
    }
  } else if (nodes.some((n) => n.data.type === 'objectStorage')) {
    // Object storage is high capacity
    dataCapacity = 1_000_000;
  } else {
    // No data store — still can serve if no persistence required
    dataCapacity = demandOnData;
  }

  // Check data warehouse & block storage overloads (off request path but can overload)
  for (const n of warehouseNodes) {
    if (demandOnData * 0.05 > nodeCapacity(n)) {
      overloadedNodeIds.push(n.id);
    }
  }
  for (const n of blockStorageNodes) {
    if (demandOnData > nodeCapacity(n)) {
      overloadedNodeIds.push(n.id);
    }
  }

  // ─── Bottleneck resolution ───
  const effectiveDataCapacity = dataCapacity + cacheAbsorbed;
  const effectiveComputeCapacity = computeCapacity === 0 ? effectiveDataCapacity : computeCapacity;

  const bottleneck = Math.min(
    effectiveComputeCapacity,
    computeCapacity === 0 ? 1_000_000 : effectiveComputeCapacity,
    effectiveDataCapacity > 0 ? effectiveDataCapacity : 1_000_000
  );

  const servedRps = Math.min(demandAfterCdn, bottleneck) + cdnAbsorbed;
  const errorRatePct = Math.max(
    0,
    ((challenge.targetRps - servedRps) / challenge.targetRps) * 100
  );

  return {
    servedRps: Math.round(servedRps),
    errorRatePct: Math.round(errorRatePct * 10) / 10,
    overloadedNodeIds: [...new Set(overloadedNodeIds)],
    computeCapacity,
    dataCapacity: effectiveDataCapacity,
    effectiveDemand: demandAfterCdn,
    cdnAbsorbed,
    cacheAbsorbed,
  };
}
