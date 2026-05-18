'use client'
import { useState, useEffect } from 'react'

const MOTIVATIONAL = [
  "you're 14 building systems most adults don't understand. keep going.",
  "every day you show up is a day you're ahead of who you were.",
  "the version of you walking into 10th grade is being built right now.",
  "CS50, certs, gym, meal prep. you're not waiting to grow up. you are.",
  "nobody in your grade is doing what you're doing this summer.",
  "jacked and sharp. that's the goal. stay on it.",
  "the run feels hard for the first 3 minutes. then it doesn't.",
  "one cert a week. by august you have things people twice your age don't.",
  "clear safe, jarvis, FRC — you build real things. that's rare.",
  "show up today. future you is counting on it.",
  "the library at 2:30pm hits different when you actually use the time.",
  "protein first. always.",
  "you already know what to do. just do it.",
  "the muscle you build this summer doesn't go back to school with you — it IS you.",
  "consistency beats intensity every single time.",
  "the grind is quiet. the results aren't.",
  "9th grade you didn't have this plan. 10th grade you will.",
  "every pull-up rep is a negotiation with gravity. win.",
  "rajma and rice after a hard gym session is actually the best meal on earth.",
  "one week of sleep and gym and food done right changes how you feel completely.",
  "you built an FRC impact video from scratch at half moon bay. you can do hard things.",
  "innovation nexus, clear safe, jarvis — three real projects. ship them.",
  "the dal is waiting. the gym is waiting. the cert tab is open. go.",
  "this summer is the setup. school is the reveal.",
  "TKS SF is waiting. become the person who belongs there.",
]

const BLOCKS: Record<string, { headline: string; sub: string; action: string; href: string }> = {
  run: { headline: 'Morning Run', sub: 'Get out the door. 1-2 miles. No excuses.', action: 'Log it →', href: '/' },
  getready: { headline: 'Get Ready', sub: 'Shower, breakfast prep, pack bag.', action: 'Check meals →', href: '/meals' },
  breakfast: { headline: 'Breakfast', sub: 'Overnight oats. Eat all of it. ~40g protein.', action: 'See recipe →', href: '/meals' },
  school_am: { headline: 'School — AM', sub: 'Chemistry. Focus. Take notes.', action: 'Ask tutor →', href: '/ai' },
  snack: { headline: 'Snack Break', sub: 'Greek yogurt or Zbar. Keep energy up.', action: 'Track protein →', href: '/meals' },
  school_pm: { headline: 'School — PM', sub: 'Chemistry continuing. Finish strong.', action: 'Ask tutor →', href: '/ai' },
  lunch: { headline: 'Lunch', sub: 'Protein shake + meal prep. Hit 55g.', action: 'Track →', href: '/meals' },
  decompress: { headline: 'Decompress', sub: 'Short break. Reset before work block.', action: 'Find spot →', href: '/spots' },
  workspace: { headline: 'Work Block', sub: 'Certs, projects, deep work. Peak hours at 4:30.', action: 'Find spot →', href: '/spots' },
  gym: { headline: 'Gym Time', sub: "Let's get it. Check today's workout.", action: 'Open trainer →', href: '/gym' },
  dinner: { headline: 'Dinner', sub: "Dal, rajma, or tofu bowl.", action: 'See meals →', href: '/meals' },
  winddown: { headline: 'Wind Down', sub: 'No screens 30 min before sleep. Plan tomorrow.', action: 'Day planner →', href: '/ai' },
  sleep: { headline: 'Sleep', sub: 'Recovery is training. Lights out.', action: 'Home →', href: '/' },
}

const CHECKLIST = ['run', 'breakfast', 'snack', 'lunch', 'gym', 'dinner', 'sleep']

const WORKOUT: Record<number, string> = {
  2: 'Push Day',
  3: 'Lower Day',
  5: 'Pull Day',
  6: 'Full + Core',
}

function getBlock(d: Date): string {
  const t = d.getHours() * 60 + d.getMinutes()
  if (t >= 390 && t <= 414) return 'run'
  if (t >= 415 && t <= 444) return 'getready'
  if (t >= 445 && t <= 464) return 'breakfast'
  if (t >= 480 && t <= 599) return 'school_am'
  if (t >= 600 && t <= 614) return 'snack'
  if (t >= 615 && t <= 779) return 'school_pm'
  if (t >= 780 && t <= 809) return 'lunch'
  if (t >= 810 && t <= 839) return 'decompress'
  if (t >= 840 && t <= 1139) return 'workspace'
  if (t >= 1140 && t <= 1259) return 'gym'
  if (t >= 1260 && t <= 1289) return 'dinner'
  if (t >= 1290 && t <= 1379) return 'winddown'
  return 'sleep'
}

function getSummerStatus(now: Date):
  | { state: 'pre'; daysUntil: number }
  | { state: 'active'; week: number }
  | { state: 'complete' } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const start = new Date(2025, 5, 4)
  const end = new Date(2025, 7, 15)
  if (today > end) return { state: 'complete' }
  if (today < start) {
    const daysUntil = Math.ceil((start.getTime() - today.getTime()) / 86400000)
    return { state: 'pre', daysUntil }
  }
  const week = Math.min(10, Math.floor((today.getTime() - start.getTime()) / (7 * 86400000)) + 1)
  return { state: 'active', week }
}

function getPhase(w: number): string {
  if (w <= 3) return 'Foundation'
  if (w <= 7) return 'Hypertrophy'
  return 'Peak'
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export default function Home() {
  const [now, setNow] = useState(new Date())
  const [motIdx, setMotIdx] = useState(0)
  const [checks, setChecks] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setMotIdx(Math.floor(Math.random() * MOTIVATIONAL.length))
    const stored = localStorage.getItem(`checklist-${todayKey()}`)
    if (stored) setChecks(JSON.parse(stored))

    const tick = setInterval(() => setNow(new Date()), 30000)
    const mot = setInterval(() => setMotIdx(i => (i + 1) % MOTIVATIONAL.length), 60000)
    return () => { clearInterval(tick); clearInterval(mot) }
  }, [])

  const block = getBlock(now)
  const bd = BLOCKS[block]
  const status = getSummerStatus(now)
  const week = status.state === 'active' ? status.week : 0

  function toggle(item: string) {
    const next = { ...checks, [item]: !checks[item] }
    setChecks(next)
    localStorage.setItem(`checklist-${todayKey()}`, JSON.stringify(next))
  }

  return (
    <div className="space-y-5">
      <div style={{ border: '1px solid #1a1a1a', padding: '1rem' }}>
        <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>{bd.headline}</div>
        <div style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem' }}>{bd.sub}</div>
        <a href={bd.href} style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.75rem', border: '1px solid #10b981', color: '#10b981', padding: '0.25rem 0.75rem' }}>
          {bd.action}
        </a>
      </div>

      {status.state !== 'active' && (
        <div style={{ border: '1px solid #1a1a1a', padding: '0.75rem 1rem' }}>
          <span style={{ color: status.state === 'complete' ? '#10b981' : '#666', fontSize: '0.875rem' }}>
            {status.state === 'complete'
              ? 'summer complete'
              : `pre-summer — starts in ${status.daysUntil} day${status.daysUntil === 1 ? '' : 's'}`}
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        {[
          {
            label: 'week',
            val: status.state === 'active' ? week : status.state === 'complete' ? '10' : '–',
            accent: status.state === 'active',
          },
          {
            label: 'phase',
            val: status.state === 'active' ? getPhase(week) : '–',
            accent: false,
          },
          { label: 'today', val: WORKOUT[now.getDay()] || 'Rest Day', accent: false },
        ].map(item => (
          <div key={item.label} style={{ border: '1px solid #1a1a1a', padding: '0.75rem' }}>
            <div style={{ color: '#666', fontSize: '0.7rem' }}>{item.label}</div>
            <div style={{ color: item.accent ? '#10b981' : '#e8e8e8', fontSize: item.label === 'week' ? '1.25rem' : '0.8rem', fontWeight: 'bold', marginTop: '0.15rem' }}>
              {item.val}
            </div>
          </div>
        ))}
      </div>

      <div style={{ border: '1px solid #1a1a1a', padding: '1rem' }}>
        <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.75rem' }}>daily checklist</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {CHECKLIST.map(item => (
            <button
              key={item}
              onClick={() => toggle(item)}
              style={{
                textAlign: 'left', fontSize: '0.875rem', padding: '0.5rem 0.75rem',
                border: `1px solid ${checks[item] ? '#10b981' : '#1a1a1a'}`,
                color: checks[item] ? '#10b981' : '#666',
                background: 'transparent',
              }}
            >
              {checks[item] ? '✓' : '○'} {item}
            </button>
          ))}
        </div>
        <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.5rem' }}>
          {Object.values(checks).filter(Boolean).length}/{CHECKLIST.length} done
        </div>
      </div>

      <div style={{ border: '1px solid #1a1a1a', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#e8e8e8', lineHeight: '1.6', fontStyle: 'italic' }}>
            &ldquo;{MOTIVATIONAL[motIdx]}&rdquo;
          </p>
          <button
            onClick={() => setMotIdx(i => (i + 1) % MOTIVATIONAL.length)}
            style={{ color: '#666', fontSize: '1.1rem', flexShrink: 0, background: 'transparent', border: 'none' }}
          >↻</button>
        </div>
      </div>
    </div>
  )
}
