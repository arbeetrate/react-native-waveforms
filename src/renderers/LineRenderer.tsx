import { useMemo } from 'react';
import { Path } from 'react-native-svg';
import type { RendererProps } from '../types';
import { buildMirroredPath } from '../utils/buildWaveformPath';

export const LineRenderer = ({
  samples,
  width,
  height,
  color,
  strokeWidth = 1.5,
}: RendererProps) => {
  const d = useMemo(
    () => buildMirroredPath(samples, { width, height, closed: false }),
    [samples, width, height]
  );

  if (!d) return null;

  return (
    <Path
      d={d}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
};
