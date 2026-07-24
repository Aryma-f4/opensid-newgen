import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.log_surat_dinas, { search: ["no_surat"], orderBy: { tanggal: "desc" as any } })
