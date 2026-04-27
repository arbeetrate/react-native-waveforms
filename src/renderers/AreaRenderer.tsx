import { useMemo } from 'react';
import { Path } from 'react-native-svg';
import type { RendererProps } from '../types';
import { buildMirroredPath } from '../utils/buildWaveformPath';

export const AreaRenderer = ({
  samples,
  width,
  height,
  color,
  fillOpacity = 1,
}: RendererProps) => {
  const d = useMemo(
    () => buildMirroredPath(samples, { width, height, closed: true }),
    [samples, width, height]
  );

  if (!d) return null;

  return <Path d={d} fill={color} fillOpacity={fillOpacity} />;
};
