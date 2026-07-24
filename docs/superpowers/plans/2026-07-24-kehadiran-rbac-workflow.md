# Kehadiran RBAC and Leave Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore secure, tenant-scoped creation and approval of Kehadiran leave requests with the same authority boundaries as OpenSID.

**Architecture:** A small admin-access service resolves the signed-in user against its current database record, applies OpenSID's `grup_akses` thresholds, and returns only trusted actor attributes. Domain server actions accept an allowlisted `FormData` DTO and always load the target record inside the action before mutating it. Pure validation, access-threshold, and leave-date helpers are covered by Node tests; pages only render data scoped through the same trusted actor.

**Tech Stack:** Next.js App Router server actions, NextAuth, Prisma, TypeScript, Node's built-in test runner, `tsx`.

## Global Constraints

- Do not add or reintroduce route handlers beneath `src/app/api/` for this work.
- Do not use `CrudManager`, `makeActions`, or `src/lib/actions.ts` for any Kehadiran mutation.
- Every read and write must be scoped to the authenticated user's `config_id`.
- `grup_akses.akses` uses OpenSID thresholds: baca `>= 1`, ubah `>= 3`, hapus `>= 7`; only the actual super-admin user bypasses them.
- Self-service requests always use the authenticated user's `pamong_id`; client input may never choose `config_id`, `id_pamong`, status, approver, or approval timestamp.
- A request may be edited or removed only by its owner and only while `status_approval` is `pending`.
- Approval actions may only decide pending requests in the same tenant; a non-super-admin may only decide requests for direct reports (`tweb_desa_pamong.atasan === actor.pamongId`).
- Approving creates one detail record and, when absent, one attendance record per inclusive leave date; existing attendance rows are preserved.

---

## File Structure

- `src/lib/adminAccess.ts` owns authenticated actor lookup and module access decisions.
- `src/lib/kehadiranLeave.ts` owns pure parsing, validation, inclusive-date generation, and pending-state checks.
- `src/app/(admin)/kehadiran/pengajuan_izin/actions.ts` owns self-service create, update, and delete server actions.
- `src/app/(admin)/kehadiran/pengajuan_izin/LeaveRequestManager.tsx` owns the client form and pending-row controls.
- `src/app/(admin)/kehadiran/pengajuan_izin/page.tsx` renders the actor-scoped self-service list.
- `src/app/(admin)/kehadiran/persetujuan_izin/actions.ts` owns approved/rejected state transitions and attendance projection.
- `src/app/(admin)/kehadiran/persetujuan_izin/LeaveApprovalManager.tsx` owns approval/rejection controls.
- `src/app/(admin)/kehadiran/persetujuan_izin/page.tsx` renders the supervisor-scoped approval queue.
- `tests/adminAccess.test.ts`, `tests/kehadiranLeave.test.ts`, and `tests/kehadiranApproval.test.ts` lock down pure security and workflow rules.

### Task 1: Shared admin-access and leave-domain helpers

**Files:**
- Create: `src/lib/adminAccess.ts`
- Create: `src/lib/kehadiranLeave.ts`
- Create: `tests/adminAccess.test.ts`
- Create: `tests/kehadiranLeave.test.ts`

**Interfaces:**
- Produces `hasAccess(level: number | null | undefined, required: "b" | "u" | "h"): boolean`.
- Produces `requireAdminAccess(moduleUrl: string, required: "b" | "u" | "h"): Promise<AdminActor>` where `AdminActor` is `{ userId: number; configId: number; groupId: number | null; pamongId: number | null; isSuperAdmin: boolean }`.
- Produces `parseLeaveInput(formData: FormData): LeaveInput`, `leaveDates(start: Date, end: Date): Date[]`, and `canChangePending(status: string): boolean`.

- [ ] **Step 1: Write failing threshold and leave-input tests**

```ts
assert.equal(hasAccess(1, "b"), true)
assert.equal(hasAccess(1, "u"), false)
assert.equal(hasAccess(3, "u"), true)
assert.equal(hasAccess(7, "h"), true)
assert.throws(() => parseLeaveInput(new FormData()), /Jenis izin/)
assert.throws(
  () => parseLeaveInput(new FormData([["jenis_izin", "izin"], ["tanggal_mulai", "2026-07-24"], ["tanggal_selesai", "2026-07-24"], ["keterangan", "   "]])),
  /Keterangan/,
)
assert.deepEqual(
  leaveDates(new Date("2026-07-24"), new Date("2026-07-26")).map((date) => date.toISOString().slice(0, 10)),
  ["2026-07-24", "2026-07-25", "2026-07-26"],
)
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npx tsx --test tests/adminAccess.test.ts tests/kehadiranLeave.test.ts`

Expected: FAIL because the helpers do not exist.

- [ ] **Step 3: Implement pure helpers and authenticated actor lookup**

```ts
const requiredThreshold = { b: 1, u: 3, h: 7 } as const

export function hasAccess(level: number | null | undefined, required: keyof typeof requiredThreshold) {
  return (level ?? 0) >= requiredThreshold[required]
}

export function canChangePending(status: string) {
  return status === "pending"
}
```

`requireAdminAccess` must call `auth()`, parse `session.user.id`, load `user` by primary key, resolve the actual super-admin as the first `user` in the same tenant whose joined `user_grup.slug` is `administrator` (matching legacy `User::superAdmin()->first()`), and otherwise load the exact `setting_modul` and `grup_akses` records for the user's group and tenant. It must throw `Error("Tidak memiliki akses.")` for an absent session, user, module, or insufficient level. `parseLeaveInput` must trim and require nonempty `keterangan`, accept only Prisma enum values `cuti`, `sakit`, `izin`, `dinas_luar_kota`, and `lainnya`, parse date-only `YYYY-MM-DD` values, reject an end before start, and cap the range at 366 days.

- [ ] **Step 4: Run helper tests and static types**

Run: `npx tsx --test tests/adminAccess.test.ts tests/kehadiranLeave.test.ts && npx tsc --noEmit`

Expected: both tests pass and TypeScript exits 0.

- [ ] **Step 5: Commit the helpers**

```bash
git add src/lib/adminAccess.ts src/lib/kehadiranLeave.ts tests/adminAccess.test.ts tests/kehadiranLeave.test.ts
git commit -m "feat: add admin access helpers"
```

### Task 2: Self-service leave request workflow

**Files:**
- Create: `src/app/(admin)/kehadiran/pengajuan_izin/actions.ts`
- Create: `src/app/(admin)/kehadiran/pengajuan_izin/LeaveRequestManager.tsx`
- Modify: `src/app/(admin)/kehadiran/pengajuan_izin/page.tsx`
- Modify: `tests/kehadiranLeave.test.ts`

**Interfaces:**
- Consumes `requireAdminAccess("kehadiran_pengajuan_izin_pamong", capability)`, `parseLeaveInput`, `leaveDates`, and `canChangePending` from Task 1.
- Produces server actions `createLeaveRequest`, `updateLeaveRequest`, and `deleteLeaveRequest` accepting `FormData`.

- [ ] **Step 1: Extend the failing test with owner and pending rules**

```ts
assert.equal(canChangePending("pending"), true)
assert.equal(canChangePending("approved"), false)
assert.equal(canChangePending("rejected"), false)
```

- [ ] **Step 2: Run the focused test to verify the new assertion fails if missing**

Run: `npx tsx --test tests/kehadiranLeave.test.ts`

Expected: PASS only after the Task 1 helper is present; otherwise first implement the helper before continuing.

- [ ] **Step 3: Implement tenant-scoped create, update, delete actions**

```ts
const actor = await requireAdminAccess("kehadiran_pengajuan_izin_pamong", "u")
if (!actor.pamongId) throw new Error("Akun tidak terhubung ke perangkat desa.")
const input = parseLeaveInput(formData)
await prisma.kehadiran_pengajuan_izin.create({
  data: { config_id: actor.configId, id_pamong: actor.pamongId, ...input, status_approval: "pending" },
})
```

For update and delete, parse the numeric request ID from `FormData`, load the row with `where: { id }`, reject when its `config_id` or `id_pamong` differs from the actor or status is not pending, and then mutate only allowlisted input fields. Create and update must create/recreate `kehadiran_pengajuan_izin_detail` rows for every inclusive date with `status: "pending"`; delete removes the header and its details in one transaction. Revalidate `/kehadiran/pengajuan_izin` after success. The client component must use server action form bindings, show a localized error, and expose edit/delete controls only for pending rows; it must not call `/api/`.

- [ ] **Step 4: Scope and render the self-service page**

```ts
const actor = await requireAdminAccess("kehadiran_pengajuan_izin_pamong", "b")
const rows = actor.pamongId
  ? await prisma.kehadiran_pengajuan_izin.findMany({ where: { config_id: actor.configId, id_pamong: actor.pamongId } })
  : []
```

Pass serializable row values to `LeaveRequestManager` (convert `BigInt` IDs to strings and dates to ISO strings). Replace the current “Hanya baca” copy with create/edit/delete controls and retain the AdminLTE table styling.

- [ ] **Step 5: Verify workflow code and commit**

Run: `npx tsx --test tests/kehadiranLeave.test.ts && npx tsc --noEmit && npx eslint 'src/lib/adminAccess.ts' 'src/lib/kehadiranLeave.ts' 'src/app/(admin)/kehadiran/pengajuan_izin/**/*.tsx'`

Expected: all commands exit 0.

```bash
git add 'src/app/(admin)/kehadiran/pengajuan_izin' tests/kehadiranLeave.test.ts
git commit -m "feat: add self-service leave requests"
```

### Task 3: Supervisor leave approval workflow

**Files:**
- Create: `src/app/(admin)/kehadiran/persetujuan_izin/actions.ts`
- Create: `src/app/(admin)/kehadiran/persetujuan_izin/LeaveApprovalManager.tsx`
- Modify: `src/app/(admin)/kehadiran/persetujuan_izin/page.tsx`
- Create: `tests/kehadiranApproval.test.ts`

**Interfaces:**
- Consumes `requireAdminAccess("kehadiran_pengajuan_izin", "b" | "u")`, `leaveDates`, and `canChangePending` from Task 1.
- Produces `approveLeaveRequest(formData: FormData)` and `rejectLeaveRequest(formData: FormData)`.

- [ ] **Step 1: Write failing approval-domain tests**

```ts
assert.deepEqual(
  leaveDates(new Date("2024-02-28"), new Date("2024-03-01")).map((date) => date.toISOString().slice(0, 10)),
  ["2024-02-28", "2024-02-29", "2024-03-01"],
)
assert.equal(canChangePending("pending"), true)
assert.equal(canChangePending("approved"), false)
```

- [ ] **Step 2: Run the new test to verify the specification is executable**

Run: `npx tsx --test tests/kehadiranApproval.test.ts`

Expected: PASS after Task 1; the test demonstrates the inclusive-date contract used by approval.

- [ ] **Step 3: Implement atomic approval and rejection actions**

```ts
await prisma.$transaction(async (tx) => {
  await tx.kehadiran_pengajuan_izin.update({
    where: { id: request.id },
    data: { status_approval: "approved", approved_by: actor.userId, tanggal_approval: new Date(), keterangan_approval: note },
  })
  await tx.kehadiran_pengajuan_izin_detail.updateMany({ where: { pengajuan_izin_id: request.id }, data: { status: "approved" } })
})
```

Before either action, require `u`, parse the request ID and bounded, trimmed decision note, load the request with its `tweb_desa_pamong`, enforce same `config_id` and `pending` state, and for a non-super-admin require `request.tweb_desa_pamong.atasan === actor.pamongId`. Approval must upsert no more than one attendance row per inclusive date: query by tenant/date/pamong first, create only when absent with `status_kehadiran: request.jenis_izin`, and preserve existing rows. Rejection updates only header and detail statuses. Revalidate `/kehadiran/persetujuan_izin` after each completed action.

- [ ] **Step 4: Scope and render the approval queue**

```ts
const actor = await requireAdminAccess("kehadiran_pengajuan_izin", "b")
const where = actor.isSuperAdmin
  ? { config_id: actor.configId }
  : { config_id: actor.configId, tweb_desa_pamong: { atasan: actor.pamongId ?? -1 } }
```

Render rows with requester, leave type, inclusive dates, status, and approval metadata. Pass only serializable values to `LeaveApprovalManager`; show approve/reject controls only for pending rows and only when the page actor has `u` access. Forms must submit to server actions and never expose a write API endpoint.

- [ ] **Step 5: Verify the complete Kehadiran workflow and commit**

Run: `npm test && npx tsc --noEmit && npm run build`

Expected: all tests pass, TypeScript exits 0, and the production build completes.

```bash
git add 'src/app/(admin)/kehadiran/persetujuan_izin' tests/kehadiranApproval.test.ts
git commit -m "feat: add leave approval workflow"
```

## Self-Review

1. **Spec coverage:** Task 1 establishes the OpenSID threshold model and tenant actor; Task 2 restores self-service creation, updates, and deletion; Task 3 restores supervisor approval/rejection plus inclusive attendance projection. All client-provided identity/status fields are excluded.
2. **Placeholder scan:** This plan contains no deferred-validation markers or unfinished implementation steps; each task has exact files, interfaces, tests, commands, and commit scope.
3. **Type consistency:** All tasks share `AdminActor`, `requireAdminAccess`, `parseLeaveInput`, `leaveDates`, and `canChangePending`. Dates cross the server/client boundary as ISO strings and IDs as strings.
