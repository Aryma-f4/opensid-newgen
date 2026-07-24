import { prisma } from "./prisma"
import { auth } from "./auth"
import { NextResponse } from "next/server"

// ponytail: two factories matching Next.js collection/[id] convention
// collection: GET (list), POST (create), DELETE (bulk)
// item: GET (one), PUT (update), DELETE (one)

type Delegate = any
type ListOpts = {
  search?: string[]
  where?: (q: URLSearchParams) => any
  orderBy?: any
  include?: any
  select?: any
  defaultData?: (session: any) => Record<string, any>
}

export function makeCollection(delegate: Delegate, opts: ListOpts = {}) {
  async function GET(req: Request) {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") ?? "1")
    const perPage = parseInt(url.searchParams.get("perPage") ?? "20")
    const q = url.searchParams.get("q") ?? ""

    const where: any = { ...opts.where?.(url.searchParams) }
    if (q && opts.search?.length) {
      where.OR = opts.search.map((field) => ({ [field]: { contains: q } }))
    }

    const [data, total] = await Promise.all([
      delegate.findMany({
        where,
        orderBy: opts.orderBy ?? { id: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: opts.include,
        select: opts.select,
      }),
      delegate.count({ where }),
    ])

    return NextResponse.json({ data, total, page, perPage })
  }

  async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    if (opts.defaultData) Object.assign(body, opts.defaultData(session))
    const created = await delegate.create({ data: body })
    return NextResponse.json(created)
  }

  async function DELETE(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    let body: any = {}
    try { body = await req.json() } catch {}
    if (body.ids?.length && delegate.deleteMany) {
      await delegate.deleteMany({ where: { id: { in: body.ids } } })
    }
    return NextResponse.json({ ok: true })
  }

  return { GET, POST, DELETE }
}

export function makeItem(delegate: Delegate, opts: { include?: any; transform?: (body: any, session: any) => any } = {}) {
  async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const item = await delegate.findUnique({ where: { id: parseId(id) }, include: opts.include })
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(item)
  }

  async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const body = await req.json()
    const data = opts.transform ? opts.transform(body, session) : body
    const updated = await delegate.update({ where: { id: parseId(id) }, data })
    return NextResponse.json(updated)
  }

  async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    await delegate.delete({ where: { id: parseId(id) } })
    return NextResponse.json({ ok: true })
  }

  return { GET, PUT, DELETE }
}

function parseId(id: string): number | string {
  return /^\d+$/.test(id) ? parseInt(id) : id
}