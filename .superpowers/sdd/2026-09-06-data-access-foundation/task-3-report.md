# Task 3: repository aggregate provenance

Implementation commit: `14eec39db915da36e2fca53583da1deea49965e2`.

## Outcome and scope

Replaced fabricated amounts, beneficiary estimates, trends, allocations, and compliance claims in `getPenyaluranOverview` and `getLaporanList` with persisted-data aggregates. No frontend, route, middleware, deployment, seed-data, or database configuration changes.

The canonical realized set is Mustahik records with an approved/post-approval workflow status (`Disetujui`, `Pengajuan Dana (FPD)`, `Pengajuan Dana (PPD)`, `PPD`, `FPD`, `Penyaluran Selesai`, or `Selesai`) and a `disbursement_date` within the selected inclusive UTC calendar-date range. Amounts use `approved_amount`; people counts use stored `beneficiary_count`, including genuine zero. Undated, future-dated, rejected, and submitted records do not contribute. PPD mirrors the same payment and is not added again. Program and asnaf sums use the identical predicate; missing categories retain an explicit unclassified group so totals reconcile.

## API shape and semantics

- `getPeriodStart(period, now)` accepts `7d`, `30d`, and `1y`, subtracting 7/30/365 UTC days. Invalid overview periods are rejected before opening a database. The start and current date are inclusive, following the brief's parser.
- `getPenyaluranOverview(period)` preserves `period`, `metrics`, `monthlyTrend`, `asnafBreakdown`, `programImpact`, and `actionRail`; adds `dataStatus`, `dateRange: { start, end }`, and `unavailableMetrics`.
- Overview `dataStatus` is `ready` when any qualifying realized record exists, even if its approved amount is zero; otherwise `empty`. Empty realized sets have zero financial/beneficiary totals and empty chart arrays.
- `totalMustahik` counts qualifying records; `totalJiwa` sums their stored beneficiary counts. `penyaluranBulanIni` is the current month's portion of the selected period.
- Monthly rows are grouped in SQL and sorted by `YYYY-MM`; `realisasi` retains the previous billions-of-rupiah unit, `mustahik` is the record count, and target is unavailable/zero. Months without qualifying rows are omitted.
- `programImpact` includes persisted program groups, including custom/unclassified programs, with `id`, `name`, and `category` using that stored group label. `realizedAmount` is rupiah and `beneficiariesCount` sums stored beneficiaries. No invented five-pillar totals or target-derived fallback counts remain.
- Unavailable RKAT, growth, compliance, monthly/program targets, program target attainment, and SLA exception counts are zero for existing numeric consumers and explicitly named in `unavailableMetrics`. No period-scoped authoritative targets/SLA policy exist in the current schema. Operational queue items and activity logs retain their existing all-time scope.
- `getLaporanList(filters)` preserves reports/categoryCounts/KPI/distribution arrays and `count`; adds `dataStatus`, `period`, and `dateRange`. It is `ready` if matching catalogue reports or qualifying realized records exist.
- Report month filters accept `YYYY-MM` or Indonesian month/year names generically, matching the report's period instead of all reports from 2026 or its modification date. Rolling periods use report `updated_at` for catalogue selection and disbursement dates for realized amounts. Missing/all/Semua periods use all realized records through today.
- Category aliases and search apply to catalogue rows, not the financial population. Category counts and report-count KPIs describe that filtered catalogue. Financial KPIs and distributions always describe the selected date range across all programs/asnaf, independent of catalogue category/search.
- Report KPIs retain display fields and add `key`/numeric `rawValue`: `totalRealisasi`, `totalMustahik`, `totalLaporan`, `laporanSiapEkspor`. Unsupported document-verification/SLA claims were replaced with actual Mustahik/report counts. Program allocation adds numeric `amount`; asnaf distribution adds numeric beneficiary `count`. Report `metrics_json` remains returned as stored but is never summed into headline totals, because report snapshots overlap.

## RED/GREEN evidence

1. Added database/clock injection arguments before behavior changes, including forwarding the same database into overview stage/activity lookups. These seams preserve normal callers while preventing tests from opening configured databases.
2. Wrote initial 11 tests before replacing aggregate behavior. `node --test server/repository.metrics.test.js` exited 1: 0 passed, 11 failed. SQLite assertions observed missing `dataStatus` (`undefined` versus `empty`/`ready`); parser was absent. PostgreSQL cases additionally exposed the original SQLite-only `strftime` call.
3. After implementation, SQLite cases passed. The PostgreSQL emulator lacks native PostgreSQL `substr` and `nullif`; registered only those scalar functions in the test fixture, retaining real SQL aggregation/filtering. Then all 11 passed.
4. Added two status-alias regression cases first. `node --test --test-name-pattern='persisted funding stage' server/repository.metrics.test.js` exited 1: both failed with 2,000,000 actual versus 4,000,000 expected. Corrected the funding-stage aliases to the persisted workflow names.
5. Final `node --test server/repository.metrics.test.js server/access-policy.test.js server/access-control.integration.test.js server/audit-log.test.js server/public-tracking.repository.test.js`: **38 passed, 0 failed**, including 13 metrics cases.
6. `node --check server/repository.js`, `git diff --check`, and staged diff check passed. Git emitted only existing environment warnings about line-ending normalization/ignore-file access; the commit succeeded after granting the requested repository metadata write through the normal escalation path.

Tests cover empty data, zero-valued approved records, UTC starts, invalid period rejection, inclusive period boundaries, old/future/missing dates, unapproved statuses, persisted workflow aliases, monthly grouping, total reconciliation, beneficiary counts, report month aliases, category/search filters, export-ready report counts, and snapshot-overlap avoidance.

## Isolation and limitations

- Tests use SQLite `:memory:` and the existing `pg-mem` dependency only. They never invoke `getDb`/`initDb`, connect to PostgreSQL, open a persisted SQLite file, or change production/seed data. The import retains existing dotenv initialization but database connections are lazy and bypassed.
- PostgreSQL coverage is emulator-based, not a live PostgreSQL integration run; only `substr` and `nullif` are supplied as test-native scalar equivalents.
- The existing schema stores disbursement dates as text. These aggregates assume normalized `YYYY-MM-DD` values; malformed legacy date text requires separate cleanup/validation.
- Mustahik is the authoritative aggregate source for this task. PPD-only historical payments that were not mirrored onto Mustahik are not reconciled here.
- Persisted demo seed records, if present in a database, remain persisted records. `ready` means qualifying rows exist, not that records were independently certified as production financial data. Seed behavior was explicitly outside scope.
- Program initiatives lack a reporting-period budget contract, so their all-time budgets are not presented as period RKAT targets. Zero/unavailable target fields require the upcoming consumer provenance handling to avoid implying a known zero target.
- The frontend's existing fallback behavior and API types were intentionally unchanged. Other repository endpoints with demo material remain outside this task.
