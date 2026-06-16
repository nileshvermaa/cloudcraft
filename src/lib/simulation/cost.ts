import type { Node } from '@xyflow/react';
import type { ServiceNodeData } from '@/types';
import { CATALOG } from '@/lib/catalog';
import { nodeUnits } from './graph';

export function computeCost(
  nodes: Node<ServiceNodeData>[],
  servedRps: number
): number {
  let total = 0;

  const sizeMults: Record<string, number> = { small: 0.5, medium: 1.0, large: 2.0, xlarge: 4.0 };
  const regionMults: Record<string, number> = { 'single-az': 1.0, 'multi-az': 2.0, 'multi-region': 3.5 };

  for (const node of nodes) {
    const spec = CATALOG[node.data.type];
    if (!spec) continue;

    const size = node.data.config?.size ?? 'medium';
    const region = node.data.config?.region ?? 'single-az';

    const sMult = sizeMults[size] ?? 1.0;
    const rMult = regionMults[region] ?? 1.0;

    if (node.data.type === 'serverless') {
      // Serverless: $0.20 per 1k RPS per month
      total += 0.20 * (servedRps / 1000) * sMult * rMult;
    } else if (node.data.type === 'edgeFunction') {
      // Edge Function: $0.25 per 1k RPS per month
      total += 0.25 * (servedRps / 1000) * sMult * rMult;
    } else {
      const units = nodeUnits(node);
      total += spec.costPerMonth * units * sMult * rMult;
    }
  }

  return Math.round(total);
}
