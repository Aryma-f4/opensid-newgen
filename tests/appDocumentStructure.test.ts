import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import test from "node:test"

const appRoot = join(process.cwd(), "src/app")

function pageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return pageFiles(path)
    return entry.name === "page.tsx" ? [path] : []
  })
}

test("route pages do not render document root elements", () => {
  const invalidPages = pageFiles(appRoot)
    .filter((file) => /<(?:html|head|body)\b/.test(readFileSync(file, "utf8")))
    .map((file) => relative(process.cwd(), file))

  assert.deepEqual(invalidPages, [])
})
