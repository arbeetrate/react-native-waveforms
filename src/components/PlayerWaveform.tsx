import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import {
  View,
  type GestureResponderEvent,
  type NativeSyntheticEvent,
  type NativeTouchEvent,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Rect } from 'react-native-svg';
import type { PlayerWaveformProps, RendererProps } from '../types';
import { useActiveIndexFromX } from '../hooks/useActiveIndexFromX';
import { useProcessedSamples } from '../hooks/useProcessedSamples';
import { builtInRenderers } from '../renderers';
import { renderGradientDefs, resolveFill } from '../utils/resolveFill';

const DEFAULT_COLOR = '#d1d5db';
const DEFAULT_PROGRESS_COLOR = '#2563eb';
const DEFAULT_GAP = 1;
const DEFAULT_ANIMATION_MS = 200;
const DEFAULT_ACTIVE_TRANSITION_MS = 150;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type MouseLikeEvent = { clientX: number };

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
  activeColor,
  activeScale,
  activePushRange,
  activeTransitionMs = DEFAULT_ACTIVE_TRANSITION_MS,
  progress,
  positionMs,
  durationMs,
  isPlaying = false,
  animationDuration = DEFAULT_ANIMATION_MS,
  onSeek,
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

  // True between grant and release. Gates the prop-driven animation effects
  // so a `positionMs` tick from the consumer mid-drag doesn't yank the fill
  // out from under the finger.
  const isScrubbingRef = useRef(false);

  // Drive the long-running playback animation entirely on the UI thread.
  // Only re-fires on play/pause edges or duration changes; periodic
  // positionMs updates from the consumer are intentionally ignored while
  // playing so we don't keep restarting the animation.
  useEffect(() => {
    if (isScrubbingRef.current) return;
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
    // Intentionally not in deps: target. Seek-while-playing is handled by
    // the scrub release path (which restarts the timing animation from
    // the new position) — see onRelease below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, durationMs, progressValue]);

  // Scrubbing path: when not playing, follow the controlled target with a
  // short tween for smoothness.
  useEffect(() => {
    if (isScrubbingRef.current) return;
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
  }, [progressValue, width]);

  const Renderer =
    typeof renderer === 'function' ? renderer : builtInRenderers[renderer];

  const idBase = useId().replace(/:/g, '');
  const baseFill = useMemo(
    () => resolveFill(color, `pw-${idBase}-c`),
    [color, idBase]
  );
  const progressFill = useMemo(
    () => resolveFill(progressColor, `pw-${idBase}-p`),
    [progressColor, idBase]
  );
  const activeFill = useMemo(
    () => resolveFill(activeColor, `pw-${idBase}-a`),
    [activeColor, idBase]
  );

  const interactive = onSeek !== undefined;
  const { activeIndex, updateFromX, clearActive } = useActiveIndexFromX(
    processed.length,
    width
  );
  const containerRef = useRef<unknown>(null);

  const writeScrub = useCallback(
    (x: number) => {
      const clamped = clamp01(x / width);
      cancelAnimation(progressValue);
      progressValue.value = clamped;
      updateFromX(x);
    },
    [progressValue, width, updateFromX]
  );

  const onGrant = useCallback(
    (e: GestureResponderEvent | NativeSyntheticEvent<NativeTouchEvent>) => {
      isScrubbingRef.current = true;
      writeScrub(e.nativeEvent.locationX);
    },
    [writeScrub]
  );

  const onMove = useCallback(
    (e: GestureResponderEvent | NativeSyntheticEvent<NativeTouchEvent>) => {
      if (!isScrubbingRef.current) return;
      writeScrub(e.nativeEvent.locationX);
    },
    [writeScrub]
  );

  const onRelease = useCallback(() => {
    if (!isScrubbingRef.current) return;
    isScrubbingRef.current = false;
    const finalProgress = clamp01(progressValue.value);
    clearActive();
    onSeek?.(finalProgress);
    // Resume playback from the new position so the consumer doesn't have
    // to toggle isPlaying off/on. The next prop tick will be ignored by
    // the isPlaying effect (target isn't in its deps), so we kick off the
    // remaining-time tween here.
    if (isPlaying && durationMs !== undefined && durationMs > 0) {
      const remainingMs = durationMs * (1 - finalProgress);
      if (remainingMs > 0) {
        progressValue.value = withTiming(1, {
          duration: remainingMs,
          easing: Easing.linear,
        });
      }
    }
  }, [progressValue, clearActive, onSeek, isPlaying, durationMs]);

  // Web mouse path. Press-state is tracked via `pressedRef` so movement
  // outside a held-down drag doesn't scrub. We measure the container
  // bounding-rect so positions are relative to the waveform regardless of
  // which child SVG element the event fired on.
  const pressedRef = useRef(false);

  const xFromMouse = useCallback((e: MouseLikeEvent): number | null => {
    const dom = containerRef.current as unknown as {
      getBoundingClientRect?: () => { left: number };
    } | null;
    if (!dom?.getBoundingClientRect) return null;
    return e.clientX - dom.getBoundingClientRect().left;
  }, []);

  const onMouseDown = useCallback(
    (e: MouseLikeEvent) => {
      const x = xFromMouse(e);
      if (x === null) return;
      pressedRef.current = true;
      isScrubbingRef.current = true;
      writeScrub(x);
    },
    [xFromMouse, writeScrub]
  );

  const onMouseMove = useCallback(
    (e: MouseLikeEvent) => {
      if (!pressedRef.current) return;
      const x = xFromMouse(e);
      if (x === null) return;
      writeScrub(x);
    },
    [xFromMouse, writeScrub]
  );

  const onMouseUp = useCallback(() => {
    if (!pressedRef.current) return;
    pressedRef.current = false;
    onRelease();
  }, [onRelease]);

  const rendererProps: RendererProps = {
    samples: processed,
    width,
    height,
    color: baseFill.fill,
    barWidth,
    gap,
    rounded,
    baseline,
    strokeWidth,
    fillOpacity,
    activeIndex: interactive ? activeIndex : null,
    activeColor: activeColor !== undefined ? activeFill.fill : undefined,
    activeScale,
    activePushRange,
    activeTransitionMs,
  };

  const clipId = `pw-clip-${idBase}`;
  const defs = renderGradientDefs([
    baseFill.def,
    progressFill.def,
    activeFill.def,
  ]);

  const svg = (
    <Svg width={width} height={height}>
      <Defs>
        {defs}
        <ClipPath id={clipId}>
          <AnimatedRect
            x={0}
            y={0}
            height={height}
            animatedProps={animatedRectProps}
          />
        </ClipPath>
      </Defs>
      <Renderer {...rendererProps} />
      <G clipPath={`url(#${clipId})`}>
        <Renderer {...rendererProps} color={progressFill.fill} />
      </G>
    </Svg>
  );

  if (!interactive) {
    return svg;
  }

  return (
    <View
      ref={containerRef as any}
      style={{ width, height }}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={onGrant}
      onResponderMove={onMove}
      onResponderRelease={onRelease}
      onResponderTerminate={onRelease}
      {...({
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseLeave: onMouseUp,
      } as unknown as object)}>
      {svg}
    </View>
  );
};
