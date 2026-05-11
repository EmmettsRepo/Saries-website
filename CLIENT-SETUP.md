# ANEW Website — Final Setup Steps

The website is built and tested. To take it live and start accepting bookings, I need 4 things from you. Total time: **~30-45 minutes**.

---

## Step 1: Confirm Pricing (5 minutes)

Review the prices currently in the code and tell me if anything needs to change.

### Event Packages
| Package | Price | Capacity | Duration |
|---|---|---|---|
| Elopement | $3,000 | Up to 15 guests | 1 night |
| Gathering | $3,000 | Up to 40 guests | 1 night |
| Corporate | $3,000 | Up to 50 guests | 1 night |
| Signature | $6,000 | Up to 75 guests | 2 nights |
| Weekend Retreat | $9,000 | Up to 75 guests | 3 nights |
| Custom | Quoted | Up to 75 guests | Custom |

### Add-ons
| Add-on | Price |
|---|---|
| Catering | $45 per person |
| Photography | $800 |
| DJ / Music | $600 |
| Floral & Decor | $1,200 |
| Fire Pit Evening | $300 |
| Ceremony Setup | $500 |
| Nature Walk | $200 |
| Extended Hours | $400/hr |
| Cleanup | $350 |
| Shuttle | $250 |

### Cancellation Policy
- 60+ days before arrival: **50% refund**
- Within 60 days of arrival: **non-refundable**
- Payment is collected **in full at booking** (not a deposit)

**👉 Action:** Reply to Emmett with any prices that need to change, or just "all good" if it's all correct.

---

## Step 2: Set Up Stripe (15-20 minutes)

Stripe is what processes the credit card payments on the website. The money goes directly to your US Bank account.

### 2a. Create the Stripe account

1. Go to **https://dashboard.stripe.com/register**
2. Sign up with your business email (not a personal one if you have a business email)
3. Choose **"United States"** as your country
4. Choose **"Business"** as account type

### 2b. Complete business verification

Stripe needs to verify your identity before they'll let you accept money. Have these ready:

- **Legal business name** (LLC, sole prop, corp — whatever it's registered as)
- **EIN** (Employer Identification Number) — or your SSN if you're a sole proprietor
- **Your full legal name + date of birth + last 4 digits of your SSN**
- **Business address** (mailing address — can be a PO Box or home address)
- **Business phone** (your `(206) 755-8541` works fine)
- **Industry**: Hotels, Restaurants & Hospitality → Hotels, Inns, etc.
- **Description**: "Pacific Northwest retreat and event venue. Weddings, retreats, and short stays."

### 2c. Connect your bank account

In the Stripe dashboard:
1. Settings (gear icon top right) → **Payouts**
2. Add bank account:
   - **Routing**: `125000105`
   - **Account**: `1684-0555-4135`
3. Stripe will make 2 small deposits within 1-2 business days. Verify them when they show up to confirm the account.

### 2d. Send Emmett your keys

Once Stripe approves your account (usually instant, sometimes 1-2 business days):

1. In Stripe Dashboard, go to **Developers → API keys**
2. There are two keys — copy both:
   - **Publishable key** — starts with `pk_live_...`
   - **Secret key** — click "Reveal live key", starts with `sk_live_...`
3. **Important:** The secret key should NOT be emailed or texted. Use a password-protected method:
   - Signal app
   - 1Password shared vault
   - Bitwarden Send (https://bitwarden.com/send/) — sends a self-destructing link
4. The publishable key is safe to send normally.

### 2e. Add Emmett as a team member (optional but helpful)

In Stripe Dashboard → **Settings → Team and security → Team** → Invite member:
- Email: `griffithlp@icloud.com`
- Role: Developer

This lets Emmett help with webhook setup without needing to send keys back and forth.

**👉 Action:** Send Emmett the `pk_live_...` key (normal channel) and the `sk_live_...` key (secure channel).

---

## Step 3: Set Up Hospitable (15-20 minutes)

Hospitable is the booking management system that connects your website to Airbnb, VRBO, and any direct bookings. When someone books on the website, Hospitable automatically blocks those dates on Airbnb so you don't get double-booked.

### 3a. Sign up

1. Go to **https://hospitable.com**
2. Click "Get Started" / "Sign Up"
3. Choose the **"Hospitable for Hosts"** plan (right tier for ANEW's size)

### 3b. Create your property listing

In Hospitable dashboard → **Properties → Add Property**:
1. Property name: `ANEW Retreat & Spa`
2. Address: (your retreat address)
3. Bedrooms: 5
4. Bathrooms: (however many)
5. Max guests: 75 (or whatever your real max is)
6. Property type: "Estate" or "Vacation rental"
7. Upload photos (or skip for now — can add later)
8. Set base nightly price (e.g., $3,000)

### 3c. Connect Airbnb

In Hospitable dashboard → **Channels → Add channel → Airbnb**:
1. Click "Connect Airbnb"
2. It'll redirect you to Airbnb to authorize
3. Select the ANEW Airbnb listing
4. Confirm

### 3d. Connect VRBO (if you use it)

In Hospitable dashboard → **Channels → Add channel → VRBO**:
- Same process, redirects to VRBO for authorization

### 3e. Generate API token for the website

This is what lets the website talk to Hospitable.

1. In Hospitable dashboard, go to **Settings → Apps & Integrations**
2. Find **"Public API"** section
3. Click **"Create Token"** (or "Personal Access Token")
4. Name it: `ANEW Website`
5. Permissions needed: **Calendar (read) + Reservations (read & write)**
6. Click Create
7. **Copy the token immediately** — Hospitable only shows it once. Looks like a long string of random characters.

### 3f. Get the property UUID

1. In Hospitable dashboard, click on your ANEW property
2. Look at the URL — there's a long ID in it like `4f8a3c1e-9b2d-4e7f-a1b8-...`
3. Copy that UUID

### 3g. Send Emmett both

- **API Token** — use the same secure channel as the Stripe secret key (1Password, Signal, or Bitwarden Send)
- **Property UUID** — safe to send in a normal message

**👉 Action:** Send Emmett the Hospitable API token (secure) and the property UUID (normal).

---

## Step 4: Side Items (NOT my concern, but reminders)

These run independently at the property — Emmett doesn't touch them, but they should be set up before launch:

- [ ] **StayFi** — guest WiFi system / lead capture
- [ ] **Ring** — security cameras + smart locks
- [ ] **Turno** — cleaning management (recommend connecting to Hospitable so cleanings auto-schedule from bookings)
- [ ] **Liability insurance** — make sure events are covered

---

## What Happens After You Send Everything

Once Emmett has all 4 items, he needs **~1 hour** to:

1. Swap Stripe test keys for your live keys (15 min)
2. Create the Stripe webhook + paste secret (10 min)
3. Wire up Hospitable token + property UUID + flip the live flag (10 min)
4. Run a real $1 charge with his own card → refund it → confirm everything flows correctly (15 min)
5. Final deploy + verification (10 min)

Then the domain needs to be pointed at the new site:

- Emmett configures DNS in GoDaddy
- Waits 1-3 hours for SSL certificate to provision
- Visit `anewretreatandspa.com` → live website ✅

---

## Quick Reference Checklist

Print this and check off as you go:

```
PRICING
☐ Reviewed all package + add-on prices
☐ Sent Emmett any changes (or "all good")

STRIPE
☐ Created Stripe account at dashboard.stripe.com
☐ Completed business identity verification (EIN, name, DOB, SSN last 4)
☐ Connected US Bank account (routing 125000105, acct 1684-0555-4135)
☐ Invited griffithlp@icloud.com as team member (optional)
☐ Sent Emmett the pk_live_... key (normal channel)
☐ Sent Emmett the sk_live_... key via SECURE channel (Signal/1Password/Bitwarden Send)

HOSPITABLE
☐ Signed up for Hospitable for Hosts
☐ Created the ANEW property in Hospitable
☐ Connected Airbnb to Hospitable
☐ Connected VRBO to Hospitable (if applicable)
☐ Generated Public API token with calendar + reservation permissions
☐ Sent Emmett the API token via SECURE channel
☐ Sent Emmett the property UUID (normal channel)

OPERATIONS (independent of website)
☐ StayFi configured at property
☐ Ring set up
☐ Turno connected to Hospitable
☐ Liability insurance current
```

---

## Questions or Stuck?

Text Emmett at `(206) 755-8541` and he can walk you through any step.

— Generated for ANEW Retreat & Spa launch
