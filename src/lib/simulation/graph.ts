import type { Node, Edge } from '@xyflow/react';
import type { ServiceNodeData, ServiceType } from '@/types';
import { CATALOG } from '@/lib/catalog';

export interface AdjacencyMap {
  forward: Map<string, string[]>;  // id -> list of target ids
  backward: Map<string, string[]>; // id -> list of source ids
}

export function buildAdjacency(edges: Edge[]): AdjacencyMap {
  const forward = new Map<string, string[]>();
  const backward = new Map<string, string[]>();

  for (const edge of edges) {
    if (!forward.has(edge.source)) forward.set(edge.source, []);
    if (!backward.has(edge.target)) backward.set(edge.target, []);
    forward.get(edge.source)!.push(edge.target);
    backward.get(edge.target)!.push(edge.source);
  }

  return { forward, backward };
}

/** Returns all node ids reachable from startId following forward edges (BFS). */
export function reachableFrom(startId: string, adj: AdjacencyMap): Set<string> {
  const visited = new Set<string>();
  const queue = [startId];
  while (queue.length) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const next of adj.forward.get(current) ?? []) {
      queue.push(next);
    }
  }
  return visited;
}

/** Returns the primary request path: client -> ... -> first data store (BFS shortest path). */
export function primaryPath(
  nodes: Node<ServiceNodeData>[],
  adj: AdjacencyMap
): string[] {
  const DATA_TYPES = new Set<ServiceType>([
    'cache', 'sqlPrimary', 'sqlReplica', 'nosqlDb', 'objectStorage',
    'searchIndex', 'timeSeriesDb', 'dataWarehouse', 'blockStorage'
  ]);
  const clientNode = nodes.find((n) => n.data.type === 'client');
  if (!clientNode) return [];

  // BFS to find shortest path to first data node
  const queue: string[][] = [[clientNode.id]];
  const visited = new Set<string>();

  while (queue.length) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    if (visited.has(current)) continue;
    visited.add(current);

    const nodeData = nodes.find((n) => n.id === current)?.data;
    if (nodeData && DATA_TYPES.has(nodeData.type) && current !== clientNode.id) {
      return path;
    }

    for (const next of adj.forward.get(current) ?? []) {
      if (!visited.has(next)) {
        queue.push([...path, next]);
      }
    }
  }

  // No data node found — return path to farthest node
  return [clientNode.id];
}

/** Get all compute nodes on the path reachable from a LB or gateway. */
export function getComputeNodes(
  nodes: Node<ServiceNodeData>[],
  adj: AdjacencyMap
): Node<ServiceNodeData>[] {
  const COMPUTE_TYPES = new Set<ServiceType>([
    'computeInstance', 'autoScalingGroup', 'serverless',
    'containerCluster', 'edgeFunction', 'gpuInstance'
  ]);
  const GATEWAY_TYPES = new Set<ServiceType>([
    'loadBalancer', 'apiGateway', 'client', 'dns', 'rateLimiter', 'waf', 'ddosProtection'
  ]);

  const gateways = nodes.filter((n) => GATEWAY_TYPES.has(n.data.type));
  const computeSet = new Set<string>();

  for (const gw of gateways) {
    for (const nextId of adj.forward.get(gw.id) ?? []) {
      const next = nodes.find((n) => n.id === nextId);
      if (next && COMPUTE_TYPES.has(next.data.type)) {
        computeSet.add(next.id);
      }
    }
  }

  return nodes.filter((n) => computeSet.has(n.id));
}

/** Detect security violations: public-facing -> private data direct edges */
export function detectSecurityViolations(
  nodes: Node<ServiceNodeData>[],
  edges: Edge[]
): string[] {
  const PUBLIC_TYPES = new Set<ServiceType>(['client', 'cdn', 'apiGateway', 'dns', 'ddosProtection', 'waf']);
  const PRIVATE_DATA = new Set<ServiceType>([
    'cache', 'sqlPrimary', 'sqlReplica', 'nosqlDb',
    'searchIndex', 'timeSeriesDb', 'dataWarehouse', 'blockStorage'
  ]);
  const violations: string[] = [];

  // Check if a WAF or Auth Service is wired in the active graph
  const hasWaf = edges.some(e => {
    const src = nodes.find(n => n.id === e.source)?.data.type;
    const tgt = nodes.find(n => n.id === e.target)?.data.type;
    return src === 'waf' || tgt === 'waf';
  });
  const hasAuth = edges.some(e => {
    const src = nodes.find(n => n.id === e.source)?.data.type;
    const tgt = nodes.find(n => n.id === e.target)?.data.type;
    return src === 'authService' || tgt === 'authService';
  });

  // Connected WAF/Auth service nullifies direct public-to-private leaks (bounces The Leak)
  if (hasWaf || hasAuth) {
    return [];
  }

  for (const edge of edges) {
    const srcNode = nodes.find((n) => n.id === edge.source);
    const tgtNode = nodes.find((n) => n.id === edge.target);
    if (
      srcNode && tgtNode &&
      PUBLIC_TYPES.has(srcNode.data.type) &&
      PRIVATE_DATA.has(tgtNode.data.type)
    ) {
      violations.push(`${srcNode.data.label} → ${tgtNode.data.label}`);
    }
  }

  return violations;
}

/** Get the effective capacity of a node (accounting for units and size multipliers). */
export function nodeCapacity(node: Node<ServiceNodeData>): number {
  const spec = CATALOG[node.data.type];
  if (!spec) return 0;
  
  // Size multiplier: small = 0.5, medium = 1.0, large = 2.0, xlarge = 4.0
  const size = node.data.config?.size ?? 'medium';
  const sizeMults: Record<string, number> = {
    small: 0.5,
    medium: 1.0,
    large: 2.0,
    xlarge: 4.0,
  };
  const mult = sizeMults[size] ?? 1.0;
  
  const units = nodeUnits(node);
  if (spec.capacityRps === Infinity) {
    return Infinity;
  }
  return Math.round(spec.capacityRps * units * mult);
}

/** Get the effective unit count (defaults from spec if not set). */
export function nodeUnits(node: Node<ServiceNodeData>): number {
  const spec = CATALOG[node.data.type];
  if (spec?.scalable) {
    return node.data.units ?? spec.scalable.default;
  }
  return 1;
}
