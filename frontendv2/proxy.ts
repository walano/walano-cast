import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const LOCALES = ['en', 'fr'] as const
const DEFAULT_LOCALE = 'fr'

function getLocale(req: NextRequest): string {
  const acceptLang = req.headers.get('accept-language') ?? ''
  for (const segment of acceptLang.split(',')) {
    const lang = segment.split(';')[0].trim().slice(0, 2).toLowerCase()
    if ((LOCALES as readonly string[]).includes(lang)) return lang
  }
  return DEFAULT_LOCALE
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Skip static assets / API ──────────────────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // ── Base response (cookies are written here) ───────────────────────────────
  const response = NextResponse.next({ request: req })

  // ── Supabase session refresh — BEFORE any redirect ─────────────────────────
  // Refreshed auth cookies land on `response`; copied onto the redirect below.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )
  await supabase.auth.getUser()

  // ── Default currency cookie (no blocking external fetch on hot path) ───────
  // Geo refinement is done client-side / on demand via /api/geo.
  if (!req.cookies.get('wc_currency')) {
    response.cookies.set('wc_currency', 'XAF', { path: '/', maxAge: 3600 })
  }

  // ── i18n redirect — carry refreshed cookies onto the redirect response ─────
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (!pathnameHasLocale) {
    const url = req.nextUrl.clone()
    url.pathname = `/${getLocale(req)}${pathname}`
    const redirect = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
