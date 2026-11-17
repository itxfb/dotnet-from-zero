/** Build AI Apps Day 4 storyboard: "Give the Model a Tool to Call" (timed from cues in script.json). */
import React from 'react';
import {Wrench} from 'lucide-react';
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
const CMD = 'bash tool.sh';
const CODE = [
  'curl -s https://api.anthropic.com/v1/messages \\',
  '  -H "x-api-key: $ANTHROPIC_API_KEY" \\',
  '  -H "anthropic-version: 2023-06-01" \\',
  '  -H "content-type: application/json" \\',
  '  -d \'{"model":"claude-haiku-5-5","max_tokens":200,',
  '  "tools":[{"name":"get_weather",',
  '  "description":"Get the weather for a city",',
  '  "input_schema":{"type":"object","properties":{',
  '  "city":{"type":"string"}},"required":["city"]}}],',
  '  "messages":[{"role":"user","content":',
  '  "Weather in Paris?"}]}\' \\',
  '  | jq -c \'.content[] | select(.type=="tool_use")',
  '  | .input\'',
];
const at = (row: number, s: string) => ({row, from: CODE[row].indexOf(s), to: CODE[row].indexOf(s) + s.length});
const OUT_OK = '{"city":"Paris"}';

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

/** Frame-0 payoff: hook text over the finished command and the tool request answer. */
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
        AI calls <span style={{color: CONCEPT.csharp.main}}>your code.</span>
      </div>
      <Card y={500} label="Terminal" words="tool call input" tone="csharp" text={'$ bash tool.sh\n' + OUT_OK} exit={exit} size={44} />
    </>
  );
};

export const AiappsDay04: React.FC = () => {
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
    tokens: tk(t, i === 0 || i === 11 ? SYN2.method : i >= 4 && i <= 10 ? SYN2.string : SYN2.plain),
    typeAt: i === 0 ? code.from + 2 : 'chain',
    speed: 0.1,
  }));

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'hookW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'initW', pose: {point: [400, 600]}},
      {at: 'schW', pose: {point: [400, 700]}},
      {at: 'askW', pose: {point: [400, 800]}},
      {at: 'line:run:end', pose: 'openToViewer'},
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
          rect={{x: 56, y: 236, w: 968, h: 940}}
          enter={code.from}
          exit={code.to - 8}
          filename="tool.sh"
          lang="Bash"
          command={CMD}
          lines={lines}
          fontSize={26}
          lineHeight={52}
          rows={13}
          termHeight={200}
          highlights={[
            {at: c('initW') + 4, until: c('schW') - 2, spans: [at(5, '"tools"'), at(5, '"get_weather"')], tone: 'api'},
            {at: c('schW') + 4, until: c('askW') - 4, spans: [at(7, '"input_schema"'), at(8, '"required":["city"]')], tone: 'dotnet'},
            {at: c('askW') + 2, until: c('okW') - 2, spans: [at(10, '"Weather in Paris?"')], tone: 'csharp'},
          ]}
          runs={[{at: c('okW') - 4, output: OUT_OK, lineAt: [c('okW')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="csharp" label="Model asks, you run" labelSize={40} Icon={Wrench} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="tools + tool_use" color={CONCEPT.csharp.main} size={42} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <div style={{position: 'absolute', inset: 0, transform: 'translateY(-90px)'}}>
          <EndCard day={4} nextDay={5} nextTitle="Handle Rate Limits with Retry Backoff" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
        </div>
      </Within>

      <SeriesBadge pulseAt={c('initW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['hookW', 'initW', 'schW', 'askW', 'okW', 'tkW', 'plug'].map((key) => (
        <Sfx key={key} at={c(key)} name="pop" volume={0.22} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('end')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
