import assert from "node:assert/strict"
import test from "node:test"
import { selectPublicRenderer, isAdminRoute } from "../src/lib/publicTheme"

test("selectPublicRenderer: legacy theme always returns legacy", () => {
  assert.equal(selectPublicRenderer({ mode: "legacy" }, "home"), "legacy")
  assert.equal(selectPublicRenderer({ mode: "legacy" }, "article-detail"), "legacy")
  assert.equal(selectPublicRenderer({ mode: "legacy" }, "unknown-route"), "legacy")
})

test("selectPublicRenderer: puck theme for known routes", () => {
  const puck = { mode: "puck" as const, themeId: 1n }
  assert.equal(selectPublicRenderer(puck, "home"), "puck")
  assert.equal(selectPublicRenderer(puck, "article-detail"), "puck")
  assert.equal(selectPublicRenderer(puck, "category-list"), "puck")
  assert.equal(selectPublicRenderer(puck, "layanan-mandiri"), "puck")
})

test("selectPublicRenderer: puck theme for unknown routes returns fallback", () => {
  const puck = { mode: "puck" as const, themeId: 1n }
  assert.equal(selectPublicRenderer(puck, "unknown"), "puck-fallback")
  assert.equal(selectPublicRenderer(puck, "admin"), "puck-fallback")
})

test("isAdminRoute protects admin paths", () => {
  assert.equal(isAdminRoute("/admin"), true)
  assert.equal(isAdminRoute("/admin/beranda"), true)
  assert.equal(isAdminRoute("/siteman"), true)
  assert.equal(isAdminRoute("/"), false)
  assert.equal(isAdminRoute("/artikel/hello"), false)
  assert.equal(isAdminRoute("/theme/customize"), false)
})
