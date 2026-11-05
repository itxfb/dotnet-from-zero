/** AI Debugging Day 2 storyboard: "Make AI Reproduce the Bug First" (timed from cues in script.json). */
import React from 'react';
import {ScanSearch} from 'lucide-react';
import {useCurrentFrame} from 'remotion';
import {Captions} from '../../components/Captions';
import {cs, Editor, editorKeyFrames, EdEdit, EdLine, SYN2} from '../../components/Editor';
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

const L = ['int Add(int a, int b) => a - b;', 'Console.WriteLine(Add(2, 3) == 5);'];
const CMD = 'dotnet run';
const RED = 'False';
const GREEN = 'True';
const PROMPT = 'Bug: Add(2, 3) is not 5.\nWrite a one-line repro first.\nDo not fix yet.';

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

/** Frame-0 payoff: hook text over the repro prompt and the False result. */
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
        Make AI <span style={{color: CONCEPT.dotnet.main}}>repro</span> the bug first
      </div>
      <Card y={500} label="Prompt to AI" words="repro" tone="csharp" text={PROMPT} exit={exit} size={34} />
      <Card y={860} label="Repro: bug proven" words="result" tone="dotnet" text={[L[0], L[1], '// dotnet run  ->  False'].join('\n')} exit={exit} size={30} />
    </>
  );
};

export const AidebugDay02: React.FC = () => {
  const {c, scene} = useCues();
  const code = scene('code');
  const recap = scene('recap');
  const outro = scene('outro');

  const shots: ShotKey[] = [
    {at: 0, shot: 'code'},
    {at: recap.from - 6, shot: 'teach', dur: 26},
    {at: outro.from - 6, shot: 'outro', dur: 28},
  ];

  const lines: EdLine[] = L.map((line, i) => ({
    tokens: cs(line),
    typeAt: i === 0 ? code.from + 2 : 'chain',
    speed: 0.9,
  }));

  const edits: EdEdit[] = [{at: c('l2W'), row: 0, from: 27, to: 28, text: '+', color: SYN2.number}];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'hookW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'ideaW', pose: {point: [400, 400]}},
      {at: 'runW', pose: {point: [200, 700]}},
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

  const keyFrames = editorKeyFrames(lines, edits);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={code.from + 8}>
        <Payoff exit={code.from - 4} />
      </Within>

      <Within from={code.from - 2} to={code.to + 6}>
        <Editor
          rect={{x: 40, y: 236, w: 1000, h: 650}}
          enter={code.from}
          exit={code.to - 8}
          filename="Program.cs"
          lang="C#"
          command={CMD}
          lines={lines}
          edits={edits}
          fontSize={30}
          lineHeight={56}
          rows={2}
          termHeight={300}
          highlights={[
            {at: c('ideaW'), until: c('line:idea:end') + 10, spans: [{row: 0, from: 0, to: L[0].length}], tone: 'csharp'},
            {at: c('l2W'), until: c('line:l2:end') + 10, spans: [{row: 0, from: 27, to: 28}], tone: 'dotnet'},
          ]}
          runs={[
            {at: c('runW') + 6, output: RED, lineAt: [c('runW') + 8, c('falW'), c('line:run:end') - 5]},
            {at: c('resW') - 6, output: GREEN, lineAt: [c('resW'), c('line:res:end') - 20, c('line:res:end') - 5]},
          ]}
        />
      </Within>

      <Within from={c('l1W') - 4} to={c('runW') - 4}>
        <Card y={905} label="Prompt" words="repro" tone="csharp" text={PROMPT} exit={c('runW') - 14} size={30} />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="csharp" label="repro = proof" labelSize={40} Icon={ScanSearch} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="no repro, no proof" color={CONCEPT.csharp.main} size={42} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={2} nextDay={3} nextTitle="Bisect a Regression" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('ideaW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['hookW', 'ideaW', 'l1W', 'resW', 'tkW', 'plug'].map((key) => (
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
