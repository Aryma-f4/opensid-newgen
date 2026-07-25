import Link from "next/link"

const boxClass = {
  default: "box-default",
  primary: "box-primary",
  success: "box-success",
  info: "box-info",
  warning: "box-warning",
  danger: "box-danger",
}

export function ContentHeader({ title, subtitle, breadcrumb }: { title: string; subtitle?: string; breadcrumb?: { label: string; href?: string }[] }) {
  return (
    <section className="content-header">
      <h1>
        {title}
        {subtitle && <small>{subtitle}</small>}
      </h1>
      <ol className="breadcrumb">
        <li>
          <Link href="/beranda"><i className="fa fa-dashboard" /> Beranda</Link>
        </li>
        {(breadcrumb ?? []).map((item, index) => (
          <li key={index} className={!item.href ? "active" : undefined}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Box({ title, tools, footer, color = "default", children, noPadding }: {
  title?: React.ReactNode
  tools?: React.ReactNode
  footer?: React.ReactNode
  color?: keyof typeof boxClass
  noPadding?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={`box ${boxClass[color]}`}>
      {(title || tools) && (
        <div className="box-header with-border">
          <h3 className="box-title">{title}</h3>
          {tools && <div className="box-tools pull-right">{tools}</div>}
        </div>
      )}
      <div className={noPadding ? "box-body no-padding" : "box-body"}>{children}</div>
      {footer && <div className="box-footer">{footer}</div>}
    </div>
  )
}

const smallBoxClass = {
  aqua: "bg-aqua",
  green: "bg-green",
  yellow: "bg-yellow",
  red: "bg-red",
  purple: "bg-purple",
  blue: "bg-blue",
}

const smallBoxContainmentStyle = {
  overflow: "hidden",
  isolation: "isolate",
} as const

export function SmallBox({ value, label, icon, color, href }: {
  value: React.ReactNode
  label: string
  icon: string
  color: keyof typeof smallBoxClass
  href?: string
}) {
  return (
    <div style={smallBoxContainmentStyle} className={`small-box ${smallBoxClass[color]}`}>
      <div className="inner">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
      <div className="icon">
        <i className={`fa ${icon}`} />
      </div>
      {href ? (
        <Link href={href} className="small-box-footer">
          Lihat Detail <i className="fa fa-arrow-circle-right" />
        </Link>
      ) : (
        <span className="small-box-footer">&nbsp;</span>
      )}
    </div>
  )
}

export function LteTable({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="table-responsive table-responsive-mobile">
      <table className="table table-bordered table-striped table-hover">
        <thead>
          <tr>{head}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Th({ children, className = "", ...rest }: { children?: React.ReactNode; className?: string } & React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={className} {...rest}>{children}</th>
}

export function Td({ children, className = "", ...rest }: { children?: React.ReactNode; className?: string } & React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={className} {...rest}>{children}</td>
}

const btnClass = {
  primary: "btn-primary",
  success: "btn-success",
  info: "btn-info",
  warning: "btn-warning",
  danger: "btn-danger",
  default: "btn-default",
}

export function BtnLink({ href, color = "default", size = "sm", className = "", children }: {
  href: string
  color?: keyof typeof btnClass
  size?: "xs" | "sm"
  className?: string
  children: React.ReactNode
}) {
  return <Link href={href} className={`btn ${btnClass[color]} btn-${size} ${className}`}>{children}</Link>
}

export function Btn({ color = "default", size = "sm", type = "button", children, ...rest }: {
  color?: keyof typeof btnClass
  size?: "xs" | "sm"
  type?: "button" | "submit"
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...buttonProps } = rest
  return <button type={type} className={`btn ${btnClass[color]} btn-${size} ${className ?? ""}`} {...buttonProps}>{children}</button>
}

export function Paging({ base, page, pages, q, extraParams }: { base: string; page: number; pages: number; q?: string; extraParams?: Record<string, string | undefined> }) {
  if (pages <= 1) return null
  const around = Array.from({ length: pages }, (_, index) => index + 1).filter((item) => item === 1 || item === pages || Math.abs(item - page) <= 3)

  function buildUrl(p: number): string {
    const params = new URLSearchParams()
    params.set("page", String(p))
    if (q) params.set("q", q)
    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => {
        if (v !== undefined && v !== "") params.set(k, v)
      })
    }
    return `${base}?${params.toString()}`
  }

  return (
    <div className="text-center">
      <ul className="pagination pagination-sm">
        {around.map((item) => (
          <li key={item} className={item === page ? "active" : undefined}>
            <Link href={buildUrl(item)}>{item}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function StatusLabel({ ok, yes = "Aktif", no = "Non-aktif" }: { ok: boolean; yes?: string; no?: string }) {
  return ok ? <span className="label label-success">{yes}</span> : <span className="label label-default">{no}</span>
}

// ──────────────────────────────────────────
// Detail key-value table (for show/detail views)

export function DetailTable({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped table-hover">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td className="w-48 text-gray-500 align-top py-2 px-3 font-medium">{label}</td>
              <td className="py-2 px-3">{value ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ──────────────────────────────────────────
// Search form with optional date range

export function SearchForm({
  q,
  placeholder = "Cari...",
  dateFrom,
  dateTo,
  children,
}: {
  q?: string
  placeholder?: string
  dateFrom?: string
  dateTo?: string
  children?: React.ReactNode
}) {
  return (
    <form className="p-3 flex flex-wrap gap-2 items-end border-b border-[#f4f4f4]">
      <div className="min-w-[200px] flex-1 max-w-xs">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder={placeholder}
          className="form-control input-sm"
        />
      </div>
      {dateFrom !== undefined && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Dari</label>
          <input type="date" name="tgl_from" defaultValue={dateFrom} className="form-control input-sm" />
        </div>
      )}
      {dateTo !== undefined && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sampai</label>
          <input type="date" name="tgl_to" defaultValue={dateTo} className="form-control input-sm" />
        </div>
      )}
      <button type="submit" className="btn btn-primary btn-sm">
        <i className="fa fa-search" /> Cari
      </button>
      {q && (
        <a href="." className="text-sm text-gray-500 hover:underline self-center">
          Reset
        </a>
      )}
      {children}
    </form>
  )
}

// ──────────────────────────────────────────
// Select filter dropdown (inline)

export function SelectFilter({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string
  label?: string
  options: { value: string | number; label: string }[]
  value?: string | number
  onChange?: (value: string) => void
}) {
  return (
    <div className="min-w-[160px]">
      {label && <label className="block text-xs text-gray-500 mb-1">{label}</label>}
      <select
        name={name}
        defaultValue={String(value ?? "")}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="form-control input-sm"
      >
        <option value="">{label ? `Semua ${label}` : "Semua"}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ──────────────────────────────────────────
// Confirm dialog — wraps browser confirm for now, upgradeable to modal

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  children,
}: {
  message: string
  onConfirm: () => void
  onCancel?: () => void
  children: React.ReactNode
}) {
  return (
    <span
      onClick={(e) => {
        e.preventDefault()
        if (window.confirm(message)) onConfirm()
        else onCancel?.()
      }}
    >
      {children}
    </span>
  )
}
