# EU-hosted database options for Bookings

Research for issue #5 (part of map issue #4). Sources were read on **2026-10-13**. Every claim links to a primary source (official docs, pricing pages, legal documents). Anything I could not confirm is marked **[unverified]**. Arithmetic I did on top of a source is marked **(derived)**.

This file lists facts only. The choice is made in a separate grilling ticket.

## Context that shapes the comparison

- The site runs Astro `^4.16.17` with `output: 'hybrid'` and `@astrojs/netlify` `^5.5.4` (`astro.config.mjs`, `package.json` on `main`). Astro server endpoints are deployed as Netlify Functions, and the repo also has plain functions in `netlify/functions/`.
- **Where Netlify Functions run matters for GDPR whatever the database is.** New sites deploy functions to `cmh` (US East, Ohio) by default. Changing the functions region (self-serve EU options: `fra` Frankfurt, `dub` Ireland, `lhr` London; `cdg` Paris and `mxp` Milan via support) is "available on all Pro and Enterprise plans" only. Sites created before 2023-10-04 may have a different default. — <https://docs.netlify.com/build/functions/configuration/>
  - So on a Free or Personal Netlify plan, booking data passes through a function running in the US, even if the database sits in the EU.
- Netlify accounts created before 2025-09-04 are on **Legacy** pricing plans. Switching to a Credit-based plan is "irreversible". — <https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/>
  - Which plan the club's Netlify team is on today: **[unverified]**.
- Expected volume is a few hundred Bookings per season, so storage and row counts are negligible on every candidate. What actually differs is fixed monthly cost, inactivity behaviour and region.

---

## 1. Netlify Database (GA, built on the Netlify platform)

Netlify Database became generally available on 2026-04-28. It replaces the beta "Netlify DB" Neon extension (`@netlify/neon`), and existing extension databases keep working. — <https://www.netlify.com/changelog/2026-04-28-netlify-database/>

- **What it is:** "a fully managed Postgres database built into the Netlify platform". Provisioning, migrations and per-deploy-preview branches are handled automatically. — <https://docs.netlify.com/build/data-and-storage/netlify-database/>
- **Plan requirement:** "available on Credit-based plans only". — same page

### EU region

- The REST API says "The database region defaults to the site's functions region if not specified", and the API takes an optional `region` parameter. — <https://docs.netlify.com/build/data-and-storage/netlify-database/api/>
- The docs never list which database regions exist, or whether an EU region can be picked in the UI. **[unverified]**
- Functions region can only be changed on Pro and Enterprise (see Context). On Free or Personal, the default database region would follow `cmh` (Ohio). **(derived, [unverified] in practice)**
- Netlify's sub-processor list includes **Neon** ("Third-party provider for a Netlify Extension that lets users create a Postgres database", location US). — <https://netlify.com/trust-center?itemUid=e3fae2ca-94a9-416b-b577-5c90e382df57>
  - Whether the GA product also runs on Neon: **[unverified]**.

### GDPR / DPA

- Netlify's DPA "forms part of the Enterprise Master Subscription Agreement and the Self-Serve Subscription Agreement". It applies automatically and includes Standard Contractual Clauses. Last updated 2026-06-09. — <https://www.netlify.com/pdf/netlify-dpa.pdf>, <https://www.netlify.com/gdpr-ccpa/>
- All listed sub-processors are in the US. — sub-processor link above

### Pricing (credits)

- **Compute:** 10 credits per compute unit-hour.
- **Bandwidth out:** 20 credits/GB.
- **Storage:** "free until July 1, 2026", then "billed no earlier than July 1, 2026, with rates announced in advance". The docs still show that wording on 2026-10-13, so the current storage price is **[unverified]**.
- Source for all three: <https://docs.netlify.com/build/data-and-storage/netlify-database/billing-and-usage/>

**Plan credits:** Free is $0 for 300 credits/month with a hard limit, Personal is $9 for 1,000 credits, and Pro is $20 for 3,000 credits with unlimited seats. The credits are shared with everything else on the site:

- production deploys: 15 credits each
- functions: 10 credits/GB-hour
- web requests: 2 credits per 10k
- web bandwidth: 20 credits/GB

— <https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/>

When credits run out, "all of your web projects … are paused", which means the whole site goes offline, not just the database. — <https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/>

**Limits per plan:**

| Limit | Free | Personal | Pro |
|---|---|---|---|
| Compute units per billing period | 48 | No limit | No limit |
| Storage | 5 GB | 100 GB | 100 GB |
| Compute units per database (max) | 1 | 4 | 16 |
| Scheduled backup retention | 3 days | 7 days | 30 days |

— <https://docs.netlify.com/build/data-and-storage/netlify-database/billing-and-usage/>

- 48 units at the 1-unit minimum means about 48 awake hours per month on Free. Each wake-up also counts at least the 5-minute idle tail. **(derived)**

### Inactivity and cold start

- The database pauses after 5 minutes of inactivity (default) and "resumes the next time a query arrives". The cold start is "typically … well under a second, but this is not guaranteed".
- Longer timeouts or "Always on" are only available on Pro and Enterprise. Nothing is deleted when the database is inactive.
- Source: <https://docs.netlify.com/build/data-and-storage/netlify-database/configure-sleep-on-inactivity/>

### Access from Functions / Astro

- `@netlify/database` provides `getDatabase()` with a `sql` tagged template and a `pg.Pool`. The driver is "automatically configured and optimized for where your code is running". `getConnectionString()` and the `NETLIFY_DB_URL` env var work with any Postgres driver. — <https://docs.netlify.com/build/data-and-storage/netlify-database/api/>, <https://docs.netlify.com/build/data-and-storage/netlify-database/tooling/>
- Drizzle has a native adapter, `drizzle-orm/netlify-db`. Migrations are applied automatically on each deploy. — tooling page above

### Table UI and auth for an admin area

- The Netlify UI has a database editor: a grid with filter, sort and inline edit/delete, plus an "Advanced" mode with inline SQL. — <https://docs.netlify.com/build/data-and-storage/netlify-database/edit-data/>
- Only the **Team Owner** can edit production data. Developers can view it. Other roles have no access. — <https://docs.netlify.com/build/data-and-storage/netlify-database/access-control/>
- Free and Personal plans "cannot add any additional team member seats". Pro has unlimited free seats. — billing FAQ above
- Netlify Database has no auth of its own. **Netlify Identity** is "available on all credit-based plans at no additional cost". It offers email/password, role-based access control and server-side verification in Functions. — <https://docs.netlify.com/manage/security/secure-access-to-sites/identity/overview/>
  - Where Identity data is hosted: **[unverified]**.

### Backups

- A backup is taken daily and on every production publish. Restores are point-in-time snapshots, and restoring creates a fail-safe branch of the pre-restore state. Only the Team Owner can restore.
- Retention: Free 3 days, Personal 7 days, Pro 30 days.
- Source: <https://docs.netlify.com/build/data-and-storage/netlify-database/backup-and-recovery/>

### Export / lock-in

- It is standard Postgres with a normal connection string, so `pg_dump`/`pg_restore` work. Netlify documents a dump/restore migration path from Neon, Supabase, RDS and others. — <https://docs.netlify.com/build/data-and-storage/netlify-database/switch-to-netlify-database/>
- The lock-in is mainly the `@netlify/database` helper and the deploy-coupled migrations. The SQL itself is portable. **(derived)**

---

## 2. Neon (direct account, now part of Databricks)

### EU region

- EU regions: AWS Frankfurt (`aws-eu-central-1`) and AWS London (`aws-eu-west-2`, UK, not EU). Azure regions are deprecated.
- The region is fixed when the project is created.
- Source: <https://neon.com/docs/introduction/regions>

### GDPR / DPA

- Neon states it "adhere[s] to GDPR". It also holds SOC 2, ISO 27001 and ISO 27701. — <https://neon.com/docs/security/compliance>
- Legal terms now run through Databricks. `neon.com/dpa` is a "Product Specific Schedule" under the Databricks Master Cloud Services Agreement, last updated 2026-08-05. — <https://neon.com/dpa>
- The Databricks DPA includes SCCs (Modules 2 and 3) and is written for countersignature. — <https://www.databricks.com/legal/dpa>
- A legacy Neon DPA, pre-signed via DocuSign, is still published. — <https://neon.com/pdf/DPA.pdf>
- Which DPA applies to a new self-serve Neon account in October 2026, and whether it applies automatically or must be signed: **[unverified]**.

### Pricing

The Free plan costs $0 and needs no card.

| Free plan item | Allowance |
|---|---|
| Compute | 100 CU-hours/project/month (≈400 h of a 0.25 CU compute) |
| Storage | 1 GB per project |
| Egress | 5 GB |
| Instant-restore history | 6 hours |
| Manual snapshots | 1 |

- On the Free plan, when CU-hours or egress run out, compute is suspended until the next month. When storage runs out, writes are blocked. "None of these limits delete your data."
- The **Launch** plan is pay-as-you-go: $0.106/CU-hour, $0.35/GB-month storage, history up to 7 days, no monthly minimum.
- Source: <https://neon.com/pricing>, <https://neon.com/docs/introduction/plans>

### Inactivity and cold start

- The database scales to zero after 5 minutes, which cannot be disabled on Free. It "reactivates automatically within a few hundred milliseconds". — <https://neon.com/docs/introduction/scale-to-zero>
- Automatic project deletion on AWS regions is not mentioned on the plans page. **[unverified]**
- The regions page mentions deletion of Free projects inactive 90+ days, but only for deprecated **Azure** regions. — <https://neon.com/docs/introduction/regions>

### Access from Functions / Astro

- `@neondatabase/serverless` queries over HTTP (`neon()`), or over WebSockets (`Pool`/`Client`) for interactive transactions. It works in serverless and edge runtimes, and Drizzle has a `neon-http` adapter. — <https://neon.com/docs/serverless/serverless-driver>
- A PgBouncer pooler in transaction mode handles up to 10,000 client connections and is recommended for serverless. — <https://neon.com/docs/connect/connection-pooling>

### Table UI and auth for an admin area

- The Console has a **Tables** view based on Drizzle Studio. It can add, update and delete records, filter, and export to CSV or JSON. — <https://neon.com/docs/guides/tables>
  - Per-role restrictions for the Tables view are not documented. **[unverified]**
- Organization members are unlimited on all plans, and they "have access to all projects within it". — <https://neon.com/docs/introduction/plans>
- **Managed Better Auth** is built in. It supports email OTP, magic link, OAuth and an Admin plugin for roles, with up to 60k MAU on Free. It runs in all regions, including Frankfurt. — <https://neon.com/docs/auth/overview>, <https://neon.com/pricing>, <https://neon.com/docs/introduction/regions>

### Backups

- Point-in-time restore uses the history window: 6 h on Free, up to 7 days on Launch, up to 30 days on Scale.
- Neon also documents `pg_dump` backups, including a nightly GitHub Action to S3.
- Source: <https://neon.com/docs/postgres/backup-restore/backups>, <https://neon.com/pricing>

### Export / lock-in

- Standard Postgres, `pg_dump` supported. — backups page above

---

## 3. Supabase

### EU region

- Specific EU regions: Ireland `eu-west-1`, Paris `eu-west-3`, Frankfurt `eu-central-1`, Stockholm `eu-north-1`. London and Zurich are also available but are not in the EU. — <https://supabase.com/docs/guides/platform/regions>
- The general "Europe" grouping "includes London and Zurich, which are not EU member states". To guarantee EU hosting, pick a specific region. — <https://supabase.com/docs/guides/security/gdpr-compliance>
- The primary Postgres, Auth and Storage all live in the chosen region. — GDPR page above

### GDPR / DPA

- The DPA "supplements and forms part of the Supabase Terms of Service", so it applies automatically. It includes SCCs. Version 1 is dated 2026-08-01. — <https://supabase.com/legal/dpa>

### Pricing

| Plan | Price | What's included |
|---|---|---|
| Free | $0 | 500 MB database, 5 GB egress, 50k MAU, limit of 2 active projects |
| Pro | from $25/month | $10 compute credits that cover one Micro instance, so one database-only project costs $25/month; 8 GB disk |

— <https://supabase.com/pricing>, <https://supabase.com/docs/guides/platform/billing-on-supabase>

### Inactivity

- Free projects "are paused after 1 week of inactivity". Owners get a warning email about a week before. A paused project can be restored from the dashboard for up to 1 year.
- Paid projects are never paused.
- Source: <https://supabase.com/docs/guides/platform/free-project-pausing>
- A paused project means booking requests would fail until someone resumes it manually. **(derived)**

### Access from Functions / Astro

- For serverless and edge functions, Supabase recommends the shared pooler (Supavisor) in transaction mode on port 6543, which is IPv4. Prepared statements must be turned off. Direct connections are IPv6 only unless the IPv4 add-on is used. — <https://supabase.com/docs/guides/database/connecting-to-postgres>
- `supabase-js` and the Data REST API work over HTTP. — <https://supabase.com/docs/guides/api>

### Table UI and auth for an admin area

- The dashboard includes a **Table Editor**. — <https://supabase.com/docs/guides/database/tables>
- On Free and Pro, member roles are Owner, Administrator and Developer. Developer has "content access to project resources". Read-Only and project-scoped roles need the **Team** plan ($599/month). — <https://supabase.com/docs/guides/platform/access-control>, <https://supabase.com/pricing>
- Supabase Auth is built in, with 50k MAU on Free. — <https://supabase.com/docs/guides/auth>, <https://supabase.com/pricing>

### Backups

- Free has no automatic backups; Supabase recommends regular `supabase db dump` instead.
- Pro has 7 days of daily backups. PITR is an add-on from $100/month per 7 days of retention.
- Source: <https://supabase.com/docs/guides/platform/backups>, <https://supabase.com/pricing>

### Export / lock-in

- Standard Postgres with `pg_dump` / CLI `db dump`. — backups page above
- Supabase's Auth and RLS conventions (`auth.users`, Data API) add coupling if used. **(derived)**

---

## 4. Turso (libSQL / SQLite)

### EU region

- An announcement dated 2026-10-01 says Turso Cloud "now runs in ten AWS regions". The EU regions live are **Ireland** (`aws-eu-west-1`) and **Stockholm** (`aws-eu-north-1`). Frankfurt and Paris are not available yet. — <https://turso.tech/blog/turso-cloud-new-regions>

### GDPR / DPA

- Subscribers can execute the DPA in the dashboard's "Documents" section. — <https://turso.tech/terms-of-use> (Terms last updated March 2024)
- A 2025-03-19 plan announcement lists the DPA as a feature of **Scaler** ($24.92/month billed yearly) and above. — <https://turso.tech/blog/turso-cloud-debuts-the-new-developer-plan>
- Whether the Developer plan ($4.99) now includes the DPA: **[unverified]**.

### Pricing

| Plan | Price | Notes |
|---|---|---|
| Free | $0 | 100 databases, 5 GB, 500M rows read/month, 10M rows written/month, 1-day PITR |
| Developer | $4.99/month | 10-day PITR |
| Scaler | $24.92/month | 30-day PITR |

— <https://turso.tech/pricing>

- When quotas are exceeded, queries fail with `BLOCKED`. — <https://docs.turso.tech/help/usage-and-billing>

### Inactivity

- "Databases get archived after 10 days of inactivity for users on a free plan." They are unarchived via CLI or API. — <https://docs.turso.tech/cli/group/unarchive>
- Whether the first query unarchives a database automatically: **[unverified]**.

### Access from Functions / Astro

- `@libsql/client/web` uses HTTP and is "compatible with edge and serverless runtimes". There is an official Astro guide. — <https://docs.turso.tech/integrations/vercel>, <https://docs.turso.tech/sdk/ts/guides/astro>
- The TS SDK lists "Netlify & Vercel Edge Functions" as compatible. — <https://docs.turso.tech/sdk/ts/reference>

### Table UI and auth for an admin area

- The docs point to third-party GUIs: Beekeeper Studio, Outerbase, TablePlus, DBeaver and others. — <https://docs.turso.tech/local-development>
- A built-in dashboard table editor is not documented. **[unverified]**
- Organization invites require the "scaler plan and above". — <https://docs.turso.tech/api-reference/organizations/invites/create-v2>
- Turso has no end-user auth product. Its "Authentication" docs cover database tokens. — <https://docs.turso.tech/sdk/authentication>

### Backups

- Turso has PITR, but restoring "creates a new database", so the app's connection string must change. — <https://docs.turso.tech/features/point-in-time-recovery>

### Export / lock-in

- `turso db export` writes a SQLite file. — <https://docs.turso.tech/cli/db/export>
- libSQL is an open-source fork of SQLite. — <https://docs.turso.tech/libsql>
- The SQL dialect is SQLite, not Postgres, so moving to Postgres later means a schema and query port. **(derived)**

---

## 5. Strong alternatives

### 5a. Scaleway Serverless SQL Database (French provider, EU-only)

- **Region:** Paris (`fr-par`). — <https://www.scaleway.com/en/serverless-sql-database/>
- **DPA:** the Scaleway DPA "forms an integral part of the contract", so it applies automatically. It states "Scaleway Services are located within the European Union by default" (version of 2024-06-01). — <https://www-uploads.scaleway.com/DPA_2024_ENG_b0abb5cc26.pdf>
- **Pricing:** €0.13752/vCPU/hour and €0.000272/GB/hour for storage. Backups are free (daily, kept 7 days). Billing starts at 1 GB, about €0.10/month. There is no free tier as such. — <https://www.scaleway.com/en/pricing/managed-databases/>, <https://www.scaleway.com/en/serverless-sql-database/>
- **Inactivity:**
  - After 5 minutes without queries the database goes idle and compute billing stops.
  - The cold start "usually takes less than five seconds". It can be avoided by provisioning a minimum of 1 vCPU.
  - Storage is always billed.
  - Source: <https://www.scaleway.com/en/docs/serverless-sql-databases/concepts/>, <https://www.scaleway.com/en/docs/serverless-sql-databases/faq/>
- **Access:**
  - It is PostgreSQL-compatible with built-in connection pooling, and "some minor features are disabled". — FAQ above
  - There is no HTTP/serverless JS driver documented, so it uses a standard TCP Postgres client. **[unverified]**
  - The authentication model is **[unverified]**; the docs page did not render.
- **Admin UI / auth:** no table editor and no end-user auth found. **[unverified]**
- **Backups / export:** daily backups kept 7 days. You can restore, create a new database from a backup, or export in `.pg_dump` format. — <https://www.scaleway.com/en/docs/serverless-sql-databases/how-to/manage-backups/>
- **Classic managed option:** Scaleway Managed Database for PostgreSQL DB-DEV-S costs €0.0156/hour, about €11.4/month **(derived)**. It is always on, with no cold start. — <https://www.scaleway.com/en/pricing/managed-databases/>

### 5b. Nhost (Swedish provider, Postgres + Hasura + Auth)

- **Region:** Frankfurt (`eu-central-1`) appears on the status page. — <https://status.nhost.io/>
  - The full region list is not in the docs. **[unverified]**
- **DPA:** pre-signed by Nhost AB. You email the completed copy to privacy@nhost.io and it becomes binding. Transfers outside the EU/EEA need prior consent and rely on SCCs. — <https://nhost.io/legal/data-processing-agreement>
- **Pricing:** Starter is free (1 GB database, 1 project) and is "paused after 1 week of inactivity". Pro is from $25/month with $15 compute credits. — <https://nhost.io/pricing>
- **Access:**
  - The GraphQL API is the main interface.
  - A direct Postgres connection is off by default and needs "public access" enabled. That access goes through a shared pgbouncer and supports a CIDR allow-list.
  - Source: <https://docs.nhost.io/products/database/access>
- **Admin UI / auth:** the dashboard UI lets you "create tables, manage relationships, and edit data", and an Auth service is included. — <https://nhost.io/product/database>
- **Backups:** Pro and Team get daily backups kept 7 days. Free has none; use `pg_dump`. PITR is an add-on. — <https://docs.nhost.io/products/database/backups>

### 5c. Xata (Postgres platform)

- **Region:** AWS `eu-central-1` (Frankfurt), with a 1.15× price multiplier. — <https://xata.io/pricing.md>
- **Pricing:** no free tier, only a 14-day trial. A micro instance in eu-central-1 costs $0.014/hour (about $10/month always-on), and storage costs $0.32/GB-month. — same page
- **Scale to zero:** wake-up time is 1 second. — same page
- **Access:** a serverless proxy accepts HTTP and WebSocket connections. — <https://xata.io/docs/core-concepts/serverless-proxy>
- **Compliance:** Xata calls itself "SOC-2, HIPAA and GDPR compliant". — <https://xata.io/security.md>
- DPA availability, backups and admin UI: **[unverified]**.

### 5d. Hetzner

- No standalone cloud managed-Postgres product was found. **[unverified]**
- PostgreSQL is included in Hetzner **Webhosting** packages (from 1 database on S) and **Managed Servers**, hosted in Nuremberg. — <https://www.hetzner.com/webhosting/level-4/>
- Port 5432 is reachable from outside with username and password, behind Hetzner's firewall. — <https://docs.hetzner.com/managed/databases/faq/>
- This is a traditional hosted database, so there is no serverless pooler and no HTTP driver. **(derived)**

---

## Comparison (small-club view)

| | Netlify Database | Neon | Supabase | Turso | Scaleway Serverless SQL | Nhost |
|---|---|---|---|---|---|---|
| Engine | Postgres | Postgres | Postgres | libSQL/SQLite | Postgres-compatible | Postgres (+Hasura) |
| EU region | Not documented; follows functions region (EU only on Pro) | Frankfurt | Frankfurt, Ireland, Paris, Stockholm | Ireland, Stockholm | Paris | Frankfurt (status page) |
| Contracting entity | Netlify, Inc. (San Francisco, US) | Databricks, Inc. (US) | Supabase Pte. Ltd (Singapore) | ChiselStrike / Turso (Delaware, US) | Scaleway SAS (Paris, FR) | Nhost AB (SE) |
| DPA | Auto, in ToS, SCCs | Databricks DPA / legacy Neon DPA; mode [unverified] | Auto, in ToS, SCCs | In dashboard; Scaler+ per 2025 blog | Auto, part of contract | Pre-signed, email back |
| Free tier | Free plan: 300 credits shared with whole site; 48 CU-h DB | 100 CU-h, 1 GB | 500 MB, 2 projects | 5 GB, 100 DBs | None (pay per use, ~€0.10/mo floor) | 1 GB, 1 project |
| Inactivity on free | Sleeps after 5 min, wakes on query | Sleeps after 5 min, wakes in ~100s of ms | **Paused after 1 week**; manual resume | **Archived after 10 days** | Idle after 5 min, wake < 5 s | **Paused after 1 week** |
| Cheapest no-pause paid | Pro $20 (Always-on option) | Launch, pay-as-you-go | Pro $25 | Developer $4.99 | Pay-as-you-go | Pro $25 |
| Serverless access | `@netlify/database` (auto) | HTTP/WS driver + pooler | Supavisor txn mode or supabase-js | HTTP client | TCP + built-in pooling | GraphQL or public pgbouncer |
| Built-in table UI | Yes (Owner edits prod only) | Tables view (Drizzle Studio) | Table Editor | Not documented | Not found | Yes |
| Built-in auth | Netlify Identity (separate) | Managed Better Auth | Supabase Auth | No | No | Nhost Auth |
| Backups on free | Daily + per-deploy, 3 days | 6 h PITR | None (manual dump) | 1-day PITR | Daily, 7 days | None (manual dump) |
| Export | `pg_dump` | `pg_dump` | `pg_dump` / CLI | SQLite file | `.pg_dump` export | `pg_dump` |

## Things that would decide it

1. **Netlify plan and functions region.** EU-only processing needs functions in `fra` or `dub`, which is Pro-only ($20/month credit plan or Legacy Pro). Without that, every option sends Booking data through Ohio. Settle this before choosing a database.
2. **Legacy vs. Credit-based Netlify plan.** Netlify Database needs a Credit-based plan, and switching is irreversible. On Free, the database shares 300 credits with deploys (15 each), and running out takes the whole site offline.
3. **Can Netlify Database be placed in the EU, and where does it physically run?** This is not documented. It needs a test or a support answer. Netlify's sub-processor list names only US companies, Neon included.
4. **Behaviour in the off-season.** Bookings cluster before the season. Supabase Free and Nhost Free pause after a week, and Turso Free archives after 10 days, so a dormant project could reject the first Bookings until someone resumes it. Neon, Netlify Database and Scaleway only cold-start, in under a second to a few seconds.
5. **Admin area for the ski school team.** Options:
   - a hosted table UI (Neon Tables, Supabase Table Editor, Nhost; Netlify only for the Team Owner, and Free/Personal have no extra seats)
   - a custom Astro/Alpine admin page with built-in auth (Neon Managed Better Auth, Supabase Auth, Netlify Identity, Nhost Auth)

   Giving team members dashboard access usually grants full data and schema rights on cheap plans. Read-only roles need Supabase Team or a Turso Scaler invite.
6. **Preference for an EU-based contracting entity (third-country transfer and CLOUD Act exposure).** Only Scaleway (France) and Nhost (Sweden) qualify. The others contract through US entities (Netlify, Databricks/Neon, Turso) or a Singapore entity (Supabase), and rely on SCCs even when the data sits in an EU region. Contracting entities come from: Netlify DPA, Databricks DPA, Supabase DPA, <https://turso.tech/terms-of-use>, Scaleway DPA, Nhost DPA (all linked above).
7. **Backups the club controls.** Free tiers retain between 0 and 3 days. A scheduled `pg_dump` (or a Turso export) to club-owned storage would be needed for longer retention on any free tier.
8. **Postgres vs. SQLite.** All candidates except Turso are Postgres, which keeps `pg_dump` portability between them.

## Open / unverified items

- Netlify Database: available regions, whether an EU region can be chosen on Free/Personal, the underlying infrastructure provider, and current storage pricing after 2026-07-01.
- Club's current Netlify plan (Legacy or Credit-based; Free, Personal or Pro) and current functions region.
- Neon: which DPA applies to new self-serve accounts after the Databricks integration, and whether it must be signed.
- Turso: whether the DPA is on the Developer plan, whether databases unarchive on first query, and whether the dashboard has a table editor.
- Scaleway Serverless SQL: authentication model, and whether a table UI exists.
- Nhost: full region list.
- Xata: DPA, backups, admin UI.
- Netlify Identity: data location.
