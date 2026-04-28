import type { ReactNode } from 'react';
import type {
  EasingFunction,
  EasingFunctionFactory,
} from 'react-native-reanimated';

export type RecorderEasing = EasingFunction | EasingFunctionFactory;

export type Sample = number;

export type InputRange = readonly [number, number];

export type BarsBaseline = 'center' | 'bottom';

export type RendererProps = {
  samples: readonly number[];
  width: number;
  height: number;
  color: string;
  // bars-specific
  barWidth?: number;
  gap?: number;
  rounded?: boolean | number;
  baseline?: BarsBaseline;
  // line / area-specific
  strokeWidth?: number;
  fillOpacity?: number;
};

export type WaveformRenderer = (props: RendererProps) => ReactNode;

export type BuiltInRendererName = 'bars' | 'line' | 'area';

export type WaveformProps = {
  samples: readonly number[];
  width: number;
  height: number;
  color?: string;
  renderer?: BuiltInRendererName | WaveformRenderer;
  inputRange?: InputRange;
  // bars-specific
  barWidth?: number;
  gap?: number;
  rounded?: boolean | number;
  baseline?: BarsBaseline;
  // line / area-specific
  strokeWidth?: number;
  fillOpacity?: number;
};

export type PlayerWaveformProps = WaveformProps & {
  progressColor?: string;
  animationDuration?: number;
  progress?: number;
  positionMs?: number;
  durationMs?: number;
  isPlaying?: boolean;
};

export type RecorderTransition = 'scroll' | 'morph';

export type RecorderDirection = 'right' | 'left';

export type RecorderWaveformProps = Omit<WaveformProps, 'samples'> & {
  capacity?: number;
  initialSamples?: readonly number[];
  /** Visual style for incoming samples. `scroll` slides bars horizontally;
   * `morph` keeps bars in place and animates each bar's height to the next
   * sample's value. Default `scroll`. */
  transition?: RecorderTransition;
  /** Where new samples enter from. `right` (default) appends to the right
   * edge and scrolls left; `left` mirrors the layout. */
  direction?: RecorderDirection;
  /** When `true` (default) the buffer is pre-filled with zero amplitudes so
   * scroll/morph behavior starts on the first push. When `false` the buffer
   * fills from the entry edge first and only starts scrolling once it
   * reaches `capacity`. */
  prefill?: boolean;
  /** Duration of the per-sample transition animation in ms. Used by both
   * `scroll` and `morph`. Falls back to `scrollDuration` for compatibility. */
  transitionDuration?: number;
  /** Easing applied to per-bar height interpolation and to scroll
   * translation. Default `Easing.linear`. */
  transitionEasing?: RecorderEasing;
  /** Number of bars at the entry edge that fade in from 0 to full
   * amplitude as they shift inward. `0` (default) disables. Try `2`–`5`. */
  fadeIn?: number;
  /** Number of bars at the exit edge that fade out from full amplitude
   * to 0 as they shift toward the edge. `0` (default) disables. */
  fadeOut?: number;
  smoothScroll?: boolean;
  /** @deprecated use `transitionDuration` */
  scrollDuration?: number;
};

export type RecorderWaveformHandle = {
  push: (amplitude: number | readonly number[]) => void;
  reset: () => void;
};
