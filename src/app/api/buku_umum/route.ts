import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.kehadiran_hari_libur, { search: ["keterangan"], orderBy: { tanggal: "desc" } })
