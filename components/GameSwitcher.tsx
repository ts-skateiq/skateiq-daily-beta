'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const GAMES = [
  { key: 'wordle',      label: 'SKATE WORD', accent: '#71A88A', path: '/play/wordle' },
  { key: 'connections', label: 'CONNECT',    accent: '#7E9ECC', path: '/play/connections' },
  { key: 'daily',       label: 'DAILY',      accent: '#CB8D82', path: '/play/daily' },
]

interface Props {
  completion?: Record<string, 'pending' | 'won' | 'lost'>
}

export default function GameSwitcher({ completion = {} }: Props) {
  const pathname = usePathname()

  return (
    <nav className="flex border-b" style={{ borderColor: 'var(--border)' }} aria-label="Game switcher">
      {GAMES.map(g => {
        const active = pathname.startsWith(g.path)
        const status = completion[g.key]
        return (
          <Link
            key={g.key}
            href={g.path}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-3 text-xs font-bold tracking-widest transition-opacity relative',
              active ? '' : 'hover:opacity-70'
            )}
            style={{
              color: active ? g.accent : 'var(--text-muted)',
              borderBottom: active ? `2px solid ${g.accent}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {g.label}
            {status && (
              <span className="mt-1 text-[8px]">
                {status === 'won' ? '✓' : status === 'lost' ? '✗' : '·'}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
