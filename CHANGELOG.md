# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-05-05

### Added

- `<PlayerWaveform>` is now interactive — pass an `onSeek(progress)`
  callback to enable tap + drag scrubbing. The played fill follows the
  finger live on the UI thread, and `onSeek` fires once on release with
  the new progress in `[0, 1]`. While `isPlaying` is `true`, playback
  resumes from the new position automatically (no consumer-side
  re-toggle).
- `<PlayerWaveform>` now forwards `activeColor` / `activeScale` /
  `activePushRange` / `activeTransitionMs` to its renderer, mirroring
  `<Waveform>`'s hover / touch overlay. Opt in alongside `onSeek` to
  highlight the bar under the finger during a scrub.
- New scrubbing demos in the example app and the
  [`<PlayerWaveform>` playground](https://waveforms.arbeetrate.com/components/player-waveform/).

### Changed

- Internal: extracted `useActiveIndexFromX` shared hook so `<Waveform>`
  and `<PlayerWaveform>` use the same x → sample-index logic. No
  behaviour change for `<Waveform>`.

## [0.1.2] - 2026-05-04

### Added

- Public documentation site with live, interactive playgrounds at
  [waveforms.arbeetrate.com](https://waveforms.arbeetrate.com).
  Each component (`<Waveform>`, `<PlayerWaveform>`, `<RecorderWaveform>`)
  has its own page with prop tables, code samples and a fully wired
  playground that imports the library and lets you tweak every prop.
- README links the docs site at the top and from each component's
  usage section.
- `package.json#homepage` now points to the docs site.

## [0.1.1] - 2026-05-04

### Fixed

- Pass explicit dependency arrays to `useAnimatedStyle` /
  `useAnimatedProps` calls in `<PlayerWaveform>` and the native
  `<RecorderWaveform>`. Without them, web bundlers that don't run the
  `react-native-reanimated` Babel plugin (Next.js, Vite, plain webpack)
  emitted a runtime warning and could mis-track state on
  re-renders. Native (Metro / Expo) is unaffected — the plugin already
  injects equivalent deps.

## [0.1.0] - 2026-05-03

First public release.

### Added

- Linear gradient fills for `color`, `progressColor` and `activeColor` on
  `<Waveform>`, `<PlayerWaveform>` and `<RecorderWaveform>`. New
  `WaveformColor` / `LinearGradientSpec` / `GradientStop` exports support
  `from` / `to` shorthand or explicit `stops`, plus `direction` of
  `'horizontal'` (default) or `'vertical'`.
- `<RecorderWaveform>` `growIn` / `growOut` props - height envelope at the
  entry / exit edges (the previous "fade-shrinks-bar-height" behaviour,
  now its own knob).

### Changed

- **Breaking:** `<RecorderWaveform>` `fadeIn` / `fadeOut` are now a true
  alpha fade (opacity) on every platform. Previously native treated them
  as a height envelope while web used a CSS alpha mask. Use the new
  `growIn` / `growOut` for the height-envelope effect.

### Known issues

- Web `<RecorderWaveform>` `growIn` / `growOut` combined with
  `transition="scroll"` can still show subtle stepping during fast pushes.
  See [README › Known issues](README.md#known-issues).

## [0.1.0-rc.2] - 2026-04-29

First public release candidate. Public API may still shift before `0.1.0`.

### Added

- `<Waveform>` static renderer with three built-in styles: `bars`, `line`, `area`.
  - Per-bar customisation: `barWidth`, `gap`, `rounded`, `baseline` (`center` | `bottom`).
  - Line / area customisation: `strokeWidth`, `fillOpacity`.
  - Optional input-range mapping (`inputRange`) for non-`[0, 1]` amplitude data.
  - Custom renderer support via the `WaveformRenderer` function prop.
- `<Waveform>` hover (web) / tap & drag (native) interactivity:
  - `activeColor`, `activeScale`, `activePushRange`, `activeTransitionMs`.
  - `onActiveSampleChange` callback fires on hover / drag and on leave.
- `<PlayerWaveform>` with UI-thread playback progress:
  - `progress` (0–1) or `positionMs` + `durationMs` driven.
  - `progressColor`, `animationDuration`, `isPlaying`.
- `<RecorderWaveform>` for live amplitude streams, with imperative `push(amplitude)` /
  `reset()` ref handle:
  - `transition`: `scroll` (slide bars horizontally) or `morph` (animate per-bar height).
  - `direction`: `right` (default) or `left`.
  - `prefill` to start with a zero-padded buffer.
  - `transitionDuration`, `transitionEasing` for animation tuning.
  - `fadeIn`, `fadeOut` for soft entry / exit edges.
- TypeScript types exported for all public components, props and renderers.
- Web-native renderer (`AnimatedRecorder.web.tsx`) for `react-native-web` / Expo Web.
- Example app showcasing every renderer, mode, and a live-microphone (web) demo.

### Notes

- Rendering-only - bring your own audio source. The package does not depend on
  `expo-av` / `expo-audio` or any native audio engine.
- Peer dependencies: `react >=18`, `react-native >=0.81`,
  `react-native-reanimated >=4.0.0`, `react-native-svg >=15`,
  `react-native-worklets >=0.3.0`.

[0.1.3]: https://github.com/arbeetrate/react-native-waveforms/releases/tag/v0.1.3
[0.1.2]: https://github.com/arbeetrate/react-native-waveforms/releases/tag/v0.1.2
[0.1.1]: https://github.com/arbeetrate/react-native-waveforms/releases/tag/v0.1.1
[0.1.0]: https://github.com/arbeetrate/react-native-waveforms/releases/tag/v0.1.0
[0.1.0-rc.2]: https://github.com/arbeetrate/react-native-waveforms/releases/tag/v0.1.0-rc.2
[0.1.0-rc.1]: https://github.com/arbeetrate/react-native-waveforms/releases/tag/v0.1.0-rc.1
