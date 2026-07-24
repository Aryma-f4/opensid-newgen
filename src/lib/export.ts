// Server-side export utilities for OpenSID data.
// Uses XLSX for Excel; PDF generation uses server-side HTML→PDF approach.

// Note: xlsx is optional — if not installed, exportToExcel throws a clear error.
let XLSX: any = null
try {
  XLSX = require("xlsx")
} catch {
  // xlsx not installed — Excel export will error with install instructions
}

export type ExportColumn = {
  key: string
  label: string
  render?: (row: any) => string | number
}

/**
 * Generate Excel (.xlsx) buffer from an array of data.
 *
 * Usage:
 *   const buf = exportToExcel(penduduk, [
 *     { key: "nik", label: "NIK" },
 *     { key: "nama", label: "Nama" },
 *   ], "Data Penduduk")
 *   return new Response(buf, { headers: { "Content-Type": xlsx mime } })
 */
export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  sheetName: string = "Data"
): Buffer {
  if (!XLSX) {
    throw new Error(
      "Excel export requires the 'xlsx' package. Install: npm install xlsx"
    )
  }

  const rows = data.map((item) => {
    const row: Record<string, any> = {}
    for (const col of columns) {
      row[col.label] = col.render ? col.render(item) : item[col.key]
    }
    return row
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Auto-fit column widths
  const colWidths = columns.map((col) => {
    const maxLen = Math.max(
      col.label.length,
      ...rows.map((r) => String(r[col.label] ?? "").length)
    )
    return { wch: Math.min(maxLen + 2, 50) }
  })
  ws["!cols"] = colWidths

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer
}

/**
 * Generate CSV string from data array.
 * Fallback when Excel library unavailable.
 */
export function exportToCsv(
  data: any[],
  columns: ExportColumn[]
): string {
  const header = columns.map((c) => `"${c.label}"`).join(",")
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const val = col.render ? col.render(item) : item[col.key]
        const str = String(val ?? "")
        return `"${str.replace(/"/g, '""')}"`
      })
      .join(",")
  )
  return [header, ...rows].join("\n")
}

/**
 * Generate HTML table string for PDF print (browser's print-to-PDF).
 * OpenSID-style printable document with title, table, and date info.
 */
export function exportToPrintHtml(
  title: string,
  data: any[],
  columns: ExportColumn[],
  subtitle?: string
): string {
  const thead = columns.map((c) => `<th>${c.label}</th>`).join("")
  const trows = data
    .map(
      (item) =>
        `<tr>${columns
          .map((col) => {
            const val = col.render ? col.render(item) : item[col.key]
            return `<td>${val ?? "-"}</td>`
          })
          .join("")}</tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; margin: 2cm; }
  h1 { text-align: center; font-size: 16pt; margin-bottom: 4pt; }
  h2 { text-align: center; font-size: 13pt; font-weight: normal; margin-top: 0; color: #555; }
  table { width: 100%; border-collapse: collapse; margin-top: 1em; }
  th, td { border: 1px solid #000; padding: 4pt 6pt; text-align: left; font-size: 10pt; }
  th { background: #e0e0e0; font-weight: bold; }
  .footer { text-align: center; margin-top: 2em; font-size: 10pt; color: #666; }
  @media print { .no-print { display: none; } }
</style></head><body>
  <h1>${title}</h1>
  ${subtitle ? `<h2>${subtitle}</h2>` : ""}
  <table><thead><tr>${thead}</tr></thead><tbody>${trows || '<tr><td colspan="99" style="text-align:center">Tidak ada data</td></tr>'}</tbody></table>
  <div class="footer">Dicetak dari OpenSID — ${new Date().toLocaleDateString("id-ID")}</div>
  <div class="no-print" style="text-align:center;margin-top:2em">
    <button onclick="window.print()" style="padding:8px 24px;font-size:14px">Cetak / Print</button>
  </div>
</body></html>`
}
