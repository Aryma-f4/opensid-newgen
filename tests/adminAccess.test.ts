import assert from "node:assert/strict"
import test from "node:test"

import { hasAccess } from "../src/lib/adminAccess"

test("uses OpenSID access thresholds", () => {
  assert.equal(hasAccess(1, "b"), true)
  assert.equal(hasAccess(1, "u"), false)
  assert.equal(hasAccess(3, "u"), true)
  assert.equal(hasAccess(7, "h"), true)
})

test("denies missing access levels", () => {
  assert.equal(hasAccess(null, "b"), false)
  assert.equal(hasAccess(undefined, "b"), false)
})
