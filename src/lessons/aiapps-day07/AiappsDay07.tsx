/** Build AI Apps Day 7 storyboard: "Cache a Long Prompt to Cut Cost" (timed from cues in script.json). */
import React from 'react';
import {DatabaseZap} from 'lucide-react';
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
const CMD = 'bash ask.sh';
const CODE = [
  'jq -n --rawfile d docs.txt \'{model:"claude-haiku-5-5",',
  '  max_tokens:50, system:[{type:"text", text:$d,',
  '  cache_control:{type:"ephemeral"}}],',
  '  messages:[{role:"user",content:"Summarize it"}]}\' \\',
  '| curl -s https://api.anthropic.com/v1/messages \\',
  '  -H "x-api-key: $ANTHROPIC_API_KEY" \\',
  '  -H "anthropic-version: 2023-06-01" \\',
  '  -H "content-type: application/json" -d @- \\',
  '| jq -c \'.usage | [.cache_creation_input_tokens,',
  '  .cache_read_input_tokens]\'',
];
const at = (row: number, s: string) => ({row, from: CODE[row].indexOf(s), to: CODE[row].indexOf(s) + s.length});
const OUT_WRITE = '[2310,0]';
const OUT_READ = '[0,2310]';

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

/** Frame-0 payoff: hook text over the before/after of the cached prompt. */
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
        Cache it. Pay <span style={{color: CONCEPT.csharp.main}}>10% next time.</span>
      </div>
      <Card y={470} label="Run 1" words="cache write" tone="api" text={'$ bash ask.sh\n[2310,0]   (written, read)'} exit={exit} size={40} />
      <Card y={760} label="Run 2" words="cache read" tone="csharp" text={'$ bash ask.sh\n[0,2310]   (written, read)'} exit={exit} size={40} />
    </>
  );
};

export const AiappsDay07: React.FC = () => {
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
    tokens: tk(t, i === 0 || i === 4 || i === 8 ? SYN2.method : i <= 3 ? SYN2.string : SYN2.plain),
    typeAt: i === 0 ? code.from + 2 : 'chain',
    speed: 0.1,
  }));

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'hookW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'ccW', pose: {point: [400, 500]}},
      {at: 'wrW', pose: {point: [400, 700]}},
      {at: 'rdW', pose: {point: [400, 700]}},
      {at: 'line:rd:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'end', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'tenW', v: 0.9},
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
          rect={{x: 56, y: 236, w: 968, h: 940}}
          enter={code.from}
          exit={code.to - 8}
          filename="ask.sh"
          lang="Bash"
          command={CMD}
          lines={lines}
          fontSize={26}
          lineHeight={52}
          rows={10}
          termHeight={200}
          highlights={[
            {at: c('ccW') - 2, until: c('wrW') - 2, spans: [at(2, 'cache_control')], tone: 'api'},
            {at: c('wrW') - 2, until: c('rdW') - 2, spans: [at(8, '.cache_creation_input_tokens')], tone: 'csharp'},
            {at: c('rdW') - 2, until: code.to - 8, spans: [at(9, '.cache_read_input_tokens')], tone: 'dotnet'},
          ]}
          runs={[
            {at: c('wrW') + 10, output: OUT_WRITE, lineAt: [c('wrW') + 14]},
            {at: c('rdW') - 6, output: OUT_READ, lineAt: [c('rdW')]},
          ]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="csharp" label="Cache = 10% price" labelSize={40} Icon={DatabaseZap} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="cache_control on the long part" color={CONCEPT.csharp.main} size={34} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <div style={{position: 'absolute', inset: 0, transform: 'translateY(-90px)'}}>
          <EndCard day={7} nextDay={8} nextTitle="Build a Tool-Use Agent Loop" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
        </div>
      </Within>

      <SeriesBadge pulseAt={c('ccW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['hookW', 'ccW', 'wrW', 'rdW', 'tkW', 'plug'].map((key) => (
        <Sfx key={key} at={c(key)} name="pop" volume={0.22} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('end')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
