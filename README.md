# Baked by Kenny

A custom-cake website with a public price calculator and enquiry form, plus a
private owner dashboard for managing orders. Built with Next.js.

## What it does

- **Public site (`/`)** — hero, a price calculator (size × flavour), and an
  enquiry form. Submitting saves the order to the database and emails the owner.
- **Two ways to buy.** *Standard items* (cupcake boxes, brownies) have fixed
  prices and an instant Buy-now checkout. *Bespoke cakes* go: customer enquires
  → they call Kenny → Kenny sets the agreed price in the dashboard → the
  customer opens their private order link, sees the finalised details, and pays
  in full. Both confirm payment through Stripe.
- **Owner dashboard (`/owner`)** — password-protected. All orders (enquiries and
  instant purchases) with a New → Confirmed → Baking → Ready → Collected
  workflow, a payment-status badge, a price box + "copy/email pay link" for
  bespoke orders, an upcoming-collections view, a standard-items editor, and the
  cake-calculator price editor.
- **Real privacy** — the owner area sits behind server-side auth (a signed,
  http-only cookie). Order data is fetched on the server only after the cookie
  is verified, so it never reaches an unauthenticated visitor. The password
  lives in an environment variable and is never sent to the browser.
- **Real notifications** — a new enquiry can email the owner (via Resend) and/or
  text them (via Twilio). Each channel is independent: fill in the email vars,
  the Twilio vars, both, or neither, and the app sends through whichever are
  configured.

## Setup

### 1. Install
```bash
npm install
```

### 2. Create the services (all have free tiers)

**Database — any Postgres works.** Easiest is [Neon](https://neon.tech): create
a project and copy the *pooled* connection string. (Supabase, Railway, or Vercel
Postgres also work — just paste their connection string.) Tables are created
automatically on first use; no migration step.

**Email — [Resend](https://resend.com):** sign up, create an API key. For real
delivery, verify your sending domain and set `EMAIL_FROM` to an address on it.
For quick testing, leave `EMAIL_FROM` as `onboarding@resend.dev` — note that in
test mode Resend only delivers to the email you signed up with.

**Text alerts — [Twilio](https://twilio.com) (optional):** sends the owner a
text on each enquiry. Leave all four `TWILIO_` vars blank to skip SMS entirely.

Who pays: the *recipient is never charged* — receiving a text is free on UK
mobile plans, and Twilio only ever bills the sending account. The small cost
(pennies per message, plus ~£1/month for the number) falls on whoever owns the
Twilio account, not on the owner's phone.

Set it up free on a trial account first:

1. Sign up at [twilio.com](https://twilio.com). A trial gives you free credit.
2. From the **Console dashboard**, copy your **Account SID** and **Auth Token**
   into `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`.
3. Get a sending number: **Phone Numbers → Manage → Buy a number** (pick one
   with SMS capability). Put it in `TWILIO_FROM`, in international format
   (e.g. `+447700900000`).
4. **Verify the owner's mobile** so the trial is allowed to text it:
   **Phone Numbers → Manage → Verified Caller IDs → Add a new Caller ID**,
   enter the number, and type in the code Twilio texts to that phone. Then set
   `OWNER_PHONE` to the same number, international format (`+44…`).
5. Send a test enquiry from the site — the text should arrive.

Trial limitations: you can only text **verified** numbers (step 4), and each
message gets a "Sent from a Twilio trial account" prefix. Both disappear once
you add a little credit to the account (pay-as-you-go, no contract). For one
owner getting a handful of enquiries, that's roughly a pound or two a month.

**Payments — [Stripe](https://stripe.com):** powers both the instant-buy
standard items and the pay-link for bespoke orders. Customers never leave to a
third party visibly — they pay on a Stripe-hosted page, so no card details ever
touch the app. UK rate is 1.5% + 20p per card payment, no monthly fee.

1. Sign up, then from **Developers → API keys** copy the **Secret key** into
   `STRIPE_SECRET_KEY`. Use the **test** key (`sk_test_…`) while building.
2. Create a webhook so payments get confirmed: **Developers → Webhooks → Add
   endpoint**, URL `https://YOUR-SITE/api/webhooks/stripe`, and subscribe to the
   `checkout.session.completed` event. Copy its **Signing secret** (`whsec_…`)
   into `STRIPE_WEBHOOK_SECRET`.
3. Set `NEXT_PUBLIC_SITE_URL` to your site's URL (used in pay links and emails).
4. Test with Stripe's test card `4242 4242 4242 4242`, any future expiry, any
   CVC. No real money moves until you switch to live keys (`sk_live_…`).

For local testing of the webhook, install the Stripe CLI and run
`stripe listen --forward-to localhost:3000/api/webhooks/stripe` — it prints a
`whsec_…` to use as your local `STRIPE_WEBHOOK_SECRET`.

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

Generate the session secret with:
```bash
openssl rand -base64 32
```

### 4. Run locally
```bash
npm run dev
```
Open http://localhost:3000 — and http://localhost:3000/owner for the dashboard.

## Deploy (Vercel — recommended)

1. Push this folder to a GitHub repo.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add every variable from `.env.example` in **Project → Settings → Environment
   Variables**. Also set `NEXT_PUBLIC_SITE_URL` to your live URL (used for the
   "Open dashboard" link in the email).
4. Deploy. Done.

## Customising

- **Prices, sizes, flavours** — edit them live from the dashboard's "Edit prices"
  tab, or change the starting defaults in `lib/constants.ts`.
- **Currency** — `CURRENCY` in `lib/constants.ts`.
- **Colours, business name** — `C` and `BUSINESS_NAME` in `lib/constants.ts`.
- **Owner password** — the `OWNER_PASSWORD` env var. Change it anytime; no code
  change needed.

## How privacy works (in short)

`middleware.ts` intercepts `/owner/*` and `/api/admin/*`. Without a valid signed
cookie, page requests redirect to the login screen and admin API calls return
401. The cookie is created only after the password matches (compared
server-side, in constant time). This is real access control, not a hidden page.

## Project map

```
app/
  page.tsx            public site (server) → PublicSite.tsx (client)
  owner/
    login/page.tsx    password screen
    page.tsx          dashboard (server, loads data) → Dashboard.tsx (client)
  api/
    enquiries/        POST: save enquiry + email owner (public)
    pricing/          GET: current prices (public)
    login, logout/    session cookie in/out
    admin/            list/update/delete orders, save prices, mark-seen (locked)
lib/
  db.ts               Postgres + schema + queries
  session.ts          signed-cookie auth
  email.ts            Resend notification
  constants.ts        colours, defaults, types
middleware.ts         locks /owner and /api/admin
```
