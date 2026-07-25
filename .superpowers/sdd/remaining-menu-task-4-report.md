# Remaining Admin Menu Task 4 Report

## Status

Complete. The active admin routes `/plugin`, `/pendaftaran_kerjasama`,
`/qrcode`, and `/sinkronisasi` now resolve to dedicated pages.

## Legacy Dependency Findings

| Screen | Legacy dependency | NewGen behavior |
| --- | --- | --- |
| Plugin marketplace | `server_layanan` marketplace API, bearer token, module ZIP download, filesystem install/removal, and module migrations | Reads only tenant-local token presence. Marketplace inventory and all package mutations are explicitly disabled. |
| Partnership registration | `server_layanan/api/v1/pelanggan/*`, multipart PDF upload, and returned `layanan_opendesa_token` | Shows tenant-local village/contact readiness and token presence. Registration/status checks are explicitly unverified and disabled. |
| QR Code | Local TCPDF QR rendering plus legacy browser scanner; form values were transient and not stored as settings | Generates and downloads PNG entirely in the browser from the documented content, size, and foreground-color fields. No database persistence or network request occurs. |
| OpenDK synchronization | Tenant settings (`sinkronisasi_opendk`, server, API key), export builders, authenticated OpenDK calls, and local sync/report logs | Shows tenant-local configuration diagnostics and tenant-scoped logs/reports. Send/download/synchronize operations remain disabled and never record simulated success. |

## Implementation

- Added tenant-scoped, read-only integration pages for plugin marketplace,
  OpenDESA partnership registration, and OpenDK synchronization.
- Added a browser-local QR generator using `qrcode`; input is allowlisted and
  validated against the legacy 300-character and 25–250 px limits.
- Added `src/lib/integrationConfig.ts` for pure QR validation, tenant setting
  predicates, partnership readiness, safe OpenDK URL normalization, and
  explicitly unverified external diagnostics.
- Strengthened `scripts/audit-admin-menu-routes.ts` so resolved page paths must
  remain inside the admin root and cannot be the catch-all fallback.
- Added focused regression tests for tenant predicates, QR validation,
  whitespace-only identity data, unsafe server schemes, OpenDK base paths, and
  the rule that local credentials never imply remote success.

## Verification

Fresh final runs after review fixes:

- `npm test` — exit 0, 76 tests passed.
- `npx tsc --noEmit` — exit 0.
- `npm run build` — exit 0; 143 static pages generated. The existing
  multi-lockfile/NFT tracing warnings remain.
- `npm run audit:admin-menu-routes` — exit 0, all active admin menu URLs resolve.

The first build attempt encountered a transient inability to reach MySQL while
prerendering the pre-existing `/api/sitemap` route. MySQL was verified listening,
the same Prisma query succeeded, and two subsequent production builds exited
zero without a code workaround.

## Review

Independent review initially found two diagnostic-accuracy issues:
whitespace-only village fields could appear complete, and OpenDK base paths were
collapsed to their origin. Both were fixed with regression tests. Re-review
reported no remaining Critical or Important issues.

## Concerns

- Marketplace install/removal, partnership submission/status, and OpenDK
  synchronization require real authenticated service clients and failure
  contracts before they can be enabled.
- Plugin filesystem inventory is intentionally not shown because the legacy
  module directory is installation-global and no tenant-isolated package
  contract exists in NewGen.
- Legacy QR logo embedding and QR scanning are not included; the port covers the
  safe local generator fields whose behavior is known.
