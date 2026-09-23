# AGENTS.md

Weather CLI built with Bun + TypeScript; fetches data from OpenMeteo (geocoding + forecast, no API key needed). The app is fully functional: menu-driven console UI, local persistence, and a compiled binary.

## Commands

- Run: `bun run start` (or `bun run dev` for watch mode); `bun run index.ts` also works
- Typecheck: `bunx tsc --noEmit` (typescript 7 is a peerDep, installed via bun)
- Tests: `bun run test` (bun:test, runs with `--parallel` for per-file isolation) — the suite lives in `tests/` mirroring the structure of `src/` (storage, api, utils, presentation, actions). Add new tests as `tests/**/<module>.test.ts` alongside the module they cover. Also available: `bun run test:watch`, `bun run test:coverage`.
- Build: `bun run build` -> runs `bun run test` first; if any test fails, the standalone binary is NOT compiled. On success it compiles via `bun build --compile`.

## Conventions

- `tsconfig.json` sets `allowImportingTsExtensions`, so relative imports need explicit `.ts` extensions
- `strict` + `noUncheckedIndexedAccess` are on; `noUnusedLocals`/`noUnusedParameters` are off
- `types: ["bun"]` — use Bun globals, not `@types/node`
- User-facing menu/labels are in Spanish (see README)
- Colors via `src/utils/colors.ts`: cyan for the menu frame, yellow for temperatures/warnings, green for success messages, red for errors. Color is applied only when stdout is a TTY and `NO_COLOR` is unset.
- Babel-style line-comments are already used inside `tsconfig.json`; keep them valid JSONC

## Architecture (per README)

- Menu-driven console app: default city, all cities, search/add/remove city, set default, unit setting (°C)
- Cities are stored locally; flow is geocoding API → forecast API