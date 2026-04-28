import type { RefObject } from 'react';
import type { RecorderWaveformHandle } from 'react-native-waveforms';

// Native stub — microphone metering is implemented in `.web.tsx`.
// On iOS / Android this would use expo-av or a native audio module; not
// wired up in this example.
export type MicMeterStatus = 'idle' | 'requesting' | 'active' | 'denied';

export const useMicMeter = (
  _ref: RefObject<RecorderWaveformHandle | null>,
  _isActive: boolean
): MicMeterStatus => 'idle';
