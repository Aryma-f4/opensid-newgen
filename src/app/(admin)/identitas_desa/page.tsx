import { prisma } from "@/lib/prisma"
import { ContentHeader, Box } from "@/components/admin/Ui"
import IdentitasDesaManager from "./Manager"

export const dynamic = "force-dynamic"

// Parity with original Identitas_desa controller: profil/identitas desa dari tabel config.
export default async function IdentitasDesaPage() {
  const config = await prisma.config.findFirst({ where: { app_key: { not: "" } } })

  return (
    <div>
      <ContentHeader title="Identitas Desa" breadcrumb={[{ label: "Pengaturan" }, { label: "Identitas Desa" }]} />

      <Box title="Profil Desa" noPadding>
        <IdentitasDesaManager config={config} />
      </Box>
    </div>
  )
}
