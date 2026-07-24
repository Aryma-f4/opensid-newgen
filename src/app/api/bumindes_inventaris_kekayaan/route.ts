import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.inventaris_asset, { search: ["nama_barang"], orderBy: { id: "desc" } as any })
