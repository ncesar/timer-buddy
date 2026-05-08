export type WorkoutId = string
export type RoundId = string

export type Workout = {
  id: WorkoutId
  name: string
  rounds: Round[]
  createdAt: number
  updatedAt: number
}

export type RoundBase = {
  id: RoundId
  name: string
  duration: number
  restAfter?: number
}

export type SimpleRound = RoundBase & { type: 'simple' }

export type IntervalBlock = {
  id: string
  name: string
  duration: number
  color: string
  voiceCommand?: string
}

export type IntervalRound = RoundBase & {
  type: 'interval'
  blocks: IntervalBlock[]
}

export type VoiceInstruction = {
  id: string
  atSecond: number
  text: string
  repeat?: boolean
  repeatInterval?: number
}

export type InstructionRound = RoundBase & {
  type: 'instruction'
  instructions: VoiceInstruction[]
}

export type Round = SimpleRound | IntervalRound | InstructionRound

export type WorkoutHistory = {
  id: string
  workoutId: WorkoutId
  workoutName: string
  completedAt: number
  durationSeconds: number
}

export const isSimpleRound = (r: Round): r is SimpleRound => r.type === 'simple'
export const isIntervalRound = (r: Round): r is IntervalRound => r.type === 'interval'
export const isInstructionRound = (r: Round): r is InstructionRound => r.type === 'instruction'
