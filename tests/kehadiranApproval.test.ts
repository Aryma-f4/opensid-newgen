import assert from "node:assert/strict"
import test from "node:test"

import {
  approvalMutationWhere,
  approvalQueueWhere,
  approvalActionMessage,
  canDecideLeaveRequest,
  missingAttendanceDates,
  parseDecisionNote,
} from "../src/lib/kehadiranApproval"
import { canChangePending, leaveDates } from "../src/lib/kehadiranLeave"

const supervisor = {
  configId: 7,
  pamongId: 21,
  isSuperAdmin: false,
}

test("leave approval projects every date in an inclusive leap-day range", () => {
  assert.deepEqual(
    leaveDates(new Date("2024-02-28"), new Date("2024-03-01")).map((date) =>
      date.toISOString().slice(0, 10),
    ),
    ["2024-02-28", "2024-02-29", "2024-03-01"],
  )
})

test("only pending requests may be decided", () => {
  assert.equal(canChangePending("pending"), true)
  assert.equal(canChangePending("approved"), false)
})

test("a supervisor can decide only a pending direct report in the same tenant", () => {
  assert.equal(
    canDecideLeaveRequest(supervisor, {
      configId: 7,
      supervisorId: 21,
      status: "pending",
    }),
    true,
  )
  assert.equal(
    canDecideLeaveRequest(supervisor, {
      configId: 8,
      supervisorId: 21,
      status: "pending",
    }),
    false,
  )
  assert.equal(
    canDecideLeaveRequest(supervisor, {
      configId: 7,
      supervisorId: 22,
      status: "pending",
    }),
    false,
  )
  assert.equal(
    canDecideLeaveRequest(supervisor, {
      configId: 7,
      supervisorId: 21,
      status: "approved",
    }),
    false,
  )
})

test("only the actual super-admin policy bypasses the direct-report check", () => {
  assert.equal(
    canDecideLeaveRequest(
      { configId: 7, pamongId: null, isSuperAdmin: true },
      { configId: 7, supervisorId: 999, status: "pending" },
    ),
    true,
  )
  assert.equal(
    canDecideLeaveRequest(
      { configId: 7, pamongId: null, isSuperAdmin: true },
      { configId: 8, supervisorId: 999, status: "pending" },
    ),
    false,
  )
})

test("approval queue scope is tenant-only for super-admin and direct reports otherwise", () => {
  assert.deepEqual(
    approvalQueueWhere({ configId: 7, pamongId: null, isSuperAdmin: true }),
    { config_id: 7 },
  )
  assert.deepEqual(approvalQueueWhere(supervisor), {
    config_id: 7,
    tweb_desa_pamong: { atasan: 21 },
  })
})

test("approval mutation guard claims only pending rows in the actor scope", () => {
  assert.deepEqual(approvalMutationWhere(supervisor), {
    config_id: 7,
    status_approval: "pending",
    tweb_desa_pamong: { atasan: 21 },
  })
  assert.deepEqual(
    approvalMutationWhere({ configId: 7, pamongId: null, isSuperAdmin: true }),
    {
      config_id: 7,
      status_approval: "pending",
    },
  )
})

test("attendance projection returns only missing dates and preserves existing rows", () => {
  assert.deepEqual(
    missingAttendanceDates(
      new Date("2024-02-28"),
      new Date("2024-03-01"),
      [new Date("2024-02-29")],
    ).map((date) => date.toISOString().slice(0, 10)),
    ["2024-02-28", "2024-03-01"],
  )
})

test("decision notes are trimmed, optional, and bounded", () => {
  const formData = new FormData()
  formData.set("decision_note", "  Disetujui sesuai jadwal.  ")
  assert.equal(parseDecisionNote(formData), "Disetujui sesuai jadwal.")

  formData.set("decision_note", "   ")
  assert.equal(parseDecisionNote(formData), null)

  formData.set("decision_note", "x".repeat(1001))
  assert.throws(() => parseDecisionNote(formData), /maksimal/)
})

test("approval result codes map to localized messages", () => {
  assert.equal(approvalActionMessage("approved"), "Pengajuan izin disetujui.")
  assert.equal(
    approvalActionMessage("not_allowed"),
    "Anda tidak dapat memutuskan pengajuan izin ini.",
  )
  assert.equal(
    approvalActionMessage("approve_failed"),
    "Pengajuan izin tidak dapat disetujui. Silakan coba lagi.",
  )
})
