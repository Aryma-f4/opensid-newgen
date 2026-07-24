import Link from "next/link"
import { getMenu, getConfig } from "@/lib/helpers"

type MenuItemType = Awaited<ReturnType<typeof getMenu>>[number]

export default async function Navbar() {
  const [menu, config] = await Promise.all([getMenu(), getConfig()])

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span>{config?.nama_desa ?? "OpenSID"}</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {menu.map((item: MenuItemType) => (
              <NavMenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavMenuItem({ item }: { item: MenuItemType }) {
  const hasChildren = item.children?.length > 0
  return (
    <div className="relative group">
      <Link
        href={item.link_tipe ? (item.link ?? "#") : `/${item.link ?? ""}`}
        className="px-3 py-2 text-sm hover:bg-blue-700 rounded transition-colors block"
      >
        {item.nama}
      </Link>
      {hasChildren && (
        <div className="absolute left-0 top-full hidden group-hover:block bg-white text-gray-800 shadow-lg rounded min-w-48 z-50">
          {item.children.map((child: MenuItemType) => (
            <Link
              key={child.id}
              href={child.link_tipe ? (child.link ?? "#") : `/${child.link ?? ""}`}
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              {child.nama}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
