import { scanThemes } from "./actions"
import Manager from "./Manager"
export const dynamic = "force-dynamic"
export default async function PindaiTemaPage() {
  const themes = await scanThemes()
  return <Manager initial={themes} />
}
