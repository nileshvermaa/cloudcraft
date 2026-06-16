# CloudCraft Studio — Build Plan & Spec (v3)

> A drag-and-drop, gamified cloud / system-design game with an **isometric "cloud city" board** and a **Dumb-Ways-to-Die-style cast of blob characters**.
> Two modes: **Sandbox** (build it, then stress it) and **Scenarios** (fix a broken architecture under constraints).

**What v3 adds on top of the working v2 app — three additive layers. The engine, modes, rules, and 2.5D tiles are unchanged:**
1. **Visual identity + the cast** — a candy color world, springy motion, and an *original* roster of DWTD-style blob characters that ARE the traffic and the comedy. The infrastructure stays realistic 2.5D; the characters bring the personality.
2. **Catalog expansion** — ~20 more realistic cloud services, plus two new *support* categories (security, observability), to get "as close to the real thing as possible."
3. **Customization depth** — richer per-node config (instance size, multi-AZ, policies) that feeds the simulation, plus cosmetic skins (provider vernacular, board scenes, palettes).

**How to use this document:** Build **one phase at a time** (§9). Each phase ends with an *Accept* check — don't advance until it passes. v3 work assumes the v2 core (Phases 0–6) is already working; the v3 phases are E1–E2 (expansion), V1–V2 (visuals + cast), C1 (cosmetics). Use the exact stack/versions in §2 and the exact tokens in §3. Keep **all** game logic in `src/lib` as pure functions; React only renders store state and dispatches actions — this is what keeps the engine testable and lets the renderer absorb the new visual layer (and a true-3D swap later) without touching the math.

---

## 1. Concept & modes (recap — unchanged from v2)

Compose a cloud architecture from draggable service tiles, wire them, run a deterministic simulation. The engine checks **do the pieces connect legally** and **are users actually being served**, and returns metrics + feedback.

- **Sandbox** — open board + full palette + a **load dial**; crank load, watch it break, fix, re-run. No grade.
- **Scenario** — board loads **pre-populated with a broken architecture** + story + hard constraints; diagnose, fix, **scored**.

Both share one engine, catalog, rules, tiles, and store; `mode` only flips the starting board state and whether scoring is active.

---

## 2. Tech stack (current as of June 2026)

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | **16.2.x** | Turbopack default; Node **20+** |
| UI runtime | React / React DOM | **19.x** | |
| Language | TypeScript | **5.x** | strict |
| Canvas / node editor | **@xyflow/react** | **12.11.x** | NOT legacy `reactflow` |
| State | **Zustand** | **5.x** | one store |
| Styling | **Tailwind CSS v4** | **4.x** | CSS-first `@theme`; no config file |
| Components | **shadcn/ui** | latest CLI | `new-york`; `tw-animate-css` + `sonner` |
| Icons | **lucide-react** | latest | |
| **UI / menu animation** | **Motion** (ex-Framer Motion) | **12.x** | pkg `motion`, import `motion/react` |
| **Character animation** | **Rive** | `@rive-app/react-canvas` **4.28.x** | `useRive` + `useStateMachineInput`; triggers fired from sim events |
| Fonts | **Fredoka**, **Nunito**, **JetBrains Mono** | `next/font/google` | see §3.3 |
| Backend *(opt, Phase 7)* | Next Route Handlers / Hono on Render + **Neon** + **Drizzle 0.44.x** | — | leaderboards/accounts |
| True 3D *(opt, Phase 8)* | React Three Fiber + three + drei | — | swaps renderer only; coexists with Rive cast |

```bash
npm install @xyflow/react zustand lucide-react motion @rive-app/react-canvas
```

**Do NOT** add a second drag-and-drop library, use the legacy `reactflow` name, or add a 3D library before Phase 8. The 2.5D isometric tiles stay — v3 does **not** flatten them.

---

## 3. Visual identity & the cast (the heart of v3)

### 3.1 The three-layer look — how "cute" and "realistic" coexist

The apparent tension (DWTD blobs vs "as close to the real thing") is resolved by separating the world into three layers:

1. **Infrastructure (realistic, 2.5D).** The service tiles keep their isometric, believable forms and recognizable iconography — this is the *stage/set* and it reads as real infra. v3 only gives tiles subtle **micro-personality** (idle blink, a sweat-drop when hot, a happy bob when healthy) — alive, but never cartoon.
2. **The cast (DWTD blobs).** An **original** roster of flat, bright, squishy blob characters with dot eyes. They are the *living* layer: the requests flowing through your system, a host/guide, an intruder, the ops crew. They carry the comedy and the animation.
3. **The world (candy scenes).** Menus, transitions, and result moments adopt the playful DWTD palette + springy motion + light comedic copy and sound.

**The thesis that ties the borrowed style to the lesson: "Dumb Ways Your Stack Dies."** When an architecture fails, the cast dies in dumb, *preventable* ways — which is exactly what system design teaches. The aesthetic isn't decoration; it's the pedagogy.

> **Keep the IP yours.** Build an *original* cast in the DWTD *style* (flat bright blobs, dot eyes, squash-and-stretch, dark-comedy-cute) — do not copy their specific characters, names, song, or branding. Original designs map cleanly to *your* concepts (packets, ops crew, the intruder) and keep the franchise yours.

### 3.2 Color palette (revamped — replaces v2's blueprint palette)

Bright **candy** hues for functional categories (so they pop), **muted** tones for the new support categories (so they recede), red/amber/green reserved for **state**, and soft tinted **scene** backgrounds for the world.

| Token | Hex | Role |
|---|---|---|
| `--scene-vanilla` / `--scene-sky` / `--scene-mint` / `--scene-bubble` / `--scene-dusk` | `#FFF7ED` `#E8F6FF` `#E7FBF3` `#FFEAF2` `#EEEAFE` | menu / transition backdrops (DWTD soft solids) |
| `--color-board` | `#FFFDF8` | board surface (warm off-white, not clinical) |
| `--color-grid` | `#EFEADF` | isometric grid lines |
| `--color-ink` / `--color-ink-soft` / `--color-ink-muted` | `#1B1733` `#5B5470` `#9A92AD` | text (warm near-black → muted) |
| **functional (candy)** | | **tile color; side faces darker shades** |
| `--cat-source` | `#9B5DE5` | Grape — Users / Client |
| `--cat-edge` | `#22B8FF` | Sky — CDN, API Gateway, DNS |
| `--cat-net` | `#FF8A3D` | Tangerine — Load Balancer, Rate Limiter |
| `--cat-compute` | `#1DD3A0` | Mint — Compute / ASG / Serverless / Cluster / GPU |
| `--cat-data` | `#3D5AFE` | Blueberry — Cache, SQL, NoSQL, Storage, Search, TS, DW |
| `--cat-async` | `#FF6FA5` | Bubblegum — Queue, Pub/Sub, Stream, Worker, Scheduler |
| **support (muted)** | | **recede behind functional infra** |
| `--cat-security` | `#3B4252` | Steel — WAF, Auth, DDoS, Secrets (shield motif) |
| `--cat-observability` | `#64748B` | Slate — Monitoring, Logging, Alerting, Tracing |
| **state** | | **rings / squish / badges only — never recolor a tile** |
| `--state-ok` / `--state-warn` / `--state-danger` | `#34D399` `#FFB81C` `#FF4D4D` | healthy / near-cap / overload-fail |
| **character beans** | | **Pings/cast pick randomly from this set** |
| coral `#FF6B6B`, sun `#FFD93D`, aqua `#4ECDC4`, grapey `#A78BFA`, bubble `#FF8FB1`, lime `#A3E635`, tang `#FFA94D` | | the candy "bean" colors |

Tile depth: top face = base hue, left face = base −12%, right face = base −22% (consistent light). Support categories use their muted hue with a darker rim and a small shield/gauge glyph.

### 3.3 Typography (revamped for the DWTD world)

The cuddly world + a deliberately *serious* telemetry mono is the joke — the metrics stay technical while everything else is friendly.

- **Display — Fredoka.** Chunky, rounded, bouncy. The wordmark, headings, big result grade, character speech. Pure DWTD energy. *(was Bricolage in v2.)*
- **Body / UI — Nunito.** Rounded, warm, highly legible. *(was Inter in v2.)*
- **Data / Mono — JetBrains Mono.** Unchanged. Every number (RPS, latency, cost, availability, unit counts) — the one "real instrument" in a toy world.

```ts
import { Fredoka, Nunito, JetBrains_Mono } from 'next/font/google';
export const display = Fredoka({ subsets:['latin'], variable:'--font-fredoka' });
export const sans    = Nunito({ subsets:['latin'], variable:'--font-nunito' });
export const mono    = JetBrains_Mono({ subsets:['latin'], variable:'--font-jetbrains' });
```

### 3.4 `globals.css` (Tailwind v4)

```css
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --font-display: var(--font-fredoka), ui-sans-serif, system-ui, sans-serif;
  --font-sans:    var(--font-nunito), ui-sans-serif, system-ui, sans-serif;
  --font-mono:    var(--font-jetbrains), ui-monospace, monospace;
}

@theme {
  --color-board: #FFFDF8;  --color-grid: #EFEADF;
  --color-ink: #1B1733;  --color-ink-soft: #5B5470;  --color-ink-muted: #9A92AD;

  --color-cat-source: #9B5DE5; --color-cat-edge: #22B8FF; --color-cat-net: #FF8A3D;
  --color-cat-compute: #1DD3A0; --color-cat-data: #3D5AFE; --color-cat-async: #FF6FA5;
  --color-cat-security: #3B4252; --color-cat-observability: #64748B;

  --color-state-ok: #34D399; --color-state-warn: #FFB81C; --color-state-danger: #FF4D4D;
  --radius: 1rem; /* rounder than v2 to match the friendly world */
}
```

### 3.5 The cast (original characters)

Each is an original design in the DWTD style, maps to a real concept, and is animated via a **Rive state machine** whose inputs are fired from simulation events.

| Character | What it is | Look | Rive states (triggered by) |
|---|---|---|---|
| **Nimbus** | Host / guide / mascot | small rounded cloud-blob, dot eyes, blush, stubby arms | `idle` float, `cheer` (grade A/S), `faint` (grade F), `point` (tutorial tips) |
| **Pings** | The requests / users (the traffic) | jellybean blobs, one candy color each, tiny legs | `happy` (served fast), `anxious` (queuing / util>80%), `sleepy` (latency over limit), `splat` (dropped / 504) |
| **The Leak** | The intruder (security) | tiny masked burglar-bean with a sack | `sneak` then `grab` — appears **only** on a security violation: strolls into the unprotected data store and runs off with "DATA"; `bounced` if a WAF/Auth blocks it |
| **The Crew** | Ops blobs on compute/workers | hard-hat beans | `work` (normal), `panic` (overloaded), `faint` (one collapses on death) |
| **Billy** | The accountant (budget) | tidy bean with a ledger | `ok` (under budget), `faint` (over budget, faceplants on the invoice) |

**Wiring:** the simulation already returns `overloadedNodeIds`, `securityViolations`, `spofs`, latency, cost, grade. A `useRiveEvents(result)` layer maps those to `useStateMachineInput(...).fire()` / value sets. Pings spawn at the `client` source and travel the conduits (path = the served route); count/speed scale with served RPS.

### 3.6 "Dumb Ways Your Stack Dies" — failure vignettes (tie comedy to the lesson)

Played in the result/failure moment; each is quick, funny, and names the fix.

| Death | Trigger | Vignette | Lesson |
|---|---|---|---|
| Overworked | tier overloaded | tile sweats, Pings pile up, Crew panics, tile pops | scale out (ASG/cluster, more units) |
| The domino | SPOF dies (HA scenario) | the lone critical tile faints → downstream Pings faint in a chain | add redundancy / multi-AZ |
| The break-in | security violation | The Leak walks into the open DB and grabs DATA | add WAF/Auth; never public→DB |
| The big sleep | p50 over the limit | Pings trudge, yawn, fall asleep and vanish | add cache/CDN, right-size compute |
| Bill shock | over budget | Billy faints on the invoice | cut overprovisioning / cheaper tiers |

### 3.7 Animation language & stack

- **Rive** (`@rive-app/react-canvas`) → the cast (§3.5). Author characters + state machines in the Rive editor; drive them with `useStateMachineInput`. **Asset note:** the art/animation is authored in Rive (a design task), not generated by a coding agent. The agent builds the integration + event wiring and ships **code-drawn SVG blob placeholders** (Motion springs) so the game is fully playable before polished art lands.
- **Motion** (`motion/react`) → UI/menu choreography: springy panel entrances, the tile **lift-on-drag** (squash + growing shadow), the conduit **snap-on-connect** pop, mode-select transitions, result-card stamp-in (overshoot).
- **CSS/SVG** → tile micro-personality (blink, sweat) and conduit dash-flow — keep the cheap stuff cheap.
- **Motion language:** springy easing with slight overshoot, squash-and-stretch, idle breathing/bobbing, anticipation before big actions. Orchestrate **one** big moment — the simulation run (Pings stream in → bottleneck reaction → result resolves) — and keep idle UI calm.
- **Accessibility:** honor `prefers-reduced-motion` (Motion's `useReducedMotion`); provide a calm fallback (no ragdoll/confetti, instant state changes, static result).

### 3.8 Menus & scenes

- **Mode select** = a DWTD-style scene: a soft tinted backdrop, Nimbus hosting, Pings milling about, two big bouncy cards (**Sandbox** / **Scenarios**). Scenarios expands to a row of scenario cards (mono-badge constraints + difficulty).
- Each board/scenario can set a **scene background** from the `--scene-*` tints.
- Optional **sound**: light, bouncy SFX for place/connect/run/cheer/splat; a mute toggle; default to subtle.
- **Microcopy** (interface voice): active voice, sentence case. Button **"Run simulation"** → toast **"Simulation complete."** Failures give direction in-character via Nimbus: *"Your database is doing all the work — give it a cache, mate."* Empty board: *"Drag a piece from the left to start building."*

---

## 4. Expanded catalog (`src/lib/catalog.ts`)

v2 core (14 elements) is unchanged: `client, cdn, apiGateway, loadBalancer, computeInstance, autoScalingGroup, serverless, cache, sqlPrimary, sqlReplica, nosqlDb, objectStorage, messageQueue, worker`. **v3 adds the following** (starting balance — tune after playtest). Extend `ServiceType`, the catalog, `PALETTE_ORDER`, and the `ALLOWED` map in §6 for each.

| type | category | $/mo | capacity (RPS) | +lat (ms) | avail | special effect / teaches |
|---|---|---:|---:|---:|---:|---|
| `dns` | edge | 10 | 1,000,000 | 10 | 0.9999 | entry/resolution; single = SPOF lesson |
| `rateLimiter` | networking | 15 | 150,000 | 2 | 0.999 | sheds abusive traffic; protects downstream from spikes |
| `containerCluster` | compute | 50/unit | 3,000/unit | 18 | 0.999 | K8s-like; scalable 3–20; redundant; modern compute |
| `edgeFunction` | compute | 0.25 / 1k RPS | 200,000 | 8 | 0.9995 | runs at the edge; very low latency for light dynamic |
| `gpuInstance` | compute | 120/unit | 1,000/unit | 25 | 0.99 | heavy work (ML / transcode); expensive |
| `searchIndex` | data | 55 | 30,000 | 12 | 0.999 | search-heavy reads (e-commerce, content) |
| `timeSeriesDb` | data | 45 | 40,000 | 8 | 0.999 | metrics / IoT writes |
| `dataWarehouse` | data | 90 | 5,000 | 200 | 0.999 | analytics/batch; **not** the request path |
| `blockStorage` | data | 10/unit | — | 3 | 0.9999 | disks attached to compute |
| `pubSub` | async | 25 | 200,000 | — | 0.999 | event bus; fan-out to many consumers |
| `streamProcessor` | async | 60 | 500,000 | — | 0.9995 | Kafka/Kinesis-like high-throughput pipeline |
| `scheduler` | async | 5 | — | — | 0.999 | cron; triggers batch jobs |
| `workflowOrchestrator` | async | 30 | — | — | 0.999 | coordinates multi-step jobs |
| `waf` | security | 35 | 80,000 | 4 | 0.999 | **blocks The Leak**; nullifies public-edge security violations |
| `ddosProtection` | security | 40 | 1,000,000 | 3 | 0.9999 | absorbs attack/spike traffic (DDoS scenarios) |
| `authService` | security | 30 | 40,000 | 8 | 0.999 | gates private resources; required by some scenarios |
| `secretsManager` | security | 15 | — | — | 0.9999 | best-practice element; small scoring bonus |
| `monitoring` | observability | 20 | — | — | 0.999 | no capacity; **richer in-game feedback**; avoids "flying blind" penalty in HA scenarios |
| `logging` | observability | 15 | — | — | 0.999 | debugging aid; small bonus |
| `alerting` | observability | 10 | — | — | 0.999 | pairs with monitoring; faster "recovery" flavor |
| `tracing` | observability | 20 | — | — | 0.999 | distributed tracing; bonus on complex graphs |

---

## 5. Customization depth

Extend `ServiceNodeData` with a `config` object; a **config panel** appears when a tile is selected (shadcn `select`/`slider`). All functional config feeds the engine (§6); cosmetic config is presentation-only.

**Per-node functional config:**
- **Size / tier** (`small | medium | large | xlarge`) for compute/DB/cache → multiplies capacity & cost (≈ ×0.5 / ×1 / ×2 / ×4) and nudges latency.
- **Region** (`single-az | multi-az | multi-region`) → raises availability and cost; the big HA lever (feeds the redundancy term).
- **Autoscaling policy** (ASG/cluster): min, max, target-utilization %.
- **Cache policy** (`read-through | write-through | write-back`) + TTL → adjusts hit ratio / consistency flavor.
- **DB replication**: replication factor, sync vs async.
- **Storage class** (`hot | warm | cold`) for object storage → cost-vs-latency tradeoff.
- **Custom label** — name your service.

**Cosmetic customization:**
- **Provider skin** (`generic | aws-style | azure-style | gcp-style`) → reskins/renames elements to that cloud's vernacular for the "real thing" feel. **Generic representations + your own labels — no official logos/trademarks.** Mechanics unchanged.
- **Board scene** — pick a `--scene-*` backdrop.
- **Character / palette themes** — alternate Ping/Nimbus skins; swappable color themes (Candy default, Pastel, Neon, Mono-pro) via CSS-var swap.

---

## 6. How the expansion plugs into the engine (additive — nothing in v2 breaks)

The tiered bottleneck model (edge → networking → compute → data; async side branch) is unchanged; new elements and config add **extra terms**:

- **Config math:** effective `capacity = base × sizeMultiplier × units`; `cost` scales the same way; `availability` gains the region multiplier (multi-az / multi-region increase the redundancy `1-(1-a)^N` term).
- **Security gate:** if a `waf` or `authService` sits on the public path to private data, security violations are nullified and **The Leak is `bounced`** instead of grabbing DATA. `ddosProtection` raises the effective edge capacity ceiling during spike scenarios.
- **Observability modifiers:** add no capacity; they apply small scoring bonuses and unlock richer feedback. In `requiresHA` scenarios, missing `monitoring` applies a small "flying blind" penalty.
- **New data/async elements** slot into their tiers: `searchIndex`/`timeSeriesDb`/`dataWarehouse` add data-tier capacity for their query types (warehouse is batch, off the request path); `pubSub`/`streamProcessor` add async-branch capacity and smoothing; `gpuInstance` is compute for heavy work (transcode/ML scenarios).
- **Rules:** extend `ALLOWED` (§ v2 rules) — e.g. `client → ddosProtection/waf/dns`; `waf → apiGateway/loadBalancer`; `authService` in front of compute; compute → `searchIndex/timeSeriesDb/pubSub/streamProcessor`; `streamProcessor → worker`; observability elements may attach to any functional node (a non-traffic "attach" edge type). Keep the public→private-data security rule intact.

---

## 7. Updated data shapes (deltas only)

```ts
// extend the union with all §4 additions
export type ServiceType = /* v2 14 types */ | 'dns' | 'rateLimiter' | 'containerCluster'
  | 'edgeFunction' | 'gpuInstance' | 'searchIndex' | 'timeSeriesDb' | 'dataWarehouse'
  | 'blockStorage' | 'pubSub' | 'streamProcessor' | 'scheduler' | 'workflowOrchestrator'
  | 'waf' | 'ddosProtection' | 'authService' | 'secretsManager'
  | 'monitoring' | 'logging' | 'alerting' | 'tracing';

export type ServiceCategory = /* v2 6 */ | 'security' | 'observability';

export interface NodeConfig {
  size?: 'small'|'medium'|'large'|'xlarge';
  region?: 'single-az'|'multi-az'|'multi-region';
  autoscale?: { min: number; max: number; targetUtil: number };
  cachePolicy?: 'read-through'|'write-through'|'write-back'; ttlSeconds?: number;
  replication?: { factor: number; mode: 'sync'|'async' };
  storageClass?: 'hot'|'warm'|'cold';
  label?: string;
}
export interface ServiceNodeData { type: ServiceType; units?: number; label: string; config?: NodeConfig; }

// cosmetic/global, in the store
export type ProviderSkin = 'generic'|'aws-style'|'azure-style'|'gcp-style';
export type PaletteTheme = 'candy'|'pastel'|'neon'|'mono-pro';
export type SceneBg = 'vanilla'|'sky'|'mint'|'bubble'|'dusk';
```

The store gains `providerSkin`, `paletteTheme`, `scene`, and `updateConfig(id, partial)`; everything else from the v2 store stands.

---

## 8. Scenarios touched by the expansion (optional new scenarios)

Existing five (§ v2) still work. The new elements unlock richer scenarios — author when ready:

| id | hook | needs the player to use |
|---|---|---|
| `under-attack` | "A botnet is hammering you." | `ddosProtection` + `rateLimiter` + `waf` |
| `search-everything` | "Product search is timing out." | `searchIndex` + cache |
| `going-global` | "Latency is awful overseas." | `edgeFunction` + CDN + `multi-region` config |
| `blind-outage` | "Something's down and you can't tell what." | `monitoring` + `alerting` + redundancy |
| `transcode-storm` | "Uploads are crushing the servers." | `gpuInstance` workers + `streamProcessor` + object storage |

---

## 9. v3 phases (after v2 core, Phases 0–6, is working)

**Phase E1 — Catalog expansion.** Add all §4 elements to `catalog.ts`, `PALETTE_ORDER`, the two new categories (muted styling), and extend the `ALLOWED` map (§6). Add the observability "attach" edge type. *Accept:* every new element drags onto the board, connects only where legal, and is accounted for by the existing simulation (a search-heavy or attack architecture now scores sensibly).

**Phase E2 — Customization depth.** Add `NodeConfig` + the config panel; wire size/region/policies into the engine (§6). *Accept:* changing a DB from `small/single-az` to `large/multi-az` visibly raises capacity, cost, and availability — and changes the score.

**Phase V1 — Visual identity revamp.** Swap to the §3.2 palette + §3.3 fonts; rebuild menus/transitions with **Motion** (springy entrances, tile lift-on-drag, connect-snap); add tile micro-personality and `--scene-*` backdrops. *Accept:* the menu + board read as the new candy identity (not generic shadcn), motion feels springy, reduced-motion is respected.

**Phase V2 — The cast (Rive).** Integrate **Rive**; build `useRiveEvents(result)` mapping sim events → state-machine triggers (§3.5). Spawn Pings at the source and path them along served routes; play the right "dumb death" vignette (§3.6) on failure; Nimbus hosts menus/results. Ship **code-drawn SVG blob placeholders** first; swap in authored `.riv` art when available. *Accept:* requests visibly flow as Pings, failures trigger the correct vignette, Nimbus reacts to the grade — all driven by the real `SimResult`.

**Phase C1 — Cosmetic customization.** Provider skins (generic vernacular, no trademarks), board scenes, character + palette theme switching. *Accept:* switching any skin/theme reskins the UI without touching mechanics or scores.

*(Phase 7 backend and Phase 8 true-3D remain the original optional tracks. True 3D swaps the tile renderer only and can coexist with the Rive cast.)*

---

## 10. Guardrails for the implementing agent

- v3 is **additive**. Do not change the v2 engine math, rules semantics, modes, or the 2.5D tiles — only extend. Run the v2 scenarios after each v3 phase to confirm nothing regressed.
- Keep **all** logic in `src/lib` as pure functions; React only renders + dispatches. The cast and animations are a presentation layer reading `SimResult` — they must not influence the simulation.
- **Infra stays realistic and 2.5D; the cast is original DWTD-*style*, never copied.** Tiles get micro-personality, not cartoon faces. Do not flatten tiles.
- **Rive**: art is authored in the Rive editor (not by the agent). Ship functional SVG-blob placeholders driven by the same triggers, so the game is playable before art exists. Drive characters via `useStateMachineInput`; never hard-code animation to fake sim data.
- **Motion**: import from `motion/react`; one orchestrated moment (the run), calm idle UI; honor `useReducedMotion`.
- Tailwind **v4** via `@theme`; author colors in hex. Derive every color/font from §3 — don't invent new ones. Functional categories candy, support categories muted, state colors reserved for rings/badges.
- Provider skins use **generic representations + user labels — no official cloud logos or trademarked names** baked in as assets.
- Catalog numbers (§4) and config multipliers (§5) are a **starting balance** — expect a tuning pass after playtest; that's not a bug.
- Type everything; no `any`. `next build` clean before any phase is "done."
