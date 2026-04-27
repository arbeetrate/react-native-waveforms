import type { BuiltInRendererName, WaveformRenderer } from '../types';
import { AreaRenderer } from './AreaRenderer';
import { BarsRenderer } from './BarsRenderer';
import { LineRenderer } from './LineRenderer';

export { AreaRenderer, BarsRenderer, LineRenderer };

export const builtInRenderers: Record<BuiltInRendererName, WaveformRenderer> = {
  bars: BarsRenderer,
  line: LineRenderer,
  area: AreaRenderer,
};
