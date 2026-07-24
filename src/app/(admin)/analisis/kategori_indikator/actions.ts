"use server"

import { prisma } from "@/lib/prisma"
import { makeActions } from "@/lib/actions"

export const { create, update, delete: del } = makeActions({ delegate: prisma.analisis_kategori_indikator, path: "/analisis/kategori_indikator", keyField: "id" })
