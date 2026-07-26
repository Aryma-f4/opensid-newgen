import { PrismaClient } from "../src/generated/prisma"
const p = new PrismaClient()
async function main() {
  const layouts = await p.theme_page_layouts.findMany()
  console.log(`Found ${layouts.length} layouts in DB`)
  for (const l of layouts) {
    const d: any = l.puck_data
    if (!d?.content) continue
    const before = d.content.filter((b: any) => b?.type === "SiteFooter").length
    if (before <= 1) continue
    console.log(`  ${l.theme_id}/${l.route_key}: ${before}x SiteFooter → cleaning`)
    const seen = new Set<string>()
    d.content = d.content.filter((b: any) => {
      if (b?.type === "SiteFooter"||b?.type === "SiteHeader") { if (seen.has(b.type)) return false; seen.add(b.type) }
      return true
    })
    await p.theme_page_layouts.update({ where: { id: l.id }, data: { puck_data: d as any } })
  }
  const after = await p.theme_page_layouts.findMany()
  for (const l of after) {
    const d: any = l.puck_data
    const f = d?.content?.filter((b: any) => b?.type === "SiteFooter").length||0
    console.log(`  ${l.theme_id}/${l.route_key}: ${f}x SiteFooter`)
  }
  await p.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
