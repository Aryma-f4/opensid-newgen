"use client"

// Client-side export utilities — no server needed.
function extractText(node: any): string {
  if (node === null || node === undefined) return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  return ""
}

function getCellValue(row: any, col: any): string {
  if (col.render) {
    return extractText(col.render(row))
  }
  return String(row[col.key ?? col.label] ?? "")
}

export function exportToCsv(rows: any[], columns: any[]): void {
  const header = columns.map((c) => `"${c.label}"`).join(",")
  const data = rows.map((row) =>
    columns
      .map((col) => `"${getCellValue(row, col).replace(/"/g, '""')}"`)
      .join(",")
  )
  const csv = [header, ...data].join("\n")
  downloadFile(csv, "export.csv", "text/csv;charset=utf-8;")
}

export function exportToExcel(rows: any[], columns: any[], title: string): void {
  // Generate an HTML table that Excel can open
  const header = columns.map((c) => `<th>${c.label}</th>`).join("")
  const body = rows
    .map((row) => `<tr>${columns.map((col) => `<td>${getCellValue(row, col)}</td>`).join("")}</tr>`)
    .join("")

  const html = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${title}</x:Name></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
<body><table>${header ? `<thead><tr>${header}</tr></thead>` : ""}<tbody>${body}</tbody></table></body></html>`

  downloadFile(html, `${title}.xls`, "application/vnd.ms-excel")
}

export function printTable(rows: any[], columns: any[], title: string): void {
  const header = columns.map((c) => `<th>${c.label}</th>`).join("")
  const body = rows
    .map(
      (row) => `<tr>${columns.map((col) => `<td>${getCellValue(row, col)}</td>`).join("")}</tr>`
    )
    .join("")

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; margin: 1.5cm; }
  h1 { text-align: center; font-size: 18pt; margin-bottom: 18pt; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #000; padding: 4pt 8pt; text-align: left; font-size: 10pt; }
  th { background: #e0e0e0; font-weight: bold; }
  .footer { text-align: center; margin-top: 24pt; font-size: 9pt; color: #666; }
  @media print { body { margin: 1.5cm; } }
</style></head><body>
  <h1>${title}</h1>
  <table>${header ? `<thead><tr>${header}</tr></thead>` : ""}<tbody>${body || '<tr><td colspan="99" style="text-align:center">Tidak ada data</td></tr>'}</tbody></table>
  <div class="footer">Dicetak dari OpenSID — ${new Date().toLocaleDateString("id-ID")}</div>
  <script>window.print();window.close();<\/script>
</body></html>`

  const win = window.open("", "_blank")
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
