import { prisma } from "@/lib/prisma"
import { makeItem } from "@/lib/crud"
export const { GET, PUT, DELETE } = makeItem(prisma.sinergi_program)
