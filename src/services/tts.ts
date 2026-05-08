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
    if (!this.enabled || !window.speechSynthesis) {
      onDone?.()
      return
    }
    this.queue.push({ text, onDone })
    this.flush()
  }

  private flush(): void {
    if (this.speaking || this.queue.length === 0) return
    const job = this.queue.shift()!
    this.speaking = true

    const utterance = new SpeechSynthesisUtterance(job.text)
    utterance.rate = this.rate

    if (this.voiceURI) {
      const voices = window.speechSynthesis.getVoices()
      const voice = voices.find(v => v.voiceURI === this.voiceURI)
      if (voice) utterance.voice = voice
    }

    const done = () => {
      if (job.timeoutId) clearTimeout(job.timeoutId)
      this.speaking = false
      job.onDone?.()
      this.flush()
    }

    utterance.onend = done
    utterance.onerror = done

    // Firefox sometimes doesn't fire onend — fallback timeout
    job.timeoutId = setTimeout(done, job.text.length * 100 + 800)

    window.speechSynthesis.speak(utterance)
  }

  cancel(): void {
    this.queue = []
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    this.speaking = false
  }
}

export const tts = new TTSService()
