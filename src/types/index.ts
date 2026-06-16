export type ServiceCategory = 'source' | 'edge' | 'networking' | 'compute' | 'data' | 'async' | 'security' | 'observability';

export type ServiceType =
  | 'client'
  | 'cdn' | 'apiGateway'
  | 'loadBalancer'
  | 'computeInstance' | 'autoScalingGroup' | 'serverless'
  | 'cache' | 'sqlPrimary' | 'sqlReplica' | 'nosqlDb' | 'objectStorage'
  | 'messageQueue' | 'worker'
  // v3 additions
  | 'dns' | 'rateLimiter' | 'containerCluster' | 'edgeFunction' | 'gpuInstance'
  | 'searchIndex' | 'timeSeriesDb' | 'dataWarehouse' | 'blockStorage'
  | 'pubSub' | 'streamProcessor' | 'scheduler' | 'workflowOrchestrator'
  | 'waf' | 'ddosProtection' | 'authService' | 'secretsManager'
  | 'monitoring' | 'logging' | 'alerting' | 'tracing';

export interface NodeConfig {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  region?: 'single-az' | 'multi-az' | 'multi-region';
  autoscale?: { min: number; max: number; targetUtil: number };
  cachePolicy?: 'read-through' | 'write-through' | 'write-back';
  ttlSeconds?: number;
  replication?: { factor: number; mode: 'sync' | 'async' };
  storageClass?: 'hot' | 'warm' | 'cold';
  label?: string;
}

export interface ServiceSpec {
  type: ServiceType;
  label: string;
  category: ServiceCategory;
  icon: string;               // lucide icon name
  costPerMonth: number;       // USD; per-unit for scalable types
  capacityRps: number;        // max RPS one unit serves
  latencyMs: number;          // latency this hop adds (ms)
  availability: number;       // single-unit availability (e.g. 0.99)
  isRedundant?: boolean;      // a single node implies multi-unit (ASG)
  scalable?: { min: number; max: number; default: number };
  cacheHitRatio?: number;     // cdn / cache only
}

// Must extend Record<string, unknown> for @xyflow/react Node<T> constraint
export interface ServiceNodeData extends Record<string, unknown> {
  type: ServiceType;
  units?: number;
  label: string;
  config?: NodeConfig;
}

export type GameMode = 'sandbox' | 'scenario';

export type ProviderSkin   = 'generic' | 'aws-style' | 'azure-style' | 'gcp-style';
export type PaletteTheme   = 'candy' | 'pastel' | 'neon' | 'mono-pro';
export type SceneBg        = 'vanilla' | 'sky' | 'mint' | 'bubble' | 'dusk';


export interface SerializedNode {
  id: string;
  type: ServiceType;
  units?: number;
  label: string;
  position: { x: number; y: number };
}

export interface SerializedEdge {
  id: string;
  source: string;
  target: string;
}

export interface SimulationConstraints {
  targetRps: number;
  maxLatencyMs: number;
  budgetUsd: number;
  slaAvailability: number;
  readShare: number;
  staticShare: number;
  requiresPersistence: boolean;
  requiresHA: boolean;
}

export interface Scenario extends SimulationConstraints {
  id: string;
  title: string;
  brief: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  startingArchitecture?: { nodes: SerializedNode[]; edges: SerializedEdge[] };
}

export interface SandboxPreset {
  id: string;
  label: string;
  hint: string;         // e.g. "video delivery + metadata + transcoding"
  readShare: number;
  staticShare: number;
}

export interface CriterionResult {
  key: 'throughput' | 'latency' | 'availability' | 'cost' | 'security' | 'resilience';
  label: string;
  passed: boolean;
  points: number;
  max: number;
  detail: string;       // actionable explanation
}

export interface SimResult {
  servedRps: number;
  errorRatePct: number;
  p50LatencyMs: number;
  availability: number;
  monthlyCost: number;
  spofs: string[];
  securityViolations: string[];
  overloadedNodeIds: string[];
  criteria: CriterionResult[];
  score: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'F';
}
