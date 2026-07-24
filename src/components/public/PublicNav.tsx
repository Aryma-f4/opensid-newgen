"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"

type MenuItem = {
  id: number
  nama: string
  link?: string | null
  link_tipe?: boolean | null
  children: MenuItem[]
}

const menuIcons = ["fa-home", "fa-user", "fa-university", "fa-id-card", "fa-bar-chart", "fa-scroll", "fa-users", "fa-shopping-bag", "fa-star"]

export default function PublicNav({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false)
  const [subOpen, setSubOpen] = useState<Set<number>>(new Set())
  const navRef = useRef<HTMLElement>(null)

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false)
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, handleKeyDown])

  // Close on click outside
  function closeFromBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) setOpen(false)
  }

  function toggleSub(id: number) {
    setSubOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function closeAndNavigate() {
    setOpen(false)
    setSubOpen(new Set())
  }

  function hrefFor(item: MenuItem) {
    const raw = item.link ?? "#"
    if (!raw || raw === "#") return "#"
    if (item.link_tipe || raw.startsWith("http") || raw.startsWith("/")) return raw
    return `/${raw}`
  }

  return (
    <>
      <nav className="main-nav" ref={navRef} aria-label="Menu utama" data-open={open}>
        <button
          className="nav-ham"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="nav-menu"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <ul className="nav-list" id="nav-menu" role="menubar" aria-hidden={!open}>
          <li role="none">
            <Link className="nav-link active" role="menuitem" href="/" onClick={closeAndNavigate} tabIndex={open ? 0 : -1}>
              <i className="fa fa-home" aria-hidden="true" /><span>Beranda</span>
            </Link>
          </li>
          {items.map((item, idx) => {
            const hasChildren = item.children.length > 0
            const subId = `sub-${item.id}`
            const isSubOpen = subOpen.has(item.id)

            return (
              <li key={item.id} role="none" className={hasChildren ? "has-dropdown" : ""}>
                {hasChildren ? (
                  <>
                    <button
                      className="nav-link nav-toggle-btn"
                      onClick={() => toggleSub(item.id)}
                      aria-expanded={isSubOpen}
                      aria-controls={subId}
                    >
                      <i className={`fa ${menuIcons[(idx + 1) % menuIcons.length]}`} aria-hidden="true" />
                      <span>{item.nama}</span>
                      <i className="fa fa-angle-down nav-caret" aria-hidden="true" />
                    </button>
                    <ul
                      id={subId}
                      className="dropdown-panel"
                      role="menu"
                      data-open={isSubOpen}
                    >
                      {item.children.map((child) => (
                        <li key={child.id} role="none">
                          <Link
                            href={hrefFor(child)}
                            role="menuitem"
                            onClick={closeAndNavigate}
                            tabIndex={open ? 0 : -1}
                          >
                            {child.nama}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    className="nav-link"
                    href={hrefFor(item)}
                    role="menuitem"
                    onClick={closeAndNavigate}
                    tabIndex={open ? 0 : -1}
                  >
                    <i className={`fa ${menuIcons[(idx + 1) % menuIcons.length]}`} aria-hidden="true" />
                    <span>{item.nama}</span>
                  </Link>
                )}
              </li>
            )
          })}
        </ul>

        {/* Backdrop overlay for mobile */}
        {open && <div className="nav-backdrop" onClick={closeFromBackdrop} aria-hidden="true" />}
      </nav>

      <style>{`
        /* ── Mobile nav toggle button ── */
        .nav-ham {
          display: none;
          position: absolute;
          top: 50%;
          right: 14px;
          z-index: 25;
          width: 44px;
          height: 44px;
          padding: 10px;
          border: 0;
          border-radius: 10px;
          background: rgba(255,255,255,.16);
          cursor: pointer;
          transform: translateY(-50%);
          transition: background .22s ease, transform .22s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-ham:hover { background: rgba(255,255,255,.26); }
        .nav-ham:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
        .nav-ham > span {
          display: block;
          width: 100%;
          height: 3px;
          border-radius: 999px;
          background: #fff;
          transition: transform .28s cubic-bezier(.34, 1.56, .64, 1), opacity .18s ease;
        }
        .nav-ham > span:nth-child(2) { margin: 5px 0; }
        .nav-ham[aria-expanded="true"] > span:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
        }
        .nav-ham[aria-expanded="true"] > span:nth-child(2) {
          opacity: 0;
          transform: scaleX(.4);
        }
        .nav-ham[aria-expanded="true"] > span:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
        }

        /* ── Mobile nav list (hidden, slides down) ── */
        .nav-list {
          list-style: none; margin: 0; padding: 0;
          display: flex;
          align-items: stretch;
          gap: 5px;
          padding: 14px;
          transition: none;
        }

        /* ── Desktop nav ── */
        @media (min-width: 761px) {
          .nav-list { display: flex !important; flex-direction: row; }
          .nav-backdrop { display: none !important; }
        }

        /* ── Mobile nav (≤760px) ── */
        @media (max-width: 760px) {
          .nav-ham { display: flex; flex-direction: column; justify-content: center; }

          .main-nav {
            position: relative;
            z-index: 50;
            padding: 8px;
            border-radius: 13px !important;
          }

          .nav-list {
            position: absolute;
            top: calc(100% - 8px);
            left: 0;
            right: 0;
            z-index: 20;
            flex-direction: column;
            gap: 2px;
            padding: 56px 14px 14px;
            margin: 0;
            border-radius: 0 0 13px 13px;
            background: linear-gradient(180deg, #147a44, #00513a);
            box-shadow: 0 24px 40px rgba(0, 40, 22, .32);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-12px);
            transition: opacity .28s ease, visibility .28s ease, transform .32s cubic-bezier(.34, 1.56, .64, 1);
            pointer-events: none;
          }
          .main-nav[data-open="true"] .nav-list {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
            pointer-events: auto;
          }

          .nav-backdrop {
            position: fixed;
            inset: 0;
            z-index: -1;
            background: rgba(0, 20, 12, .44);
            backdrop-filter: blur(2px);
            animation: fadeIn .28s ease;
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

          .nav-link, .nav-toggle-btn {
            height: 48px;
            padding: 0 14px;
            font-size: 14px;
            border-radius: 10px;
          }

          /* Sub-menus as accordion on mobile */
          .has-dropdown .dropdown-panel {
            position: relative !important;
            top: auto !important;
            left: auto !important;
            min-width: 0;
            padding: 0 0 0 16px;
            margin: 0;
            border: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            opacity: 1;
            visibility: visible;
            transform: none;
            overflow: hidden;
            max-height: 0;
            transition: max-height .32s ease, padding .22s ease;
          }
          .has-dropdown .dropdown-panel[data-open="true"] {
            max-height: 400px;
            padding: 4px 0 4px 16px;
          }
          .has-dropdown .dropdown-panel:before { display: none; }
          .dropdown-panel a {
            color: rgba(255,255,255,.88) !important;
            padding: 10px 12px !important;
            border-radius: 8px;
            font-weight: 650 !important;
          }
          .dropdown-panel a:before { background: rgba(255,255,255,.28) !important; }
          .dropdown-panel a:hover,
          .dropdown-panel a:focus {
            background: rgba(255,255,255,.1) !important;
            color: #fff !important;
          }
        }

        /* ── Small phone adjustments ── */
        @media (max-width: 420px) {
          .nav-link, .nav-toggle-btn { height: 44px; font-size: 13px; padding: 0 12px; }
          .nav-ham { width: 40px; height: 40px; padding: 9px; right: 10px; }
          .nav-ham > span:nth-child(2) { margin: 4px 0; }
          .nav-ham[aria-expanded="true"] > span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
          .nav-ham[aria-expanded="true"] > span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        }
      `}</style>
    </>
  )
}
