export type GameKey = 'wordle' | 'connections' | 'daily'

export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled'

export interface User {
  id: string
  email: string
  subscription_status: SubscriptionStatus
  subscription_current_period_end?: string
  theme_preference: 'light' | 'dark'
  marketing_consent: boolean
}

export interface Puzzle {
  id: string
  game_key: GameKey
  publish_date: string
  payload: WordlePayload | ConnectionsPayload
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface WordlePayload {
  word: string
  hint: string
}

export interface ConnectionsGroup {
  category: string
  color: 'yellow' | 'green' | 'blue' | 'purple'
  items: string[]
}

export interface ConnectionsPayload {
  groups: ConnectionsGroup[]
}

export interface GameResult {
  puzzleId: string
  gameKey: GameKey
  publishDate: string
  solved: boolean
  guessesUsed?: number
  timeMs?: number
}

export interface OnCompletePayload {
  result: 'win' | 'loss'
  guessesUsed: number
  timeMs: number
  shareString: string
}

export interface DailyStreak {
  wordle: number
  connections: number
  daily: number
}

export interface HubStatus {
  wordle: 'pending' | 'won' | 'lost'
  connections: 'pending' | 'won' | 'lost'
  daily: 'pending' | 'won' | 'lost'
}
