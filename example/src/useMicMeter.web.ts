/// <reference lib="dom" />
import { useEffect, useState, type RefObject } from 'react';
import type { RecorderWaveformHandle } from 'react-native-waveforms';

export type MicMeterStatus = 'idle' | 'requesting' | 'active' | 'denied';

const TICK_MS = 50; // 20 Hz amplitude updates — matches typical mic-meter UX

// Wires the browser microphone (via Web Audio API) to a RecorderWaveform
// ref. Pushes RMS amplitude on a fixed interval while `isActive`.
export const useMicMeter = (
  ref: RefObject<RecorderWaveformHandle | null>,
  isActive: boolean
): MicMeterStatus => {
  const [status, setStatus] = useState<MicMeterStatus>('idle');

  useEffect(() => {
    if (!isActive) {
      setStatus('idle');
      return;
    }

    let audioContext: AudioContext | null = null;
    let stream: MediaStream | null = null;
    let analyser: AnalyserNode | null = null;
    let buffer: Uint8Array<ArrayBuffer> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    setStatus('requesting');

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);
        buffer = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));

        setStatus('active');

        intervalId = setInterval(() => {
          if (!analyser || !buffer) return;
          analyser.getByteTimeDomainData(buffer);
          // Compute RMS of the time-domain signal centred at 128.
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) {
            const v = (buffer[i]! - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / buffer.length);
          // Voice RMS sits around 0.05–0.3, so amplify a bit to fill the
          // 0..1 visual range without aggressive normalization.
          const amplified = rms * 4;
          ref.current?.push(amplified > 1 ? 1 : amplified);
        }, TICK_MS);
      } catch (err) {
        console.warn('Microphone access denied or unavailable:', err);
        setStatus('denied');
      }
    })();

    return () => {
      cancelled = true;
      if (intervalId !== null) clearInterval(intervalId);
      if (analyser) {
        try {
          analyser.disconnect();
        } catch {
          /* ignore */
        }
      }
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {
          /* ignore */
        });
      }
    };
  }, [isActive, ref]);

  return status;
};
