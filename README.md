# Sri Key

Sri Key is a full-stack, multi-package mobile keyboard and UI project built as a pnpm monorepo. The repo combines a mobile Expo app, a backend API server, shared libraries, and design-system artifacts to support a Sinhala keyboard experience with modern web/mobile tooling.

## Overview

This repository is centered around a mobile app named `Sri Key` and includes supporting infrastructure for API contracts, database access, and reusable design components. It uses a workspace-based TypeScript setup and is intended to run in a Replit-friendly environment.

## Project structure

```text
.
├── artifacts/
│   ├── api-server/         # Express API + backend logic
│   ├── mobile/             # Expo / React Native app
│   ├── mockup-sandbox/     # UI mockup / prototype workspace
│   └── sri-key-design-system/  # shared design tokens and components
├── lib/
│   ├── api-client-react/   # typed React client for API usage
│   ├── api-spec/           # API contract definitions
│   ├── api-zod/            # Zod validation/schema helpers
│   └── db/                 # database schema and access layer
├── scripts/                # workspace scripts and utilities
├── package.json            # root workspace config
├── pnpm-workspace.yaml      # pnpm workspace setup
├── tsconfig.base.json
├── tsconfig.json
├── .gitignore
├── .replit
├── .replitignore
├── replit.md
└── pnpm-lock.yaml
```

## Tech stack

- TypeScript 5.9+
- pnpm workspaces
- Node.js
- React Native + Expo
- Express 5
- PostgreSQL + Drizzle ORM
- Zod validation
- OpenAPI-based API code generation
- Vite / esbuild based build tooling

## Main packages

### Mobile app

The `artifacts/mobile` package is the user-facing app. It is configured as an Expo app with a `Sri Key` name and uses React Native, Expo Router, and mobile-specific libraries.

Key scripts:

```bash
cd artifacts/mobile
pnpm install
pnpm run dev
pnpm run typecheck
pnpm run build
```

### API server

The `artifacts/api-server` package contains the Express-based server. It includes OpenAI support, logging, and shared API/Zod schema usage.

Key scripts:

```bash
cd artifacts/api-server
pnpm run dev
pnpm run build
pnpm run start
pnpm run typecheck
```

## Getting started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL (for DB-backed features)

### Install dependencies

```bash
pnpm install
```

### Run the workspace typecheck

```bash
pnpm run typecheck
```

### Build all packages

```bash
pnpm run build
```

## Development notes

This repo follows a monorepo pattern where shared contracts and logic are separated into library packages, while app-specific work lives under `artifacts/`. The result is a clean structure for reuse, testing, and incremental feature development.

## Important environment variables

The project references a database connection string configuration for backend work:

```bash
DATABASE_URL=postgresql://user:password@host:port/dbname
```

## License

This project is licensed under the MIT license as defined in the root package configuration.

## Related files

- `package.json` — root workspace configuration and shared scripts
- `pnpm-workspace.yaml` — workspace package definitions
- `replit.md` — Replit-oriented project notes and starter template

## Summary

Sri Key is a modern, monorepo-based mobile keyboard project with a strong emphasis on structured TypeScript development, reusable shared libraries, and Expo-based mobile UX. It is designed for building and extending a Sinhala keyboard app ecosystem with backend and design support alongside the mobile client.
