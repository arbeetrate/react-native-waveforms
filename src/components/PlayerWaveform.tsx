import { useEffect, useId, useMemo } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Rect } from 'react-native-svg';
import type { PlayerWaveformProps, RendererProps } from '../types';
import { useProcessedSamples } from '../hooks/useProcessedSamples';
import { builtInRenderers } from '../renderers';

const DEFAULT_COLOR = '#d1d5db';
const DEFAULT_PROGRESS_COLOR = '#2563eb';
const DEFAULT_GAP = 1;
const DEFAULT_ANIMATION_MS = 200;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

const resolveProgress = (
  progress: number | undefined,
  positionMs: number | undefined,
  durationMs: number | undefined
): number => {
  if (progress !== undefined) return clamp01(progress);
  if (positionMs !== undefined && durationMs !== undefined && durationMs > 0) {
    return clamp01(positionMs / durationMs);
  }
  return 0;
};

export const PlayerWaveform = ({
  samples,
  width,
  height,
  color = DEFAULT_COLOR,
  progressColor = DEFAULT_PROGRESS_COLOR,
  renderer = 'bars',
  inputRange,
  barWidth,
  gap = DEFAULT_GAP,
  rounded,
  baseline,
  strokeWidth,
  fillOpacity,
  progress,
  positionMs,
  durationMs,
  isPlaying = false,
  animationDuration = DEFAULT_ANIMATION_MS,
}: PlayerWaveformProps) => {
  const processed = useProcessedSamples(samples, {
    width,
    inputRange,
    barWidth,
    gap,
  });

  const target = useMemo(
    () => resolveProgress(progress, positionMs, durationMs),
    [progress, positionMs, durationMs]
  );

  const progressValue = useSharedValue(target);

  // Drive the long-running playback animation entirely on the UI thread.
  // Only re-fires on play/pause edges or duration changes; periodic
  // positionMs updates from the consumer are intentionally ignored while
  // playing so we don't keep restarting the animation.
  useEffect(() => {
    if (isPlaying && durationMs !== undefined && durationMs > 0) {
      cancelAnimation(progressValue);
      progressValue.value = target;
      const remainingMs = durationMs * (1 - target);
      if (remainingMs > 0) {
        progressValue.value = withTiming(1, {
          duration: remainingMs,
          easing: Easing.linear,
        });
      }
    }
    // Intentionally not in deps: target. Seek-while-playing is not supported
    // in this version — consumers should pause -> seek -> play.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, durationMs, progressValue]);

  // Scrubbing path: when not playing, follow the controlled target with a
  // short tween for smoothness.
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimation(progressValue);
      progressValue.value =
        animationDuration > 0
          ? withTiming(target, {
              duration: animationDuration,
              easing: Easing.linear,
            })
          : target;
    }
  }, [isPlaying, target, animationDuration, progressValue]);

  const animatedRectProps = useAnimatedProps(() => {
    // Clamp the clip rect width to a valid SVG range. Reanimated can briefly
    // settle just outside [0, 1] when an animation is interrupted (e.g. by
    // a parent remount), and a negative <rect> width crashes the SVG layer.
    const raw = progressValue.value * width;
    return { width: raw < 0 ? 0 : raw > width ? width : raw };
  });

  const Renderer =
    typeof renderer === 'function' ? renderer : builtInRenderers[renderer];

  const rendererProps: RendererProps = {
    samples: processed,
    width,
    height,
    color,
    barWidth,
    gap,
    rounded,
    baseline,
    strokeWidth,
    fillOpacity,
  };

  const clipId = `pw-clip-${useId()}`;

  return (
    <Svg width={width} height={height}>
      <Renderer {...rendererProps} />
      <Defs>
        <ClipPath id={clipId}>
          <AnimatedRect
            x={0}
            y={0}
            height={height}
            animatedProps={animatedRectProps}
          />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${clipId})`}>
        <Renderer {...rendererProps} color={progressColor} />
      </G>
    </Svg>
  );
};
