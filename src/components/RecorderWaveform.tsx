import { forwardRef, memo, useMemo } from 'react';
import type { RecorderWaveformHandle, RecorderWaveformProps } from '../types';
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
      color={color}
      baseline={baseline}
      rounded={rounded}
      duration={duration}
      easing={transitionEasing}
      direction={direction}
      prefill={prefill}
      fadeIn={fadeIn}
      fadeOut={fadeOut}
      enableScroll={transition === 'scroll'}
      smoothScroll={smoothScroll}
      initialSamples={initialSamples}
    />
  );
});

RecorderWaveformInner.displayName = 'RecorderWaveform';

export const RecorderWaveform = memo(RecorderWaveformInner);
