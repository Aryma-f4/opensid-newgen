import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.tweb_surat_format, { search: ["nama"], orderBy: { nama: "asc" as any } })
