import { z } from "zod"

// Common OpenSID field validators — reusable across server actions.
// These mirror the validation rules from PHP controllers.

/** 16-digit NIK (Nomor Induk Kependudukan) */
export const nikSchema = z
  .string()
  .length(16, "NIK harus 16 digit")
  .regex(/^\d{16}$/, "NIK hanya boleh angka")

/** 16-digit No. KK (Kartu Keluarga) */
export const noKkSchema = z
  .string()
  .length(16, "No. KK harus 16 digit")
  .regex(/^\d{16}$/, "No. KK hanya boleh angka")

/** Common required string */
export const namaSchema = z
  .string()
  .min(1, "Wajib diisi")
  .max(100, "Maksimal 100 karakter")

/** Phone number */
export const teleponSchema = z
  .string()
  .regex(/^(\+62|62|0)[0-9]{6,13}$/, "Format telepon tidak valid")
  .optional()
  .or(z.literal(""))

/** Email */
export const emailSchema = z
  .string()
  .email("Format email tidak valid")
  .optional()
  .or(z.literal(""))

/** Year (1900-current+1) */
export const tahunSchema = z
  .number()
  .int("Tahun harus bilangan bulat")
  .min(1900, "Tahun minimal 1900")
  .max(new Date().getFullYear() + 1, "Tahun tidak valid")

/** Positive integer ID */
export const idSchema = z
  .number()
  .int()
  .positive("ID harus positif")

/** Active toggle (0/1) */
export const activeSchema = z
  .number()
  .int()
  .min(0)
  .max(1)

/** Decimal price (untuk produk/inventaris) */
export const hargaSchema = z
  .number()
  .min(0, "Harga tidak boleh negatif")

/** Mengecek apakah field berisi angka positif */
export const positiveInt = z
  .number()
  .int()
  .min(0)

/** Nullable string (default empty → null) */
export const nullableStr = z
  .string()
  .max(255)
  .optional()
  .transform((v) => v?.trim() || null)

/** Generic pagination schema */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(50),
  q: z.string().optional().default(""),
})
