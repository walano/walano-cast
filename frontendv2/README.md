# WalanoCast — frontend v2

Next.js 16 (App Router) storefront on the **v2 red marketplace design**. Full-stack:
UI + server API routes (`app/api/*`) talking directly to **Supabase** (SSR auth,
Postgres, RLS, RPCs). No separate backend service — everything runs in this app.
Split into one folder per section so each part is edited in isolation.

## Run

```bash
npm install
npm run dev        # http://localhost:3000  → redirects to /fr
npm run build
```

Env (`.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON` — client + SSR
- `SUPABASE_SERVICE_ROLE_KEY` — admin API routes (`lib/supabase/admin.ts`)
- `NEXT_PUBLIC_SITE_URL` — OAuth redirect / absolute links
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — support link
- PayPal (optional): `PAYPAL_CLIENT_ID` / `PAYPAL_ME_HANDLE` per the checkout config

## Edit per section

| Section | Route (server) | UI (client) |
|---|---|---|
| Home / catalogue | `app/[locale]/(store)/page.tsx` | `components/store/HomeContent.tsx`, `sections.tsx` |
| Product detail | `app/[locale]/(store)/product/[id]/page.tsx` | `components/product/ProductPage.tsx` |
| Checkout | `app/[locale]/(store)/checkout/page.tsx` | `components/checkout/CheckoutFlow.tsx` |
| Auth (login/register) | `app/[locale]/auth/page.tsx` + `auth/callback/route.ts` | `components/auth/AuthPage.tsx` |
| Account | `app/[locale]/(store)/account/page.tsx` | `components/account/ProfileForm.tsx` |
| Subscriptions | `app/[locale]/(store)/abonnements/page.tsx` | `components/account/GroupsList.tsx` |
| Management (admin) | `app/[locale]/management/*` | `components/admin/*` |
| About / FAQ / Legal | `app/[locale]/(store)/{about,faq,legal}/page.tsx` | `components/content/*` |
| Chrome (header/footer/cart) | `app/[locale]/(store)/layout.tsx` | `components/store/StoreShell.tsx`, `Header.tsx`, `Footer.tsx` |

Shared: `components/store/primitives.tsx` (Icon, Logo, ProductArt, `useIsMobile`),
`components/store/cart-context.tsx` (cart + wishlist, localStorage-persisted).

## Server API (`app/api/*`)

- **Catalogue** → Supabase read (`lib/catalog.ts`): categories → services → plans + stock.
- **Auth** → Supabase email/password + Google OAuth; `auth/callback` exchanges the code.
- **Orders** → `POST /api/groups` (`create_group` RPC), `submit-txn` for mobile-money IDs.
- **PayPal** → `api/paypal/create-order` + `capture`.
- **Account** → subscriptions/orders read from Supabase.
- **Admin** → `api/admin/*` (catalog, inventory, ledger, order queue) via the service-role client.

## Notes

- Cart holds multiple lines (each = service + plan); cap enforced client + server side.
- Payment: mobile money (manual txn ID, team-validated) + PayPal (immediate).
- Hero slides are static design content; everything else is live Supabase data.

`_design-reference/` holds the original v2 prototype (CDN React + Babel) for reference.
