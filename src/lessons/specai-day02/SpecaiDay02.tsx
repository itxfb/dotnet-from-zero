/** Spec-Driven AI Day 2 storyboard: "Write an AGENTS.md in 10 Lines" (timed from cues in script.json). */
import React from 'react';
import {ListChecks} from 'lucide-react';
import {useCurrentFrame} from 'remotion';
import {Captions} from '../../components/Captions';
import type {Tok} from '../../components/CodeEditor';
import {Editor, editorKeyFrames, EdLine, SYN2} from '../../components/Editor';
import {EndCard} from '../../components/EndCard';
import {Direction} from '../../components/instructor/Instructor';
import {Module, Tag} from '../../components/Module';
import {SeriesBadge} from '../../components/SeriesBadge';
import {Studio} from '../../components/Studio';
import {Sfx, ShotKey, ShotProvider, Within} from '../../engine/direction';
import {CueRef, getScene, ramp, resolveCue, useTimeline} from '../../engine/timeline';
import {C, CONCEPT, FONT, hexA} from '../../theme';

const useCues = () => {
  const tl = useTimeline();
  return {c: (r: CueRef) => resolveCue(tl, r), scene: (id: string) => getScene(tl, id)};
};

const L0 = '# AGENTS.md';
const L1 = '- Build: npm run build';
const L2 = '- Test: npm test';
const L3 = '- Style: TypeScript, no any';
const L4 = '- Never edit dist/';
const CMD = 'wc -l AGENTS.md';
const HIT = '5 AGENTS.md';

/** Plain markdown tokens: heading in keyword colour, list dash in method colour. */
const md = (line: string): Tok[] => {
  if (line.startsWith('#')) return [{t: line, c: SYN2.keyword}];
  return [
    {t: line.slice(0, 2), c: SYN2.method},
    {t: line.slice(2), c: SYN2.plain},
  ];
};

const Card: React.FC<{y: number; label: string; text: string; words: string; tone: 'api' | 'csharp'; exit: number; size?: number}> = (p) => {
  const frame = useCurrentFrame();
  const out = ramp(frame, p.exit, 10);
  const col = CONCEPT[p.tone].main;
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        width: 940,
        top: p.y,
        padding: '22px 30px',
        borderRadius: 28,
        background: 'rgba(14,14,42,0.92)',
        border: `3px solid ${hexA(col, 0.8)}`,
        boxShadow: `0 0 36px ${hexA(col, 0.3)}`,
        opacity: 1 - out,
        fontFamily: FONT.display,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 40, color: col}}>
        <span>{p.label}</span>
        <span>{p.words}</span>
      </div>
      <div style={{marginTop: 10, fontWeight: 500, fontSize: p.size ?? 38, color: C.paper, lineHeight: 1.25, whiteSpace: 'pre-line'}}>{p.text}</div>
    </div>
  );
};

/** Frame-0 payoff: hook text over the finished file and its line count. */
const Payoff: React.FC<{exit: number}> = ({exit}) => {
  const frame = useCurrentFrame();
  const out = ramp(frame, exit, 10);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 40,
          width: 1000,
          top: 205,
          textAlign: 'center',
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 80,
          lineHeight: 1.05,
          color: C.paper,
          opacity: 1 - out,
          textShadow: '0 6px 30px rgba(0,0,0,0.6)',
        }}
      >
        Agent <span style={{color: CONCEPT.api.main}}>rules</span> in 5 lines
      </div>
      <Card y={540} label="AGENTS.md" words="5 lines" tone="csharp" text={`${L1}\n${L2}\n${L3}\n${L4}`} exit={exit} size={31} />
      <Card y={920} label="wc -l" words="count" tone="api" text="5 AGENTS.md" exit={exit} size={38} />
    </>
  );
};

export const SpecaiDay02: React.FC = () => {
  const {c, scene} = useCues();
  const code = scene('code');
  const recap = scene('recap');
  const outro = scene('outro');

  const shots: ShotKey[] = [
    {at: 0, shot: 'code'},
    {at: recap.from - 6, shot: 'teach', dur: 26},
    {at: outro.from - 6, shot: 'outro', dur: 28},
  ];

  const lines: EdLine[] = [
    {tokens: md(L0), typeAt: c('line:idea') + 2, speed: 1.2},
    {tokens: md(L1), typeAt: c('line:l1') + 2, speed: 1.6},
    {tokens: md(L2), typeAt: c('line:l2') + 2, speed: 1.3},
    {tokens: md(L3), typeAt: c('line:l3') + 2, speed: 1.3},
    {tokens: md(L4), typeAt: c('line:l4') + 2, speed: 1.3},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'hookW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'l1W', pose: {point: [300, 340]}},
      {at: 'l2W', pose: {point: [400, 400]}},
      {at: 'l3W', pose: {point: [400, 450]}},
      {at: 'l4W', pose: {point: [400, 500]}},
      {at: 'resW', pose: {point: [200, 700]}},
      {at: 'line:res:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'end', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'resW', v: 0.85},
      {at: 'line:tk', v: 0.7},
      {at: 'line:bye', v: 0.9},
    ],
    brows: [
      {at: 'line:hook', v: 0.7, hold: 40},
      {at: 'line:q', v: 0.5, hold: 30},
    ],
  };

  const keyFrames = editorKeyFrames(lines);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={code.from + 8}>
        <Payoff exit={code.from - 4} />
      </Within>

      <Within from={code.from - 2} to={code.to + 6}>
        <Editor
          rect={{x: 56, y: 236, w: 968, h: 920}}
          enter={code.from}
          exit={code.to - 8}
          filename="AGENTS.md"
          lang="Markdown"
          command={CMD}
          lines={lines}
          fontSize={22}
          lineHeight={50}
          rows={5}
          termHeight={330}
          highlights={[
            {at: c('l1W'), until: c('line:l1:end') + 10, spans: [{row: 1, from: 9, to: 22}], tone: 'csharp'},
            {at: c('l2W'), until: c('line:l2:end') + 10, spans: [{row: 2, from: 8, to: 16}], tone: 'csharp'},
            {at: c('l3W'), until: c('line:l3:end') + 10, spans: [{row: 3, from: 9, to: 27}], tone: 'csharp'},
            {at: c('l4W'), until: c('line:l4:end') + 10, spans: [{row: 4, from: 2, to: 7}], tone: 'api'},
          ]}
          runs={[{at: c('runW') - 6, output: HIT, lineAt: [c('runW'), c('resW') - 30, c('resW') - 10]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="csharp" label="short rules" labelSize={40} Icon={ListChecks} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="under 10 lines" color={CONCEPT.csharp.main} size={42} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={2} nextDay={3} nextTitle="Spec to Task Checklist" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('ideaW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['hookW', 'ideaW', 'l1W', 'l2W', 'l3W', 'l4W', 'resW', 'tkW', 'plug'].map((key) => (
        <Sfx key={key} at={c(key)} name="pop" volume={0.22} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('runW') - 6} name="key2" volume={0.5} />
      <Sfx at={c('end')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
