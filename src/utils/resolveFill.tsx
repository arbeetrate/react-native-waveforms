import { Fragment, type ReactNode } from 'react';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import type { WaveformColor } from '../types';
import { normalizeStops } from './gradient';

export type ResolvedFill = {
  /** SVG `fill` / `stroke` value: either a literal color or `url(#id)`. */
  fill: string;
  /** Gradient definition node to mount inside `<Defs>`, or `null`. */
  def: ReactNode | null;
};

const FALLBACK = 'transparent';

export const resolveFill = (
  color: WaveformColor | undefined,
  id: string
): ResolvedFill => {
  if (color === undefined) return { fill: FALLBACK, def: null };
  if (typeof color === 'string') return { fill: color, def: null };
  if (color.type !== 'linear') return { fill: FALLBACK, def: null };

  const stops = normalizeStops(color);
  if (stops.length === 0) return { fill: FALLBACK, def: null };

  const horizontal = (color.direction ?? 'horizontal') === 'horizontal';
  const x2 = horizontal ? '100%' : '0%';
  const y2 = horizontal ? '0%' : '100%';

  return {
    fill: `url(#${id})`,
    def: (
      <LinearGradient id={id} x1="0%" y1="0%" x2={x2} y2={y2}>
        {stops.map((s, i) => (
          <Stop
            key={i}
            offset={s.offset}
            stopColor={s.color}
            stopOpacity={s.opacity}
          />
        ))}
      </LinearGradient>
    ),
  };
};

/** Render `<Defs>` containing each non-null gradient definition, or `null`
 * when no fills need a `<Defs>` block. The returned node still needs to be
 * mounted inside an `<Svg>` parent. */
export const renderGradientDefs = (
  defs: readonly (ReactNode | null)[],
  extraDefs?: ReactNode
): ReactNode => {
  const present = defs.filter((d): d is ReactNode => d !== null);
  if (present.length === 0 && !extraDefs) return null;
  return (
    <Defs>
      {present.map((d, i) => (
        <Fragment key={i}>{d}</Fragment>
      ))}
      {extraDefs}
    </Defs>
  );
};
