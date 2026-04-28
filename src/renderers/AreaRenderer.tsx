import { Fragment, useMemo } from 'react';
import { Line, Path } from 'react-native-svg';
import type { RendererProps } from '../types';
import { buildMirroredPath } from '../utils/buildWaveformPath';

export const AreaRenderer = ({
  samples,
  width,
  height,
  color,
  fillOpacity = 1,
  activeIndex,
  activeColor,
  activeTransitionMs,
}: RendererProps) => {
  const d = useMemo(
    () => buildMirroredPath(samples, { width, height, closed: true }),
    [samples, width, height]
  );

  if (!d) return null;

  const count = samples.length;
  const showMarker =
    activeColor !== undefined &&
    activeIndex !== null &&
    activeIndex !== undefined &&
    activeIndex >= 0 &&
    activeIndex < count;

  const slot = count > 0 ? width / count : 0;
  const markerX = showMarker ? (activeIndex + 0.5) * slot : 0;

  // CSS transition pass-through for smooth hover on web. We animate the
  // line's `x1`/`x2` indirectly via the SVG repositioning each frame, but
  // the opacity transition smooths the appear / disappear cycle.
  const lineStyle =
    activeColor && activeTransitionMs && activeTransitionMs > 0
      ? ({
          transition: `opacity ${activeTransitionMs}ms ease`,
        } as unknown as object)
      : undefined;

  return (
    <Fragment>
      <Path d={d} fill={color} fillOpacity={fillOpacity} />
      {showMarker && activeColor && (
        <Line
          x1={markerX}
          x2={markerX}
          y1={0}
          y2={height}
          stroke={activeColor}
          strokeWidth={1}
          opacity={0.7}
          {...(lineStyle ? { style: lineStyle } : {})}
        />
      )}
    </Fragment>
  );
};
