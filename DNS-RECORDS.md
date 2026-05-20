# DNS Records — anewretreatandspa.com

Put these into **GoDaddy → DNS Management** for `anewretreatandspa.com`.

Two-step setup: (1) verify ownership in Firebase Console, (2) add the live A + CNAME records.

---

## Before you start (5 min)

1. Open Firebase Console → Hosting → site `bakkers-website-847ba` → **Add custom domain**
2. Enter `anewretreatandspa.com` → Continue
3. Firebase shows you a **verification TXT record** (e.g. `google-site-verification=abc123...`) — copy that exact value
4. Once verified, Firebase shows you the two **A records** for the apex (`@`)

The records below are the standard Firebase Hosting values. If Firebase shows different IPs at step 4, use Firebase's values, not these.

---

## Apex: `anewretreatandspa.com`

### Step 1 — delete GoDaddy's default records first

In GoDaddy DNS, **remove** anything pointing `@` or `www` at GoDaddy parking pages:
- A record on `@` → any GoDaddy parking IP
- CNAME on `www` → `@` or GoDaddy parking
- Any "Forwarding" rule

If you don't remove these, the new records won't take effect.

### Step 2 — add these four records

| Type  | Name | Value                                          | TTL    |
|-------|------|------------------------------------------------|--------|
| TXT   | `@`  | `google-site-verification=...` (from Firebase) | 1 hour |
| A     | `@`  | `151.101.1.195`                                | 1 hour |
| A     | `@`  | `151.101.65.195`                               | 1 hour |
| CNAME | `www`| `bakkers-website-847ba.web.app`                | 1 hour |

### Step 3 — admin subdomain (optional, recommended)

If you want `admin.anewretreatandspa.com` to load the admin dashboard:

| Type  | Name    | Value                              | TTL    |
|-------|---------|------------------------------------|--------|
| CNAME | `admin` | `anew-admin.web.app`               | 1 hour |

Then add `admin.anewretreatandspa.com` as a custom domain on the `anew-admin` Firebase Hosting site.

---

## Secondary: `pnwretreatandspa.com` (301 → primary)

Easiest path — GoDaddy domain forwarding:

GoDaddy → `pnwretreatandspa.com` → **Forwarding**:
- Forward to: `https://anewretreatandspa.com`
- Forward type: **301 (Permanent)**
- Settings: **Forward only** (NOT "Forward with masking")

No DNS records needed — GoDaddy handles it server-side.

---

## Verification (after saving)

Wait 5–30 min for propagation, then:

```bash
dig anewretreatandspa.com +short
# Expect: 151.101.1.195 and 151.101.65.195

dig www.anewretreatandspa.com +short
# Expect: bakkers-website-847ba.web.app  then the two IPs

dig pnwretreatandspa.com +short
# Expect: GoDaddy forwarding redirect IPs

curl -sI https://anewretreatandspa.com | head -5
# Expect: HTTP/2 200  with content from the site
```

Firebase Console will show a **green check** next to the domain once the records resolve. SSL provisions automatically 30 min – 3 hours after that.

---

## Common gotchas

| Symptom                                          | Cause                                  | Fix                                                                  |
|--------------------------------------------------|----------------------------------------|----------------------------------------------------------------------|
| `dig` still returns GoDaddy parking IPs          | Browser/system DNS cache               | `dscacheutil -flushcache` on Mac, or test from another network       |
| Firebase says "Pending verification" indefinitely| TXT record wrong or not propagated     | Re-check exact TXT value in Firebase Console, copy/paste again       |
| Site loads but no SSL                            | Cert hasn't provisioned yet            | Wait up to 3 hours; if 24h+, remove and re-add domain in Firebase    |
| `www.anewretreatandspa.com` doesn't work         | CNAME missing or wrong                 | Verify CNAME `www → bakkers-website-847ba.web.app`                   |
| Mixed-content warning in browser                 | Hard-coded `http://` link in source    | grep codebase for `http://` (excluding `localhost`)                  |

---

## After DNS is live

1. Submit sitemap in Google Search Console
   - https://search.google.com/search-console
   - Add property: `anewretreatandspa.com`
   - Submit: `https://anewretreatandspa.com/sitemap.xml`
2. (Optional) Set up Google Analytics — add GA4 snippet to `src/app/layout.tsx`
3. Run one real $1 test booking with your own card, then refund yourself via the admin dashboard
4. Configure the Stripe webhook endpoint to point at the new domain if you ever proxy it (currently it lives at `*.cloudfunctions.net`, which doesn't need to change)
