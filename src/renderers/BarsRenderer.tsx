import { Fragment } from 'react';
import { Rect } from 'react-native-svg';
import type { RendererProps } from '../types';

export const BarsRenderer = ({
  samples,
  width,
  height,
  color,
  barWidth,
  gap = 1,
  rounded = false,
  baseline = 'center',
  activeIndex,
  activeColor,
  activeScale,
  activePushRange,
  activeTransitionMs,
}: RendererProps) => {
  const count = samples.length;
  if (count === 0 || width <= 0 || height <= 0) return null;

  const computedBarWidth = Math.max(
    0,
    barWidth ?? Math.max(1, (width - (count - 1) * gap) / count)
  );
  const stride = computedBarWidth + gap;
  const radius =
    rounded === true ? computedBarWidth / 2 : rounded === false ? 0 : rounded;

  const hoverEnabled = activeColor !== undefined;
  const transitionMs =
    hoverEnabled && activeTransitionMs && activeTransitionMs > 0
      ? activeTransitionMs
      : 0;

  // CSS transition is web-only; RNW forwards `style` to the SVG element so
  // the fill / width / x changes animate smoothly. Native ignores it
  // (snaps to the new geometry). Modern browsers treat `x` and `width` on
  // <rect> as CSS geometric properties so they animate via transition.
  const hoverStyle =
    transitionMs > 0
      ? ({
          transition: `x ${transitionMs}ms ease, width ${transitionMs}ms ease, fill ${transitionMs}ms ease`,
          cursor: 'pointer',
        } as unknown as object)
      : undefined;

  const scaleFactor =
    hoverEnabled && activeScale && activeScale > 0 ? activeScale : 1;
  // When scale is on we auto-enable a 4-bar push range unless the caller
  // overrode it (including with 0 to disable).
  const pushRange =
    activePushRange !== undefined
      ? Math.max(0, activePushRange)
      : scaleFactor > 1
        ? 4
        : 0;
  // Half the active bar's growth is the maximum displacement applied to an
  // immediate neighbour; further bars get a linear share of that.
  const maxPush =
    scaleFactor > 1 ? (computedBarWidth * (scaleFactor - 1)) / 2 : 0;

  return (
    <Fragment>
      {samples.map((amplitude, i) => {
        const h = Math.max(0, amplitude * height);
        const y = baseline === 'bottom' ? height - h : (height - h) / 2;
        const baseX = i * stride;
        const isActive = hoverEnabled && activeIndex === i;

        let renderX = baseX;
        let bw = computedBarWidth;

        if (isActive) {
          bw = computedBarWidth * scaleFactor;
          renderX = baseX - (bw - computedBarWidth) / 2;
        } else if (
          hoverEnabled &&
          activeIndex !== null &&
          activeIndex !== undefined &&
          maxPush > 0 &&
          pushRange > 0
        ) {
          const dist = Math.abs(i - activeIndex);
          if (dist >= 1 && dist <= pushRange) {
            // Linear decay: dist=1 → full maxPush, dist=pushRange → 1/pushRange.
            const factor = (pushRange - dist + 1) / pushRange;
            const direction = i < activeIndex ? -1 : 1;
            renderX = baseX + direction * maxPush * factor;
          }
        }

        const fill = isActive && activeColor ? activeColor : color;
        return (
          <Rect
            key={i}
            x={renderX}
            y={y}
            width={bw}
            height={h}
            rx={radius}
            ry={radius}
            fill={fill}
            {...(hoverStyle ? { style: hoverStyle } : {})}
          />
        );
      })}
    </Fragment>
  );
};
