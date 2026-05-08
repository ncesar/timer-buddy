let sentinel: WakeLockSentinel | null = null
let reacquireListener: (() => void) | null = null

export const requestWakeLock = async (): Promise<void> => {
  if (!('wakeLock' in navigator)) return
  try {
    sentinel = await navigator.wakeLock.request('screen')

    reacquireListener = async () => {
      if (document.visibilityState === 'visible' && sentinel?.released) {
        try { sentinel = await navigator.wakeLock.request('screen') } catch { /* ignore */ }
      }
    }
    document.addEventListener('visibilitychange', reacquireListener)
  } catch { /* not critical */ }
}

export const releaseWakeLock = async (): Promise<void> => {
  if (reacquireListener) {
    document.removeEventListener('visibilitychange', reacquireListener)
    reacquireListener = null
  }
  try { await sentinel?.release() } catch { /* ignore */ }
  sentinel = null
}
