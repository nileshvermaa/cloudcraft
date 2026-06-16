# Contributing to CloudCraft Studio

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/cloudcraft.git
   cd cloudcraft
   ```
3. **Install** dependencies:
   ```bash
   npm ci
   ```
4. **Create a branch** for your work:
   ```bash
   git checkout -b feat/my-feature
   ```

## Development Workflow

```bash
# Start the dev server
npm run dev

# Run linting
npm run lint

# Run type checking
npm run type-check

# Build for production
npm run build
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/). Each commit message should be structured as:

```
<type>(<scope>): <description>

[optional body]
[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code changes that neither fix a bug nor add a feature |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks (deps, CI, tooling) |

### Examples

```
feat(canvas): add drag-to-connect for service tiles
fix(simulation): correct latency calculation for multi-hop paths
docs: update deployment instructions for Vercel
```

## Pull Request Process

1. Ensure your code passes all CI checks (`lint`, `type-check`, `build`).
2. Update documentation if your changes affect the public API or user experience.
3. Write a clear PR description explaining **what** you changed and **why**.
4. Request a review from a maintainer.
5. Once approved, a maintainer will merge your PR.

## Project Structure

See the [README](README.md#project-structure) for a complete overview of the directory layout.

## Adding a New Service Tile

1. Add the tile definition in `src/lib/catalog.ts`.
2. Add any new types to `src/types/index.ts`.
3. Update the simulation engine if the tile introduces new behavior.
4. Add the tile to relevant scenarios if applicable.

## Adding a New Scenario

1. Create a new scenario definition in `src/lib/scenarios.ts`.
2. Define the initial architecture graph and challenge constraints.
3. Test the scenario manually in the Mission Simulator.

## Reporting Issues

- Use [GitHub Issues](https://github.com/nileshcf/cloudcraft/issues) to report bugs or request features.
- Provide as much detail as possible: steps to reproduce, expected vs. actual behavior, screenshots.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
