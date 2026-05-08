import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '@/store/settingsStore'
import { tts } from '@/services/tts'
import { Button } from '@/components/ui/Button'

export const SettingsPage = () => {
  const navigate = useNavigate()
  const settings = useSettingsStore()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis?.getVoices() ?? [])
    load()
    window.speechSynthesis?.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load)
  }, [])

  const testVoice = () => {
    tts.enabled = true
    tts.rate = settings.ttsRate
    tts.voiceURI = settings.ttsVoiceURI
    tts.speak('Round 1. Ready. Jabs!')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white text-xl">←</button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="flex flex-col gap-6">
        <section className="bg-zinc-800 rounded-2xl p-4 flex flex-col gap-4">
          <h2 className="font-semibold text-zinc-300 text-sm uppercase tracking-wider">Voice</h2>

          <label className="flex justify-between items-center">
            <span>Text-to-speech</span>
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={settings.ttsEnabled}
              onChange={e => settings.setTTSEnabled(e.target.checked)}
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-zinc-400 text-sm">Voice</span>
            <select
              className="bg-zinc-700 rounded-xl px-3 py-2 text-white outline-none"
              value={settings.ttsVoiceURI ?? ''}
              onChange={e => settings.setTTSVoiceURI(e.target.value || null)}
            >
              <option value="">Default</option>
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm">Speed</span>
              <span className="text-zinc-400 text-sm">{settings.ttsRate.toFixed(1)}×</span>
            </div>
            <input
              type="range" min={0.5} max={2} step={0.1}
              className="w-full accent-red-500"
              value={settings.ttsRate}
              onChange={e => settings.setTTSRate(Number(e.target.value))}
            />
          </div>

          <Button variant="secondary" size="sm" onClick={testVoice}>
            Test voice
          </Button>
        </section>

        <section className="bg-zinc-800 rounded-2xl p-4 flex flex-col gap-4">
          <h2 className="font-semibold text-zinc-300 text-sm uppercase tracking-wider">Sound & Haptics</h2>

          <label className="flex justify-between items-center">
            <span>Sound effects</span>
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={settings.soundEnabled}
              onChange={e => settings.setSoundEnabled(e.target.checked)}
            />
          </label>

          <label className="flex justify-between items-center">
            <span>Countdown beeps</span>
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={settings.countdownBeepsEnabled}
              onChange={e => settings.setCountdownBeepsEnabled(e.target.checked)}
            />
          </label>

          <label className="flex justify-between items-center">
            <span>Vibration</span>
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={settings.vibrationEnabled}
              onChange={e => settings.setVibrationEnabled(e.target.checked)}
            />
          </label>
        </section>
      </div>
    </div>
  )
}
