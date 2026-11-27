/** Code Search RAG Day 2 storyboard: "Search Your Docs with Cosine Similarity" (timed from cues in script.json). */
import React from 'react';
import {Sigma} from 'lucide-react';
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
const CMD = 'python search.py';
const CODE = [
  'from sentence_transformers import SentenceTransformer',
  'model = SentenceTransformer("all-MiniLM-L6-v2")',
  'docs = ["Reset your password in Settings.",',
  '        "Invoices are emailed monthly.",',
  '        "Delete your account from Profile."]',
  'd = model.encode(docs)',
  'q = model.encode("How do I change my password?")',
  'scores = model.similarity(q, d)[0]',
  'print(docs[int(scores.argmax())])',
];
const at = (row: number, s: string) => ({row, from: CODE[row].indexOf(s), to: CODE[row].indexOf(s) + s.length});
const OUT = 'Reset your password in Settings.';

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

/** Frame-0 payoff: hook text over the question and the doc it finds. */
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
        Find the <span style={{color: CONCEPT.dotnet.main}}>right doc</span>
        <br />
        in <span style={{color: CONCEPT.api.main}}>one line</span>
      </div>
      <Card y={500} label="Question" words="ask" tone="dotnet" text={'How do I change my password?'} exit={exit} size={34} />
      <Card y={780} label="Best doc" words="result" tone="csharp" text={OUT} exit={exit} size={36} />
    </>
  );
};

export const CoderagDay02: React.FC = () => {
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
    tokens: tk(t, i === 5 || i === 6 || i === 7 ? SYN2.method : SYN2.plain),
    typeAt: i === 0 ? code.from + 2 : 'chain',
    speed: 0.25,
  }));

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'hookW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'dcW', pose: {point: [400, 420]}},
      {at: 'quW', pose: {point: [400, 520]}},
      {at: 'scW', pose: {point: [400, 600]}},
      {at: 'bsW', pose: {point: [400, 700]}},
      {at: 'rnW', pose: {point: [400, 800]}},
      {at: 'line:rn:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'end', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'rnW', v: 0.9},
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
          filename="search.py"
          lang="Python"
          command={CMD}
          lines={lines}
          fontSize={22}
          lineHeight={40}
          rows={9}
          termHeight={260}
          highlights={[
            {at: c('dcW') - 2, until: c('quW') - 2, spans: [at(5, 'model.encode(docs)')], tone: 'dotnet'},
            {at: c('quW') - 2, until: c('scW') - 2, spans: [at(6, 'model.encode("How do I change my password?")')], tone: 'api'},
            {at: c('scW') - 2, until: c('bsW') - 2, spans: [at(7, 'model.similarity(q, d)[0]')], tone: 'csharp'},
            {at: c('bsW') - 2, until: code.to - 8, spans: [at(8, 'scores.argmax()')], tone: 'dotnet'},
          ]}
          runs={[{at: c('rnW') + 6, output: OUT, lineAt: [c('rnW') + 18, c('rnW') + 28]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="csharp" label="Highest score wins" labelSize={40} Icon={Sigma} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="cosine similarity ranks your docs" color={CONCEPT.csharp.main} size={38} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <div style={{position: 'absolute', inset: 0, transform: 'translateY(-90px) scale(0.8)', transformOrigin: '50% 0'}}>
          <EndCard day={2} nextDay={3} nextTitle="Split Code into Chunks by Function" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} compact />
        </div>
      </Within>

      <SeriesBadge pulseAt={c('dcW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['hookW', 'dcW', 'quW', 'scW', 'bsW', 'rnW', 'tkW', 'plug'].map((key) => (
        <Sfx key={key} at={c(key)} name="pop" volume={0.22} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('end')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
