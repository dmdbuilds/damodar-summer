'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'home' },
  { href: '/gym', label: 'gym' },
  { href: '/meals', label: 'meals' },
  { href: '/certs', label: 'certs' },
  { href: '/spots', label: 'spots' },
  { href: '/ai', label: 'ai' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <>
      <nav style={{ background: '#080808', borderBottom: '1px solid #1a1a1a' }} className="hidden md:flex fixed top-0 left-0 right-0 z-50 px-6 h-14 items-center gap-6">
        <span style={{ color: '#10b981' }} className="font-bold mr-4">DOS/</span>
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            style={{ color: pathname === l.href ? '#10b981' : '#666666' }}
            className="text-sm hover:text-[#e8e8e8] transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <nav style={{ background: '#080808', borderTop: '1px solid #1a1a1a' }} className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            style={{ color: pathname === l.href ? '#10b981' : '#666666' }}
            className="flex-1 py-3 text-center text-xs transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
