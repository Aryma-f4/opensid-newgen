import { prisma } from "@/lib/prisma"
import Manager from "./Manager"
import Link from "next/link"
import { ContentHeader, Box, SmallBox } from "@/components/admin/Ui"
export const dynamic = "force-dynamic"
export default async function Page() {
  const pantauCount = await prisma.covid19_pantau.count()
  return (<div>
    <ContentHeader title="Covid-19" breadcrumb={[{ label: "Kependudukan" }, { label: "Covid-19" }]} />
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4">
      <SmallBox value={pantauCount} label="Pendataan Kesehatan" icon="fa-heartbeat" color="blue" href="/covid19/pantau" />
    </div>
    <div className="flex gap-2 mb-4">
      <Link href="/covid19/pantau" className="btn btn-primary btn-sm"><i className="fa fa-heartbeat" /> Pendataan Kesehatan</Link>
    </div>
    <Box title="Data Covid-19" noPadding><Manager /></Box>
  </div>)
}
