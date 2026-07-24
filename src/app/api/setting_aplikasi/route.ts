import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.setting_aplikasi, { orderBy: { urut: "asc" as any } })
