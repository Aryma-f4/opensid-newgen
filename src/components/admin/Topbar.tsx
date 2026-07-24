"use client"

import { useState, useEffect } from "react"
import type { MouseEvent } from "react"
import Link from "next/link"

export default function Topbar({ user }: { user: { nama: string; foto?: string | null } | null }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const foto = user?.foto && user.foto !== "kuser.png" ? `/storage/user_pict/${user.foto}` : null

  function isMobile() {
    return window.innerWidth < 760
  }

  function toggleSidebar(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const shell = document.querySelector<HTMLElement>("#sidebar_collapse")
    if (!shell) return

    if (isMobile()) {
      shell.classList.toggle("sidebar-open")
      shell.classList.remove("sidebar-collapsed")
    } else {
      shell.classList.toggle("sidebar-collapsed")
      shell.classList.remove("sidebar-open")
    }
  }

  // Close mobile sidebar when clicking backdrop

  useEffect(() => {
    function handleClick(e: Event) {
      const target = e.target as HTMLElement
      const s = document.getElementById("sidebar_collapse")
      if (!s || !isMobile() || !s.classList.contains("sidebar-open")) return
      if (!target.closest(".main-sidebar") && !target.closest(".sidebar-toggle")) {
        s.classList.remove("sidebar-open")
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  return (
    <header className="main-header">
      <Link href="/" target="_blank" className="logo">
        <span className="logo-mini"><b>SID</b></span>
        <span className="logo-lg"><b>OpenSID</b></span>
      </Link>

      <nav className="navbar navbar-static-top">
        <a href="#" className="sidebar-toggle" role="button" onClick={toggleSidebar}>
          <span className="sr-only">Toggle navigation</span>
        </a>

        <div className="navbar-custom-menu">
          <ul className="nav navbar-nav">
            <li className={`dropdown notifications-menu ${notifOpen ? "open" : ""}`}>
              <a href="#" className="dropdown-toggle" onClick={(event) => { event.preventDefault(); setNotifOpen(!notifOpen); setUserOpen(false) }}>
                <i className="fa fa-bell-o" />
              </a>
              <ul className="dropdown-menu">
                <li className="header">Anda tidak memiliki notifikasi baru</li>
                <li style={{ padding: 10, textAlign: "center", color: "#999", fontSize: 12 }}>
                  Tidak ada notifikasi untuk ditampilkan
                </li>
                <li className="footer"><Link href="/notifikasi">Selengkapnya...</Link></li>
              </ul>
            </li>

            <li className={`dropdown user user-menu ${userOpen ? "open" : ""}`}>
              <a href="#" className="dropdown-toggle" onClick={(event) => { event.preventDefault(); setUserOpen(!userOpen); setNotifOpen(false) }}>
                {foto ? (
                  <img src={foto} className="user-image" alt="User" />
                ) : (
                  <span className="user-image img-circle bg-maroon text-center" style={{ lineHeight: "25px" }}>{user?.nama?.[0] ?? "U"}</span>
                )}
                <span className="hidden-xs">{user?.nama ?? "Pengguna"}</span>
              </a>
              <ul className="dropdown-menu">
                <li className="user-header">
                  {foto ? (
                    <img src={foto} className="img-circle" alt="User" />
                  ) : (
                    <div className="img-circle bg-maroon text-center center-block" style={{ width: 90, height: 90, lineHeight: "90px", color: "#fff", fontSize: 32 }}>
                      {user?.nama?.[0] ?? "U"}
                    </div>
                  )}
                  <p>
                    <small>Anda Masuk Sebagai</small>
                    {user?.nama ?? "Pengguna"}
                  </p>
                </li>
                <li className="user-footer">
                  <div className="pull-left">
                    <Link href="/pengguna" className="btn bg-maroon btn-sm">Profil</Link>
                  </div>
                  <div className="pull-right">
                    <Link href="/siteman/logout" className="btn bg-maroon btn-sm">Keluar</Link>
                  </div>
                </li>
              </ul>
            </li>

            <li>
              <a href="#" title="Informasi"><i className="fa fa-question-circle fa-lg" /></a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
