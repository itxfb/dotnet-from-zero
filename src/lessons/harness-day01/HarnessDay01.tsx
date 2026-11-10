/** Agent Harness Day 1 storyboard: "Give Your Agent a One-Command Check" (timed from cues in script.json). */
import React from 'react';
import {CheckCircle2} from 'lucide-react';
import {useCurrentFrame} from 'remotion';
import {Captions} from '../../components/Captions';
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

const tk = (t: string, c: string = SYN2.plain) => (t ? [{t, c}] : []);
const CMD = 'npm run check';
const L0 = '{';
const L1 = '  "scripts": {';
const L2 = '    "check": "tsc --noEmit && npm test"';
const L3 = '  }';
const L4 = '}';
const OUT_OK = 'Types OK, 13 tests passed';

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

/** Frame-0 payoff: hook text over the finished check script and the passing run. */
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
        <span style={{color: CONCEPT.csharp.main}}>One command</span> checks your agent!
      </div>
      <Card y={470} label="package.json" words="check" tone="dotnet" text={`${L0}\n${L1}\n${L2}\n${L3}\n${L4}`} exit={exit} size={40} />
      <Card y={1000} label={CMD} words="green" tone="api" text={OUT_OK} exit={exit} size={40} />
    </>
  );
};

export const HarnessDay01: React.FC = () => {
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
    {tokens: [...tk(L0, SYN2.punct)], typeAt: code.from + 2, speed: 0.9},
    {tokens: [...tk('  '), {t: '"scripts"', c: SYN2.type}, ...tk(': {', SYN2.punct)], typeAt: 'chain', speed: 0.9},
    {tokens: [...tk('    '), {t: '"check"', c: SYN2.method}, ...tk(': ', SYN2.punct), {t: '"tsc --noEmit && npm test"', c: SYN2.string}], typeAt: 'chain', speed: 0.9},
    {tokens: [...tk('  }', SYN2.punct)], typeAt: 'chain', speed: 0.9},
    {tokens: [...tk('}', SYN2.punct)], typeAt: 'chain', speed: 0.9},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'hookW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'runW', pose: {point: [400, 520]}},
      {at: 'twoW', pose: {point: [700, 520]}},
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

  const keyFrames = editorKeyFrames(lines, []);

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
          filename="package.json"
          lang="JSON"
          command={CMD}
          lines={lines}
          fontSize={30}
          lineHeight={56}
          rows={5}
          termHeight={260}
          highlights={[
            {at: c('runW'), until: c('line:run:end') + 4, spans: [{row: 2, from: 4, to: 11}], tone: 'csharp'},
            {at: c('oneW'), until: c('line:one:end') + 4, spans: [{row: 2, from: 14, to: 26}], tone: 'api'},
            {at: c('twoW'), until: c('line:two:end') + 4, spans: [{row: 2, from: 30, to: 38}], tone: 'dotnet'},
          ]}
          runs={[{at: c('okW') - 4, output: OUT_OK, lineAt: [c('okW')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="csharp" label="One check command" labelSize={40} Icon={CheckCircle2} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="run it before 'done'" color={CONCEPT.csharp.main} size={42} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={1} nextDay={2} nextTitle="Block Bad Commits with a Pre-Commit Gate" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('runW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['hookW', 'runW', 'oneW', 'twoW', 'okW', 'tkW', 'plug'].map((key) => (
        <Sfx key={key} at={c(key)} name="pop" volume={0.22} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('end')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
