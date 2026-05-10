# ANEW — Deploy Guide

## One-time setup

### 1. Firebase project access
```bash
firebase login
firebase use bakkers-website-847ba
```

### 2. Custom domain (in Firebase Console)
1. Go to Firebase Console → Hosting → bakkers-website-847ba site
2. Click "Add custom domain"
3. Enter `anewretreatandspa.com` → Firebase shows DNS records to add
4. Repeat for `pnwretreatandspa.com`
5. Add both DNS records in GoDaddy (see below)
6. Wait for SSL provisioning (~1 hr after DNS propagates)

### 3. GoDaddy DNS records
Log into GoDaddy → My Products → DNS for each domain.

**For `anewretreatandspa.com` (primary):**
- Delete existing A records pointing to GoDaddy parking
- Add A records as shown by Firebase Console (typically two `199.36.158.x` IPs)
- Add CNAME: host `www`, points to `bakkers-website-847ba.web.app`
- Add TXT verification record from Firebase if prompted

**For `pnwretreatandspa.com` (redirect to primary):**
- Option A (recommended): same Firebase setup → it'll serve the same site → add a redirect rule in `firebase.json` (see below)
- Option B: GoDaddy domain forwarding → forward to `https://anewretreatandspa.com` (301 permanent)

### 4. Firebase config: redirect pnwretreatandspa.com → anewretreatandspa.com
Add to `firebase.json` under `hosting.redirects` after both domains are connected:
```json
"redirects": [
  { "source": "**", "destination": "https://anewretreatandspa.com/:splat", "type": 301 }
]
```
Note: this needs Firebase Hosting multi-site setup if you want the redirect rule scoped to only `pnwretreatandspa.com`. Easier path: just use GoDaddy domain forwarding for the secondary.

---

## Routine deploy

```bash
# From timberline-estate/
npm run build              # builds Next.js → out/
firebase deploy --only hosting

# When functions change
cd functions
npm run build              # tsc → lib/
cd ..
firebase deploy --only functions

# All-in-one
firebase deploy
```

---

## Stripe go-live (when client finishes verification)

1. In `.env.local` swap:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_…
   ```
2. In `functions/.env` swap:
   ```
   STRIPE_SECRET_KEY=sk_live_…
   ```
3. In Stripe Dashboard → Webhooks → add endpoint:
   `https://us-central1-bakkers-website-847ba.cloudfunctions.net/stripeWebhook`
   Listen for: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the new `whsec_…` from the endpoint detail page → put in `functions/.env` as `STRIPE_WEBHOOK_SECRET`
5. Redeploy functions: `firebase deploy --only functions`
6. Test with a $1 booking using a real card, confirm in Stripe Dashboard, then refund

---

## Hospitable go-live (when client provides PAT)

1. Get Personal Access Token from Hospitable: Settings → Apps & Integrations → Public API → Create Token
2. Get Property UUID from Hospitable property settings
3. Update `functions/.env`:
   ```
   HOSPITABLE_API_TOKEN=…
   HOSPITABLE_PROPERTY_ID=…
   ```
4. Update `.env.local`:
   ```
   NEXT_PUBLIC_HOSPITABLE_PROPERTY_ID=…
   ```
5. In `src/lib/featureFlags.ts` flip `HOSPITABLE_LIVE: true`
6. Redeploy: `firebase deploy`
7. Open the site, scroll to availability calendar, verify it shows real dates (mock-mode notice should disappear)

---

## Monitoring

- **Stripe Dashboard** — Payments tab for transactions, Disputes for refunds
- **Firebase Console** — Hosting (traffic), Firestore (data), Functions (logs)
- **Hospitable Dashboard** — calendar status across Airbnb/VRBO/direct
- **Admin dashboard** — `https://anew-admin.web.app` (see `anew-admin/` repo)

---

## Rollback

If a deploy breaks something:
```bash
# List previous releases
firebase hosting:channel:list

# Rollback to previous release
firebase hosting:rollback
```

For functions, revert the source and redeploy:
```bash
git revert <bad-commit>
firebase deploy --only functions
```
