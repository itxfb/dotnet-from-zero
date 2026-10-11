/** Day 7 storyboard: "Lists" (timed from cues in script.json). */
import React from 'react';
import {ListChecks, ShoppingBasket} from 'lucide-react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from '../../components/Captions';
import {CodeAnatomy, VarBox} from '../../components/Concepts';
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

const NAMES = ['Ana', 'Ben', 'Cy'];
const XS = [205, 540, 875];
const SY = [560, 700, 840];

const ShoppingList: React.FC = () => {
  const frame = useCurrentFrame();
  const {c, scene} = useCues();
  const life = scene('life');
  const items = [
    {label: 'Milk', at: c('milk')},
    {label: 'Eggs', at: c('eggs')},
    {label: 'and more...', at: c('grows')},
  ];
  return (
    <>
      <Module x={540} y={380} w={440} h={130} tone="aspnet" label="shopping list" Icon={ListChecks} appear={c('shop')} exit={life.to - 12} />
      {items.map((it, i) => (
        <Module
          key={it.label}
          x={540}
          y={SY[i]}
          w={560}
          h={110}
          tone="aspnet"
          variant="flat"
          align="left"
          label={it.label}
          Icon={ShoppingBasket}
          appear={it.at}
          exit={life.to - 12 + i * 2}
          glow={windowed(frame, it.at, it.at + 40, 4, 8)}
        />
      ))}
      <Tag x={540} y={980} at={c('grows')} exit={life.to - 12} text="the list grows!" color={CONCEPT.csharp.main} size={40} />
    </>
  );
};

const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const {c, scene} = useCues();
  const recap = scene('recap');
  const shown = [recap.from + 10, recap.from + 15, c('rAdd')];
  return (
    <>
      <CodeAnatomy
        y={420}
        fontSize={54}
        appear={recap.from + 4}
        exit={recap.to - 8}
        parts={[
          {text: 'names', color: SYN2.plain, label: 'the list', tone: 'dotnet', at: c('rList')},
          {text: '.', color: SYN2.punct},
          {text: 'Add', color: SYN2.plain, label: 'grows', tone: 'csharp', at: c('rAdd')},
          {text: '(', color: SYN2.punct},
          {text: '"Cy"', color: SYN2.string},
          {text: ')', color: SYN2.punct},
        ]}
      />
      {NAMES.map((v, i) => (
        <VarBox
          key={v}
          x={XS[i]}
          y={800}
          w={260}
          h={210}
          tone="dotnet"
          name={`[${i}]`}
          nameAt={shown[i] + 4}
          value={v}
          valueTone="str"
          valueAt={shown[i]}
          appear={shown[i]}
          exit={recap.to - 8}
          glow={i === 2 ? windowed(frame, c('rAdd'), c('rCount'), 4, 8) : 0}
        />
      ))}
      <Tag x={540} y={990} at={c('rCount')} exit={recap.to - 8} text="Count = 3" color={CONCEPT.int.main} size={48} />
    </>
  );
};

export const Day07: React.FC = () => {
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
    {tokens: cs('List<string> names = new();'), typeAt: c('line:decl') + 8, speed: 0.9},
    {tokens: cs('names.Add("Ana");'), typeAt: c('line:adds') + 2, speed: 0.9},
    {tokens: cs('names.Add("Ben");'), typeAt: c('line:more') + 2, speed: 0.9},
    {tokens: cs('names.Add("Cy");'), typeAt: 'chain', speed: 0.9},
    {tokens: cs('Console.WriteLine(names.Count);'), typeAt: c('line:count') + 2, speed: 0.8},
    {tokens: cs('Console.WriteLine(names[1]);'), typeAt: c('line:idx') + 2, speed: 0.8},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'cant', pose: 'shrug'},
      {at: 'more', pose: 'explain'},
      {at: 'day7', pose: 'wave'},
      {at: life.from, pose: 'explain'},
      {at: 'shop', pose: {point: [540, 380]}},
      {at: 'milk', pose: {point: [540, 560]}},
      {at: 'eggs', pose: {point: [540, 700]}},
      {at: 'grows', pose: {point: [540, 840]}},
      {at: 'line:grow:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'declW', pose: {point: [295, 370]}},
      {at: 'addW', pose: {point: [327, 430]}},
      {at: 'many', pose: {point: [400, 490]}},
      {at: 'line:more:end', pose: 'explain'},
      {at: 'countW', pose: {point: [763, 610]}},
      {at: 'brackets', pose: {point: [698, 670]}},
      {at: 'line:idx:end', pose: 'explain'},
      {at: 'n1', pose: {point: [200, 900]}},
      {at: 'line:run:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: 'rAdd', pose: {point: [330, 420]}},
      {at: 'rCount', pose: {point: [540, 800]}},
      {at: 'line:recap:end', pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'day7done', pose: 'openToViewer'},
      {at: 'seeYou', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'lists', v: 0.85},
      {at: 'line:life', v: 0.55},
      {at: 'grows', v: 0.8},
      {at: 'line:decl', v: 0.55},
      {at: 'n1', v: 0.85},
      {at: 'line:recap', v: 0.6},
      {at: 'line:bye', v: 0.85},
      {at: 'line:bye:end', v: 1},
    ],
    brows: [
      {at: 'line:hook', v: 0.8, hold: 50},
      {at: 'shop', v: 0.6, hold: 24},
      {at: 'addW', v: 0.6, hold: 24},
      {at: 'countW', v: 0.7, hold: 24},
      {at: 'line:bye', v: 0.5, hold: 30},
    ],
  };

  const keyFrames = editorKeyFrames(lines);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={life.from + 10}>
        <FloatingChips
          at={c('cant') - 4}
          until={c('day7') + 30}
          items={[
            {text: 'int[3]', tone: 'int', x: 205, y: 905, at: c('cant') - 4},
            {text: 'full!', tone: 'warm', x: 875, y: 880, at: c('cant') + 2},
            {text: 'no room', tone: 'bool', x: 195, y: 1160, at: c('more') - 4},
            {text: 'List<T>', tone: 'str', x: 885, y: 1150, at: c('more') + 4},
          ]}
        />
      </Within>

      <Within from={life.from} to={life.to + 4}>
        <ShoppingList />
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
            {at: c('declW'), until: c('line:decl:end') + 4, spans: [{row: 0, from: 0, to: 12}], label: 'list of strings', tone: 'dotnet'},
            {at: c('addW'), until: c('line:adds:end') + 4, spans: [{row: 1, from: 6, to: 9}], label: 'adds to the end', tone: 'csharp'},
            {at: c('many'), until: c('line:more:end') + 6, spans: [{row: 1, rowEnd: 3, from: 0, to: 17}], tone: 'api'},
            {at: c('countW'), until: c('line:count:end') + 4, spans: [{row: 4, from: 25, to: 30}], label: 'how many', tone: 'int'},
            {at: c('brackets'), until: c('line:idx:end') + 4, spans: [{row: 5, from: 23, to: 26}], label: 'item 1', tone: 'str'},
            {at: c('n1'), until: c('n2'), spans: [{row: 4, from: 0, to: 31}], label: 'prints 3', tone: 'csharp'},
            {at: c('n2'), until: code.to, spans: [{row: 5, from: 0, to: 28}], label: 'prints Ben', tone: 'csharp'},
          ]}
          runs={[{at: c('n1') - 14, output: '3\nBen', lineAt: [c('n1'), c('n2')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Recap />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={7} nextDay={8} nextTitle="Methods" doneAt={c('day7done')} nextAt={c('day8')} glowAt={c('methods')} />
      </Within>

      <SeriesBadge pulseAt={c('day7')} />
      <Captions />

      {[life.from - 6, code.from - 6, recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['cant', 'shop', 'milk', 'eggs', 'grows', 'declW', 'addW', 'many', 'countW', 'brackets', 'rList', 'rAdd', 'rCount', 'day8'].map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.22} />
      ))}
      {['n1', 'n2'].map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.16} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('n1') - 14} name="key2" volume={0.5} />
      <Sfx at={c('day7done')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
