import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Node,
  type Edge,
  type XYPosition,
} from '@xyflow/react';
import { toast } from 'sonner';
import { CATALOG } from '@/lib/catalog';
import { validateConnection } from '@/lib/rules';
import { simulate } from '@/lib/simulation/engine';
import { genId } from '@/lib/utils';
import type {
  GameMode,
  Scenario,
  SandboxPreset,
  ServiceNodeData,
  ServiceType,
  SerializedNode,
  SerializedEdge,
  SimResult,
  ProviderSkin,
  PaletteTheme,
  SceneBg,
  NodeConfig,
} from '@/types';

// ─── Helper to build a Node<ServiceNodeData> ───────────────────────────────
function makeNode(type: ServiceType, position: XYPosition, id?: string, customLabel?: string, config?: NodeConfig): Node<ServiceNodeData> {
  const spec = CATALOG[type];
  return {
    id: id ?? genId(),
    type: 'serviceTile',
    position,
    data: {
      type,
      label: customLabel ?? spec.label,
      units: spec.scalable?.default,
      config: config ?? {
        size: 'medium',
        region: 'single-az',
      },
    },
  };
}

function hydrateNodes(serialized: SerializedNode[]): Node<ServiceNodeData>[] {
  return serialized.map((s) => makeNode(s.type, s.position, s.id));
}

function hydrateEdges(serialized: SerializedEdge[]): Edge[] {
  return serialized.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'conduitEdge',
  }));
}

// ─── Default client node placement ─────────────────────────────────────────
const DEFAULT_CLIENT = makeNode('client', { x: 80, y: 200 }, 'client-node');

// ─── Store interface ────────────────────────────────────────────────────────
interface GameStore {
  mode: GameMode;
  scenario: Scenario | null;
  preset: SandboxPreset | null;
  loadRps: number;
  nodes: Node<ServiceNodeData>[];
  edges: Edge[];
  result: SimResult | null;
  isSimulating: boolean;
  bestScores: Record<string, number>;
  bestSandboxLoad: Record<string, number>;

  // Cosmetic & Config States (v3)
  providerSkin: ProviderSkin;
  paletteTheme: PaletteTheme;
  sceneBg: SceneBg;
  selectedNodeId: string | null;

  setProviderSkin: (skin: ProviderSkin) => void;
  setPaletteTheme: (theme: PaletteTheme) => void;
  setSceneBg: (scene: SceneBg) => void;
  setSelectedNodeId: (id: string | null) => void;
  updateConfig: (id: string, config: Partial<NodeConfig>) => void;

  // Mode init
  startSandbox: (preset?: SandboxPreset) => void;
  loadScenario: (s: Scenario) => void;

  // Sandbox dial
  setLoad: (rps: number) => void;

  // React Flow handlers
  onNodesChange: OnNodesChange<Node<ServiceNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  // Node actions
  addNode: (type: ServiceType, position: XYPosition) => void;
  removeNode: (id: string) => void;
  updateUnits: (id: string, units: number) => void;

  // Simulation
  runSimulation: () => void;
  reset: () => void;

  // Persistence
  loadBestScores: () => void;
  saveBestScore: (scenarioId: string, score: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'sandbox',
  scenario: null,
  preset: null,
  loadRps: 1_000,
  nodes: [DEFAULT_CLIENT],
  edges: [],
  result: null,
  isSimulating: false,
  bestScores: {},
  bestSandboxLoad: {},

  // Cosmetic & Config States (v3)
  providerSkin: 'generic',
  paletteTheme: 'candy',
  sceneBg: 'vanilla',
  selectedNodeId: null,

  setProviderSkin: (skin) => set({ providerSkin: skin }),
  setPaletteTheme: (theme) => set({ paletteTheme: theme }),
  setSceneBg: (scene) => set({ sceneBg: scene }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  updateConfig: (id, partialConfig) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, config: { ...n.data.config, ...partialConfig } } } : n
      ),
    }));
  },

  // ── Mode init ─────────────────────────────────────────────────────────────
  startSandbox: (preset) => {
    set({
      mode: 'sandbox',
      scenario: null,
      preset: preset ?? null,
      loadRps: 1_000,
      nodes: [makeNode('client', { x: 200, y: 200 }, 'client-node')],
      edges: [],
      result: null,
      isSimulating: false,
      selectedNodeId: null,
    });
  },

  loadScenario: (s: Scenario) => {
    const nodes = s.startingArchitecture
      ? hydrateNodes(s.startingArchitecture.nodes)
      : [makeNode('client', { x: 200, y: 200 }, 'client-node')];
    const edges = s.startingArchitecture
      ? hydrateEdges(s.startingArchitecture.edges)
      : [];
    set({
      mode: 'scenario',
      scenario: s,
      preset: null,
      loadRps: s.targetRps,
      nodes,
      edges,
      result: null,
      isSimulating: false,
      selectedNodeId: null,
    });
  },

  // ── Sandbox load dial ────────────────────────────────────────────────────
  setLoad: (rps) => set({ loadRps: rps, result: null }),

  // ── React Flow handlers ──────────────────────────────────────────────────
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (params) => {
    const { nodes, edges } = get();
    const sourceNode = nodes.find((n) => n.id === params.source);
    const targetNode = nodes.find((n) => n.id === params.target);
    if (!sourceNode || !targetNode) return;

    const sourceType = sourceNode.data.type;
    const targetType = targetNode.data.type;

    const error = validateConnection(sourceType, targetType, params.source!, params.target!, edges);
    if (error) {
      toast.error(error, { duration: 4000 });
      return;
    }

    set((state) => ({
      edges: addEdge({ ...params, type: 'conduitEdge' }, state.edges),
    }));
  },

  // ── Node actions ─────────────────────────────────────────────────────────
  addNode: (type, position) => {
    const node = makeNode(type, position);
    set((state) => ({ nodes: [...state.nodes, node] }));
  },

  removeNode: (id) => {
    const node = get().nodes.find((n) => n.id === id);
    if (!node) return;
    if (node.data.type === 'client') {
      toast.warning('The client node is the traffic source — it cannot be removed.');
      return;
    }
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
    }));
  },

  updateUnits: (id, units) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, units } } : n
      ),
    }));
  },

  // ── Simulation ───────────────────────────────────────────────────────────
  runSimulation: () => {
    const { nodes, edges, mode, scenario, loadRps, preset, bestSandboxLoad } = get();
    const targetRps = mode === 'scenario' && scenario ? scenario.targetRps : loadRps;

    const constraints = scenario ?? {
      targetRps,
      maxLatencyMs: Infinity,
      budgetUsd: Infinity,
      slaAvailability: 0,
      readShare: preset?.readShare ?? 0.7,
      staticShare: preset?.staticShare ?? 0.2,
      requiresHA: false,
      requiresPersistence: false,
    };

    set({ isSimulating: true, result: null });

    // Tiny async tick for the loading state to show
    setTimeout(() => {
      const result = simulate(nodes, edges, constraints);
      set({ result, isSimulating: false });

      if (mode === 'scenario' && scenario) {
        get().saveBestScore(scenario.id, result.score);
        toast.success('Simulation complete.');
      } else {
        // Sandbox: track best survived load
        const presetId = preset?.id ?? 'freestyle';
        const best = bestSandboxLoad[presetId] ?? 0;
        if (result.errorRatePct === 0 && loadRps > best) {
          set((s) => ({
            bestSandboxLoad: { ...s.bestSandboxLoad, [presetId]: loadRps },
          }));
        }
        toast.success('Simulation complete.');
      }
    }, 400);
  },

  reset: () => {
    const { mode, scenario, preset } = get();
    if (mode === 'scenario' && scenario) {
      get().loadScenario(scenario);
    } else {
      get().startSandbox(preset ?? undefined);
    }
  },

  // ── Persistence ───────────────────────────────────────────────────────────
  loadBestScores: () => {
    try {
      const raw = localStorage.getItem('cloudcraft-best-scores');
      const rawLoad = localStorage.getItem('cloudcraft-best-load');
      set({
        bestScores: raw ? JSON.parse(raw) : {},
        bestSandboxLoad: rawLoad ? JSON.parse(rawLoad) : {},
      });
    } catch {
      // ignore
    }
  },

  saveBestScore: (scenarioId, score) => {
    set((state) => {
      const existing = state.bestScores[scenarioId] ?? 0;
      if (score <= existing) return state;
      const updated = { ...state.bestScores, [scenarioId]: score };
      try { localStorage.setItem('cloudcraft-best-scores', JSON.stringify(updated)); } catch { /* ignore */ }
      return { bestScores: updated };
    });
  },
}));
