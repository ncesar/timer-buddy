# Timer Buddy

A mobile-first PWA workout timer with voice cues, sound effects, and vibration feedback.

## Features

**Three round types:**
- **Simple** — basic countdown timer
- **Interval** — color-coded blocks that activate at specific seconds, each with an optional voice command and repeat interval
- **Voice Cues** — fire spoken cues at precise seconds within a round (supports repeat)

**During training:**
- Countdown beeps in the last 10 seconds of a round and 5 seconds of rest
- Bell sound at round start, double beep at round end
- Vibration patterns on block changes and round transitions
- Screen wake lock so the display stays on
- Text-to-speech announces rounds and speaks block/cue text
- Play/pause, skip, and stop controls

**Workout editor:**
- Create and reorder multiple rounds per workout
- Configure rest periods between rounds
- Each round type has its own inline editor

**Settings:**
- Toggle sound effects and countdown beeps
- Toggle TTS, adjust rate, and select voice

## Stack

React 19 · TypeScript · Vite · Zustand · Tailwind CSS · Dexie (IndexedDB) · Workbox PWA

## Running locally

```bash
npm install
npm run dev
```
