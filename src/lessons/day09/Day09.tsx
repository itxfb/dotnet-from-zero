/** Day 9 storyboard: "Parameters & Return Values" (timed from cues in script.json). */
import React from 'react';
import {Cookie, Coins, Refrigerator} from 'lucide-react';
import {Arrow} from '../../components/Arrow';
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
import {CueRef, getScene, resolveCue, useTimeline} from '../../engine/timeline';
import {CONCEPT} from '../../theme';

const useCues = () => {
  const tl = useTimeline();
  return {c: (r: CueRef) => resolveCue(tl, r), scene: (id: string) => getScene(tl, id)};
};

const Vending: React.FC = () => {
  const {c, scene} = useCues();
  const life = scene('life');
  return (
    <>
      <Module x={540} y={340} w={360} h={120} tone="api" label="coins" Icon={Coins} appear={c('coins')} exit={life.to - 12} />
      <Arrow pts={[[540, 410], [540, 480]]} at={c('coins') + 6} exit={life.to - 12} color={CONCEPT.api.main} />
      <Module x={540} y={560} w={520} h={150} tone="aspnet" label="vending machine" Icon={Refrigerator} appear={c('machine')} exit={life.to - 12} />
      <Arrow pts={[[540, 640], [540, 730]]} at={c('snack') + 6} exit={life.to - 12} color={CONCEPT.str.main} />
      <Module x={540} y={800} w={360} h={120} tone="str" label="snack" Icon={Cookie} appear={c('snack')} exit={life.to - 12} />
      <Tag x={540} y={960} at={c('snack') + 12} exit={life.to - 12} text="in, then out" color={CONCEPT.csharp.main} size={40} />
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
          {text: 'Add', color: SYN2.method},
          {text: '(', color: SYN2.punct},
          {text: '2, 3', color: SYN2.number, label: 'goes in', tone: 'api', at: c('rIn')},
          {text: ')', color: SYN2.punct},
        ]}
      />
      <Module x={540} y={820} w={380} h={120} tone="str" label="5" appear={c('rOut')} exit={recap.to - 8} />
      <Tag x={540} y={990} at={c('rOut')} exit={recap.to - 8} text="comes back out" color={CONCEPT.csharp.main} size={44} />
    </>
  );
};

export const Day09: React.FC = () => {
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
    {tokens: cs('static int Add(int a, int b)'), typeAt: c('line:sig') + 8, speed: 0.9},
    {tokens: cs('{'), typeAt: 'chain', speed: 0.9},
    {tokens: cs('    return a + b;'), typeAt: c('line:ret') + 2, speed: 0.9},
    {tokens: cs('}'), typeAt: 'chain', speed: 0.9},
    {tokens: cs('int sum = Add(2, 3);'), typeAt: c('line:call') + 2, speed: 0.9},
    {tokens: cs('Console.WriteLine(sum);'), typeAt: 'chain', speed: 0.9},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'in', pose: 'explain'},
      {at: 'back', pose: 'shrug'},
      {at: 'day9', pose: 'wave'},
      {at: life.from, pose: 'explain'},
      {at: 'machine', pose: {point: [540, 560]}},
      {at: 'coins', pose: {point: [540, 340]}},
      {at: 'snack', pose: {point: [540, 800]}},
      {at: 'line:coins:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'paramW', pose: {point: [600, 370]}},
      {at: 'line:sig:end', pose: 'explain'},
      {at: 'retW', pose: {point: [300, 490]}},
      {at: 'line:ret:end', pose: 'explain'},
      {at: 'callW', pose: {point: [400, 670]}},
      {at: 'n1', pose: {point: [200, 900]}},
      {at: 'line:run:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: 'rIn', pose: {point: [540, 420]}},
      {at: 'rOut', pose: {point: [540, 820]}},
      {at: 'line:recap:end', pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'day9done', pose: 'openToViewer'},
      {at: 'seeYou', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'day9', v: 0.85},
      {at: 'line:life', v: 0.55},
      {at: 'snack', v: 0.8},
      {at: 'line:sig', v: 0.55},
      {at: 'n1', v: 0.85},
      {at: 'line:recap', v: 0.6},
      {at: 'line:bye', v: 0.85},
      {at: 'line:bye:end', v: 1},
    ],
    brows: [
      {at: 'line:hook', v: 0.8, hold: 50},
      {at: 'machine', v: 0.6, hold: 24},
      {at: 'retW', v: 0.6, hold: 24},
      {at: 'callW', v: 0.7, hold: 24},
      {at: 'line:bye', v: 0.5, hold: 30},
    ],
  };

  const keyFrames = editorKeyFrames(lines);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={life.from + 10}>
        <FloatingChips
          at={c('in') - 4}
          until={c('day9') + 30}
          items={[
            {text: '2, 3', tone: 'api', x: 205, y: 905, at: c('in') - 4},
            {text: '5', tone: 'str', x: 875, y: 880, at: c('back') + 2},
            {text: 'parameters', tone: 'dotnet', x: 195, y: 1160, at: c('in') + 6},
            {text: 'return', tone: 'dotnet', x: 885, y: 1150, at: c('back') + 8},
          ]}
        />
      </Within>

      <Within from={life.from} to={life.to + 4}>
        <Vending />
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
            {at: c('paramW'), until: c('line:sig:end') + 4, spans: [{row: 0, from: 15, to: 27}], label: 'goes in', tone: 'api'},
            {at: c('retW'), until: c('line:ret:end') + 6, spans: [{row: 2, from: 4, to: 17}], label: 'comes back', tone: 'dotnet'},
            {at: c('callW'), until: c('line:call:end') + 4, spans: [{row: 4, from: 10, to: 19}], tone: 'csharp'},
            {at: c('n1'), until: code.to, spans: [{row: 5, from: 0, to: 23}], label: 'prints 5', tone: 'str'},
          ]}
          runs={[{at: c('n1') - 14, output: '5', lineAt: [c('n1')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Recap />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={9} nextDay={10} nextTitle="Classes & Objects" doneAt={c('day9done')} nextAt={c('day10')} glowAt={c('classes')} />
      </Within>

      <SeriesBadge pulseAt={c('day9')} />
      <Captions />

      {[life.from - 6, code.from - 6, recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['in', 'back', 'machine', 'coins', 'snack', 'paramW', 'retW', 'callW', 'rIn', 'rOut', 'day10'].map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.22} />
      ))}
      <Sfx at={c('n1')} name="pop" volume={0.16} />
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('n1') - 14} name="key2" volume={0.5} />
      <Sfx at={c('day9done')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
