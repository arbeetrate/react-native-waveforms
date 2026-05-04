'use client';
import {
  ColorInput,
  NumberInput,
  Select,
  Slider,
  Switch,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { PlayerWaveform, type WaveformColor } from 'react-native-waveforms';
import { sampleAmplitudes } from '../sample-data';
import { ControlPanel, SliderField, Stage } from './shared';

const RENDERERS = ['bars', 'line', 'area'] as const;
const BASELINES = ['center', 'bottom'] as const;

export const PlayerPlayground = () => {
  const [renderer, setRenderer] = useState<(typeof RENDERERS)[number]>('bars');
  const [baseColor, setBaseColor] = useState('#9ca3af');
  const [progressColor, setProgressColor] = useState('#ffffff');
  const [progressGradient, setProgressGradient] = useState(false);
  const [progressGradientTo, setProgressGradientTo] = useState('#a855f7');
  const [gap, setGap] = useState(2);
  const [rounded, setRounded] = useState(true);
  const [baseline, setBaseline] =
    useState<(typeof BASELINES)[number]>('center');
  const [isPlaying, setIsPlaying] = useState(true);
  const [animationDuration, setAnimationDuration] = useState(200);
  const [progress, setProgress] = useState(0);
  const [durationMs, setDurationMs] = useState(4000);
  const [iteration, setIteration] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setTimeout(() => setIteration((i) => i + 1), durationMs + 400);
    return () => clearTimeout(id);
  }, [isPlaying, durationMs, iteration]);

  const resolvedProgressColor: WaveformColor = useMemo(
    () =>
      progressGradient
        ? { type: 'linear', from: progressColor, to: progressGradientTo }
        : progressColor,
    [progressGradient, progressColor, progressGradientTo]
  );

  return (
    <div>
      <Stage>
        <PlayerWaveform
          key={`${iteration}-${isPlaying}-${durationMs}`}
          samples={sampleAmplitudes}
          width={320}
          height={80}
          color={baseColor}
          progressColor={resolvedProgressColor}
          renderer={renderer}
          gap={gap}
          rounded={renderer === 'bars' ? rounded : false}
          baseline={renderer === 'bars' ? baseline : undefined}
          isPlaying={isPlaying}
          animationDuration={animationDuration}
          progress={isPlaying ? undefined : progress}
          positionMs={isPlaying ? 0 : undefined}
          durationMs={isPlaying ? durationMs : undefined}
        />
      </Stage>
      <ControlPanel>
        <Select
          label="renderer"
          description="Visual style of the underlying waveform"
          data={RENDERERS as readonly string[] as string[]}
          value={renderer}
          onChange={(v) => v && setRenderer(v as (typeof RENDERERS)[number])}
          allowDeselect={false}
        />
        <ColorInput
          label="color (track)"
          description="Colour of the un-played portion"
          value={baseColor}
          onChange={setBaseColor}
          format="hex"
        />
        <ColorInput
          label="progressColor"
          description="Colour of the played portion"
          value={progressColor}
          onChange={setProgressColor}
          format="hex"
        />
        <Switch
          label="progress gradient"
          description="Draw the progress fill as a gradient"
          checked={progressGradient}
          onChange={(e) => setProgressGradient(e.currentTarget.checked)}
        />
        {progressGradient && (
          <ColorInput
            label="gradient to"
            description="Right edge colour of the progress gradient"
            value={progressGradientTo}
            onChange={setProgressGradientTo}
            format="hex"
          />
        )}
        <SliderField
          label="gap"
          value={gap}
          description="Spacing between bars in px (bars renderer only)"
        >
          <Slider min={0} max={6} step={1} value={gap} onChange={setGap} />
        </SliderField>
        {renderer === 'bars' && (
          <>
            <Switch
              label="rounded"
              description="Round bar corners into pills"
              checked={rounded}
              onChange={(e) => setRounded(e.currentTarget.checked)}
            />
            <Select
              label="baseline"
              description="Vertical anchor"
              data={BASELINES as readonly string[] as string[]}
              value={baseline}
              onChange={(v) =>
                v && setBaseline(v as (typeof BASELINES)[number])
              }
              allowDeselect={false}
            />
          </>
        )}
        <Switch
          label="isPlaying"
          description="Animate progress to the end on the UI thread"
          checked={isPlaying}
          onChange={(e) => setIsPlaying(e.currentTarget.checked)}
        />
        {isPlaying ? (
          <NumberInput
            label="durationMs"
            description="Total audio length in ms"
            value={durationMs}
            onChange={(v) => typeof v === 'number' && setDurationMs(v)}
            min={500}
            max={10000}
            step={250}
          />
        ) : (
          <SliderField
            label="progress"
            value={progress.toFixed(2)}
            description="Manual scrub position when paused, 0..1"
          >
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={progress}
              onChange={setProgress}
            />
          </SliderField>
        )}
        <NumberInput
          label="animationDuration"
          description="Tween duration between progress values in ms (paused mode)"
          value={animationDuration}
          onChange={(v) => typeof v === 'number' && setAnimationDuration(v)}
          min={0}
          max={1000}
          step={20}
        />
      </ControlPanel>
    </div>
  );
};
