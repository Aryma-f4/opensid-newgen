import assert from "node:assert/strict"
import test from "node:test"
import { buildAdminMenu } from "../src/lib/adminMenuTree"

test("builds an ordered tree from SHOW and SHOW_S rows while excluding HIDDEN rows", () => {
  const menu = buildAdminMenu([
    {
      id: 10,
      modul: "Visible first",
      slug: "visible-first",
      url: "visible_first",
      ikon: "fa-first",
      urut: 1,
      parent: 0,
      hidden: 0,
    },
    {
      id: 11,
      modul: "SHOW_S child",
      slug: "show-s-child",
      url: "show_s_child",
      ikon: "fa-child",
      urut: 2,
      parent: 10,
      hidden: 1,
    },
    {
      id: 12,
      modul: "Hidden child",
      slug: "hidden-child",
      url: "hidden_child",
      ikon: "fa-hidden",
      urut: 3,
      parent: 10,
      hidden: 2,
    },
    {
      id: 20,
      modul: "SHOW_S second",
      slug: "show-s-second",
      url: "show_s_second",
      ikon: null,
      urut: 4,
      parent: null,
      hidden: 1,
    },
    {
      id: 30,
      modul: "Hidden root",
      slug: "hidden-root",
      url: "hidden_root",
      ikon: null,
      urut: 5,
      parent: 0,
      hidden: 2,
    },
  ])

  assert.deepEqual(menu, [
    {
      id: 10,
      modul: "Visible first",
      slug: "visible-first",
      url: "visible_first",
      ikon: "fa-first",
      urut: 1,
      parent: 0,
      children: [
        {
          id: 11,
          modul: "SHOW_S child",
          slug: "show-s-child",
          url: "show_s_child",
          ikon: "fa-child",
          urut: 2,
          parent: 10,
          children: [],
        },
      ],
    },
    {
      id: 20,
      modul: "SHOW_S second",
      slug: "show-s-second",
      url: "show_s_second",
      ikon: null,
      urut: 4,
      parent: 0,
      children: [],
    },
  ])
})
