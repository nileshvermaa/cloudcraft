<p align="center">
  <img src="public/next.svg" alt="CloudCraft Studio" width="120" />
</p>

<h1 align="center">CloudCraft Studio</h1>
<p align="center">
  <strong>Design &amp; Stress-Test Cloud Architectures — The Fun Way</strong>
</p>

<p align="center">
  <a href="https://github.com/nileshcf/cloudcraft/actions/workflows/ci.yml">
    <img src="https://github.com/nileshcf/cloudcraft/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://github.com/nileshcf/cloudcraft/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/deploy-Vercel-black?logo=vercel" alt="Vercel" />
</p>

---

## Overview

**CloudCraft Studio** is a gamified, browser-based cloud architecture simulator. Drag isometric service tiles onto a workbench, wire them together with conduits, inject traffic loads up to **1 million RPS**, and watch where your system fails — and *why*.

### Key Features

- 🏗️ **Sandbox Workbench** — Free-form architecture building with a rich palette of cloud service tiles
- 🎯 **Mission Simulator** — Fix broken deployments under strict latency, SLA, and budget constraints
- 📊 **Real-time Metrics** — Live throughput, latency, availability, and cost dashboards
- 🎮 **Scoring System** — Earn scores based on architecture resilience and efficiency
- 🎨 **Isometric Visualization** — Beautiful hand-crafted tile geometry with animated traffic flows
- ⚡ **Deterministic Simulation Engine** — Repeatable results for fair scoring

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Animations** | [Motion](https://motion.dev/) (Framer Motion) |
| **Canvas / Diagrams** | [React Flow (XYFlow)](https://reactflow.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Deployment** | [Vercel](https://vercel.com/) |

## Project Structure

```
cloudcraft-studio/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with fonts & metadata
│   │   ├── page.tsx            # Home page — mode selection
│   │   ├── sandbox/            # Free-form workbench
│   │   ├── scenarios/          # Mission directory listing
│   │   ├── scenario/[id]/      # Individual scenario player
│   │   ├── collection/         # Service tile collection
│   │   └── settings/           # App settings
│   ├── components/
│   │   ├── canvas/             # Flow canvas, nodes, edges, toolbar
│   │   ├── cast/               # Mascot & animated overlays
│   │   ├── home/               # Landing page cards
│   │   ├── panels/             # Side panels (config, metrics, challenges)
│   │   └── ui/                 # shadcn/ui primitives
│   ├── lib/
│   │   ├── catalog.ts          # Service tile definitions
│   │   ├── scenarios.ts        # Mission definitions
│   │   ├── rules.ts            # Architecture validation rules
│   │   ├── presets.ts          # Pre-built architecture presets
│   │   ├── utils.ts            # Shared utilities
│   │   └── simulation/         # Deterministic simulation engine
│   │       ├── engine.ts       # Core simulation orchestrator
│   │       ├── graph.ts        # Architecture graph analysis
│   │       ├── throughput.ts   # Throughput calculations
│   │       ├── latency.ts      # Latency propagation
│   │       ├── availability.ts # SLA & uptime calculations
│   │       ├── cost.ts         # Cost estimation
│   │       └── scoring.ts      # Score computation
│   ├── store/
│   │   └── useGameStore.ts     # Zustand global store
│   └── types/
│       └── index.ts            # Shared TypeScript types
├── vercel.json                 # Vercel deployment configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.mjs          # PostCSS (Tailwind) configuration
├── components.json             # shadcn/ui configuration
└── package.json
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.18 (LTS recommended)
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/nileshcf/cloudcraft.git
cd cloudcraft

# Install dependencies
npm ci

# Copy environment variables (if needed)
cp .env.example .env.local
```

### Development

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Create a production build
npm run build

# Start the production server
npm start
```

### Linting & Type Checking

```bash
# Run ESLint
npm run lint

# Run TypeScript type checks
npm run type-check
```

## Deployment

### Vercel (Recommended)

This project is configured for one-click deployment on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnileshcf%2Fcloudcraft)

#### Manual Vercel Setup

1. Install the [Vercel CLI](https://vercel.com/docs/cli):
   ```bash
   npm i -g vercel
   ```

2. Link and deploy:
   ```bash
   vercel --prod
   ```

#### Environment Variables

Set the following in your Vercel project dashboard under **Settings → Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | No | Production URL (auto-detected by Vercel) |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics measurement ID |

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:

1. **Lints** the codebase on every push and PR
2. **Type-checks** all TypeScript files
3. **Builds** the production bundle to catch errors early

Vercel's GitHub integration handles production deployments automatically on merge to `main`.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit with conventional commits: `git commit -m "feat: add new service tile"`
4. Push and open a PR

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <sub>Built with ☁️ by <a href="https://github.com/nileshcf">nileshcf</a></sub>
</p>
