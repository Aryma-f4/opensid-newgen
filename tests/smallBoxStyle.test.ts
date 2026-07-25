import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8")
const smallBox = readFileSync(join(process.cwd(), "src/components/admin/Ui.tsx"), "utf8")

test("shared SmallBox styles contain decorative icons within cards", () => {
  assert.match(
    css,
    /\.admin-shell \.small-box\s*\{(?=[^}]*overflow:\s*hidden)(?=[^}]*isolation:\s*isolate)[^}]*\}/,
  )
})

test("shared SmallBox enforces icon containment at the component boundary", () => {
  assert.match(
    smallBox,
    /const smallBoxContainmentStyle = \{[\s\S]*overflow: "hidden",[\s\S]*isolation: "isolate",[\s\S]*\} as const/,
  )
  assert.match(
    smallBox,
    /<div style=\{smallBoxContainmentStyle\} className=\{`small-box \$\{smallBoxClass\[color\]\}`\}>/,
  )
})

test("summary-card layouts use compact eight-pixel gaps", () => {
  assert.match(
    css,
    /\.admin-shell :is\(\.grid, \.flex\):has\(> \.small-box\)\s*\{(?=[^}]*gap:\s*\.5rem)[^}]*\}/,
  )
})
