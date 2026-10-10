/** Day 6 storyboard: "foreach" (timed from cues in script.json). */
import React from 'react';
import {ListMusic, Music, Play} from 'lucide-react';
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
import {Sfx, ShotKey, ShotProvider, track, Within} from '../../engine/direction';
import {CueRef, getScene, resolveCue, useTimeline, windowed} from '../../engine/timeline';
import {CONCEPT} from '../../theme';

const useCues = () => {
  const tl = useTimeline();
  return {c: (r: CueRef) => resolveCue(tl, r), scene: (id: string) => getScene(tl, id)};
};

const VALUES = ['90', '75', '82'];
const XS = [205, 540, 875];
const SY = [560, 700, 840];

const Playlist: React.FC = () => {
  const frame = useCurrentFrame();
  const {c, scene} = useCues();
  const life = scene('life');
  const starts = [c('s1'), c('s2'), c('s3'), c('ends') + 10];
  return (
    <>
      <Module x={540} y={380} w={440} h={130} tone="aspnet" label="playlist" Icon={ListMusic} appear={c('playlist')} exit={life.to - 12} />
      {SY.map((y, i) => {
        const on = frame >= starts[i] && frame < starts[i + 1];
        return (
          <Module
            key={y}
            x={540}
            y={y}
            w={560}
            h={110}
            tone="aspnet"
            variant="flat"
            align="left"
            label={`Song ${i + 1}`}
            Icon={on ? Play : Music}
            appear={c('playlist') + 8 + i * 6}
            exit={life.to - 12 + i * 2}
            glow={windowed(frame, starts[i], starts[i + 1], 4, 6)}
          />
        );
      })}
      <Tag x={540} y={980} at={c('ends')} exit={life.to - 12} text="end of the list: stop!" color={CONCEPT.csharp.main} size={40} />
    </>
  );
};

const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {c, scene} = useCues();
  const recap = scene('recap');
  const visit = [c('rOrder') - 6, c('rOrder') + 6, c('rOne') + 8];
  const ptr = track(frame, fps, visit.map((at, i) => ({at, x: XS[i]})));
  return (
    <>
      <CodeAnatomy
        y={420}
        fontSize={54}
        appear={recap.from + 4}
        exit={recap.to - 8}
        parts={[
          {text: 'foreach', color: SYN2.keyword, label: 'every item', tone: 'csharp', at: c('rEvery')},
          {text: ' (', color: SYN2.punct},
          {text: 'int', color: SYN2.keyword},
          {text: ' ', color: SYN2.plain},
          {text: 'score', color: SYN2.plain, label: 'one by one', tone: 'int', at: c('rOne')},
          {text: ' ', color: SYN2.plain},
          {text: 'in', color: SYN2.keyword},
          {text: ' ', color: SYN2.plain},
          {text: 'scores', color: SYN2.plain},
          {text: ')', color: SYN2.punct},
        ]}
      />
      {VALUES.map((v, i) => (
        <VarBox
          key={v}
          x={XS[i]}
          y={800}
          w={260}
          h={210}
          tone="dotnet"
          name={`[${i}]`}
          nameAt={recap.from + 14 + i * 5}
          value={v}
          valueTone="int"
          valueAt={recap.from - 30}
          appear={recap.from + 10 + i * 5}
          exit={recap.to - 8}
          glow={windowed(frame, visit[i], i < 2 ? visit[i + 1] : recap.to, 4, 8)}
        />
      ))}
      <Tag x={ptr.x} y={990} at={visit[0]} exit={recap.to - 8} text="score" color={CONCEPT.int.main} size={44} />
    </>
  );
};

export const Day06: React.FC = () => {
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
    {tokens: cs('int[] scores = { 90, 75, 82 };'), typeAt: c('line:decl') + 8, speed: 0.9},
    {tokens: cs('')},
    {tokens: cs('foreach (int score in scores)'), typeAt: c('line:loop') + 2, speed: 0.9},
    {tokens: cs('{'), typeAt: 'chain', speed: 1},
    {tokens: cs('    Console.WriteLine(score);'), typeAt: 'chain', speed: 0.75},
    {tokens: cs('}'), typeAt: 'chain', speed: 1},
  ];
  const vals = [17, 21, 25];
  const outs = ['n1', 'n2', 'n3'];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'every', pose: 'shrug'},
      {at: 'skip', pose: 'explain'},
      {at: 'day6', pose: 'wave'},
      {at: life.from, pose: 'explain'},
      {at: 'playlist', pose: {point: [540, 380]}},
      {at: 's1', pose: {point: [540, 560]}},
      {at: 's2', pose: {point: [540, 700]}},
      {at: 's3', pose: {point: [540, 840]}},
      {at: 'line:songs:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'foreachLoop', pose: {point: [240, 490]}},
      {at: 'score', pose: {point: [458, 490]}},
      {at: 'inScores', pose: {point: [706, 490]}},
      {at: 'line:read:end', pose: 'explain'},
      {at: 'inside', pose: {point: [400, 610]}},
      {at: 'line:body:end', pose: 'explain'},
      {at: 'n1', pose: {point: [200, 900]}},
      {at: 'line:run:end', pose: 'openToViewer'},
      {at: 'noIndex', pose: {point: [600, 490]}},
      {at: 'line:noIdx:end', pose: 'explain'},
      {at: recap.from, pose: 'explain'},
      {at: 'rEvery', pose: {point: [183, 420]}},
      {at: 'rOrder', pose: {point: [540, 800]}},
      {at: 'rOne', pose: {point: [572, 420]}},
      {at: 'line:recap:end', pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'day6done', pose: 'openToViewer'},
      {at: 'seeYou', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'foreach', v: 0.85},
      {at: 'line:life', v: 0.55},
      {at: 'ends', v: 0.8},
      {at: 'line:decl', v: 0.55},
      {at: 'n1', v: 0.85},
      {at: 'line:recap', v: 0.6},
      {at: 'line:bye', v: 0.85},
      {at: 'line:bye:end', v: 1},
    ],
    brows: [
      {at: 'line:hook', v: 0.8, hold: 50},
      {at: 'playlist', v: 0.6, hold: 24},
      {at: 'score', v: 0.6, hold: 24},
      {at: 'noIndex', v: 0.7, hold: 24},
      {at: 'line:bye', v: 0.5, hold: 30},
    ],
  };

  const keyFrames = editorKeyFrames(lines);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={life.from + 10}>
        <FloatingChips
          at={c('every') - 4}
          until={c('skip') + 30}
          items={[
            {text: 'scores[0]', tone: 'int', x: 205, y: 905, at: c('every') - 4},
            {text: 'scores[1]', tone: 'str', x: 875, y: 880, at: c('every') + 2},
            {text: 'scores[2]', tone: 'bool', x: 195, y: 1160, at: c('every') + 8},
            {text: 'scores[49]', tone: 'warm', x: 885, y: 1150, at: c('every') + 14},
          ]}
        />
      </Within>

      <Within from={life.from} to={life.to + 4}>
        <Playlist />
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
            {at: c('foreachLoop'), until: c('line:loop:end') + 4, spans: [{row: 2, from: 0, to: 7}], tone: 'dotnet'},
            {at: c('score'), until: c('line:body'), spans: [{row: 2, from: 9, to: 18}], label: 'each value', tone: 'int'},
            {at: c('inScores'), until: c('line:body'), spans: [{row: 0, from: 6, to: 12}, {row: 2, from: 22, to: 28}], label: 'the array', tone: 'dotnet'},
            {at: c('inside'), until: c('line:body:end') + 6, spans: [{row: 3, rowEnd: 5, from: 0, to: 29}], label: 'once per value', tone: 'csharp'},
            ...outs.map((k, i) => ({
              at: c(k),
              until: i < 2 ? c(outs[i + 1]) : c('noIndex') - 2,
              spans: [{row: 0, from: vals[i], to: vals[i] + 2}, {row: 4, from: 4, to: 29}],
              label: `score = ${VALUES[i]}`,
              tone: 'csharp' as const,
            })),
            {at: c('noIndex'), until: code.to, spans: [{row: 2, from: 9, to: 28}], label: 'no [i], no i++', tone: 'api'},
          ]}
          runs={[{at: c('n1') - 14, output: VALUES.join('\n'), lineAt: outs.map((k) => c(k))}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Recap />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={6} nextDay={7} nextTitle="Lists" doneAt={c('day6done')} nextAt={c('day7')} glowAt={c('lists')} />
      </Within>

      <SeriesBadge pulseAt={c('day6')} />
      <Captions />

      {[life.from - 6, code.from - 6, recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['every', 'playlist', 's1', 's2', 's3', 'ends', 'foreachLoop', 'score', 'inScores', 'inside', 'noIndex', 'rEvery', 'rOne', 'day7'].map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.22} />
      ))}
      {outs.map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.16} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('n1') - 14} name="key2" volume={0.5} />
      <Sfx at={c('day6done')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
