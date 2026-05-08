type AudioContextConstructor = typeof AudioContext

let ctx: AudioContext | null = null

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null
  try {
    const Ctor: AudioContextConstructor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: AudioContextConstructor }).webkitAudioContext
    if (!Ctor) return null
    if (!ctx) ctx = new Ctor()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch {
    return null
  }
}

// Must be called from a user gesture to unlock audio on iOS
export const unlockAudio = (): void => { getCtx() }

const playTone = (freq: number, duration: number, gain = 0.5): void => {
  const ac = getCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.connect(g)
  g.connect(ac.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, ac.currentTime)
  g.gain.setValueAtTime(gain, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration)
  osc.start(ac.currentTime)
  osc.stop(ac.currentTime + duration)
}

export const playBell = (): void => playTone(880, 0.8, 0.6)
export const playBeep = (): void => playTone(440, 0.15, 0.4)
export const playDoubleBeep = (): void => {
  playTone(660, 0.1, 0.4)
  setTimeout(() => playTone(880, 0.2, 0.5), 150)
}
