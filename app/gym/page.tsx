'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const S = { border: '1px solid #1a1a1a' }
const SA = { border: '1px solid #10b981' }
const clr = (c: boolean) => ({ color: c ? '#10b981' : '#666' })

const PUSH = [
  { name: 'Barbell Bench Press', sets: 4, reps: 8, skill: false },
  { name: 'Incline DB Press', sets: 3, reps: 10, skill: false },
  { name: 'DB Shoulder Press', sets: 3, reps: 10, skill: false },
  { name: 'Cable Lateral Raises', sets: 3, reps: 15, skill: false },
  { name: 'Tricep Pushdown', sets: 3, reps: 12, skill: false },
  { name: 'Push-Up Progression', sets: 3, reps: 10, skill: true },
]
const LOWER = [
  { name: 'Barbell Back Squat', sets: 4, reps: 8, skill: false },
  { name: 'Leg Press', sets: 3, reps: 12, skill: false },
  { name: 'Romanian Deadlift DB', sets: 3, reps: 10, skill: false },
  { name: 'Leg Curl Machine', sets: 3, reps: 12, skill: false },
  { name: 'Calf Raises', sets: 4, reps: 15, skill: false },
  { name: 'Ab Crunch Machine', sets: 3, reps: 15, skill: false },
]
const PULL = [
  { name: 'Lat Pulldown', sets: 4, reps: 10, skill: false },
  { name: 'Seated Cable Row', sets: 3, reps: 10, skill: false },
  { name: 'Dumbbell Row', sets: 3, reps: 10, skill: false },
  { name: 'Face Pulls', sets: 3, reps: 15, skill: false },
  { name: 'Barbell Bicep Curl', sets: 3, reps: 10, skill: false },
  { name: 'Pull-Up Progression', sets: 3, reps: 5, skill: true },
  { name: 'L-Sit', sets: 3, reps: 20, skill: true },
]
const FULL = [
  { name: 'Dumbbell Thrusters', sets: 4, reps: 10, skill: false },
  { name: 'Cable Woodchop', sets: 3, reps: 12, skill: false },
  { name: 'Hanging Leg Raises', sets: 3, reps: 10, skill: false },
  { name: 'Row Machine', sets: 4, reps: 10, skill: false },
  { name: 'Hollow Body Hold', sets: 3, reps: 30, skill: true },
  { name: 'Hollow Body Rock', sets: 3, reps: 15, skill: true },
  { name: 'L-Sit attempt', sets: 3, reps: 20, skill: true },
]
const ALL_EX = [...PUSH, ...LOWER, ...PULL, ...FULL]
const DAY_MAP: Record<number, { label: string; exercises: typeof PUSH }> = {
  2: { label: 'Push Day', exercises: PUSH },
  3: { label: 'Lower Day', exercises: LOWER },
  5: { label: 'Pull Day', exercises: PULL },
  6: { label: 'Full + Core', exercises: FULL },
}
const FEELS = ['easy', 'ok', 'hard', 'failed']

type Log = { date: string; exercises: Array<{ name: string; sets: Array<{ weight: string; reps: string }>; feel: string }> }
type Cal = Record<string, { weight: string; reps: string; feel: string }>

export default function GymPage() {
  const [cal, setCal] = useState<Cal>({})
  const [hasCal, setHasCal] = useState(false)
  const [logs, setLogs] = useState<Log[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [entry, setEntry] = useState<Record<string, { weight: string; reps: string }>>({})
  const [feel, setFeel] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [chart, setChart] = useState('')
  const [streak, setStreak] = useState(0)

  const dow = new Date().getDay()
  const today = DAY_MAP[dow]

  useEffect(() => {
    const c = localStorage.getItem('gymCalibration')
    const l = localStorage.getItem('gymLogs')
    if (c) { setCal(JSON.parse(c)); setHasCal(true) }
    if (l) {
      const parsed: Log[] = JSON.parse(l)
      setLogs(parsed)
      calcStreak(parsed)
      if (parsed.length > 0) setChart(ALL_EX.filter(e => !e.skill)[0]?.name || '')
    }
  }, [])

  function calcStreak(ls: Log[]) {
    let count = 0
    const cur = new Date()
    for (let i = ls.length - 1; i >= 0; i--) {
      if (ls[i].date === cur.toISOString().split('T')[0]) { count++; cur.setDate(cur.getDate() - 1) }
      else break
    }
    setStreak(count)
  }

  async function submitCal() {
    setLoading(true)
    const data = ALL_EX.map(ex => ({ name: ex.name, weight: cal[ex.name]?.weight || 'BW', reps: cal[ex.name]?.reps || '0', feel: cal[ex.name]?.feel || 'ok' }))
    localStorage.setItem('gymCalibration', JSON.stringify(cal))
    try {
      const res = await fetch('/api/gym-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ calibrationData: data }) })
      const plan = await res.json()
      localStorage.setItem('gymPlan', JSON.stringify(plan))
    } catch { localStorage.setItem('gymPlan', JSON.stringify({})) }
    setHasCal(true)
    setLoading(false)
  }

  function chartData(name: string) {
    return logs.filter(l => l.exercises.find(e => e.name === name)).map(l => {
      const ex = l.exercises.find(e => e.name === name)
      return { date: l.date.slice(5), weight: ex ? Math.max(...ex.sets.map(s => parseFloat(s.weight) || 0)) : 0 }
    })
  }

  function save() {
    const todayStr = new Date().toISOString().split('T')[0]
    const exercises = today?.exercises.map(ex => ({
      name: ex.name,
      sets: Array.from({ length: ex.sets }, (_, i) => ({ weight: entry[`${ex.name}-${i}`]?.weight || '0', reps: entry[`${ex.name}-${i}`]?.reps || '0' })),
      feel: feel[ex.name] || 'ok',
    })) || []
    const newLogs = [...logs, { date: todayStr, exercises }]
    localStorage.setItem('gymLogs', JSON.stringify(newLogs))
    setLogs(newLogs)
    calcStreak(newLogs)
    setActive(null); setEntry({}); setFeel({})
  }

  if (!hasCal) return (
    <div className="space-y-4">
      <div style={{ ...SA, padding: '1rem' }}>
        <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>Week 1 Calibration</div>
        <div style={{ color: '#666', fontSize: '0.875rem' }}>Log your starting weights honestly.</div>
      </div>
      {ALL_EX.map(ex => (
        <div key={ex.name} style={{ ...S, padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{ex.name}</span>
            {ex.skill && <span style={{ fontSize: '0.7rem', color: '#10b981', border: '1px solid #10b981', padding: '0 0.25rem' }}>skill</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            {!ex.skill && (
              <div>
                <div style={{ color: '#666', fontSize: '0.7rem', marginBottom: '0.25rem' }}>weight (lbs)</div>
                <input value={cal[ex.name]?.weight || ''} onChange={e => setCal(p => ({ ...p, [ex.name]: { ...p[ex.name], weight: e.target.value, reps: p[ex.name]?.reps || '', feel: p[ex.name]?.feel || '' } }))} placeholder="45" style={{ width: '100%', background: '#0f0f0f', border: '1px solid #1a1a1a', color: '#e8e8e8', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }} />
              </div>
            )}
            <div>
              <div style={{ color: '#666', fontSize: '0.7rem', marginBottom: '0.25rem' }}>reps</div>
              <input value={cal[ex.name]?.reps || ''} onChange={e => setCal(p => ({ ...p, [ex.name]: { ...p[ex.name], weight: p[ex.name]?.weight || '', reps: e.target.value, feel: p[ex.name]?.feel || '' } }))} placeholder="8" style={{ width: '100%', background: '#0f0f0f', border: '1px solid #1a1a1a', color: '#e8e8e8', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }} />
            </div>
            <div>
              <div style={{ color: '#666', fontSize: '0.7rem', marginBottom: '0.25rem' }}>feel</div>
              <select value={cal[ex.name]?.feel || ''} onChange={e => setCal(p => ({ ...p, [ex.name]: { ...p[ex.name], weight: p[ex.name]?.weight || '', reps: p[ex.name]?.reps || '', feel: e.target.value } }))} style={{ width: '100%', background: '#0f0f0f', border: '1px solid #1a1a1a', color: '#e8e8e8', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                <option value="">pick</option>
                {FEELS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
      <button onClick={submitCal} disabled={loading} style={{ width: '100%', border: '1px solid #10b981', color: '#10b981', background: 'transparent', padding: '0.75rem', fontSize: '0.875rem', opacity: loading ? 0.5 : 1 }}>
        {loading ? 'generating your plan...' : 'submit calibration → generate week 2 plan'}
      </button>
    </div>
  )

  return (
    <div className="space-y-5">
      <div style={{ ...S, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>{today?.label || 'Rest Day'}</div>
          <div style={{ color: '#666', fontSize: '0.75rem' }}>streak: {streak} days</div>
        </div>
        {!today && <div style={{ color: '#666', fontSize: '0.875rem' }}>recovery is training</div>}
      </div>

      {today && (
        <>
          <div className="space-y-3">
            {today.exercises.map(ex => (
              <div key={ex.name} style={{ ...S, padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{ex.name}</span>
                    {ex.skill && <span style={{ fontSize: '0.7rem', color: '#10b981', border: '1px solid #10b981', padding: '0 0.25rem' }}>skill</span>}
                  </div>
                  <span style={{ color: '#666', fontSize: '0.75rem' }}>{ex.sets}×{ex.reps}</span>
                </div>
                {active === ex.name ? (
                  <div className="space-y-2">
                    {Array.from({ length: ex.sets }, (_, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ color: '#666', fontSize: '0.75rem' }}>set {i + 1}</span>
                        {!ex.skill && <input type="text" placeholder="lbs" value={entry[`${ex.name}-${i}`]?.weight || ''} onChange={e => setEntry(p => ({ ...p, [`${ex.name}-${i}`]: { weight: e.target.value, reps: p[`${ex.name}-${i}`]?.reps || '' } }))} style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', color: '#e8e8e8', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }} />}
                        <input type="text" placeholder="reps" value={entry[`${ex.name}-${i}`]?.reps || ''} onChange={e => setEntry(p => ({ ...p, [`${ex.name}-${i}`]: { weight: p[`${ex.name}-${i}`]?.weight || '', reps: e.target.value } }))} style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', color: '#e8e8e8', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }} />
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {FEELS.map(f => (
                        <button key={f} onClick={() => setFeel(p => ({ ...p, [ex.name]: f }))} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: `1px solid ${feel[ex.name] === f ? '#10b981' : '#1a1a1a'}`, ...clr(feel[ex.name] === f), background: 'transparent' }}>{f}</button>
                      ))}
                    </div>
                    <button onClick={() => setActive(null)} style={{ fontSize: '0.75rem', color: '#10b981', border: '1px solid #10b981', padding: '0.25rem 0.75rem', background: 'transparent', marginTop: '0.25rem' }}>done</button>
                  </div>
                ) : (
                  <button onClick={() => setActive(ex.name)} style={{ fontSize: '0.75rem', color: '#666', border: '1px solid #1a1a1a', padding: '0.25rem 0.75rem', background: 'transparent' }}>log this exercise</button>
                )}
              </div>
            ))}
          </div>
          <button onClick={save} style={{ width: '100%', border: '1px solid #10b981', color: '#10b981', background: 'transparent', padding: '0.75rem', fontSize: '0.875rem' }}>finish workout + save</button>
        </>
      )}

      {logs.length > 0 && (
        <div style={{ ...S, padding: '1rem' }}>
          <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.75rem' }}>progress chart</div>
          <select value={chart} onChange={e => setChart(e.target.value)} style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', color: '#e8e8e8', fontSize: '0.875rem', padding: '0.25rem 0.5rem', width: '100%', marginBottom: '1rem' }}>
            {ALL_EX.filter(e => !e.skill).map(ex => <option key={ex.name} value={ex.name}>{ex.name}</option>)}
          </select>
          {chart && chartData(chart).length > 0 && (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData(chart)}>
                <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 10, fill: '#666' }} />
                <YAxis stroke="#666" tick={{ fontSize: 10, fill: '#666' }} />
                <Tooltip contentStyle={{ background: '#0f0f0f', border: '1px solid #1a1a1a', color: '#e8e8e8', fontSize: 11 }} />
                <Line type="monotone" dataKey="weight" stroke="#10b981" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  )
}
