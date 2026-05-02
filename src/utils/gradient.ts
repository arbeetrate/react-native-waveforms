import type { LinearGradientSpec } from '../types';

export type NormalizedStop = {
  offset: number;
  color: string;
  opacity: number;
};

/** Resolve a gradient spec into a sorted, opacity-normalized stop list.
 * Honours `stops` first, then `from`/`to` shorthand. Returns `[]` when
 * neither is provided. */
export const normalizeStops = (
  spec: LinearGradientSpec
): readonly NormalizedStop[] => {
  if (spec.stops && spec.stops.length > 0) {
    return spec.stops
      .map((s) => ({
        offset: s.offset,
        color: s.color,
        opacity: s.opacity ?? 1,
      }))
      .slice()
      .sort((a, b) => a.offset - b.offset);
  }
  if (spec.from !== undefined && spec.to !== undefined) {
    return [
      { offset: 0, color: spec.from, opacity: 1 },
      { offset: 1, color: spec.to, opacity: 1 },
    ];
  }
  return [];
};

type RGBA = { r: number; g: number; b: number; a: number };

/** Parse a CSS color string into RGBA components. Supports `#rgb`,
 * `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb(...)`, and `rgba(...)`. Returns
 * `null` for any other format (named colors, `hsl(...)`, etc.). */
const parseColor = (input: string): RGBA | null => {
  const s = input.trim().toLowerCase();
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (!/^[0-9a-f]+$/.test(hex)) return null;
    if (hex.length === 3 || hex.length === 4) {
      return {
        r: parseInt(hex[0]! + hex[0]!, 16),
        g: parseInt(hex[1]! + hex[1]!, 16),
        b: parseInt(hex[2]! + hex[2]!, 16),
        a: hex.length === 4 ? parseInt(hex[3]! + hex[3]!, 16) / 255 : 1,
      };
    }
    if (hex.length === 6 || hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
      };
    }
    return null;
  }
  const m = /^rgba?\s*\(\s*([^)]+)\)$/.exec(s);
  if (m) {
    const parts = m[1]!.split(',').map((p) => parseFloat(p.trim()));
    if (
      (parts.length === 3 || parts.length === 4) &&
      parts.every(Number.isFinite)
    ) {
      return {
        r: parts[0]!,
        g: parts[1]!,
        b: parts[2]!,
        a: parts.length === 4 ? parts[3]! : 1,
      };
    }
  }
  return null;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const formatRgba = (c: RGBA): string => {
  const r = Math.max(0, Math.min(255, Math.round(c.r)));
  const g = Math.max(0, Math.min(255, Math.round(c.g)));
  const b = Math.max(0, Math.min(255, Math.round(c.b)));
  const a = Math.max(0, Math.min(1, c.a));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/** Sample a flat color at position `t` (0..1) along a linear gradient.
 * Used by renderers that can only paint flat colors per element (e.g. the
 * recorder's `View`-based bars). Falls back to the nearest stop's raw
 * color string when a stop's color cannot be parsed. */
export const sampleGradientAt = (
  spec: LinearGradientSpec,
  t: number
): string => {
  const stops = normalizeStops(spec);
  if (stops.length === 0) return 'transparent';

  const tt = t < 0 ? 0 : t > 1 ? 1 : t;
  const first = stops[0]!;
  const last = stops[stops.length - 1]!;
  if (tt <= first.offset) return first.color;
  if (tt >= last.offset) return last.color;

  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1]!;
    const b = stops[i]!;
    if (tt > b.offset) continue;
    const span = b.offset - a.offset;
    const localT = span > 0 ? (tt - a.offset) / span : 0;
    const ca = parseColor(a.color);
    const cb = parseColor(b.color);
    if (!ca || !cb) return localT < 0.5 ? a.color : b.color;
    return formatRgba({
      r: lerp(ca.r, cb.r, localT),
      g: lerp(ca.g, cb.g, localT),
      b: lerp(ca.b, cb.b, localT),
      a: lerp(ca.a * a.opacity, cb.a * b.opacity, localT),
    });
  }
  return last.color;
};
