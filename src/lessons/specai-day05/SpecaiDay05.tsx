/** Spec-Driven AI Day 5 storyboard: "Write the Test First, Let AI Pass It" (timed from cues in script.json). */
import React from 'react';
import {FlaskConical} from 'lucide-react';
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

const L0 = 'from slug import slugify';
const L1 = 'def test_slug():';
const L2 = '    assert slugify("Hi There") == "hi-there"';
const CMD = 'pytest';
const RED = '❌ 1 error';
const GREEN = '✅ 1 passed';

const txt = (line: string): Tok[] => [{t: line, c: SYN2.plain}];

const Card: React.FC<{y: number; label: string; text: string; words: string; tone: 'api' | 'csharp' | 'dotnet'; exit: number; size?: number}> = (p) => {
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
      <div style={{marginTop: 10, fontWeight: 500, fontSize: p.size ?? 38, color: C.paper, lineHeight: 1.25, whiteSpace: 'pre-wrap'}}>{p.text}</div>
    </div>
  );
};

/** Frame-0 payoff: hook text over the finished test and the passing result. */
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
        Test first, <span style={{color: CONCEPT.dotnet.main}}>AI passes it</span>
      </div>
      <Card y={540} label="test_slug.py" words="the test" tone="csharp" text={`${L0}\n${L1}\n${L2}`} exit={exit} size={36} />
      <Card y={960} label="pytest" words="result" tone="dotnet" text={GREEN} exit={exit} size={50} />
    </>
  );
};

export const SpecaiDay05: React.FC = () => {
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
    {tokens: txt(L0), typeAt: c('line:idea') + 2, speed: 1.6},
    {tokens: txt(L1), typeAt: c('line:idea') + 30, speed: 1.6},
    {tokens: txt(L2), typeAt: c('line:l1') + 2, speed: 1.6},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'hookW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'l1W', pose: {point: [400, 400]}},
      {at: 'redW', pose: {point: [200, 700]}},
      {at: 'askW', pose: 'explain'},
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
          filename="test_slug.py"
          lang="Python"
          command={CMD}
          lines={lines}
          fontSize={22}
          lineHeight={50}
          rows={3}
          termHeight={330}
          highlights={[
            {at: c('l1W'), until: c('line:l1:end') + 10, spans: [{row: 2, from: 34, to: 44}], tone: 'csharp'},
          ]}
          runs={[
            {at: c('runW') - 6, output: RED, lineAt: [c('runW'), c('askW') - 30, c('askW') - 10]},
            {at: c('resW') - 6, output: GREEN, lineAt: [c('resW'), c('line:res:end') - 20, c('line:res:end') - 5]},
          ]}
        />
      </Within>

      <Within from={c('askW') - 4} to={c('resW') - 4}>
        <Card y={560} label="to the AI" words="prompt" tone="api" text={'Make test_slug.py pass.\nDo not edit the test.'} exit={c('resW') - 14} size={36} />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="csharp" label="red test, green code" labelSize={40} Icon={FlaskConical} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="the test is the spec" color={CONCEPT.csharp.main} size={42} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={5} nextDay={6} nextTitle="Acceptance Criteria" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('ideaW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['hookW', 'ideaW', 'l1W', 'askW', 'resW', 'tkW', 'plug'].map((key) => (
        <Sfx key={key} at={c(key)} name="pop" volume={0.22} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('runW') - 6} name="key2" volume={0.5} />
      <Sfx at={c('resW') - 6} name="key2" volume={0.5} />
      <Sfx at={c('end')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
