const COUNT = 200;

export const sampleAmplitudes: number[] = Array.from(
  { length: COUNT },
  (_, i) => {
    const t = i / COUNT;
    const envelope = Math.sin(t * Math.PI);
    const wobble = 0.6 + 0.4 * Math.sin(i * 0.7);
    const jitter = Math.sin(i * 1.7) * 0.15;
    return Math.min(1, Math.max(0, envelope * wobble + jitter));
  }
);
