# Changelog

## [0.6.0] — 2026-07-13

### Changed — BREAKING (API Schema v2.0.0)
- `VectorEntity` restructured to the Schema v2 envelope. Flat coordinate fields
  (`start`, `end`, `vertices`, `center`, `position`, `radius`, angles, scales)
  moved into `entity.geometry` — read coordinates from `entity.geometry.*` now.
  Each entity also carries `handle` (original CAD handle or `null` — never
  derived from `id`), `category` (`Geometry` / `Annotation` / `BlockReference`
  / `Hatch` / `Other`), `layout`, and always-present sibling objects:
  `properties` (colorIndex/lineType/lineweight/visible + HATCH pattern fields),
  `bbox` and `metrics` (computed helpers, 6-decimal, `null` when not
  applicable), `text` (TEXT/MTEXT) and `reference` (INSERT `blockName`).
  New types: `EntityCategory`, `EntityBbox`, `EntityMetrics`,
  `EntityProperties`, `EntityText`, `EntityReference`.

### Added
- `JobResult.schemaVersion` / `JobResult.parserVersion` — contract and parser
  engine versions ("2.0.0").
- `JobResult.parseInfo` (`ParseInfo`): `{durationMs, warnings, errors}` —
  `durationMs` is `null` for jobs parsed before Schema v2.
- `ResultSummary.statistics` (`ResultStatistics`): entity counts `byType` and
  `byCategory`.
- `WebhookResult.schemaVersion` (additive — webhook sheets stay metadata-only).

## [0.5.0] — 2026-07-07

### Added
- `DrawingMetadata.unsupported3DCount`: optional count of 3D-only entity types
  (3DSOLID/BODY/SURFACE/REGION/MESH) with no extractable geometry.

### Fixed (API behaviour, no type change)
- `metadata.is3D` no longer reports `true` for drawings whose only 3D content
  is unsupported entity types with an empty 3D scene.

## [0.4.0] — 2026-07-06

### Added
- `ParseOptions.notifyEmail`: optional email address on `parse()` — CADLens emails
  a link to the job when it finishes, but only if the uploader stopped watching
  (no email when the result was seen live).
- `getJob(jobId, { watch: true })`: marks the poll as a live viewer so the
  notifyEmail is suppressed when the user watches the job complete. Use it in
  interactive poll loops; omit for unattended/server-side polling.
- `WebhookPayload`, `WebhookResult`, `SheetSummary`, `WebhookEvent` types for
  typing webhook receivers, including the new `result.resultUrl` field.

### Changed (breaking for webhook consumers)
- `job.completed` webhook payloads no longer include `sheets[].entities` /
  `sheets[].layers` — sheets carry metadata only (name, key, counts, boundingBox,
  area, perimeter, imageUrl). Fetch full geometry from `result.resultUrl`
  (`GET /v1/jobs/:id/result`, unchanged) or `getResult()`. Payloads over 256 KB
  omit `sheets` entirely. This fixes webhook delivery timeouts on large drawings.

### Notes (API v1.4.1, 2026-07-06)
- API responses are now gzip-compressed via standard content negotiation
  (`Accept-Encoding`). HTTP clients handle this automatically — no SDK code
  change or upgrade required; large results simply download ~12× faster.

## [0.3.0] — 2026-07-02

### Added
- `HatchPatternLine` type: `HATCH` entities in `sheets[].entities` now include a
  `patternLines` array — the exact hatch pattern geometry (line families with angle,
  base point, offset, and dash lengths, in drawing units with rotation/scale applied).
  Enables pixel-accurate hatch rendering (HONEY, ANSI31–37, STEEL, user patterns)
  instead of heuristic diagonals. `patternAngle` / `patternScale` are now also
  reliably populated (previously often absent).
- `DrawingMetadata.linetypePatterns`: LTYPE table (linetype name → dash/gap array in
  drawing units) and `DrawingMetadata.ltscale` ($LTSCALE) — already returned by the
  API, now documented in the types.

### Fixed (API behaviour, no client change required)
- Entities defined in a mirrored OCS (DXF extrusion normal 0,0,−1) are now returned
  at correct WCS coordinates — previously they appeared mirrored far outside the plan.
- Nested block references under mirrored inserts now expand with correct rotation.
- 2D entities with small Z-coordinate artifacts are projected to the plan instead of
  dropped — entity counts may increase slightly for affected drawings.

## [0.2.1] — 2026-06-26

### Fixed
- `getJobResult()` / `GET /v1/jobs/:id/result`: response is now returned promptly for
  drawings with large entity counts (PDFs, complex DXF files). Previously the endpoint
  timed out for sheets with thousands of entities, leaving `imageUrls` inaccessible.
- PDF files now correctly populate `imageUrls` with one presigned URL per page. Previously
  only a single entry was returned (or the request timed out entirely).

## [0.2.0] — 2026-06-25

### Added
- `Sheet.key`: HTML/CSS-safe unique slug derived from the sheet display label.
  Safe to use as an HTML `id` attribute. Deduplicated with `-2`, `-3` suffix when
  the same label appears on multiple sheets.
- `DrawingMetadata.layoutLabels`: original display labels in image order (may contain
  duplicates across sheets). Parallel array to `layouts[]`.
- `DrawingMetadata.layoutKeys`: HTML/CSS-safe slugs in image order. Parallel to `layouts[]`.

### Fixed
- Per-viewport frozen-layer rendering: named layout sheets now show only layers
  visible in that viewport (previously all layers rendered on every sheet).
- PNG preview now correctly scales entity text height through viewport transforms.

## [0.1.0] — 2026-06-19

Initial release with sheets-based response schema.
