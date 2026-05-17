'use client'
import { useState, useRef, useEffect } from 'react'

const BASE = `You are talking to Damodar Kriplani, 14, 9th grade, Quarry Lane High School Pleasanton CA. 5'6" 115lbs. Vegetarian, no eggs. Gym 4x/week (push/pull/lower/full split). Running 1-2mi every morning. Summer school 8am-1pm (Chemistry). TKS SF 2026-2027 accepted. FRC Robotics Team 7419. Innovation Nexus club founder. Projects: Jarvis (personal AI), Clear Safe (Arduino). Peak energy 4:30-7pm.`

const PROMPTS: Record<string, string> = {
  gym: `${BASE}\n\nYou are his gym trainer. 4-day push/pull/lower/full split. Foundation/Hypertrophy/Peak phases. Calisthenics: hollow body, L-sit, push-up/pull-up progressions. Skinny fat recomp. Be direct. No fluff. Tell him exactly what to do.`,
  chef: `${BASE}\n\nYou are his sous chef. 120-130g protein/day. Vegetarian no eggs. Mom cooks dal and rajma. Meal preps Sunday. Overnight oats breakfast. Tofu stir fry and tofu bowl. Practical and fast. Exact amounts.`,
  chem: `${BASE}\n\nYou are his Chemistry tutor. Summer school Chemistry 8am-1pm. Explain clearly, use analogies, quiz when asked.`,
  cert: `${BASE}\n\nYou are his cert coach. 10 certs tracked. CS50X and CS50 Business are 30-week. Others completable this summer. 1 cert/week target. Study partner energy. Explain, quiz, keep it moving.`,
  plan: `${BASE}\n\nYou are his day planner. Schedule: 6:30 run, 7:25 breakfast, 8-1pm school, 1pm lunch, 2pm decompress, 2pm-7pm workspace, 7pm gym, 9pm dinner, 9:30 winddown. Peak energy 4:30-7pm. Ask energy level and constraints, then output full day plan.`,
}

const MODES = [
  { id: 'gym', label: 'gym trainer' },
  { id: 'chef', label: 'sous chef' },
  { id: 'chem', label: 'chem tutor' },
  { id: 'cert', label: 'cert coach' },
  { id: 'plan', label: 'day planner' },
]

const HINTS: Record<string, string> = {
  gym: "// gym trainer — ask about today's workout, form, or progressive overload",
  chef: '// sous chef — ask for a meal, macro breakdown, or prep plan',
  chem: '// chem tutor — ask about any chemistry concept or problem',
  cert: '// cert coach — ask about any cert, study plan, or quiz me',
  plan: '// day planner — tell me your energy level and I\'ll plan your day',
}

type Msg = { role: 'user' | 'assistant'; content: string }

export default function AIPage() {
  const [mode, setMode] = useState('gym')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const bottom = useRef<HTMLDivElement>(null)
  const recog = useRef<any>(null)

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function send(text: string) {
    if (!text.trim() || loading) return
    const newMsgs: Msg[] = [...msgs, { role: 'user', content: text }]
    setMsgs(newMsgs)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs, systemPrompt: PROMPTS[mode] }),
      })
      if (!res.body) throw new Error()
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let full = ''
      setMsgs(p => [...p, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = dec.decode(value).split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content || ''
            full += delta
            setMsgs(p => { const u = [...p]; u[u.length - 1] = { role: 'assistant', content: full }; return u })
          } catch { /* skip */ }
        }
      }
      if ('speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(full)
        utt.rate = 1.1
        window.speechSynthesis.speak(utt)
      }
    } catch {
      setMsgs(p => [...p, { role: 'assistant', content: 'error — try again' }])
    }
    setLoading(false)
  }

  function listen() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Voice not supported in this browser'); return }
    const r = new SR(); r.lang = 'en-US'; r.interimResults = false
    r.onresult = (e: any) => { setInput(e.results[0][0].transcript); setListening(false) }
    r.onerror = () => setListening(false)
    r.onend = () => setListening(false)
    recog.current = r; r.start(); setListening(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setMsgs([]) }} style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', border: `1px solid ${mode === m.id ? '#10b981' : '#1a1a1a'}`, color: mode === m.id ? '#10b981' : '#666', background: 'transparent' }}>
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }} className="space-y-4">
        {msgs.length === 0 && <div style={{ color: '#666', fontSize: '0.875rem' }}>{HINTS[mode]}</div>}
        {msgs.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', fontSize: '0.875rem', padding: '0.5rem 0.75rem',
              border: `1px solid ${msg.role === 'user' ? '#10b981' : '#1a1a1a'}`,
              color: msg.role === 'user' ? '#10b981' : '#e8e8e8',
              background: msg.role === 'user' ? 'rgba(16,185,129,0.05)' : 'transparent',
              lineHeight: '1.6', whiteSpace: 'pre-wrap',
            }}>
              {msg.role === 'assistant' && <span style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>{MODES.find(m => m.id === mode)?.label}</span>}
              {msg.content || (loading && i === msgs.length - 1 ? <span style={{ color: '#666' }}>thinking...</span> : '')}
            </div>
          </div>
        ))}
        <div ref={bottom} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
          placeholder="ask anything..."
          style={{ flex: 1, background: '#0f0f0f', border: '1px solid #1a1a1a', color: '#e8e8e8', fontSize: '0.875rem', padding: '0.5rem 0.75rem', outline: 'none', fontFamily: 'inherit' }}
        />
        <button onClick={listen} style={{ fontSize: '0.875rem', border: `1px solid ${listening ? '#ef4444' : '#1a1a1a'}`, color: listening ? '#ef4444' : '#666', padding: '0.5rem 0.75rem', background: 'transparent' }}>
          {listening ? '●' : '🎤'}
        </button>
        <button onClick={() => send(input)} disabled={loading || !input.trim()} style={{ fontSize: '0.875rem', border: '1px solid #10b981', color: '#10b981', padding: '0.5rem 1rem', background: 'transparent', opacity: loading || !input.trim() ? 0.5 : 1 }}>
          →
        </button>
      </div>
    </div>
  )
}
