import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.program_peserta, {
  orderBy: { id: "desc" },
  include: { program: { select: { nama: true } } },
})
