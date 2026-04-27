import Svg from 'react-native-svg';
import type { WaveformProps } from '../types';
import { useProcessedSamples } from '../hooks/useProcessedSamples';
import { builtInRenderers } from '../renderers';

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
  const processed = useProcessedSamples(samples, {
    width,
    inputRange,
    barWidth,
    gap,
  });

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
