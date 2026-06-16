import type { Node } from '@xyflow/react';
import type { SimulationConstraints, CriterionResult, SimResult, ServiceNodeData } from '@/types';

export function computeScore(
  challenge: SimulationConstraints,
  servedRps: number,
  errorRatePct: number,
  p50LatencyMs: number,
  availability: number,
  monthlyCost: number,
  securityViolations: string[],
  spofs: string[],
  nodes?: Node<ServiceNodeData>[]
): { criteria: CriterionResult[]; score: number; grade: SimResult['grade'] } {
  const criteria: CriterionResult[] = [];

  // ─── Throughput (max 30) ───
  const throughputRatio = Math.min(1, servedRps / challenge.targetRps);
  const throughputPoints = errorRatePct === 0 ? 30 : Math.round(throughputRatio * 30);
  criteria.push({
    key: 'throughput',
    label: 'Throughput',
    passed: errorRatePct === 0,
    points: throughputPoints,
    max: 30,
    detail: errorRatePct === 0
      ? `Serving ${servedRps.toLocaleString()} RPS — all traffic handled. ✓`
      : `Only serving ${servedRps.toLocaleString()} of ${challenge.targetRps.toLocaleString()} RPS (${errorRatePct.toFixed(1)}% error rate). Add more compute capacity or a cache to absorb the bottleneck tier.`,
  });

  // ─── Latency (max 20) ───
  const latencyPassed = p50LatencyMs <= challenge.maxLatencyMs;
  let latencyPoints: number;
  if (latencyPassed) {
    latencyPoints = 20;
  } else if (p50LatencyMs <= challenge.maxLatencyMs * 2) {
    // Linear down to 2× the limit
    latencyPoints = Math.round(20 * (1 - (p50LatencyMs - challenge.maxLatencyMs) / challenge.maxLatencyMs));
  } else {
    latencyPoints = 0;
  }
  criteria.push({
    key: 'latency',
    label: 'Latency',
    passed: latencyPassed,
    points: Math.max(0, latencyPoints),
    max: 20,
    detail: latencyPassed
      ? `p50 latency is ${p50LatencyMs}ms — under the ${challenge.maxLatencyMs}ms target. ✓`
      : `p50 latency is ${p50LatencyMs}ms, exceeding the ${challenge.maxLatencyMs}ms target. Add a CDN or cache to short-circuit the critical path, or reduce hops.`,
  });

  // ─── Availability (max 20) ───
  const availPassed = availability >= challenge.slaAvailability;
  const availShortfall = Math.max(0, challenge.slaAvailability - availability);
  const availPoints = availPassed
    ? 20
    : Math.max(0, Math.round(20 * (1 - availShortfall / (1 - challenge.slaAvailability + 0.001))));
  const availPct = (availability * 100).toFixed(3);
  const targetPct = (challenge.slaAvailability * 100).toFixed(3);
  criteria.push({
    key: 'availability',
    label: 'Availability',
    passed: availPassed,
    points: availPoints,
    max: 20,
    detail: availPassed
      ? `System availability is ${availPct}% — meets the ${targetPct}% SLA. ✓`
      : `System availability is ${availPct}%, below the ${targetPct}% SLA. Add redundant compute (use an ASG or add multiple instances), read replicas for the DB, or a load balancer.`,
  });

  // ─── Cost (max 15) ───
  const costPassed = monthlyCost <= challenge.budgetUsd;
  const costOverPct = Math.max(0, (monthlyCost - challenge.budgetUsd) / challenge.budgetUsd);
  const costPoints = costPassed
    ? 15
    : Math.max(0, Math.round(15 * (1 - costOverPct)));
  criteria.push({
    key: 'cost',
    label: 'Cost',
    passed: costPassed,
    points: costPoints,
    max: 15,
    detail: costPassed
      ? `Monthly cost is $${monthlyCost} — within the $${challenge.budgetUsd} budget. ✓`
      : `Monthly cost is $${monthlyCost}, over the $${challenge.budgetUsd} budget by $${monthlyCost - challenge.budgetUsd}. Remove expensive nodes or switch to serverless/smaller instances.`,
  });

  // ─── Security (max 10) — binary ───
  const securityPassed = securityViolations.length === 0;
  criteria.push({
    key: 'security',
    label: 'Security',
    passed: securityPassed,
    points: securityPassed ? 10 : 0,
    max: 10,
    detail: securityPassed
      ? 'No direct public-to-private data leaks active (WAF/Auth active or secure path wired). ✓'
      : `Security violation: ${securityViolations.join(', ')}. Public-facing nodes must not connect directly to private databases — route through compute or shield with WAF/Auth.`,
  });

  // ─── Resilience (max 5) ───
  const activeNodes = nodes ?? [];
  const hasMonitoring = activeNodes.some(n => n.data.type === 'monitoring');
  const hasLogging = activeNodes.some(n => n.data.type === 'logging');
  const hasTracing = activeNodes.some(n => n.data.type === 'tracing');
  const hasAlerting = activeNodes.some(n => n.data.type === 'alerting');
  const hasSecretsManager = activeNodes.some(n => n.data.type === 'secretsManager');

  let baseResiliencePoints = !challenge.requiresHA
    ? 5
    : spofs.length === 0
    ? 5
    : Math.max(0, 5 - spofs.length * 2);

  let resiliencePassed = !challenge.requiresHA || (spofs.length === 0 && hasMonitoring);
  let details = '';

  if (challenge.requiresHA) {
    if (!hasMonitoring) {
      baseResiliencePoints = Math.max(0, baseResiliencePoints - 3); // -3 "flying blind" penalty
      details += '⚠ Flying Blind: Missing Monitoring in HA configuration (-3 pts). ';
      resiliencePassed = false;
    } else {
      details += 'Monitoring active. ';
    }
  }

  // Bonuses
  let bonusPoints = 0;
  const activeBonuses: string[] = [];
  if (hasLogging) { bonusPoints += 1; activeBonuses.push('Logging'); }
  if (hasTracing) { bonusPoints += 1; activeBonuses.push('Tracing'); }
  if (hasAlerting) { bonusPoints += 1; activeBonuses.push('Alerting'); }
  if (hasSecretsManager) { bonusPoints += 1; activeBonuses.push('Secrets Manager'); }

  const resiliencePoints = Math.min(5, baseResiliencePoints + bonusPoints);
  if (activeBonuses.length > 0) {
    details += `Bonuses added for: ${activeBonuses.join(', ')} (+${bonusPoints} pts). `;
  }

  if (!challenge.requiresHA) {
    details += 'High availability not required for this challenge. ✓';
  } else if (spofs.length === 0) {
    details += 'No single points of failure detected. ✓';
  } else {
    details += `Found ${spofs.length} SPOF(s) in the architecture. Replace single Compute Instances with an Auto Scaling Group, and add read replicas to your SQL Primary to eliminate failure points.`;
  }

  criteria.push({
    key: 'resilience',
    label: 'Resilience',
    passed: resiliencePassed && spofs.length === 0,
    points: resiliencePoints,
    max: 5,
    detail: details,
  });

  const score = criteria.reduce((sum, c) => sum + c.points, 0);

  let grade: SimResult['grade'];
  if (score >= 95) grade = 'S';
  else if (score >= 85) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 50) grade = 'C';
  else grade = 'F';

  return { criteria, score, grade };
}
