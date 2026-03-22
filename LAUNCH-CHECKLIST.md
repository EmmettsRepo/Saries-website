# ANEW — Pre-Launch Checklist

## Must-Have Before Launch

### Content & Branding
- [ ] Replace placeholder phone number with real number
- [ ] Replace placeholder email with real contact email
- [ ] Replace placeholder social media URLs (Instagram, Facebook, Pinterest) with real profiles
- [ ] Review all page copy for accuracy (pricing, capacity, amenities, address)
- [ ] Add real product photos for boutique page (currently placeholder icons)
- [ ] Buy and connect a custom domain (then update `SITE_URL`, sitemap, robots.txt)

### Payments (Stripe)
- [x] ~~Upgrade Firebase to Blaze plan~~
- [x] ~~Deploy the Cloud Function~~ — `createPaymentIntent` + `stripeWebhook` live at `us-central1-bakkers-website-847ba.cloudfunctions.net`
- [x] ~~Update `NEXT_PUBLIC_FUNCTIONS_URL` in `.env.local`~~
- [ ] Test a full booking flow end-to-end with Stripe test cards
- [ ] Swap Stripe test keys for live keys (`pk_live_`, `sk_live_`) when ready to accept real money
- [x] ~~Build Stripe webhook to confirm payments server-side~~ — code deployed, needs webhook secret from Stripe Dashboard
- [ ] Add webhook endpoint in Stripe Dashboard: `https://us-central1-bakkers-website-847ba.cloudfunctions.net/stripeWebhook` (listen for `payment_intent.succeeded` and `payment_intent.payment_failed`), then put the `whsec_` secret in `functions/.env`
- [ ] Add Stripe receipt emails (enabled in Stripe Dashboard > Settings > Emails)

### Legal
- [x] ~~Review/finalize Terms of Service page~~ — added payment, cancellation/refund, and dispute sections
- [x] ~~Review/finalize Privacy Policy page~~ — added Stripe/payment data disclosure with link to Stripe privacy policy
- [x] ~~Add refund/cancellation policy language~~ — deposit non-refundable, 60+ day 50% refund, 5-10 business day processing

### SEO & Analytics
- [ ] Set up Google Analytics or Plausible
- [ ] Submit sitemap to Google Search Console
- [ ] Add Open Graph images for social sharing (currently using defaults)
- [ ] Verify `metadataBase` URL matches your custom domain

### Security
- [ ] Rotate Stripe test keys (they were shared in this conversation)
- [x] ~~Tighten Firestore rules~~ — added field validation, size limits, scoped reads to document owner, disabled deletes
- [x] ~~Review CSP headers~~ — Stripe JS, API, and Cloud Functions domains added to CSP

---

## Build Before Scaling (Phase 2)

### AI Auto-Booking
- [ ] Create a Cloud Function triggered on new `booking_inquiries` documents
- [ ] Integrate Anthropic API (or similar) to generate personalized confirmation/follow-up emails
- [ ] Add availability calendar in Firestore (so AI can check dates before confirming)
- [ ] Build admin approval flow — AI drafts response, admin reviews and sends
- [ ] Add `ANTHROPIC_API_KEY` to Cloud Functions environment

### Stripe Payouts & Financial
- [ ] Set up Stripe Connect if paying vendors/chefs through the platform
- [ ] Or: set up simple Stripe payouts to your bank (just Dashboard config, no code)
- [ ] Build remaining balance collection — charge the other 75% at the 30-day mark
- [ ] Create a Cloud Function for scheduled payment reminders
- [ ] Add invoice generation (Stripe Invoicing or custom PDF)

### Admin Dashboard
- [ ] Build out `/admin` — view all bookings, payment status, calendar view
- [ ] Add booking status management (new -> confirmed -> completed)
- [ ] Email notifications when new bookings come in

---

## Nice-to-Have (Phase 3)
- [ ] Availability calendar on the booking page (show open/taken dates)
- [ ] Automated email sequences (confirmation -> reminder -> post-event follow-up)
- [ ] Guest reviews/testimonials section
- [ ] Blog for SEO content
- [ ] Multi-language support
