"use server"

import { prisma } from "@/lib/prisma"
import { makeActions } from "@/lib/actions"

export const { create, update, delete: del } = makeActions({ delegate: prisma.analisis_indikator, path: "/analisis/indikator", keyField: "id" })
