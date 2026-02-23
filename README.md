# PunchiTouch

A web-based beatmaker with ultra-low latency audio, built on the Web Audio API.

<p align="center">
  <a href="https://punchitouch.bomblikeapps.com"><strong>Try it live</strong></a>
</p>

## Features

- **Native Audio Engine** -- Custom audio worklet for near-zero latency playback
- **Two Sample Banks** -- Sampler mode (kick, snare, hi-hat, crash, clap, scratch) and Beatbox mode (load your own samples or record voice)
- **Step Sequencer** -- Built-in looper with 4, 8, or 16 beats
- **BPM Control** -- 60-180 BPM via virtual analog knob
- **PWA** -- Installable with offline support
- **Haptic Feedback** -- Physical feedback on supported mobile devices
- **Responsive** -- DJ-themed interface for desktop and mobile

## Quick Start

```bash
git clone https://github.com/mcasado80/punchit.git
cd punchit
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build

```bash
npm run build    # outputs to dist/
npm test         # run tests
```

## Project Structure

```
index.html              Main layout
script.js               Entry point
src/
  core/                 App class & event manager
  audio/                Audio engine, sample player, worklet processor
  ui/                   UI controller, pad controller, visual controller
  config/               Audio & UI settings
  assets/samples/       Audio samples
styles/                 CSS
```

## License

MIT
