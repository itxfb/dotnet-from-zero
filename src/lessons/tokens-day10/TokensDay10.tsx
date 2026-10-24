/** Token Saver Day 10 storyboard: "Use Subagents to Keep Context Clean" (timed from cues in script.json). */
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

/** Frame-0 payoff: hook text over noisy chat vs clean subagent summary. */
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
        Use a <span style={{color: CONCEPT.csharp.main}}>subagent</span> for big searches
      </div>
      <Card y={500} label="IN YOUR CHAT" words="noisy" tone="api" text="Every file it reads fills your context." exit={exit} />
      <Card y={790} label="SUBAGENT" words="clean" tone="csharp" text="Only a 3-line summary comes back." exit={exit} />
    </>
  );
};

export const TokensDay10: React.FC = () => {
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
    {tokens: cs('---'), typeAt: c('line:idea') + 2, speed: 0.7},
    {tokens: cs('name: researcher'), typeAt: c('line:file') + 8, speed: 0.6},
    {tokens: cs('description: Searches code'), typeAt: c('line:name') + 2, speed: 1.0},
    {tokens: cs('tools: Read, Grep, Glob'), typeAt: c('line:name') + 24, speed: 1.0},
    {tokens: cs('---'), typeAt: c('line:name') + 50, speed: 0.7},
    {tokens: cs('Search the code. Reply in 3 lines.'), typeAt: c('line:body') + 2, speed: 1.2},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'explain'},
      {at: 'noiseW', pose: 'shrug'},
      {at: code.from, pose: 'explain'},
      {at: 'fileW', pose: {point: [300, 340]}},
      {at: 'toolsW', pose: {point: [600, 460]}},
      {at: 'bodyW', pose: {point: [300, 560]}},
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
          filename=".claude/agents/researcher.md"
          lang="Markdown"
          command={'claude -p "Use researcher subagent: find login"'}
          lines={lines}
          fontSize={26}
          lineHeight={50}
          rows={6}
          termHeight={310}
          highlights={[
            {at: c('nameW'), until: c('toolsW') - 4, spans: [{row: 1, from: 6, to: 16}], tone: 'csharp'},
            {at: c('toolsW') + 14, until: c('line:name:end') + 14, spans: [{row: 3, from: 7, to: 23}], tone: 'api'},
            {at: c('bodyW') + 6, until: c('line:body:end') + 4, spans: [{row: 5, from: 17, to: 34}], tone: 'csharp'},
          ]}
          runs={[{at: c('runW') - 6, output: 'Login code: src/Auth/Login.cs', lineAt: [c('runW')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Module x={540} y={470} w={760} h={150} tone="api" label="clean main chat" labelSize={40} Icon={Zap} appear={c('tkW')} exit={recap.to - 8} />
        <Tag x={540} y={720} at={c('tkW') + 12} exit={recap.to - 8} text="big search = subagent" color={CONCEPT.csharp.main} size={42} />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={10} nextDay={1} nextTitle="Safe AI Agents" doneAt={c('end') - 40} nextAt={c('plug')} glowAt={c('plug') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('ideaW')} />
      <Captions />

      {[recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['noiseW', 'ideaW', 'fileW', 'toolsW', 'bodyW', 'resW', 'tkW', 'plug'].map((key) => (
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
