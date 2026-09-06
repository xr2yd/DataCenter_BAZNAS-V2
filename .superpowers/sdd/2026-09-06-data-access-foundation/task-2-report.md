# Task 2 Report — Data-plane access gaps

## Implementation commit

`33cc29465a97205a07dc3b5287bc6971d9a77a2f`

## Changed endpoints

- Admin-only: `GET /api/cache/stats`, `POST /api/cache/clear`, `DELETE /api/mustahik/:id`, existing `GET /api/penyaluran/audit-decisions`, and existing master-data writes.
- Admin or penyaluran: Mustahik create/update/import and both Mustahik/report exports; initiative create/update/delete; report generation; MPZIS and PPD mutations.
- Admin, penyaluran, or surveyor: Mustahik list/detail/stats/stage counts, data and penyaluran overview, kecamatan and transaction views, program/report/master-data reads, approvals, activity logs, WhatsApp read/write, assessment mutations, document read/write, `POST /api/upload`, and static `/uploads` delivery through Express.
- Authentication now executes before cache middleware on every cached protected route. The Mustahik PII export is deliberately not cached so each delivered export receives its own audit row.
- Public without login: `GET /api/health`, `POST /api/auth/login`, `POST /api/public/pengajuan`, `GET /api/public/lacak/:query`, and `GET /api/public/master-data`.
- Public tracking now rejects underspecified keys, uses exact repository matches, does not echo a missing identifier, masks the applicant name, and returns only the public UI fields. It no longer returns raw Mustahik PII, assessments, MPZIS/PPD rows, documents, or WhatsApp history.
- Public health no longer duplicates protected cache telemetry.

## Permission decisions

- Mustahik deletion is admin-only because it permanently cascades related operational records. Normal create/update/import remains available to admin and penyaluran.
- Cache stats and cache clear are admin-only. Cache clear changes process-wide state, while stats expose process telemetry.
- Mustahik PII export is restricted to admin and penyaluran, rather than all operational readers. This follows the stricter export policy and does not block ordinary surveyor read workflows.
- Assessment and document mutations remain available to all three operational roles. MPZIS/PPD and report/initiative mutations are limited to admin and penyaluran.
- Existing workflow decision middleware and repository stage-specific role checks remain in place. Existing decision audit records remain append-only.
- Activity-log reads remain available to all operational roles; the dedicated approval-decision audit endpoint remains admin-only.

## CORS, upload, and error handling

- Production browser origins are denied when `FRONTEND_URL` is empty. Comma-separated configured origins are supported and credentials are enabled only with explicit origin matching; non-browser requests without an Origin header remain valid.
- Non-production permits the documented local frontend origins on ports 3000 and 5173, plus explicitly configured origins.
- Uploads accept only PDF, JPEG, and PNG with matching filename extensions, at most five files per request and 10 MB per file.
- Stored names are UUID basenames plus a validated lowercase extension; client paths are never reused for server filenames.
- Unsupported/mismatched types return 422, oversize files return 413, disallowed origins return 403, and unhandled errors return a generic 500 JSON response without a stack trace.

## Audit evidence

- Successful Mustahik and report exports append an `activity_logs` record before the response is released. The row records action and target, and encodes authenticated actor name, role, and id in `actor_name` because the existing table has no separate actor-id/actor-role columns.
- No best-effort audit writes were added after ordinary mutations. Those repository methods currently perform multiple non-transactional statements, so a route-level follow-up insert could fail independently and create misleading audit guarantees. The bounded alternative is enforced role checks, preserved workflow decision logs, and fail-closed append-only audit gating for exports. Transactional mutation auditing should be added when the repository exposes a transaction contract.

## Tests and verification

- Test-first red checks observed anonymous Mustahik export and surveyor PPD requests reaching handlers instead of returning 401/403, invalid upload types being accepted, public tracking returning private related data, and production CORS/startup testability gaps.
- `node --test server/access-policy.test.js server/access-control.integration.test.js server/audit-log.test.js` — 22 passed, 0 failed.
- `node --check server/index.js` and `node --check server/repository.js` — passed.
- `node test_backend.js` — passed all 10 legacy smoke sections against an explicitly isolated SQLite fallback; the generated database was removed afterward.
- `git diff --check` and staged diff check — passed.
- Final tests did not initialize or query the configured production database and left no generated SQLite file.

## Known limitations

- Validation checks declared MIME type against extension, but does not inspect file magic bytes or run malware scanning. Those require a content-inspection service or library and quarantine workflow.
- The repository includes an existing Nginx example that serves `/uploads` directly. Express now protects `/uploads`, but a deployment using that direct alias must separately remove it or replace it with an authenticated internal-redirect design. Deployment/frontend configuration was outside this Task 2 assignment.
- Public tracking remains a possession-based lookup using an exact file number, NIK, phone, or family-card number. Minimum length and exact matching prevent trivial partial enumeration, but rate limiting is not yet implemented.

## Review fix round 1 — 2026-09-06

Implementation commit: `5d09021685ea69d85f67c1a553b865d51ff52102`.

### P1: literal public tracking

- Confirmed the original raw `ILIKE` predicate treated user-supplied `%` and `_` as patterns. The earlier report's claim of exact matching was incorrect for those inputs.
- Completed the inherited uncommitted lookup extraction and changed the repository predicate to literal equality: case-insensitive equality for file numbers, exact equality for NIK, phone, and family-card numbers. The public endpoint retains its minimum-length check; a wildcard input now cannot broaden the lookup.
- Added an in-memory PostgreSQL-compatible regression using existing `pg-mem`. It covers wildcard-only and mixed wildcard patterns, all numeric identifier types, and case-insensitive exact file numbers. It never connects to the configured database.
- RED: temporarily restored the original `ILIKE` predicate in the inherited lookup helper and ran `node --test server/public-tracking.repository.test.js`: 1 failed, 2 passed. `%%%%%%%%` returned the seeded applicant when the test expected no match.
- GREEN: restored literal equality and reran the same command: 3 passed, 0 failed.

### P1: authenticated report downloads

- The review assignment explicitly extends the original backend-only brief to fix the existing report UI. Replaced `window.open` with the API client's session-token convention, authenticated fetch, and a Blob download for PDF and XLSX. The token is sent only in the Authorization header; the existing export URL metadata and server role protection remain intact.
- Download names use a sanitized report title and the selected extension. Temporary anchors are removed and Blob URLs are revoked after the browser has a turn to start the download. Feedback confirms the download only after a successful response and gives actionable Indonesian messages for expired sessions, denied permissions, and server/network failures.
- RED: `npm test -- components/penyaluran/laporan/LaporanPenyaluranWorkspace.test.tsx --reporter=dot` in `frontend-next`: 6 failed, 4 passed with the old `window.open` implementation. PDF/XLSX produced no Blob download; HTTP 401/403/500 and network failures still displayed success instead of an actionable error.
- GREEN: `npm test -- components/penyaluran/laporan/LaporanPenyaluranWorkspace.test.tsx lib/api/client.test.ts --reporter=dot`: 18 passed, 0 failed. Tests exercise the real component, API URL builder, and session reader with only network/browser download boundaries substituted. They verify the Authorization header, downloaded body and extension, URL cleanup, and absence of downloads on errors.
- Updated two stale assertions in the existing component test file to current export button labels and category-feedback behavior; the prior expectations described UI behavior no longer present before this fix.

### Final verification and bounds

- `node --test server/access-policy.test.js server/access-control.integration.test.js server/audit-log.test.js server/public-tracking.repository.test.js`: 25 passed, 0 failed.
- `node --check server/repository.js`, `git diff --check`, and staged diff check: passed.
- Full `npm run typecheck`: blocked by the existing missing `mapbox-gl` dependency at `components/penyaluran/map/RealKecamatanMap.tsx:5` (TS2307). No changed production file reported an error.
- An isolated strict typecheck extending the existing frontend tsconfig and including the changed component/API plus their tests passed. Command: `node node_modules/typescript/bin/tsc --noEmit --project tsconfig.task2-check.json`; the temporary config was removed afterward, and generated `tsconfig.tsbuildinfo` changes were restored.
- Frontend tests emit the existing Vite warning about `__dirname` in `vitest.config.ts`. The installed frontend dependencies were reused through an ignored local `frontend-next/node_modules` junction; no dependency installation or lockfile change was required.
- No deployment, secret changes, configured-database access, or public application submission changes were made. Existing possession-based tracking and rate-limit limitations remain.
