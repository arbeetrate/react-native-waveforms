'use client';
import {
  ColorInput,
  NumberInput,
  Select,
  Slider,
  Switch,
} from '@mantine/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  RecorderWaveform,
  type RecorderWaveformHandle,
  type WaveformColor,
} from 'react-native-waveforms';
import { ControlPanel, SliderField, Stage } from './shared';

const TRANSITIONS = ['scroll', 'morph'] as const;
const DIRECTIONS = ['right', 'left'] as const;
const BASELINES = ['center', 'bottom'] as const;

const TICK_MS = 200;
const FAKE_LEN = 240;

const fakeSamples: readonly number[] = (() => {
  const out = new Array<number>(FAKE_LEN);
  let r = 0x12abcd;
  for (let i = 0; i < FAKE_LEN; i++) {
    const env = 0.5 + 0.4 * Math.sin(i * 0.04);
    r = (r * 9301 + 49297) % 233280;
    const jitter = (r / 233280) * 0.4;
    out[i] = Math.round(Math.min(1, env * jitter + 0.05) * 100) / 100;
  }
  return out;
})();

export const RecorderPlayground = () => {
  const [baseColor, setBaseColor] = useState('#dc2626');
  const [useGradient, setUseGradient] = useState(false);
  const [gradientTo, setGradientTo] = useState('#7c3aed');
  const [transition, setTransition] =
    useState<(typeof TRANSITIONS)[number]>('scroll');
  const [direction, setDirection] =
    useState<(typeof DIRECTIONS)[number]>('right');
  const [transitionDuration, setTransitionDuration] = useState(200);
  const [barWidth, setBarWidth] = useState(3);
  const [gap, setGap] = useState(2);
  const [rounded, setRounded] = useState(true);
  const [baseline, setBaseline] =
    useState<(typeof BASELINES)[number]>('bottom');
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [smoothScroll, setSmoothScroll] = useState(true);
  const [running, setRunning] = useState(true);

  const ref = useRef<RecorderWaveformHandle>(null);

  const color: WaveformColor = useMemo(
    () =>
      useGradient
        ? { type: 'linear', from: baseColor, to: gradientTo }
        : baseColor,
    [useGradient, baseColor, gradientTo]
  );

  useEffect(() => {
    if (!running) return;
    let i = 0;
    const id = setInterval(() => {
      const sample = fakeSamples[i] as number;
      i = (i + 1) % FAKE_LEN;
      ref.current?.push(sample);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div>
      <Stage>
        <RecorderWaveform
          ref={ref}
          width={320}
          height={80}
          color={color}
          baseline={baseline}
          transition={transition}
          direction={direction}
          transitionDuration={transitionDuration}
          barWidth={barWidth}
          gap={gap}
          rounded={rounded}
          fadeIn={fadeIn}
          fadeOut={fadeOut}
          smoothScroll={smoothScroll}
        />
      </Stage>
      <ControlPanel>
        <Switch
          label="running"
          description="Push synthetic samples on a 200 ms interval"
          checked={running}
          onChange={(e) => setRunning(e.currentTarget.checked)}
        />
        <ColorInput
          label="color"
          description="Bar fill colour (or gradient stop A)"
          value={baseColor}
          onChange={setBaseColor}
          format="hex"
        />
        <Switch
          label="gradient fill"
          description="Sample a per-bar gradient along the x-axis"
          checked={useGradient}
          onChange={(e) => setUseGradient(e.currentTarget.checked)}
        />
        {useGradient && (
          <ColorInput
            label="gradient to"
            description="Far-edge colour of the gradient"
            value={gradientTo}
            onChange={setGradientTo}
            format="hex"
          />
        )}
        <Select
          label="transition"
          description="scroll slides bars; morph keeps them in place"
          data={TRANSITIONS as readonly string[] as string[]}
          value={transition}
          onChange={(v) =>
            v && setTransition(v as (typeof TRANSITIONS)[number])
          }
          allowDeselect={false}
        />
        <Select
          label="direction"
          description="Edge new samples enter from"
          data={DIRECTIONS as readonly string[] as string[]}
          value={direction}
          onChange={(v) => v && setDirection(v as (typeof DIRECTIONS)[number])}
          allowDeselect={false}
        />
        <Select
          label="baseline"
          description="Vertical anchor of the bars"
          data={BASELINES as readonly string[] as string[]}
          value={baseline}
          onChange={(v) => v && setBaseline(v as (typeof BASELINES)[number])}
          allowDeselect={false}
        />
        <NumberInput
          label="transitionDuration"
          description="Per-sample animation duration in ms"
          value={transitionDuration}
          onChange={(v) => typeof v === 'number' && setTransitionDuration(v)}
          min={50}
          max={1000}
          step={20}
        />
        <SliderField
          label="barWidth"
          value={barWidth}
          description="Bar width in px"
        >
          <Slider
            min={1}
            max={12}
            step={1}
            value={barWidth}
            onChange={setBarWidth}
          />
        </SliderField>
        <SliderField
          label="gap"
          value={gap}
          description="Spacing between bars in px"
        >
          <Slider min={0} max={6} step={1} value={gap} onChange={setGap} />
        </SliderField>
        <Switch
          label="rounded"
          description="Round bar corners into pills"
          checked={rounded}
          onChange={(e) => setRounded(e.currentTarget.checked)}
        />
        <SliderField
          label="fadeIn"
          value={fadeIn}
          description="Bars at the entry edge that fade in (alpha 0→1)"
        >
          <Slider
            min={0}
            max={8}
            step={1}
            value={fadeIn}
            onChange={setFadeIn}
          />
        </SliderField>
        <SliderField
          label="fadeOut"
          value={fadeOut}
          description="Bars at the exit edge that fade out (alpha 1→0)"
        >
          <Slider
            min={0}
            max={8}
            step={1}
            value={fadeOut}
            onChange={setFadeOut}
          />
        </SliderField>
        <Switch
          label="smoothScroll"
          description="Animate the wrapper translation in scroll mode"
          checked={smoothScroll}
          onChange={(e) => setSmoothScroll(e.currentTarget.checked)}
        />
      </ControlPanel>
    </div>
  );
};
