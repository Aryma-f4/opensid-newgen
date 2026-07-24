import { prisma } from "@/lib/prisma"
import { makeCollection } from "@/lib/crud"
export const { GET, POST, DELETE } = makeCollection(prisma.inbox, { search: ["SenderNumber", "TextDecoded"], orderBy: { id: "desc" } })
