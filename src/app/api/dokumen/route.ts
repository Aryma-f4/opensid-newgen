import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.dokumen, {
  search: ["nama"],
  where: () => ({ deleted: false }),
  orderBy: { tgl_upload: "desc" },
})
