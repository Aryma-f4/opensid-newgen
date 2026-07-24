import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ContentHeader } from "@/components/admin/Ui"
import PenggunaManager from "./Manager"

export const dynamic = "force-dynamic"

// Parity with original Pengguna controller: profil pengguna yang sedang login.
export default async function PenggunaPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/siteman")

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    include: { user_grup: { select: { nama: true } } },
  })
  if (!user) redirect("/siteman")

  return (
    <div>
      <ContentHeader title="Profil Pengguna" breadcrumb={[{ label: "Pengguna" }]} />

      <div className="max-w-xl bg-white rounded-[3px] shadow-[0_1px_1px_rgba(0,0,0,0.1)] border-t-[3px] border-lte-primary">
        <PenggunaManager
          user={{
            id: user.id,
            username: user.username,
            nama: user.nama,
            email: user.email,
            phone: user.phone,
            foto: user.foto,
            grup: user.user_grup?.nama ?? null,
            last_login: user.last_login?.toLocaleString("id-ID") ?? null,
          }}
        />
      </div>
    </div>
  )
}
