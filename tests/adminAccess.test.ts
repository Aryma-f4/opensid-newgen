import assert from "node:assert/strict"
import test from "node:test"

import { createRequireAdminAccess, hasAccess } from "../src/lib/adminAccess"

test("uses OpenSID access thresholds", () => {
  assert.equal(hasAccess(1, "b"), true)
  assert.equal(hasAccess(1, "u"), false)
  assert.equal(hasAccess(3, "u"), true)
  assert.equal(hasAccess(7, "h"), true)
})

test("denies missing access levels", () => {
  assert.equal(hasAccess(null, "b"), false)
  assert.equal(hasAccess(undefined, "b"), false)
})

test("bypasses group access only for the first tenant administrator", async () => {
  const calls: Record<string, unknown[]> = { user: [], module: [], access: [] }
  const requireAdminAccess = createRequireAdminAccess({
    auth: async () => ({ user: { id: "11" } }),
    prisma: {
      user: {
        findUnique: async (args: unknown) => {
          calls.user.push(args)
          return { id: 11, config_id: 9, id_grup: 2, pamong_id: 7 }
        },
        findFirst: async (args: unknown) => {
          calls.user.push(args)
          return { id: 11 }
        },
      },
      setting_modul: {
        findFirst: async (args: unknown) => {
          calls.module.push(args)
          return { id: 40 }
        },
      },
      grup_akses: {
        findFirst: async (args: unknown) => {
          calls.access.push(args)
          return null
        },
      },
    } as never,
  })

  assert.deepEqual(await requireAdminAccess("kehadiran_pengajuan_izin", "h"), {
    userId: 11,
    configId: 9,
    groupId: 2,
    pamongId: 7,
    isSuperAdmin: true,
  })
  assert.deepEqual(calls.module, [{ where: { config_id: 9, url: "kehadiran_pengajuan_izin" }, select: { id: true } }])
  assert.deepEqual(calls.user[1], {
    where: { config_id: 9, user_grup: { slug: "administrator" } },
    orderBy: { id: "asc" },
    select: { id: true },
  })
  assert.equal(calls.access.length, 0)
})

test("denies a non-super-admin when its tenant-scoped access record is insufficient", async () => {
  const accessCalls: unknown[] = []
  const requireAdminAccess = createRequireAdminAccess({
    auth: async () => ({ user: { id: "12" } }),
    prisma: {
      user: {
        findUnique: async () => ({ id: 12, config_id: 9, id_grup: 3, pamong_id: null }),
        findFirst: async () => ({ id: 11 }),
      },
      setting_modul: { findFirst: async () => ({ id: 40 }) },
      grup_akses: {
        findFirst: async (args: unknown) => {
          accessCalls.push(args)
          return { akses: 1 }
        },
      },
    } as never,
  })

  await assert.rejects(() => requireAdminAccess("kehadiran_pengajuan_izin", "u"), /Tidak memiliki akses/)
  assert.deepEqual(accessCalls, [
    {
      where: { config_id: 9, id_grup: 3, id_modul: 40 },
      select: { akses: true },
    },
  ])
})

test("denies access when the requested tenant module does not exist", async () => {
  const requireAdminAccess = createRequireAdminAccess({
    auth: async () => ({ user: { id: "12" } }),
    prisma: {
      user: {
        findUnique: async () => ({ id: 12, config_id: 9, id_grup: 3, pamong_id: null }),
        findFirst: async () => ({ id: 11 }),
      },
      setting_modul: { findFirst: async () => null },
      grup_akses: { findFirst: async () => ({ akses: 7 }) },
    } as never,
  })

  await assert.rejects(() => requireAdminAccess("kehadiran_pengajuan_izin", "b"), /Tidak memiliki akses/)
})
