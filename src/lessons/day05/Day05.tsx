/** Day 5 storyboard: "Arrays" (timed from cues in script.json). */
import React from 'react';
import {Boxes} from 'lucide-react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Arrow} from '../../components/Arrow';
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

const Row: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {c, scene} = useCues();
  const life = scene('life');
  const first = track(frame, fps, [
    {at: c('oneBox'), x: 540, y: 640, w: 440, h: 340},
    {at: c('row'), x: XS[0], y: 690, w: 290, h: 240},
  ]);
  const solo = frame < c('row');
  return (
    <>
      <Module x={540} y={400} w={400} h={120} tone="dotnet" label="scores" Icon={Boxes} appear={c('oneName')} exit={life.to - 12} />
      <Arrow pts={[[540, 462], [540, 510]]} at={c('oneName') + 8} dur={6} exit={life.to - 12} color={CONCEPT.dotnet.main} head={false} flow={false} />
      <Arrow pts={[[XS[0], 548], [XS[0], 510], [XS[2], 510], [XS[2], 548]]} at={c('oneName') + 12} dur={14} exit={life.to - 12} color={CONCEPT.dotnet.main} head={false} flow={false} />
      {VALUES.map((v, i) => {
        const appear = i ? c('row') + i * 7 : c('oneBox');
        return (
          <VarBox
            key={v}
            {...(i ? {x: XS[i], y: 690, w: 290, h: 240} : {x: first.x, y: first.y, w: first.w, h: first.h})}
            tone="dotnet"
            name={!i && solo ? 'score' : `[${i}]`}
            nameAt={!i && solo ? c('oneBox') + 6 : c('number') + i * 6}
            value={v}
            valueTone="int"
            valueAt={appear + 8}
            appear={appear}
            exit={life.to - 10 + i * 2}
            glow={i ? 0 : windowed(frame, c('zero'), life.to, 4, 10)}
          />
        );
      })}
      <Tag x={540} y={900} at={c('zero')} exit={life.to - 12} text="the index starts at 0" color={CONCEPT.api.main} size={40} />
    </>
  );
};

const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const {c, scene} = useCues();
  const recap = scene('recap');
  return (
    <>
      <CodeAnatomy
        y={420}
        fontSize={110}
        appear={recap.from + 4}
        exit={recap.to - 8}
        parts={[
          {text: 'scores', color: SYN2.plain, label: 'one name', tone: 'dotnet', at: c('rName')},
          {text: '[', color: SYN2.punct},
          {text: '0', color: SYN2.number, label: 'index', tone: 'api', at: c('rIndex')},
          {text: ']', color: SYN2.punct},
        ]}
      />
      {VALUES.map((v, i) => (
        <VarBox
          key={v}
          x={XS[i]}
          y={820}
          w={260}
          h={210}
          tone="dotnet"
          name={`[${i}]`}
          nameAt={c('rMany') + i * 5 + 4}
          value={v}
          valueTone="int"
          valueAt={c('rMany') + i * 5 - 40}
          appear={c('rMany') + i * 5}
          exit={recap.to - 8}
          glow={i ? 0 : windowed(frame, c('rZero'), recap.to, 4, 10)}
        />
      ))}
    </>
  );
};

export const Day05: React.FC = () => {
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
    {tokens: cs('int[] scores = { 90, 75, 82 };'), typeAt: c('line:decl') + 8, speed: 1},
    {tokens: cs('')},
    {tokens: cs('Console.WriteLine(scores[0]);'), typeAt: c('line:access') + 2, speed: 0.85},
    {tokens: cs('Console.WriteLine(scores[2]);'), typeAt: 'chain', speed: 0.85},
    {tokens: cs('Console.WriteLine(scores.Length);'), typeAt: c('line:length') - 14, speed: 0.75},
  ];
  const vals = [17, 21, 25];
  const idxEnd = c('line:first:end') + 6;

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'fifty', pose: 'shrug'},
      {at: 'fiftyVars', pose: 'explain'},
      {at: 'day5', pose: 'wave'},
      {at: life.from, pose: 'explain'},
      {at: 'oneBox', pose: {point: [540, 640]}},
      {at: 'row', pose: {point: [875, 690]}},
      {at: 'oneName', pose: {point: [540, 400]}},
      {at: 'line:life:end', pose: 'explain'},
      {at: 'number', pose: {point: [540, 690]}},
      {at: 'zero', pose: {point: [205, 690]}},
      {at: 'line:index:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'intArr', pose: {point: [230, 370]}},
      {at: 'braces', pose: {point: [640, 370]}},
      {at: 'line:values:end', pose: 'explain'},
      {at: 'index', pose: {point: [560, 370]}},
      {at: 'zeroFirst', pose: {point: [700, 490]}},
      {at: 'twoThird', pose: {point: [700, 550]}},
      {at: 'line:first:end', pose: 'explain'},
      {at: 'length', pose: {point: [640, 610]}},
      {at: 'line:length:end', pose: 'explain'},
      {at: 'n1', pose: {point: [200, 900]}},
      {at: 'line:run:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: 'rName', pose: {point: [441, 420]}},
      {at: 'rMany', pose: {point: [540, 820]}},
      {at: 'rIndex', pose: {point: [738, 420]}},
      {at: 'rZero', pose: {point: [205, 820]}},
      {at: 'line:recap:end', pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'day5done', pose: 'openToViewer'},
      {at: 'seeYou', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'arrays', v: 0.85},
      {at: 'line:life', v: 0.55},
      {at: 'zero', v: 0.8},
      {at: 'line:decl', v: 0.55},
      {at: 'n1', v: 0.85},
      {at: 'line:recap', v: 0.6},
      {at: 'line:bye', v: 0.85},
      {at: 'line:bye:end', v: 1},
    ],
    brows: [
      {at: 'line:hook', v: 0.8, hold: 50},
      {at: 'zero', v: 0.7, hold: 24},
      {at: 'zeroFirst', v: 0.6, hold: 24},
      {at: 'rZero', v: 0.6, hold: 24},
      {at: 'line:bye', v: 0.5, hold: 30},
    ],
  };

  const keyFrames = editorKeyFrames(lines);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={life.from + 10}>
        <FloatingChips
          at={c('fifty') - 4}
          until={c('fiftyVars') + 30}
          items={[
            {text: 'score1', tone: 'int', x: 205, y: 905, at: c('fifty') - 4},
            {text: 'score2', tone: 'str', x: 875, y: 880, at: c('fifty') + 2},
            {text: 'score3', tone: 'bool', x: 195, y: 1160, at: c('fifty') + 8},
            {text: 'score50', tone: 'warm', x: 885, y: 1150, at: c('fifty') + 14},
          ]}
        />
      </Within>

      <Within from={life.from} to={life.to + 4}>
        <Row />
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
            {at: c('brackets'), until: c('braces'), spans: [{row: 0, from: 0, to: 5}], label: 'array of int', tone: 'dotnet'},
            {at: c('braces'), until: c('line:values:end') + 10, spans: [{row: 0, from: 15, to: 29}], label: 'values', tone: 'int'},
            ...vals.map((from, i) => ({at: c('index') + i * 5, until: idxEnd, spans: [{row: 0, from, to: from + 2}], label: `${i}`, tone: 'api' as const})),
            {at: c('zeroFirst'), until: c('twoThird'), spans: [{row: 0, from: 17, to: 19}, {row: 2, from: 18, to: 27}], tone: 'csharp'},
            {at: c('twoThird'), until: idxEnd, spans: [{row: 0, from: 25, to: 27}, {row: 3, from: 18, to: 27}], tone: 'csharp'},
            {at: c('length') + 6, until: c('n1') - 14, spans: [{row: 4, from: 18, to: 31}], label: 'how many', tone: 'aspnet'},
            ...[2, 3, 4].map((row, i) => ({at: c(`n${i + 1}`), until: i < 2 ? c(`n${i + 2}`) : code.to, spans: [{row, from: 0, to: row === 4 ? 33 : 29}], tone: 'csharp' as const})),
          ]}
          runs={[{at: c('n1') - 14, output: '90\n82\n3', lineAt: ['n1', 'n2', 'n3'].map((k) => c(k))}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Recap />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={5} nextDay={6} nextTitle="foreach" doneAt={c('day5done')} nextAt={c('day6')} glowAt={c('foreach')} />
      </Within>

      <SeriesBadge pulseAt={c('day5')} />
      <Captions />

      {[life.from - 6, code.from - 6, recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['fifty', 'oneBox', 'row', 'oneName', 'number', 'zero', 'brackets', 'braces', 'index', 'zeroFirst', 'twoThird', 'length', 'rName', 'rMany', 'rIndex', 'day6'].map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.22} />
      ))}
      {['n1', 'n2', 'n3'].map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.16} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('n1') - 14} name="key2" volume={0.5} />
      <Sfx at={c('day5done')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
