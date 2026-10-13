# Research: Login options for the ski school admin area on Netlify

Ticket: #6 (part of map #4). Researched 2026-10-13. Facts only, no recommendation.

Question: how can roughly 3–10 ski school team members log into an admin area of the Astro site on Netlify, without a CMS? For each option this covers EU data residency, cost, implementation effort, invitations and roles, and how both admin pages and admin API endpoints are protected server-side.

Legend: **[unverified]** means no primary source confirmed it. Effort ratings (S/M/L) are rough estimates, not sourced facts.

## Context from this repo and account

- `main` runs Astro `4.16.17` (`package.json`, `package-lock.json`) with the `@astrojs/netlify` adapter and `output: 'hybrid'` in `astro.config.mjs`: pages are prerendered by default, and single pages opt into on-demand rendering with `export const prerender = false` (e.g. `src/pages/booking/admin.astro`). Further server code lives in `netlify/functions/*.ts`.
- The current npm versions are `astro` 7.3.8 and `@astrojs/netlify` 8.2.9 (`npm view`, 2026-10-13).
- Netlify account (read via the Netlify MCP): site `skizunftkollnau` is on plan `nf_team_pro`, in team "Friendly Developer" (type "Pro", 1 member). The API response does not say whether this is a **legacy** or **credit-based** Pro plan **[unverified]**. That matters below: Netlify Database is credit-based only, and Identity limits on legacy plans depend on the plan's "Identity service level".
- Booking emails are sent through Brevo's transactional API (`@getbrevo/brevo` in `netlify/functions/send-booking-confirmation-v2.ts` / `send-booking-notification-v2.ts`); the older v1 functions use `@netlify/emails`.

### Cross-cutting facts that apply to every option

- **Static pages can't be checked per request.** Astro middleware runs at build time for prerendered pages and at request time only for on-demand rendered pages ([Astro middleware](https://docs.astro.build/en/guides/middleware/)). The Netlify adapter has `middlewareMode: 'edge'`, which runs middleware in an edge function for all requests, prerendered pages included ([@astrojs/netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/)).
- **So every server-side check needs runtime code.** That means on-demand (SSR) Astro pages and endpoints, edge middleware, or Netlify Functions. The only exceptions are Netlify's CDN-level features (Password Protection, Basic-Auth headers, and JWT role redirects).
- **Netlify custom headers (including `Basic-Auth`) don't apply to functions or SSR pages.** They "apply only to files Netlify serves from our own backing store … [for] a URL handled by a function or edge function such as a server-side rendered (SSR) page, custom headers won't be applied" ([Netlify headers](https://docs.netlify.com/manage/routing/headers/)).
- **Functions region.** New sites default to `cmh` (US East, Ohio). On Pro and Enterprise plans you can switch to `fra` (Frankfurt), `dub` (Ireland) or `lhr` (London), either in the UI or per function ([Functions configuration](https://docs.netlify.com/build/functions/configuration/#region)).
- **Netlify Blobs region.** Site-wide Blobs stores default to `us-east-2` regardless of the functions region. `eu-central-1` has to be passed on every `getStore` call ([Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)). This matters if sessions are stored in Blobs. Astro's Netlify adapter "automatically configures Netlify Blobs for session storage" ([@astrojs/netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/)). Which region that default driver uses is **[unverified]**. Astro Sessions are stable since Astro 5.7.0 and need on-demand rendering ([Astro sessions](https://docs.astro.build/en/guides/sessions/)).
- **Netlify and personal data.** Netlify says personal data "may be collected, transferred to and stored by Netlify outside of the country of collection". It relies on the EU-U.S. Data Privacy Framework and SCCs (2021/914) ([Netlify privacy policy](https://www.netlify.com/privacy/)).
- **Netlify pricing (credit-based).** Free $0, Personal $9/month, Pro $20/month "with unlimited members" ([Netlify pricing](https://www.netlify.com/pricing/)).

---

## 1. Netlify Identity (with `@netlify/identity`)

**Current state: not deprecated.** Netlify deprecated Identity in 2025 alongside its Auth0 extension, then reversed that. "Update, February 19, 2026: Netlify Identity will continue as a supported authentication option on Netlify" ([Netlify blog](https://www.netlify.com/blog/auth0-extension-identity-changes/)). The current docs present it as a supported product ([Identity overview](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/overview/)).

**Libraries.** `@netlify/identity` (v2.0.0, published 2026-08-18, repo `netlify/primitives`) is "the recommended library for all new projects". `netlify-identity-widget` and `gotrue-js` are marked "Not recommended for new projects" ([npm README](https://www.npmjs.com/package/@netlify/identity)). The library's server-side functions require modern v2 Netlify Functions or Edge Functions. v1 Lambda-compatible functions are "not supported". The library also needs Node >= 22.12.0 (same README / `package.json`).

| Aspect | Facts |
|---|---|
| EU data residency | No documented region for Identity user data. Netlify transfers data to the US under DPF/SCCs ([privacy](https://www.netlify.com/privacy/)). Whether Identity data can be pinned to the EU is **[unverified]** (no primary source found). |
| Cost | "Included at no additional cost on all credit-based plans and Enterprise plans", with unlimited active and invite-only users. Custom email templates, a custom outgoing email address and the audit log need Pro or higher. On legacy plans, features "are determined by your Identity service level" (contact support) ([plans and pricing](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/plans-and-pricing/)). The limits on this site's plan are **[unverified]** (see context above). |
| Login methods | Email + password, plus Google, GitHub, GitLab and Bitbucket OAuth ([plans and pricing](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/plans-and-pricing/)). The `@netlify/identity` v2.0.0 README documents no magic-link or passwordless function (checked the README of the package tarball). |
| Invitations | You can set registration to **Invite only**. Then "all new Identity users, including those logging in with external providers, will need to be invited". Invites are sent from **Identity > Users** in the dashboard. The email link carries an `invite_token` ([registration and login](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/registration-login/)). `acceptInvite(token, password)` completes the invite. Server-side `admin.createUser/updateUser/deleteUser/listUsers` are available in Functions ([README](https://www.npmjs.com/package/@netlify/identity)). |
| Emails | The default sender is `no-reply@netlify.com`. On Pro or higher you can set custom SMTP for the sender (the docs list "SendinBlue", i.e. Brevo, as an example) and custom HTML templates ([Identity emails](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/identity-generated-emails/)). |
| Roles | Roles live in `app_metadata.roles` inside the JWT. You set them in the UI, through the Identity API, or with Identity event functions. "Role changes take effect on the user's next login or token refresh" ([Use Identity in functions](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/use-identity-in-functions/), [RBAC](https://docs.netlify.com/manage/security/secure-access-to-sites/role-based-access-control/)). |
| Protecting pages | (a) **CDN-level:** redirect rules with a `Role` condition, e.g. `/admin/*  /admin/:splat  200!  Role=admin`, followed by a fallback rule `/admin/*  /login  401!`. Netlify reads the `nf_jwt` cookie. This is available on all plans with Netlify Identity ([RBAC](https://docs.netlify.com/manage/security/secure-access-to-sites/role-based-access-control/)). It works for static pages. Whether it also covers function/SSR routes is **[unverified]**. (b) **SSR:** in an on-demand Astro page, `const user = await getUser(); if (!user) return Astro.redirect('/login')` ([README, Astro section](https://www.npmjs.com/package/@netlify/identity)). |
| Protecting API endpoints | In a Function, Edge Function or Astro endpoint, `getUser()` returns `null` when unauthenticated. Check `user.roles.includes('admin')` and return 401 or 403. For CSRF on server-side login, use `verifyRequestOrigin(req)` ([Use Identity in functions](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/use-identity-in-functions/)). |
| Effort (estimate) | S–M. You need an SSR adapter or v2 functions, plus login, accept-invite and password-reset pages. User management can stay in the Netlify dashboard. |

## 2. Netlify Password Protection / access control (no app login)

Netlify has four separate mechanisms ([Password protection](https://docs.netlify.com/manage/security/secure-access-to-sites/password-protection/), [Project visibility](https://docs.netlify.com/manage/security/secure-access-to-sites/project-visibility/), [Basic auth headers](https://docs.netlify.com/manage/security/secure-access-to-sites/basic-authentication-with-custom-http-headers/)):

| Mechanism | Plans | Scope | Protects functions/SSR? | Per-user identity? |
|---|---|---|---|---|
| **Basic password protection** (one shared password) | All Pro and above. Not available on credit-based Free or Personal. | The whole deploy: either "All deploys" or "Non-production deploys only". No path scoping is documented. | Not stated **[unverified]** | No. It's anonymous: everyone shares one password. |
| **Team login protection** (Netlify account / SSO) | Enterprise only | The whole deploy | Functions get `context.user` | Yes, Netlify team members |
| **Private project visibility** | Credit-based Free, Personal and Pro (on Free and Personal only the Team Owner can view) | The whole project. Visitors without access see a Netlify-branded page. | Functions get `context.user` (with team login or a private project) | Yes. Viewers are Netlify team members or invitees. Pro allows unlimited members. |
| **`Basic-Auth` in `_headers` / `netlify.toml`** | Pro and Enterprise | **Per path**, e.g. `/admin/*  Basic-Auth: user1:pass1 user2:pass2`. Several user:password pairs are allowed. | **No.** Custom headers aren't applied to function, edge function or SSR responses ([headers](https://docs.netlify.com/manage/routing/headers/)). | Username only. The browser handles the session and there's no logout. The docs say not to use it for sensitive data and to use JWT access control instead. |

- **EU data residency:** none of these store user data beyond Netlify account data, which falls under Netlify's US transfer terms ([privacy](https://www.netlify.com/privacy/)).
- **Cost:** included in the plan tiers listed above. The docs mention no add-on price.
- **Invitations and roles:** shared passwords or `Basic-Auth` pairs live in the repo or the dashboard. Team login and private visibility rely on Netlify team membership and have no app-level roles.
- **Fit:** the whole-deploy mechanisms would also lock the public website. `Basic-Auth` is path-scoped but doesn't protect admin API endpoints (functions or SSR), so those would need their own check.

## 3. Auth bundled with candidate EU databases

### 3a. Supabase Auth

| Aspect | Facts |
|---|---|
| EU data residency | "Each Supabase project is deployed to a single primary region, and your project's primary Postgres database, Auth service, and Storage objects are hosted in that region." Specific EU regions include `eu-central-1` (Frankfurt), `eu-west-1` (Ireland), `eu-west-3` (Paris) and `eu-north-1` (Stockholm). The general "Europe" region can land in London or Zurich. A DPA is available ([GDPR guide](https://supabase.com/docs/guides/security/gdpr-compliance), [regions](https://supabase.com/docs/guides/platform/regions)). |
| Cost | Free: $0, 50,000 MAU, but "Free projects are paused after 1 week of inactivity", with a limit of 2 active projects. Pro: from $25/month, 100,000 MAU, never paused. Custom SMTP is included on all plans ([pricing](https://supabase.com/pricing)). |
| Login methods | Email + password, magic link and email OTP ("enabled by default"). Magic links can be requested once per 60 s and expire after 1 h by default. `shouldCreateUser: false` stops OTP or magic-link sign-in from creating new users ([passwordless](https://supabase.com/docs/guides/auth/auth-email-passwordless), [JS reference](https://supabase.com/docs/reference/javascript/auth-signinwithotp)). |
| Emails via Brevo | The built-in SMTP is "not meant for production use". It only sends to the project team's addresses and is limited to "2 messages per hour". Brevo is listed as a custom SMTP provider. After you configure custom SMTP, an initial limit of 30 messages/hour applies, which you can adjust ([Auth SMTP](https://supabase.com/docs/guides/auth/auth-smtp)). |
| Invitations | Dashboard: **Invite user**. Server: `supabase.auth.admin.inviteUserByEmail()` with the secret key. Invite links expire with the Email OTP expiration (default 1 h) ([users](https://supabase.com/docs/guides/auth/users)). Turning off **Allow new users to sign up** means "only existing users can sign in" ([general configuration](https://supabase.com/docs/guides/auth/general-configuration)). |
| Roles | You can use `app_metadata` or custom claims added through a Custom Access Token Auth Hook ([RBAC with custom claims](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac), [managing user data](https://supabase.com/docs/guides/auth/managing-user-data)). |
| Protecting pages and APIs | `@supabase/ssr` has a documented Astro setup and needs Astro configured for SSR. On the server, use `supabase.auth.getClaims()`, which verifies the JWT signature. "*Never* trust `supabase.auth.getSession()` inside server code" ([server-side client](https://supabase.com/docs/guides/auth/server-side/creating-a-client)). `getUser()` is needed to detect sessions that were revoked server-side ([advanced guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide)). The same check works in middleware, pages and endpoints. |
| Effort (estimate) | M. You need an SSR adapter, the `@supabase/ssr` cookie wiring, login, callback and invite pages, and SMTP setup. You get this "for free" only if Supabase is also chosen as the booking DB. |

### 3b. Neon "Managed Better Auth" (formerly Neon Auth)

| Aspect | Facts |
|---|---|
| What it is | A managed auth service built on Better Auth (it runs Better Auth 1.7.6). Data is stored in your Neon database in the `neon_auth` schema. It is GA. Legacy Neon Auth (Stack Auth) keeps working ([overview](https://neon.com/docs/auth/overview), [roadmap](https://neon.com/docs/auth/roadmap)). |
| EU data residency | "Managed Better Auth is deployed in the same region as your database." It's available only on AWS regions ([overview](https://neon.com/docs/auth/overview)). Neon's AWS regions include `aws-eu-central-1` (Frankfurt) and `aws-eu-west-2` (London) ([regions](https://neon.com/docs/introduction/regions)). Auth data is stored in the DB, so it is in Frankfurt if the project is. |
| Cost | Included in all plans. Free: up to 60k MAU. Launch and Scale: up to 1M MAU ([overview](https://neon.com/docs/auth/overview), [pricing](https://neon.com/pricing)). The Free compute scales to zero after 5 min of inactivity ([pricing](https://neon.com/pricing)). |
| Login methods | Email & password, social OAuth, Email OTP, Magic Link, Admin, JWT and Phone Number are "Supported". Organization support is "Partial". MFA is "Coming soon" ([roadmap](https://neon.com/docs/auth/roadmap)). Magic Link has a `disable_sign_up` option and an expiry of 5–1440 min ([magic link](https://neon.com/docs/auth/guides/plugins/magic-link)). |
| Emails via Brevo | The default shared SMTP (`auth@mail.myneon.app`) "is rate-limited and does not support verification links". Custom SMTP is configured in the Console, CLI or API. Alternatively, `send.magic_link` and `send.otp` webhooks hand delivery to your own code, e.g. a Brevo API call ([production checklist](https://neon.com/docs/auth/production-checklist), [customize emails](https://neon.com/docs/auth/guides/customize-emails)). |
| Invitations and roles | Admin plugin: create users and set roles (`admin.createUser`, `admin.setRole`). The first admin is set in the Console under **Auth → Users → Make admin** ([admin plugin](https://neon.com/docs/auth/guides/plugins/admin)). No email-invitation flow is documented outside the Organization plugin (Partial). Disabling self sign-up for email/password is **[unverified]**. |
| Framework support | Supported: Next.js, Vite + React, React Router and TanStack Router. Other frameworks are "Based on demand". "Standalone frontend + backend" is "Coming soon" ([roadmap](https://neon.com/docs/auth/roadmap)). **Astro isn't listed.** Whether its cookie/session model works from Astro SSR on Netlify is **[unverified]**. |
| Protecting pages and APIs | Sessions use an HTTP-only cookie `__Secure-neonauth.session_token` (opaque), plus JWTs that can be validated against JWKS ([authentication flow](https://neon.com/docs/auth/authentication-flow)). The server-side check pattern is documented only for Next.js ([Next.js server SDK](https://neon.com/docs/auth/reference/nextjs-server)). |
| Effort (estimate) | M–L for Astro, because there's no official Astro path. |

### 3c. Netlify Database (formerly "Netlify DB")

- **No bundled auth.** Netlify Database became GA on 2026-04-28 as a native Postgres (`@netlify/database`). The older "Netlify DB Beta" was built on the Neon extension (`@netlify/neon`) and is still supported ([changelog](https://www.netlify.com/changelog/2026-04-28-netlify-database/), [switch guide](https://docs.netlify.com/build/data-and-storage/netlify-database/switch-to-netlify-database/)). The docs pages describe no auth feature ([Netlify Database](https://docs.netlify.com/build/data-and-storage/netlify-database/)). Auth for a Netlify Database site would therefore be Netlify Identity (§1) or a library or self-built option (§4, §5).
- **Plans and cost.** Available on "Credit-based plans only". Compute costs 10 credits/unit and bandwidth 20 credits/GB. Storage was free until 2026-07-01 ([billing](https://docs.netlify.com/build/data-and-storage/netlify-database/billing-and-usage/)). Storage pricing after that date is **[unverified]**.
- **Region.** "The database region defaults to the site's functions region if not specified" ([API](https://docs.netlify.com/build/data-and-storage/netlify-database/api/)). The list of supported region values, and whether Frankfurt is offered, is **[unverified]**.

## 4. Magic-link email login (self-hosted, sent via Brevo)

There are two ways to do this: a library (Better Auth) or hand-rolled (§5). Both store tokens and sessions in whichever EU DB is chosen and send mail through Brevo.

**Brevo facts**
- "Our servers are located in the EU" ([Brevo data security](https://www.brevo.com/features/data-security/)).
- The free plan sends "up to 300 emails per day" once the account is approved for sending ([Brevo pricing](https://www.brevo.com/pricing/)).
- The transactional API is `POST https://api.brevo.com/v3/smtp/email` with an `api-key` header ([Brevo API](https://developers.brevo.com/reference/sendtransacemail)).
- Brevo SMTP also works as the SMTP backend for Supabase, Neon and Netlify Identity (Pro), per the docs cited in those sections.

**Better Auth (self-hosted library)**
- "First class support for Astro": mount `auth.handler` at `src/pages/api/auth/[...all].ts` and check `auth.api.getSession({ headers })` in Astro middleware ([Astro integration](https://www.better-auth.com/docs/integrations/astro)). The current version is 1.7.7 (`npm view better-auth version`).
- Magic link plugin: you implement the `sendMagicLink({ email, url, token })` callback, which is where a Brevo API call would go. `expiresIn` defaults to 300 s. With `disableSignUp: true` only existing users can sign in. The default rate limit is 5 per 60 s ([magic link plugin](https://www.better-auth.com/docs/plugins/magic-link)).
- Admin plugin: `createUser`, `setRole`, `banUser` and similar ([admin plugin](https://www.better-auth.com/docs/plugins/admin)).
- **Residency:** all data sits in your own DB, so it is EU if the DB is. If you use Brevo, mail is processed in the EU (see above).
- **Cost:** the library is free. You pay for the DB and Brevo only.
- **Protecting pages and APIs:** a single Astro middleware check covers on-demand pages and endpoints. Routes also need on-demand rendering or `middlewareMode: 'edge'` (see cross-cutting facts).
- **Effort (estimate):** M. You need an SSR adapter, the DB schema or migrations Better Auth generates, a Brevo email template, and a login page.

## 5. Minimal self-built option (shared secret or per-user magic link + signed cookie)

You write all of this yourself. Primary sources for the security requirements:

- **Session cookie.** Set `Secure`, `HttpOnly`, and `SameSite=Strict` (preferred) or `Lax`. Session IDs need ≥ 64 bits of entropy. Enforce timeouts server-side; 15–30 min idle is typical for low-risk apps, 4–8 h absolute ([OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)).
- **Email login tokens.** Generate them with a CSPRNG, make them long enough to resist brute force, single-use, and expiring. Return the same message whether or not the account exists ([OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)).
- **Variant A, shared secret.** An env var holds one password, or an allowlist of `name:hash`. A login endpoint compares it and sets an HMAC-signed cookie. Middleware or each endpoint verifies the signature and expiry. You don't need a DB. There are no per-user identities unless you keep one password per person. "Invitations" mean handing out the password; revoking someone means rotating the secret. **[Design facts from the sources above; no single vendor doc covers this.]**
- **Variant B, magic link.** Keep an allowlist of team emails, in env vars or a DB table. The login endpoint creates a random token, stores its hash with an expiry, and emails the link through Brevo's API. The callback consumes the token and sets the signed session cookie. Roles can be a column next to the email.
- **Residency:** wherever you keep the data: env vars, the EU DB, or Netlify Blobs with an explicit `eu-central-1` region (Blobs default to `us-east-2`; see [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)).
- **Cost:** $0 beyond existing services.
- **Protecting pages and APIs:** the same check in Astro middleware, or a shared helper used by each endpoint and function. It has to run on demand (see cross-cutting facts). Static admin pages would need `middlewareMode: 'edge'` or SSR. CSRF needs separate handling for cookie-authenticated `POST`s (e.g. a `SameSite` cookie plus an Origin check). `@netlify/identity`'s `verifyRequestOrigin` shows the pattern ([README, CSRF section](https://www.npmjs.com/package/@netlify/identity)).
- **Effort (estimate):** S for Variant A, M for Variant B. All security properties are your own responsibility.

---

## Comparison table

| Option | EU data residency | Cost for ≈3–10 users | Invites / roles | Protects admin pages | Protects admin API | Effort (est.) |
|---|---|---|---|---|---|---|
| 1. Netlify Identity (`@netlify/identity`) | No documented EU pinning; Netlify transfers to the US (DPF/SCC) | $0 on credit-based plans. Custom SMTP or templates need Pro. Legacy: depends on service level. | Invite-only mode, dashboard invites; `app_metadata.roles` | CDN `Role=` redirect rules (static) or `getUser()` in SSR | `getUser()` + role check in Functions, Edge or Astro endpoints | S–M |
| 2a. Netlify basic password protection | n/a (no user data) | Included in Pro | One shared password, no roles | Whole deploy only | Not documented | XS |
| 2b. `Basic-Auth` header | n/a | Included in Pro | user:password pairs in config, no roles | Per path (static only) | **No** (headers skip functions and SSR) | XS |
| 2c. Private visibility / team login | Netlify account data (US) | Private: credit-based Pro. Team login: Enterprise. | Netlify team members | Whole project only | `context.user` in functions | XS |
| 3a. Supabase Auth | Pinned to the chosen EU region, DPA available | Free (pauses after 1 week idle) or Pro from $25/month | Dashboard or API invites, signup can be disabled; claims via hook | `getClaims()` in SSR or middleware | `getClaims()` / `getUser()` in endpoints | M |
| 3b. Neon Managed Better Auth | In the Neon DB region (e.g. Frankfurt) | Included (Free: 60k MAU) | Admin plugin `createUser`/`setRole`; magic link `disable_sign_up` | No official Astro SDK **[unverified fit]** | JWT/JWKS or session check, Next.js documented | M–L |
| 3c. Netlify Database | Region follows functions region; EU option **[unverified]** | Credits (credit-based plans only) | **No bundled auth** | — | — | — |
| 4. Better Auth + Brevo magic link | Your EU DB + Brevo (EU servers) | $0 library + DB + Brevo free tier (300 mails/day) | `disableSignUp` + admin plugin roles | Astro middleware `getSession` | Same middleware or helper | M |
| 5. Self-built (shared secret or magic link + signed cookie) | Wherever you store it (env, EU DB, Blobs `eu-central-1`) | $0 | Manual: env allowlist or DB table | Own middleware (SSR or edge) | Own helper in each endpoint | S–M |

## Open points / not verified

- Whether this site's Netlify Pro plan is legacy or credit-based (affects Identity limits and Netlify Database availability).
- Where Netlify Identity stores user data, and whether it can be EU-only.
- Whether Netlify `Role=` redirect conditions also gate function and SSR routes.
- Whether basic password protection covers function endpoints.
- Netlify Database region list (Frankfurt?) and storage pricing after 2026-07-01.
- Neon Managed Better Auth with Astro (no official guide), and disabling email/password sign-up there.
- The region Astro's default Netlify Blobs session driver writes to.
