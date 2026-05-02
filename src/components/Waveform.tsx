import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  type GestureResponderEvent,
  type NativeSyntheticEvent,
  type NativeTouchEvent,
} from 'react-native';
import Svg from 'react-native-svg';
import type { WaveformProps } from '../types';
import { useProcessedSamples } from '../hooks/useProcessedSamples';
import { builtInRenderers } from '../renderers';
import { renderGradientDefs, resolveFill } from '../utils/resolveFill';

const DEFAULT_COLOR = '#000';
const DEFAULT_GAP = 1;
const DEFAULT_ACTIVE_TRANSITION_MS = 150;

// Web-only mouse event types passed through by react-native-web. RN doesn't
// type these on its native View, but RNW forwards them at runtime. We use
// `clientX` + a ref to the overlay to compute the pointer position
// relative to it - `offsetX` is relative to the event's target node and
// `currentTarget` can point to an RN Web wrapper element.
type MouseLikeEvent = { clientX: number };

export const Waveform = ({
  samples,
  width,
  height,
  color = DEFAULT_COLOR,
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
  onActiveSampleChange,
}: WaveformProps) => {
  const processed = useProcessedSamples(samples, {
    width,
    inputRange,
    barWidth,
    gap,
  });

  const Renderer =
    typeof renderer === 'function' ? renderer : builtInRenderers[renderer];

  const idBase = useId().replace(/:/g, '');
  const baseFill = useMemo(
    () => resolveFill(color, `wf-${idBase}-c`),
    [color, idBase]
  );
  const activeFill = useMemo(
    () => resolveFill(activeColor, `wf-${idBase}-a`),
    [activeColor, idBase]
  );

  const interactive = activeColor !== undefined;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Typed loosely - RN Web exposes the underlying DOM div on this ref,
  // RN native exposes the host component instance; we only call
  // `getBoundingClientRect` (web) so a permissive type is fine.
  const containerRef = useRef<unknown>(null);

  // Notify parent on changes - but only when the index actually shifts.
  const lastNotifiedRef = useRef<number | null>(null);
  useEffect(() => {
    if (!onActiveSampleChange) return;
    if (lastNotifiedRef.current === activeIndex) return;
    lastNotifiedRef.current = activeIndex;
    onActiveSampleChange(
      activeIndex,
      activeIndex !== null ? processed[activeIndex] : undefined
    );
  }, [activeIndex, processed, onActiveSampleChange]);

  const updateFromX = useCallback(
    (x: number) => {
      const count = processed.length;
      if (count === 0 || width <= 0) {
        setActiveIndex(null);
        return;
      }
      if (x < 0 || x > width) {
        setActiveIndex(null);
        return;
      }
      const slot = width / count;
      let idx = Math.floor(x / slot);
      if (idx < 0) idx = 0;
      if (idx >= count) idx = count - 1;
      setActiveIndex(idx);
    },
    [processed.length, width]
  );

  const clearActive = useCallback(() => setActiveIndex(null), []);

  // Web hover handler. We measure the container via its ref (RN Web
  // forwards the underlying DOM div through forwardRef), then convert
  // viewport-relative `clientX` into a position within the waveform.
  // We deliberately don't use `event.offsetX` (relative to the deepest
  // event target - could be a bar inside the SVG) or `event.currentTarget`
  // (RN Web wraps Views in extra divs in some configurations).
  const onMouseMove = useCallback(
    (e: MouseLikeEvent) => {
      const dom = containerRef.current as unknown as {
        getBoundingClientRect?: () => { left: number };
      } | null;
      if (!dom?.getBoundingClientRect) return;
      const rect = dom.getBoundingClientRect();
      updateFromX(e.clientX - rect.left);
    },
    [updateFromX]
  );

  // Native touch handlers. `locationX` is relative to the View, which
  // matches our `width` axis directly.
  const onTouchHandler = useCallback(
    (e: GestureResponderEvent | NativeSyntheticEvent<NativeTouchEvent>) => {
      updateFromX(e.nativeEvent.locationX);
    },
    [updateFromX]
  );

  const defs = renderGradientDefs([baseFill.def, activeFill.def]);

  const svgWithRenderer = (
    <Svg width={width} height={height}>
      {defs}
      <Renderer
        samples={processed}
        width={width}
        height={height}
        color={baseFill.fill}
        barWidth={barWidth}
        gap={gap}
        rounded={rounded}
        baseline={baseline}
        strokeWidth={strokeWidth}
        fillOpacity={fillOpacity}
        activeIndex={interactive ? activeIndex : null}
        activeColor={interactive ? activeFill.fill : undefined}
        activeScale={activeScale}
        activePushRange={activePushRange}
        activeTransitionMs={activeTransitionMs}
      />
    </Svg>
  );

  if (!interactive) {
    return svgWithRenderer;
  }

  return (
    <View
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={containerRef as any}
      style={{ width, height }}
      // Native: track touch / drag. Responder catches touches anywhere
      // inside, including taps on bars or the area path (events bubble).
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={onTouchHandler}
      onResponderMove={onTouchHandler}
      onResponderRelease={clearActive}
      onResponderTerminate={clearActive}
      // Web: track hover. Mouse events on inner SVG / bars bubble up to
      // the container, so a single listener here covers everything.
      {...({
        onMouseMove,
        onMouseLeave: clearActive,
      } as unknown as object)}>
      {svgWithRenderer}
    </View>
  );
};
