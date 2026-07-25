export class AdminDomainInputError extends Error {}

type PamongInput = {
  pamong_nama: string
  gelar_depan: string
  gelar_belakang: string
  pamong_nik: string
  pamong_niap: string
  pamong_nip: string
  pamong_pangkat: string
  jabatan_id: number
  pamong_status: 1 | 2
  kehadiran: 0 | 1
}

type LocationInput = {
  nama: string
  desk: string
  ref_point: number
  enabled: 0 | 1
  lat: string | null
  lng: string | null
}

function rejectMarkup(value: string, label: string): string {
  if (value.includes("<") || value.includes(">")) {
    throw new AdminDomainInputError(`${label} tidak boleh memuat markup HTML.`)
  }
  return value
}

function requiredText(
  formData: FormData,
  key: string,
  label: string,
  maxLength: number,
): string {
  const value = String(formData.get(key) ?? "").trim()
  if (!value) throw new AdminDomainInputError(`${label} wajib diisi.`)
  if (value.length > maxLength) {
    throw new AdminDomainInputError(`${label} maksimal ${maxLength} karakter.`)
  }
  return rejectMarkup(value, label)
}

function optionalText(
  formData: FormData,
  key: string,
  label: string,
  maxLength: number,
): string {
  const value = String(formData.get(key) ?? "").trim()
  if (value.length > maxLength) {
    throw new AdminDomainInputError(`${label} maksimal ${maxLength} karakter.`)
  }
  return rejectMarkup(value, label)
}

function positiveInteger(value: FormDataEntryValue | null, message: string): number {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new AdminDomainInputError(message)
  }
  return parsed
}

function binaryValue(
  value: FormDataEntryValue | null,
  message: string,
): 0 | 1 {
  if (value !== "0" && value !== "1") throw new AdminDomainInputError(message)
  return Number(value) as 0 | 1
}

function legacyPamongStatus(value: FormDataEntryValue | null): 1 | 2 {
  if (value !== "1" && value !== "2") {
    throw new AdminDomainInputError("Status pamong tidak valid.")
  }
  return Number(value) as 1 | 2
}

export function parsePamongStatusChange(formData: FormData): 1 | 2 {
  return legacyPamongStatus(formData.get("status"))
}

export function parseBinaryStatusChange(formData: FormData): 0 | 1 {
  return binaryValue(formData.get("status"), "Status tidak valid.")
}

export function parsePamongInput(formData: FormData): PamongInput {
  return {
    pamong_nama: requiredText(formData, "pamong_nama", "Nama pamong", 100),
    gelar_depan: optionalText(formData, "gelar_depan", "Gelar depan", 100),
    gelar_belakang: optionalText(formData, "gelar_belakang", "Gelar belakang", 100),
    pamong_nik: optionalText(formData, "pamong_nik", "NIK", 20),
    pamong_niap: optionalText(formData, "pamong_niap", "NIAP", 25),
    pamong_nip: optionalText(formData, "pamong_nip", "NIP", 20),
    pamong_pangkat: optionalText(formData, "pamong_pangkat", "Pangkat/golongan", 20),
    jabatan_id: positiveInteger(formData.get("jabatan_id"), "Jabatan tidak valid."),
    pamong_status: legacyPamongStatus(formData.get("pamong_status")),
    kehadiran: binaryValue(formData.get("kehadiran"), "Status kehadiran tidak valid."),
  }
}

const decimalCoordinate = /^-?(?:\d+(?:\.\d+)?|\.\d+)$/

function coordinatePair(
  formData: FormData,
): Pick<LocationInput, "lat" | "lng"> {
  const lat = String(formData.get("lat") ?? "").trim()
  const lng = String(formData.get("lng") ?? "").trim()

  if (!lat && !lng) return { lat: null, lng: null }
  if (!lat || !lng) {
    throw new AdminDomainInputError("Latitude dan longitude harus diisi bersamaan.")
  }
  if (!decimalCoordinate.test(lat) || !decimalCoordinate.test(lng)) {
    throw new AdminDomainInputError("Koordinat harus berupa angka desimal.")
  }

  const latitude = Number(lat)
  const longitude = Number(lng)
  if (latitude < -90 || latitude > 90) {
    throw new AdminDomainInputError("Latitude harus berada antara -90 dan 90.")
  }
  if (longitude < -180 || longitude > 180) {
    throw new AdminDomainInputError("Longitude harus berada antara -180 dan 180.")
  }

  return { lat, lng }
}

export function parseLocationInput(formData: FormData): LocationInput {
  return {
    nama: requiredText(formData, "nama", "Nama lokasi", 50),
    desk: requiredText(formData, "desk", "Keterangan lokasi", 65_535),
    ref_point: positiveInteger(formData.get("ref_point"), "Kategori lokasi tidak valid."),
    enabled: binaryValue(formData.get("enabled"), "Status lokasi tidak valid."),
    ...coordinatePair(formData),
  }
}

export function parseAdminRecordId(formData: FormData): number {
  return positiveInteger(formData.get("id"), "Data tidak valid.")
}

function validTenantId(configId: number): number {
  if (!Number.isSafeInteger(configId) || configId <= 0) {
    throw new AdminDomainInputError("Tenant tidak valid.")
  }
  return configId
}

export function tenantScope(configId: number) {
  return { config_id: validTenantId(configId) }
}

export function tenantPamongWhere(pamongId: number, configId: number) {
  if (!Number.isSafeInteger(pamongId) || pamongId <= 0) {
    throw new AdminDomainInputError("Data tidak valid.")
  }
  return { pamong_id: pamongId, ...tenantScope(configId) }
}

export function tenantLocationWhere(id: number, configId: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AdminDomainInputError("Data tidak valid.")
  }
  return { id, ...tenantScope(configId) }
}

export function tenantPointWhere(id: number, configId: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AdminDomainInputError("Data tidak valid.")
  }
  const tenant = validTenantId(configId)
  return {
    id,
    OR: [{ config_id: tenant }, { config_id: null }],
  }
}

export function canDeletePamong(
  dependencyCount: number,
  hasManagedFile = false,
): boolean {
  if (!Number.isSafeInteger(dependencyCount) || dependencyCount < 0) {
    throw new AdminDomainInputError("Jumlah relasi tidak valid.")
  }
  return dependencyCount === 0 && !hasManagedFile
}

export function canDeleteLocation(hasManagedFile: boolean): boolean {
  return !hasManagedFile
}

export function canActivatePamongRole(
  roleKind: number,
  hasActivePeer: boolean,
): boolean {
  return !((roleKind === 1 || roleKind === 2) && hasActivePeer)
}

export function resolvePamongIdentity(input: {
  pamongName: string | null
  pamongNik: string | null
  residentName: string | null
  residentNik: string | null
}) {
  return {
    nama: input.residentName ?? input.pamongName ?? "",
    nik: input.residentNik ?? input.pamongNik ?? "",
  }
}
