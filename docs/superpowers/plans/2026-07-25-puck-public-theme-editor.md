# Puck Public Theme Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Puck-powered visual editor for every public OpenSID route while preserving the current default theme and isolating `/admin`.

**Architecture:** The active `theme` record selects either the existing legacy renderer or a Puck renderer. A tenant-scoped `theme_page_layouts` table stores validated Puck JSON for each public route key; public pages retain their server-side data queries and pass typed context to registered Puck blocks. The editor saves layouts through access-controlled server actions, never through the generic theme CRUD APIs.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma/MySQL, Zod, `@puckeditor/core`, Node test runner.

## Global Constraints

- `/admin`, auth, and API routes never use Puck rendering or Puck editor components.
- A legacy active theme renders the existing `PublicSiteShell` and page JSX without any layout/data migration.
- Puck themes store JSON only; never execute stored JavaScript or arbitrary HTML.
- All edits require `requireAdminAccess("theme", "u")` and bind reads/writes to `actor.configId`.
- Route keys are exactly `home`, `article-detail`, `category-list`, and `layanan-mandiri` in this iteration.
- Preserve all unrelated dirty worktree files.

---

### Task 1: Add Puck dependency and tenant-scoped layout persistence

**Files:**
- Modify: `package.json`, `package-lock.json`, `prisma/schema.prisma`
- Create: `src/lib/themePuck.ts`, `tests/themePuck.test.ts`

**Interfaces:**
- Produces `PublicRouteKey`, `PUCK_ROUTE_KEYS`, `parsePuckLayout(value)`, and `starterPuckData(routeKey)` from `src/lib/themePuck.ts`.
- Adds `theme.renderer` with `legacy` as the existing-data default and `theme_page_layouts(theme_id, route_key, puck_data)` with a unique composite key.

- [ ] **Step 1: Write failing layout-domain tests**

```ts
assert.deepEqual(PUCK_ROUTE_KEYS, ["home", "article-detail", "category-list", "layanan-mandiri"])
assert.throws(() => parsePuckLayout({ content: [{ type: "UnknownBlock" }] }))
assert.equal(starterPuckData("home").content[0].type, "SiteHeader")
```

- [ ] **Step 2: Run the new test to verify failure**

Run: `npx tsx --test tests/themePuck.test.ts`

Expected: FAIL because the Puck route contract and starter-data factory do not exist.

- [ ] **Step 3: Install Puck and add schema**

```bash
npm install @puckeditor/core
```

Add a `theme_renderer` enum (`legacy`, `puck`), `renderer theme_renderer @default(legacy)` to `theme`, and this relation-backed layout model:

```prisma
model theme_page_layouts {
  id         BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  config_id  Int
  theme_id   BigInt   @db.UnsignedBigInt
  route_key  String   @db.VarChar(48)
  puck_data  Json
  created_at DateTime @default(now()) @db.Timestamp(0)
  updated_at DateTime @updatedAt @db.Timestamp(0)

  theme theme @relation(fields: [theme_id], references: [id], onDelete: Cascade)

  @@unique([theme_id, route_key])
  @@index([config_id])
}
```

Regenerate Prisma and apply only this additive schema change with `npx prisma generate` and `npx prisma db push` after confirming the target database.

- [ ] **Step 4: Implement the pure Puck contract**

Export the four allowed route keys, a closed component-type allowlist, a size-bounded parser for Puck's `{ content, root, zones }` shape, and deterministic starter layouts. Reject unknown block types, route keys, non-object data, and JSON over the database-safe size limit.

- [ ] **Step 5: Verify the domain contract**

Run: `npx tsx --test tests/themePuck.test.ts && npx prisma generate && npx tsc --noEmit`

Expected: all tests pass and generated Prisma types include `theme_page_layouts`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json prisma/schema.prisma src/generated src/lib/themePuck.ts tests/themePuck.test.ts
git commit -m "feat: add Puck theme layout persistence"
```

### Task 2: Define safe OpenSID Puck blocks and renderer configuration

**Files:**
- Create: `src/components/public/puck/config.tsx`, `src/components/public/puck/blocks.tsx`, `src/components/public/puck/types.ts`
- Modify: `src/lib/themePuck.ts`
- Test: `tests/themePuck.test.ts`

**Interfaces:**
- Produces `publicPuckConfig`, `PublicThemeContext`, and `renderPublicPuck(data, context)`.
- Consumes validated Puck data and a route context containing only public OpenSID data.

- [ ] **Step 1: Add failing configuration tests**

```ts
assert.deepEqual(Object.keys(publicPuckConfig.components).sort(), [
  "ArticleDetail", "ArticleList", "Button", "CategoryList", "Columns", "Divider",
  "Heading", "Image", "RichText", "RunningText", "Section", "SiteFooter",
  "SiteHeader", "Spacer", "Statistics", "VillageApparatus", "WidgetArea",
].sort())
assert.equal(publicPuckConfig.components.ArticleDetail.render({ context }).type, "article")
```

- [ ] **Step 2: Run the configuration test to verify failure**

Run: `npx tsx --test tests/themePuck.test.ts`

Expected: FAIL because no registry or OpenSID render blocks exist.

- [ ] **Step 3: Implement the fixed component registry**

Create presentational blocks for section/columns/spacer/divider/heading/rich-text/image/button and data blocks for header/footer/navigation/running text/articles/categories/statistics/apparatus/widget area. Define fields with Puck's supported text, textarea, select, number, radio, and external image controls. Do not define HTML, JavaScript, JSX, or iframe fields.

- [ ] **Step 4: Implement typed route context**

Pass article/category/configuration data from the route, not database access from client blocks. Ensure `ArticleDetail`, `ArticleList`, and `CategoryList` render an accessible empty state when their corresponding context is absent.

- [ ] **Step 5: Verify block behavior**

Run: `npx tsx --test tests/themePuck.test.ts && npx tsc --noEmit`

Expected: registry tests pass and no Puck block accepts arbitrary executable markup.

- [ ] **Step 6: Commit**

```bash
git add src/components/public/puck src/lib/themePuck.ts tests/themePuck.test.ts
git commit -m "feat: add OpenSID Puck block registry"
```

### Task 3: Route public rendering through legacy-or-Puck selection

**Files:**
- Create: `src/components/public/PublicThemeRenderer.tsx`, `src/lib/publicTheme.ts`
- Modify: `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/artikel/[...slug]/page.tsx`, `src/app/(public)/kategori/[id]/page.tsx`, `src/app/(public)/layanan-mandiri/page.tsx`
- Test: `tests/publicTheme.test.ts`

**Interfaces:**
- `resolvePublicTheme(configId): Promise<{ mode: "legacy" | "puck"; themeId?: bigint }>`
- `PublicThemeRenderer({ routeKey, context, legacyChildren })`
- `loadThemeLayout(configId, themeId, routeKey)` returns a validated layout or `null`.

- [ ] **Step 1: Write failing renderer-selection tests**

```ts
assert.equal(selectPublicRenderer({ renderer: "legacy" }, "home"), "legacy")
assert.equal(selectPublicRenderer({ renderer: "puck" }, "home"), "puck")
assert.equal(selectPublicRenderer({ renderer: "puck" }, "article-detail"), "puck-fallback")
```

- [ ] **Step 2: Run the renderer test to verify failure**

Run: `npx tsx --test tests/publicTheme.test.ts`

Expected: FAIL because no public theme resolver or fallback exists.

- [ ] **Step 3: Implement tenant-safe public theme resolution**

Read only the active `theme` for the current public configuration. A missing active theme or a `legacy` renderer selects the existing layout. For a Puck theme, load `theme_page_layouts` using both `config_id` and `theme_id`; validate the JSON before it reaches `Render`.

- [ ] **Step 4: Preserve legacy composition and add Puck composition**

Make `(public)/layout.tsx` wrap only legacy routes in `PublicSiteShell`. Update each listed public page to keep its existing server data query and hand the legacy JSX plus typed context to `PublicThemeRenderer`. Puck layouts include their own SiteHeader/SiteFooter blocks; a missing Puck route uses the starter layout with an editor-visible status, never a blank public page.

- [ ] **Step 5: Verify public route selection**

Run: `npx tsx --test tests/publicTheme.test.ts && npm test && npx tsc --noEmit`

Expected: legacy selection returns existing JSX and Puck selection never applies to an admin route.

- [ ] **Step 6: Commit**

```bash
git add src/components/public/PublicThemeRenderer.tsx src/lib/publicTheme.ts src/app/\(public\) tests/publicTheme.test.ts
git commit -m "feat: render public themes with Puck"
```

### Task 4: Replace the visual customizer with Puck and secured save actions

**Files:**
- Create: `src/app/(admin)/theme/customize/actions.ts`, `src/app/(admin)/theme/customize/PuckThemeEditor.tsx`
- Modify: `src/app/(admin)/theme/customize/page.tsx`, `src/app/(admin)/theme/customize/ThemeCustomizer.tsx`, `src/app/(admin)/theme/templates/page.tsx`
- Test: `tests/themePuckActions.test.ts`

**Interfaces:**
- `savePuckLayout(input: { themeId: string; routeKey: PublicRouteKey; data: unknown })`
- `createVisualTheme(name: string)` creates a tenant-owned Puck theme plus four starter layouts.
- `activateVisualTheme(themeId: string)` atomically deactivates only the actor's themes and activates its Puck theme.

- [ ] **Step 1: Write failing action-scope tests**

```ts
assert.throws(() => parseSavePuckLayout({ routeKey: "admin", data: {} }))
assert.deepEqual(themeLayoutWhere({ configId: 7, themeId: 4n, routeKey: "home" }), {
  config_id: 7, theme_id: 4n, route_key: "home",
})
assert.equal(actionErrorMessage(new Error("Tidak memiliki akses.")), "Tidak memiliki akses.")
```

- [ ] **Step 2: Run the action tests to verify failure**

Run: `npx tsx --test tests/themePuckActions.test.ts`

Expected: FAIL because there is no validated, tenant-scoped Puck persistence action.

- [ ] **Step 3: Implement server actions**

Use `requireAdminAccess("theme", "u")`. Validate theme ownership by `config_id`, validate the route key and Puck data via `parsePuckLayout`, and use an upsert keyed by `theme_id_route_key`. Revalidate only `/`, `/artikel`, `/kategori`, `/layanan-mandiri`, and `/theme/customize` after a successful mutation. Do not call the generic `/api/theme/*` CRUD routes for Puck layouts.

- [ ] **Step 4: Implement the Puck editor UI**

Replace the code/iframe editor with a client-only Puck editor (`dynamic(..., { ssr: false })`) using `publicPuckConfig`. Add selected visual-theme and route tabs, Puck's built-in undo/redo, Save/Publish state, desktop/tablet/mobile viewport toggles, create-visual-theme, activate-theme, and restore-starter-layout controls. Show a non-editable message when the selected theme is legacy.

- [ ] **Step 5: Update template management affordances**

Label the current default as “Tema Default (Legacy)”, label Puck themes as “Tema Visual (Puck)”, and link editing to the selected visual theme. Retain existing legacy template records rather than converting their raw source fields.

- [ ] **Step 6: Verify editor security and behavior**

Run: `npx tsx --test tests/themePuckActions.test.ts && npm test && npx tsc --noEmit`

Expected: unauthorized/cross-tenant saves fail, editor route keys are restricted, and valid Puck layouts save through the server action.

- [ ] **Step 7: Commit**

```bash
git add src/app/\(admin\)/theme/customize src/app/\(admin\)/theme/templates tests/themePuckActions.test.ts
git commit -m "feat: add Puck visual theme editor"
```

### Task 5: End-to-end public-theme verification and documentation

**Files:**
- Modify: `tests/appDocumentStructure.test.ts`, `docs/superpowers/specs/2026-07-25-puck-public-theme-editor-design.md`
- Create: `tests/publicThemeRoutes.test.ts`

**Interfaces:**
- Consumes the public route keys, renderer resolver, and Puck registry from Tasks 1–4.
- Produces regression coverage for default-theme stability and admin isolation.

- [ ] **Step 1: Write failing route coverage tests**

```ts
assert.deepEqual(PUBLIC_PUCK_ROUTE_FILES, [
  "src/app/(public)/page.tsx",
  "src/app/(public)/artikel/[...slug]/page.tsx",
  "src/app/(public)/kategori/[id]/page.tsx",
  "src/app/(public)/layanan-mandiri/page.tsx",
])
assert.doesNotMatch(readFileSync("src/app/(admin)/layout.tsx", "utf8"), /PublicThemeRenderer|@puckeditor/)
```

- [ ] **Step 2: Run the route test to verify failure**

Run: `npx tsx --test tests/publicThemeRoutes.test.ts`

Expected: FAIL until every target route delegates to the shared renderer and admin remains isolated.

- [ ] **Step 3: Add route coverage and update design notes**

Assert each target route uses the shared renderer, page components never render nested document roots, and default legacy selection still invokes the existing public shell. Record the final migration commands and manual smoke-test steps in the design document.

- [ ] **Step 4: Run complete verification**

Run: `npm test && npx tsc --noEmit && npm run audit:admin-menu-routes && npm run build`

Expected: all tests pass, TypeScript exits 0, all active menu routes resolve, and production build succeeds.

- [ ] **Step 5: Manual acceptance checks**

1. With the legacy theme active, compare `/`, an article, a category, and layanan mandiri with the current appearance.
2. Create and activate a visual theme; edit each route using drag/drop, save, reload, and confirm the public route reflects the saved layout.
3. Switch viewport controls and verify all registered blocks remain usable.
4. Attempt a non-admin and cross-tenant save; confirm both are denied.
5. Open `/admin`; confirm it does not load Puck or change layout.

- [ ] **Step 6: Commit**

```bash
git add tests docs/superpowers/specs/2026-07-25-puck-public-theme-editor-design.md
git commit -m "test: cover Puck public theme rendering"
```
