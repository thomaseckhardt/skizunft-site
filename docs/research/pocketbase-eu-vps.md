# PocketBase (SQLite) on an EU VPS for Bookings

Research for issue #15 (part of map issue #4). Sources were read on **2026-10-13**. Every claim links to a primary source (official docs, GitHub repo/releases/source, pricing and legal pages). Anything I could not confirm is marked **[unverified]**. Arithmetic or conclusions I drew on top of a source are marked **(derived)**.

This file lists facts only. The choice is made in the database grilling ticket.

## Context

- The site runs Astro `^4.16.17` with `output: 'hybrid'` and `@astrojs/netlify` `^5.5.4` (`package.json`, `astro.config.mjs` on `main`). Server endpoints and the plain functions in `netlify/functions/` run as Netlify Functions.
- The club is on a legacy Netlify Pro plan with Functions in Frankfurt (issue #14).
- Volume: <200 Bookings per year, <5 admin users (issue #15).
- Neon facts below are taken from the existing research in `docs/research/eu-database-options.md` (branch `research/eu-database-options`), not re-researched.

---

## 1. Project status

| Fact | Source |
|---|---|
| Latest release: **v0.40.5**, published 2026-10-08. | <https://github.com/pocketbase/pocketbase/releases/tag/v0.40.5> |
| Release cadence 2026: v0.36.0 (Jan 16), v0.37.0 (Apr 19), v0.38.0 (May 7), v0.39.0 (May 28), v0.40.0 (Aug 23), plus patch releases v0.40.1–v0.40.5 (Aug 24 – Oct 8). | <https://github.com/pocketbase/pocketbase/releases> |
| Licence: MIT. ~61k GitHub stars; last push 2026-10-12. | <https://github.com/pocketbase/pocketbase> |
| Still pre-1.0: "full backward compatibility is not guaranteed before reaching v1.0.0." | <https://github.com/pocketbase/pocketbase#readme> |
| "PocketBase is NOT recommended for production critical applications yet, unless you are fine with reading the changelog and applying some manual migration steps from time to time." | <https://pocketbase.io/docs/> |
| No v1.0 date: the FAQ points to a roadmap with "no fixed ETAs". | <https://pocketbase.io/faq/> |
| Maintenance model: "There is no paid team or company behind it. It is a personal open source project with intentionally limited scope and developed entirely on volunteer basis." "There are no promises for maintenance and support beyond what is already available." | <https://pocketbase.io/faq/> |
| Scaling: single server only ("vertical"); positioned for "small and midsize applications". | <https://pocketbase.io/faq/> |

### Breaking-change history (what an upgrade can look like)

- **v0.23.0** was "a major refactor" with "many Go/JSVM and Web APIs breaking changes". `pb_data` is auto-upgraded on start, but hooks, migrations and JS SDK code "will have to be migrated manually". — <https://github.com/pocketbase/pocketbase/blob/master/CHANGELOG_23_39.md>
- **v0.40.0** (2026-08-23) moved to Go 1.27 / `encoding/json/v2`, which is "not fully backward compatible"; the maintainer writes: "I recommend to not push blindly an update on production and to test your PocketBase application first locally". It also changed console-command exit codes ("slight breaking change"). — <https://github.com/pocketbase/pocketbase/releases/tag/v0.40.0>
- **v0.37.0** shipped a UI "rewritten from scratch"; the new UI extension APIs "will intentionally remain undocumented" for now. — CHANGELOG_23_39 above
- **Old line still patched:** v0.22.x still receives backported security fixes (v0.22.56 on 2026-10-08, "Backported from v0.40.5"), although the v0.23.0 note only promised backports "until Q1 of 2025 (if not longer)". — <https://github.com/pocketbase/pocketbase/releases/tag/v0.22.56>, CHANGELOG_23_39 above
- Recent security-relevant patch: v0.40.5 bumped Go to 1.27.2 for `net/http` fixes, including "a DoS that could potentially affect PocketBase applications and it is advised to update." — v0.40.5 release above

---

## 2. Admin dashboard and auth

### Who can use the built-in dashboard (`/_/`)

- The dashboard login is the **superuser** login: the UI ships `pageSuperuserLogin.js` and authenticates against the `_superusers` collection. — <https://github.com/pocketbase/pocketbase/blob/master/ui/src/pb.js>, <https://github.com/pocketbase/pocketbase/tree/master/ui/src/auth>
- "Superusers can access and modify anything (collection API rules are ignored)." — <https://pocketbase.io/docs/authentication/>
- "The API Rules are ignored when the action is performed by an authorized superuser (superusers can access everything)!" — <https://pocketbase.io/docs/api-rules-and-filters/>
- No dashboard roles, read-only superusers or per-collection dashboard permissions are documented. **[unverified]** that none exist on the roadmap (the roadmap project could not be read).
- So giving a ski-school team member dashboard access gives them full rights, including collection schema, settings, backups/restore and (since v0.39.0) a raw "SQL console" that the changelog warns "can break your application if not used with proper care". **(derived)** — <https://github.com/pocketbase/pocketbase/blob/master/CHANGELOG_23_39.md>
- Dashboard usability for non-technical users: v0.37.0 added "Basic responsive/mobile support (it is far from perfect …)", dark mode, field help texts and bulk JSON export. — CHANGELOG_23_39 above
  - Dashboard language: no localisation/i18n entries found in the changelogs, so presumably English only. **[unverified]**
  - CSV export from the dashboard: not found (only JSON export mentioned). **[unverified]**

### Superuser management

- CLI: `superuser create | upsert | update | delete | otp | ips`. — <https://github.com/pocketbase/pocketbase/blob/master/cmd/superuser.go>
- Hardening recommended in production docs: superuser IP/CIDR allow-list (v0.38.0+; a stolen superuser token then gets 403), and MFA+OTP for `_superusers` ("one-time password (email code)"). — <https://pocketbase.io/docs/going-to-production/>
- OAuth2 is not supported for `_superusers`. — <https://pocketbase.io/docs/authentication/>

### Auth collections (for a custom admin area)

- Collection types: base, view, auth. — <https://pocketbase.io/docs/collections/>
- Auth methods: password, **OTP** (email code; the user enters the code with the returned `otpId`), OAuth2, and MFA (two methods in sequence). — <https://pocketbase.io/docs/authentication/>
- The docs warn OTP alone "could be less secure" (digit-only codes) and recommend combining it with MFA for security-critical apps. — same page
- **Magic link:** no magic-link (click-to-log-in) flow is documented; the passwordless option is the OTP email code. — same page
- **Invitations:** no invitation feature is documented. — same page. A superuser can create records in an auth collection via the dashboard and let the user set a password via the password-reset email **(derived, [unverified] as a documented flow)**.
- Roles: done with API rules on a field, e.g. `@request.auth.role = 'staff'`. Rules are per action (`listRule`, `viewRule`, `createRule`, `updateRule`, `deleteRule`); `null` (default) = superusers only, `""` = anyone. — <https://pocketbase.io/docs/api-rules-and-filters/>
- Auth collection users **cannot** use the built-in dashboard (see above); a staff role therefore implies a custom admin UI (e.g. Astro pages calling the API). **(derived)**
- Emails (OTP, password reset, verification) need SMTP; the docs recommend an external SMTP service because the default "most likely will get marked as spam or even fail to deliver". — <https://pocketbase.io/docs/going-to-production/>
  - Whether Brevo SMTP (already used by the site) works as PocketBase's SMTP: expected but **[unverified]**.

---

## 3. Access from Netlify Functions / Astro endpoints

- PocketBase is accessed over HTTPS REST (no SQL wire protocol to the outside). The official JS SDK is `pocketbase` on npm, latest **0.28.1** (2026-09-05); 0.28.0 added support for an endpoint of "PocketBase v0.40.0". — <https://registry.npmjs.org/pocketbase>, <https://github.com/pocketbase/js-sdk/blob/master/CHANGELOG.md>
- SSR guidance: "Create a new `PocketBase` instance for each server-side request", feed `pb.authStore` from a cookie, update the cookie before responding. An **Astro** middleware example (`Astro.locals.pb`) is included. — <https://github.com/pocketbase/js-sdk#ssr-integration>
  - The Astro example tells you to set `output: 'server'`; with `output: 'hybrid'` the endpoints must opt out of prerendering instead **(derived)**.
- Node < 17 needs a `fetch()` polyfill; realtime in Node needs an `EventSource` polyfill (not needed for plain CRUD). — js-sdk README above
- Server-side filters with user input should use `pb.filter(expr, params)` to avoid "string injection attacks". — js-sdk README above
- Auto-cancellation of duplicate requests is on by default; disable with `pb.autoCancellation(false)` or `requestKey: null`. — js-sdk README above
- Server-to-server auth: there are **no traditional API keys**. Options:
  - `pb.collection("_superusers").authWithPassword(...)` with credentials in Netlify env vars, or
  - a non-renewable `_superusers` **impersonate token** generated via API or dashboard, used "with extreme care and only for internal server-to-server communication"; revoked by changing that superuser's password.
  - Source: <https://pocketbase.io/docs/authentication/>
  - Alternative without a superuser: a public `createRule` on the bookings collection lets the endpoint (or anyone) create records, with server-side validation in the Astro endpoint **(derived)**.
- **IP allow-listing conflict:** Netlify Functions' outbound IPs "fluctuate"; static IPs (Private Connectivity) are an "add-on to Enterprise plans only". — <https://docs.netlify.com/manage/security/private-connectivity/>
  - So the PocketBase superuser IP allow-list cannot be scoped to Netlify Functions on the legacy Pro plan; if functions use a superuser token, the allow-list must stay open (or a non-superuser auth record is used instead). **(derived)**
- Latency Netlify Frankfurt (AWS) → Hetzner Falkenstein/Nuremberg: not documented. **[unverified]**
- No cold start on the PocketBase side: it is a long-running process (systemd `Restart = always`). — <https://pocketbase.io/docs/going-to-production/>

---

## 4. Backups and restore

- Built-in since v0.16: backups from the dashboard, stored "locally or in S3-compatible storage"; a backup is "a full snapshot as a ZIP archive of the `pb_data` directory". Performance "could be slightly degraded" while it runs. — <https://pocketbase.io/docs/going-to-production/>
- Scheduling: `BackupsConfig` has `Cron` (cron expression; empty disables auto backups), `CronMaxKeep` (number of auto backups kept), and an optional `S3` target. — <https://github.com/pocketbase/pocketbase/blob/master/core/settings_model.go>
- v0.39.0: superusers get system email alerts "in case of an error with the automated backups". v0.40.0: backups no longer transaction-lock the database. — CHANGELOG_23_39 and v0.40.0 release above
- API (superusers only): list, create, upload, download (file token), delete, **restore** (`POST /api/backups/{key}/restore`, which "restarts the current running PocketBase process"). — <https://pocketbase.io/docs/api-backups/>
- Manual alternative: copy/replace `pb_data` while the app is stopped; for 5 GB+ use `sqlite3 .backup` + rsync. — <https://pocketbase.io/docs/going-to-production/>
- S3-compatible targets named in the docs: AWS S3, MinIO, Wasabi, DigitalOcean Spaces, Vultr Object Storage, "etc." — <https://pocketbase.io/docs/files-handling/>
  - Hetzner Object Storage is "S3-compatible", in fsn1/nbg1/hel1. — <https://docs.hetzner.com/storage/object-storage/overview/> Whether it works as a PocketBase backup target: expected, **[unverified]**.
- VPS-level backups (Hetzner): daily disk backups, 7 slots, billed at 20 % of the server price. — <https://docs.hetzner.com/cloud/servers/backups-snapshots/overview/>, <https://docs.hetzner.com/cloud/billing/faq/>
  - A disk image of a running SQLite database is crash-consistent at best; PocketBase's own backup is the application-consistent one. **(derived)**

---

## 5. EU hosting options and monthly cost

### 5a. Hetzner Cloud (Germany) — self-managed

- Prices since **2026-06-15** for new orders (Germany FSN/NBG and Finland HEL, **excl. VAT**): CX23 €5.49, CX33 €8.49, CAX11 (Arm) €5.99. — <https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/>
  - CX23 specs (2 vCPU, 4 GB RAM, 40 GB): the official page renders prices/specs via JS; specs **[unverified]** from a primary source.
- Primary IPv4: €0.50/month excl. VAT. — <https://docs.hetzner.com/general/infrastructure-and-availability/ipv4-pricing>
  - Whether IPv4 is required: Netlify Functions run on AWS; IPv6-only reachability from them is **[unverified]**, so assume IPv4 is needed.
- Server backups: +20 % of server price. — <https://docs.hetzner.com/cloud/billing/faq/>
- Object Storage (optional off-site backup target): base price reportedly €4.99/month incl. 1 TB — the official page did not render the number. **[unverified]** — <https://www.hetzner.com/storage/object-storage/>
- **Example total (derived):** CX23 €5.49 + IPv4 €0.50 + backups €1.10 = **€7.09/month net ≈ €8.43 incl. 19 % VAT**, before Object Storage and domain.
- SLA: "commercially reasonable efforts to ensure a monthly availability of 99.9% for every Cloud Server", compensated as cloud credit. — <https://docs.hetzner.com/general/company-and-policy/slas-cloud/>
- Hetzner made a price adjustment in June 2026; existing servers on "legacy pricing" may switch to current pricing on certain changes. — price-adjustment page above

### 5b. netcup (Germany) — comparable self-managed VPS

- VPS 500 G12.5: 2 vCore, 4 GB RAM, 64 GB SSD, traffic included, "12 months contract period, from monthly €8.26" (page also shows €9.50 "incl. 19% VAT"). Locations listed include Nuremberg and Vienna (plus Amsterdam, Manassas/USA, Singapore). — <https://www.netcup.com/en/server/vps>
  - Which of €8.26 / €9.50 applies to which billing term: page says 12-month term saves ~13 % vs monthly, so €8.26 is presumably the 12-month price incl. VAT **[unverified]**.
- DPA: concluded in the Customer Control Panel (Master Data > Order Processing > Generate DPA); "Your electronic signature is sufficient". — <https://www.netcup.com/en/helpcenter/documentation/general/dpa>

### 5c. Managed PocketBase hosting

| Provider | What | EU / legal | Price | Source |
|---|---|---|---|---|
| **Elestio** | Managed PocketBase on a dedicated VM: "Automated backups", "Auto SSL", "Auto Updates", "Monitoring / Alerts". Providers include Hetzner, Netcup, Scaleway, T-Cloud and others. | Contracting entity Elestio Limited, Dublin, Ireland. DPA "forms an inseparable part" of the General Terms (updated 2026-09-09); EEA sub-processor choice keeps data in the EEA. | "starting at $11/mo" (USD; which provider/region that price refers to **[unverified]**). Backup retention 7 days on free support level. | <https://elest.io/open-source/pocketbase>, <https://elest.io/pricing>, <https://docs.elest.io/books/legal-compliance/page/elestio-data-processing-agreement> |
| **PocketHost** | PocketBase-specific host, "Global Fly ingress". | Operator PocketHost, Reno, NV, USA; Nevada law. No data region, GDPR or DPA statement found. | $9.99/month, $59.99/year or $149.99 lifetime per instance. | <https://pockethost.io/pricing>, <https://pockethost.io/terms> |

- There is no official managed PocketBase offering from the project itself (FAQ only lists VPS providers: "Hetzner, Vultr, UpCloud, Linode, etc."). — <https://pocketbase.io/faq/>

---

## 6. GDPR

- **Hetzner DPA (Art. 28 GDPR):** concluded online in the account at `accounts.hetzner.com/account/dpa` by ticking "I agree to the agreement"; no handwritten signature. Contracting party: Hetzner Online GmbH (Germany). Sub-processor list: <https://www.hetzner.com/AV/subunternehmer.pdf>. — <https://docs.hetzner.com/general/general-terms-and-conditions/data-privacy-faq/>
- **Data location:** for cloud products it depends on the chosen location; EU locations are Falkenstein, Nuremberg (DE) and Helsinki (FI). — same page
- **US access:** Hetzner states US authorities have no "direct access to the contents of your server data in the EU", while "no 100% guarantee against access by official requests and/or court orders" exists. — same page
- With PocketBase self-hosted, the SQLite file (`pb_data`) sits only on the VPS disk and on the chosen backup target; PocketBase itself is software, not a processor. **(derived)**
- Booking data still passes through Netlify Functions (Frankfurt) and Netlify's DPA as before (see existing research). — `docs/research/eu-database-options.md`
- Compared with Neon: Hetzner/netcup are EU (German) contracting entities; Neon contracts via Databricks, Inc. (US) with SCCs. — existing research

---

## 7. Operational burden (self-hosted)

| Task | What the sources say | Source |
|---|---|---|
| Install / run | Single binary; systemd unit with `Restart = always`, `RestartSec = 5s`, `LimitNOFILE = 4096`. | <https://pocketbase.io/docs/going-to-production/> |
| TLS | `pocketbase serve yourdomain.com` obtains a Let's Encrypt certificate itself, listens on :443 and redirects HTTP to HTTPS; alternatively behind Caddy/NGINX (set trusted proxy IP headers). | <https://pocketbase.io/docs/going-to-production/>, <https://github.com/pocketbase/pocketbase/blob/master/cmd/serve.go> |
| PocketBase updates | `./pocketbase update` updates the prebuilt executable; changelog must be read because of pre-1.0 breaking changes; maintainer advises testing locally before production (v0.40.0). Security fixes arrive as patch releases (e.g. v0.40.5 DoS fix). | <https://github.com/pocketbase/pocketbase/releases/tag/v0.40.5>, <https://github.com/pocketbase/pocketbase/releases/tag/v0.40.0> |
| JS SDK updates | SDK versions track server features (e.g. 0.28.0 for v0.40.0); old SDK versions must be pinned for old servers (v0.23 note). | <https://github.com/pocketbase/js-sdk/blob/master/CHANGELOG.md>, CHANGELOG_23_39 above |
| OS updates, firewall, SSH | Not covered by Hetzner for Cloud servers (unmanaged VPS); the Hetzner FAQ does not state OS management. **[unverified]** as an explicit statement. | <https://docs.hetzner.com/cloud/servers/faq/> |
| Hardening | Rate limiter, superuser IP allow-list, superuser MFA, optional `PB_ENCRYPTION_KEY` for settings, `GOMEMLIMIT` on small machines. | <https://pocketbase.io/docs/going-to-production/> |
| Monitoring | `GET/HEAD /api/health` returns `{"status":200,"message":"API is healthy.", …}` — usable by an external uptime checker. Backup-failure email alerts since v0.39.0. | <https://pocketbase.io/docs/api-health/>, CHANGELOG_23_39 above |
| Downtime | Single server, no horizontal scaling; restore and (presumably) updates restart the process. Hetzner SLA 99.9 % per month. | <https://pocketbase.io/faq/>, <https://pocketbase.io/docs/api-backups/>, <https://docs.hetzner.com/general/company-and-policy/slas-cloud/> |
| Who does it | All of the above falls on the club (Thomas); with Elestio, updates/TLS/backups/monitoring are provided by the host. | Elestio page above **(derived)** |

---

## 8. Comparison with Neon (Frankfurt)

Neon column from `docs/research/eu-database-options.md` (same date, primary sources cited there).

| | PocketBase on Hetzner CX23 | Neon (Free / Launch) |
|---|---|---|
| Engine | SQLite (embedded in PocketBase) | Postgres |
| Maturity | Pre-1.0, single volunteer maintainer, breaking changes possible | Managed service (Databricks) |
| Location | Falkenstein or Nuremberg (DE), chosen by you | AWS Frankfurt |
| Contracting entity | Hetzner Online GmbH (DE) | Databricks, Inc. (US) |
| DPA | Online click-through in Hetzner account | Databricks DPA / legacy Neon DPA; mode **[unverified]** |
| Monthly cost | ≈ €7.09 net / €8.43 gross with IPv4 + server backups **(derived)** | $0 Free; Launch pay-as-you-go |
| Cold start / pause | None (always-on process) | Scales to zero after 5 min, wakes in ~100s of ms |
| Access from Netlify Functions | HTTPS REST via `pocketbase` JS SDK | `@neondatabase/serverless` HTTP/WS driver + pooler |
| Built-in admin UI | Dashboard, **superusers only, full rights** | Console Tables view; org members see all projects |
| Built-in auth for a custom admin area | Auth collections: password, email OTP, OAuth2, MFA; roles via API rules; no magic link, no invitations | Managed Better Auth: email OTP, magic link, OAuth, Admin plugin roles |
| Backups | Built-in cron ZIP backups to local disk or S3; + Hetzner daily disk backups (7 slots) | 6 h PITR on Free, up to 7 days on Launch; `pg_dump` |
| Ops burden | OS, PocketBase updates, TLS (automatic), monitoring, backups on you | Managed |
| Export / lock-in | `pb_data` SQLite file + ZIP backups; app code coupled to PocketBase API/SDK **(derived)** | Standard Postgres, `pg_dump` |

## Open / unverified items

- Whether PocketBase's roadmap contains dashboard roles / non-superuser dashboard access (roadmap page not readable).
- Dashboard UI language (English only?) and CSV export.
- Brevo SMTP and Hetzner Object Storage as PocketBase SMTP/S3 targets (expected to work, not confirmed).
- Hetzner CX23 exact specs and Object Storage base price from a rendered official page.
- Whether Netlify Functions can reach an IPv6-only server (decides if the €0.50 IPv4 is needed).
- netcup: which displayed price belongs to which billing term.
- Elestio: actual monthly price for PocketBase on Hetzner/netcup Germany.
- Latency between Netlify Functions (Frankfurt) and Hetzner Falkenstein/Nuremberg.
