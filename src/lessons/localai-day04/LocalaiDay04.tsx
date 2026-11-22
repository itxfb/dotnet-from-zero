/** Local AI Coding Day 4 storyboard: "Pick a Model That Fits Your RAM" (timed from cues in script.json). */
import React from 'react';
import {HardDrive} from 'lucide-react';
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
const CMD = 'bash pull.sh';
const CODE = [
  'ollama pull qwen2.5-coder:3b  # 8 GB RAM',
  'ollama pull qwen2.5-coder:7b  # 16 GB RAM',
  'ollama list',
];
const at = (row: number, s: string) => ({row, from: CODE[row].indexOf(s), to: CODE[row].indexOf(s) + s.length});
const OUT = 'NAME               SIZE\nqwen2.5-coder:7b   4.7 GB\nqwen2.5-coder:3b   1.9 GB';

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

/** Frame-0 payoff: hook text over the two finished pull commands and their sizes. */
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
        Will it fit your <span style={{color: CONCEPT.dotnet.main}}>RAM</span>?
      </div>
      <Card y={430} label="8 GB RAM" words="3b" tone="dotnet" text={'ollama pull qwen2.5-coder:3b\nsize: 1.9 GB'} exit={exit} size={34} />
      <Card y={710} label="16 GB RAM" words="7b" tone="api" text={'ollama pull qwen2.5-coder:7b\nsize: 4.7 GB'} exit={exit} size={34} />
    </>
  );
};

export const LocalaiDay04: React.FC = () => {
  const {c, scene} = useCues();
  const code = scene('code');
  const recap = scene('recap');
  const outro = scene('outro');

  const shots: ShotKey[] = [
    {at: 0, shot: 'code'},
    {at: recap.from - 6, shot: 'teach', dur: 26},
    {at: outro.from - 6, shot: 'outro', dur: 28},
  ];

  const lines: EdLine[] = CODE.map((t, i) => ({
    tokens: tk(t, SYN2.method),
    typeAt: i === 0 ? code.from + 2 : 'chain',
    speed: 0.25,
  }));

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'hookW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'e8W', pose: {point: [400, 420]}},
      {at: 's16W', pose: {point: [400, 470]}},
      {at: 'lsW', pose: {point: [400, 520]}},
      {at: 'line:ls:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'end', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'lsW', v: 0.9},
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
          rect={{x: 40, y: 215, w: 1000, h: 900}}
          enter={code.from}
          exit={code.to - 8}
          filename="pull.sh"
          lang="Bash"
          command={CMD}
          lines={lines}
          fontSize={30}
          lineHeight={46}
          rows={3}
          termHeight={300}
          highlights={[
            {at: c('szW') - 2, until: c('e8W') - 2, spans: [at(0, '# 8 GB RAM'), at(1, '# 16 GB RAM')], tone: 'csharp'},
            {at: c('e8W') - 2, until: c('s16W') - 2, spans: [at(0, ':3b')], tone: 'dotnet'},
            {at: c('s16W') - 2, until: c('lsW') - 2, spans: [at(1, ':7b')], tone: 'api'},
            {at: c('lsW') - 2, until: code.to - 8, spans: [at(2, 'ollama list')], tone: 'api'},
          ]}
          runs={[{at: c('lsW') + 6, output: OUT, lineAt: [c('lsW') + 18, c('lsW') + 28, c('lsW') + 38]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="api" label="Size below your RAM" labelSize={40} Icon={HardDrive} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="ollama list" color={CONCEPT.api.main} size={38} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <div style={{position: 'absolute', inset: 0, transform: 'translateY(-90px)'}}>
          <EndCard day={4} nextDay={5} nextTitle="Point Your Code at a Local Endpoint" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
        </div>
      </Within>

      <SeriesBadge pulseAt={c('szW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['hookW', 'szW', 'e8W', 's16W', 'lsW', 'tkW', 'plug'].map((key) => (
        <Sfx key={key} at={c(key)} name="pop" volume={0.22} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('end')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
