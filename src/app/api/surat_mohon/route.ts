import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.permohonan_surat, { search: ["keterangan"], orderBy: { created_at: "desc" as any } })
