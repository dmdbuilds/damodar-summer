'use client'
import { useState, useEffect } from 'react'

const S = { border: '1px solid #1a1a1a' }

const MEALS = [
  { id: 'oats', name: 'Overnight Oats', cat: 'breakfast', protein: 40, ingredients: [{ n: 'oats', a: 0.5, u: 'cup' }, { n: 'milk', a: 1, u: 'cup' }, { n: 'protein powder', a: 1, u: 'scoop' }, { n: 'peanut butter', a: 1, u: 'tbsp' }, { n: 'banana', a: 1, u: '' }], steps: 'Combine in jar, stir, refrigerate overnight.', note: 'Make 5 jars Sunday.' },
  { id: 'stirfry', name: 'Tofu Broccoli Stir Fry', cat: 'lunch', protein: 35, ingredients: [{ n: 'firm tofu', a: 200, u: 'g' }, { n: 'broccoli', a: 2, u: 'cups' }, { n: 'garlic', a: 3, u: 'cloves' }, { n: 'soy sauce', a: 2, u: 'tbsp' }, { n: 'sesame oil', a: 1, u: 'tbsp' }, { n: 'rice cooked', a: 1, u: 'cup' }], steps: 'Press tofu 30min, pan fry until crispy, add broccoli and garlic, sauce, serve over rice.', note: 'Batch cook Sunday.' },
  { id: 'tofubowl', name: 'Tofu Bowl', cat: 'dinner', protein: 38, ingredients: [{ n: 'crispy tofu', a: 200, u: 'g' }, { n: 'quinoa cooked', a: 1, u: 'cup' }, { n: 'roasted broccoli', a: 2, u: 'cups' }, { n: 'soy-lime dressing', a: 2, u: 'tbsp' }], steps: 'Roast broccoli 400°F 20min. Pan fry tofu until crispy. Assemble over quinoa.', note: 'Batch prep Sunday.' },
  { id: 'dal', name: "Dal (mom's)", cat: 'dinner', protein: 25, ingredients: [{ n: 'yellow lentils', a: 1, u: 'cup' }, { n: 'tomato', a: 2, u: '' }, { n: 'rice or roti', a: 1, u: 'serving' }], steps: "mom's cooking — handled.", note: "mom's cooking." },
  { id: 'rajma', name: "Rajma (mom's)", cat: 'dinner', protein: 28, ingredients: [{ n: 'red kidney beans', a: 1, u: 'cup' }, { n: 'masala', a: 1, u: 'serving' }, { n: 'rice', a: 1, u: 'cup' }], steps: "mom's cooking — handled.", note: "mom's cooking." },
  { id: 'yogurt', name: 'Greek Yogurt + Granola', cat: 'snack', protein: 17, ingredients: [{ n: 'greek yogurt', a: 1, u: 'cup' }, { n: 'granola', a: 0.25, u: 'cup' }, { n: 'fruit', a: 1, u: 'serving' }], steps: 'Layer yogurt, granola, fruit.', note: 'Portion 5 cups Sunday.' },
  { id: 'shake', name: 'Protein Shake', cat: 'snack', protein: 20, ingredients: [{ n: 'protein powder', a: 1, u: 'scoop' }, { n: 'milk or water', a: 1, u: 'cup' }], steps: 'Shake or blend.', note: '' },
]

const PREP = ['overnight oats × 5', 'tofu stir fry batch', 'tofu bowl batch', 'greek yogurt portions × 5']

function sundayKey() {
  const now = new Date()
  const diff = now.getDate() - now.getDay()
  const sun = new Date(now); sun.setDate(diff)
  return sun.toISOString().split('T')[0]
}
function todayKey() { return new Date().toISOString().split('T')[0] }

export default function MealsPage() {
  const [scale, setScale] = useState<Record<string, number>>({})
  const [open, setOpen] = useState<string | null>(null)
  const [prep, setPrep] = useState<Record<string, boolean>>({})
  const [logged, setLogged] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const p = localStorage.getItem(`prep-${sundayKey()}`)
    const l = localStorage.getItem(`protein-${todayKey()}`)
    if (p) setPrep(JSON.parse(p))
    if (l) setLogged(JSON.parse(l))
  }, [])

  function togglePrep(item: string) {
    const next = { ...prep, [item]: !prep[item] }
    setPrep(next); localStorage.setItem(`prep-${sundayKey()}`, JSON.stringify(next))
  }
  function toggleLog(id: string) {
    const next = { ...logged, [id]: !logged[id] }
    setLogged(next); localStorage.setItem(`protein-${todayKey()}`, JSON.stringify(next))
  }

  const total = MEALS.filter(m => logged[m.id]).reduce((s, m) => s + m.protein, 0)
  const pct = Math.min((total / 130) * 100, 100)

  return (
    <div className="space-y-5">
      <div style={{ ...S, padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#666', fontSize: '0.75rem' }}>daily protein</span>
          <span style={{ fontSize: '0.875rem' }}><span style={{ color: '#10b981', fontWeight: 'bold' }}>{total}g</span> / 130g</span>
        </div>
        <div style={{ height: '8px', background: '#0f0f0f', border: '1px solid #1a1a1a' }}>
          <div style={{ height: '100%', background: '#10b981', width: `${pct}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div className="space-y-3">
        {MEALS.map(meal => {
          const s = scale[meal.id] || 1
          return (
            <div key={meal.id} style={S}>
              <div style={{ padding: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setOpen(open === meal.id ? null : meal.id)}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{meal.name}</div>
                  <div style={{ color: '#666', fontSize: '0.75rem' }}>{meal.cat} · {meal.protein}g protein</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button onClick={e => { e.stopPropagation(); toggleLog(meal.id) }} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: `1px solid ${logged[meal.id] ? '#10b981' : '#1a1a1a'}`, color: logged[meal.id] ? '#10b981' : '#666', background: 'transparent' }}>
                    {logged[meal.id] ? '✓ logged' : '+ log'}
                  </button>
                  <span style={{ color: '#666' }}>{open === meal.id ? '↑' : '↓'}</span>
                </div>
              </div>
              {open === meal.id && (
                <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid #1a1a1a', paddingTop: '0.75rem' }} className="space-y-3">
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>scale:</span>
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setScale(p => ({ ...p, [meal.id]: n }))} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', border: `1px solid ${s === n ? '#10b981' : '#1a1a1a'}`, color: s === n ? '#10b981' : '#666', background: 'transparent' }}>{n}×</button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {meal.ingredients.map((ing, i) => (
                      <div key={i} style={{ fontSize: '0.75rem', color: '#666', display: 'flex', gap: '0.5rem' }}>
                        <span style={{ color: '#e8e8e8' }}>{(ing.a * s).toFixed(ing.a % 1 ? 1 : 0)}{ing.u ? ` ${ing.u}` : ''}</span>
                        <span>{ing.n}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>{meal.steps}</div>
                  {meal.note && <div style={{ fontSize: '0.75rem', color: '#10b981' }}>{meal.note}</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ ...S, padding: '1rem' }}>
        <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.75rem' }}>sunday prep checklist</div>
        {PREP.map(item => (
          <button key={item} onClick={() => togglePrep(item)} style={{ display: 'block', width: '100%', textAlign: 'left', fontSize: '0.875rem', padding: '0.5rem 0.75rem', border: `1px solid ${prep[item] ? '#10b981' : '#1a1a1a'}`, color: prep[item] ? '#10b981' : '#666', background: 'transparent', marginBottom: '0.5rem' }}>
            {prep[item] ? '✓' : '○'} {item}
          </button>
        ))}
      </div>
    </div>
  )
}
