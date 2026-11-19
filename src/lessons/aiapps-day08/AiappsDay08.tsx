/** Build AI Apps Day 8 storyboard: "Build a Tool-Use Agent Loop" (timed from cues in script.json). */
import React from 'react';
import {Repeat} from 'lucide-react';
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
const CMD = 'bash loop.sh';
const CODE = [
  'M=\'[{"role":"user","content":"Weather in Paris?"}]\'',
  'while :; do',
  '  R=$(jq -n --argjson m "$M" --slurpfile t tools.json \\',
  '  \'{model:"claude-haiku-5-5",max_tokens:200,',
  '  tools:$t[0],messages:$m}\' |',
  '  curl -s https://api.anthropic.com/v1/messages \\',
  '  -H "x-api-key: $ANTHROPIC_API_KEY" \\',
  '  -H "anthropic-version: 2023-06-01" \\',
  '  -H "content-type: application/json" -d @-)',
  '  [ "$(jq -r .stop_reason <<<"$R")" = tool_use ] || break',
  '  M=$(jq -c --argjson r "$R" \'. + [',
  '  {role:"assistant",content:$r.content},',
  '  {role:"user",content:[$r.content[]',
  '  |select(.type=="tool_use")|{type:"tool_result",',
  '  tool_use_id:.id,content:"18C and sunny"}]}]\' <<<"$M")',
  'done',
  'jq -r \'.content[0].text\' <<<"$R"',
];
const at = (row: number, s: string) => ({row, from: CODE[row].indexOf(s), to: CODE[row].indexOf(s) + s.length});
const OUT = "It's 18C and sunny in Paris.";

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

/** Frame-0 payoff: hook text over the two turns of the finished loop. */
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
        Tools in a <span style={{color: CONCEPT.csharp.main}}>loop.</span>
      </div>
      <Card y={400} label="Turn 1" words="tool_use" tone="api" text={'stop_reason: tool_use\nget_weather {"city":"Paris"}'} exit={exit} size={38} />
      <Card y={680} label="Turn 2" words="end_turn" tone="csharp" text={'$ bash loop.sh\n' + OUT} exit={exit} size={40} />
    </>
  );
};

export const AiappsDay08: React.FC = () => {
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
    tokens: tk(t, i === 0 || i === 5 || i === 16 ? SYN2.method : i <= 4 ? SYN2.string : SYN2.plain),
    typeAt: i === 0 ? code.from + 2 : 'chain',
    speed: 0.06,
  }));

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'hookW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'lpW', pose: {point: [400, 420]}},
      {at: 'srW', pose: {point: [400, 700]}},
      {at: 'apW', pose: {point: [400, 800]}},
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
          rect={{x: 40, y: 215, w: 1000, h: 955}}
          enter={code.from}
          exit={code.to - 8}
          filename="loop.sh"
          lang="Bash"
          command={CMD}
          lines={lines}
          fontSize={24}
          lineHeight={37}
          rows={17}
          termHeight={210}
          highlights={[
            {at: c('lpW') - 2, until: c('srW') - 2, spans: [at(1, 'while :; do')], tone: 'api'},
            {at: c('srW') - 2, until: c('apW') - 2, spans: [at(9, '.stop_reason'), at(9, 'tool_use')], tone: 'csharp'},
            {at: c('apW') - 2, until: code.to - 8, spans: [at(13, 'tool_result')], tone: 'dotnet'},
          ]}
          runs={[{at: c('rnW') - 12, output: OUT, lineAt: [c('rnW')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="csharp" label="Loop until done" labelSize={40} Icon={Repeat} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="tool_use: run it, then loop" color={CONCEPT.csharp.main} size={34} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <div style={{position: 'absolute', inset: 0, transform: 'translateY(-90px)'}}>
          <EndCard day={8} nextDay={9} nextTitle="Expose Your Tool over MCP" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
        </div>
      </Within>

      <SeriesBadge pulseAt={c('lpW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['hookW', 'lpW', 'srW', 'apW', 'tkW', 'plug'].map((key) => (
        <Sfx key={key} at={c(key)} name="pop" volume={0.22} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('end')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
