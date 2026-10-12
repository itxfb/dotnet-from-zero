/** Day 8 storyboard: "Methods" (timed from cues in script.json). */
import React from 'react';
import {CookingPot, Egg, Utensils, Wheat} from 'lucide-react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from '../../components/Captions';
import {CodeAnatomy} from '../../components/Concepts';
import {cs, Editor, editorKeyFrames, EdLine, SYN2} from '../../components/Editor';
import {EndCard} from '../../components/EndCard';
import {FloatingChips} from '../../components/FloatingChips';
import {Direction} from '../../components/instructor/Instructor';
import {Module, Tag} from '../../components/Module';
import {SeriesBadge} from '../../components/SeriesBadge';
import {Studio} from '../../components/Studio';
import {Sfx, ShotKey, ShotProvider, Within} from '../../engine/direction';
import {CueRef, getScene, resolveCue, useTimeline, windowed} from '../../engine/timeline';
import {CONCEPT} from '../../theme';

const useCues = () => {
  const tl = useTimeline();
  return {c: (r: CueRef) => resolveCue(tl, r), scene: (id: string) => getScene(tl, id)};
};

const SY = [560, 700, 840];

const RecipeCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {c, scene} = useCues();
  const life = scene('life');
  const steps = [
    {label: '1. Mix', Icon: Wheat, at: c('once')},
    {label: '2. Bake', Icon: CookingPot, at: c('once+12')},
    {label: '3. Serve', Icon: Utensils, at: c('once+24')},
  ];
  return (
    <>
      <Module x={540} y={380} w={440} h={130} tone="aspnet" label="recipe card" Icon={Egg} appear={c('card')} exit={life.to - 12} />
      {steps.map((s, i) => (
        <Module
          key={s.label}
          x={540}
          y={SY[i]}
          w={560}
          h={110}
          tone="aspnet"
          variant="flat"
          align="left"
          label={s.label}
          Icon={s.Icon}
          appear={s.at}
          exit={life.to - 12 + i * 2}
          glow={windowed(frame, s.at, s.at + 40, 4, 8)}
        />
      ))}
      <Tag x={540} y={980} at={c('use+12')} exit={life.to - 12} text="use it any time!" color={CONCEPT.csharp.main} size={40} />
    </>
  );
};

const Recap: React.FC = () => {
  const {c, scene} = useCues();
  const recap = scene('recap');
  return (
    <>
      <CodeAnatomy
        y={420}
        fontSize={64}
        appear={recap.from + 4}
        exit={recap.to - 8}
        parts={[
          {text: 'SayHi', color: SYN2.method, label: 'the method', tone: 'dotnet', at: c('rMethod')},
          {text: '(', color: SYN2.punct},
          {text: ')', color: SYN2.punct},
          {text: ';', color: SYN2.punct},
        ]}
      />
      <Module x={300} y={820} w={380} h={120} tone="str" label="Hi!" appear={c('rCall')} exit={recap.to - 8} />
      <Module x={780} y={820} w={380} h={120} tone="str" label="Hi!" appear={c('rCall+16')} exit={recap.to - 8} />
      <Tag x={540} y={990} at={c('rCall')} exit={recap.to - 8} text="call it again and again" color={CONCEPT.csharp.main} size={44} />
    </>
  );
};

export const Day08: React.FC = () => {
  const {c, scene} = useCues();
  const life = scene('life');
  const code = scene('code');
  const recap = scene('recap');
  const outro = scene('outro');

  const shots: ShotKey[] = [
    {at: 0, shot: 'hero'},
    {at: life.from - 6, shot: 'teach', dur: 26},
    {at: code.from - 6, shot: 'code', dur: 28},
    {at: recap.from - 6, shot: 'teach', dur: 26},
    {at: outro.from - 6, shot: 'outro', dur: 28},
  ];

  const lines: EdLine[] = [
    {tokens: cs('static void SayHi()'), typeAt: c('line:decl') + 8, speed: 0.9},
    {tokens: cs('{'), typeAt: 'chain', speed: 0.9},
    {tokens: cs('    Console.WriteLine("Hi!");'), typeAt: c('line:body') + 2, speed: 0.9},
    {tokens: cs('}'), typeAt: 'chain', speed: 0.9},
    {tokens: cs('SayHi();'), typeAt: c('line:call1') + 2, speed: 0.9},
    {tokens: cs('SayHi();'), typeAt: c('line:call2') + 2, speed: 0.9},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'again', pose: 'shrug'},
      {at: 'better', pose: 'explain'},
      {at: 'day8', pose: 'wave'},
      {at: life.from, pose: 'explain'},
      {at: 'card', pose: {point: [540, 380]}},
      {at: 'once', pose: {point: [540, 560]}},
      {at: 'once+12', pose: {point: [540, 700]}},
      {at: 'once+24', pose: {point: [540, 840]}},
      {at: 'line:once:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'declW', pose: {point: [440, 370]}},
      {at: 'braces', pose: {point: [200, 490]}},
      {at: 'line:body:end', pose: 'explain'},
      {at: 'callW', pose: {point: [230, 610]}},
      {at: 'again2', pose: {point: [230, 670]}},
      {at: 'line:call2:end', pose: 'explain'},
      {at: 'n1', pose: {point: [200, 900]}},
      {at: 'line:run:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: 'rMethod', pose: {point: [330, 420]}},
      {at: 'rCall', pose: {point: [540, 820]}},
      {at: 'line:recap:end', pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'day8done', pose: 'openToViewer'},
      {at: 'seeYou', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'methods', v: 0.85},
      {at: 'line:life', v: 0.55},
      {at: 'use', v: 0.8},
      {at: 'line:decl', v: 0.55},
      {at: 'n1', v: 0.85},
      {at: 'line:recap', v: 0.6},
      {at: 'line:bye', v: 0.85},
      {at: 'line:bye:end', v: 1},
    ],
    brows: [
      {at: 'line:hook', v: 0.8, hold: 50},
      {at: 'card', v: 0.6, hold: 24},
      {at: 'callW', v: 0.6, hold: 24},
      {at: 'again2', v: 0.7, hold: 24},
      {at: 'line:bye', v: 0.5, hold: 30},
    ],
  };

  const keyFrames = editorKeyFrames(lines);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={life.from + 10}>
        <FloatingChips
          at={c('again') - 4}
          until={c('day8') + 30}
          items={[
            {text: 'Hi!', tone: 'str', x: 205, y: 905, at: c('again') - 4},
            {text: 'Hi!', tone: 'str', x: 875, y: 880, at: c('again') + 2},
            {text: 'Hi!', tone: 'str', x: 195, y: 1160, at: c('again') + 8},
            {text: 'method', tone: 'dotnet', x: 885, y: 1150, at: c('better') + 4},
          ]}
        />
      </Within>

      <Within from={life.from} to={life.to + 4}>
        <RecipeCard />
      </Within>

      <Within from={code.from - 2} to={code.to + 6}>
        <Editor
          rect={{x: 56, y: 236, w: 968, h: 860}}
          enter={code.from}
          exit={code.to - 8}
          filename="Program.cs"
          lines={lines}
          fontSize={36}
          lineHeight={60}
          rows={6}
          termHeight={340}
          highlights={[
            {at: c('declW'), until: c('line:decl:end') + 4, spans: [{row: 0, from: 12, to: 17}], label: 'the name', tone: 'dotnet'},
            {at: c('braces'), until: c('line:body:end') + 6, spans: [{row: 1, rowEnd: 3, from: 0, to: 29}], label: 'the steps', tone: 'api'},
            {at: c('callW'), until: c('line:call1:end') + 4, spans: [{row: 4, from: 0, to: 7}], label: 'call it', tone: 'csharp'},
            {at: c('again2'), until: c('line:call2:end') + 4, spans: [{row: 5, from: 0, to: 7}], label: 'runs again', tone: 'str'},
            {at: c('n1'), until: c('n2'), spans: [{row: 4, from: 0, to: 8}], label: 'prints Hi!', tone: 'csharp'},
            {at: c('n2'), until: code.to, spans: [{row: 5, from: 0, to: 8}], label: 'prints Hi!', tone: 'csharp'},
          ]}
          runs={[{at: c('n1') - 14, output: 'Hi!\nHi!', lineAt: [c('n1'), c('n2')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Recap />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={8} nextDay={9} nextTitle="Parameters & Return Values" doneAt={c('day8done')} nextAt={c('day9')} glowAt={c('params')} />
      </Within>

      <SeriesBadge pulseAt={c('day8')} />
      <Captions />

      {[life.from - 6, code.from - 6, recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['again', 'card', 'once', 'use', 'declW', 'braces', 'callW', 'again2', 'rMethod', 'rCall', 'day9'].map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.22} />
      ))}
      {['n1', 'n2'].map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.16} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('n1') - 14} name="key2" volume={0.5} />
      <Sfx at={c('day8done')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
