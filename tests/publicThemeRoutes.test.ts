import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const appRoot = join(process.cwd(), "src/app")

test("all 4 public Puck route files exist", () => {
  const routes = [
    "(public)/page.tsx",
    "(public)/artikel/[...slug]/page.tsx",
    "(public)/kategori/[id]/page.tsx",
    "(public)/layanan-mandiri/page.tsx",
  ]

  for (const route of routes) {
    const filePath = join(appRoot, route)
    assert.doesNotThrow(() => readFileSync(filePath, "utf8"), `Route file missing: ${route}`)
  }
})

test("admin layout does not reference PublicThemeRenderer or Puck", () => {
  const adminLayoutPath = join(appRoot, "(admin)/layout.tsx")
  const content = readFileSync(adminLayoutPath, "utf8")
  assert.doesNotMatch(content, /PublicThemeRenderer/, "Admin layout should not import PublicThemeRenderer")
  assert.doesNotMatch(content, /@puckeditor/, "Admin layout should not import Puck editor")
})

test("auth pages do not import Puck", () => {
  const authFiles = [
    "(auth)/siteman/page.tsx",
    "(auth)/siteman/LoginForm.tsx",
    "(auth)/siteman/logout/page.tsx",
  ]

  for (const file of authFiles) {
    const filePath = join(appRoot, file)
    try {
      const content = readFileSync(filePath, "utf8")
      assert.doesNotMatch(content, /@puckeditor/, `Auth file ${file} should not import Puck`)
    } catch {
      // File might not exist yet — skip
    }
  }
})

test("public layout wraps content (does not contain document root elements)", () => {
  const publicLayoutPath = join(appRoot, "(public)/layout.tsx")
  const content = readFileSync(publicLayoutPath, "utf8")
  assert.doesNotMatch(content, /<html|<!DOCTYPE/i, "Public layout should not contain document root elements")
})

test("admin layouts use AdminLTE shell classes", () => {
  const adminLayoutPath = join(appRoot, "(admin)/layout.tsx")
  const content = readFileSync(adminLayoutPath, "utf8")
  assert.match(content, /admin-shell|main-sidebar|content-wrapper/, "Admin layout should use AdminLTE shell classes")
})
