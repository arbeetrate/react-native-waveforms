import { jest } from '@jest/globals';

jest.mock('react-native-reanimated', () => {
  const noop = () => {};
  const sharedValue = (initial: unknown) => ({ value: initial });
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: <T>(Component: T): T => Component,
    },
    useSharedValue: sharedValue,
    useAnimatedProps: (worklet: () => unknown) => {
      try {
        return worklet();
      } catch {
        return {};
      }
    },
    useAnimatedStyle: (worklet: () => unknown) => {
      try {
        return worklet();
      } catch {
        return {};
      }
    },
    withTiming: (target: unknown) => target,
    withSpring: (target: unknown) => target,
    cancelAnimation: noop,
    runOnJS: <Fn extends (...args: unknown[]) => unknown>(fn: Fn) => fn,
    runOnUI: <Fn extends (...args: unknown[]) => unknown>(fn: Fn) => fn,
    Easing: { linear: noop, ease: noop, inOut: () => noop },
  };
});
