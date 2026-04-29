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
    // Always downsample so the displayed sample count actually fits the
    // chart. When `barWidth` isn't provided we use 1px as the minimum bar
    // width - without this clamp many extra samples render beyond `width`,
    // get SVG-clipped, but throw off any logic (hover, layout) that uses
    // `processed.length` as the visual count.
    const effectiveBarWidth = barWidth !== undefined && barWidth > 0 ? barWidth : 1;
    const stride = effectiveBarWidth + gap;
    const capacity = Math.max(1, Math.floor((width + gap) / stride));
    if (normalized.length > capacity) {
      return downsamplePeak(normalized, capacity);
    }
    return normalized;
  }, [samples, inputRange, barWidth, gap, width]);
