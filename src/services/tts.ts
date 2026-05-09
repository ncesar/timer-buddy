type TTSJob = { text: string; onDone?: () => void; timeoutId?: ReturnType<typeof setTimeout> }

class TTSService {
  private queue: TTSJob[] = []
  private speaking = false
  enabled = true
  rate = 1.0
  voiceURI: string | null = null

  constructor() {
    // Chrome Android pauses synth on screen lock — resume on visibility
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && window.speechSynthesis) {
          window.speechSynthesis.resume()
        }
      })
    }
  }

  speak(text: string, onDone?: () => void): void {
    console.log('[TTS] speak() called:', { text, enabled: this.enabled, hasSynth: !!window.speechSynthesis, queueLength: this.queue.length, speaking: this.speaking })
    if (!this.enabled) {
      console.warn('[TTS] skipped — TTS is disabled')
      onDone?.()
      return
    }
    if (!window.speechSynthesis) {
      console.warn('[TTS] skipped — window.speechSynthesis not available')
      onDone?.()
      return
    }
    this.queue.push({ text, onDone })
    this.flush()
  }

  private flush(): void {
    if (this.speaking) {
      console.log('[TTS] flush() deferred — already speaking, queue:', this.queue.length)
      return
    }
    if (this.queue.length === 0) {
      console.log('[TTS] flush() — queue empty, nothing to do')
      return
    }
    const job = this.queue.shift()!
    this.speaking = true

    const utterance = new SpeechSynthesisUtterance(job.text)
    utterance.rate = this.rate

    const voices = window.speechSynthesis.getVoices()
    console.log('[TTS] flush() speaking:', { text: job.text, rate: this.rate, voiceURI: this.voiceURI, availableVoices: voices.length })

    if (this.voiceURI) {
      const voice = voices.find(v => v.voiceURI === this.voiceURI)
      if (voice) {
        utterance.voice = voice
        console.log('[TTS] voice selected:', voice.name)
      } else {
        console.warn('[TTS] voiceURI not found in available voices:', this.voiceURI)
      }
    }

    const done = () => {
      if (job.timeoutId) clearTimeout(job.timeoutId)
      this.speaking = false
      console.log('[TTS] utterance done:', job.text)
      job.onDone?.()
      this.flush()
    }

    utterance.onstart = () => console.log('[TTS] utterance started:', job.text)
    utterance.onend = done
    utterance.onerror = (e) => {
      console.error('[TTS] utterance error:', { text: job.text, error: e.error, message: e })
      done()
    }

    // Firefox sometimes doesn't fire onend — fallback timeout
    job.timeoutId = setTimeout(done, job.text.length * 100 + 800)

    console.log('[TTS] calling speechSynthesis.speak()')
    window.speechSynthesis.speak(utterance)
    console.log('[TTS] after speak() — synth pending:', window.speechSynthesis.pending, 'speaking:', window.speechSynthesis.speaking)
  }

  cancel(): void {
    console.log('[TTS] cancel() — clearing queue of', this.queue.length, 'items')
    this.queue = []
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    this.speaking = false
  }
}

export const tts = new TTSService()
