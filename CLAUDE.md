# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Admin dashboard ("Boozy Freebies") for configuring promotional freebie/giveaway rules on a Shopify storefront. Shopify is the source of truth for products/collections; Firestore stores the freebie rule documents; Firebase Auth gates access.

A more detailed feature/skill reference (data models, store inventory, common task recipes, troubleshooting) lives in `SKILLS.md` — consult it before assuming behavior.

## Common Commands

```bash
npm run dev              # Vite dev server
npm run build            # Production build (adapter-node)
npm run preview          # Preview built app
npm run check            # svelte-kit sync + svelte-check (type check)
npm run lint             # prettier --check + eslint
npm run format           # prettier --write
npm run test             # integration (Playwright) then unit (Vitest)
npm run test:unit        # vitest only
npm run test:integration # playwright only
npx vitest run path/to/file.test.ts   # single unit test
npx playwright test tests/foo.spec.ts # single integration test
```

After dependency or route changes, `svelte-kit sync` (run via `npm run check`) regenerates `./$types` — if TS complains about missing route types, run it.

## Architecture

**Stack:** SvelteKit 2 + Svelte 4, TypeScript, TailwindCSS with shadcn-svelte (bits-ui) components, Superforms + Zod for forms, Firebase (Auth + Firestore) client SDK, Shopify Admin GraphQL API server-side. Build target is `@sveltejs/adapter-node` deployed as a Docker image to GCP Artifact Registry (`asia-east2`).

**Auth boundary.** `src/hooks.server.ts` is the single gate: any request under `/freebies` without a `user` cookie is redirected to `/`. The cookie is an HTTP-only session set by `src/routes/+page.server.ts` after Firebase email/password sign-in succeeds. There is no server-side token verification beyond cookie presence — the client SDK is the auth authority. Keep this in mind when adding protected routes (extend the prefix check in `hooks.server.ts`) or sensitive endpoints.

**Two backends, two roles.**
- **Shopify** (server-only) — accessed via `src/lib/shopify/shopify.api.ts` using `@shopify/shopify-api`. All Shopify calls go through `src/routes/api/shopify/*/+server.ts` endpoints so the access token never reaches the browser. Products tagged `product_type:Freebie` are the gift catalog; regular products and collections are the qualifying-purchase catalog.
- **Firebase/Firestore** (client SDK) — `src/lib/firebase/firebase.client.ts` initializes the app; freebie CRUD and queries run directly from the browser via Svelte stores. There is no server-side Firestore code.

**State pattern.** Page-scoped logic lives in store factories under `src/lib/stores/` (e.g. `freebiesPageStore.ts`, `freebieFormStore.ts`). Each store encapsulates its Firestore queries and exposes typed mutators alongside `subscribe`. Pages bind via `$store` and call store methods; do not duplicate Firestore queries inside components.

**Forms.** Create/edit flows use Superforms with Zod schemas loaded in `+page.server.ts` and rendered with Formsnap-based wrappers in `src/lib/components/ui/`. Login schema is in `src/lib/schema/loginSchema.ts`; freebie form schema lives alongside its form components.

**Routes.**
- `/` — login (`src/routes/+page.{svelte,server.ts}`)
- `/freebies` — list + filters + search
- `/freebies/create` — new freebie wizard
- `/freebies/[id]` — edit existing freebie
- `/api/shopify/{freebies,products,collections}` — server endpoints proxying Shopify GraphQL

## Environment

Requires `.env.development` and `.env.production` at the repo root. Required vars: `VITE_FIREBASE_*` (client config) and `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_ACCESS_TOKEN`, `SHOPIFY_SHOP` (server-only). See `SKILLS.md` §9 for the full list.

## Deployment

Production image is built with `docker buildx --platform linux/amd64`, tagged `asia-east2-docker.pkg.dev/boozy-freebie/boozy-freebie-dashboard/boozy-freebie-dashboard`, and pushed to GCP Artifact Registry. `firebase.json`/`.firebaserc` exist but the active adapter is `adapter-node` — the Firebase config is legacy and not the deploy path.

## Conventions

- Use `moment` for date formatting/parsing (already a dependency); `@internationalized/date` is used only by the calendar bits-ui components.
- Tab indentation, single quotes, no semicolons-optional — Prettier config in `.prettierrc` is authoritative; run `npm run format` before committing.
- Commit style follows `commitizen` (`.cz.yaml`): conventional commits (`feat:`, `fix:`, `refactor:` …).
