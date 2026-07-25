import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8")

test("shared SmallBox styles contain decorative icons within cards", () => {
  assert.match(
    css,
    /\.admin-shell \.small-box\s*\{(?=[^}]*overflow:\s*hidden)(?=[^}]*isolation:\s*isolate)[^}]*\}/,
  )
})
