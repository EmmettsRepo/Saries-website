# ANEW — Pre-Launch Checklist

## ✅ Done (this session)
- [x] Stripe test keys rotated to current pair (in `.env.local` + `functions/.env`)
- [x] Switched to **full-payment-at-booking** model (no more 25% / T-30 split — wrong for short retreat stays)
- [x] Boutique hidden behind feature flag (source preserved at `src/app/boutique/BoutiquePageContent.tsx`, hidden from Navbar/Footer/booking flow, `/boutique` returns 404)
- [x] Removed `Team`, `Local`, `Boutique` from main nav per current strategy
- [x] Removed `FallingLeaves` from layout (perf cleanup)
- [x] Real availability calendar with date selection — Hospitable-API-ready, mock fallback when no token
- [x] Hospitable Cloud Function stub (`getAvailability`) — auto-falls-back to mock on 503
- [x] Updated copy on Terms + Privacy + Booking + Footer + Home contact section to match new payment model + new domain + new contact info
- [x] Updated `SITE_URL`, `sitemap.xml`, `robots.txt` to `https://anewretreatandspa.com`
- [x] Profile page error handling: each Firestore fetch wrapped in try/catch
- [x] Navbar smart hero detection (white nav text on dark hero pages, dark elsewhere)
- [x] Hardened booking flow validation (date now required from calendar)

## 🔴 Blockers — Need from Client / Owner Before Launch

### Business & Legal
- [ ] Legal business name (LLC / sole prop / corp?)
- [ ] EIN (or SSN if sole prop)
- [ ] Owner's full legal name + DOB + last 4 SSN — for Stripe identity verification (5 min in their dashboard)
- [ ] Liability insurance certificate (required to legally host events)

### Stripe (live mode)
- [ ] Owner completes Stripe verification in Dashboard
- [ ] US Bank account connected (routing `125000105`, acct on file)
- [ ] Owner provides live keys (`sk_live_…`, `pk_live_…`) — paste into env files, redeploy
- [ ] Add live webhook endpoint in Stripe Dashboard at `https://us-central1-bakkers-website-847ba.cloudfunctions.net/stripeWebhook` listening for `payment_intent.succeeded` + `payment_intent.payment_failed`
- [ ] Put real `whsec_…` into `functions/.env` (replaces `whsec_PLACEHOLDER`)
- [ ] Enable Stripe receipt emails: Dashboard → Settings → Emails

### Hospitable Integration (central booking hub)
- [ ] Owner signs up for Hospitable + connects Airbnb, VRBO, direct
- [ ] Generate Personal Access Token: Settings → Apps & Integrations → Public API
- [ ] Provide PAT → paste into `functions/.env` as `HOSPITABLE_API_TOKEN`
- [ ] Provide property UUID → paste into both `.env.local` (`NEXT_PUBLIC_HOSPITABLE_PROPERTY_ID`) and `functions/.env` (`HOSPITABLE_PROPERTY_ID`)
- [ ] Flip `FEATURES.HOSPITABLE_LIVE` to `true` in `src/lib/featureFlags.ts`
- [ ] Deploy: `firebase deploy --only functions,hosting`

### Operational Systems (NOT website-touched, owner manages)
These run alongside the website but are not directly integrated:
- [ ] **StayFi** — guest WiFi / lead capture (configured in StayFi dashboard, runs at the property)
- [ ] **Ring** — security cameras / smart locks (Ring app, runs at the property)
- [ ] **Turno** — turnover/cleaning management (syncs with Hospitable for cleaning schedules)
- [ ] These should be running smoothly before website launch, but no code changes needed on this end

### Pricing & Property Details (need owner sign-off)
- [ ] Confirm package prices: Elopement $3K / Gathering $3K / Corporate $3K / Signature $6K / Weekend $9K
- [ ] Confirm add-on prices (catering $45/pp, photography $800, DJ $600, floral $1200, etc.)
- [ ] Confirm capacity (currently "Up to 75")
- [ ] Confirm exact retreat address (currently Kenmore, WA — full street address?)
- [ ] Confirm contact phone — using `(206) 755-8541` — same number for public-facing?
- [ ] Confirm public email — using `hello@anewretreatandspa.com` — set up Google Workspace or forwarding
- [ ] Confirm social handles — using `@anewretreatandspa` — match real profiles
- [ ] Sales/lodging tax rate for King County (WA)

### Content
- [ ] Logo in vector format (SVG or AI)
- [ ] Real chef list — populate Firestore `chefs` collection (name, bio, photo, $/person, specialty)
- [ ] Owner bio + headshot (for `/team` if re-enabled)
- [ ] Approved copy for home/venue/experiences pages
- [ ] Open Graph image (currently uses `/images/exterior-hero.webp` — verify good for social shares)

## 🟡 Domain & Deploy

### Custom domain DNS setup (you do this in GoDaddy)
- [ ] **Primary**: `anewretreatandspa.com` — point at Firebase Hosting site `bakkers-website-847ba`
  - Add A records: `199.36.158.100`, `199.36.158.101` (or whatever Firebase Console says)
  - Add CNAME: `www` → `bakkers-website-847ba.web.app`
- [ ] **Secondary**: `pnwretreatandspa.com` — set 301 redirect → `anewretreatandspa.com` (can be done in Firebase Hosting redirect rules or GoDaddy domain forwarding)
- [ ] Wait for SSL provisioning (~1 hr after DNS propagates)
- [ ] Test both domains resolve properly

### After DNS:
- [ ] Submit sitemap to Google Search Console: `https://anewretreatandspa.com/sitemap.xml`
- [ ] Set up Google Analytics 4 or Plausible (optional but recommended)

## 🟢 Phase 2 (post-launch)

### AI Auto-Booking
- [ ] Cloud Function triggered on new `booking_inquiries` docs
- [ ] Anthropic API to draft personalized confirmation/follow-up emails
- [ ] Admin approval flow — AI drafts, admin reviews & sends
- [ ] Add `ANTHROPIC_API_KEY` to Cloud Functions env

### Hospitable Reservation Push
- [ ] Cloud Function `createHospitableReservation` — called from `stripeWebhook` on payment success
- [ ] Push booking → Hospitable → propagates to Airbnb/VRBO calendars (blocks the dates)
- [ ] Hospitable webhook handler for cancellations/modifications

### Refund Handling
- [ ] Admin "Refund 50%" button on bookings (calls Stripe refund API)
- [ ] Auto-rule: if cancellation > 60 days out, allow self-service 50% refund

### Other
- [ ] Stripe Invoicing or custom PDF receipts
- [ ] Guest reviews/testimonials section
- [ ] Blog for SEO content

## Security Notes
- [ ] **GoDaddy password rotation** — was shared in chat earlier; rotate via account settings → Login & PIN
- [ ] Stripe test keys were shared in chat — rotate them in Stripe Dashboard (free, takes 10 sec)
- [ ] All `.env*` files are gitignored (verified)
- [x] CSP headers configured (Stripe JS, API, Cloud Functions domains)
- [x] Firestore rules tightened (field validation, size limits, scoped reads, deletes disabled)

## Phase 3 (Nice-to-haves)
- [ ] Multi-night booking (currently single-date selection)
- [ ] Automated email sequences (confirmation → reminder → post-event follow-up)
- [ ] Multi-language support
- [ ] Re-enable Boutique once product photos + inventory pipeline are ready (flip `FEATURES.BOUTIQUE` to `true`)
