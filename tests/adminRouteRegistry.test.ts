import test from "node:test"
import assert from "node:assert/strict"
import { mapRoute } from "../src/lib/adminRouteRegistry"

test("normalizes the vulnerable-group report clear route", () => {
  assert.equal(mapRoute("laporan_rentan/clear"), "/laporan_rentan")
})
