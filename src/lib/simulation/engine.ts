import type { Node, Edge } from '@xyflow/react';
import type { ServiceNodeData, SimulationConstraints, SimResult } from '@/types';
import { computeThroughput } from './throughput';
import { computeLatency } from './latency';
import { computeAvailability, detectSpofs } from './availability';
import { computeCost } from './cost';
import { computeScore } from './scoring';
import { detectSecurityViolations } from './graph';

export function simulate(
  nodes: Node<ServiceNodeData>[],
  edges: Edge[],
  challenge: SimulationConstraints
): SimResult {
  // Run all sub-models
  const throughput = computeThroughput(nodes, edges, challenge);
  const p50LatencyMs = computeLatency(
    nodes,
    edges,
    challenge,
    throughput.effectiveDemand,
    throughput.computeCapacity,
    throughput.dataCapacity
  );
  const availability = computeAvailability(nodes);
  const spofs = challenge.requiresHA ? detectSpofs(nodes) : [];
  const monthlyCost = computeCost(nodes, throughput.servedRps);
  const securityViolations = detectSecurityViolations(nodes, edges);

  const { criteria, score, grade } = computeScore(
    challenge,
    throughput.servedRps,
    throughput.errorRatePct,
    p50LatencyMs,
    availability,
    monthlyCost,
    securityViolations,
    spofs,
    nodes
  );

  return {
    servedRps: throughput.servedRps,
    errorRatePct: throughput.errorRatePct,
    p50LatencyMs,
    availability,
    monthlyCost,
    spofs,
    securityViolations,
    overloadedNodeIds: throughput.overloadedNodeIds,
    criteria,
    score,
    grade,
  };
}
