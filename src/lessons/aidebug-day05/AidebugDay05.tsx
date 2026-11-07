/** AI Debugging Day 5 storyboard: "Make AI Review Every Pull Request" (timed from cues in script.json). */
import React from 'react';
import {GitPullRequest} from 'lucide-react';
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
const CMD = 'git push';
const OUT = 'Review posted on the PR ✔';

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

/** Frame-0 payoff: hook text over the action line and the review it posts. */
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
        <span style={{color: CONCEPT.dotnet.main}}>AI reviews</span> every PR
      </div>
      <Card y={500} label="Workflow" words="1 file" tone="csharp" text="uses: anthropics/claude-code-action@v1" exit={exit} size={30} />
      <Card y={760} label="Pull request" words="auto review" tone="dotnet" text={OUT} exit={exit} size={40} />
    </>
  );
};

export const AidebugDay05: React.FC = () => {
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
  const s = SYN2.string;
  const p = SYN2.punct;
  const kv = (indent: string, key: string, val?: string): EdLine['tokens'] => [
    ...tk(indent),
    ...tk(key, k),
    ...tk(':', p),
    ...(val ? [...tk(' '), ...tk(val, s)] : []),
  ];
  const lines: EdLine[] = [
    {tokens: kv('', 'on', 'pull_request'), typeAt: code.from + 2, speed: 0.9},
    {tokens: [...kv('', 'permissions'), ...tk(' {contents: read, pull-requests: write}', p)], typeAt: 'chain', speed: 0.9},
    {tokens: kv('', 'jobs'), typeAt: 'chain', speed: 0.9},
    {tokens: kv('  ', 'review'), typeAt: 'chain', speed: 0.9},
    {tokens: kv('    ', 'runs-on', 'ubuntu-latest'), typeAt: 'chain', speed: 0.9},
    {tokens: kv('    ', 'steps'), typeAt: 'chain', speed: 0.9},
    {tokens: [...tk('      - ', p), ...tk('uses', k), ...tk(': ', p), ...tk('actions/checkout@v6', s)], typeAt: 'chain', speed: 0.9},
    {tokens: [...tk('      - ', p), ...tk('uses', k), ...tk(': ', p), ...tk('anthropics/claude-code-action@v1', s)], typeAt: c('line:act') + 2, speed: 0.9},
    {tokens: kv('        ', 'with'), typeAt: 'chain', speed: 0.9},
    {tokens: kv('          ', 'anthropic_api_key', '${{ secrets.API_KEY }}'), typeAt: c('line:key') + 2, speed: 0.9},
    {tokens: kv('          ', 'prompt', 'Review this PR for bugs'), typeAt: c('line:pr') + 2, speed: 0.9},
  ].map((l, i): EdLine => (i < 7 ? {...l, speed: 0.4} : l) as EdLine);

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'hookW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'onW', pose: {point: [400, 300]}},
      {at: 'keyW', pose: {point: [400, 700]}},
      {at: 'runW', pose: {point: [200, 1000]}},
      {at: 'line:run:end', pose: 'openToViewer'},
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
          filename=".github/workflows/review.yml"
          lang="YAML"
          command={CMD}
          lines={lines}
          fontSize={26}
          lineHeight={50}
          rows={11}
          termHeight={260}
          highlights={[
            {at: c('onW'), until: c('line:on:end') + 4, spans: [{row: 0, from: 4, to: 16}], tone: 'dotnet'},
            {at: c('actW'), until: c('line:act:end') + 4, spans: [{row: 7, from: 14, to: 46}], tone: 'api'},
            {at: c('keyW'), until: c('line:key:end') + 4, spans: [{row: 9, from: 29, to: 51}], tone: 'csharp'},
            {at: c('prW'), until: c('line:pr:end') + 4, spans: [{row: 10, from: 18, to: 41}], tone: 'dotnet'},
          ]}
          runs={[{at: c('runW') + 6, output: OUT, lineAt: [c('resW')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="dotnet" label="PR = auto review" labelSize={40} Icon={GitPullRequest} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="one file, every pull request" color={CONCEPT.dotnet.main} size={42} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={5} nextDay={6} nextTitle="Catch Hallucinated APIs" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('onW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['hookW', 'onW', 'actW', 'keyW', 'prW', 'resW', 'tkW', 'plug'].map((key) => (
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
