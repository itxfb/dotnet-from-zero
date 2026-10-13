/** AI Dev Tools Day 1 storyboard: "What Is an AI Coding Agent?" (timed from cues in script.json). */
import React from 'react';
import {BookOpen, ChefHat, FileText, Pencil, Play} from 'lucide-react';
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

const md = (t: string, c: string = SYN2.plain) => (t ? [{t, c}] : []);

const Analogy: React.FC = () => {
  const {c, scene} = useCues();
  const life = scene('life');
  return (
    <>
      <Module x={540} y={340} w={640} h={140} tone="api" label="chatbot = recipe book" labelSize={36} Icon={BookOpen} appear={c('book')} exit={life.to - 12} />
      <Arrow pts={[[540, 420], [540, 570]]} at={c('chefW') - 4} exit={life.to - 12} color={CONCEPT.api.main} />
      <Module x={540} y={650} w={640} h={140} tone="str" label="agent = chef" labelSize={40} Icon={ChefHat} appear={c('chefW')} exit={life.to - 12} />
      <Tag x={540} y={830} at={c('fixW')} exit={life.to - 12} text="it cooks, tastes, fixes" color={CONCEPT.csharp.main} size={40} />
    </>
  );
};

const Recap: React.FC = () => {
  const {c, scene} = useCues();
  const recap = scene('recap');
  const xs = [190, 540, 890];
  const items = [
    {label: 'read', tone: 'aspnet' as const, Icon: FileText, at: c('rRead')},
    {label: 'edit', tone: 'dotnet' as const, Icon: Pencil, at: c('rEdit')},
    {label: 'run', tone: 'api' as const, Icon: Play, at: c('rRun')},
  ];
  return (
    <>
      {items.map((it, i) => (
        <React.Fragment key={it.label}>
          <Module x={xs[i]} y={480} w={260} h={130} tone={it.tone} label={it.label} Icon={it.Icon} appear={it.at} exit={recap.to - 8} />
          {i > 0 && <Arrow pts={[[xs[i - 1] + 135, 480], [xs[i] - 135, 480]]} at={it.at - 2} exit={recap.to - 8} color={CONCEPT.neutral.main} />}
        </React.Fragment>
      ))}
      <Tag x={540} y={700} at={c('rRun') + 8} exit={recap.to - 8} text="in a loop, until it works" color={CONCEPT.csharp.main} size={44} />
    </>
  );
};

export const AitoolsDay01: React.FC = () => {
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

  const lines: EdLine[] = [
    {tokens: md('# Project notes', SYN2.keyword), typeAt: c('line:notes') + 8, speed: 0.9},
    {tokens: [...md('Run tests: '), ...md('dotnet test', SYN2.method)], typeAt: c('line:rule') + 2, speed: 0.9},
    {tokens: md('Fix bugs, then re-run tests.'), typeAt: c('line:ask') + 2, speed: 0.9},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'write', pose: 'explain'},
      {at: 'fix', pose: 'shrug'},
      {at: 'day1', pose: 'wave'},
      {at: life.from, pose: 'explain'},
      {at: 'book', pose: {point: [540, 340]}},
      {at: 'chefW', pose: {point: [540, 650]}},
      {at: 'line:chef:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'notesW', pose: {point: [300, 330]}},
      {at: 'ruleW', pose: {point: [500, 400]}},
      {at: 'askW', pose: {point: [400, 460]}},
      {at: 'loopW', pose: 'explain'},
      {at: 'n1', pose: {point: [200, 900]}},
      {at: 'line:run:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: 'rRead', pose: {point: [190, 480]}},
      {at: 'rEdit', pose: {point: [540, 480]}},
      {at: 'rRun', pose: {point: [890, 480]}},
      {at: 'line:recap:end', pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'end', pose: 'openToViewer'},
      {at: 'tools', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'day1', v: 0.85},
      {at: 'line:chat', v: 0.55},
      {at: 'chefW', v: 0.8},
      {at: 'line:notes', v: 0.55},
      {at: 'n1', v: 0.85},
      {at: 'line:recap', v: 0.6},
      {at: 'line:bye', v: 0.85},
      {at: 'line:bye:end', v: 1},
    ],
    brows: [
      {at: 'line:hook', v: 0.8, hold: 50},
      {at: 'book', v: 0.6, hold: 24},
      {at: 'askW', v: 0.6, hold: 24},
      {at: 'line:bye', v: 0.5, hold: 30},
    ],
  };

  const keyFrames = editorKeyFrames(lines);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={life.from + 10}>
        <FloatingChips
          at={c('write') - 4}
          until={c('day1') + 30}
          items={[
            {text: 'code', tone: 'dotnet', x: 205, y: 905, at: c('write') - 4},
            {text: 'run', tone: 'api', x: 875, y: 880, at: c('write') + 8},
            {text: 'fix', tone: 'csharp', x: 195, y: 1160, at: c('fix') + 2},
            {text: 'agent', tone: 'aspnet', x: 885, y: 1150, at: c('agentT') - 4},
          ]}
        />
      </Within>

      <Within from={life.from} to={life.to + 4}>
        <Analogy />
      </Within>

      <Within from={code.from - 2} to={code.to + 6}>
        <Editor
          rect={{x: 56, y: 236, w: 968, h: 900}}
          enter={code.from}
          exit={code.to - 8}
          filename="CLAUDE.md"
          lang="Markdown"
          command={'claude -p "fix the failing test"'}
          lines={lines}
          fontSize={36}
          lineHeight={56}
          rows={4}
          termHeight={300}
          highlights={[
            {at: c('notesW'), until: c('line:notes:end') + 4, spans: [{row: 0, from: 0, to: 15}], label: 'project notes', tone: 'aspnet'},
            {at: c('ruleW'), until: c('line:rule:end') + 4, spans: [{row: 1, from: 11, to: 22}], tone: 'api'},
            {at: c('askW'), until: c('line:ask:end') + 4, spans: [{row: 2, from: 0, to: 8}], tone: 'dotnet'},
            {at: c('loopW'), until: c('line:loop:end') + 4, spans: [{row: 2, from: 15, to: 27}], tone: 'csharp'},
          ]}
          runs={[{at: c('n1') - 14, output: 'All tests pass', lineAt: [c('n1')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Recap />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={1} nextDay={2} nextTitle="Slash Commands" doneAt={c('end')} nextAt={c('tools')} glowAt={c('tools') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('day1')} />
      <Captions />

      {[life.from - 6, code.from - 6, recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['write', 'fix', 'book', 'chefW', 'notesW', 'ruleW', 'askW', 'loopW', 'rRead', 'rEdit', 'rRun', 'tools'].map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.22} />
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
