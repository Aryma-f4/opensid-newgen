"use client"

import { useState } from "react"

import { Box, Btn, ContentHeader, LteTable, Td, Th } from "@/components/admin/Ui"
import {
  approvalActionMessage,
  type ApprovalActionCode,
} from "@/lib/kehadiranApproval"

import { approveLeaveRequest, rejectLeaveRequest } from "./actions"

export type LeaveApprovalRow = {
  id: string
  requester: string
  leaveType: string
  startDate: string
  endDate: string
  requestNote: string
  status: string
  approver: string | null
  decidedAt: string | null
  decisionNote: string | null
}

type Decision = "approve" | "reject"

const leaveTypeLabels: Record<string, string> = {
  izin: "Izin",
  sakit: "Sakit",
  dinas_luar_kota: "Dinas luar kota",
  cuti: "Cuti",
  lainnya: "Lainnya",
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value))
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function statusLabel(status: string): string {
  if (status === "approved") return "Disetujui"
  if (status === "rejected") return "Ditolak"
  return "Menunggu"
}

function statusClass(status: string): string {
  if (status === "approved") return "label label-success"
  if (status === "rejected") return "label label-danger"
  return "label label-warning"
}

export default function LeaveApprovalManager({
  rows,
  canUpdate,
}: {
  rows: LeaveApprovalRow[]
  canUpdate: boolean
}) {
  const [selected, setSelected] = useState<LeaveApprovalRow | null>(null)
  const [decision, setDecision] = useState<Decision | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  function openDecision(row: LeaveApprovalRow, nextDecision: Decision) {
    setSelected(row)
    setDecision(nextDecision)
    setMessage("")
    setIsError(false)
  }

  function closeDecision() {
    if (submitting) return
    setSelected(null)
    setDecision(null)
  }

  async function submitDecision(formData: FormData) {
    if (!decision) return

    setSubmitting(true)
    setMessage("")
    setIsError(false)
    try {
      const result = decision === "approve"
        ? await approveLeaveRequest(formData)
        : await rejectLeaveRequest(formData)
      setMessage(approvalActionMessage(result.code as ApprovalActionCode))
      setIsError(!result.success)
      if (result.success) {
        setSelected(null)
        setDecision(null)
      }
    } catch {
      setMessage(
        approvalActionMessage(
          decision === "approve" ? "approve_failed" : "reject_failed",
        ),
      )
      setIsError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <ContentHeader
        title="Persetujuan Izin"
        subtitle="Tinjau pengajuan izin perangkat desa"
        breadcrumb={[{ label: "Kehadiran" }, { label: "Persetujuan Izin" }]}
      />
      <Box title={`Persetujuan Izin (${rows.length})`} noPadding>
        {message && !selected && (
          <div
            className={`border-b border-[#f4f4f4] p-3 text-sm ${isError ? "text-red-700" : "text-green-700"}`}
            role={isError ? "alert" : "status"}
          >
            {message}
          </div>
        )}
        <LteTable
          head={
            <>
              <Th>Pemohon</Th>
              <Th>Jenis / Keterangan</Th>
              <Th>Rentang Tanggal</Th>
              <Th>Status</Th>
              <Th>Keputusan</Th>
              <Th className="w-40">Aksi</Th>
            </>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={6} className="py-8 text-center text-gray-400">
                Tidak ada pengajuan izin dalam lingkup persetujuan Anda
              </Td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <Td>{row.requester}</Td>
                <Td>
                  <strong>{leaveTypeLabels[row.leaveType] ?? row.leaveType}</strong>
                  <br />
                  <span className="text-sm text-gray-600">{row.requestNote}</span>
                </Td>
                <Td>
                  {formatDate(row.startDate)}
                  <br />
                  <span className="text-xs text-gray-500">s.d. {formatDate(row.endDate)} (inklusif)</span>
                </Td>
                <Td>
                  <span className={statusClass(row.status)}>{statusLabel(row.status)}</span>
                </Td>
                <Td>
                  {row.decidedAt ? (
                    <>
                      <span>{row.approver ?? "Administrator"}</span>
                      <br />
                      <span className="text-xs text-gray-500">{formatDateTime(row.decidedAt)}</span>
                      {row.decisionNote && (
                        <>
                          <br />
                          <span className="text-xs text-gray-600">{row.decisionNote}</span>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">Belum diputuskan</span>
                  )}
                </Td>
                <Td>
                  {canUpdate && row.status === "pending" ? (
                    <div className="flex gap-1">
                      <Btn
                        color="success"
                        size="xs"
                        onClick={() => openDecision(row, "approve")}
                      >
                        <i className="fa fa-check" aria-hidden="true" /> Setujui
                      </Btn>
                      <Btn
                        color="danger"
                        size="xs"
                        onClick={() => openDecision(row, "reject")}
                      >
                        <i className="fa fa-times" aria-hidden="true" /> Tolak
                      </Btn>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </Td>
              </tr>
            ))
          )}
        </LteTable>
      </Box>

      {selected && decision && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-12">
          <div
            className="mx-4 mb-12 w-full max-w-lg rounded-lg bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-decision-title"
          >
            <form action={submitDecision}>
              <input type="hidden" name="request_id" value={selected.id} />
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 id="leave-decision-title" className="m-0 text-lg font-bold">
                  {decision === "approve" ? "Setujui Pengajuan Izin" : "Tolak Pengajuan Izin"}
                </h2>
                <button
                  type="button"
                  onClick={closeDecision}
                  className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                  aria-label="Tutup formulir"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-4 p-6">
                <p className="m-0 text-sm text-gray-700">
                  {selected.requester}: {formatDate(selected.startDate)} s.d. {formatDate(selected.endDate)}
                </p>
                {message && (
                  <p className="m-0 text-sm text-red-700" role="alert">
                    {message}
                  </p>
                )}
                <div>
                  <label htmlFor="decision_note" className="mb-1 block text-xs text-gray-500">
                    Catatan keputusan (opsional)
                  </label>
                  <textarea
                    id="decision_note"
                    name="decision_note"
                    rows={4}
                    maxLength={1000}
                    className="form-control"
                  />
                  <span className="text-xs text-gray-500">Maksimal 1000 karakter.</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
                <Btn type="button" color="default" onClick={closeDecision} disabled={submitting}>
                  Batal
                </Btn>
                <Btn
                  type="submit"
                  color={decision === "approve" ? "success" : "danger"}
                  disabled={submitting}
                >
                  {submitting
                    ? "Memproses..."
                    : decision === "approve"
                      ? "Setujui"
                      : "Tolak"}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
