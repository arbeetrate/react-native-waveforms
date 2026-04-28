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

  return (
    <Fragment>
      {samples.map((amplitude, i) => {
        const h = Math.max(0, amplitude * height);
        const y = baseline === 'bottom' ? height - h : (height - h) / 2;
        const x = i * stride;
        return (
          <Rect
            key={i}
            x={x}
            y={y}
            width={computedBarWidth}
            height={h}
            rx={radius}
            ry={radius}
            fill={color}
          />
        );
      })}
    </Fragment>
  );
};
