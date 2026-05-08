import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SettingsStore = {
  ttsEnabled: boolean
  ttsVoiceURI: string | null
  ttsRate: number
  soundEnabled: boolean
  vibrationEnabled: boolean
  countdownBeepsEnabled: boolean
  setTTSEnabled: (v: boolean) => void
  setTTSVoiceURI: (v: string | null) => void
  setTTSRate: (v: number) => void
  setSoundEnabled: (v: boolean) => void
  setVibrationEnabled: (v: boolean) => void
  setCountdownBeepsEnabled: (v: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ttsEnabled: true,
      ttsVoiceURI: null,
      ttsRate: 1.0,
      soundEnabled: true,
      vibrationEnabled: true,
      countdownBeepsEnabled: true,
      setTTSEnabled: (v) => set({ ttsEnabled: v }),
      setTTSVoiceURI: (v) => set({ ttsVoiceURI: v }),
      setTTSRate: (v) => set({ ttsRate: v }),
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setVibrationEnabled: (v) => set({ vibrationEnabled: v }),
      setCountdownBeepsEnabled: (v) => set({ countdownBeepsEnabled: v }),
    }),
    { name: 'timer-buddy-settings' }
  )
)
