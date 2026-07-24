import { prisma } from "@/lib/prisma"
import ManUserManager from "./Manager"

export const dynamic = "force-dynamic"

export default async function ManUserPage() {
  const [users, grup] = await Promise.all([
    prisma.user.findMany({
      orderBy: { id: "asc" },
      include: { user_grup: { select: { nama: true } } },
    }),
    prisma.user_grup.findMany({ orderBy: { nama: "asc" } }),
  ])

  const data = users.map((u) => ({
    id: u.id,
    username: u.username,
    nama: u.nama,
    email: u.email,
    id_grup: u.id_grup,
    active: u.active,
    last_login: u.last_login,
    grup: u.user_grup?.nama ?? null,
  }))

  return <ManUserManager data={data} grupRef={grup} />
}
