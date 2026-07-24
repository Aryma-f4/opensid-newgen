"use client"

import { useState } from "react"
import { Box, Btn } from "@/components/admin/Ui"
import { sendSms } from "./actions"

export default function SmsManager() {
  const [tujuan, setTujuan] = useState("")
  const [pesan, setPesan] = useState("")
  const [status, setStatus] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await sendSms({ tujuan, pesan })
      setStatus({ type: "success", message: "SMS berhasil dikirim" })
      setTujuan("")
      setPesan("")
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err.message || "Gagal mengirim SMS",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box title="Kirim SMS">
      <form onSubmit={handleSubmit} className="space-y-4">
        {status && (
          <div
            className={`p-3 rounded text-sm ${
              status.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {status.message}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">
            Nomor Tujuan
          </label>
          <input
            type="text"
            value={tujuan}
            onChange={(e) => setTujuan(e.target.value)}
            placeholder="Contoh: 08123456789"
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pesan</label>
          <textarea
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            placeholder="Tulis pesan..."
            className="w-full border rounded px-3 py-2 text-sm"
            rows={4}
            required
          />
        </div>
        <div className="flex justify-end">
          <Btn type="submit" color="primary" disabled={loading}>
            {loading ? (
              <>
                <i className="fa fa-spinner fa-spin" /> Mengirim...
              </>
            ) : (
              "Kirim"
            )}
          </Btn>
        </div>
      </form>
    </Box>
  )
}
