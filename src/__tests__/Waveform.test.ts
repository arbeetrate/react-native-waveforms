import { describe, expect, it } from '@jest/globals';
import * as api from '../index';

describe('public API', () => {
  it('exports all top-level components and built-in renderers', () => {
    expect(typeof api.Waveform).toBe('function');
    expect(typeof api.PlayerWaveform).toBe('function');
    expect(api.RecorderWaveform).toBeDefined();
    expect(typeof api.BarsRenderer).toBe('function');
    expect(typeof api.LineRenderer).toBe('function');
    expect(typeof api.AreaRenderer).toBe('function');
  });
});
