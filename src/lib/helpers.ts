import { prisma } from "./prisma"

export async function getConfig() {
  return prisma.config.findFirst({ orderBy: { id: "asc" } })
}

export async function getMenu() {
  const menus = await prisma.menu.findMany({
    where: { enabled: true },
    orderBy: { urut: "asc" },
  })
  type MenuWithChildren = typeof menus[number] & { children: MenuWithChildren[] }
  const buildTree = (parent: number = 0): MenuWithChildren[] =>
    menus
      .filter((m) => (m.parrent ?? 0) === parent)
      .map((m) => ({
        ...m,
        children: buildTree(m.id),
      }))
  return buildTree()
}

export async function getArticles(page: number = 1, perPage: number = 10) {
  const [articles, total] = await Promise.all([
    prisma.artikel.findMany({
      where: { enabled: 1, tipe: "dinamis" },
      include: { kategori: true },
      orderBy: { tgl_upload: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.artikel.count({ where: { enabled: 1, tipe: "dinamis" } }),
  ])
  return { articles, total, page, perPage, totalPages: Math.ceil(total / perPage) }
}

export async function getHeadline() {
  return prisma.artikel.findFirst({
    where: { enabled: 1, headline: true },
    include: { kategori: true },
    orderBy: { tgl_upload: "desc" },
  })
}

export async function getCategories() {
  return prisma.kategori.findMany({
    orderBy: { urut: "asc" },
    include: { _count: { select: { artikel: true } } },
  })
}

export async function getSlideShows() {
  return prisma.artikel.findMany({
    where: { enabled: 1, slider: true },
    orderBy: { tgl_upload: "desc" },
    take: 5,
  })
}

export async function getPamong() {
  return prisma.tweb_desa_pamong.findMany({
    where: { pamong_status: true },
    include: { ref_jabatan: true },
    orderBy: { urut: "asc" },
  })
}

export async function getWidgets() {
  return prisma.widget.findMany({
    where: { enabled: 1 },
    orderBy: { urut: "asc" },
  })
}

export async function getSocialMedia() {
  return prisma.media_sosial.findMany({ orderBy: { id: "asc" } })
}

export async function getRunningText() {
  return prisma.teks_berjalan.findMany({ where: { status: true } })
}

export async function getStatistics() {
  const [totalPenduduk, totalKeluarga, lakiLaki, perempuan] = await Promise.all([
    prisma.tweb_penduduk.count(),
    prisma.tweb_keluarga.count(),
    prisma.tweb_penduduk.count({ where: { sex: 1 } }),
    prisma.tweb_penduduk.count({ where: { sex: 2 } }),
  ])
  return { totalPenduduk, totalKeluarga, lakiLaki, perempuan }
}

export async function getSetting(key: string) {
  const s = await prisma.setting_aplikasi.findFirst({ where: { key } })
  return s?.value ?? null
}

export async function getLatestComments(limit: number = 5) {
  return prisma.komentar.findMany({
    where: { status: true },
    orderBy: { tgl_upload: "desc" },
    take: limit,
  })
}
