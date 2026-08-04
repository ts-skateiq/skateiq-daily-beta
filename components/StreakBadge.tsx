interface Props {
  streak: number
  label?: string
}

export default function StreakBadge({ streak, label = 'Streak' }: Props) {
  if (streak === 0) return null
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid rgba(217,190,128,0.3)' }}>
      <span>{streak}</span>
      <span style={{ color: 'rgba(217,190,128,0.7)' }}>{label}</span>
    </div>
  )
}
