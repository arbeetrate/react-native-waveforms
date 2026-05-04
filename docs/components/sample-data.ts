// Mirror of example/src/sample-data.ts so docs don't depend on the
// example workspace at runtime. ~120-sample synthetic waveform with a
// gentle envelope and modulated jitter.
const LENGTH = 120;
const SEED = 0x6d2b79f5;

const buildSamples = (): readonly number[] => {
  const out = new Array<number>(LENGTH);
  let state = SEED;
  for (let i = 0; i < LENGTH; i++) {
    const envelope = 0.45 + 0.45 * Math.sin((i / LENGTH) * Math.PI);
    state = (state * 1664525 + 1013904223) >>> 0;
    const jitter = (state >>> 8) / 0xffffff;
    out[i] = Math.min(1, Math.max(0, envelope * (0.3 + 0.7 * jitter)));
  }
  return out;
};

export const sampleAmplitudes: readonly number[] = buildSamples();
