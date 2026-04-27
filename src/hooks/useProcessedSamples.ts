import { useMemo } from 'react';
import type { InputRange } from '../types';
import { downsamplePeak } from '../utils/downsample';
import { normalize } from '../utils/normalize';

type Options = {
  width: number;
  inputRange?: InputRange;
  barWidth?: number;
  gap: number;
};

export const useProcessedSamples = (
  samples: readonly number[],
  { width, inputRange, barWidth, gap }: Options
): number[] =>
  useMemo(() => {
    const normalized = normalize(samples, inputRange);
    if (barWidth !== undefined && barWidth > 0) {
      const stride = barWidth + gap;
      const capacity = Math.max(1, Math.floor((width + gap) / stride));
      if (normalized.length > capacity) {
        return downsamplePeak(normalized, capacity);
      }
    }
    return normalized;
  }, [samples, inputRange, barWidth, gap, width]);
