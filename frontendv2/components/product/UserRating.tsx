'use client'
// User rating widget: 1–5 stars + optional comment. Writes to
// public.product_ratings via Supabase client. Aggregate is intentionally not
// computed yet (front shows a static placeholder above).

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function UserRating({ productId, locale }: { productId: string; locale: string }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [savedStars, setSavedStars] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [nextPath, setNextPath] = useState('/')

  useEffect(() => {
    setNextPath(window.location.pathname)
    const supabase = createClient()
    let alive = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!alive) return
      setAuthChecked(true)
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('product_ratings')
        .select('stars, comment')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle()
      if (data && alive) {
        setStars(data.stars)
        setSavedStars(data.stars)
        setComment(data.comment ?? '')
      }
    })()
    return () => { alive = false }
  }, [productId])

  const submit = async () => {
    if (!stars || !userId) return
    setBusy(true)
    setMsg(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('product_ratings')
      .upsert({
        user_id: userId,
        product_id: productId,
        stars,
        comment: comment.trim() || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,product_id' })
    setBusy(false)
    if (error) {
      setMsg({ kind: 'err', text: 'Erreur, réessaie.' })
    } else {
      setSavedStars(stars)
      setMsg({ kind: 'ok', text: 'Merci pour ta note !' })
      setTimeout(() => setMsg(null), 2200)
    }
  }

  if (!authChecked) {
    return null // Avoid SSR/CSR flash before we know auth state.
  }

  if (!userId) {
    return (
      <div style={{ marginTop: 16, padding: '14px 18px', background: '#161616', borderRadius: 10, fontSize: 13.5, color: '#9a9a9a' }}>
        <Link href={`/${locale}/auth?next=${encodeURIComponent(nextPath)}`} style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Connecte-toi</Link>
        {' '}pour laisser ta propre note.
      </div>
    )
  }

  const shown = hover || stars
  return (
    <div style={{ marginTop: 16, padding: '16px 18px', background: '#161616', borderRadius: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Ta note</div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setStars(n)}
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24">
              <path
                d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-.9L12 3z"
                fill={n <= shown ? '#fbbf24' : '#2a2a2a'}
              />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Laisse un commentaire (optionnel)"
        rows={2}
        style={{
          width: '100%', resize: 'vertical', padding: '10px 12px', borderRadius: 8, border: 'none',
          background: '#0f0f0f', color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 12 }}>
        <span style={{ fontSize: 12, color: '#9a9a9a' }}>{savedStars ? `Ta dernière note : ${savedStars}/5` : 'Pas encore noté'}</span>
        <button
          onClick={submit}
          disabled={busy || !stars}
          style={{
            height: 36, padding: '0 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            cursor: busy || !stars ? 'not-allowed' : 'pointer', opacity: busy || !stars ? 0.5 : 1,
          }}>
          {busy ? '…' : savedStars ? 'Mettre à jour' : 'Envoyer'}
        </button>
      </div>
      {msg && (
        <div style={{ marginTop: 8, fontSize: 12, color: msg.kind === 'ok' ? '#9ff07a' : '#ff8fa3' }}>
          {msg.text}
        </div>
      )}
    </div>
  )
}
