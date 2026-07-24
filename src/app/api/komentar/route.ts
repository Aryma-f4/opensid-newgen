import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.komentar, {
  search: ["owner", "komentar"],
  where: () => ({ jenis: null, is_archived: false }),
  orderBy: { tgl_upload: "desc" },
  include: { artikel: { select: { id: true, judul: true } } },
})
