export class BukuTamuConfigInputError extends Error {}

function requiredText(formData: FormData, field: string, label: string, maxLength?: number): string {
  const rawValue = formData.get(field)
  const value = typeof rawValue === "string" ? rawValue.trim() : ""

  if (!value) throw new BukuTamuConfigInputError(`${label} wajib diisi.`)
  if (maxLength && value.length > maxLength) {
    throw new BukuTamuConfigInputError(`${label} maksimal ${maxLength} karakter.`)
  }

  return value
}

function statusFrom(formData: FormData): boolean {
  const status = formData.get("status")
  if (status === "1") return true
  if (status === "0") return false
  throw new BukuTamuConfigInputError("Status tidak valid.")
}

function positiveSafeInteger(value: FormDataEntryValue | null, message: string): number {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new BukuTamuConfigInputError(message)
  }

  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed)) throw new BukuTamuConfigInputError(message)
  return parsed
}

export function parseQuestionInput(formData: FormData) {
  return {
    pertanyaan: requiredText(formData, "pertanyaan", "Pertanyaan"),
    status: statusFrom(formData),
  }
}

export function parseNeedInput(formData: FormData) {
  return {
    keperluan: requiredText(formData, "keperluan", "Keperluan", 100),
    status: statusFrom(formData),
  }
}

export function parseConfigRecordId(formData: FormData): number {
  return positiveSafeInteger(formData.get("id"), "Data tidak valid.")
}

export function tenantOwnedWhere(id: number, configId: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new BukuTamuConfigInputError("Data tidak valid.")
  }
  if (!Number.isSafeInteger(configId) || configId <= 0) {
    throw new BukuTamuConfigInputError("Tenant tidak valid.")
  }

  return { id, config_id: configId }
}

export function canDeleteQuestion(hasResponses: boolean): boolean {
  return !hasResponses
}

export function satisfactionPageWindow(requestedPage: string | undefined, total: number) {
  const pageSize = 50
  const parsedPage = requestedPage && /^[1-9]\d*$/.test(requestedPage)
    ? Number(requestedPage)
    : 1
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const page = Number.isSafeInteger(parsedPage) ? Math.min(parsedPage, pages) : 1

  return {
    page,
    pages,
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}
