import { getCerts } from '@/lib/notion'

export const revalidate = 3600

const STATUS_CLR: Record<string, { color: string; border: string }> = {
  'Done': { color: '#10b981', border: '#10b981' },
  'In Progress': { color: '#f59e0b', border: '#f59e0b' },
  'Not Started': { color: '#666', border: '#1a1a1a' },
}
const LONG_TERM = ['CS50X', 'CS50 for Business']

type Cert = {
  id: string
  name: string
  provider: string
  status: string
  estTime: string
  fields: string[]
  link: string
  order: number
}

export default async function CertsPage() {
  let certs: Cert[] = []
  try { certs = await getCerts() } catch { certs = [] }

  const short = certs.filter(c => !LONG_TERM.some(lt => c.name.includes(lt)))
  const long = certs.filter(c => LONG_TERM.some(lt => c.name.includes(lt)))
  const done = short.filter(c => c.status === 'Done').length
  const featured = short.find(c => c.status === 'In Progress') || short.find(c => c.status === 'Not Started')

  return (
    <div className="space-y-5">
      <div style={{ border: '1px solid #1a1a1a', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#666', fontSize: '0.75rem' }}>summer certs</span>
          <span style={{ fontSize: '0.875rem' }}><span style={{ color: '#10b981', fontWeight: 'bold' }}>{done}</span>/{short.length}</span>
        </div>
        <div style={{ height: '8px', background: '#0f0f0f', border: '1px solid #1a1a1a' }}>
          <div style={{ height: '100%', background: '#10b981', width: `${short.length > 0 ? (done / short.length) * 100 : 0}%` }} />
        </div>
      </div>

      {featured && (
        <div style={{ border: '1px solid #10b981', padding: '1rem' }}>
          <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.25rem' }}>this week</div>
          <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>{featured.name}</div>
          <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem' }}>{featured.provider}{featured.estTime ? ` · ${featured.estTime}` : ''}</div>
          {featured.link && (
            <a href={featured.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.75rem', border: '1px solid #10b981', color: '#10b981', padding: '0.25rem 0.75rem' }}>
              open course →
            </a>
          )}
        </div>
      )}

      <div className="space-y-2">
        {short.map(cert => {
          const sc = STATUS_CLR[cert.status] || STATUS_CLR['Not Started']
          return (
            <div key={cert.id} style={{ border: '1px solid #1a1a1a', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{cert.name}</div>
                <div style={{ color: '#666', fontSize: '0.75rem' }}>{cert.provider}{cert.estTime ? ` · ${cert.estTime}` : ''}</div>
                {cert.fields.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    {cert.fields.map((f: string) => <span key={f} style={{ fontSize: '0.65rem', border: '1px solid #1a1a1a', color: '#666', padding: '0 0.25rem' }}>{f}</span>)}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', border: `1px solid ${sc.border}`, color: sc.color, padding: '0.1rem 0.5rem', flexShrink: 0 }}>{cert.status}</span>
                {cert.link && <a href={cert.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#666' }}>link →</a>}
              </div>
            </div>
          )
        })}
      </div>

      {long.length > 0 && (
        <div style={{ border: '1px solid #1a1a1a', padding: '1rem' }}>
          <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.75rem' }}>long-term (30+ weeks)</div>
          {long.map(cert => {
            const sc = STATUS_CLR[cert.status] || STATUS_CLR['Not Started']
            return (
              <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #1a1a1a' }}>
                <div>
                  <div style={{ fontSize: '0.875rem' }}>{cert.name}</div>
                  <div style={{ color: '#666', fontSize: '0.75rem' }}>{cert.provider}</div>
                </div>
                <span style={{ fontSize: '0.7rem', border: `1px solid ${sc.border}`, color: sc.color, padding: '0.1rem 0.5rem' }}>{cert.status}</span>
              </div>
            )
          })}
        </div>
      )}

      {certs.length === 0 && (
        <div style={{ border: '1px solid #1a1a1a', padding: '1rem', color: '#666', fontSize: '0.875rem' }}>
          couldn&apos;t load certs — check NOTION_API_KEY and NOTION_CERTS_DB_ID
        </div>
      )}
    </div>
  )
}
