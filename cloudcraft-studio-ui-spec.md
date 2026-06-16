# CloudCraft Studio — UI / Frontend Spec (v4)

> The complete visual + frontend specification. **Pair this with the build plan** (`cloudcraft-studio-build-plan.md`): that document owns systems, the simulation engine, rules, data, and phases; **this document owns the frontend** — design tokens, components, screens, motion, and the character layer. Where this references the engine, store, catalog, rules, or `SimResult`, those are defined in the build plan and consumed here.
>
> **Audience:** Sonnet (or Claude Code). Build the **component library first**, then assemble screens, stubbing engine/data from the build plan until wired. **Spend boldness in one place:** the *signature* is the isometric cloud-city board + the blob cast — make those memorable and keep all surrounding chrome quiet and disciplined. Infra stays realistic 2.5D; the cast is *original* DWTD-style, never copied.

---

## 0. Stack the frontend assumes (from the build plan)

Next.js 16.2 (App Router, React 19, TS 5), `@xyflow/react` 12.11, Zustand 5, Tailwind v4 (`@theme`, no config file), shadcn/ui (`new-york`, `tw-animate-css`, `sonner`), lucide-react, **Motion** 12 (`import { motion } from 'motion/react'`), **Rive** (`@rive-app/react-canvas` 4.28; `useRive` + `useStateMachineInput`). Optional success-confetti: `canvas-confetti`.

---

## 1. Design language

### 1.1 Identity & the three layers
"Blueprint table meets isometric toy." Three layers, never blurred together:
1. **Infrastructure** — realistic, isometric 2.5D tiles with recognizable forms. The stage. Gets subtle *micro-personality* (blink, sweat, bob) but never a cartoon face.
2. **The cast** — original flat bright blob characters (dot eyes, squash-and-stretch): the requests, a host, an intruder, the ops crew. The life and the comedy.
3. **The world** — menus, transitions, and result moments in a candy palette with springy motion. Tone: "Dumb Ways Your Stack Dies" — failure is comedic and *preventable*, which is the lesson.

### 1.2 Color tokens (candy)
Functional categories are **vivid** (they pop); support categories are **muted** (they recede); red/amber/green are reserved for **state**; menus use soft tinted **scene** backdrops. Author in hex (Tailwind v4 converts to OKLCH). Tile side faces are darker shades of the top: left = base −12%, right = base −22%.

| Token | Hex | Role |
|---|---|---|
| `--scene-vanilla` / `--scene-sky` / `--scene-mint` / `--scene-bubble` / `--scene-dusk` | `#FFF7ED` `#E8F6FF` `#E7FBF3` `#FFEAF2` `#EEEAFE` | menu / transition / result backdrops |
| `--board` / `--grid` | `#FFFDF8` / `#EFEADF` | canvas surface / isometric grid lines |
| `--panel` | `#FFF3DD` | cream UI panels |
| `--ink` / `--ink-soft` / `--ink-muted` | `#1B1733` / `#5B5470` / `#9A92AD` | text |
| `--cat-source` | `#9B5DE5` | Grape — Users / Client |
| `--cat-edge` | `#22B8FF` | Sky — CDN, API Gateway, DNS |
| `--cat-net` | `#FF8A3D` | Tangerine — Load Balancer, Rate Limiter |
| `--cat-compute` | `#1DD3A0` | Mint — Compute / ASG / Serverless / Cluster / GPU / Edge Fn |
| `--cat-data` | `#3D5AFE` | Blueberry — Cache, SQL, NoSQL, Storage, Search, TS, Warehouse |
| `--cat-async` | `#FF6FA5` | Bubblegum — Queue, Pub/Sub, Stream, Worker, Scheduler |
| `--cat-security` | `#3B4252` | Steel (muted) — WAF, Auth, DDoS, Secrets (shield motif) |
| `--cat-observability` | `#64748B` | Slate (muted) — Monitoring, Logging, Alerting, Tracing |
| `--ok` / `--warn` / `--danger` | `#34D399` / `#FFB81C` / `#FF4D4D` | healthy / near-cap / overload-fail |
| `--btn-face` / `--btn-edge` / `--btn-text` | `#FFC83D` / `#E0A41E` / `#633806` | primary candy button |
| character beans | `#FF6B6B` `#FFD23D` `#4ECDC4` `#A78BFA` `#FF8FB1` `#A3E635` `#FFA94D` | Pings / cast pick from this set |

**Text-on-color rule:** any label on a colored fill uses the darkest stop of that *same* family — never plain black/gray (e.g. text on the yellow button is `#633806`, not black).

### 1.3 Typography
| Role | Font | Sizes / weight | Use |
|---|---|---|---|
| Display | **Fredoka** 600 | 48 (game title), 32 (screen title), 21 (card title / big button), grade stamp 96 | wordmark, headings, buttons, grade |
| Body | **Nunito** 400 / 700 | 16 body (lh 1.6), 14 small, 12/700 chip labels | all UI prose |
| Metric | **JetBrains Mono** 500 | 24 (big readout), 14 (inline), 12 (small) | every number: RPS, latency, $, nines, units |

Load via `next/font/google` (vars `--font-fredoka`, `--font-nunito`, `--font-jetbrains`) mapped in `@theme inline` to `--font-display` / `--font-sans` / `--font-mono`. The cuddly world + serious mono telemetry is intentional.

### 1.4 Spacing, radius, elevation
- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48 (px). Vertical rhythm in rem; component-internal gaps in px.
- **Radius:** `--r-sm` 8, `--r-md` 12, `--r-lg` 16, `--r-xl` 24, `--r-pill` 999.
- **Elevation = the candy-edge technique, NOT blur shadows.** Raised candy elements (buttons, optionally selected tiles) use a two-layer trick: a darker rounded *edge* wrapper with a lighter *face* offset up (`position:relative; top:-6px`). Iso tiles get a flat ground-ellipse (a darker tint of the floor) for grounding — never a blurred drop shadow. The **only** allowed `box-shadow` is the focus ring (`0 0 0 3px`). Rationale: flat fills don't flicker during streaming and keep the toy-clean look.

### 1.5 Iconography
lucide-react. Category/UI icons 18–20px inline, 24px max decorative. Service tiles carry their category's icon on the top face in white. Don't hand-draw icon paths.

### 1.6 Sound (optional, behind a toggle)
Short bouncy cues: place, connect, run-whoosh, cheer, splat, unlock. Default subtle; mute in Settings; never autoplay music.

---

## 2. App shell & layout

### 2.1 Routes
`/` main menu · `/sandbox` · `/scenario/[id]` · `/scenarios` (map) · `/collection` · `/settings`. Board routes wrap children in `ReactFlowProvider`.

### 2.2 Screen container & responsive stance
Desktop-first; the board is a desktop-oriented workspace. Menus, results, map, and collection adapt and stay fully usable on mobile (stack vertically; the board becomes pan/zoom with a collapsible palette sheet + rail toggle). Min font 12px everywhere.

### 2.3 Board layout (the core screen)
```
┌──────────────────────────────────────────────────────────────┐
│ [‹ Menu]      CloudCraft · {Sandbox | Scenario name}   [⟳][▶ Run]│  toolbar ~56px, cream
├────────────┬─────────────────────────────────────┬────────────┤
│  Palette   │            Iso canvas               │  Right rail │
│  ~220px    │   --board bg + diamond grid         │  ~280px     │
│  grouped   │   iso ServiceTiles + ConduitEdges   │  cream      │
│  draggable │   Pings during run                  │  ┌────────┐ │
│  chips     │   pre-placed Client tile            │  │LoadDial│ │  (sandbox)
│  (scroll)  │   Controls (zoom) ⌐ MiniMap ⌐       │  │ or     │ │
│            │                          (br corner)│  │Challenge│ │  (scenario)
│            │                                     │  ├────────┤ │
│            │                                     │  │Metrics │ │
│            │                                     │  └────────┘ │
└────────────┴─────────────────────────────────────┴────────────┘
```
Canvas flexes. The big **Run** button lives top-right in the toolbar (primary candy pill).

### 2.4 Z-layers
board grid (0) → conduits (1) → tiles (2) → Pings/cast (3) → selection/handles (4) → panels/toolbar (5) → modals/toasts (6). Never `position: fixed` inside widgets; modals use normal-flow faux-viewport overlays.

---

## 3. Component library

Each entry: purpose · anatomy · states · key props.

### PillButton — the candy 3D button
Purpose: every primary/secondary action. Anatomy: edge wrapper (darker, pill) + face (lighter, pill, offset up 6px). States: default / hover (lift to −9px) / active (press to −1px) / disabled (desaturate, no lift) / loading (spinner, label dim). Variants: `primary` (yellow), `secondary` (white face / cream edge / `--ink-soft` text), `danger` (coral face / dark-red text). Sizes: `sm` 13px·10/14, `md` 18px·13/18, `lg` 21px·15/18. Props: `variant`, `size`, `icon?` (lucide), `loading?`, `onClick`.
```tsx
<span className="pill" data-variant="primary">
  <button onClick={...}>{icon && <Icon/>} {label}</button>
</span>
```

### CategoryChip / PaletteItem — draggable palette row
Purpose: a service in the palette; drag onto the canvas. Anatomy: category color dot + lucide icon + name (Nunito 14) + cost·capacity in mono 12 (`$40 · 2k rps`). Draggable (`draggable`, `onDragStart` sets `dataTransfer` = `ServiceType`); also keyboard-addable (focus + Enter → place at canvas center). States: idle / hover (subtle lift) / dragging (chip dims, ghost follows) / disabled (locked behind a scenario constraint, rare).

### ServiceTile — the isometric node (signature)
Purpose: a placed service. **Anatomy (SVG cuboid ~110×120 in a React Flow custom node):** top face (category color) + left face (−12%) + right face (−22%); lucide icon white on the top face; label below (Nunito 12/700, `--ink`); `×N` unit badge top-right (mono 11 on a small candy pill) for scalable types; a flat ground-ellipse beneath. Source handle at the right vertex, target handle at the left vertex (styled to meet the faces). **States:**
- `default` — micro-personality: blink every ~4s.
- `hover` — lift 4px + name tooltip.
- `selected` — 2px dashed outline in category color + a small gear affordance opening the config panel (§4.6).
- `dragging` — lift + scale 1.05 + tilt 2° + ground-ellipse grows.
- `healthy` (after a passing run touched it) — a tiny `--ok` check chip + a happy bob.
- `warning` (utilization > 80%) — `--warn` ring + a sweat-drop micro-anim.
- `overloaded` (id ∈ `SimResult.overloadedNodeIds`) — pulsing `--danger` ring + a "504" chip; compute/worker tiles also show the Crew `panic`.
Geometry params (tunable): top `(55,10)(105,38)(55,66)(5,38)`, left `(5,38)(55,66)(55,110)(5,82)`, right `(105,38)(55,66)(55,110)(105,82)`, icon at ~`(55,36)`, ground ellipse `cx55 cy114 rx46 ry8`. Keep tiles **non-overlapping**; no depth-sorting in v1.

### ConduitEdge — the wires
Purpose: a connection that also carries traffic. Anatomy: a rounded React Flow edge, 2.5px, source-category color at reduced saturation. States: `idle` (static), `running` (Pings ride it — see §5; or animated dash flow as the lightweight fallback), `overloaded` (the edge into a bottleneck turns `--danger` and pulses width). Pings follow the path via `path.getPointAtLength` over a RAF loop.

### MetricReadout
Purpose: one live telemetry value. Anatomy: label (Nunito 12, `--ink-muted`) above a mono 24 number; a state dot (`--ok/--warn/--danger`). Dimmed (40% opacity) until the first run. Round all numbers (`toLocaleString`, `toFixed`).

### ConstraintBadge (scenario)
Purpose: show a target vs the current result. Anatomy: label + `target → current` in mono; tinted `--ok` when met, `--danger` when not, neutral before first run. One per constraint (RPS, latency, budget, SLA).

### LoadDial (sandbox)
Purpose: set simulated load. Anatomy: a stepped control (segmented buttons or a snapping slider) over `100 · 1k · 10k · 100k · 1M` users, with the chosen value echoed in mono. Drives `loadRps`.

### GradeStamp (result)
Purpose: the headline grade. Anatomy: a huge Fredoka letter (96px) colored by grade — `S` `#FFC83D`, `A` `#1DD3A0`, `B` `#22B8FF`, `C` `#FFB81C`, `F` `#FF4D4D` — over a faint stamp ring. Motion: stamps in (scale 0 → 1.15 → 1, slight rotate, tiny container shake).

### NimbusHost — the mascot
Purpose: the friendly guide; reacts to outcomes. Anatomy: the cloud-blob SVG (rounded body + cloud bumps + dot eyes + blush + red headband + stub arms/feet) with optional speech bubble (white, rounded, tail; Fredoka label or Nunito line). State prop: `idle` (bob), `cheer` (jump, arms up), `sweat` (drop + slight shrink), `faint` (topple, `x_x` eyes), `point` (lean + arm out, for tutorials). Pre-art: this SVG. Later: a Rive artboard with the same state names.

### CharacterSlot (collection)
Purpose: a collectible character. States: `locked` (dark tile + padlock + "?"), `unlocked` (the bean on its candy tile), `selected` (ring + check). Tap → detail panel.

### SceneBackground / Panel / Toast
- `SceneBackground` — full-bleed `--scene-*` backdrop with optional drifting clouds + a soft hill; used on menus/result.
- `Panel` / `Card` — cream (`--panel`) rounded `--r-lg` container; the quiet chrome.
- `Toast` / `UnlockToast` — sonner-based; UnlockToast shows a "NEW" tag + a peek of the unlocked character.

---

## 4. Screens

Each: purpose · layout · elements · states · motion · copy.

### 4.1 Splash / loading
Centered wordmark (Fredoka 48) + Nimbus bouncing in; a brief "assembling the cloud city" loader. Auto-advances to `/`. Motion: wordmark + mascot stagger-bounce (Motion `bouncy`).

### 4.2 Main menu (`/`)
Layout: split — left a `SceneBackground` with the **iso cloud-city scene** (a few candy tiles on a conduit road, Nimbus bobbing, a couple of floating Pings, a small "Cloud City" sign); right a cream panel with the wordmark and a button stack. Buttons (PillButton): **Play sandbox** (lg), **Scenarios**, **Collection**, **Sound** (toggle), plus a best-score pill (`Best survived: 80k req/s`, mono). Motion: panel buttons stagger-bounce in; mascot idle bob; clouds drift. (This screen is mocked already — match that.)

### 4.3 Mode select (`/`→ or a step)
Two big bouncy cards — **Sandbox** ("Build anything. Crank the load. See what breaks.") and **Scenarios** ("Fix a failing system before it's too late.") — with Nimbus hosting. Selecting Scenarios routes to the map.

### 4.4 Scenario map (`/scenarios`) — the world-map revamp
Purpose: pick a scenario from a little cloud world (inspired by the DWTD overworld; original art). Layout: a wide, **pannable** candy landscape; scenarios are signposted **locations** (a small iso building + a banner sign with the scenario title) linked by a winding conduit **road**, ordered left→right easy→hard. Elements: a back-to-menu pill (top-left), a progress pill (`3 / 5`, top-right), Nimbus near the first location. **Location states:** `locked` (grayed building + padlock pin), `available` (full color + a bobbing/glowing pin), `completed` (grade badge stamped on the sign + check). Difficulty = small stars on the sign. Tapping a location opens a popover card: title, brief, the four headline constraints as mono `ConstraintBadge`s, difficulty, best grade, and a **Start** PillButton. Motion: pins bob; the selected location's card springs up; pan via drag.

### 4.5 Board / gameplay (`/sandbox`, `/scenario/[id]`)
Layout per §2.3. Elements: **Palette** (sections by category — functional candy first, then muted Security/Observability — each a `CategoryChip`, scrollable), **Iso canvas** (React Flow: iso diamond `Background`, `Controls`, a small `MiniMap` bottom-right, the pre-placed non-deletable `Client` tile), **Right rail** (sandbox → `LoadDial` + `MetricsPanel`; scenario → `ChallengePanel` of `ConstraintBadge`s + `MetricsPanel`), **Toolbar** (back, mode/scenario name, Reset, the big **Run** primary pill). On select of a tile, the config panel (§4.6) opens. **Run choreography** is the screen's one orchestrated moment (§5). Copy: empty board → a bobbing Nimbus pointing, *"Drag a piece from the left to start building."*

### 4.6 Node config panel
Opens on tile-select (right-side drawer, or a popover anchored to the tile). Contents: editable **label**; **Size** select (small/medium/large/xlarge) with a live capacity+cost preview; **Region** select (single-az / multi-az / multi-region) with the availability+cost delta; type-specific controls — ASG/cluster: min/max/target-util sliders; cache: policy (read-through/write-through/write-back) + TTL; DB: replication factor + sync/async; object storage: class (hot/warm/cold). A live readout in mono: `this node · $X/mo · Y rps · Z nines`. A `Remove` (danger ghost) for everything except `Client`. Applying updates the store; metrics re-resolve on the next Run (or live-preview).

### 4.7 Result / score screen (scenario)
Layout: full-bleed `SceneBackground`; centered `GradeStamp` + score (mono, large) + subtitle (`New best!` when applicable). Below, a cream `Panel` with the six criteria rows — each: icon, label, points `x/max`, a pass/fail color bar, and the **actionable** `detail` (Nunito). Nimbus bottom-left with a speech-bubble reaction (`cheer` for S/A, `sweat` for B/C, `faint` for F) and a quip drawn from the worst criterion. CTAs: **Tweak & rerun** (secondary), **Next scenario** (primary). If a character unlocked: an `UnlockToast` + a peek. Motion: grade stamps in (overshoot + shake); rows reveal with a 60ms stagger; success → confetti.

### 4.8 Collection / unlocks (`/collection`)
Cosmetic/meta. Layout: a responsive grid of `CharacterSlot` (auto-fit ~96px) + a right detail panel. Detail: a big character render, name (Fredoka), a flavor "ability" line (Nunito — pure flavor/meta, e.g. *"+0.5s grace before a Ping splats"*, does **not** affect the simulation), and an **Equip** PillButton. Top: optional currency pills (coins/gems earned by completing scenarios). Characters are **original** cloud-themed beans.

### 4.9 Settings (`/settings`)
A cream `Panel` of controls: Sound (toggle) · Music volume (slider, optional) · Palette theme (Candy / Pastel / Neon / Mono-pro) · Provider skin (Generic / AWS-style / Azure-style / GCP-style — *generic vernacular + your labels, no official logos*) · Board scene (Vanilla / Sky / Mint / Bubble / Dusk) · Reduce motion (toggle; also auto-detected from the OS). Theme/skin/scene swap via CSS-var changes — purely cosmetic.

### 4.10 Empty / error / loading states (interface voice)
Active voice, sentence case, direction not mood. Empty board → the Nimbus hint above. Scenario needing persistence but no path to a data store → a gentle inline note (`Your requests have nowhere to store data — add a database.`), not a hard error. Save/network errors (Phase 7) → in-voice (`Couldn't save your score — check your connection and try again.`). Loaders → a small bobbing cloud, never a blank screen.

---

## 5. Motion system

### Principles
Springy with slight overshoot; squash-and-stretch; anticipation before big actions; **one** orchestrated moment per screen (the run on the board, the stamp on the result). Idle UI stays calm — scattered ambient motion reads as AI-generated; restraint reads as craft.

### Tokens
Spring presets: `bouncy` = stiffness 280 / damping 18 · `soft` = 200 / 26 · `snappy` = 400 / 30. Durations: press 90ms · hover 120ms · panel-in 320ms · grade-stamp 500ms. Stagger 60ms. Idle bob 2.4–2.8s; float 3–4s.

### Catalog
| Event | Animation | Lib |
|---|---|---|
| Menu / card enter | stagger-bounce in | Motion `bouncy` |
| Button hover / press | candy lift / press | CSS |
| Palette drag start | chip lifts, ghost follows | RF native + CSS |
| Tile placed | pop-in (scale 0.6→1.05→1) | Motion |
| Connect made | conduit draws + snap pop + a Ping hops | Motion / CSS |
| **Run** | choreography (below) | Motion + RAF |
| Tier overloaded | red ring pulse + "504" + Crew `panic` | Rive / SVG |
| Request dropped | Ping `splat` ragdoll | Rive (CSS placeholder) |
| Security violation | The Leak `sneak`→`grab` (or `bounced` if WAF/Auth) | Rive (SVG placeholder) |
| Over budget | Billy `faint` | Rive (SVG placeholder) |
| Grade reveal | GradeStamp overshoot + shake | Motion |
| Pass / success | confetti burst | canvas-confetti / Motion |
| Idle | Nimbus bob, Pings float, clouds drift | CSS |

### Run choreography (the board's orchestrated moment)
Press **Run** → button presses + whoosh → Pings spawn at `Client` and stream along conduits at speed ∝ `servedRps` → at any tier near capacity they slow and queue (`anxious`, sweat); surplus at an overloaded tier `splat` and that tile gets the red pulse + "504" + Crew `panic` → `MetricsPanel` numbers count up to their final values (mono, state-colored) → after ~1.5–2.5s, resolve: **scenario** → `ResultDialog` springs up with the `GradeStamp`; **sandbox** → metrics settle + a Nimbus quip bubble (`Survived 80k! … barely.`).

### Reduced motion
`useReducedMotion()` (Motion). When on: skip the Ping stream and vignettes, jump straight to final metrics + result; replace bounces/overshoot/confetti/shake with instant or opacity-only transitions. Everything must remain fully usable and legible.

---

## 6. The cast in the UI

Placement: **Nimbus** on menu / mode-select / scenario-map / result. **Pings** on the board during a run (the traffic). **The Leak** on the board during a security-violation run. **The Crew** on compute/worker tiles during overload. **Billy** on the result when over budget. Drive everything from `SimResult`: `overloadedNodeIds → splat / panic`, `securityViolations → The Leak`, over-budget → Billy, `grade → Nimbus reaction`.

Integration: a `useRiveEvents(result: SimResult)` hook maps these to Rive state-machine inputs (`useStateMachineInput(rive, machine, input).fire()` / value sets). **Pre-art mode** maps the *same* triggers to SVG/CSS state classes on the placeholder characters, so the game is fully playable before authored `.riv` art exists. The character art/animation is authored in the Rive editor (a design task), not generated in code — keep the trigger contract stable so swapping placeholders → Rive changes nothing in the game logic.

---

## 7. Responsive & accessibility

- **Breakpoints:** desktop-first. ≤900px: palette becomes a bottom sheet, right rail a toggle, the board is pan/zoom; menus / result / map / collection stack vertically.
- **Keyboard:** palette chips focusable, Enter places at canvas center; tiles selectable via Tab + arrow nudge; all buttons standard; visible focus ring (`0 0 0 3px` — the one allowed shadow).
- **Contrast:** AA. Text on any colored fill uses the darkest stop of that family (never black/gray). Verify the muted support categories still pass against their tiles.
- **Motion:** honor reduced-motion everywhere (§5).
- **Screen readers:** each screen/region has a concise label; the board exposes a text summary of the current architecture and the latest result; decorative SVG `aria-hidden`, meaningful icons `aria-label`.

---

## 8. Build order for Sonnet

Build in this sequence; each chunk should `next build` clean and match the tokens before moving on. The engine, catalog, rules, store, and `SimResult` come from the **build plan** — stub them where needed and integrate as they land.

1. **Theme & tokens** — `globals.css` `@theme` (§1.2–1.4) + `next/font` (§1.3). Verify both light and the candy look render.
2. **Component library** — PillButton, CategoryChip, Panel/Card, MetricReadout, ConstraintBadge, NimbusHost (SVG placeholder), SceneBackground, Toast, GradeStamp. Each is a small, self-contained task.
3. **Static screens** — Main menu (4.2), Mode select (4.3), Settings (4.9); wire navigation. No engine needed.
4. **Board shell** — layout (2.3), Palette with drag + keyboard add, React Flow canvas with the iso `Background`, the pre-placed `Client`. Integrate the store + `onConnect`/rules from the build plan.
5. **ServiceTile + ConduitEdge** — the signature. Build the SVG cuboid + all states (3) and the edge. Give this care.
6. **Right rail** — LoadDial / ChallengePanel + MetricsPanel, bound to the store + `simulate()`.
7. **Run choreography** — Pings on conduits, overload viz, metric count-up, resolve (5). The orchestrated moment.
8. **Node config panel** (4.6) — bound to the engine's `NodeConfig`.
9. **Result screen** (4.7) — GradeStamp + criteria + Nimbus reactions + confetti.
10. **Scenario map** (4.4).
11. **Collection + currency** (4.8) — cosmetic/meta.
12. **Cast via Rive** (6) — swap placeholders for authored `.riv` art. The polish pass.

### Guardrails
- Use **only** the §1 tokens; don't invent colors or fonts. Functional categories candy, support categories muted, state colors reserved for rings/badges.
- **No blur shadows** — depth via the candy-edge technique; the only `box-shadow` is the focus ring.
- Infra tiles stay **realistic 2.5D** (micro-personality, not cartoon faces); don't flatten them.
- The cast is **original DWTD-style**, never copied; provider skins use generic vernacular + user labels, **no official logos/trademarks** as assets.
- Text on any colored fill = darkest stop of that family.
- One orchestrated motion moment per screen; calm idle; honor reduced motion.
- Keep all game logic in `src/lib` (build plan); this UI layer only renders store state + dispatches actions and reads `SimResult`. The cast/animations must never influence the simulation.
- Round every displayed number. Type everything; no `any`.
