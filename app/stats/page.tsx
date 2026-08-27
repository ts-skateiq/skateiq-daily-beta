'use client'

import { useState, useEffect } from 'react'
import GameToolbar from '@/components/GameToolbar'
import { useAuth } from '@/lib/auth-context'

const REST_DAYS = new Set([3, 0]) // Wed=3, Sun=0 (JS getDay)
const ACTIVE_DAYS = new Set([1, 2, 4, 5, 6]) // Mon Tue Thu Fri Sat

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: { day: number | null; dow: number }[] = []
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, dow: i })
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay()
    cells.push({ day: d, dow })
  }
  return cells
}

export default function StatsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const { user } = useAuth()
  const [streaks, setStreaks] = useState<{ daily: number; weekly: number } | null>(null)

  useEffect(() => {
    fetch('/api/daily-score')
      .then(r => r.json())
      .then(d => setStreaks({ daily: d.streak ?? 0, weekly: d.weeklyStreak ?? 0 }))
      .catch(() => setStreaks({ daily: 0, weekly: 0 }))
  }, [user])

  const todayY = now.getFullYear()
  const todayM = now.getMonth()
  const todayD = now.getDate()

  const cells = buildCalendar(year, month)
  const isCurrentMonth = year === todayY && month === todayM

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <>
      <GameToolbar gameName="Stats" />
      <style>{`
        .stats-body {
          background: var(--bg);
          min-height: calc(100vh - 52px);
          font-family: Inter, system-ui, sans-serif;
          overflow-y: auto;
          overflow-x: hidden;
          padding-bottom: 48px;
          color: var(--text);
          max-width: 480px;
          margin: 0 auto;
          width: 100%;
        }
        .stats-screen-heading {
          font-family: var(--font-alumni), sans-serif;
          font-size: 28px; font-weight: 700; line-height: 1.1;
          color: var(--text);
          letter-spacing: 0.03em;
          text-transform: uppercase;
          padding: 20px 20px 4px;
        }
        .stats-streak-row {
          display: flex; gap: 10px; padding: 12px 20px 4px;
        }
        .stats-streak-card {
          flex: 1; background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; padding: 14px 16px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .stats-streak-num {
          font-family: var(--font-alumni), sans-serif;
          font-size: 40px; font-weight: 900; line-height: 1;
          color: var(--text);
        }
        .stats-streak-label {
          font-size: 10px; font-weight: 600; letter-spacing: 1.5px;
          text-transform: uppercase; color: var(--text-muted);
        }
        .stats-section-label {
          font-size: 10px; letter-spacing: 2.5px;
          color: var(--text-muted); text-transform: uppercase;
          font-weight: 600;
          padding: 0 20px;
          margin-top: 20px; margin-bottom: 10px;
        }
        .stats-schedule-strip { display: flex; gap: 5px; padding: 0 20px; }
        .stats-sched-day { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .stats-sched-day-label { font-size: 9px; color: var(--text-muted); font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
        .stats-sched-pill {
          width: 100%; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          background: rgba(113,168,138,0.12);
          border: 2px solid #71A88A;
          color: #71A88A;
        }
        .stats-sched-pill.bail {
          background: rgba(203,141,130,0.12);
          border-color: #CB8D82;
          color: #CB8D82;
        }
        .stats-sched-pill.neutral {
          background: var(--surface);
          border-color: var(--border);
          color: var(--text-muted);
        }
        .stats-cal-wrap { padding: 0 20px; }
        .stats-cal-nav {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .stats-cal-month { font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: 0.04em; }
        .stats-cal-nav-btn {
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); font-size: 16px; cursor: pointer;
          border-radius: 6px; border: 1px solid var(--border);
          background: none;
        }
        .stats-cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 3px; width: 75%; margin: 0 auto; }
        .stats-cal-header-cell {
          text-align: center; font-size: 10px;
          color: var(--text-muted); font-weight: 500;
          padding: 4px 0 6px; letter-spacing: 0.5px;
        }
        .stats-cal-cell {
          aspect-ratio: 1;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600;
          border-radius: 6px;
          font-variant-numeric: tabular-nums;
          border: 2px solid transparent;
        }
        .stats-cal-cell.make {
          background: rgba(113,168,138,0.12);
          border-color: #71A88A;
          color: var(--text);
        }
        .stats-cal-cell.bail {
          background: rgba(203,141,130,0.12);
          border-color: #CB8D82;
          color: var(--text);
        }
        .stats-cal-cell.neutral {
          background: var(--surface);
          border-color: var(--border);
          color: var(--text);
        }
        .stats-cal-cell.today { background: transparent; border-color: #4A8FD9; }
      `}</style>

      <div className="stats-body">
        <div className="stats-screen-heading">Stats</div>

        <div className="stats-streak-row">
          <div className="stats-streak-card">
            <div className="stats-streak-num">{streaks?.daily ?? '—'}</div>
            <div className="stats-streak-label">Daily Streak</div>
          </div>
          <div className="stats-streak-card">
            <div className="stats-streak-num">{streaks?.weekly ?? '—'}</div>
            <div className="stats-streak-label">Weekly Streak</div>
          </div>
        </div>

        <div className="stats-section-label">SCHEDULE</div>
        <div className="stats-schedule-strip">
          {[
            { label: 'MON', dow: 1, scheduled: 'make' },
            { label: 'TUE', dow: 2, scheduled: 'make' },
            { label: 'WED', dow: 3, scheduled: 'bail' },
            { label: 'THU', dow: 4, scheduled: 'make' },
            { label: 'FRI', dow: 5, scheduled: 'make' },
            { label: 'SAT', dow: 6, scheduled: 'make' },
            { label: 'SUN', dow: 0, scheduled: 'neutral' },
          ].map(({ label, dow, scheduled }) => {
            const todayDow = now.getDay()
            const weekPos = (dow + 6) % 7
            const todayWeekPos = (todayDow + 6) % 7
            const isFuture = weekPos > todayWeekPos
            const isToday = weekPos === todayWeekPos
            const type = isFuture ? 'neutral' : scheduled
            return (
              <div key={label} className="stats-sched-day">
                <div className="stats-sched-day-label">{label}</div>
                <div className={`stats-sched-pill ${type}`} style={isToday ? { background: 'transparent', borderColor: '#4A8FD9', color: '#4A8FD9' } : undefined}>
                  {type === 'make' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" width="40%" height="40%">
                      <polyline points="4,12 9,18 20,6" />
                    </svg>
                  )}
                  {type === 'bail' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" width="40%" height="40%">
                      <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
                    </svg>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="stats-cal-wrap" style={{ marginTop: 40 }}>
          <div className="stats-cal-nav">
            <button className="stats-cal-nav-btn" onClick={prevMonth}>‹</button>
            <div className="stats-cal-month">{MONTH_NAMES[month].toUpperCase()} {year}</div>
            <button className="stats-cal-nav-btn" onClick={nextMonth}>›</button>
          </div>
          <div className="stats-cal-grid">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="stats-cal-header-cell">{d}</div>
            ))}
            {cells.map((cell, i) => {
              if (!cell.day) return <div key={i} />
              const isToday = isCurrentMonth && cell.day === todayD
              const isFuture = year > todayY || (year === todayY && month > todayM) || (isCurrentMonth && cell.day > todayD)
              const type = isFuture ? 'neutral' : ACTIVE_DAYS.has(cell.dow) ? 'make' : REST_DAYS.has(cell.dow) ? 'bail' : 'neutral'
              const classes = ['stats-cal-cell', type]
              if (isToday) classes.push('today')
              return (
                <div key={i} className={classes.join(' ')}>{cell.day}</div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
