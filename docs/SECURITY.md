# Dependency security audit

Date: 2026-10-24

## npm audit

Command: `npm audit --json`

Production audit: `npm audit --omit=dev --json`

The production audit reported no vulnerabilities. The full audit reported six development dependency findings:

| Package | Severity | Direct or transitive | Dependency scope | Vulnerable range | Fix available | Major-version change | Advisory |
|---|---|---|---|---|---|---|---|
| `@vitest/mocker` | Moderate | Transitive | Development | `<=4.1.11` | Yes, via `vitest@5.0.5` | Yes | GHSA-82fw-gwwq-j7x9; GHSA-qxg6-89mg-rqv8 |
| `esbuild` | Moderate | Transitive | Development | `<=0.24.2` | Yes, via `vite@8.3.5` | Yes | GHSA-67mh-4wv8-2f99 |
| `tinypool` | Critical | Transitive | Development | `<=2.1.1` | Yes, via `vitest@5.0.5` | Yes | GHSA-5gmw-xhrv-c9v3; GHSA-85c8-ppgw-ccpr |
| `vite` | High | Direct | Development | `<=6.4.3` | Yes, `vite@8.3.5` | Yes | GHSA-4w7w-66w2-5vf9; GHSA-v6wh-96g9-6wx3; GHSA-fx2h-pf6j-xcff; GHSA-698v-4r3x-3vcv; GHSA-r825-w8mm-5pxw; GHSA-587h-7wmj-h5pm; GHSA-9jrq-w75r-8gcw; GHSA-rq7h-c2jc-7f22 |
| `vite-node` | Moderate | Transitive | Development | `<=2.2.0-beta.2` | Yes, via `vitest@5.0.5` | Yes | Included through the Vitest/Vite dependency chain |
| `vitest` | Critical | Direct | Development | `<=4.1.10` | Yes, `vitest@5.0.5` | Yes | GHSA-5xrq-8626-4rwp; GHSA-82fw-gwwq-j7x9 |

`npm audit fix` was run without `--force`; it made no changes because no same-major fixes are available. All six findings are deferred. They are development-only tooling findings and are not included in the production bundle. A future Vite/Vitest major upgrade should be tested separately.

Accepted risk: development-server issues in Vite/esbuild are accepted for local development only; the dev server is not deployed as the production application.

## pip-audit

Command: `api\.venv\Scripts\python.exe -m pip_audit`

The one-time audit reported 106 known vulnerabilities in two installed packages:

| Package | Installed version | Findings | Fix status |
|---|---:|---:|---|
| `pip` | 25.3 | 10 reported entries, 5 unique advisory IDs | Deferred; the audit tool reports fixes in newer pip releases, but pip is not an application dependency |
| `pypdf` | 5.9.0 | 96 reported entries, 60 unique advisory IDs | Deferred; available fixes require `pypdf` 6.x, outside the pinned `<6` range and requiring parser compatibility review |

Accepted risk: `pip` is a virtualenv package-management tool and is not part of the deployed API runtime. The `pypdf` findings require a major upgrade; the current application constraint is retained until the parser behavior and fixture compatibility can be reviewed.
