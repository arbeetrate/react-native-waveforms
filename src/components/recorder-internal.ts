import type {
  BarsBaseline,
  RecorderDirection,
  RecorderEasing,
  RecorderWaveformHandle,
} from '../types';

export const DEFAULT_GAP = 1;
export const DEFAULT_TRANSITION_MS = 100;
export const FALLBACK_CAPACITY = 64;

export const deriveCapacity = (
  width: number,
  barWidth: number | undefined,
  gap: number
): number => {
  if (barWidth !== undefined && barWidth > 0) {
    return Math.max(1, Math.floor((width + gap) / (barWidth + gap)));
  }
  return FALLBACK_CAPACITY;
};

export const computeBarWidth = (
  width: number,
  capacity: number,
  gap: number
): number => Math.max(1, (width - (capacity - 1) * gap) / capacity);

export const resolveRadius = (
  rounded: boolean | number | undefined,
  barWidth: number
): number => {
  if (rounded === true) return barWidth / 2;
  if (typeof rounded === 'number') return rounded;
  return 0;
};

export const buildInitialBuffer = (
  capacity: number,
  initialSamples: readonly number[] | undefined,
  prefill: boolean
): number[] => {
  const initial = initialSamples ? initialSamples.slice(-capacity) : [];
  if (!prefill) {
    const out = new Array<number>(capacity).fill(0);
    for (let i = 0; i < initial.length; i++) {
      out[i] = initial[i] as number;
    }
    return out;
  }
  const padded = new Array<number>(capacity).fill(0);
  const offset = capacity - initial.length;
  for (let i = 0; i < initial.length; i++) {
    padded[offset + i] = initial[i] as number;
  }
  return padded;
};

export type AnimatedRecorderProps = {
  width: number;
  height: number;
  capacity: number;
  barWidth: number;
  gap: number;
  color: string;
  baseline: BarsBaseline;
  rounded: boolean | number | undefined;
  duration: number;
  easing: RecorderEasing | undefined;
  direction: RecorderDirection;
  prefill: boolean;
  fadeIn: number;
  fadeOut: number;
  enableScroll: boolean;
  smoothScroll: boolean;
  initialSamples?: readonly number[];
};

export type AnimatedRecorderRef = RecorderWaveformHandle;
