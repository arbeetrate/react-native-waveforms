# react-native-waveforms

> **Status:** in early development. Public API is not stable. The first 0.x release will land once the renderers are implemented.

Cross-platform audio waveform visualizer for React Native, Expo and Web. Static, live recording and live playback modes, rendered with [`react-native-svg`](https://github.com/software-mansion/react-native-svg) and animated with [`react-native-reanimated`](https://github.com/software-mansion/react-native-reanimated).

The package is **rendering-only** — you bring the audio data (an amplitude array, a sample callback, or a playback position) and the component draws it. No `expo-av` / `expo-audio` dependency is pulled in.

## Platforms

- iOS
- Android
- Web (via `react-native-web` / Expo Web)

## Installation

```sh
# expo
npx expo install react-native-waveforms react-native-svg react-native-reanimated

# bare RN
npm install react-native-waveforms react-native-svg react-native-reanimated
# or
yarn add react-native-waveforms react-native-svg react-native-reanimated
```

Follow the setup guides for each peer dependency:

- [`react-native-reanimated` install](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started)
- [`react-native-svg` install](https://github.com/software-mansion/react-native-svg#installation)

## Peer dependencies

| Package                   | Version  |
| ------------------------- | -------- |
| `react`                   | `>=18`   |
| `react-native`            | `>=0.74` |
| `react-native-svg`        | `>=15`   |
| `react-native-reanimated` | `>=3.10` |

## Usage

The component API is not yet exposed. It will be added in a follow-up release; track progress in the issue tracker.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT — see [LICENSE](LICENSE).

---

Scaffolded with [create-react-native-library](https://github.com/callstack/react-native-builder-bob).
