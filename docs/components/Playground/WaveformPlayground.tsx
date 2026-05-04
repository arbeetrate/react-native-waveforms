'use client';
import {
  ColorInput,
  NumberInput,
  Select,
  Slider,
  Switch,
} from '@mantine/core';
import { useMemo, useState } from 'react';
import { Waveform, type WaveformColor } from 'react-native-waveforms';
import { sampleAmplitudes } from '../sample-data';
import { ControlPanel, SliderField, Stage } from './shared';

const RENDERERS = ['bars', 'line', 'area'] as const;
const BASELINES = ['center', 'bottom'] as const;

export const WaveformPlayground = () => {
  const [renderer, setRenderer] = useState<(typeof RENDERERS)[number]>('bars');
  const [baseColor, setBaseColor] = useState('#9ca3af');
  const [useGradient, setUseGradient] = useState(false);
  const [gradientTo, setGradientTo] = useState('#a855f7');
  const [gap, setGap] = useState(2);
  const [rounded, setRounded] = useState(true);
  const [baseline, setBaseline] =
    useState<(typeof BASELINES)[number]>('center');
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [fillOpacity, setFillOpacity] = useState(0.85);
  const [activeOn, setActiveOn] = useState(true);
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [activeScale, setActiveScale] = useState(1.6);
  const [activeTransitionMs, setActiveTransitionMs] = useState(180);

  const color: WaveformColor = useMemo(
    () =>
      useGradient
        ? { type: 'linear', from: baseColor, to: gradientTo }
        : baseColor,
    [useGradient, baseColor, gradientTo]
  );

  const isBars = renderer === 'bars';
  const isLineOrArea = renderer === 'line' || renderer === 'area';

  return (
    <div>
      <Stage>
        <Waveform
          samples={sampleAmplitudes}
          width={320}
          height={80}
          color={color}
          renderer={renderer}
          gap={gap}
          rounded={isBars ? rounded : false}
          baseline={isBars ? baseline : undefined}
          strokeWidth={isLineOrArea ? strokeWidth : undefined}
          fillOpacity={renderer === 'area' ? fillOpacity : undefined}
          activeColor={activeOn ? activeColor : undefined}
          activeScale={activeOn && isBars ? activeScale : undefined}
          activeTransitionMs={activeTransitionMs}
        />
      </Stage>
      <ControlPanel>
        <Select
          label="renderer"
          description="Visual style: bars, line or filled area"
          data={RENDERERS as readonly string[] as string[]}
          value={renderer}
          onChange={(v) => v && setRenderer(v as (typeof RENDERERS)[number])}
          allowDeselect={false}
        />
        <ColorInput
          label="color"
          description="Base fill / stroke colour"
          value={baseColor}
          onChange={setBaseColor}
          format="hex"
        />
        <Switch
          label="gradient fill"
          description="Toggle a linear gradient instead of a flat colour"
          checked={useGradient}
          onChange={(e) => setUseGradient(e.currentTarget.checked)}
        />
        {useGradient && (
          <ColorInput
            label="gradient to"
            description="Right edge colour of the linear gradient"
            value={gradientTo}
            onChange={setGradientTo}
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
        {isBars && (
          <>
            <Switch
              label="rounded"
              description="Round bar corners into pills"
              checked={rounded}
              onChange={(e) => setRounded(e.currentTarget.checked)}
            />
            <Select
              label="baseline"
              description="Vertical anchor: centred or sitting on the bottom"
              data={BASELINES as readonly string[] as string[]}
              value={baseline}
              onChange={(v) =>
                v && setBaseline(v as (typeof BASELINES)[number])
              }
              allowDeselect={false}
            />
          </>
        )}
        {isLineOrArea && (
          <SliderField
            label="strokeWidth"
            value={strokeWidth}
            description="Path stroke thickness in px"
          >
            <Slider
              min={0.5}
              max={6}
              step={0.5}
              value={strokeWidth}
              onChange={setStrokeWidth}
            />
          </SliderField>
        )}
        {renderer === 'area' && (
          <SliderField
            label="fillOpacity"
            value={fillOpacity.toFixed(2)}
            description="Area fill transparency, 0..1"
          >
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={fillOpacity}
              onChange={setFillOpacity}
            />
          </SliderField>
        )}
        <Switch
          label="hover / tap on"
          description="Highlight the sample under the cursor (web) or finger (native)"
          checked={activeOn}
          onChange={(e) => setActiveOn(e.currentTarget.checked)}
        />
        {activeOn && (
          <>
            <ColorInput
              label="activeColor"
              description="Colour of the highlighted sample"
              value={activeColor}
              onChange={setActiveColor}
              format="hex"
            />
            {isBars && (
              <SliderField
                label="activeScale"
                value={activeScale.toFixed(1)}
                description="Width multiplier for the active bar (1 = no scale)"
              >
                <Slider
                  min={1}
                  max={3}
                  step={0.1}
                  value={activeScale}
                  onChange={setActiveScale}
                />
              </SliderField>
            )}
            <NumberInput
              label="activeTransitionMs"
              description="CSS transition duration on web; native snaps"
              value={activeTransitionMs}
              onChange={(v) =>
                typeof v === 'number' && setActiveTransitionMs(v)
              }
              min={0}
              max={1000}
              step={20}
            />
          </>
        )}
      </ControlPanel>
    </div>
  );
};
