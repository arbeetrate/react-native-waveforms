import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Waveform } from 'react-native-waveforms';
import { sampleAmplitudes } from './sample-data';

const WIDTH = 320;
const HEIGHT = 80;

export default function App() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>react-native-waveforms</Text>
      <Text style={styles.subtitle}>Static renderers</Text>

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
});
