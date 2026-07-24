import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

// Catch-all for admin modules not yet ported from CodeIgniter.
// URL parity: original OpenSID serves modules at /{controller}, so this
// matches any unimplemented module URL and shows a stub; unknown URLs 404.
export default async function ModStub({ params }: { params: Promise<{ mod: string[] }> }) {
  const { mod } = await params
  const slugPath = mod.join("/")
  const modul = await prisma.setting_modul.findFirst({
    where: { OR: [{ url: { startsWith: mod[0] } }, { slug: mod[0] }] },
    orderBy: { urut: "asc" },
  })

  if (!modul) notFound()

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
        <i className={`fa ${modul.ikon || "fa-cube"} text-5xl text-gray-300 mb-4`} />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{modul.modul ?? slugPath}</h1>
        <p className="text-gray-500 mb-6">
          Modul ini belum diimplementasikan di versi Next.js.
        </p>
        <div className="flex gap-2 justify-center text-sm">
          <Link href="/beranda" className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">&larr; Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
