"use server"

import { prisma } from "./prisma"
import { auth } from "./auth"
import { revalidatePath } from "next/cache"

// Ponytail: generic server action factory matching the Kategori/actions.ts pattern.
// Generates create/update/delete/toggle/reorder actions for any Prisma model.
// Each action checks auth; each mutation calls revalidatePath.

type Delegate = {
  create: (args: any) => Promise<any>
  update: (args: { where: any; data: any }) => Promise<any>
  delete: (args: { where: any }) => Promise<any>
  deleteMany: (args: { where: any }) => Promise<any>
  findUnique: (args: any) => Promise<any>
}

type ActionConfig = {
  /** Prisma delegate — e.g. prisma.kategori */
  delegate: Delegate
  /** Path to revalidate after mutations — e.g. "/kategori" */
  path: string
  /** Field name used for unique lookup in delete — default "id" */
  keyField?: string
  /** Transform input before create/update (e.g. generate slug) */
  transform?: (data: any) => any
  /** Validate input before create/update — return string error message or null */
  validate?: (data: any) => string | null
  /** Extra config_id to attach to created records */
  configId?: number
}

/**
 * Generic action factory — creates consistent CRUD server actions.
 *
 * Usage:
 *   export const { create, update, delete: del, toggle } = makeActions({
 *     delegate: prisma.kategori,
 *     path: "/kategori",
 *     transform: (d) => ({ ...d, slug: d.slug || slugify(d.kategori) }),
 *   })
 */
export function makeActions(cfg: ActionConfig) {
  const key = cfg.keyField ?? "id"

  async function checkAuth() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")
    return session
  }

  async function create(data: any) {
    await checkAuth()
    if (cfg.validate) {
      const err = cfg.validate(data)
      if (err) throw new Error(err)
    }
    const payload = cfg.transform ? cfg.transform(data) : data
    await (cfg.delegate as any).create({ data: payload })
    revalidatePath(cfg.path)
    return { success: true }
  }

  async function update(id: number | string, data: any) {
    await checkAuth()
    if (cfg.validate) {
      const err = cfg.validate(data)
      if (err) throw new Error(err)
    }
    const payload = cfg.transform ? cfg.transform(data) : data
    await (cfg.delegate as any).update({ where: { [key]: id }, data: payload })
    revalidatePath(cfg.path)
    return { success: true }
  }

  async function del(ids: number[] | number) {
    await checkAuth()
    const toDelete = Array.isArray(ids) ? ids : [ids]
    if (toDelete.length === 0) return { success: true }
    await (cfg.delegate as any).deleteMany({ where: { [key]: { in: toDelete } } })
    revalidatePath(cfg.path)
    return { success: true }
  }

  async function toggle(id: number, currentValue: number, field: string = "enabled") {
    await checkAuth()
    await (cfg.delegate as any).update({
      where: { [key]: id },
      data: { [field]: currentValue === 1 ? 0 : 1 },
    })
    revalidatePath(cfg.path)
    return { success: true }
  }

  async function reorder(orderedIds: number[]) {
    await checkAuth()
    await Promise.all(
      orderedIds.map((id, index) =>
        (cfg.delegate as any).update({
          where: { [key]: id },
          data: { urut: index + 1 },
        })
      )
    )
    revalidatePath(cfg.path)
    return { success: true }
  }

  return { create, update, delete: del, toggle, reorder }
}

// ──────────────────────────────────────────
// Higher-level helpers for common OpenSID patterns

type BulkActionResult<T = any> = { success: true; data?: T } | { success: false; error: string }

/** Generic slugifier matching OpenSID convention */
export function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
