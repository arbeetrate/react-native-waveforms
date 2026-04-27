import { describe, expect, it } from '@jest/globals';
import * as api from '../index';

describe('public API', () => {
  it('exports Waveform, PlayerWaveform and built-in renderers', () => {
    expect(typeof api.Waveform).toBe('function');
    expect(typeof api.PlayerWaveform).toBe('function');
    expect(typeof api.BarsRenderer).toBe('function');
    expect(typeof api.LineRenderer).toBe('function');
    expect(typeof api.AreaRenderer).toBe('function');
  });
});
