import { useSettingsStore } from '@/store/settingsStore'

export const useVibration = () => {
  const enabled = useSettingsStore(s => s.vibrationEnabled)

  const vibrate = (pattern: number | number[] = 200) => {
    if (enabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  return { vibrate }
}
