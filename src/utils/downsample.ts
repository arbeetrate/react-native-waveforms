export const downsamplePeak = (
  samples: readonly number[],
  targetCount: number
): number[] => {
  if (targetCount <= 0) return [];
  if (samples.length === 0) return new Array<number>(targetCount).fill(0);
  if (samples.length <= targetCount) return samples.slice();

  const out = new Array<number>(targetCount);
  const step = samples.length / targetCount;

  for (let i = 0; i < targetCount; i++) {
    const start = Math.floor(i * step);
    const end =
      i === targetCount - 1 ? samples.length : Math.floor((i + 1) * step);
    let peak = 0;
    for (let j = start; j < end; j++) {
      const value = samples[j];
      if (value !== undefined && value > peak) peak = value;
    }
    out[i] = peak;
  }

  return out;
};
