# Architecture, Tech Stack & Infrastructure

Boozy Freebies Dashboard — admin panel for configuring promotional "buy X get Y free" rules on the Boozy Shopify storefront.

---

## 1. System Context

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                Browser                                    │
│  Svelte 4 app (rendered by SvelteKit Node server)                         │
│  • reads Firestore via Firebase client SDK                                │
│  • posts mutations to Cloud Functions                                     │
│  • calls /api/shopify/* for product/collection lookups                    │
└──────────────────────────────────────────────────────────────────────────┘
        │                            │                            │
        │ HTTPS (SSR + form actions) │ HTTPS                      │ HTTPS
        ▼                            ▼                            ▼
┌──────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│ SvelteKit Node   │        │ Firebase         │        │ GCP Cloud       │
│ server           │        │ • Auth           │        │ Functions       │
│ (Docker on GCP)  │        │ • Firestore      │        │ us-central1     │
│                  │        │                  │        │ createPromo /   │
│ • SSR pages      │        │  (project:       │        │ updatePromo /   │
│ • /api/shopify/* │        │   boozy-freebie- │        │ deletePromo     │
│   GraphQL proxy  │        │   staging|prod)  │        │                 │
│ • Auth cookie    │        │                  │        │ (separate repo) │
└────────┬─────────┘        └──────────────────┘        └────────┬────────┘
         │                                                       │
         │ Admin GraphQL                                         │ writes
         ▼                                                       ▼
┌──────────────────┐                                    ┌─────────────────┐
│ Shopify          │                                    │ Firestore       │
│ Admin API        │                                    │ `freebies`      │
│ letsboozy.       │                                    │ collection      │
│ myshopify.com    │                                    └─────────────────┘
└──────────────────┘
```

**Boundaries.**
- **Browser ↔ SvelteKit Node server:** SSR, form actions, and a thin `/api/shopify/*` proxy. The Node server holds the Shopify Admin access token and never returns it to the client.
- **Browser ↔ Firebase:** direct via client SDK. Used for sign-in and for *reads* of the `freebies` Firestore collection.
- **Browser ↔ Cloud Functions:** direct HTTPS. Used for *writes* (create/update/delete promo). The Cloud Functions live in a sibling repo, not this one.
- **SvelteKit ↔ Shopify Admin GraphQL:** all Shopify queries originate server-side from `src/routes/api/shopify/*/+server.ts`.

---

## 2. Tech Stack

### Application

| Concern | Choice | Version |
|---|---|---|
| UI framework | Svelte | 4.2.7 |
| Meta-framework | SvelteKit | 2.0.0 |
| Adapter | `@sveltejs/adapter-node` | 5.0.1 |
| Language | TypeScript | 5.x |
| Styling | TailwindCSS | 3.4.1 |
| Component primitives | bits-ui (shadcn-svelte pattern) | 0.21.x |
| Icons | lucide-svelte, svelte-radix | — |
| Forms | sveltekit-superforms + Formsnap + Zod | 2.14 / 1.0 / 3.23 |
| Tables | svelte-headless-table | 0.18 |
| Flash messages | sveltekit-flash-message | 2.4 |
| Toasts | svelte-sonner | 0.3 |
| Theme toggle | mode-watcher | 0.3 |
| Date utils | moment (legacy), @internationalized/date (calendar only) | — |
| HTTP client | axios | 1.6 |

### Backend integrations

| System | Library | Mode |
|---|---|---|
| Shopify Admin GraphQL | `@shopify/shopify-api` 10.0.0 with the Node adapter | Custom-app session, server-side only |
| Firebase Auth | `firebase` 10.12 (client SDK) | Email/password sign-in invoked from a SvelteKit form action |
| Firestore | `firebase` 10.12 (client SDK) | Direct browser reads of the `freebies` collection |
| Promo write API | plain `fetch` to Cloud Functions URL | `createPromo`, `updatePromo`, `deletePromo` |

### Tooling

| Concern | Choice |
|---|---|
| Build | Vite 5 |
| Package manager | npm for dev, `pnpm` inside the Dockerfile (note: both lockfiles checked in — `package-lock.json` and `pnpm-lock.yaml`) |
| Lint/format | ESLint 8, Prettier 3, `prettier-plugin-svelte`, `prettier-plugin-tailwindcss` |
| Type check | `svelte-check` |
| Unit tests | Vitest |
| Integration tests | Playwright |
| Commit style | commitizen (`.cz.yaml`) — conventional commits |

---

## 3. Application Architecture

### 3.1 Routing layout

```
src/routes/
├── +page.svelte              # /                — login form
├── +page.server.ts           #                   actions: signInWithEmailAndPassword, set cookie
├── +layout.svelte            # root shell
├── freebies/
│   ├── +layout.svelte        # /freebies/*      authenticated nav shell
│   ├── +page.svelte          # /freebies        list view
│   ├── +page.server.ts       #                   actions: logout
│   ├── create/
│   │   ├── +page.svelte      # /freebies/create
│   │   └── +page.server.ts   #                   load: products + collections + freebies
│   └── [id]/edit/+page.svelte
└── api/shopify/
    ├── freebies/+server.ts     # GET (list/search), POST (cursor search)
    ├── products/+server.ts     # GET
    └── collections/+server.ts  # POST
```

### 3.2 Authentication

The auth boundary is in `src/hooks.server.ts`:

```ts
if (event.url.pathname.startsWith('/freebies') && !user) {
  throw redirect(303, '/');
}
```

Sign-in flow (`src/routes/+page.server.ts`):

1. Form action receives email/password, validated by `loginFormSchema` (Zod) via Superforms.
2. Server calls `signInWithEmailAndPassword(auth, …)` against Firebase (the Firebase *client* SDK runs server-side here — it's the same module used in the browser).
3. The resulting `user.getIdToken()` is stored in an httpOnly, sameSite=strict, `secure` (in prod) cookie named `user` with `maxAge` 7 days.
4. Redirects to `/freebies`.

> **⚠ Known auth gap.** `hooks.server.ts` checks for cookie *presence* only — it does not verify the ID token signature, expiry, or revocation against Firebase Admin SDK. Any non-empty `user` cookie passes the gate. Hardening this requires introducing the Firebase Admin SDK server-side. Treat this dashboard as trusted-network only until that lands.

Sign-out is a form action on `/freebies/+page.server.ts` that calls `signOut(auth)` and `cookies.delete('user', …)`.

### 3.3 State management

Page-scoped logic is encapsulated in **store factories** under `src/lib/stores/`. Each factory wraps a Svelte `writable` and exposes typed mutators plus any data-fetching methods. Components subscribe with `$store` and call methods — they never read or write Firestore directly.

| Store | Owns |
|---|---|
| `freebiesPageStore` | `freebies` list + `fetchFreebies(filterBy)` Firestore query |
| `freebieFormStore` | Create/edit form state (selected products, collections, gift items, dialog open flags) |
| `freebiesFilterStore` | `All` / `Active` / `Draft` filter |
| `searchFreebiesStore` | Debounced search query |
| `productsStore`, `productsDialogStore` | Product picker dialog state |
| `deleteFreebieStore` | Delete-confirmation dialog state |

The form store (`freebieFormStore.ts`) is the most complex: it mediates between three picker dialogs (products / collections / freebies/gift-items) and tracks which resource type the user is editing.

### 3.4 Data flow — reads

```
freebies/+page.svelte  ──$:── freebiesPageStore.fetchFreebies(filter)
                                       │
                                       ▼
                              Firestore client SDK  ── HTTPS ──▶  Firestore `freebies`
```

Reads bypass the SvelteKit server entirely. Firestore security rules (in the sibling Cloud Functions / Firebase repo, not here) are the only enforcement.

### 3.5 Data flow — writes

```
freebies-form.svelte             freebie-delete-dialog.svelte    freebies-table.svelte
   POST ${API_URL}                   POST ${API_URL}/deletePromo     POST ${API_URL}/updatePromo
        │                                  │                              │
        └──────────────┬───────────────────┴──────────────────────────────┘
                       ▼
       Cloud Functions (us-central1-<project>.cloudfunctions.net)
                       │
                       ▼
                  Firestore `freebies`
```

`VITE_BOOZY_FREEBIE_API_URL` is the base URL. The three endpoints (`createPromo`, `updatePromo`, `deletePromo`) are deployed from a separate repository. This dashboard is a *client* of those functions.

### 3.6 Data flow — Shopify

```
freebies/create/+page.server.ts     freebies-form.svelte (client)
   load() runs server-side             fetch('/api/shopify/freebies?searchQuery=…')
        │                                          │
        ├──▶ shopifyApiInit()                      ▼
        │    (in-process GraphQL)        SvelteKit /api/shopify/* endpoint
        │                                          │
        ▼                                          ▼
   Shopify Admin GraphQL  ◀──────────────────  shopifyApiInit() (in-process)
```

`shopifyApiInit()` (`src/lib/shopify/shopify.api.ts`) constructs a `GraphqlClient` for a Shopify *custom app session* — appropriate for a single-store, non-embedded admin tool. The client is created **per-request** inside the `+server.ts` handlers (a module-level call to `shopifyApiInit()`), so there's no shared connection pool.

Freebie products are distinguished in Shopify by `product_type: "Freebie"`. The qualifying-purchase catalog is everything else.

### 3.7 Domain model

The Firestore `freebies` collection stores documents shaped like:

```ts
{
  id: string,                  // app-level ID
  name: string,
  status: boolean,             // true = Active, false = Draft
  start_date: 'YYYY-MM-DD',
  end_date:   'YYYY-MM-DD',
  min_amount: number,          // minimum cart total to qualify
  min_prod:   number,          // minimum qualifying-product count
  max_gift:   number,          // gift cap per transaction
  products:   ResourceItem[],  // qualifying products or collections
  gift_items: ResourceItem[]   // free items granted on qualification
}
```

`ResourceItem` (see `freebieFormStore.ts`):

```ts
{
  id: number,
  name: string,
  type: 'products' | 'collections' | 'freebies',
  variant_id?: number,
  img_url?: string,
  productsCount?: number     // for collections
}
```

Note the **snake_case in Firestore, camelCase in TS** — `freebiesPageStore.fetchFreebies` does the mapping.

---

## 4. Infrastructure

### 4.1 Environments

Two parallel Firebase projects + Shopify stores:

| | Staging | Production |
|---|---|---|
| Firebase project | `boozy-freebie-staging` | `boozy-freebie` |
| Shopify store | `letsboozy-staging.myshopify.com` | `letsboozy.myshopify.com` |
| Cloud Functions host | `us-central1-boozy-freebie-staging.cloudfunctions.net` | `us-central1-boozy-freebie.cloudfunctions.net` |

Env files (`.env.development`, `.env.production`) at the repo root supply the values. Variables are loaded by Vite — note that the `VITE_` prefix exposes them to the client bundle.

> **⚠ Secrets caveat.** The Shopify Admin access token, API key, and secret are currently prefixed `VITE_`, which means they end up in the browser bundle even when only used server-side. They should be renamed (drop the `VITE_` prefix) and read via SvelteKit's `$env/static/private` instead. Until that change lands, treat the Shopify credentials as effectively public to anyone who can load the dashboard, and rotate them on any suspected exposure. The committed `.env.development` file also contains live staging credentials — rotate and uncommit before open-sourcing.

### 4.2 Build & runtime

```
Dockerfile (two-stage)
├── builder: node:20-alpine
│     • installs pnpm globally
│     • pnpm install -r -prod
│     • (Vite build is expected to have already produced ./build before COPY)
└── runtime: node:20-alpine
      • copies build/, node_modules/, package.json
      • EXPOSE 3000
      • CMD ["node", "build"]   ← adapter-node entrypoint
```

The build artifact is the `build/` directory produced by `adapter-node`. The container listens on port 3000.

> **Note on the Dockerfile.** It `COPY --from=builder /app/build` but never runs `vite build` inside the builder stage — it relies on `build/` being produced on the host before `docker build`. The README's deploy steps confirm this: `npm run build` precedes `docker buildx`. If you change CI to build inside the container, add a `RUN pnpm build` step in the builder.

### 4.3 Deployment target

Production deploy path (from `README.md`):

```bash
npm run build
gcloud auth configure-docker asia-east2-docker.pkg.dev
docker buildx build --platform linux/amd64 -t boozy-freebie-dashboard .
docker tag  boozy-freebie-dashboard  asia-east2-docker.pkg.dev/boozy-freebie/boozy-freebie-dashboard/boozy-freebie-dashboard
docker push                         asia-east2-docker.pkg.dev/boozy-freebie/boozy-freebie-dashboard/boozy-freebie-dashboard
```

- **Registry:** GCP Artifact Registry, region `asia-east2`, project `boozy-freebie`.
- **Compute:** the image is consumed by Cloud Run / GKE / Compute Engine (not configured in this repo). The active orchestrator isn't tracked here — look in the GCP project for the running service.
- **Region split:** dashboard runs in `asia-east2`, Cloud Functions run in `us-central1`. This adds ~150 ms cross-region latency to every freebie mutation. Acceptable for low-traffic admin use.

### 4.4 Legacy Firebase Hosting config

`firebase.json` and `.firebaserc` exist and reference Firestore rules, Firebase Hosting, and the emulator suite. **This is not the active deploy path.** The hosting block (`rewrites` to `/index.html`, SPA-style) is incompatible with the current SvelteKit Node server. Two possibilities for future maintainers:

- Use the emulator config (`firestore: 8080`, `auth: 9099`, `hosting: 5000`) for local Firebase testing.
- Otherwise, treat `firebase.json` as historical artifact from an earlier hosting strategy.

The Firestore rules and indexes themselves live in the sibling Cloud Functions repo, not here.

### 4.5 Observability

None configured in this repo. The Shopify client logs raw env values to stdout (`shopify.api.ts` lines 12–15) — **remove those `console.log`s before any further deploy**, they leak the Shopify access token into container logs.

### 4.6 CI/CD

No CI configuration is checked into this repo (`.github/`, `cloudbuild.yaml`, etc. all absent). Deploys are currently manual via the README commands.

---

## 5. Quick map: "where do I change…"

| Need to change… | File / directory |
|---|---|
| Auth gate (which routes require login) | `src/hooks.server.ts` |
| Login validation rules | `src/lib/schema/loginSchema.ts` |
| Login server action | `src/routes/+page.server.ts` |
| Shopify GraphQL queries | `src/routes/api/shopify/*/+server.ts`, `src/routes/freebies/create/+page.server.ts` |
| Shopify client config / scopes | `src/lib/shopify/shopify.api.ts` |
| Firebase client config | `src/lib/firebase/firebase.client.ts` |
| Freebie write endpoints | *not in this repo* — sibling Cloud Functions project |
| Freebie list query / filtering | `src/lib/stores/freebiesPageStore.ts` |
| Freebie form state | `src/lib/stores/freebieFormStore.ts` |
| UI primitives | `src/lib/components/ui/` |
| Global styles / Tailwind theme | `src/app.css`, `tailwind.config.ts` |
| Container build | `Dockerfile` |
| SvelteKit adapter / build config | `svelte.config.js`, `vite.config.ts` |

---

## 6. Risks & follow-ups

Surfaced while writing this doc — worth raising with the team:

1. **Auth tokens are not verified server-side.** `hooks.server.ts` accepts any non-empty `user` cookie. Add Firebase Admin SDK token verification.
2. **Shopify secrets ship to the browser.** `VITE_SHOPIFY_*` are in the client bundle. Move to `$env/static/private` and drop the prefix.
3. **Live credentials in `.env.development`.** Rotate them and remove the file from git history.
4. **Debug `console.log` leaks the access token** in `shopify.api.ts`.
5. **Two lockfiles** (`package-lock.json`, `pnpm-lock.yaml`) — pick one. The Dockerfile uses pnpm; the README and scripts use npm.
6. **No CI.** A `cloudbuild.yaml` or GitHub Action wrapping the README's manual deploy steps would prevent drift.
7. **Sibling repo undocumented.** The Cloud Functions repo (`createPromo` / `updatePromo` / `deletePromo`) is load-bearing for this dashboard but isn't referenced anywhere in code or docs. Link it from the README.
