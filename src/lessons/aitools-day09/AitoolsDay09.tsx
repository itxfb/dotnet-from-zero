/** AI Dev Tools Day 9 storyboard: "Parallel Agents with Worktrees" (timed from cues in script.json). */
import React from 'react';
import {ChefHat, FolderGit2, Bot, Users} from 'lucide-react';
import {Arrow} from '../../components/Arrow';
import {Captions} from '../../components/Captions';
import {Editor, editorKeyFrames, EdLine, SYN2} from '../../components/Editor';
import {EndCard} from '../../components/EndCard';
import {FloatingChips} from '../../components/FloatingChips';
import {Direction} from '../../components/instructor/Instructor';
import {Module, Tag} from '../../components/Module';
import {SeriesBadge} from '../../components/SeriesBadge';
import {Studio} from '../../components/Studio';
import {Sfx, ShotKey, ShotProvider, Within} from '../../engine/direction';
import {CueRef, getScene, resolveCue, useTimeline} from '../../engine/timeline';
import {CONCEPT} from '../../theme';

const useCues = () => {
  const tl = useTimeline();
  return {c: (r: CueRef) => resolveCue(tl, r), scene: (id: string) => getScene(tl, id)};
};

const tk = (t: string, c: string = SYN2.plain) => (t ? [{t, c}] : []);

const Analogy: React.FC = () => {
  const {c, scene} = useCues();
  const life = scene('life');
  return (
    <>
      <Module x={540} y={340} w={640} h={140} tone="api" label="two cooks, one counter" labelSize={38} Icon={Users} appear={c('boxW')} exit={life.to - 12} />
      <Arrow pts={[[540, 420], [540, 570]]} at={c('allW') - 4} exit={life.to - 12} color={CONCEPT.api.main} />
      <Module x={540} y={650} w={640} h={140} tone="str" label="a counter each" labelSize={40} Icon={ChefHat} appear={c('allW')} exit={life.to - 12} />
      <Tag x={540} y={830} at={c('allW') + 10} exit={life.to - 12} text="no more bumping elbows" color={CONCEPT.csharp.main} size={40} />
    </>
  );
};

const Recap: React.FC = () => {
  const {c, scene} = useCues();
  const recap = scene('recap');
  return (
    <>
      <Module x={290} y={480} w={380} h={130} tone="dotnet" label="agent" Icon={Bot} appear={c('rPack')} exit={recap.to - 8} />
      <Arrow pts={[[490, 480], [590, 480]]} at={c('rInst') - 2} exit={recap.to - 8} color={CONCEPT.neutral.main} />
      <Module x={790} y={480} w={380} h={130} tone="api" label="worktree" Icon={FolderGit2} appear={c('rInst')} exit={recap.to - 8} />
      <Tag x={540} y={700} at={c('rInst') + 8} exit={recap.to - 8} text="no collisions" color={CONCEPT.csharp.main} size={44} />
    </>
  );
};

export const AitoolsDay09: React.FC = () => {
  const {c, scene} = useCues();
  const life = scene('life');
  const code = scene('code');
  const recap = scene('recap');
  const outro = scene('outro');

  const shots: ShotKey[] = [
    {at: 0, shot: 'hero'},
    {at: life.from - 6, shot: 'teach', dur: 26},
    {at: code.from - 6, shot: 'code', dur: 28},
    {at: recap.from - 6, shot: 'teach', dur: 26},
    {at: outro.from - 6, shot: 'outro', dur: 28},
  ];

  const k = SYN2.keyword;
  const s = SYN2.string;
  const cm = SYN2.comment;
  const lines: EdLine[] = [
    {tokens: tk('# terminal 1', cm), typeAt: c('line:file') + 2, speed: 0.9},
    {tokens: [...tk('claude '), ...tk('--worktree', k), ...tk(' auth', s)], typeAt: c('line:file') + 3, speed: 0.9},
    {tokens: tk('# terminal 2', cm), typeAt: c('line:act') + 2, speed: 0.9},
    {tokens: [...tk('claude '), ...tk('--worktree', k), ...tk(' bugfix', s)], typeAt: c('line:act:end') - 6, speed: 0.9},
    {tokens: [...tk('git '), ...tk('branch', k)], typeAt: c('line:pr') + 2, speed: 0.9},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'word', pose: 'explain'},
      {at: 'routine', pose: 'shrug'},
      {at: 'day9', pose: 'wave'},
      {at: life.from, pose: 'explain'},
      {at: 'boxW', pose: {point: [540, 340]}},
      {at: 'allW', pose: {point: [540, 650]}},
      {at: 'line:all:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'fileW', pose: {point: [300, 340]}},
      {at: 'evW', pose: {point: [300, 340]}},
      {at: 'actW', pose: {point: [300, 440]}},
      {at: 'keyW', pose: {point: [400, 490]}},
      {at: 'prW', pose: {point: [350, 540]}},
      {at: 'n1', pose: {point: [200, 950]}},
      {at: 'line:run:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: 'rPack', pose: {point: [290, 480]}},
      {at: 'rInst', pose: {point: [790, 480]}},
      {at: 'line:recap:end', pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'end', pose: 'openToViewer'},
      {at: 'plug', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'day9', v: 0.85},
      {at: 'line:box', v: 0.55},
      {at: 'allW', v: 0.8},
      {at: 'line:file', v: 0.55},
      {at: 'n1', v: 0.85},
      {at: 'line:recap', v: 0.6},
      {at: 'line:bye', v: 0.85},
      {at: 'line:bye:end', v: 1},
    ],
    brows: [
      {at: 'line:hook', v: 0.8, hold: 50},
      {at: 'boxW', v: 0.6, hold: 24},
      {at: 'keyW', v: 0.6, hold: 24},
      {at: 'line:bye', v: 0.5, hold: 30},
    ],
  };

  const keyFrames = editorKeyFrames(lines);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={life.from + 10}>
        <FloatingChips
          at={c('word') - 4}
          until={c('day9') + 30}
          items={[
            {text: 'agents', tone: 'dotnet', x: 205, y: 905, at: c('word') - 4},
            {text: 'at once', tone: 'csharp', x: 875, y: 880, at: c('routine') + 2},
            {text: 'parallel', tone: 'api', x: 195, y: 1160, at: c('skillsT') - 4},
            {text: 'worktree', tone: 'aspnet', x: 885, y: 1150, at: c('skillsT') - 2},
          ]}
        />
      </Within>

      <Within from={life.from} to={life.to + 4}>
        <Analogy />
      </Within>

      <Within from={code.from - 2} to={code.to + 6}>
        <Editor
          rect={{x: 56, y: 236, w: 968, h: 920}}
          enter={code.from}
          exit={code.to - 8}
          filename="parallel.sh"
          lang="Bash"
          command="git branch"
          lines={lines}
          fontSize={26}
          lineHeight={50}
          rows={5}
          termHeight={310}
          highlights={[
            {at: c('fileW'), until: c('line:file:end') + 4, spans: [{row: 1, from: 9, to: 17}], tone: 'dotnet'},
            {at: c('evW'), until: c('line:ev:end') + 4, spans: [{row: 1, from: 7, to: 17}], tone: 'csharp'},
            {at: c('actW'), until: c('line:act:end') + 4, spans: [{row: 2, from: 0, to: 12}], tone: 'api'},
            {at: c('keyW'), until: c('line:key:end') + 4, spans: [{row: 3, from: 18, to: 25}], tone: 'dotnet'},
            {at: c('prW'), until: c('line:pr:end') + 4, spans: [{row: 4, from: 4, to: 10}], tone: 'aspnet'},
          ]}
          runs={[
            {
              at: c('n1') - 14,
              output: '* main\n+ worktree-auth\n+ worktree-bugfix',
              lineAt: [c('n1'), c('n1') + 8, c('n1') + 16],
            },
          ]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Recap />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={9} nextDay={10} nextTitle="Build Your Own MCP Server" doneAt={c('end')} nextAt={c('plug')} glowAt={c('plug') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('day9')} />
      <Captions />

      {[life.from - 6, code.from - 6, recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['word', 'routine', 'boxW', 'allW', 'fileW', 'evW', 'actW', 'keyW', 'prW', 'rPack', 'rInst', 'plug'].map((key) => (
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
