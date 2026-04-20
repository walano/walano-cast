# WalanoCast — frontend v2

Next.js 16 (App Router) storefront built on the **v2 red marketplace design**, wired
to the existing backend. Same proven infra as `../frontend` (Supabase SSR auth,
`lib/api.ts` → Express backend on Railway, `chariow-adapter`), reskinned with the
v2 design and split into one folder per section so each part is edited in isolation.

## Run

```bash
npm install        # or reuse ../frontend/node_modules (identical deps)
npm run dev        # http://localhost:3000  → redirects to /fr
npm run build
```

Env (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_BACKEND_URL` (Express backend), `NEXT_PUBLIC_SITE_URL`.
Catalogue/checkout/account need the backend running; if it is offline the storefront
still renders (empty catalogue, account shows empty state).

## Edit per section

| Section | Route (server) | UI (client) |
|---|---|---|
| Home / catalogue | `app/[locale]/(store)/page.tsx` | `components/store/HomeContent.tsx`, `sections.tsx` |
| Product detail | `app/[locale]/(store)/product/[id]/page.tsx` | `components/product/ProductPage.tsx` |
| Auth (login/register) | `app/[locale]/auth/page.tsx` + `auth/callback/route.ts` | `components/auth/AuthPage.tsx` |
| Account | `app/[locale]/(store)/account/page.tsx` | `components/account/SignOutButton.tsx` |
| About | `app/[locale]/(store)/about/page.tsx` | `components/content/AboutPage.tsx` |
| FAQ | `app/[locale]/(store)/faq/page.tsx` | `components/content/FaqPage.tsx` |
| Legal | `app/[locale]/(store)/legal/page.tsx` | `components/content/PolicyPage.tsx` |
| Chrome (header/footer/cart) | `app/[locale]/(store)/layout.tsx` | `components/store/StoreShell.tsx`, `Header.tsx`, `Footer.tsx`, `CartDrawer.tsx` |

Shared: `components/store/primitives.tsx` (Icon, Logo, ProductArt, `useIsMobile`),
`components/store/cart-context.tsx` (single-item cart + checkout).

## What links to the backend ("what's been done")

- **Catalogue/search/product** → `api.products.list/get` (Chariow proxy), mapped to the
  v2 card shape in `lib/v2-adapter.ts` (`chariow-adapter` → `ServiceWithPlans` → `CardProduct`).
- **Auth** → Supabase Google OAuth + email/password; `auth/callback` exchanges the code.
- **Account** → `api.subscriptions.list` + `api.requests.list`.
- **Checkout** → `api.checkout.initiate` (Chariow). Redirects to the returned checkout URL.

## Notes / TODO

- **Cart holds one item at a time** (adding replaces). Decision per product owner.
- **PayPal button** currently routes through the same `api.checkout.initiate` (Chariow) —
  a dedicated PayPal gateway is not yet on the backend. See `cart-context.tsx#checkout`.
- **Checkout name/phone** are derived from Supabase user metadata; the backend requires
  `phone`, so add a phone-capture step before going live.
- **Management/admin** intentionally not ported here (still lives in `../frontend`).
- Hero slides are static design content; everything else is live data.

`_design-reference/` holds the original v2 prototype (CDN React + Babel) for reference.
