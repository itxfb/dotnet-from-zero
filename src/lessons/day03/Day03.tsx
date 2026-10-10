/** Day 3 storyboard: "if & else: Making Decisions" (timed from cues in script.json). */
import React from 'react';
import {CircleCheck, CircleX, Glasses, Umbrella} from 'lucide-react';
import {useCurrentFrame} from 'remotion';
import {Captions} from '../../components/Captions';
import {Decision} from '../../components/Concepts';
import {cs, Editor, editorKeyFrames, EdEdit, EdLine, SYN2} from '../../components/Editor';
import {EndCard} from '../../components/EndCard';
import {FloatingChips} from '../../components/FloatingChips';
import {Direction} from '../../components/instructor/Instructor';
import {SeriesBadge} from '../../components/SeriesBadge';
import {Studio} from '../../components/Studio';
import {Sfx, ShotKey, ShotProvider, Within} from '../../engine/direction';
import {CueRef, getScene, resolveCue, useTimeline, windowed} from '../../engine/timeline';

const useCues = () => {
  const tl = useTimeline();
  return {c: (r: CueRef) => resolveCue(tl, r), scene: (id: string) => getScene(tl, id)};
};

const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const {c, scene} = useCues();
  const recap = scene('recap');
  return (
    <Decision
      x={540}
      y={470}
      size={250}
      question="age >= 18"
      mono
      at={recap.from + 4}
      exit={recap.to - 8}
      pulse={windowed(frame, c('ifChecks'), c('ifChecks') + 30, 4, 10)}
      yes={{label: 'You can vote!', Icon: CircleCheck, tone: 'csharp', at: recap.from + 14, x: 270, y: 830, w: 430, tag: 'if', glow: windowed(frame, c('ifChecks') + 6, c('elseBackup'), 4, 8)}}
      no={{label: 'Not yet!', Icon: CircleX, tone: 'str', at: recap.from + 22, x: 810, y: 830, w: 380, tag: 'else', glow: windowed(frame, c('elseBackup'), recap.to, 4, 8)}}
    />
  );
};

export const Day03: React.FC = () => {
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
    {tokens: cs('int age = 20;'), typeAt: c('line:same') + 10, speed: 1.6},
    {tokens: cs('')},
    {tokens: cs('if (age >= 18)'), typeAt: c('line:check') + 2, speed: 1.3},
    {tokens: cs('{'), typeAt: 'chain', speed: 1},
    {tokens: cs('    Console.WriteLine("You can vote!");'), typeAt: 'chain', speed: 0.85},
    {tokens: cs('}'), typeAt: 'chain', speed: 1},
    {tokens: cs('else'), typeAt: 'chain', speed: 1.3},
    {tokens: cs('{'), typeAt: 'chain', speed: 1},
    {tokens: cs('    Console.WriteLine("Not yet!");'), typeAt: 'chain', speed: 0.85},
    {tokens: cs('}'), typeAt: 'chain', speed: 1},
  ];
  const edits: EdEdit[] = [{at: c('change') + 4, row: 0, from: 10, to: 12, text: '15', color: SYN2.number}];
  const cond = [{row: 2, from: 4, to: 13}];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'decisions', pose: 'shrug'},
      {at: 'itCan', pose: 'explain'},
      {at: 'day3', pose: 'wave'},
      {at: life.from, pose: 'explain'},
      {at: 'raining', pose: {point: [540, 470]}},
      {at: 'umbrella', pose: {point: [270, 830]}},
      {at: 'sunglasses', pose: {point: [810, 830]}},
      {at: 'line:rain:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'write', pose: 'openToViewer'},
      {at: 'check', pose: {point: [260, 400]}},
      {at: 'line:condition:end', pose: 'explain'},
      {at: 'firstBlock', pose: {point: [400, 520]}},
      {at: 'elseBlock', pose: {point: [400, 720]}},
      {at: 'line:branches:end', pose: 'explain'},
      {at: 'vote', pose: 'openToViewer'},
      {at: 'change', pose: {point: [300, 300]}},
      {at: 'notYet', pose: 'shrug'},
      {at: recap.from, pose: 'explain'},
      {at: 'ifChecks', pose: {point: [540, 470]}},
      {at: 'elseBackup', pose: {point: [810, 830]}},
      {at: 'line:recap:end', pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'day3done', pose: 'openToViewer'},
      {at: 'seeYou', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'itCan', v: 0.85},
      {at: 'line:life', v: 0.55},
      {at: 'vote', v: 0.85},
      {at: 'line:run2', v: 0.55},
      {at: 'line:bye', v: 0.85},
      {at: 'line:bye:end', v: 1},
    ],
    brows: [
      {at: 'line:hook', v: 0.8, hold: 50},
      {at: 'raining', v: 0.5, hold: 20},
      {at: 'eighteen', v: 0.8, hold: 26},
      {at: 'notYet', v: 0.7, hold: 24},
      {at: 'line:bye', v: 0.5, hold: 30},
    ],
  };

  const keyFrames = editorKeyFrames(lines, edits);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={life.from + 10}>
        <FloatingChips
          at={c('decisions') - 4}
          until={c('itCan') + 4}
          items={[
            {text: 'if', tone: 'dotnet', x: 205, y: 905},
            {text: 'else', tone: 'str', x: 875, y: 880},
            {text: 'true', tone: 'csharp', x: 195, y: 1160},
            {text: 'false', tone: 'warm', x: 885, y: 1150},
          ]}
        />
      </Within>

      <Within from={life.from} to={life.to + 4}>
        <Decision
          x={540}
          y={470}
          size={250}
          question="Raining?"
          at={c('allTime')}
          exit={life.to - 8}
          yes={{label: 'Umbrella', Icon: Umbrella, tone: 'aspnet', at: c('umbrella') - 4, x: 270, y: 830, w: 400, tag: 'yes'}}
          no={{label: 'Sunglasses', Icon: Glasses, tone: 'api', at: c('else'), x: 810, y: 830, w: 400, tag: 'else'}}
        />
      </Within>

      <Within from={code.from - 2} to={code.to + 6}>
        <Editor
          rect={{x: 56, y: 226, w: 968, h: 900}}
          enter={code.from}
          exit={code.to - 8}
          filename="Program.cs"
          lines={lines}
          fontSize={34}
          lineHeight={54}
          rows={10}
          termHeight={176}
          edits={edits}
          highlights={[
            {at: c('store'), until: c('check'), spans: [{row: 0, from: 0, to: 13}], label: 'variable', tone: 'dotnet'},
            {at: c('check'), until: c('condition'), spans: cond, tone: 'api'},
            {at: c('condition'), until: c('firstBlock'), spans: cond, label: 'condition', tone: 'api'},
            {at: c('firstBlock'), until: c('elseBlock'), spans: [{row: 3, rowEnd: 5, from: 0, to: 39}], label: 'runs if true', tone: 'csharp'},
            {at: c('elseBlock'), until: c('line:branches:end') + 10, spans: [{row: 6, rowEnd: 9, from: 0, to: 39}], label: 'runs if false', tone: 'str'},
            {at: c('twenty') - 2, until: c('change'), spans: cond, label: '20 >= 18 → true', tone: 'csharp'},
            {at: c('fifteen') + 14, until: c('line:run2:end') + 20, spans: cond, label: '15 >= 18 → false', tone: 'str'},
          ]}
          runs={[
            {at: c('vote') - 10, output: 'You can vote!', focus: [0, 2, 3, 4, 5]},
            {at: c('notYet') - 10, output: 'Not yet!', focus: [0, 2, 6, 7, 8, 9]},
          ]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Recap />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={3} nextDay={4} nextTitle="Loops" doneAt={c('day3done')} nextAt={c('day4')} glowAt={c('loops')} />
      </Within>

      <SeriesBadge pulseAt={c('day3')} />
      <Captions />

      {[life.from - 6, code.from - 6, recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['raining', 'umbrella', 'sunglasses', 'condition', 'firstBlock', 'elseBlock', 'day4'].map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.22} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('vote') - 10} name="key2" volume={0.5} />
      <Sfx at={c('notYet') - 10} name="key2" volume={0.5} />
      <Sfx at={c('day3done')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
