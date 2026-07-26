import assert from "node:assert/strict"
import test from "node:test"
import {
  PUCK_ROUTE_KEYS,
  isPublicRouteKey,
  parsePuckLayout,
  starterPuckData,
  PUCK_BLOCK_TYPES,
} from "../src/lib/themePuck"
import { BLOCK_RENDERERS, BLOCK_FIELDS } from "../src/components/public/puck/blocks"
import { publicPuckComponents, PUCK_CATEGORIES } from "../src/components/public/puck/config"

test("PUCK_ROUTE_KEYS contains exactly 4 routes", () => {
  assert.deepEqual([...PUCK_ROUTE_KEYS], ["home", "article-detail", "category-list", "layanan-mandiri"])
})

test("isPublicRouteKey validates correctly", () => {
  assert.equal(isPublicRouteKey("home"), true)
  assert.equal(isPublicRouteKey("admin"), false)
})

test("parsePuckLayout rejects unknown block type", () => {
  assert.throws(() => parsePuckLayout({ content: [{ type: "UnknownBlock" }] }), /Unknown block type/)
})

test("parsePuckLayout rejects non-object", () => {
  assert.throws(() => parsePuckLayout(null))
  assert.throws(() => parsePuckLayout("string"))
})

test("parsePuckLayout accepts valid minimal layout", () => {
  const result = parsePuckLayout({ content: [{ type: "SiteHeader" }] })
  assert.equal(result.content.length, 1)
  assert.equal(result.content[0].type, "SiteHeader")
})

test("parsePuckLayout enforces block type list", () => {
  for (const t of PUCK_BLOCK_TYPES) {
    const result = parsePuckLayout({ content: [{ type: t }] })
    assert.equal(result.content[0].type, t)
  }
})

test("starterPuckData('home') starts with SiteHeader", () => {
  const data = starterPuckData("home")
  assert.equal(data.content[0].type, "SiteHeader")
})

test("starterPuckData supports all route keys", () => {
  for (const key of PUCK_ROUTE_KEYS) {
    const data = starterPuckData(key)
    assert.ok(data.content.length >= 2, `Route ${key} should have at least header + footer`)
    assert.equal(data.content[0].type, "SiteHeader")
    assert.equal(data.content[data.content.length - 1].type, "SiteFooter")
  }
})

test("BLOCK_RENDERERS has all accepted types", () => {
  const rendererNames = Object.keys(BLOCK_RENDERERS).sort()
  const expected = [...PUCK_BLOCK_TYPES].sort()
  assert.deepEqual(rendererNames, expected)
})

test("BLOCK_FIELDS has entry for every renderer", () => {
  for (const name of Object.keys(BLOCK_RENDERERS)) {
    assert.ok(name in BLOCK_FIELDS, `Missing BLOCK_FIELDS entry for ${name}`)
  }
})

test("BLOCK_RENDERERS are functions", () => {
  for (const [name, renderer] of Object.entries(BLOCK_RENDERERS)) {
    assert.equal(typeof renderer, "function", `${name} renderer should be a function`)
  }
})

test("publicPuckComponents has all block types", () => {
  const names = Object.keys(publicPuckComponents).sort()
  const expected = [...PUCK_BLOCK_TYPES].sort()
  assert.deepEqual(names, expected)
})

test("PUCK_CATEGORIES cover all components", () => {
  const categorized = new Set<string>()
  for (const components of Object.values(PUCK_CATEGORIES)) {
    for (const comp of components) categorized.add(comp)
  }
  assert.equal(categorized.size, Object.keys(BLOCK_RENDERERS).length)
})
