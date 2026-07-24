import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.tweb_rtm, {
  search: ["no_kk"],
  orderBy: { id: "desc" },
  include: { tweb_penduduk: { select: { nama: true, nik: true, id: true } } },
})
