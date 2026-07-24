import { prisma } from "@/lib/prisma"
import { makeItem } from "@/lib/crud"
export const { GET, PUT, DELETE } = makeItem(prisma.kader_pemberdayaan_masyarakat)
