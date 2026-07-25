import assert from "node:assert/strict"
import test from "node:test"
import { isPublicRouteKey, parsePuckLayout, starterPuckData, PUCK_ROUTE_KEYS } from "../src/lib/themePuck"

test("parsePuckLayout rejects invalid route keys at parse level", () => {
  assert.throws(() => parsePuckLayout({ content: [{ type: "UnknownBlock" }] }), /Unknown block type/)
})

test("isPublicRouteKey validates route keys", () => {
  assert.equal(isPublicRouteKey("home"), true)
  assert.equal(isPublicRouteKey("article-detail"), true)
  assert.equal(isPublicRouteKey("admin"), false)
  assert.equal(isPublicRouteKey("beranda"), false)
})

test("starterPuckData produces unique layouts per route", () => {
  const layouts = PUCK_ROUTE_KEYS.map((key) => starterPuckData(key))
  const lengths = new Set(layouts.map((l) => l.content.length))
  assert.ok(lengths.size >= 2, "Different routes should have different content lengths")
})

test("parsePuckLayout enforces size limit", () => {
  const largeContent = Array.from({ length: 201 }, (_, i) => ({ type: "SiteHeader" as const, props: {} }))
  assert.throws(() => parsePuckLayout({ content: largeContent }), /200/)
})

test("parsePuckLayout accepts valid puck data with all field types", () => {
  const data = {
    content: [
      { type: "Heading", props: { text: "Test", level: 2 } },
      { type: "RichText", props: { html: "<p>Hello</p>" } },
      { type: "Button", props: { text: "Click", href: "#" } },
    ],
    root: { title: "Test Page" },
  }
  const result = parsePuckLayout(data)
  assert.equal(result.content.length, 3)
})

test("PUCK_ROUTE_KEYS matches expected routes", () => {
  const expected = ["home", "article-detail", "category-list", "layanan-mandiri"]
  assert.deepEqual([...PUCK_ROUTE_KEYS], expected)
})
