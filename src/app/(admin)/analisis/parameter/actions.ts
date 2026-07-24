"use server"

import { prisma } from "@/lib/prisma"
import { makeActions } from "@/lib/actions"

export const { create, update, delete: del } = makeActions({ delegate: prisma.analisis_parameter, path: "/analisis/parameter", keyField: "id" })
