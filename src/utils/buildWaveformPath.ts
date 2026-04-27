type BuildOptions = {
  width: number;
  height: number;
  closed: boolean;
};

const formatNumber = (n: number): string => {
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2);
};

export const buildMirroredPath = (
  samples: readonly number[],
  { width, height, closed }: BuildOptions
): string => {
  const n = samples.length;
  if (n === 0 || width <= 0 || height <= 0) return '';

  const half = height / 2;
  const stride = n === 1 ? 0 : width / (n - 1);

  let d = '';

  for (let i = 0; i < n; i++) {
    const x = formatNumber(i * stride);
    const amp = samples[i] ?? 0;
    const y = formatNumber(half - amp * half);
    d += i === 0 ? `M${x} ${y}` : `L${x} ${y}`;
  }

  if (closed) {
    for (let i = n - 1; i >= 0; i--) {
      const x = formatNumber(i * stride);
      const amp = samples[i] ?? 0;
      const y = formatNumber(half + amp * half);
      d += `L${x} ${y}`;
    }
    d += 'Z';
  } else {
    for (let i = n - 1; i >= 0; i--) {
      const x = formatNumber(i * stride);
      const amp = samples[i] ?? 0;
      const y = formatNumber(half + amp * half);
      d += i === n - 1 ? `M${x} ${y}` : `L${x} ${y}`;
    }
  }

  return d;
};
