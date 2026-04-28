/// <reference lib="dom" />
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { RecorderWaveformHandle } from '../types';
import {
  buildInitialBuffer,
  resolveRadius,
  type AnimatedRecorderProps,
} from './recorder-internal';

// Read the current animated translateX of an element. Works mid-animation
// because it returns the resolved compositor value via the computed style
// matrix.
const getCurrentTranslateX = (el: HTMLElement): number => {
  const t = window.getComputedStyle(el).transform;
  if (!t || t === 'none') return 0;
  const m = /^matrix(?:3d)?\(([^)]+)\)$/.exec(t);
  if (!m) return 0;
  const parts = m[1]!.split(',').map((s) => parseFloat(s.trim()));
  // matrix(a,b,c,d,tx,ty) — tx is parts[4]
  // matrix3d(...16 values) — tx is parts[12]
  return parts[t.startsWith('matrix3d') ? 12 : 4] ?? 0;
};

const cancelAllAnimations = (el: HTMLElement | null) => {
  if (!el) return;
  const anims = el.getAnimations();
  for (let i = 0; i < anims.length; i++) anims[i]!.cancel();
};

export const AnimatedRecorder = memo(
  forwardRef<RecorderWaveformHandle, AnimatedRecorderProps>(
    (
      {
        width,
        height,
        capacity,
        barWidth,
        gap,
        color,
        baseline,
        rounded,
        duration,
        direction,
        prefill,
        fadeIn,
        fadeOut,
        enableScroll,
        smoothScroll,
        initialSamples,
      },
      ref
    ) => {
      const stride = barWidth + gap;
      const radius = resolveRadius(rounded, barWidth);

      // Targets buffer mutated in place — same model as native impl.
      const targetsRef = useRef<number[]>([]);
      if (targetsRef.current.length !== capacity) {
        targetsRef.current = buildInitialBuffer(
          capacity,
          initialSamples,
          prefill
        );
      }

      // DOM refs for each bar div + the wrapper that gets translated for
      // scroll animations.
      const barRefs = useRef<Array<HTMLElement | null>>([]);
      if (barRefs.current.length !== capacity) {
        barRefs.current = new Array(capacity).fill(null);
      }
      const wrapperRef = useRef<HTMLElement | null>(null);

      const pendingRef = useRef<number[]>([]);
      const rafRef = useRef<number | null>(null);

      const flush = useCallback(() => {
        rafRef.current = null;
        const incoming = pendingRef.current;
        const incomingCount = incoming.length;
        if (incomingCount === 0) return;

        // Mutate targets in place — no concat/slice allocations.
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

        // Apply target heights to bar DOM nodes directly. In SCROLL mode
        // CSS transition is `none` so this is instant; in MORPH mode the
        // browser interpolates from current to new at compositor level —
        // zero JS work per frame.
        const bars = barRefs.current;
        for (let i = 0; i < bars.length; i++) {
          const el = bars[i];
          if (!el) continue;
          const a = targets[i] ?? 0;
          const ampClamped = a < 0 ? 0 : a > 1 ? 1 : a;
          const h = ampClamped * height;
          const top = baseline === 'bottom' ? height - h : (height - h) / 2;
          el.style.height = `${h}px`;
          el.style.top = `${top}px`;
        }

        // Wrapper translateX bump animated via Web Animations API. The
        // browser runs this on the compositor thread — no JS per frame,
        // no DOM mutations observable by extensions.
        if (enableScroll && smoothScroll && dropCount > 0) {
          const wrapper = wrapperRef.current;
          if (wrapper) {
            const currentX = getCurrentTranslateX(wrapper);
            const newStartX = currentX + dropCount * stride;
            cancelAllAnimations(wrapper);
            wrapper.animate(
              [
                { transform: `translateX(${newStartX}px)` },
                { transform: 'translateX(0px)' },
              ],
              {
                duration,
                easing: 'linear',
                fill: 'forwards',
              }
            );
          }
        }
      }, [
        capacity,
        duration,
        enableScroll,
        smoothScroll,
        stride,
        height,
        baseline,
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
        cancelAllAnimations(wrapperRef.current);
        const bars = barRefs.current;
        const baseTop =
          baseline === 'bottom' ? `${height}px` : `${height / 2}px`;
        for (let i = 0; i < bars.length; i++) {
          const el = bars[i];
          if (!el) continue;
          cancelAllAnimations(el);
          el.style.height = '0px';
          el.style.top = baseTop;
        }
      }, [baseline, height]);

      useImperativeHandle(ref, () => ({ push, reset }), [push, reset]);

      useEffect(
        () => () => {
          if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        },
        []
      );

      // Apply initial bar heights synchronously after mount/capacity change
      // (before paint, so users never see uninitialized bars).
      useLayoutEffect(() => {
        const targets = targetsRef.current;
        const bars = barRefs.current;
        for (let i = 0; i < bars.length; i++) {
          const el = bars[i];
          if (!el) continue;
          const a = targets[i] ?? 0;
          const ampClamped = a < 0 ? 0 : a > 1 ? 1 : a;
          const h = ampClamped * height;
          const top = baseline === 'bottom' ? height - h : (height - h) / 2;
          el.style.height = `${h}px`;
          el.style.top = `${top}px`;
        }
      }, [capacity, height, baseline]);

      // Set CSS transition once per (mode, duration) change. Morph mode
      // wants smooth height/top transitions; scroll mode wants instant
      // updates because translateX provides the visual continuity.
      useLayoutEffect(() => {
        const transition = !enableScroll
          ? `height ${duration}ms linear, top ${duration}ms linear`
          : 'none';
        const bars = barRefs.current;
        for (let i = 0; i < bars.length; i++) {
          const el = bars[i];
          if (el) el.style.transition = transition;
        }
      }, [enableScroll, duration, capacity]);

      const fadeInPx = fadeIn > 0 ? fadeIn * stride : 0;
      const fadeOutPx = fadeOut > 0 ? fadeOut * stride : 0;
      const useMask = fadeInPx > 0 || fadeOutPx > 0;
      // Static CSS gradient mask handles the edge fade purely on the
      // compositor — no JS per frame, no per-bar env computation.
      const maskValue = useMask
        ? `linear-gradient(to right, transparent 0px, black ${fadeOutPx}px, black ${
            width - fadeInPx
          }px, transparent ${width}px)`
        : undefined;
      const maskStyle = useMask
        ? ({
            // Cast: webkit/standard mask aren't in RN's ViewStyle but RN Web
            // passes them through to the underlying div.
            WebkitMaskImage: maskValue,
            maskImage: maskValue,
          } as unknown as ViewStyle)
        : undefined;

      const flipStyle =
        direction === 'left' ? styles.flipHorizontal : undefined;

      return (
        <View style={[styles.clip, { width, height }, flipStyle, maskStyle]}>
          <View
            ref={(r) => {
              wrapperRef.current = r as unknown as HTMLElement;
            }}
            style={[styles.barsContainer, { width, height }]}>
            {Array.from({ length: capacity }, (_, i) => (
              <View
                key={i}
                ref={(r) => {
                  barRefs.current[i] = r as unknown as HTMLElement;
                }}
                style={{
                  position: 'absolute',
                  left: i * stride,
                  width: barWidth,
                  backgroundColor: color,
                  borderRadius: radius,
                }}
              />
            ))}
          </View>
        </View>
      );
    }
  )
);

AnimatedRecorder.displayName = 'RecorderWaveform.Animated.Web';

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
