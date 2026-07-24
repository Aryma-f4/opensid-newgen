import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.surat_masuk, { search: ["nomor_surat", "pengirim"], orderBy: { id: "desc" } })
