import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.sinergi_program, { search: ["program"], orderBy: { uuid: "desc" as any } as any })
