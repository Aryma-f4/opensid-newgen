import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.log_keluarga, { search: ["id_kk"], orderBy: { tgl_peristiwa: "desc" as any } })
