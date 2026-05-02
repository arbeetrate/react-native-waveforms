# react-native-waveforms

> **Status:** `0.1.0` - first public release. Future fixes ship as `0.1.x` patches.

Cross-platform audio waveform visualizer for **React Native**, **Expo** and **Web**. Static, live recording and live playback modes - rendered with [`react-native-svg`](https://github.com/software-mansion/react-native-svg) and animated on the UI thread with [`react-native-reanimated`](https://github.com/software-mansion/react-native-reanimated).

The package is **rendering-only** - you bring the audio data (an amplitude array, a sample callback, or a playback position) and the component draws it. No `expo-av` / `expo-audio` dependency is pulled in, so you can pair it with whatever audio engine you already use.

## Features

- Three components: `<Waveform>` (static), `<PlayerWaveform>` (playback progress), `<RecorderWaveform>` (live samples).
- Three built-in renderers: `bars`, `line`, `area` - or pass your own.
- UI-thread animations via Reanimated worklets; no per-frame React renders for playback or recording.
- Hover (web) / tap & drag (native) interaction with a customisable active bar and `onActiveSampleChange` callback.
- Recorder modes: `scroll` (bars slide horizontally) and `morph` (bars stay in place, heights animate).
- Recorder edge effects: `fadeIn` / `fadeOut` (alpha fade) and `growIn` / `growOut` (height envelope).
- Linear gradient fills via the `WaveformColor` API on `<Waveform>`, `<PlayerWaveform>` and `<RecorderWaveform>`.
- Web support via `react-native-web` / Expo Web - same API, native DOM events.

## Platforms

- iOS
- Android
- Web (`react-native-web` / Expo Web)

## Installation

```sh
# expo
npx expo install react-native-waveforms react-native-svg react-native-reanimated react-native-worklets

# bare RN
npm install react-native-waveforms react-native-svg react-native-reanimated react-native-worklets
# or
yarn add react-native-waveforms react-native-svg react-native-reanimated react-native-worklets
```

Follow the setup guide for each peer dependency:

- [`react-native-reanimated` install](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started) (also configures `react-native-worklets`)
- [`react-native-svg` install](https://github.com/software-mansion/react-native-svg#installation)

## Peer dependencies

| Package                   | Version    |
| ------------------------- | ---------- |
| `react`                   | `>=18`     |
| `react-native`            | `>=0.81`   |
| `react-native-reanimated` | `>=4.0.0`  |
| `react-native-svg`        | `>=15`     |
| `react-native-worklets`   | `>=0.3.0`  |

## Usage

### Static - `<Waveform>`

Render a fixed amplitude array. Amplitudes are expected in `[0, 1]` by default; use `inputRange` to remap from another scale (e.g. `[-160, 0]` dBFS).

```tsx
import { Waveform } from 'react-native-waveforms';

<Waveform
  samples={amplitudes}      // readonly number[] in [0, 1]
  width={320}
  height={80}
  color="#2563eb"
  gap={2}
  rounded
/>
```

Switch renderer:

```tsx
<Waveform samples={amplitudes} width={320} height={80} renderer="line" strokeWidth={1.5} />
<Waveform samples={amplitudes} width={320} height={80} renderer="area" fillOpacity={0.85} />
```

Gradient fills - any `color`-style prop (`color`, `progressColor`, `activeColor`)
accepts a `WaveformColor` union: a CSS string **or** a `LinearGradientSpec`.
`<Waveform>` and `<PlayerWaveform>` render gradients via SVG `<LinearGradient>`;
`<RecorderWaveform>` samples the gradient once per bar slot along the x-axis
(see [API › `WaveformColor`](#waveformcolor) and [Known issues](#known-issues)).

```tsx
// Two-stop shorthand (left → right by default)
<Waveform
  samples={amplitudes}
  width={320}
  height={80}
  color={{ type: 'linear', from: '#3b82f6', to: '#a855f7' }}
/>

// Multi-stop, vertical
<Waveform
  samples={amplitudes}
  width={320}
  height={80}
  renderer="area"
  color={{
    type: 'linear',
    direction: 'vertical',
    stops: [
      { offset: 0, color: '#0ea5e9' },
      { offset: 1, color: '#1e3a8a' },
    ],
  }}
/>
```

Hover / tap interaction (turns on once `activeColor` is set):

```tsx
<Waveform
  samples={amplitudes}
  width={320}
  height={80}
  color="#2563eb"
  activeColor="#f97316"
  activeScale={1.8}        // bars: grow active bar 80%
  activeTransitionMs={180} // web only
  onActiveSampleChange={(index, value) => {
    // index === null on leave / release
  }}
/>
```

### Playback - `<PlayerWaveform>`

Wraps `<Waveform>` with a UI-thread animated progress fill. Drive it with a `progress` value (`0`–`1`) **or** a `positionMs` + `durationMs` pair.

```tsx
import { PlayerWaveform } from 'react-native-waveforms';

<PlayerWaveform
  samples={amplitudes}
  width={320}
  height={80}
  color="#cbd5e1"
  progressColor="#2563eb"
  isPlaying
  positionMs={currentMs}
  durationMs={totalMs}
/>
```

When `isPlaying` is `true` the progress animates smoothly toward the next position on the UI thread, so dropped JS frames don't stutter the bar.

### Live recording - `<RecorderWaveform>`

Imperative API: keep a ref, call `push(amplitude)` whenever your meter ticks (mic level, peak meter, etc.).

```tsx
import { useRef } from 'react';
import {
  RecorderWaveform,
  type RecorderWaveformHandle,
} from 'react-native-waveforms';

const ref = useRef<RecorderWaveformHandle>(null);

// somewhere in your meter callback:
ref.current?.push(0.42); // any number in [0, 1]
ref.current?.push([0.1, 0.2, 0.3]); // batch push also accepted
ref.current?.reset(); // clear buffer

<RecorderWaveform
  ref={ref}
  width={320}
  height={80}
  color="#dc2626"
  baseline="bottom"
  transition="scroll"   // or "morph"
  transitionDuration={200}
  barWidth={3}
  gap={2}
  rounded
/>
```

## API

### `<Waveform>`

| Prop                   | Type                                    | Default   | Notes                                                                  |
| ---------------------- | --------------------------------------- | --------- | ---------------------------------------------------------------------- |
| `samples`              | `readonly number[]`                     | required  | Amplitudes; default range `[0, 1]`.                                    |
| `width`                | `number`                                | required  | SVG width.                                                             |
| `height`               | `number`                                | required  | SVG height.                                                            |
| `color`                | `WaveformColor`                         | `'#000'`  | CSS colour string or [`LinearGradientSpec`](#waveformcolor).           |
| `renderer`             | `'bars' \| 'line' \| 'area' \| fn`      | `'bars'`  | Custom: `(props: RendererProps) => ReactNode`.                         |
| `inputRange`           | `[number, number]`                      | `[0, 1]`  | Re-maps `samples` into `[0, 1]`.                                       |
| `barWidth`             | `number`                                | auto      | Bars only.                                                             |
| `gap`                  | `number`                                | `1`       | Bars only.                                                             |
| `rounded`              | `boolean \| number`                     | `false`   | Bars only - `true` = pill, number = explicit radius.                   |
| `baseline`             | `'center' \| 'bottom'`                  | `'center'`| Bars only.                                                             |
| `strokeWidth`          | `number`                                | `1`       | Line / area.                                                           |
| `fillOpacity`          | `number`                                | `1`       | Area only.                                                             |
| `activeColor`          | `WaveformColor`                         | -         | Enables hover / tap highlight; gradients accepted.                     |
| `activeScale`          | `number`                                | `1`       | Bars only - width multiplier for the active bar.                       |
| `activePushRange`      | `number`                                | auto      | Bars only - neighbours pushed away from the active bar (linear decay). |
| `activeTransitionMs`   | `number`                                | `150`     | Web only - CSS transition duration; native snaps.                      |
| `onActiveSampleChange` | `(index, sample) => void`               | -         | `index === null` on leave / release.                                   |

### `<PlayerWaveform>`

Inherits all `<Waveform>` props, plus:

| Prop                | Type      | Default   | Notes                                                              |
| ------------------- | --------- | --------- | ------------------------------------------------------------------ |
| `progressColor`     | `WaveformColor` | `#2563eb` | Played-portion colour; gradients accepted.                   |
| `progress`          | `number`  | -         | `0`–`1`. Takes precedence over `positionMs` / `durationMs`.        |
| `positionMs`        | `number`  | -         | Current playback position in ms.                                   |
| `durationMs`        | `number`  | -         | Total duration in ms.                                              |
| `isPlaying`         | `boolean` | `false`   | When `true`, progress animates on the UI thread to next frame.     |
| `animationDuration` | `number`  | `200`     | Transition duration between progress values, in ms.                |

### `<RecorderWaveform>`

Inherits `<Waveform>` props **except** `samples` (you push imperatively), plus:

| Prop                  | Type                                    | Default     | Notes                                                                         |
| --------------------- | --------------------------------------- | ----------- | ----------------------------------------------------------------------------- |
| `capacity`            | `number`                                | auto        | Bar slots in the buffer; computed from `width`, `barWidth`, `gap` if omitted. |
| `initialSamples`      | `readonly number[]`                     | -           | Optional warm-start data.                                                     |
| `transition`          | `'scroll' \| 'morph'`                   | `'scroll'`  | Slide bars vs. animate heights in place.                                      |
| `direction`           | `'right' \| 'left'`                     | `'right'`   | Edge new samples enter from.                                                  |
| `prefill`             | `boolean`                               | `true`      | Pre-fill buffer with zeros so animation starts on first push.                 |
| `transitionDuration`  | `number`                                | `200`       | Per-sample animation duration in ms.                                          |
| `transitionEasing`    | `EasingFunction \| EasingFactory`       | `linear`    | From `react-native-reanimated`.                                               |
| `fadeIn`              | `number`                                | `0`         | Bars at the entry edge that fade in (alpha 0→1). Pure opacity. Try `2`–`5`.   |
| `fadeOut`             | `number`                                | `0`         | Bars at the exit edge that fade out (alpha 1→0). Pure opacity.                |
| `growIn`              | `number`                                | `0`         | Bars at the entry edge that grow in height from 0 → full as they shift in.    |
| `growOut`             | `number`                                | `0`         | Bars at the exit edge that shrink in height from full → 0.                    |
| `smoothScroll`        | `boolean`                               | `true`      | `scroll` mode only.                                                           |
| `scrollDuration`      | `number`                                | -           | **Deprecated** - use `transitionDuration`.                                    |

Imperative ref handle:

```ts
type RecorderWaveformHandle = {
  push: (amplitude: number | readonly number[]) => void;
  reset: () => void;
};
```

### `WaveformColor`

```ts
type GradientStop = { offset: number; color: string; opacity?: number };

type LinearGradientSpec = {
  type: 'linear';
  /** `'horizontal'` (default) = left → right; `'vertical'` = top → bottom. */
  direction?: 'horizontal' | 'vertical';
  /** Two-stop shorthand. Ignored when `stops` is provided. */
  from?: string;
  to?: string;
  /** Explicit stops; takes precedence over `from` / `to`. */
  stops?: readonly GradientStop[];
};

type WaveformColor = string | LinearGradientSpec;
```

`<Waveform>` and `<PlayerWaveform>` paint gradients via SVG `<LinearGradient>`,
so any direction and any number of stops is honoured. `<RecorderWaveform>`
uses `View.backgroundColor` per bar - it samples the gradient once per slot
along the **x-axis** and treats `vertical` as horizontal sampling. Recorder
gradients work best with hex (`#rgb`, `#rrggbb`, `#rrggbbaa`) or `rgb(...)` /
`rgba(...)` colour strings; named CSS colours fall back to the nearest stop
without interpolation.

### Custom renderers

Any function matching `(props: RendererProps) => ReactNode` can be passed as `renderer`. The built-in `BarsRenderer`, `LineRenderer` and `AreaRenderer` are also exported if you want to compose them.

```tsx
import { BarsRenderer, type WaveformRenderer } from 'react-native-waveforms';

const MyRenderer: WaveformRenderer = (props) => (
  <BarsRenderer {...props} barWidth={4} rounded />
);
```

## Known issues

- **Web - `<RecorderWaveform>` `growIn` / `growOut` + `transition="scroll"`.**
  On web the height envelope is computed per slot and re-interpolated via a
  `requestAnimationFrame` loop while the wrapper translates. Some browsers
  still show subtle stepping in the entry / exit zones during fast pushes.
  Until this is smoother, the example app gates the scroll + grow demos to
  native only. Workarounds: use `transition="morph"` (smooth on web), use
  `fadeIn` / `fadeOut` instead (CSS mask on web - always smooth), or stick
  to scroll-only / morph-only without grow on web.

## Pairing with an audio engine

`react-native-waveforms` doesn't record or decode audio - it visualises numbers. Common pairings:

- **`expo-audio`** - listen to `metering` updates and `push()` them into the recorder.
- **`react-native-audio-recorder-player`** - feed `metering` from `addRecordBackListener`.
- **Web** - `MediaStream` → `AudioContext.createAnalyser()` → push the average amplitude.

The example app in this repo includes a working web microphone demo (`example/src/useMicMeter.web.ts`).

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT - see [LICENSE](LICENSE).

---

Scaffolded with [create-react-native-library](https://github.com/callstack/react-native-builder-bob).
