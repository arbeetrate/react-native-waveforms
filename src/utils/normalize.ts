import type { InputRange } from '../types';

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

export const detectInputRange = (samples: readonly number[]): InputRange => {
  for (let i = 0; i < samples.length; i++) {
    const value = samples[i];
    if (value !== undefined && value < 0) {
      return [-1, 1];
    }
  }
  return [0, 1];
};

export const normalize = (
  samples: readonly number[],
  inputRange?: InputRange
): number[] => {
  const range = inputRange ?? detectInputRange(samples);
  const [min, max] = range;

  if (min === 0 && max === 1) {
    return samples.map(clamp01);
  }

  if (min === -1 && max === 1) {
    return samples.map((value) => clamp01(Math.abs(value)));
  }

  const span = max - min;
  if (span === 0) {
    return samples.map(() => 0);
  }
  if (min < 0 && max > 0) {
    const bound = Math.max(Math.abs(min), Math.abs(max));
    return samples.map((value) => clamp01(Math.abs(value) / bound));
  }
  return samples.map((value) => clamp01((value - min) / span));
};
