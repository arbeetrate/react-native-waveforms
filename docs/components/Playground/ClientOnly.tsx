'use client';
import { useEffect, useState, type ReactNode } from 'react';

/** Renders children only after first client render. Used to keep
 * react-native-reanimated / react-native-svg out of the Next.js SSR pass. */
export const ClientOnly = ({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? children : fallback}</>;
};
