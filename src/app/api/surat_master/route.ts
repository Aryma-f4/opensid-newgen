import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.tweb_surat_format, {
  search: ["nama", "kode_surat"],
  orderBy: [{ favorit: "desc" }, { nama: "asc" }],
})
