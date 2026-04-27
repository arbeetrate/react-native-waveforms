import { describe, expect, it } from '@jest/globals';
import { detectInputRange, normalize } from '../utils/normalize';

describe('detectInputRange', () => {
  it('returns [0, 1] when all samples are non-negative', () => {
    expect(detectInputRange([0, 0.5, 1])).toEqual([0, 1]);
  });

  it('returns [-1, 1] when any sample is negative', () => {
    expect(detectInputRange([0.5, -0.2, 0.9])).toEqual([-1, 1]);
  });

  it('returns [0, 1] for an empty array', () => {
    expect(detectInputRange([])).toEqual([0, 1]);
  });
});

describe('normalize', () => {
  it('clamps overshoots when range is [0, 1]', () => {
    expect(normalize([-0.1, 0, 0.5, 1, 1.2], [0, 1])).toEqual([
      0, 0, 0.5, 1, 1,
    ]);
  });

  it('passes through clean [0, 1] input via auto-detect', () => {
    expect(normalize([0, 0.25, 0.5, 1])).toEqual([0, 0.25, 0.5, 1]);
  });

  it('takes absolute value for [-1, 1] input', () => {
    expect(normalize([-1, -0.5, 0, 0.5, 1])).toEqual([1, 0.5, 0, 0.5, 1]);
  });

  it('maps a positive-only custom range linearly', () => {
    expect(normalize([0, 50, 100], [0, 100])).toEqual([0, 0.5, 1]);
  });

  it('returns zeros when range span is zero', () => {
    expect(normalize([5, 5, 5], [5, 5])).toEqual([0, 0, 0]);
  });

  it('respects an explicit inputRange that overrides auto-detection', () => {
    expect(normalize([0.5, -0.5], [0, 1])).toEqual([0.5, 0]);
  });
});
