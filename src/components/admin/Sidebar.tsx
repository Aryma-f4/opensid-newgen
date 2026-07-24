"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Modul } from "@/lib/adminMenu"
import { mapRoute } from "@/lib/adminMenu"

function closeMobileSidebar() {
  const shell = document.querySelector<HTMLElement>("#sidebar_collapse")
  if (shell && window.innerWidth < 760) {
    shell.classList.remove("sidebar-open")
  }
}

type DesaInfo = {
  nama_desa: string
  nama_kecamatan?: string | null
  nama_kabupaten?: string | null
  logo?: string | null
}

export default function AdminSidebar({ menu, desa }: { menu: Modul[]; desa: DesaInfo | null }) {
  const pathname = usePathname()
  const [query, setQuery] = useState("")
  const [openIds, setOpenIds] = useState<Set<number>>(new Set())

  function match(item: Modul): boolean {
    if (!query) return true
    const needle = query.toLowerCase()
    return item.modul.toLowerCase().includes(needle) || item.children.some(match)
  }

  function renderItems(items: Modul[]): React.ReactNode {
    return items.filter(match).map((item) => {
      const route = mapRoute(item.url)
      const hasChildren = item.children.length > 0
      const active = route ? pathname === route || pathname.startsWith(route + "/") : false
      const childActive = item.children.some((child) => {
        const childRoute = mapRoute(child.url)
        return childRoute ? pathname === childRoute || pathname.startsWith(childRoute + "/") : false
      })
      const open = Boolean(query) || active || childActive || openIds.has(item.id)

      function toggleOpen() {
        setOpenIds((current) => {
          const next = new Set(current)
          if (next.has(item.id)) next.delete(item.id)
          else next.add(item.id)
          return next
        })
      }

      if (hasChildren) {
        return (
          <li key={item.id} className={`treeview ${active || childActive ? "active" : ""} ${open ? "menu-open" : ""}`}>
            <Link
              href={route ?? "#"}
              onClick={(event) => {
                event.preventDefault()
                toggleOpen()
              }}
              aria-expanded={open}
            >
              <i className={`fa ${item.ikon || "fa-circle-o"} ${active || childActive ? "text-aqua" : ""}`} />
              <span>{item.modul}</span>
              <span className="pull-right-container">
                <i className="fa fa-angle-left pull-right" />
              </span>
            </Link>
            <ul className="treeview-menu" style={{ display: open ? "block" : undefined }}>
              {item.children.filter(match).map((child) => {
                const childRoute = mapRoute(child.url)
                const childIsActive = childRoute ? pathname === childRoute || pathname.startsWith(childRoute + "/") : false
                return (
                  <li key={child.id} className={childIsActive ? "active" : ""}>
                    <Link href={childRoute ?? "#"} onClick={closeMobileSidebar}>
                      <i className={`fa ${child.ikon || "fa-circle-o"} ${childIsActive ? "text-red" : ""}`} />
                      {child.modul}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        )
      }

      return (
        <li key={item.id} className={active ? "active" : ""}>
          <Link href={route ?? "#"} onClick={closeMobileSidebar}>
            <i className={`fa ${item.ikon || "fa-circle-o"} ${active ? "text-aqua" : ""}`} />
            <span>{item.modul}</span>
            <span className="pull-right-container" />
          </Link>
        </li>
      )
    })
  }

  return (
    <aside className="main-sidebar">
      <section className="sidebar">
        <div className="user-panel">
          <div className="pull-left image">
            {desa?.logo ? (
              <img src={`/storage/desa/logo/${desa.logo}`} className="img-circle" alt="Logo desa" />
            ) : (
              <div className="img-circle bg-gray text-center" style={{ width: 45, height: 45, lineHeight: "45px" }}>
                <i className="fa fa-institution" />
              </div>
            )}
          </div>
          <div className="pull-left info">
            <strong>Desa {desa?.nama_desa ?? "OpenSID"}</strong>
            <br />
            <span>Kec. {desa?.nama_kecamatan ?? "-"}</span>
            <br />
            <span>Kab. {desa?.nama_kabupaten ?? "-"}</span>
          </div>
        </div>

        <div className="sidebar-form">
          <div className="input-group mb-0">
            <input
              type="text"
              className="form-control"
              placeholder="Pencarian..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span className="input-group-btn">
              <button type="button" name="search" className="btn btn-sm">
                <i className="fa fa-search" />
              </button>
            </span>
          </div>
        </div>

        <ul className="sidebar-menu" data-widget="tree">
          <li className="header">MENU UTAMA</li>
          {renderItems(menu)}
        </ul>
      </section>
    </aside>
  )
}
