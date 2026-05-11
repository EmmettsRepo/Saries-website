# ANEW Launch — Things to Have on Standby

Reference for the launch session + first weeks of operation. Keep this open.

---

## 🔑 Credentials & Access (have logged in BEFORE launch starts)

| Service | URL | Status |
|---|---|---|
| Firebase Console | https://console.firebase.google.com/project/bakkers-website-847ba | ✅ Already in |
| Stripe Dashboard (live) | https://dashboard.stripe.com | ⏳ Wait for client invite |
| Stripe Dashboard (test) | https://dashboard.stripe.com/test | ✅ Already in |
| Hospitable Dashboard | https://my.hospitable.com | ⏳ Wait for client invite |
| GoDaddy (DNS) | https://account.godaddy.com | ✅ Have login (rotate pw first) |
| GitHub | https://github.com/EmmettsRepo/Saries-website | ✅ Already in |
| Production admin | https://anew-admin.web.app (TBD — not yet deployed) | ⏳ |
| Production site | https://bakkers-website-847ba.web.app | ✅ Live |

---

## 💳 Stripe Test Cards (keep these handy)

| Card Number | Behavior |
|---|---|
| `4242 4242 4242 4242` | Always succeeds |
| `4000 0000 0000 0002` | Always declined (generic) |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0027 6000 3184` | Requires 3D Secure auth |
| `4000 0000 0000 0341` | Card succeeds but fails later (webhook test) |

CVC: any 3 digits · Expiry: any future date · ZIP: any 5 digits

Full list: https://stripe.com/docs/testing#cards

---

## 🚨 Emergency Commands (memorize these)

```bash
# Site broken? Rollback hosting to previous version
firebase hosting:rollback --site bakkers-website-847ba

# Functions broken? Revert + redeploy
cd ~/Projects/web/venue-booking/timberline-estate
git revert HEAD
git push
firebase deploy --only functions

# Disable Hospitable sync (if API is erroring)
# Edit src/lib/featureFlags.ts: HOSPITABLE_LIVE: false
# Build + deploy hosting only
npm run build && firebase deploy --only hosting

# Disable site entirely (point to maintenance page)
# Quick fix: redirect all traffic to a static "We'll be back" page

# Refund a charge directly via Stripe (backup if admin UI breaks)
# Use Stripe Dashboard → Payments → click charge → Refund
```

---

## 📊 Monitoring Tabs to Have Open During Launch

1. **Stripe → Payments** — watch live transactions
2. **Firebase → Functions logs** — `https://console.firebase.google.com/project/bakkers-website-847ba/functions/logs`
3. **Firebase → Firestore → booking_inquiries** — see bookings land
4. **Hospitable → Calendar** — verify dates auto-block when bookings come in
5. **Production site in incognito** — what guests actually see
6. **Admin dashboard** — manage as bookings arrive

---

## 📞 Support Contacts (when something's stuck)

| Issue | Who to contact |
|---|---|
| Stripe payment problems | https://support.stripe.com (live chat) |
| Hospitable API errors | support@hospitable.com or in-app chat |
| GoDaddy DNS won't propagate | https://www.godaddy.com/help (24/7 phone) |
| Firebase Hosting issues | https://firebase.google.com/support |
| Google Workspace email setup | https://support.google.com/a |

---

## 📁 Project Reference Files

| File | What it's for |
|---|---|
| `LAUNCH-CHECKLIST.md` | Full pre-launch checklist + remaining items |
| `DEPLOY.md` | Deploy commands + custom domain setup |
| `CLIENT-SETUP.md` | Step-by-step for the client (their 4 items) |
| `LAUNCH-STANDBY.md` | This doc |
| `src/lib/featureFlags.ts` | `BOUTIQUE`, `HOSPITABLE_LIVE` toggles |
| `functions/.env` | Stripe + Hospitable secrets (gitignored) |
| `.env.local` | Public env vars (gitignored) |
| `firestore.rules` | Database access rules |
| `firebase.json` | Hosting config, CSP, redirects |

---

## 🧪 Pre-Launch Smoke Test Checklist

Run through this once before flipping to live keys:

```
PUBLIC SITE
☐ Homepage loads, hero image visible
☐ Click "Find Your Date" calendar → navigates to /booking?date=...
☐ Booking flow: pick date → select package → fill contact → see Stripe form
☐ Submit booking with test card 4242 → confirmation page
☐ Tour request form submits successfully
☐ Mobile: all pages render correctly on iPhone
☐ Mobile: sticky CTA bar appears on scroll
☐ /boutique returns 301 → /
☐ /privacy and /terms load with updated payment language
☐ Footer phone/email click-to-call and click-to-mail work

ADMIN DASHBOARD
☐ Sign in as emmettg@griffithind.com
☐ See test booking in /bookings
☐ Click expand → see payment info + Refund 50%/100% buttons
☐ Test refund (will refund the test charge)
☐ Status change buttons (new → confirmed) actually save
☐ Schedule date/time works
☐ Delete button works

FUNCTIONS
☐ createPaymentIntent returns clientSecret
☐ getAvailability returns 503 (no token yet) or real data (token set)
☐ refundBooking rejects without auth (401)
☐ Stripe webhook test event passes signature check

HOSPITABLE (after token added)
☐ Calendar shows real availability from Hospitable
☐ Make test booking → check Hospitable dashboard for new reservation
☐ Check Airbnb listing → dates should be blocked
```

---

## 🎯 Things Likely to Come Up in First 2 Weeks

### Client questions you should be ready to answer

| Question | Where to look / what to say |
|---|---|
| "How do I see new bookings?" | Admin dashboard → /bookings |
| "How much money came in this week?" | Stripe Dashboard → Payments (filter by date) |
| "Customer wants to cancel" | Admin dashboard → expand booking → Refund 50% (within 60 days) or 100% (you decide) |
| "Customer says they didn't get a confirmation email" | Stripe Dashboard → customer's payment → re-send receipt |
| "Need to change a package price" | Edit `src/app/booking/page.tsx` line ~34 (packageOptions), redeploy |
| "How do I add a new chef?" | Admin dashboard → /manage-chefs → Add Chef |
| "Bookings aren't showing in Airbnb" | Check Hospitable → Reservations. If missing, check Cloud Function logs for `pushReservationToHospitable` errors |
| "Someone double-booked through Airbnb!" | Check Hospitable webhook is configured. If not, dates won't sync back. Check function logs. |
| "Booking came through but I never got an email" | Stripe receipts are owner-side optional. Go to Stripe Dashboard → Settings → Emails → enable "Successful payments" notification |

### Common bugs that might surface

| Symptom | Likely cause | Fix |
|---|---|---|
| Calendar shows mock data after Hospitable is supposedly live | `FEATURES.HOSPITABLE_LIVE = false` still, or `NEXT_PUBLIC_HOSPITABLE_PROPERTY_ID` empty | Flip flag + set env, redeploy hosting |
| Stripe payments work but webhook events never fire | Webhook secret in functions/.env is still `whsec_PLACEHOLDER`, or webhook endpoint not registered in Stripe | Register in Stripe Dashboard → copy secret → redeploy functions |
| Hospitable returns 401 | PAT expired or wrong scope | Regenerate in Hospitable, paste new token |
| Admin can't update bookings | Browser cached old auth token | Sign out, sign back in |
| /boutique still appears in search results | Google hasn't re-crawled yet | Wait — sitemap doesn't include it, redirect handles traffic |

---

## 🔄 Rollback Plan (if launch goes sideways)

**If the new domain breaks something:**
1. Switch DNS back to GoDaddy parking temporarily
2. Site stays at `bakkers-website-847ba.web.app` while you fix

**If live Stripe keys cause issues:**
1. Revert env to test keys (`pk_test_…` / `sk_test_…`)
2. Redeploy functions
3. Customers can't pay temporarily, but no charges go through wrong
4. Display a maintenance banner: "Booking temporarily unavailable, call (206) 755-8541"

**If Hospitable sync is broken:**
1. `FEATURES.HOSPITABLE_LIVE = false`
2. Calendar reverts to mock data with disclaimer
3. Bookings still process; manually add to Hospitable until fixed

**If everything is on fire:**
```bash
firebase hosting:rollback
```
That goes back to the previous deploy. The most-recent successful state.

---

## 💰 Stripe / Tax Reminders

- **1099-K** — Stripe issues this annually to the business if revenue > $5K. Client (not you) needs to provide this to their accountant.
- **State sales tax** — WA charges B&O tax on revenue + lodging tax for stays. Client's accountant problem, but be aware Stripe doesn't auto-collect these.
- **Refund window** — Stripe allows refunds up to 180 days after charge. After that, you'd have to send a check.
- **Chargebacks** — If a customer disputes a charge with their bank, Stripe automatically deducts the disputed amount. You have ~10 days to submit evidence. Watch Stripe Dashboard → Disputes.

---

## 📦 Backup Reminders

Before launch:
- [ ] Snapshot of `.env.local` saved to your password manager
- [ ] Snapshot of `functions/.env` saved to your password manager
- [ ] Note current git SHA somewhere accessible (currently `0855d28`)
- [ ] Export Firestore once a week: `gcloud firestore export gs://bakkers-website-847ba.appspot.com/backups/$(date +%Y%m%d)` (need to set up GCS bucket first)

---

## 🧰 Tools to Install (if not already)

```bash
# Stripe CLI for local webhook testing
brew install stripe/stripe-cli/stripe
stripe login

# Forward live webhooks to local for debugging
stripe listen --forward-to localhost:3000/api/webhook

# Firebase CLI (already have)
firebase --version

# Google Cloud SDK (for Firestore exports / advanced Firebase ops)
brew install --cask google-cloud-sdk
gcloud auth login
```

---

## 🌐 DNS Records (the exact GoDaddy entries)

Firebase Hosting custom domain setup requires these DNS records. Pattern is the same for both domains.

### Step 1 — Start the Firebase verification

In Firebase Console → Hosting → site `bakkers-website-847ba` → **Add custom domain**.
Enter `anewretreatandspa.com` → Continue.

Firebase will show **TWO records to add** (one for verification, then the live A records). The exact values come from that screen, but the pattern is below.

### Step 2 — Add to GoDaddy → DNS Management

#### `anewretreatandspa.com` (PRIMARY — serves the site)

| Type | Name | Value | TTL |
|---|---|---|---|
| TXT | `@` | `google-site-verification=…` *(value from Firebase Console — one-time, can delete after verified)* | 1 hour |
| A | `@` | `151.101.1.195` | 1 hour |
| A | `@` | `151.101.65.195` | 1 hour |
| CNAME | `www` | `bakkers-website-847ba.web.app` | 1 hour |

**Important:** Before adding these, DELETE GoDaddy's default parking records:
- The A record pointing to `Parked` / GoDaddy IPs
- The CNAME for `www` pointing to GoDaddy
- The "Forwarding" rule if any exists

#### `pnwretreatandspa.com` (SECONDARY — redirects to primary)

**Simpler option — GoDaddy domain forwarding:**

GoDaddy → `pnwretreatandspa.com` → **Forwarding**:
- Forward to: `https://anewretreatandspa.com`
- Forward type: **301 (Permanent)**
- Settings: **Forward only** (NOT "Forward with masking")

No DNS records to add. GoDaddy handles it.

**Alternative — full Firebase setup (if you want pnwretreatandspa.com SSL):**

Same records as primary, except change Step 1 to add `pnwretreatandspa.com` in Firebase Console too. Then add a redirect rule in `firebase.json`:
```json
"redirects": [
  { "source": "**", "destination": "https://anewretreatandspa.com/:splat", "type": 301 }
]
```
(Already partially set up — but the redirect only fires for hits to the bakkers-website-847ba.web.app or anewretreatandspa.com origins. To redirect pnw → anew you need GoDaddy forwarding OR a second Firebase Hosting site.)

### Step 3 — Verify

After saving records in GoDaddy:

```bash
# Wait 5-30 minutes for propagation, then test:
dig anewretreatandspa.com +short
# Should return: 151.101.1.195 and 151.101.65.195

dig www.anewretreatandspa.com +short
# Should return: bakkers-website-847ba.web.app then the IPs

# Check Firebase Console for "Connected" status (green check)
# SSL cert auto-provisions 30 min - 3 hours after that.
```

### Step 4 — Once SSL is live

Update `metadataBase` is already set to `https://anewretreatandspa.com` in `src/app/layout.tsx`. Sitemap and robots.txt are already updated. No code change needed — just visit `https://anewretreatandspa.com` to verify it works with the green padlock.

### Common DNS Gotchas

| Symptom | Cause | Fix |
|---|---|---|
| `dig` still shows GoDaddy parking IPs after an hour | Browser/system DNS cache | Try from another network or `dscacheutil -flushcache` (macOS) |
| Firebase says "Pending verification" indefinitely | TXT record not propagated or wrong value | Re-check the exact TXT string in Firebase Console, copy/paste again |
| Site loads but no SSL (HTTPS broken) | Cert hasn't provisioned yet | Wait 1-3 hours, then try again. If still broken after 24h, remove + re-add domain in Firebase |
| `www.anewretreatandspa.com` doesn't work | CNAME missing or wrong | Verify CNAME `www → bakkers-website-847ba.web.app` |
| Mixed-content warnings | Hard-coded `http://` link somewhere | Search codebase for `http://` (other than localhost) |

### When DNS finally lands — final to-dos

```bash
# Submit sitemap to Google
# https://search.google.com/search-console
# Add property: anewretreatandspa.com
# Verify via TXT record (Google gives you the value)
# Submit: https://anewretreatandspa.com/sitemap.xml

# Optional: set up Google Analytics
# https://analytics.google.com → create property → get GA4 measurement ID
# Add to src/app/layout.tsx (Next.js Script component with GA snippet)
```

---

## 🎬 Day-Of-Launch Sequence

When the 4 items arrive from client:

1. **Save** the credentials to your password manager
2. **Open** all 6 monitoring tabs (Firebase, Stripe, Hospitable, site, admin, Firestore)
3. **Swap** Stripe keys → redeploy functions (~5 min)
4. **Configure** Stripe webhook → copy secret → redeploy functions (~10 min)
5. **Add** Hospitable PAT + UUID → flip flag → redeploy (~10 min)
6. **Run** the smoke test checklist above (~15 min)
7. **Configure** custom domain in Firebase → add DNS to GoDaddy (~10 min)
8. **Wait** for SSL provisioning (1-3 hr — go eat)
9. **Verify** `anewretreatandspa.com` resolves with HTTPS
10. **Submit** sitemap to Google Search Console
11. **Test** one real booking with your own card for $1 → refund yourself
12. **Tell** client it's live, share admin URL + login

Total: ~45 min active, ~2 hr including SSL wait.
