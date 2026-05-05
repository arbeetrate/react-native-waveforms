import { useCallback, useState } from 'react';

/** Maps an X coordinate inside a waveform of `width` px wide and
 * containing `count` evenly-spaced samples to the matching sample index.
 * Returns `null` when the pointer is off the edges. Shared by
 * `<Waveform>`'s hover overlay and `<PlayerWaveform>`'s scrub overlay. */
export const useActiveIndexFromX = (count: number, width: number) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const updateFromX = useCallback(
    (x: number) => {
      if (count === 0 || width <= 0) {
        setActiveIndex(null);
        return;
      }
      if (x < 0 || x > width) {
        setActiveIndex(null);
        return;
      }
      const slot = width / count;
      let idx = Math.floor(x / slot);
      if (idx < 0) idx = 0;
      if (idx >= count) idx = count - 1;
      setActiveIndex(idx);
    },
    [count, width]
  );

  const clearActive = useCallback(() => setActiveIndex(null), []);

  return { activeIndex, updateFromX, clearActive };
};
