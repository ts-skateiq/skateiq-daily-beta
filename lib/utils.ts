import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function todayUTC(): string {
  return new Date().toISOString().split('T')[0]
}

export function fmtDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })
}

export function isPaidUser(status: string): boolean {
  return status === 'active' || status === 'trialing'
}
