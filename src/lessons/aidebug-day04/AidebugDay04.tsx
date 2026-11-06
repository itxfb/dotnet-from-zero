/** AI Debugging Day 4 storyboard: "Add Logging That Finds the Bug" (timed from cues in script.json). */
import React from 'react';
import {ScrollText} from 'lucide-react';
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

const L = ['int price = 20, qty = 3;', 'Console.WriteLine($"price={price} qty={qty}");', 'Console.WriteLine(price + qty);'];
const CMD = 'dotnet run';
const OUT1 = 'price=20 qty=3\n23';
const OUT2 = 'price=20 qty=3\n60';
const PROMPT = 'Add a log line that prints\nprice and qty before the total.';

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

/** Frame-0 payoff: hook text over the log line and the output it prints. */
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
        <span style={{color: CONCEPT.dotnet.main}}>Log</span> it, find the bug
      </div>
      <Card y={500} label="Log line" words="1 line" tone="csharp" text={L[1]} exit={exit} size={30} />
      <Card y={760} label="Output" words="inputs" tone="dotnet" text={OUT1} exit={exit} size={40} />
    </>
  );
};

export const AidebugDay04: React.FC = () => {
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

  const edits: EdEdit[] = [{at: c('l2W') + 10, row: 2, from: 24, to: 25, text: '*', color: SYN2.number}];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'hookW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'ideaW', pose: {point: [400, 400]}},
      {at: 'runW', pose: {point: [200, 700]}},
      {at: 'res2W', pose: {point: [200, 700]}},
      {at: 'line:ai:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'end', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'res2W', v: 0.85},
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
          rows={3}
          termHeight={300}
          highlights={[
            {at: c('l1W'), until: c('line:l1:end') + 10, spans: [{row: 1, from: 20, to: 43}], tone: 'csharp'},
            {at: c('l2W'), until: c('line:l2:end') + 10, spans: [{row: 2, from: 24, to: 25}], tone: 'dotnet'},
          ]}
          runs={[
            {at: c('runW') + 6, output: OUT1, lineAt: [c('runW') + 8, c('resW'), c('line:run:end') - 5]},
            {at: c('run2W') - 6, output: OUT2, lineAt: [c('run2W'), c('res2W'), c('line:run2:end') - 5]},
          ]}
        />
      </Within>

      <Within from={c('aiW') - 4} to={code.to + 4}>
        <Card y={905} label="Prompt to AI" words="logs" tone="csharp" text={PROMPT} exit={code.to - 12} size={32} />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="csharp" label="log = x-ray" labelSize={40} Icon={ScrollText} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="log inputs, then trust output" color={CONCEPT.csharp.main} size={42} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={4} nextDay={5} nextTitle="AI Reviews Every PR" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('ideaW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['hookW', 'ideaW', 'l1W', 'resW', 'res2W', 'aiW', 'tkW', 'plug'].map((key) => (
        <Sfx key={key} at={c(key)} name="pop" volume={0.22} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('runW')} name="key2" volume={0.5} />
      <Sfx at={c('run2W')} name="key2" volume={0.5} />
      <Sfx at={c('end')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
