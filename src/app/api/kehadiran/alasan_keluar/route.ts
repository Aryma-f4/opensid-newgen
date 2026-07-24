import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.kehadiran_alasan_keluar, { orderBy: { id: "desc" } })
