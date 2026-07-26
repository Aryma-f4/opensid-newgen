import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAdminMenu } from "@/lib/adminMenu"
import { getSetting } from "@/lib/helpers"
import { prisma } from "@/lib/prisma"
import Sidebar from "@/components/admin/Sidebar"
import Topbar from "@/components/admin/Topbar"
import { ToastProvider } from "@/components/admin/Toast"

export const dynamic = "force-dynamic"

export const fetchCache = "force-no-store"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/siteman")

  const [menu, config, user, skin] = await Promise.all([
    getAdminMenu(),
    prisma.config.findFirst({ orderBy: { id: "asc" } }),
    prisma.user.findUnique({ where: { id: parseInt(session.user.id!) }, select: { nama: true, foto: true, username: true } }),
    getSetting("warna_tema_admin"),
  ])

  const desa = config
    ? {
        nama_desa: config.nama_desa,
        nama_kecamatan: config.nama_kecamatan,
        nama_kabupaten: config.nama_kabupaten,
        logo: config.logo,
      }
    : null

  return (
    <div id="sidebar_collapse" className={`admin-shell lte ${skin ?? "skin-purple"} sidebar-mini min-h-screen`}>
      <div className="wrapper min-h-screen">
        <Topbar user={user ? { nama: user.nama ?? user.username ?? "Pengguna", foto: user.foto } : null} />
        <Sidebar menu={menu} desa={desa} />

        <div className="content-wrapper">
          <section id="maincontent" className="content">
            <ToastProvider>{children}</ToastProvider>
          </section>
        </div>

        <footer className="main-footer">
          <div className="pull-right hidden-xs">
            <b>Versi</b> newgen
          </div>
          <strong>
            Aplikasi <a href="https://github.com/OpenSID/OpenSID" target="_blank">OpenSID</a>, dikembangkan oleh Komunitas OpenSID.
          </strong>
        </footer>
      </div>
    </div>
  )
}
