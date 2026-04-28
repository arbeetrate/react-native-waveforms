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
  // interactivity (forwarded by <Waveform>)
  activeIndex?: number | null;
  activeColor?: string;
  activeScale?: number;
  activePushRange?: number;
  activeTransitionMs?: number;
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
  /** Color shown for the sample currently under the cursor (web hover) or
   * touch (native tap / drag). Enabling this turns on the hit overlay. */
  activeColor?: string;
  /** Width multiplier for the active bar (e.g. 1.5 = 50% wider). The bar
   * stays centered on its slot, growing equally to both sides. Default 1
   * (no scale). Bars-only. */
  activeScale?: number;
  /** How many neighbouring bars on each side get pushed away from the
   * active bar (linear decay). Auto-defaults to 4 when `activeScale > 1`,
   * `0` disables. Bars-only. */
  activePushRange?: number;
  /** CSS transition duration in ms applied to the fill / width change on
   * web. No effect on native (snaps). Default 150. */
  activeTransitionMs?: number;
  /** Fired when the active sample changes (hover / drag). `null` on
   * leave / release. */
  onActiveSampleChange?: (
    index: number | null,
    sample: number | undefined
  ) => void;
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
