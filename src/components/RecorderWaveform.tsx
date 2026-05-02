import { forwardRef, memo, useMemo } from 'react';
import type { RecorderWaveformHandle, RecorderWaveformProps } from '../types';
import { sampleGradientAt } from '../utils/gradient';
import { AnimatedRecorder } from './AnimatedRecorder';
import {
  DEFAULT_GAP,
  DEFAULT_TRANSITION_MS,
  computeBarWidth,
  deriveCapacity,
} from './recorder-internal';

const RecorderWaveformInner = forwardRef<
  RecorderWaveformHandle,
  RecorderWaveformProps
>((props, ref) => {
  const {
    capacity,
    initialSamples,
    width,
    height,
    barWidth,
    gap = DEFAULT_GAP,
    smoothScroll = true,
    scrollDuration,
    transition = 'scroll',
    transitionDuration,
    transitionEasing,
    direction = 'right',
    prefill = true,
    fadeIn = 0,
    fadeOut = 0,
    growIn = 0,
    growOut = 0,
    color = '#000',
    baseline = 'center',
    rounded,
  } = props;

  const resolvedCapacity = useMemo(
    () => capacity ?? deriveCapacity(width, barWidth, gap),
    [capacity, width, barWidth, gap]
  );

  const resolvedBarWidth = useMemo(
    () => barWidth ?? computeBarWidth(width, resolvedCapacity, gap),
    [barWidth, width, resolvedCapacity, gap]
  );

  // Recorder bars paint flat colors via View.backgroundColor, so a
  // gradient is sampled once per bar slot along the x-axis. Vertical
  // gradients fall back to horizontal sampling - true per-bar vertical
  // gradients would require a different rendering pipeline.
  const { resolvedColor, resolvedColors } = useMemo<{
    resolvedColor: string;
    resolvedColors: readonly string[] | undefined;
  }>(() => {
    if (typeof color === 'string') {
      return { resolvedColor: color, resolvedColors: undefined };
    }
    if (color.type === 'linear') {
      const cap = resolvedCapacity;
      const colors = new Array<string>(cap);
      const denom = cap > 1 ? cap - 1 : 1;
      for (let i = 0; i < cap; i++) {
        colors[i] = sampleGradientAt(color, i / denom);
      }
      return { resolvedColor: colors[0] ?? '#000', resolvedColors: colors };
    }
    return { resolvedColor: '#000', resolvedColors: undefined };
  }, [color, resolvedCapacity]);

  const duration =
    transitionDuration ?? scrollDuration ?? DEFAULT_TRANSITION_MS;

  return (
    <AnimatedRecorder
      ref={ref}
      width={width}
      height={height}
      capacity={resolvedCapacity}
      barWidth={resolvedBarWidth}
      gap={gap}
      color={resolvedColor}
      colors={resolvedColors}
      baseline={baseline}
      rounded={rounded}
      duration={duration}
      easing={transitionEasing}
      direction={direction}
      prefill={prefill}
      fadeIn={fadeIn}
      fadeOut={fadeOut}
      growIn={growIn}
      growOut={growOut}
      enableScroll={transition === 'scroll'}
      smoothScroll={smoothScroll}
      initialSamples={initialSamples}
    />
  );
});

RecorderWaveformInner.displayName = 'RecorderWaveform';

export const RecorderWaveform = memo(RecorderWaveformInner);
