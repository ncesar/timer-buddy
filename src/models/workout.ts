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
  color: string
  voiceCommand?: string
  atSecond: number
  repeat?: boolean
  repeatInterval?: number
  duration?: number       // loop mode: seconds this block lasts before the next fires
}

export type IntervalRound = RoundBase & {
  type: 'interval'
  blocks: IntervalBlock[]
  loopBlocks?: boolean
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
