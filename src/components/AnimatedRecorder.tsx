import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  makeMutable,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';
import type { BarsBaseline, RecorderWaveformHandle } from '../types';
import {
  buildInitialBuffer,
  resolveRadius,
  type AnimatedRecorderProps,
} from './recorder-internal';

export const AnimatedRecorder = forwardRef<
  RecorderWaveformHandle,
  AnimatedRecorderProps
>(
  (
    {
      width,
      height,
      capacity,
      barWidth,
      gap,
      color,
      colors,
      baseline,
      rounded,
      duration,
      easing,
      direction,
      prefill,
      fadeIn,
      fadeOut,
      growIn,
      growOut,
      enableScroll,
      smoothScroll,
      initialSamples,
    },
    ref
  ) => {
    const stride = barWidth + gap;

    // Stable per-bar shared values, recreated only on capacity change.
    const barsHolderRef = useRef<{
      capacity: number;
      bars: SharedValue<number>[];
    } | null>(null);
    if (
      barsHolderRef.current === null ||
      barsHolderRef.current.capacity !== capacity
    ) {
      const initial = buildInitialBuffer(capacity, initialSamples, prefill);
      barsHolderRef.current = {
        capacity,
        bars: Array.from({ length: capacity }, (_, i) =>
          makeMutable(initial[i] ?? 0)
        ),
      };
    }
    const bars = barsHolderRef.current.bars;

    // Targets (raw sample values, no envelope applied) live in JS.
    const targetsRef = useRef<number[]>([]);
    if (targetsRef.current.length !== capacity) {
      targetsRef.current = buildInitialBuffer(
        capacity,
        initialSamples,
        prefill
      );
    }

    const pendingRef = useRef<number[]>([]);
    const rafRef = useRef<number | null>(null);

    const translateX = useSharedValue(0);

    const fadeInPx = fadeIn > 0 ? fadeIn * stride : 0;
    const fadeOutPx = fadeOut > 0 ? fadeOut * stride : 0;
    const growInPx = growIn > 0 ? growIn * stride : 0;
    const growOutPx = growOut > 0 ? growOut * stride : 0;

    const flush = useCallback(() => {
      rafRef.current = null;
      const incoming = pendingRef.current;
      const incomingCount = incoming.length;
      if (incomingCount === 0) return;

      // Mutate the targets buffer in place - no concat/slice allocations
      // per push.
      const targets = targetsRef.current;
      const cap = capacity;
      const dropCount = incomingCount > cap ? cap : incomingCount;
      for (let i = 0; i < cap - dropCount; i++) {
        targets[i] = targets[i + dropCount]!;
      }
      const baseIdx = cap - dropCount;
      const incomingStart = incomingCount - dropCount;
      for (let i = 0; i < dropCount; i++) {
        targets[baseIdx + i] = incoming[incomingStart + i] as number;
      }
      incoming.length = 0;

      const animateAmplitudes = !enableScroll;
      const localEasing = easing ?? Easing.linear;

      // Write bar shared values directly from JS - no worklet closure
      // captures the targets array.
      if (animateAmplitudes) {
        for (let i = 0; i < bars.length; i++) {
          bars[i]!.value = withTiming(targets[i]!, {
            duration,
            easing: localEasing,
          });
        }
      } else {
        for (let i = 0; i < bars.length; i++) {
          bars[i]!.value = targets[i]!;
        }
      }

      // translateX bump must be atomic on UI thread (read-modify-write
      // mid-animation). scheduleOnUI captures only primitives - no arrays.
      if (enableScroll && smoothScroll && dropCount > 0) {
        const bumpPx = dropCount * stride;
        const localDuration = duration;
        scheduleOnUI(() => {
          'worklet';
          translateX.value = translateX.value + bumpPx;
          translateX.value = withTiming(0, {
            duration: localDuration,
            easing: localEasing,
          });
        });
      }
    }, [
      bars,
      capacity,
      duration,
      easing,
      enableScroll,
      smoothScroll,
      stride,
      translateX,
    ]);

    const push = useCallback<RecorderWaveformHandle['push']>(
      (amplitude) => {
        if (Array.isArray(amplitude)) {
          for (let i = 0; i < amplitude.length; i++) {
            pendingRef.current.push(amplitude[i] as number);
          }
        } else {
          pendingRef.current.push(amplitude as number);
        }
        if (
          rafRef.current === null &&
          typeof requestAnimationFrame === 'function'
        ) {
          rafRef.current = requestAnimationFrame(flush);
        }
      },
      [flush]
    );

    const reset = useCallback(() => {
      pendingRef.current.length = 0;
      const targets = targetsRef.current;
      for (let i = 0; i < targets.length; i++) targets[i] = 0;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      translateX.value = 0;
      for (let i = 0; i < bars.length; i++) {
        bars[i]!.value = 0;
      }
    }, [bars, translateX]);

    useImperativeHandle(ref, () => ({ push, reset }), [push, reset]);

    useEffect(
      () => () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      },
      []
    );

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    const radius = resolveRadius(rounded, barWidth);
    const flipStyle = direction === 'left' ? styles.flipHorizontal : undefined;
    const useTranslateWrapper = enableScroll && smoothScroll;

    const barsView = (
      <View style={[styles.barsContainer, { width, height }]}>
        {bars.map((sv, i) => (
          <AnimatedBar
            key={i}
            sv={sv}
            x={i * stride}
            barWidth={barWidth}
            height={height}
            color={colors?.[i] ?? color}
            baseline={baseline}
            radius={radius}
            clipWidth={width}
            fadeInPx={fadeInPx}
            fadeOutPx={fadeOutPx}
            growInPx={growInPx}
            growOutPx={growOutPx}
            translateX={translateX}
          />
        ))}
      </View>
    );

    return (
      <View style={[styles.clip, { width, height }, flipStyle]}>
        {useTranslateWrapper ? (
          <Animated.View style={animatedStyle}>{barsView}</Animated.View>
        ) : (
          barsView
        )}
      </View>
    );
  }
);

AnimatedRecorder.displayName = 'RecorderWaveform.Animated';

type AnimatedBarProps = {
  sv: SharedValue<number>;
  x: number;
  barWidth: number;
  height: number;
  color: string;
  baseline: BarsBaseline;
  radius: number;
  clipWidth: number;
  fadeInPx: number;
  fadeOutPx: number;
  growInPx: number;
  growOutPx: number;
  translateX: SharedValue<number>;
};

const AnimatedBar = memo(function AnimatedBar({
  sv,
  x,
  barWidth,
  height,
  color,
  baseline,
  radius,
  clipWidth,
  fadeInPx,
  fadeOutPx,
  growInPx,
  growOutPx,
  translateX,
}: AnimatedBarProps) {
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const a = sv.value;
    const ampClamped = a < 0 ? 0 : a > 1 ? 1 : a;
    // Touch translateX ONLY when an edge envelope is enabled - Reanimated
    // tracks reads at runtime, so without fade/grow this worklet does not
    // depend on translateX and stays idle during scroll animation.
    const useEnvelope =
      fadeInPx > 0 || fadeOutPx > 0 || growInPx > 0 || growOutPx > 0;
    let opacity = 1;
    let heightEnv = 1;
    if (useEnvelope) {
      const center = x + barWidth / 2 + translateX.value;
      if (fadeInPx > 0) {
        const m = (clipWidth - center) / fadeInPx;
        opacity *= m < 0 ? 0 : m > 1 ? 1 : m;
      }
      if (fadeOutPx > 0) {
        const m = center / fadeOutPx;
        opacity *= m < 0 ? 0 : m > 1 ? 1 : m;
      }
      if (growInPx > 0) {
        const m = (clipWidth - center) / growInPx;
        heightEnv *= m < 0 ? 0 : m > 1 ? 1 : m;
      }
      if (growOutPx > 0) {
        const m = center / growOutPx;
        heightEnv *= m < 0 ? 0 : m > 1 ? 1 : m;
      }
    }
    const h = ampClamped * heightEnv * height;
    const top = baseline === 'bottom' ? height - h : (height - h) / 2;
    return { height: h, top, opacity };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          width: barWidth,
          backgroundColor: color,
          borderRadius: radius,
        },
        animatedStyle,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  flipHorizontal: {
    transform: [{ scaleX: -1 }],
  },
  barsContainer: {
    position: 'relative',
  },
});
