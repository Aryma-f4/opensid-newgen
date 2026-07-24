import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"

export const { GET, POST, DELETE } = makeCollection(prisma.lampiran_surat, {
  orderBy: { id: "desc" as any },
  defaultData: () => ({ config_id: 1 }),
})
