import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  PlayerWaveform,
  RecorderWaveform,
  Waveform,
  type RecorderWaveformHandle,
} from 'react-native-waveforms';
import { sampleAmplitudes } from './sample-data';
import { useMicMeter } from './useMicMeter';

const WIDTH = 320;
const HEIGHT = 80;

const useLoopingPlayback = (durationMs = 4000) => {
  const [iteration, setIteration] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setIteration((i) => i + 1), durationMs + 400);
    return () => clearTimeout(id);
  }, [iteration, durationMs]);
  return { iteration, durationMs };
};

// Pre-generated, deterministic, finite cycle of fake amplitudes — reused
// forever by the shared meter so we never allocate per-tick and `i` never
// grows beyond the buffer length.
const FAKE_METER_LEN = 240;
const FAKE_METER_TICK_MS = 200;
const fakeSamples: readonly number[] = (() => {
  const out = new Array<number>(FAKE_METER_LEN);
  let r = 1234567;
  for (let i = 0; i < FAKE_METER_LEN; i++) {
    const envelope = 0.5 + 0.4 * Math.sin(i * 0.04);
    r = (r * 9301 + 49297) % 233280;
    const jitter = (r / 233280) * 0.4;
    out[i] = Math.round(Math.min(1, envelope * jitter + 0.05) * 100) / 100;
  }
  return out;
})();

// One interval, broadcast to many recorders. Cycles the pre-generated
// buffer so RAM stays flat for as long as the example is open.
const useSharedFakeMeter = (
  refs: readonly React.RefObject<RecorderWaveformHandle | null>[]
) => {
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      const sample = fakeSamples[i] as number;
      i = (i + 1) % FAKE_METER_LEN;
      for (let r = 0; r < refs.length; r++) {
        refs[r]!.current?.push(sample);
      }
    }, FAKE_METER_TICK_MS);
    return () => clearInterval(id);
  }, [refs]);
};

export default function App() {
  const { iteration, durationMs } = useLoopingPlayback(4000);
  const recorderRef = useRef<RecorderWaveformHandle>(null);
  const morphRecorderRef = useRef<RecorderWaveformHandle>(null);
  const leftRecorderRef = useRef<RecorderWaveformHandle>(null);
  const noPrefillRecorderRef = useRef<RecorderWaveformHandle>(null);
  const fadeScrollRef = useRef<RecorderWaveformHandle>(null);
  const fadeMorphRef = useRef<RecorderWaveformHandle>(null);
  const micRecorderRef = useRef<RecorderWaveformHandle>(null);
  const [isMicActive, setIsMicActive] = useState(false);
  const micStatus = useMicMeter(micRecorderRef, isMicActive);
  const toggleMic = useCallback(() => {
    setIsMicActive((v) => {
      const next = !v;
      if (!next) micRecorderRef.current?.reset();
      return next;
    });
  }, []);
  const meterRefs = useMemo(
    () => [
      recorderRef,
      morphRecorderRef,
      leftRecorderRef,
      noPrefillRecorderRef,
      fadeScrollRef,
      fadeMorphRef,
    ],
    []
  );
  useSharedFakeMeter(meterRefs);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>react-native-waveforms</Text>
      <Text style={styles.subtitle}>Static + player renderers</Text>

      <Demo label="bars (centered)">
        <Waveform
          samples={sampleAmplitudes}
          width={WIDTH}
          height={HEIGHT}
          color="#2563eb"
          gap={2}
          rounded
        />
      </Demo>

      <Demo label="bars · hover / tap (web + native)">
        <Waveform
          samples={sampleAmplitudes}
          width={WIDTH}
          height={HEIGHT}
          color="#2563eb"
          activeColor="#f97316"
          activeScale={1.8}
          activeTransitionMs={180}
          gap={2}
          rounded
        />
      </Demo>

      <Demo label="bars (baseline=bottom)">
        <Waveform
          samples={sampleAmplitudes}
          width={WIDTH}
          height={HEIGHT}
          color="#0f766e"
          barWidth={4}
          gap={2}
          rounded
          baseline="bottom"
        />
      </Demo>

      <Demo label="line">
        <Waveform
          samples={sampleAmplitudes}
          width={WIDTH}
          height={HEIGHT}
          renderer="line"
          color="#dc2626"
          strokeWidth={1.5}
        />
      </Demo>

      <Demo label="area">
        <Waveform
          samples={sampleAmplitudes}
          width={WIDTH}
          height={HEIGHT}
          renderer="area"
          color="#7c3aed"
          fillOpacity={0.85}
        />
      </Demo>

      <Demo label="area · hover / tap (web + native)">
        <Waveform
          samples={sampleAmplitudes}
          width={WIDTH}
          height={HEIGHT}
          renderer="area"
          color="#7c3aed"
          fillOpacity={0.7}
          activeColor="#f97316"
          activeTransitionMs={150}
        />
      </Demo>

      <Demo label="player · bars (UI-thread playback)">
        <PlayerWaveform
          key={`bars-${iteration}`}
          samples={sampleAmplitudes}
          width={WIDTH}
          height={HEIGHT}
          color="#cbd5e1"
          progressColor="#2563eb"
          gap={2}
          rounded
          isPlaying
          positionMs={0}
          durationMs={durationMs}
        />
      </Demo>

      <Demo label="player · area (UI-thread playback)">
        <PlayerWaveform
          key={`area-${iteration}`}
          samples={sampleAmplitudes}
          width={WIDTH}
          height={HEIGHT}
          renderer="area"
          color="#e9d5ff"
          progressColor="#7c3aed"
          isPlaying
          positionMs={0}
          durationMs={durationMs}
        />
      </Demo>

      <Demo label="recorder · live samples (scroll)">
        <RecorderWaveform
          ref={recorderRef}
          width={WIDTH}
          height={HEIGHT}
          color="#dc2626"
          baseline="bottom"
          transitionDuration={200}
          barWidth={3}
          gap={2}
          rounded
        />
      </Demo>

      <Demo label="recorder · live samples (morph)">
        <RecorderWaveform
          ref={morphRecorderRef}
          width={WIDTH}
          height={HEIGHT}
          color="#0f766e"
          baseline="bottom"
          transition="morph"
          transitionDuration={300}
          barWidth={3}
          gap={2}
          rounded
        />
      </Demo>

      <Demo label="recorder · scroll, direction=left">
        <RecorderWaveform
          ref={leftRecorderRef}
          width={WIDTH}
          height={HEIGHT}
          color="#7c3aed"
          baseline="bottom"
          direction="left"
          transitionDuration={200}
          barWidth={3}
          gap={2}
          rounded
        />
      </Demo>

      <Demo label="recorder · scroll, prefill=false (legacy)">
        <RecorderWaveform
          ref={noPrefillRecorderRef}
          width={WIDTH}
          height={HEIGHT}
          color="#0891b2"
          baseline="bottom"
          prefill={false}
          transitionDuration={200}
          barWidth={3}
          gap={2}
          rounded
        />
      </Demo>

      <Demo label="recorder · scroll, fadeIn=4 fadeOut=4">
        <RecorderWaveform
          ref={fadeScrollRef}
          width={WIDTH}
          height={HEIGHT}
          color="#ea580c"
          baseline="bottom"
          fadeIn={4}
          fadeOut={4}
          transitionDuration={200}
          barWidth={3}
          gap={2}
          rounded
        />
      </Demo>

      <Demo label="recorder · morph, fadeIn=3 fadeOut=3">
        <RecorderWaveform
          ref={fadeMorphRef}
          width={WIDTH}
          height={HEIGHT}
          color="#db2777"
          baseline="bottom"
          transition="morph"
          fadeIn={4}
          fadeOut={4}
          transitionDuration={300}
          barWidth={3}
          gap={2}
          rounded
        />
      </Demo>

      <Demo label="recorder · live microphone (web)">
        <RecorderWaveform
          ref={micRecorderRef}
          width={WIDTH}
          height={HEIGHT}
          color="#16a34a"
          baseline="bottom"
          transitionDuration={120}
          barWidth={3}
          gap={2}
          rounded
        />
        <Pressable onPress={toggleMic} style={styles.micButton}>
          <Text style={styles.micButtonText}>
            {isMicActive ? 'Stop microphone' : 'Start microphone'}
          </Text>
        </Pressable>
        <Text style={styles.micStatus}>
          {micStatus === 'requesting'
            ? 'Requesting microphone permission…'
            : micStatus === 'denied'
              ? 'Microphone access denied or unavailable.'
              : micStatus === 'active'
                ? 'Listening — speak into your mic.'
                : 'Tap Start to capture live audio.'}
        </Text>
      </Demo>
    </ScrollView>
  );
}

type DemoProps = {
  label: string;
  children: React.ReactNode;
};

const Demo = ({ label, children }: DemoProps) => (
  <View style={styles.card}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 64,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
    fontFamily: 'monospace',
  },
  micButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#16a34a',
    marginTop: 4,
  },
  micButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  micStatus: {
    fontSize: 12,
    opacity: 0.7,
  },
});
