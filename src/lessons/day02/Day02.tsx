/** Day 2 storyboard: "C# Basics: Variables" (timed from cues in script.json). */
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from '../../components/Captions';
import {CodeAnatomy, VarBox} from '../../components/Concepts';
import {cs, Editor, editorKeyFrames, EdLine, SYN2} from '../../components/Editor';
import {EndCard} from '../../components/EndCard';
import {FloatingChips} from '../../components/FloatingChips';
import {Direction} from '../../components/instructor/Instructor';
import {SeriesBadge} from '../../components/SeriesBadge';
import {Studio} from '../../components/Studio';
import {Sfx, ShotKey, ShotProvider, track, Within} from '../../engine/direction';
import {CueRef, getScene, resolveCue, useTimeline, windowed} from '../../engine/timeline';

const useCues = () => {
  const tl = useTimeline();
  return {c: (r: CueRef) => resolveCue(tl, r), scene: (id: string) => getScene(tl, id)};
};

const Boxes: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {c, scene} = useCues();
  const types = scene('types');
  const big = track(frame, fps, [
    {at: c('box'), x: 540, y: 640, w: 440, h: 340},
    {at: c('line:kinds'), x: 205, y: 690, w: 290, h: 240},
  ]);
  const pulse = (k: string) => windowed(frame, c(k), c(k) + 26, 4, 10);
  return (
    <>
      <VarBox
        {...{x: big.x, y: big.y, w: big.w, h: big.h}}
        tone="dotnet"
        name="name"
        nameAt={c('hasName')}
        value={'"Sam"'}
        valueTone="str"
        valueAt={c('value')}
        types={[
          {at: c('type'), label: 'type', tone: 'neutral'},
          {at: c('string'), label: 'string', tone: 'str'},
        ]}
        appear={c('box')}
        exit={types.to - 10}
        glow={pulse('string')}
      />
      <VarBox x={540} y={690} w={290} h={240} tone="dotnet" name="age" nameAt={c('whole') + 4} value="25" valueTone="int" valueAt={c('int')} types={[{at: c('int'), label: 'int', tone: 'int'}]} appear={c('whole')} exit={types.to - 8} glow={pulse('int')} />
      <VarBox x={875} y={690} w={290} h={240} tone="dotnet" name="isLearning" nameAt={c('truefalse') + 4} value="true" valueTone="bool" valueAt={c('bool')} types={[{at: c('bool'), label: 'bool', tone: 'bool'}]} appear={c('truefalse')} exit={types.to - 6} glow={pulse('bool')} />
    </>
  );
};

export const Day02: React.FC = () => {
  const {c, scene} = useCues();
  const box = scene('box');
  const types = scene('types');
  const code = scene('code');
  const recap = scene('recap');
  const outro = scene('outro');

  const shots: ShotKey[] = [
    {at: 0, shot: 'hero'},
    {at: box.from - 6, shot: 'teach', dur: 26},
    {at: code.from - 6, shot: 'code', dur: 28},
    {at: recap.from - 6, shot: 'teach', dur: 26},
    {at: outro.from - 6, shot: 'outro', dur: 28},
  ];

  const lines: EdLine[] = [
    {tokens: cs('// Day 2: variables')},
    {tokens: cs('string name = "Sam";'), typeAt: c('line:write') + 6, speed: 1.1},
    {tokens: cs('int age = 25;'), typeAt: 'chain', speed: 1.1},
    {tokens: cs('bool isLearning = true;'), typeAt: 'chain', speed: 1.1},
    {tokens: cs('')},
    {tokens: cs('Console.WriteLine($"Hi, I\'m {name}!");'), typeAt: c('line:use') + 2, speed: 1.15},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'name', pose: 'explainR'},
      {at: 'score', pose: 'shrug'},
      {at: 'variables', pose: 'explain'},
      {at: 'line:welcome', pose: 'wave'},
      {at: 'basics', pose: 'explain'},
      {at: box.from, pose: 'explain'},
      {at: 'box', pose: {point: [540, 640]}},
      {at: 'hasName', pose: {point: [540, 700]}},
      {at: 'value', pose: {point: [540, 520]}},
      {at: 'line:nameValue:end', pose: 'explain'},
      {at: 'type', pose: {point: [340, 520]}},
      {at: 'fits', pose: 'openToViewer'},
      {at: 'text', pose: {point: [205, 690]}},
      {at: 'whole', pose: {point: [540, 690]}},
      {at: 'truefalse', pose: {point: [875, 690]}},
      {at: 'line:kinds:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'first', pose: {point: [200, 420]}},
      {at: 'line:order:end', pose: 'explain'},
      {at: 'line:use', pose: 'openToViewer'},
      {at: 'dollar', pose: {point: [520, 560]}},
      {at: 'runIt', pose: 'explain'},
      {at: 'hi', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: 'rType', pose: {point: [251, 600]}},
      {at: 'rName', pose: {point: [482, 600]}},
      {at: 'rValue', pose: {point: [770, 600]}},
      {at: 'line:recap:end', pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'day2done', pose: 'openToViewer'},
      {at: 'seeYou', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'line:welcome', v: 0.8},
      {at: 'basics', v: 0.55},
      {at: 'hi', v: 0.85},
      {at: 'line:recap', v: 0.6},
      {at: 'line:bye', v: 0.85},
      {at: 'line:bye:end', v: 1},
    ],
    brows: [
      {at: 'line:hook', v: 0.7, hold: 50},
      {at: 'variables', v: 0.8, hold: 24},
      {at: 'type', v: 0.5, hold: 30},
      {at: 'dollar', v: 0.6, hold: 30},
      {at: 'line:bye', v: 0.5, hold: 30},
    ],
  };

  const keyFrames = editorKeyFrames(lines);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={box.from + 10}>
        <FloatingChips
          at={c('name')}
          until={c('variables') + 8}
          items={[
            {text: 'name', tone: 'aspnet', x: 205, y: 905, at: c('name')},
            {text: 'age', tone: 'int', x: 875, y: 880, at: c('age')},
            {text: 'score', tone: 'bool', x: 200, y: 1160, at: c('score')},
          ]}
        />
      </Within>

      <Within from={box.from} to={types.to + 4}>
        <Boxes />
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
          rows={8}
          termHeight={200}
          highlights={[
            {at: c('first'), until: c('then1'), spans: [{row: 1, from: 0, to: 6}, {row: 2, from: 0, to: 3}, {row: 3, from: 0, to: 4}], label: 'type', tone: 'dotnet'},
            {at: c('then1'), until: c('then2'), spans: [{row: 1, from: 7, to: 11}, {row: 2, from: 4, to: 7}, {row: 3, from: 5, to: 15}], label: 'name', tone: 'aspnet'},
            {at: c('then2'), until: c('line:order:end') + 24, spans: [{row: 1, from: 14, to: 19}, {row: 2, from: 10, to: 12}, {row: 3, from: 18, to: 22}], label: 'value', tone: 'csharp'},
            {at: c('dollar'), until: c('drop'), spans: [{row: 5, from: 18, to: 19}], label: 'interpolation', tone: 'api'},
            {at: c('drop'), until: c('line:run') + 4, spans: [{row: 5, from: 28, to: 34}], label: '{name} → Sam', tone: 'str'},
          ]}
          runs={[{at: c('runIt') + 2, output: "Hi, I'm Sam!"}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <CodeAnatomy
          y={600}
          fontSize={96}
          appear={recap.from + 4}
          exit={recap.to - 8}
          parts={[
            {text: 'int', color: SYN2.keyword, label: 'type', tone: 'dotnet', at: c('rType')},
            {text: ' ', color: SYN2.plain},
            {text: 'age', color: SYN2.plain, label: 'name', tone: 'aspnet', at: c('rName')},
            {text: ' = ', color: SYN2.punct},
            {text: '25', color: SYN2.number, label: 'value', tone: 'csharp', at: c('rValue')},
            {text: ';', color: SYN2.punct},
          ]}
        />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={2} nextDay={3} nextTitle="If & Else" doneAt={c('day2done')} nextAt={c('day3')} glowAt={c('decisions')} />
      </Within>

      <SeriesBadge pulseAt={c('day2')} />
      <Captions />

      {[box.from - 6, code.from - 6, recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['name', 'age', 'score', 'box', 'value', 'string', 'int', 'bool', 'rType', 'rName', 'rValue', 'day3'].map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.22} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('runIt') + 2} name="key2" volume={0.5} />
      <Sfx at={c('day2done')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
