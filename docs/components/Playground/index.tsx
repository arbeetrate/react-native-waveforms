'use client';
// Lazy-load each playground client-only. The library imports
// react-native-reanimated / react-native-svg whose web shims touch
// `window` at module load - running them on the SSR pass throws.
// `next/dynamic({ ssr: false })` requires a Client Component parent,
// hence the 'use client' directive on this barrel file.
import dynamic from 'next/dynamic';

const fallback = (
  <div
    style={{
      minHeight: 140,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.5,
      fontFamily: 'ui-monospace, monospace',
      fontSize: 13,
    }}
  >
    Loading playground…
  </div>
);

export const WaveformPlayground = dynamic(
  () =>
    import('./WaveformPlayground').then((m) => ({
      default: m.WaveformPlayground,
    })),
  { ssr: false, loading: () => fallback }
);

export const PlayerPlayground = dynamic(
  () =>
    import('./PlayerPlayground').then((m) => ({
      default: m.PlayerPlayground,
    })),
  { ssr: false, loading: () => fallback }
);

export const RecorderPlayground = dynamic(
  () =>
    import('./RecorderPlayground').then((m) => ({
      default: m.RecorderPlayground,
    })),
  { ssr: false, loading: () => fallback }
);
