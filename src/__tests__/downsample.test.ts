import { describe, expect, it } from '@jest/globals';
import { downsamplePeak } from '../utils/downsample';

describe('downsamplePeak', () => {
  it('returns the input unchanged when samples.length <= targetCount', () => {
    expect(downsamplePeak([0.1, 0.2, 0.3], 5)).toEqual([0.1, 0.2, 0.3]);
  });

  it('returns an empty array when targetCount <= 0', () => {
    expect(downsamplePeak([0.1, 0.2], 0)).toEqual([]);
    expect(downsamplePeak([0.1, 0.2], -1)).toEqual([]);
  });

  it('fills with zeros when input is empty', () => {
    expect(downsamplePeak([], 4)).toEqual([0, 0, 0, 0]);
  });

  it('takes the peak per bucket when downsampling', () => {
    const input = [0.1, 0.9, 0.2, 0.4, 0.7, 0.3];
    expect(downsamplePeak(input, 3)).toEqual([0.9, 0.4, 0.7]);
  });

  it('produces an output of exactly targetCount length', () => {
    const input = Array.from({ length: 1000 }, (_, i) => i / 1000);
    expect(downsamplePeak(input, 50)).toHaveLength(50);
  });
});
