import type { Node } from '@xyflow/react';
import type { ServiceNodeData } from '@/types';
import { CATALOG } from '@/lib/catalog';
import { nodeUnits } from './graph';

export function computeAvailability(nodes: Node<ServiceNodeData>[]): number {
  const COMPUTE_TYPES = new Set([
    'computeInstance', 'autoScalingGroup', 'serverless',
    'containerCluster', 'edgeFunction', 'gpuInstance'
  ]);
  const DATA_TYPES = new Set([
    'cache', 'sqlPrimary', 'sqlReplica', 'nosqlDb', 'objectStorage',
    'searchIndex', 'timeSeriesDb', 'dataWarehouse', 'blockStorage'
  ]);
  const NETWORKING_TYPES = new Set([
    'loadBalancer', 'apiGateway', 'cdn', 'dns', 'rateLimiter', 'waf', 'ddosProtection'
  ]);
  // Async types (messageQueue, worker, pubSub, etc.) don't factor into the synchronous request path availability

  // Group nodes into tiers
  const tiers: Node<ServiceNodeData>[][] = [];

  const computeNodes = nodes.filter((n) => COMPUTE_TYPES.has(n.data.type));
  const networkingNodes = nodes.filter((n) => NETWORKING_TYPES.has(n.data.type));
  const dataNodes = nodes.filter((n) => DATA_TYPES.has(n.data.type));

  if (networkingNodes.length > 0) tiers.push(networkingNodes);
  if (computeNodes.length > 0) tiers.push(computeNodes);
  if (dataNodes.length > 0) tiers.push(dataNodes);

  let systemAvailability = 1.0;

  for (const tier of tiers) {
    // Within a tier, nodes in parallel combine failure probabilities
    let tierFailureProbability = 1.0;

    for (const node of tier) {
      const spec = CATALOG[node.data.type];
      if (!spec) continue;

      const units = nodeUnits(node);
      const unitAvail = spec.availability;

      // Single unit failure prob
      const unitFailure = 1 - unitAvail;

      // Region multiplier (multi-az = 2x redundancy, multi-region = 3x redundancy)
      const region = node.data.config?.region ?? 'single-az';
      const regionFactor = region === 'multi-region' ? 3 : region === 'multi-az' ? 2 : 1;

      // Probability that ALL fail = unitFailure^(units * regionFactor)
      const tierNodeFailure = Math.pow(unitFailure, units * regionFactor);
      tierFailureProbability *= tierNodeFailure;
    }

    // Tier availability (all nodes in tier have at least one working)
    const tierAvailability = 1 - tierFailureProbability;
    systemAvailability *= tierAvailability;
  }

  return Math.min(1.0, Math.max(0, systemAvailability));
}

/** Detect SPOFs: single nodes in critical path with N=1, single-AZ, and no redundant partner. */
export function detectSpofs(nodes: Node<ServiceNodeData>[]): string[] {
  const spofs: string[] = [];
  const CRITICAL_TYPES = new Set([
    'computeInstance', 'sqlPrimary', 'loadBalancer', 'apiGateway', 'cache',
    'dns', 'waf', 'authService', 'containerCluster', 'gpuInstance',
    'searchIndex', 'timeSeriesDb'
  ]);

  for (const node of nodes) {
    if (!CRITICAL_TYPES.has(node.data.type)) continue;

    const spec = CATALOG[node.data.type];
    if (!spec) continue;

    const units = nodeUnits(node);
    const region = node.data.config?.region ?? 'single-az';
    const isMultiUnit = units > 1;
    const isNativelyRedundant = spec.isRedundant ?? false;
    const isMultiAz = region !== 'single-az';

    // Check if there's a redundant partner of the same tier
    const COMPUTE_TYPES = new Set([
      'computeInstance', 'autoScalingGroup', 'serverless',
      'containerCluster', 'edgeFunction', 'gpuInstance'
    ]);
    const tier = COMPUTE_TYPES.has(node.data.type) ? 'compute' : node.data.type;

    let hasRedundantPartner = false;
    for (const other of nodes) {
      if (other.id === node.id) continue;
      const otherType = other.data.type;
      const otherTier = COMPUTE_TYPES.has(otherType) ? 'compute' : otherType;
      if (otherTier === tier) {
        hasRedundantPartner = true;
        break;
      }
    }

    if (!isMultiUnit && !isNativelyRedundant && !hasRedundantPartner && !isMultiAz) {
      spofs.push(node.id);
    }
  }

  return spofs;
}
