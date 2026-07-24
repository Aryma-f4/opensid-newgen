import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const log = await prisma.log_surat.findUnique({
    where: { id: parseInt(id) },
    include: {
      tweb_surat_format: true,
      tweb_penduduk: true,
    },
  })
  if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const config = await prisma.config.findFirst({ orderBy: { id: "asc" } })

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
    sebutan_kepala_desa: sebutanKepalaDesa?.value || "Kepala Desa",
    nama_kepala_desa: namaKepalaDesa?.value || log.nama_pamong || "",
    nip_kepala_desa: nipKepalaDesa?.value || "",
    website: config.website || "",
    email_desa: config.email_desa || "",
  } : null

  let isianData: Record<string, any> = {}
  try {
    if (log.isi_surat) isianData = JSON.parse(log.isi_surat)
    else if (log.isi_surat_temp) isianData = JSON.parse(log.isi_surat_temp)
  } catch {}

  let isianFields: { label: string; id: string }[] = []
  try {
    if (log.tweb_surat_format?.form_isian) {
      isianFields = JSON.parse(log.tweb_surat_format.form_isian)
    }
  } catch {}

  const now = log.tanggal || new Date()
  const tglSekarang = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`
  const formatNama = log.nama_surat || log.tweb_surat_format?.nama || "Surat"
  const penduduk = log.tweb_penduduk

  function renderPendudukData() {
    if (!penduduk) return ""
    return `
      <table class="data-table">
        <tr><td class="label">Nama</td><td>: ${escapeHtml(penduduk.nama || "-")}</td></tr>
        <tr><td class="label">NIK</td><td>: ${escapeHtml(penduduk.nik || "-")}</td></tr>
        <tr><td class="label">Tempat/Tgl Lahir</td><td>: ${escapeHtml(penduduk.tempatlahir || "-")}, ${penduduk.tanggallahir ? new Date(penduduk.tanggallahir).toLocaleDateString("id-ID") : "-"}</td></tr>
        <tr><td class="label">Jenis Kelamin</td><td>: ${penduduk.sex === 1 ? "Laki-laki" : penduduk.sex === 2 ? "Perempuan" : "-"}</td></tr>
        <tr><td class="label">Alamat</td><td>: ${escapeHtml(penduduk.alamat_sekarang || "-")}</td></tr>
      </table>
    `
  }

  function renderIsianFields() {
    return isianFields
      .map((f) => {
        const val = isianData[f.id || f.label]
        if (!val) return ""
        return `<tr><td class="label">${escapeHtml(f.label)}</td><td>: ${escapeHtml(val)}</td></tr>`
      })
      .join("")
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Cetak - ${escapeHtml(formatNama)}</title>
  <style>
    @page { size: legal; margin: 0; }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      padding: 2cm 2.5cm;
      margin: 0;
    }
    .letter-head {
      text-align: center;
      border-bottom: 3px solid #000;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .letter-head:after {
      content: "";
      display: table;
      clear: both;
    }
    .letter-head .logo-wrap {
      float: left;
      width: 90px;
      height: 90px;
      margin-right: 16px;
    }
    .letter-head .logo-wrap img {
      width: 90px;
      height: 90px;
      object-fit: contain;
    }
    .letter-head .head-text {
      margin-left: 106px;
    }
    .letter-head .prov-name {
      font-size: 13pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .letter-head .kec-name {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .letter-head .desa-name {
      font-size: 16pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .letter-head .desa-addr {
      font-size: 10pt;
      margin-top: 2px;
    }
    .letter-title {
      text-align: center;
      font-size: 14pt;
      font-weight: bold;
      text-decoration: underline;
      margin: 28px 0 16px;
    }
    .letter-number {
      text-align: center;
      font-size: 11pt;
      margin-bottom: 24px;
    }
    .data-table {
      margin: 12px 0;
      width: 100%;
    }
    .data-table td {
      padding: 2px 6px;
      vertical-align: top;
    }
    .data-table .label {
      font-weight: 600;
      width: 180px;
    }
    .letter-body {
      text-align: justify;
    }
    .letter-body p {
      text-indent: 1.5em;
      margin: 6px 0;
    }
    .signature-wrap {
      margin-top: 40px;
      display: flex;
      justify-content: flex-end;
    }
    .signature-box {
      text-align: center;
      min-width: 300px;
    }
    .signature-box .sign-tgl {
      font-size: 11pt;
      margin-bottom: 8px;
    }
    .signature-box .sign-jabatan {
      font-size: 11pt;
      margin-bottom: 80px;
    }
    .signature-box .sign-nama {
      font-size: 11pt;
      font-weight: bold;
      text-decoration: underline;
    }
    .signature-box .sign-nip {
      font-size: 10pt;
    }
    .footer-note {
      margin-top: 24px;
      padding-top: 8px;
      border-top: 1px solid #ccc;
      font-size: 9pt;
      color: #666;
      text-align: center;
    }
    .stamp-placeholder {
      width: 70px;
      height: 70px;
      border: 2px dashed #999;
      border-radius: 50%;
      margin: 0 auto 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8pt;
      color: #999;
    }
    .print-btn {
      display: block;
      margin: 16px auto;
      padding: 12px 32px;
      font-size: 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .print-btn:hover { background: #0056b3; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">
    <span style="font-size:18px;margin-right:8px">&#x1F5A8;</span> Cetak Surat (Ctrl+P)
  </button>

  <div class="letter-head">
    ${desa?.logo ? `<div class="logo-wrap"><img src="/storage/${escapeHtml(desa.logo)}" alt="Logo" /></div>` : ""}
    <div class="head-text">
      <div class="prov-name">PEMERINTAH ${escapeHtml(desa?.nama_propinsi || "PROVINSI")}</div>
      <div class="kec-name">KECAMATAN ${escapeHtml(desa?.nama_kecamatan || "")}</div>
      <div class="desa-name">${escapeHtml(desa?.nama_desa || "DESA")}</div>
      <div class="desa-addr">${escapeHtml(desa?.alamat_kantor || "")}</div>
      ${desa?.kode_pos ? `<div class="desa-addr">Kode Pos ${escapeHtml(String(desa.kode_pos))}</div>` : ""}
      ${desa?.website ? `<div class="desa-addr">${escapeHtml(desa.website)}</div>` : ""}
      ${desa?.email_desa ? `<div class="desa-addr">Email: ${escapeHtml(desa.email_desa)}</div>` : ""}
    </div>
  </div>

  <div class="letter-title">${escapeHtml(formatNama)}</div>

  ${log.no_surat ? `<div class="letter-number">Nomor: ${escapeHtml(log.no_surat)}</div>` : ""}

  <div class="letter-body">
    <p>Yang bertanda tangan di bawah ini ${escapeHtml(desa?.nama_kepala_desa || "____________________")}, ${escapeHtml(desa?.sebutan_kepala_desa || "Kepala Desa")} ${escapeHtml(desa?.nama_desa || "Desa")}, menerangkan dengan sesungguhnya bahwa:</p>
    ${penduduk ? renderPendudukData() : ""}
    <p>Berdasarkan keterangan yang ada dan sepanjang pengetahuan kami, orang tersebut di atas adalah benar penduduk ${escapeHtml(desa?.nama_desa || "Desa")}.</p>
    ${isianFields.length > 0 ? `<table class="data-table">${renderIsianFields()}</table>` : ""}
    <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
  </div>

  <div class="signature-wrap">
    <div class="signature-box">
      <div class="sign-tgl">${escapeHtml(desa?.nama_desa || "")}, ${tglSekarang}</div>
      <div class="sign-jabatan">${escapeHtml(desa?.sebutan_kepala_desa || "KEPALA DESA")}</div>

      <div class="stamp-placeholder">Stempel</div>

      <div class="sign-nama">${escapeHtml(desa?.nama_kepala_desa || "____________________")}</div>
      <div class="sign-nip">NIP. ${escapeHtml(desa?.nip_kepala_desa || "")}</div>
    </div>
  </div>

  <div class="footer-note">
    <em>Dokumen ini dicetak dari Sistem Informasi Desa (OpenSID) pada ${tglSekarang} oleh Operator</em>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
