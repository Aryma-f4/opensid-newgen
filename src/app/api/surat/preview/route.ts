import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const formatId = parseInt(body.id_format_surat)
  const isianData = body.isian || {}

  if (!formatId) return NextResponse.json({ error: "Format surat diperlukan" }, { status: 400 })

  // Load surat format and config
  const [format, config] = await Promise.all([
    prisma.tweb_surat_format.findUnique({ where: { id: formatId } }),
    prisma.config.findFirst({ orderBy: { id: "asc" } }),
  ])

  if (!format) return NextResponse.json({ error: "Format tidak ditemukan" }, { status: 404 })

  // Load penduduk data if provided
  let penduduk: any = null
  if (body.id_pend) {
    penduduk = await prisma.tweb_penduduk.findUnique({
      where: { id: parseInt(body.id_pend) },
    })
  }

  // Fetch kepala_desa info from settings
  const [sebutanKepalaDesa, namaKepalaDesa, nipKepalaDesa] = await Promise.all([
    prisma.setting_aplikasi.findFirst({ where: { key: "sebutan_kepala_desa" } }),
    prisma.setting_aplikasi.findFirst({ where: { key: "nama_kepala_desa" } }),
    prisma.setting_aplikasi.findFirst({ where: { key: "nip_kepala_desa" } }),
  ])

  const desa = config ? {
    nama_desa: config.nama_desa || "Desa",
    alamat_kantor: config.alamat_kantor || "",
    nama_kecamatan: config.nama_kecamatan || "",
    nama_kabupaten: config.nama_kabupaten || "",
    nama_propinsi: config.nama_propinsi || "",
    kode_pos: config.kode_pos?.toString() || "",
    logo: config.logo || "",
    website: config.website || "",
    email_desa: config.email_desa || "",
    sebutan_kepala_desa: sebutanKepalaDesa?.value || "Kepala Desa",
    nama_kepala_desa: body.nama_pamong || namaKepalaDesa?.value || "",
    nip_kepala_desa: nipKepalaDesa?.value || "",
  } : null

  // Build isian field labels
  let isianFields: { label: string; id: string }[] = []
  try {
    if (format.form_isian) {
      isianFields = JSON.parse(format.form_isian)
    }
  } catch {}

  // Build the letter body
  const now = new Date()
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
  const tglSekarang = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`

  function renderLetterContent(): string {
    // Basic letter template that will be shown
    const pendudukHtml = penduduk ? `
      <table class="penduduk-data">
        <tr><td class="label" style="width:140px">Nama</td><td>: ${escapeHtml(penduduk.nama || "")}</td></tr>
        <tr><td class="label">NIK</td><td>: ${escapeHtml(penduduk.nik || "-")}</td></tr>
        <tr><td class="label">Tempat/Tgl Lahir</td><td>: ${escapeHtml(penduduk.tempatlahir || "")}, ${penduduk.tanggallahir ? new Date(penduduk.tanggallahir).toLocaleDateString("id-ID") : "-"}</td></tr>
        <tr><td class="label">Jenis Kelamin</td><td>: ${penduduk.sex === 1 ? "Laki-laki" : penduduk.sex === 2 ? "Perempuan" : "-"}</td></tr>
        <tr><td class="label">Alamat</td><td>: ${escapeHtml(penduduk.alamat_sekarang || "")}</td></tr>
      </table>
    ` : ""

    const isianHtml = isianFields.length > 0 ? `
      <table class="isian-data">
        ${isianFields.map((f: any) => `
          <tr><td class="label" style="width:200px">${escapeHtml(f.label || f.id || f)}</td><td>: ${escapeHtml(isianData[f.id || f] || "(isi)")}</td></tr>
        `).join("")}
      </table>
    ` : ""

    return `
      <div class="letter-content">
        <p>Yang bertanda tangan di bawah ini ${escapeHtml(desa?.nama_kepala_desa || "____________________")}, ${escapeHtml(desa?.sebutan_kepala_desa || "Kepala Desa")} ${escapeHtml(desa?.nama_desa || "Desa")}, menerangkan bahwa:</p>
        ${pendudukHtml}
        <p>Berdasarkan keterangan yang ada dan sepanjang pengetahuan kami, orang tersebut di atas adalah benar penduduk ${escapeHtml(desa?.nama_desa || "Desa")}.</p>
        ${isianHtml}
        <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
      </div>
    `
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(format.nama)}</title>
  <style>
    @page { size: legal; margin: 2cm 2.5cm; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000; }
    .letter-head {
      text-align: center;
      border-bottom: 3px solid #000;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .letter-head .logo {
      float: left;
      width: 80px;
      height: 80px;
      margin-right: 16px;
    }
    .letter-head .logo img { width: 80px; height: 80px; object-fit: contain; }
    .letter-head .desa-name {
      font-size: 16pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .letter-head .desa-address {
      font-size: 10pt;
      margin-top: 4px;
    }
    .letter-title {
      text-align: center;
      font-size: 14pt;
      font-weight: bold;
      text-decoration: underline;
      margin: 24px 0 16px;
    }
    .letter-number {
      text-align: center;
      font-size: 11pt;
      margin-bottom: 20px;
    }
    .penduduk-data, .isian-data {
      margin: 12px 0;
    }
    .penduduk-data td, .isian-data td {
      padding: 2px 6px;
      vertical-align: top;
    }
    .penduduk-data .label, .isian-data .label {
      font-weight: 600;
    }
    .letter-content {
      text-align: justify;
    }
    .letter-content p {
      text-indent: 1.5em;
      margin: 8px 0;
    }
    .signature-section {
      margin-top: 40px;
      text-align: right;
    }
    .signature-section .sign-date {
      font-size: 11pt;
      margin-bottom: 8px;
    }
    .signature-section .sign-title {
      font-size: 11pt;
      margin-bottom: 80px;
    }
    .signature-section .sign-name {
      font-size: 11pt;
      font-weight: bold;
      text-decoration: underline;
    }
    .signature-section .sign-nip {
      font-size: 10pt;
    }
    .letter-footer {
      margin-top: 30px;
      border-top: 1px solid #ccc;
      padding-top: 8px;
      font-size: 10pt;
      color: #555;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="letter-head">
    ${desa?.logo ? `<div class="logo"><img src="/storage/${escapeHtml(desa.logo)}" alt="Logo" /></div>` : ""}
    <div class="desa-name">PEMERINTAH ${escapeHtml(desa?.nama_propinsi || "PROVINSI")}</div>
    <div class="desa-name">KECAMATAN ${escapeHtml(desa?.nama_kecamatan || "")}</div>
    <div class="desa-name" style="font-size:18pt">${escapeHtml(desa?.nama_desa || "DESA")}</div>
    <div class="desa-address">${escapeHtml(desa?.alamat_kantor || "")}</div>
    ${desa?.kode_pos ? `<div class="desa-address">Kode Pos ${escapeHtml(desa.kode_pos)}</div>` : ""}
  </div>

  <div class="letter-title">${escapeHtml(format.nama)}</div>

  ${body.no_surat ? `<div class="letter-number">Nomor: ${escapeHtml(body.no_surat)}</div>` : ""}

  ${renderLetterContent()}

  <div class="signature-section">
    <div class="sign-date">${escapeHtml(desa?.nama_desa || "Desa")}, ${tglSekarang}</div>
    <div class="sign-title">${isianData["an_kepala_desa"] || "a.n. " + (desa?.sebutan_kepala_desa || "KEPALA DESA")}</div>
    <div class="sign-name">${escapeHtml(body.nama_pamong || desa?.nama_kepala_desa || "____________________")}</div>
    <div class="sign-nip">NIP. ${escapeHtml(body.nama_pamong ? body.nip_pamong || "" : desa?.nip_kepala_desa || "")}</div>
  </div>

  <div class="letter-footer">
    <em>Dokumen ini dicetak dari Sistem Informasi Desa (OpenSID)</em>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
