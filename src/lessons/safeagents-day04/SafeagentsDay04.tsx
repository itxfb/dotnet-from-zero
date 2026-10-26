/** Safe AI Agents Day 4 storyboard: "Run Your Agent in a Sandbox" (timed from cues in script.json). */
import React from 'react';
import {ShieldCheck} from 'lucide-react';
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

/** Frame-0 payoff: hook text over the finished setting and its blocked result. */
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
        Lock it in a <span style={{color: CONCEPT.csharp.main}}>sandbox</span>
      </div>
      <Card y={540} label="SETTINGS" words="sandbox on" tone="csharp" text={'"sandbox": { "enabled": true }'} exit={exit} size={40} />
      <Card y={810} label="RESULT" words="blocked" tone="api" text="cat ~/.ssh/id_rsa: Operation not permitted" exit={exit} size={36} />
    </>
  );
};

export const SafeagentsDay04: React.FC = () => {
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
    {tokens: cs('{ "sandbox": {'), typeAt: c('line:idea') + 2, speed: 1.0},
    {tokens: cs('  "enabled": true,'), typeAt: c('line:en') + 2, speed: 1.0},
    {tokens: cs('  "allowUnsandboxedCommands": false,'), typeAt: c('line:rt') + 2, speed: 1.2},
    {tokens: cs('  "filesystem": { "denyRead": ["~/.ssh"] }'), typeAt: c('line:deny') + 2, speed: 1.3},
    {tokens: cs('} }'), typeAt: c('line:deny:end') - 6, speed: 0.7},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'hookW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'enW', pose: {point: [300, 340]}},
      {at: 'dnW', pose: {point: [600, 460]}},
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
          filename=".claude/settings.json"
          lang="JSON"
          command="cat ~/.ssh/id_rsa"
          lines={lines}
          fontSize={26}
          lineHeight={50}
          rows={5}
          termHeight={330}
          highlights={[
            {at: c('enW'), until: c('line:en:end') + 10, spans: [{row: 1, from: 13, to: 17}], tone: 'csharp'},
            {at: c('rtW'), until: c('line:rt:end') + 10, spans: [{row: 2, from: 30, to: 35}], tone: 'csharp'},
            {at: c('dnW'), until: c('line:deny:end') + 10, spans: [{row: 3, from: 31, to: 39}], tone: 'api'},
          ]}
          runs={[{at: c('runW') - 6, output: 'Operation not permitted', lineAt: [c('runW')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="csharp" label="agent stays inside" labelSize={40} Icon={ShieldCheck} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="sandbox = hard limit" color={CONCEPT.csharp.main} size={42} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={4} nextDay={5} nextTitle="Review Every Diff Before You Commit" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('ideaW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['hookW', 'ideaW', 'enW', 'rtW', 'dnW', 'resW', 'tkW', 'plug'].map((key) => (
        <Sfx key={key} at={c(key)} name="pop" volume={0.22} />
      ))}
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.3} />
      ))}
      <Sfx at={c('runW') - 6} name="key2" volume={0.5} />
      <Sfx at={c('end')} name="chime" volume={0.32} />
    </ShotProvider>
  );
};
