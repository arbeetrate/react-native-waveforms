import { useMemo } from 'react';
import Svg from 'react-native-svg';
import type { WaveformProps } from '../types';
import { builtInRenderers } from '../renderers';
import { downsamplePeak } from '../utils/downsample';
import { normalize } from '../utils/normalize';

const DEFAULT_COLOR = '#000';
const DEFAULT_GAP = 1;

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
}: WaveformProps) => {
  const processed = useMemo(() => {
    const normalized = normalize(samples, inputRange);
    if (barWidth !== undefined && barWidth > 0) {
      const stride = barWidth + gap;
      const capacity = Math.max(1, Math.floor((width + gap) / stride));
      if (normalized.length > capacity) {
        return downsamplePeak(normalized, capacity);
      }
    }
    return normalized;
  }, [samples, inputRange, barWidth, gap, width]);

  const Renderer =
    typeof renderer === 'function' ? renderer : builtInRenderers[renderer];

  return (
    <Svg width={width} height={height}>
      <Renderer
        samples={processed}
        width={width}
        height={height}
        color={color}
        barWidth={barWidth}
        gap={gap}
        rounded={rounded}
        baseline={baseline}
        strokeWidth={strokeWidth}
        fillOpacity={fillOpacity}
      />
    </Svg>
  );
};
