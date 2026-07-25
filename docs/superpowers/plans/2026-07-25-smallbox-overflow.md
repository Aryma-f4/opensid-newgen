# SmallBox Overflow Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep decorative `SmallBox` icons inside their cards at every viewport width without changing card content or links.

**Architecture:** Apply the containment rule once in the shared admin stylesheet. Every `SmallBox` rendered by `src/components/admin/Ui.tsx` inherits the fix; page-specific grids remain unchanged.

**Tech Stack:** Next.js, React, Tailwind utility classes, AdminLTE-compatible CSS, Node test runner.

## Global Constraints

- Scope the rule to `.admin-shell .small-box`; public cards must not change.
- Keep the card's rounded corners, hover transform, value, label, icon, and optional footer behavior.
- Do not modify page-level `SmallBox` callers or unrelated user changes.

---

### Task 1: Contain global SmallBox decoration

**Files:**
- Modify: `src/app/globals.css`
- Create: `tests/smallBoxStyle.test.ts`

- [ ] **Step 1: Write the failing style-contract test**

```ts
assert.match(css, /\.admin-shell \.small-box\s*\{[\s\S]*overflow:\s*hidden/)
assert.match(css, /\.admin-shell \.small-box\s*\{[\s\S]*isolation:\s*isolate/)
```

- [ ] **Step 2: Run the test to verify failure**

Run: `npx tsx --test tests/smallBoxStyle.test.ts`

Expected: FAIL because the shared card has no clipping/isolation contract.

- [ ] **Step 3: Add shared containment rules**

```css
.admin-shell .small-box {
  overflow: hidden;
  isolation: isolate;
}
```

Keep this in the existing shared SmallBox style block so it applies to every dashboard card without altering callers.

- [ ] **Step 4: Verify the visual contract and production build**

Run: `npm test && npx tsc --noEmit && npm run build`

Expected: all tests pass, TypeScript exits 0, and the build completes.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css tests/smallBoxStyle.test.ts docs/superpowers/plans/2026-07-25-smallbox-overflow.md
git commit -m "fix: contain small box icons"
```
