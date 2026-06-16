import type { Edge } from '@xyflow/react';
import type { ServiceType } from '@/types';

// Allowed directed connections: source type -> set of legal target types
// Allowed directed connections: source type -> set of legal target types
export const ALLOWED: Record<ServiceType, ServiceType[]> = {
  client:           ['cdn', 'apiGateway', 'loadBalancer', 'dns', 'waf', 'ddosProtection'],
  dns:              ['cdn', 'apiGateway', 'loadBalancer', 'waf', 'ddosProtection'],
  cdn:              ['apiGateway', 'loadBalancer', 'objectStorage', 'edgeFunction'],
  waf:              ['apiGateway', 'loadBalancer', 'cdn'],
  ddosProtection:   ['apiGateway', 'loadBalancer', 'cdn', 'dns', 'waf'],
  rateLimiter:      ['computeInstance', 'autoScalingGroup', 'serverless', 'containerCluster', 'apiGateway', 'loadBalancer'],
  apiGateway:       ['loadBalancer', 'serverless', 'computeInstance', 'autoScalingGroup', 'containerCluster', 'edgeFunction', 'authService', 'rateLimiter'],
  loadBalancer:     ['computeInstance', 'autoScalingGroup', 'serverless', 'containerCluster', 'gpuInstance', 'rateLimiter'],
  authService:      ['computeInstance', 'autoScalingGroup', 'serverless', 'containerCluster'],
  
  // Compute
  computeInstance:  ['cache', 'sqlPrimary', 'sqlReplica', 'nosqlDb', 'objectStorage', 'messageQueue', 'pubSub', 'streamProcessor', 'searchIndex', 'timeSeriesDb', 'dataWarehouse', 'blockStorage', 'authService', 'secretsManager'],
  autoScalingGroup: ['cache', 'sqlPrimary', 'sqlReplica', 'nosqlDb', 'objectStorage', 'messageQueue', 'pubSub', 'streamProcessor', 'searchIndex', 'timeSeriesDb', 'dataWarehouse', 'blockStorage', 'authService', 'secretsManager'],
  serverless:       ['cache', 'sqlPrimary', 'sqlReplica', 'nosqlDb', 'objectStorage', 'messageQueue', 'pubSub', 'streamProcessor', 'searchIndex', 'timeSeriesDb', 'dataWarehouse', 'blockStorage', 'authService', 'secretsManager'],
  containerCluster: ['cache', 'sqlPrimary', 'sqlReplica', 'nosqlDb', 'objectStorage', 'messageQueue', 'pubSub', 'streamProcessor', 'searchIndex', 'timeSeriesDb', 'dataWarehouse', 'blockStorage', 'authService', 'secretsManager'],
  edgeFunction:     ['cache', 'sqlPrimary', 'sqlReplica', 'nosqlDb', 'objectStorage', 'messageQueue', 'pubSub', 'streamProcessor', 'searchIndex', 'timeSeriesDb', 'dataWarehouse', 'blockStorage', 'authService', 'secretsManager'],
  gpuInstance:      ['cache', 'sqlPrimary', 'sqlReplica', 'nosqlDb', 'objectStorage', 'blockStorage', 'messageQueue', 'pubSub', 'streamProcessor'],
  
  // Async Event routers
  messageQueue:     ['worker'],
  pubSub:           ['worker'],
  streamProcessor:  ['worker'],
  scheduler:        ['worker', 'computeInstance', 'autoScalingGroup', 'serverless', 'containerCluster', 'workflowOrchestrator'],
  workflowOrchestrator: ['computeInstance', 'autoScalingGroup', 'serverless', 'containerCluster', 'worker'],
  
  // Workers
  worker:           ['sqlPrimary', 'sqlReplica', 'nosqlDb', 'objectStorage', 'searchIndex', 'timeSeriesDb', 'dataWarehouse', 'blockStorage'],
  
  // Data
  cache:            ['sqlPrimary', 'sqlReplica', 'nosqlDb'],  // cache read-through may write back
  sqlPrimary:       ['sqlReplica'],
  sqlReplica:       [],
  nosqlDb:          [],
  objectStorage:    [],
  searchIndex:      [],
  timeSeriesDb:     [],
  dataWarehouse:    [],
  blockStorage:     [],
  
  // Observability & Security (mostly attached/end-nodes)
  secretsManager:   [],
  monitoring:       [],
  logging:          [],
  alerting:         [],
  tracing:          [],
};

// Public-facing types that must not connect directly to private data
const PUBLIC_TYPES = new Set<ServiceType>(['client', 'cdn', 'apiGateway', 'dns', 'ddosProtection', 'waf']);
const PRIVATE_DATA_TYPES = new Set<ServiceType>([
  'cache', 'sqlPrimary', 'sqlReplica', 'nosqlDb',
  'searchIndex', 'timeSeriesDb', 'dataWarehouse', 'blockStorage'
]);

// Observability and Secrets category helper targets that allow connection attachments from any active node
const ATTACHMENT_TARGETS = new Set<ServiceType>(['monitoring', 'logging', 'alerting', 'tracing', 'secretsManager']);

/**
 * Returns null if the connection is valid, or a human-readable reason string if not.
 */
export function validateConnection(
  sourceType: ServiceType,
  targetType: ServiceType,
  sourceId: string,
  targetId: string,
  existingEdges: Edge[]
): string | null {
  // 1. No self-loops
  if (sourceId === targetId) {
    return 'A node cannot connect to itself.';
  }

  // 2. No duplicate edges
  const duplicate = existingEdges.some(
    (e) => e.source === sourceId && e.target === targetId
  );
  if (duplicate) {
    return 'This connection already exists.';
  }

  // 3. Attachment exceptions: Allow any non-observability/non-source node to connect to monitoring/logging/alerting/tracing/secretsManager
  if (ATTACHMENT_TARGETS.has(targetType)) {
    if (sourceType === 'client') {
      return 'The client node cannot be attached directly to management services.';
    }
    return null;
  }

  // 4. Security rule: public → private data is a security violation
  if (PUBLIC_TYPES.has(sourceType) && PRIVATE_DATA_TYPES.has(targetType)) {
    return `⚠ Security violation: A public ${sourceType} must not connect directly to a private ${targetType}. Route through compute first.`;
  }

  // 5. Must be in the ALLOWED map
  const allowed = ALLOWED[sourceType] ?? [];
  if (!allowed.includes(targetType)) {
    return `A ${sourceType} cannot connect directly to a ${targetType}.`;
  }

  return null;
}
