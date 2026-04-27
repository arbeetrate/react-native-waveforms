import { describe, expect, it } from '@jest/globals';
import { buildMirroredPath } from '../utils/buildWaveformPath';

describe('buildMirroredPath', () => {
  it('returns empty string for empty samples', () => {
    expect(
      buildMirroredPath([], { width: 100, height: 50, closed: false })
    ).toBe('');
  });

  it('returns empty string for non-positive dimensions', () => {
    expect(
      buildMirroredPath([0.5], { width: 0, height: 50, closed: false })
    ).toBe('');
    expect(
      buildMirroredPath([0.5], { width: 100, height: 0, closed: false })
    ).toBe('');
  });

  it('starts with M and uses L commands for the top edge', () => {
    const d = buildMirroredPath([0, 1, 0], {
      width: 100,
      height: 50,
      closed: false,
    });
    expect(d.startsWith('M')).toBe(true);
    expect(d).toContain('L');
  });

  it('closes the path with Z when closed=true', () => {
    const closed = buildMirroredPath([0, 1, 0], {
      width: 100,
      height: 50,
      closed: true,
    });
    const open = buildMirroredPath([0, 1, 0], {
      width: 100,
      height: 50,
      closed: false,
    });
    expect(closed.endsWith('Z')).toBe(true);
    expect(open.endsWith('Z')).toBe(false);
  });

  it('open path produces two M moves (top + bottom strokes)', () => {
    const d = buildMirroredPath([0, 1, 0], {
      width: 100,
      height: 50,
      closed: false,
    });
    const matches = d.match(/M/g) ?? [];
    expect(matches).toHaveLength(2);
  });

  it('peaks reach the top (y=0) and bottom (y=height) at amplitude 1', () => {
    const d = buildMirroredPath([1, 1], {
      width: 100,
      height: 50,
      closed: false,
    });
    expect(d).toContain('0'); // top edge y=0
    expect(d).toContain('50'); // bottom edge y=height
  });
});
