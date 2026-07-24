import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.kelompok, {
  search: ["nama", "kode"],
  where: () => ({ tipe: "lembaga" }),
  orderBy: { id: "asc" },
  include: { kelompok_master: { select: { kelompok: true } } },
})
