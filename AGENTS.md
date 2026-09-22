# AGENTS.md

Weather CLI built with Bun + TypeScript; fetches data from OpenMeteo (geocoding + forecast, no API key needed). In early dev: `index.ts` is a one-line stub.

## Commands

- Run: `bun run index.ts` (no npm scripts exist; don't add package.json scripts without reason)
- Typecheck: `bunx tsc --noEmit` (typescript 7 is a peerDep, installed via bun)
- Tests: no framework configured; `bun test` (bun:test) if you add them
- Final deliverable (per README): `bun build --compile` a standalone binary

## Conventions

- `tsconfig.json` sets `allowImportingTsExtensions`, so relative imports need explicit `.ts` extensions
- `strict` + `noUncheckedIndexedAccess` are on; `noUnusedLocals`/`noUnusedParameters` are off
- `types: ["bun"]` — use Bun globals, not `@types/node`
- User-facing menu/labels are in Spanish (see README)
- Babel-style line-comments are already used inside `tsconfig.json`; keep them valid JSONC

## Architecture (per README)

- Menu-driven console app: default city, all cities, search/add/remove city, set default, unit setting (°C)
- Cities are stored locally; flow is geocoding API → forecast API