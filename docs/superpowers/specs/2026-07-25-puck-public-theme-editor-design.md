# Puck Public Theme Editor Design

## Goal

Provide a WordPress-style visual editor for every public OpenSID route while leaving `/admin` and the current default public theme unchanged.

## Scope

- Public route families are editable as layouts: home, article listing/detail, category listing, layanan mandiri, and future public static routes.
- Admin layouts, navigation, authentication pages, and APIs are not edited through Puck.
- The current public shell remains the **legacy default theme** and continues to render exactly as it does today.

## Theme Modes

The active `theme` record gains an explicit renderer mode:

- `legacy`: reserved for the current default theme; continues to use `PublicSiteShell` and the existing route components.
- `puck`: a custom visual theme; its public route layouts are rendered from Puck data.

Changing the active theme selects the renderer at the public-theme boundary. It must not change admin routes. A theme in `legacy` mode never reads Puck layouts, which keeps the current default appearance stable.

## Stored Layout Model

Create a tenant-scoped `theme_page_layouts` record with:

- `config_id`
- `theme_id`
- `route_key` (for example `home`, `article-detail`, `category-list`, `layanan-mandiri`)
- `puck_data` (JSON)
- created/updated timestamps

`theme_id + route_key` is unique. Puck's JSON is stored as data, never compiled or evaluated as code. Existing `theme_templates.html_content`, `css_content`, and `js_content` stay readable for legacy records but are not executed by Puck themes.

## Puck Configuration

Use `@puckeditor/core` with a fixed OpenSID component registry. The initial registry contains:

- structural blocks: section, columns, spacer, divider;
- content blocks: heading, rich text, image, button, callout;
- site blocks: header, footer, navigation, running text, social links;
- OpenSID data blocks: article list, article detail, category list, village statistics, apparatus list, widget area.

The editor exposes validated text, URL, image-path, color, spacing, and selection fields only. It does not expose arbitrary JavaScript, arbitrary React components, raw HTML, or unsanitized iframe markup. Dynamic OpenSID data remains the source of truth; Puck controls only layout and presentation.

## Rendering Architecture

Each public route keeps its server-side data loading and passes a typed route context to a shared `PublicThemeRenderer`.

1. Resolve the active tenant theme.
2. For `legacy`, render the existing component tree unchanged.
3. For `puck`, load that route's `theme_page_layouts.puck_data` and render it through Puck's `Render` component with the typed route context.
4. If a custom theme has no layout for a route, render a safe OpenSID fallback layout and show an editor prompt rather than a blank page.

The editor lives only at `/theme/customize`. It loads the selected Puck theme and route key, uses `Puck` for drag-and-drop editing, and saves the returned JSON through a tenant-scoped server action. Preview uses the same `Render` configuration as production, without nesting document tags or injecting CSS into a separate page.

## Security and Authorization

- All editor reads/writes are tenant-scoped by `config_id` and protected by the existing theme-management access level.
- Persisted Puck data is validated by Zod against the registered component schema and size limits.
- Image selections use approved local upload paths; outbound URLs require safe `https` or approved relative paths.
- The public renderer does not evaluate user-provided JavaScript or arbitrary HTML.

## Migration and UX

- Backfill existing themes as `legacy`.
- Add “Buat Tema Visual” to create a `puck` theme seeded with editable starter layouts.
- The template list clearly labels **Tema Default (Legacy)** and **Tema Visual (Puck)**.
- The visual editor has route tabs, desktop/tablet/mobile preview controls, Undo/Redo from Puck, publish/save status, and a restore-starter-layout action.

## Verification

- Unit tests validate Puck layout payloads, tenant ownership, allowed routes, and fallback selection.
- Component tests cover the registry's OpenSID data blocks against typed route contexts.
- Route tests assert legacy default output remains selected when the active theme is legacy.
- Build and route audits must pass; manually verify an editor save, preview, publish, route fallback, and admin isolation.
