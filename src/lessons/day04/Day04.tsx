/** Day 4 storyboard: "Loops: Repeat Without Copy-Paste" (timed from cues in script.json). */
import React from 'react';
import {CircleCheck, Dumbbell, LogOut, Repeat} from 'lucide-react';
import {useCurrentFrame} from 'remotion';
import {Arrow} from '../../components/Arrow';
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
import {CONCEPT} from '../../theme';

const useCues = () => {
  const tl = useTimeline();
  return {c: (r: CueRef) => resolveCue(tl, r), scene: (id: string) => getScene(tl, id)};
};

const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const {c, scene} = useCues();
  const recap = scene('recap');
  return (
    <>
      <Decision
        x={540}
        y={470}
        size={250}
        question="i <= 5"
        mono
        at={recap.from + 4}
        exit={recap.to - 8}
        pulse={windowed(frame, c('condTrue'), c('condTrue') + 30, 4, 10)}
        yes={{label: 'Run the body', Icon: Repeat, tone: 'csharp', at: recap.from + 14, x: 270, y: 830, w: 430, tag: 'true', glow: windowed(frame, c('condTrue') + 6, c('false2'), 4, 8)}}
        no={{label: 'Exit loop', Icon: LogOut, tone: 'str', at: recap.from + 22, x: 810, y: 830, w: 380, tag: 'false', glow: windowed(frame, c('false2'), recap.to, 4, 8)}}
      />
      <Arrow pts={[[53, 830], [28, 830], [28, 236], [540, 236], [540, 282]]} at={c('repeats2')} dur={20} exit={recap.to - 8} color={CONCEPT.csharp.main} />
    </>
  );
};

export const Day04: React.FC = () => {
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
    {tokens: cs('for (int i = 1; i <= 5; i++)'), typeAt: c('line:forLoop') + 10, speed: 1.3},
    {tokens: cs('{'), typeAt: 'chain', speed: 1},
    {tokens: cs('    Console.WriteLine(i);'), typeAt: 'chain', speed: 0.85},
    {tokens: cs('}'), typeAt: 'chain', speed: 1},
  ];
  const edits: EdEdit[] = [{at: c('change') + 4, row: 0, from: 21, to: 22, text: '100', color: SYN2.number}];
  const cond = [{row: 0, from: 16, to: 22}];
  const counts = ['n1', 'n2', 'n3', 'n4', 'n5'];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'hundred', pose: 'shrug'},
      {at: 'copyPaste', pose: 'explain'},
      {at: 'day4', pose: 'wave'},
      {at: life.from, pose: 'explain'},
      {at: 'repeats', pose: 'openToViewer'},
      {at: 'doneFive', pose: {point: [540, 470]}},
      {at: 'oneMore', pose: {point: [810, 830]}},
      {at: 'stop', pose: {point: [270, 830]}},
      {at: 'line:pushups:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'forLoop', pose: {point: [330, 330]}},
      {at: 'start', pose: {point: [370, 330]}},
      {at: 'keepGoing', pose: {point: [555, 330]}},
      {at: 'addOne', pose: {point: [690, 330]}},
      {at: 'line:parts:end', pose: 'explain'},
      {at: 'inside', pose: {point: [400, 440]}},
      {at: 'line:body:end', pose: 'explain'},
      {at: 'n1', pose: {point: [200, 720]}},
      {at: 'six', pose: {point: [555, 330]}},
      {at: 'line:stop:end', pose: 'explain'},
      {at: 'change', pose: {point: [600, 330]}},
      {at: 'done', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: 'condTrue', pose: {point: [540, 470]}},
      {at: 'repeats2', pose: {point: [270, 830]}},
      {at: 'false2', pose: {point: [810, 830]}},
      {at: 'line:recap:end', pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'day4done', pose: 'openToViewer'},
      {at: 'seeYou', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'loops', v: 0.85},
      {at: 'line:life', v: 0.55},
      {at: 'n1', v: 0.85},
      {at: 'line:stop', v: 0.55},
      {at: 'done', v: 0.85},
      {at: 'line:recap', v: 0.55},
      {at: 'line:bye', v: 0.85},
      {at: 'line:bye:end', v: 1},
    ],
    brows: [
      {at: 'line:hook', v: 0.8, hold: 50},
      {at: 'doneFive', v: 0.6, hold: 20},
      {at: 'six', v: 0.7, hold: 24},
      {at: 'hundred2', v: 0.8, hold: 24},
      {at: 'line:bye', v: 0.5, hold: 30},
    ],
  };

  const keyFrames = editorKeyFrames(lines, edits);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={life.from + 10}>
        <FloatingChips
          at={c('hundred') - 4}
          until={c('copyPaste') + 30}
          items={[
            {text: 'for', tone: 'dotnet', x: 205, y: 905},
            {text: 'while', tone: 'str', x: 875, y: 880},
            {text: 'i++', tone: 'csharp', x: 195, y: 1160},
            {text: 'repeat', tone: 'warm', x: 885, y: 1150},
          ]}
        />
      </Within>

      <Within from={life.from} to={life.to + 4}>
        <Decision
          x={540}
          y={470}
          size={250}
          question="Done 5?"
          at={c('repeats')}
          exit={life.to - 8}
          yes={{label: 'Stop!', Icon: CircleCheck, tone: 'csharp', at: c('yes'), x: 270, y: 830, w: 400, tag: 'yes'}}
          no={{label: 'One more', Icon: Dumbbell, tone: 'aspnet', at: c('no'), x: 810, y: 830, w: 400, tag: 'no'}}
        />
        <Arrow pts={[[1012, 830], [1046, 830], [1046, 236], [540, 236], [540, 282]]} at={c('oneMore') + 10} dur={20} exit={life.to - 8} color={CONCEPT.aspnet.main} />
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
          rows={4}
          termHeight={560}
          edits={edits}
          highlights={[
            {at: c('forLoop'), until: c('start'), spans: [{row: 0, from: 0, to: 28}], label: 'for loop', tone: 'dotnet'},
            {at: c('start'), spans: [{row: 0, from: 5, to: 14}], label: 'start', tone: 'csharp'},
            {at: c('keepGoing'), spans: cond, label: 'condition', tone: 'api'},
            {at: c('addOne'), until: c('line:parts:end') + 6, spans: [{row: 0, from: 24, to: 27}], label: 'step', tone: 'aspnet'},
            {at: c('inside'), until: c('line:body:end') + 6, spans: [{row: 1, rowEnd: 3, from: 0, to: 25}], label: 'runs each time', tone: 'csharp'},
            {at: c('n1'), until: c('line:run1:end') + 6, spans: [{row: 2, from: 4, to: 25}], label: 'runs 5 times', tone: 'csharp'},
            {at: c('six'), until: c('change'), spans: cond, label: '6 <= 5 → false', tone: 'str'},
            {at: c('done') - 10, until: code.to, spans: [{row: 0, from: 16, to: 24}], label: 'runs 100 times', tone: 'csharp'},
          ]}
          runs={[
            {at: c('n1') - 14, output: '1\n2\n3\n4\n5', lineAt: counts.map((k) => c(k))},
            {at: c('done') - 10, output: Array.from({length: 8}, (_, i) => 93 + i).join('\n')},
          ]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Recap />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={4} nextDay={5} nextTitle="Arrays" doneAt={c('day4done')} nextAt={c('day5')} glowAt={c('arrays')} />
      </Within>

      <SeriesBadge pulseAt={c('day4')} />
      <Captions />

      {[life.from - 6, code.from - 6, recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['doneFive', 'oneMore', 'stop', 'start', 'keepGoing', 'addOne', 'inside', 'six', 'day5'].map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.22} />
      ))}
      {counts.map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.16} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('n1') - 14} name="key2" volume={0.5} />
      <Sfx at={c('done') - 10} name="key2" volume={0.5} />
      <Sfx at={c('day4done')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
