"use client"

import Image from "next/image"
import { useState } from "react"
import QRCode from "qrcode"

import { Box, Btn } from "@/components/admin/Ui"
import {
  IntegrationConfigError,
  parseQrCodeInput,
  QR_CODE_SIZES,
} from "@/lib/integrationConfig"

export default function QrCodeGenerator({ canGenerate }: { canGenerate: boolean }) {
  const [dataUrl, setDataUrl] = useState("")
  const [resultSize, setResultSize] = useState(150)
  const [error, setError] = useState("")
  const [generating, setGenerating] = useState(false)

  async function generate(formData: FormData) {
    setError("")
    setGenerating(true)

    try {
      const input = parseQrCodeInput(formData)
      const result = await QRCode.toDataURL(input.content, {
        width: input.size,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: input.foreground,
          light: "#ffffffff",
        },
      })
      setResultSize(input.size)
      setDataUrl(result)
    } catch (caught) {
      setDataUrl("")
      setError(
        caught instanceof IntegrationConfigError
          ? caught.message
          : "QR Code gagal dibuat pada perangkat ini.",
      )
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Box
        color="info"
        title="Buat QR Code"
        tools={<span className="label label-info">Diproses lokal di browser</span>}
        footer={
          <p className="mb-0 text-xs text-gray-500">
            Isi QR tidak dikirim ke server dan konfigurasi ini tidak disimpan ke basis data.
          </p>
        }
      >
        {!canGenerate && (
          <div className="alert alert-warning">
            Hak ubah pada modul QR Code diperlukan untuk membuat dan mengunduh kode.
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}
        <form action={generate}>
          <fieldset disabled={!canGenerate || generating}>
            <div className="form-group">
              <label htmlFor="qr-content">Isi kode</label>
              <textarea
                id="qr-content"
                name="content"
                className="form-control"
                rows={5}
                maxLength={300}
                required
                placeholder="Teks atau URL yang akan dimuat dalam QR Code"
              />
              <p className="help-block">Maksimal 300 karakter, sesuai batas layar lama.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-group">
                <label htmlFor="qr-size">Ukuran</label>
                <select id="qr-size" name="size" className="form-control" defaultValue="150">
                  {QR_CODE_SIZES.map((size) => (
                    <option key={size} value={size}>{size} × {size} px</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="qr-foreground">Warna depan</label>
                <input
                  id="qr-foreground"
                  name="foreground"
                  type="color"
                  className="form-control"
                  defaultValue="#000000"
                />
              </div>
            </div>

            <Btn color="info" type="submit" disabled={!canGenerate || generating}>
              <i className={`fa ${generating ? "fa-spinner fa-spin" : "fa-qrcode"}`} />{" "}
              {generating ? "Membuat..." : "Buat QR Code"}
            </Btn>
          </fieldset>
        </form>
      </Box>

      <Box color="success" title="Hasil">
        {dataUrl ? (
          <div className="text-center">
            <Image
              unoptimized
              src={dataUrl}
              width={resultSize}
              height={resultSize}
              alt="QR Code hasil"
              className="mx-auto border border-gray-200 p-2"
            />
            <a
              href={dataUrl}
              download="opensid-qrcode.png"
              className="btn btn-success btn-sm mt-4"
            >
              <i className="fa fa-download" /> Unduh PNG
            </a>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <i className="fa fa-qrcode mb-3 block text-6xl" aria-hidden="true" />
            Hasil QR Code akan tampil di sini.
          </div>
        )}
      </Box>
    </div>
  )
}
