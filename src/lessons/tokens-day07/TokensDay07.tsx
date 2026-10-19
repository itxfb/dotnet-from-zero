/** Token Saver Day 7 storyboard: "Point to Files, Don't Paste" (timed from cues in script.json). */
import React from 'react';
import {Zap} from 'lucide-react';
import {useCurrentFrame} from 'remotion';
import {Captions} from '../../components/Captions';
import {cs, Editor, editorKeyFrames, EdLine} from '../../components/Editor';
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
      <div style={{marginTop: 10, fontWeight: 500, fontSize: p.size ?? 38, color: C.paper, lineHeight: 1.25}}>{p.text}</div>
    </div>
  );
};

/** Frame-0 payoff: a whole pasted file next to the one-line file path, under the hook text. */
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
          fontSize: 84,
          lineHeight: 1.05,
          color: C.paper,
          opacity: 1 - out,
          textShadow: '0 6px 30px rgba(0,0,0,0.6)',
        }}
      >
        Point to files, <span style={{color: CONCEPT.api.main}}>don't paste</span>
      </div>
      <Card y={470} label="PASTE" words="4000 chars" tone="csharp" text="[ whole Cart.cs pasted here: using System; class Cart { ... 200 more lines ... } ]" exit={exit} />
      <Card y={760} label="POINT" words="26 chars" tone="api" text="Fix Save() in @src/Cart.cs" size={46} exit={exit} />
    </>
  );
};

export const TokensDay07: React.FC = () => {
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
    {tokens: cs('int pasted = 4000;'), typeAt: c('line:big') + 2, speed: 0.7},
    {tokens: cs('string ask = "Fix Save() in @src/Cart.cs";'), typeAt: c('line:ask') + 2, speed: 0.9},
    {tokens: cs('Console.WriteLine($"{ask.Length} vs {pasted}");'), typeAt: c('line:cnt') + 2, speed: 0.6},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'pasteW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'askW', pose: {point: [300, 340]}},
      {at: 'atW', pose: {point: [600, 400]}},
      {at: 'cntW', pose: {point: [300, 460]}},
      {at: 'n1', pose: {point: [200, 700]}},
      {at: 'line:run:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'end', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'n1', v: 0.85},
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
          filename="Program.cs"
          lang="C#"
          command="dotnet run"
          lines={lines}
          fontSize={26}
          lineHeight={50}
          rows={3}
          termHeight={310}
          highlights={[
            {at: c('bigW'), until: c('line:big:end') + 4, spans: [{row: 0, from: 13, to: 17}], tone: 'dotnet'},
            {at: c('atW'), until: c('line:at:end') + 4, spans: [{row: 1, from: 28, to: 40}], tone: 'api'},
            {at: c('cntW'), until: c('line:cnt:end') + 4, spans: [{row: 2, from: 21, to: 31}], tone: 'csharp'},
          ]}
          runs={[{at: c('n1') - 14, output: '26 vs 4000', lineAt: [c('n1')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="api" label="point, don't paste" labelSize={44} Icon={Zap} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="send the path, not the file" color={CONCEPT.csharp.main} size={42} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={7} nextDay={8} nextTitle="Cheaper Model" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('bigW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['pasteW', 'bigW', 'askW', 'atW', 'cntW', 'tkW', 'plug'].map((key) => (
        <Sfx key={key} at={c(key)} name="pop" volume={0.22} />
      ))}
      <Sfx at={c('n1')} name="pop" volume={0.16} />
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('n1') - 14} name="key2" volume={0.5} />
      <Sfx at={c('end')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
