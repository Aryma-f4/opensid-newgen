import { PrismaClient } from "../src/generated/prisma"
import { starterPuckData, PUCK_ROUTE_KEYS } from "../src/lib/themePuck"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding default Puck theme...")

  // Use config_id = 1 (default config)
  const CONFIG_ID = 1

  // Check if a Puck default theme already exists
  const existing = await prisma.theme.findFirst({
    where: { config_id: CONFIG_ID, renderer: "puck", nama: "Default" },
  })

  if (existing) {
    console.log("ℹ️  Default theme already exists, skipping seed.")
    return
  }

  // Create the default Puck theme
  const theme = await prisma.theme.create({
    data: {
      config_id: CONFIG_ID,
      nama: "Default",
      renderer: "puck",
      status: 0,
    } as any,
  })

  console.log(`✅ Created theme ID ${theme.id} with name "Default"`)

  // Create layouts for all 4 route keys
  for (const key of PUCK_ROUTE_KEYS) {
    const data = starterPuckData(key)
    await prisma.theme_page_layouts.create({
      data: {
        config_id: CONFIG_ID,
        theme_id: theme.id,
        route_key: key,
        puck_data: data as any,
      },
    })
    console.log(`  📄 Layout created for route "${key}"`)
  }

  console.log("🎉 Seeding complete. Activate 'Default' theme at /theme/customize")
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
