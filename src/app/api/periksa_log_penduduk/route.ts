import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.log_penduduk, { search: ["catatan"], orderBy: { tgl_peristiwa: "desc" as any } })
