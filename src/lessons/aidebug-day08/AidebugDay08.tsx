/** AI Debugging Day 8 storyboard: "Debug a Failing CI Run from Logs" (timed from cues in script.json). */
import React from 'react';
import {ShieldCheck} from 'lucide-react';
import {useCurrentFrame} from 'remotion';
import {Captions} from '../../components/Captions';
import {Editor, editorKeyFrames, EdEdit, EdLine, SYN2} from '../../components/Editor';
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

const tk = (t: string, c: string = SYN2.plain) => (t ? [{t, c}] : []);
const CMD = 'gh run view --log-failed';
const OUT_BAD = 'npm error Unknown command: "tset"';
const OUT_OK = '(nothing failed)';

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

/** Frame-0 payoff: hook text over the broken CI step and the failed-log result. */
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
        <span style={{color: CONCEPT.csharp.main}}>CI is red?</span> Read the log!
      </div>
      <Card y={500} label="ci.yml" words="red" tone="dotnet" text="- run: npm tset" exit={exit} size={40} />
      <Card y={760} label={CMD} words="failed log" tone="csharp" text={OUT_BAD} exit={exit} size={36} />
    </>
  );
};

export const AidebugDay08: React.FC = () => {
  const {c, scene} = useCues();
  const code = scene('code');
  const recap = scene('recap');
  const outro = scene('outro');

  const shots: ShotKey[] = [
    {at: 0, shot: 'code'},
    {at: recap.from - 6, shot: 'teach', dur: 26},
    {at: outro.from - 6, shot: 'outro', dur: 28},
  ];

  const k = SYN2.keyword;
  const n = SYN2.number;
  const p = SYN2.punct;
  const lines: EdLine[] = [
    {tokens: [...tk('steps:', k)], typeAt: code.from + 2, speed: 0.9},
    {tokens: [...tk('  - uses: ', p), ...tk('actions/checkout@v4', n)], typeAt: 'chain', speed: 0.9},
    {tokens: [...tk('  - run: ', p), ...tk('npm tset', SYN2.plain)], typeAt: 'chain', speed: 0.9},
  ];

  // row 2: "  - run: npm tset" -> tset spans cols 13..17
  const edits: EdEdit[] = [{at: c('fixW') + 4, row: 2, from: 13, to: 17, text: 'test', color: SYN2.plain}];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'hookW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'runW', pose: {point: [200, 1000]}},
      {at: 'typoW', pose: {point: [400, 400]}},
      {at: 'line:fix:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'end', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'okW', v: 0.9},
      {at: 'line:tk', v: 0.7},
      {at: 'line:bye', v: 0.9},
    ],
    brows: [
      {at: 'line:hook', v: 0.7, hold: 40},
      {at: 'line:q', v: 0.5, hold: 30},
    ],
  };

  const keyFrames = editorKeyFrames(lines, edits);

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
          filename="ci.yml"
          lang="YAML"
          command={CMD}
          lines={lines}
          edits={edits}
          fontSize={30}
          lineHeight={56}
          rows={4}
          termHeight={260}
          highlights={[
            {at: c('typoW'), until: c('line:fk:end') + 4, spans: [{row: 2, from: 13, to: 17}], tone: 'dotnet'},
            {at: c('fixW') + 8, until: c('line:fix:end') + 4, spans: [{row: 2, from: 13, to: 17}], tone: 'csharp'},
          ]}
          runs={[
            {at: c('runW') + 6, output: OUT_BAD, lineAt: [c('typoW')]},
            {at: c('okW') - 4, output: OUT_OK, lineAt: [c('okW')]},
          ]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="csharp" label="Read the log" labelSize={40} Icon={ShieldCheck} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="the error is the clue" color={CONCEPT.csharp.main} size={42} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={8} nextDay={9} nextTitle="Stop the AI Fix-Break-Fix Loop" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('runW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['hookW', 'logW', 'askW', 'typoW', 'fixW', 'okW', 'tkW', 'plug'].map((key) => (
        <Sfx key={key} at={c(key)} name="pop" volume={0.22} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('runW')} name="key2" volume={0.5} />
      <Sfx at={c('end')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
