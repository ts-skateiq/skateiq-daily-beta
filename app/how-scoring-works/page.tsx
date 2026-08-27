const medals = [
  {
    emoji: '🥇',
    label: 'Gold',
    color: '#C9A84C',
    description: 'You checked every trick.',
    rows: [],
  },
  {
    emoji: '🥈',
    label: 'Silver',
    color: '#A0A9B8',
    description: 'You checked most of the tricks.',
    rows: [
      { tricks: 2, dots: '🟢🔴' },
      { tricks: 3, dots: '🟢🟢🔴' },
      { tricks: 4, dots: '🟢🟢🟢🔴' },
      { tricks: 5, dots: '🟢🟢🟢🔴🔴' },
      { tricks: 5, dots: '🟢🟢🟢🟢🔴' },
    ],
  },
  {
    emoji: '🥉',
    label: 'Bronze',
    color: '#A0694A',
    description: 'You checked at least one trick.',
    rows: [
      { tricks: 3, dots: '🟢🔴🔴' },
      { tricks: 4, dots: '🟢🔴🔴🔴' },
      { tricks: 4, dots: '🟢🟢🔴🔴' },
      { tricks: 5, dots: '🟢🔴🔴🔴🔴' },
      { tricks: 5, dots: '🟢🟢🔴🔴🔴' },
    ],
  },
  {
    emoji: '—',
    label: 'No medal',
    color: '#f0f0ee',
    description: "You didn't check anything.",
    rows: [],
  },
]

export default function HowScoringWorksPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#111111',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#f0f0ee',
      padding: '0 0 60px',
    }}>
      <div style={{ padding: '32px 24px 0', maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-alumni), sans-serif', fontSize: 28, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.1, margin: '0 0 8px', color: 'var(--text)' }}>
          How Scoring Works
        </h1>
        <p style={{ fontSize: 14, color: '#777', margin: '0 0 32px', lineHeight: 1.6 }}>
          Each day has a set of tricks. Land them to earn a medal. The medal you earn depends on how many you land out of the total.
        </p>

        {/* Scoring legend */}
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: '20px', marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 40, justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #71A88A', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71A88A', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="4,12 9,18 20,6"/></svg>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#71A88A' }}>Tried <strong style={{ textDecoration: 'underline' }}>OR</strong> succeeded</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #CB8D82', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CB8D82', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" width="16" height="16"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#CB8D82' }}>Tried and failed</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#C9A84C', textAlign: 'center' }}>If you did not participate, don&apos;t click anything.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {medals.map(({ emoji, label, color, description, rows }) => (
            <div key={label} style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: 16,
              padding: '20px 20px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 36, lineHeight: 1 }}>{emoji}</span>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color }}>{label}</div>
                  <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{description}</div>
                </div>
              </div>
              {rows.length > 0 && (
                <div style={{ borderTop: '1px solid #2a2a2a', marginTop: 14, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {rows.map(({ tricks, dots }: { tricks: number, dots: string }) => (
                    <div key={`${tricks}-${dots}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span style={{ color: '#888' }}>{tricks}-trick session</span>
                      <span style={{ fontSize: 16, letterSpacing: 2 }}>{dots}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Streak */}
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: '20px', marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 36, lineHeight: 1 }}>🔥</span>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#f0f0ee' }}>Streak</div>
          </div>
          <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>
            Your streak counts how many days in a row you've participated. It increases any time you check at least one trick. Missing a day resets it to zero.
          </div>
        </div>
      </div>
    </div>
  )
}
