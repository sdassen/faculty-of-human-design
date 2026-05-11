# Order Delivery Workflow — Setup Checklist

Complete these steps in order before deploying.

---

## 1. Install packages

```bash
npm install
```

New packages added:
- `inngest` — async workflow engine
- `@supabase/supabase-js` — database client
- `@vercel/blob` — private PDF storage
- `resend` — transactional email
- `@react-pdf/renderer` — server-side PDF generation

---

## 2. Supabase — Create the orders table

Open the **Supabase SQL editor** for your project and run:

```
supabase/migrations/001_create_orders.sql
```

Or via CLI:
```bash
supabase db push
```

---

## 3. Vercel Blob — Enable private blob storage

In your **Vercel project dashboard → Storage → Blob**:
1. Create a new Blob store (or use existing)
2. Copy the `BLOB_READ_WRITE_TOKEN`

---

## 4. Environment variables

Add these to **Vercel → Project → Settings → Environment Variables**:

| Variable | Where to find it |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys (already set) |
| `STRIPE_WEBHOOK_SECRET` | See step 5 |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → Service role key |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store settings |
| `RESEND_API_KEY` | Resend dashboard → API keys |
| `INNGEST_SIGNING_KEY` | Inngest dashboard → Your app |
| `INNGEST_EVENT_KEY` | Inngest dashboard → Your app |
| `ANTHROPIC_API_KEY` | Anthropic console (already used for `/api/generate-report`) |

> **Note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are **server-side only** — do NOT prefix with `VITE_`.

---

## 5. Stripe Webhook

### Register the webhook endpoint:

In **Stripe dashboard → Developers → Webhooks → Add endpoint**:
- **URL:** `https://www.facultyofhumandesign.com/api/webhooks/stripe`
- **Events to listen for:**
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`

Copy the **Signing secret** → add as `STRIPE_WEBHOOK_SECRET` in Vercel.

---

## 6. Inngest — Connect to Vercel

1. Sign in at [inngest.com](https://www.inngest.com)
2. Go to **Apps → Add app**
3. **App URL:** `https://www.facultyofhumandesign.com/api/inngest`
4. Inngest will auto-discover the `order-delivery` function
5. Copy the **Signing key** and **Event key** → add to Vercel env vars

---

## 7. Resend — Sender domain

> For now, using `stevendassen@gmail.com` as the `from` address is fine for testing.
> For production, verify your domain in Resend and update the `FROM` constant in `lib/email/index.js`.

Also update the `from` address there:
```js
// lib/email/index.js
const FROM = "Faculty of Human Design <rapport@facultyofhumandesign.com>";
```

---

## 8. Deploy

```bash
git add -A
git commit -m "Add order delivery workflow (Inngest + Supabase + PDF + email)"
git push
```

Vercel will auto-deploy. Verify the deployment completes without build errors.

---

## 9. Test the full flow

1. Go to a rapport page → fill in form (with your real email) → click "Blauwdruk bestellen"
2. Complete the Stripe **test** payment (use card `4242 4242 4242 4242`)
3. You should land on the confirmation page "Bestelling bevestigd"
4. In **Inngest dashboard → Runs**, you should see the `order-delivery` function triggered
5. Check **Supabase → Table editor → orders** — order status should progress: `pending → paid → processing → delivered`
6. After the (shortened) delay, check your inbox for the delivery email with the download link

---

## Flow summary

```
Customer fills form (with email)
    ↓
/api/create-order  → saves birth data + email to Supabase
    ↓
/api/checkout      → creates Stripe session with client_reference_id=orderId
    ↓
Stripe payment
    ↓
/api/webhooks/stripe → updates order to "paid" → fires Inngest event "order/paid"
    ↓
Inngest: order-delivery function
  Step 1: Send confirmation email (immediately)
  Step 2: Sleep 18–23h (business day aware)
  Step 3–N: Generate each report section via Claude API
  Step N+1: Render PDF with @react-pdf/renderer
  Step N+2: Upload PDF to Vercel Blob (private)
  Step N+3: Generate download token → save to Supabase
  Step N+4: Send delivery email with https://…/download/{token}
    ↓
Customer clicks link → /download/{token} SPA page
    ↓
/api/download/[token] → validates token → streams private PDF
```
