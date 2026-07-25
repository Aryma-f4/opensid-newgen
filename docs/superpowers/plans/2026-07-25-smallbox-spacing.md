# SmallBox Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use a compact, consistent gap between adjacent admin summary cards.

**Architecture:** Add one scoped stylesheet rule for grid and flex containers whose direct children are `.small-box` cards. This covers the shared React `SmallBox` component and direct legacy-style `.small-box` markup without affecting form grids, tables, or unrelated cards.

**Tech Stack:** Next.js, Tailwind utility classes, AdminLTE-compatible CSS, Node test runner.

## Global Constraints

- Scope the rule to `.admin-shell` so public pages are unchanged.
- Use an 8 px (`.5rem`) gap at all breakpoints.
- Preserve each page's existing column count, wrapping behavior, and bottom margin.
- Do not change grids that do not directly contain a `.small-box`.

---

### Task 1: Compact summary-card layouts

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tests/smallBoxStyle.test.ts`

**Interfaces:**
- Consumes: Page containers using Tailwind `.grid` or `.flex` with direct `.small-box` children.
- Produces: An 8 px inter-card gap for every matching admin layout.

- [ ] **Step 1: Write the failing style-contract test**

```ts
assert.match(
  css,
  /\.admin-shell :is\(\.grid, \.flex\):has\(> \.small-box\)\s*\{(?=[^}]*gap:\s*\.5rem)[^}]*\}/,
)
```

- [ ] **Step 2: Run the targeted test to verify failure**

Run: `npx tsx --test tests/smallBoxStyle.test.ts`

Expected: FAIL because no shared compact-gap rule exists.

- [ ] **Step 3: Add the scoped compact-gap rule**

```css
.admin-shell :is(.grid, .flex):has(> .small-box) {
  gap: .5rem;
}
```

Place it near the shared `.admin-shell .small-box` rules in `src/app/globals.css`.

- [ ] **Step 4: Verify the visual contract and production build**

Run: `npx tsx --test tests/smallBoxStyle.test.ts && npm test && npx tsc --noEmit && npm run build`

Expected: all tests pass, TypeScript exits 0, and the build completes.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-07-25-smallbox-spacing.md src/app/globals.css tests/smallBoxStyle.test.ts
git commit -m "fix: compact small box spacing"
```
