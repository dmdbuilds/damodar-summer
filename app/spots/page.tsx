'use client'
import { useState, useEffect } from 'react'

type Hours = { open: number; close: number } | null
type Spot = { name: string; address: string; hours: Record<string, Hours>; vibe: string; distance: string }

const SPOTS: Spot[] = [
  { name: 'Pleasanton Library', address: '400 Old Bernal Ave Pleasanton CA', hours: { Mon: { open: 600, close: 1200 }, Tue: { open: 600, close: 1200 }, Wed: { open: 600, close: 1200 }, Thu: { open: 600, close: 1200 }, Fri: { open: 600, close: 1020 }, Sat: { open: 600, close: 1020 }, Sun: null }, vibe: 'quiet, best for deep cert work', distance: '2.1mi' },
  { name: 'Inklings Coffee & Tea', address: '4301 First St Pleasanton CA', hours: { Mon: { open: 390, close: 1080 }, Tue: { open: 390, close: 1080 }, Wed: { open: 390, close: 1080 }, Thu: { open: 390, close: 1080 }, Fri: { open: 390, close: 1080 }, Sat: { open: 420, close: 1020 }, Sun: { open: 420, close: 1020 } }, vibe: 'chill local cafe, good ambiance', distance: '1.8mi' },
  { name: 'Starbucks Bernal Ave', address: 'Bernal Ave Pleasanton CA', hours: { Mon: { open: 330, close: 1260 }, Tue: { open: 330, close: 1260 }, Wed: { open: 330, close: 1260 }, Thu: { open: 330, close: 1260 }, Fri: { open: 330, close: 1260 }, Sat: { open: 330, close: 1260 }, Sun: { open: 330, close: 1260 } }, vibe: 'reliable wifi, use headphones', distance: '1.5mi' },
  { name: 'Starbucks Santa Rita', address: 'Santa Rita Rd Pleasanton CA', hours: { Mon: { open: 300, close: 1290 }, Tue: { open: 300, close: 1290 }, Wed: { open: 300, close: 1290 }, Thu: { open: 300, close: 1290 }, Fri: { open: 300, close: 1290 }, Sat: { open: 300, close: 1290 }, Sun: { open: 300, close: 1290 } }, vibe: 'bigger, less crowded afternoons', distance: '2.5mi' },
  { name: 'Panera Bread', address: 'Hopyard Rd Pleasanton CA', hours: { Mon: { open: 360, close: 1260 }, Tue: { open: 360, close: 1260 }, Wed: { open: 360, close: 1260 }, Thu: { open: 360, close: 1260 }, Fri: { open: 360, close: 1260 }, Sat: { open: 360, close: 1260 }, Sun: { open: 360, close: 1260 } }, vibe: 'booths, free wifi, can stay for hours', distance: '2.8mi' },
  { name: 'Dublin Library', address: '200 Civic Plaza Dublin CA', hours: { Mon: { open: 600, close: 1200 }, Tue: { open: 600, close: 1200 }, Wed: { open: 600, close: 1200 }, Thu: { open: 600, close: 1200 }, Fri: { open: 600, close: 1020 }, Sat: { open: 600, close: 1020 }, Sun: null }, vibe: 'sometimes quieter than Pleasanton', distance: '3.5mi' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function fmt(m: number) {
  const h = Math.floor(m / 60), min = m % 60, ampm = h >= 12 ? 'pm' : 'am'
  return `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${min.toString().padStart(2, '0')}${ampm}`
}

function isOpen(spot: Spot, now: Date) {
  const h = spot.hours[DAYS[now.getDay()]]
  if (!h) return false
  const t = now.getHours() * 60 + now.getMinutes()
  return t >= h.open && t < h.close
}

function minsLeft(spot: Spot, now: Date) {
  const h = spot.hours[DAYS[now.getDay()]]
  if (!h) return 0
  return h.close - (now.getHours() * 60 + now.getMinutes())
}

export default function SpotsPage() {
  const [now, setNow] = useState(new Date())
  const [picked, setPicked] = useState<Spot | null>(null)
  const [excl, setExcl] = useState<string[]>([])

  useEffect(() => { pick([]) }, [])

  function pick(ex: string[]) {
    const t = now.getHours() * 60 + now.getMinutes()
    const gymTime = 19 * 60
    const valid = SPOTS.filter(s => !ex.includes(s.name) && isOpen(s, now) && minsLeft(s, now) >= 60 && gymTime - t >= 60)
    setPicked(valid.length > 0 ? valid[Math.floor(Math.random() * valid.length)] : null)
  }

  function notFeeling() {
    if (!picked) return
    const next = [...excl, picked.name]
    setExcl(next); pick(next)
  }

  const gymTime = 19 * 60
  const cur = now.getHours() * 60 + now.getMinutes()
  const hBefore = Math.max(0, Math.floor((gymTime - cur) / 60))
  const mBefore = Math.max(0, (gymTime - cur) % 60)

  return (
    <div className="space-y-5">
      {picked ? (
        <div style={{ border: '1px solid #10b981', padding: '1rem' }}>
          <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.25rem' }}>go here</div>
          <div style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: 'bold' }}>{picked.name}</div>
          <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem' }}>{picked.vibe}</div>
          <div style={{ color: '#e8e8e8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            closes {fmt(picked.hours[DAYS[now.getDay()]]?.close ?? 0)} · {picked.distance} · {hBefore}h {mBefore}m before gym
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(picked.address)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', border: '1px solid #10b981', color: '#10b981', padding: '0.4rem 0.75rem' }}>navigate →</a>
            <button onClick={notFeeling} style={{ fontSize: '0.75rem', border: '1px solid #1a1a1a', color: '#666', padding: '0.4rem 0.75rem', background: 'transparent' }}>not feeling it</button>
          </div>
        </div>
      ) : (
        <div style={{ border: '1px solid #1a1a1a', padding: '1rem' }}>
          <div style={{ color: '#666', fontSize: '0.875rem' }}>nowhere works right now — gym in {hBefore}h {mBefore}m, stay home and work</div>
          <button onClick={() => { setExcl([]); pick([]) }} style={{ marginTop: '0.75rem', fontSize: '0.75rem', border: '1px solid #1a1a1a', color: '#666', padding: '0.25rem 0.75rem', background: 'transparent' }}>try again</button>
        </div>
      )}

      <div style={{ border: '1px solid #1a1a1a', padding: '1rem' }}>
        <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.75rem' }}>all spots — today</div>
        {SPOTS.map(spot => {
          const open = isOpen(spot, now)
          const day = DAYS[now.getDay()]
          const h = spot.hours[day]
          return (
            <div key={spot.name} style={{ padding: '0.75rem 0', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.875rem' }}>{spot.name}</div>
                <div style={{ color: '#666', fontSize: '0.7rem' }}>{spot.vibe} · {spot.distance}</div>
                <div style={{ color: '#666', fontSize: '0.7rem' }}>{h ? `${fmt(h.open)} – ${fmt(h.close)}` : 'closed today'}</div>
              </div>
              <span style={{ fontSize: '0.7rem', border: `1px solid ${open ? '#10b981' : '#1a1a1a'}`, color: open ? '#10b981' : '#666', padding: '0.1rem 0.5rem', flexShrink: 0 }}>
                {open ? 'open' : 'closed'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
