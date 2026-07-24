import assert from "node:assert/strict"
import test from "node:test"
import { isVisibleMenu } from "../src/lib/adminMenuVisibility"

test("menu visibility includes SHOW and SHOW_S but excludes HIDDEN", () => {
  assert.equal(isVisibleMenu(0), true)
  assert.equal(isVisibleMenu(1), true)
  assert.equal(isVisibleMenu(2), false)
})
