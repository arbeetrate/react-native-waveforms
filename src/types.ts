import type { ReactNode } from 'react';

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
