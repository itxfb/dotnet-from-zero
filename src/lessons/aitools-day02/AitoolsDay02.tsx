/** AI Dev Tools Day 2 storyboard: "Slash Commands & Skills" (timed from cues in script.json). */
import React from 'react';
import {FileText, ListChecks, Phone, Play} from 'lucide-react';
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
      <Module x={540} y={340} w={640} h={140} tone="api" label="/review = speed dial" labelSize={36} Icon={Phone} appear={c('dialW')} exit={life.to - 12} />
      <Arrow pts={[[540, 420], [540, 570]]} at={c('tapW') - 4} exit={life.to - 12} color={CONCEPT.api.main} />
      <Module x={540} y={650} w={640} h={140} tone="str" label="saved routine" labelSize={40} Icon={ListChecks} appear={c('tapW')} exit={life.to - 12} />
      <Tag x={540} y={830} at={c('tapW') + 10} exit={life.to - 12} text="one tap, many steps" color={CONCEPT.csharp.main} size={40} />
    </>
  );
};

const Recap: React.FC = () => {
  const {c, scene} = useCues();
  const recap = scene('recap');
  return (
    <>
      <Module x={290} y={480} w={380} h={130} tone="dotnet" label="skill" Icon={FileText} appear={c('rSkill')} exit={recap.to - 8} />
      <Arrow pts={[[490, 480], [590, 480]]} at={c('rSlash') - 2} exit={recap.to - 8} color={CONCEPT.neutral.main} />
      <Module x={790} y={480} w={380} h={130} tone="api" label="/ run" Icon={Play} appear={c('rSlash')} exit={recap.to - 8} />
      <Tag x={540} y={700} at={c('rSlash') + 8} exit={recap.to - 8} text="save once, reuse forever" color={CONCEPT.csharp.main} size={44} />
    </>
  );
};

export const AitoolsDay02: React.FC = () => {
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
    {tokens: md('---', SYN2.keyword), typeAt: c('line:file') + 8, speed: 0.9},
    {tokens: [...md('name: ', SYN2.keyword), ...md('review', SYN2.method)], typeAt: c('line:name') + 2, speed: 0.9},
    {tokens: [...md('description: ', SYN2.keyword), ...md('Review code for bugs')], typeAt: c('line:desc') + 2, speed: 0.9},
    {tokens: md('---', SYN2.keyword), typeAt: c('line:body') + 2, speed: 0.9},
    {tokens: md('Review $ARGUMENTS for bugs.'), typeAt: c('line:body') + 14, speed: 0.9},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'word', pose: 'explain'},
      {at: 'routine', pose: 'shrug'},
      {at: 'day2', pose: 'wave'},
      {at: life.from, pose: 'explain'},
      {at: 'dialW', pose: {point: [540, 340]}},
      {at: 'tapW', pose: {point: [540, 650]}},
      {at: 'line:tap:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'fileW', pose: {point: [300, 330]}},
      {at: 'nameW', pose: {point: [400, 400]}},
      {at: 'descW', pose: {point: [500, 460]}},
      {at: 'bodyW', pose: {point: [500, 580]}},
      {at: 'n1', pose: {point: [200, 900]}},
      {at: 'line:run:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: 'rSkill', pose: {point: [290, 480]}},
      {at: 'rSlash', pose: {point: [790, 480]}},
      {at: 'line:recap:end', pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'end', pose: 'openToViewer'},
      {at: 'plug', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'day2', v: 0.85},
      {at: 'line:dial', v: 0.55},
      {at: 'tapW', v: 0.8},
      {at: 'line:file', v: 0.55},
      {at: 'n1', v: 0.85},
      {at: 'line:recap', v: 0.6},
      {at: 'line:bye', v: 0.85},
      {at: 'line:bye:end', v: 1},
    ],
    brows: [
      {at: 'line:hook', v: 0.8, hold: 50},
      {at: 'dialW', v: 0.6, hold: 24},
      {at: 'descW', v: 0.6, hold: 24},
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
          until={c('day2') + 30}
          items={[
            {text: '/review', tone: 'api', x: 205, y: 905, at: c('word') - 4},
            {text: 'routine', tone: 'csharp', x: 875, y: 880, at: c('routine') + 2},
            {text: 'skill', tone: 'dotnet', x: 195, y: 1160, at: c('skillsT') - 4},
            {text: 'AI', tone: 'aspnet', x: 885, y: 1150, at: c('skillsT') - 2},
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
          filename="SKILL.md"
          lang="Markdown"
          command={'claude -p "/review Program.cs"'}
          lines={lines}
          fontSize={36}
          lineHeight={56}
          rows={5}
          termHeight={300}
          highlights={[
            {at: c('fileW'), until: c('line:file:end') + 4, spans: [{row: 0, from: 0, to: 3}], label: 'one file', tone: 'dotnet'},
            {at: c('nameW'), until: c('line:name:end') + 4, spans: [{row: 1, from: 6, to: 12}], tone: 'csharp'},
            {at: c('descW'), until: c('line:desc:end') + 4, spans: [{row: 2, from: 13, to: 33}], tone: 'aspnet'},
            {at: c('bodyW'), until: c('line:body:end') + 4, spans: [{row: 4, from: 0, to: 27}], tone: 'api'},
          ]}
          runs={[{at: c('n1') - 14, output: 'Reviewed Program.cs: no bugs', lineAt: [c('n1')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Recap />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={2} nextDay={3} nextTitle="Plugins" doneAt={c('end')} nextAt={c('plug')} glowAt={c('plug') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('day2')} />
      <Captions />

      {[life.from - 6, code.from - 6, recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['word', 'routine', 'dialW', 'tapW', 'fileW', 'nameW', 'descW', 'bodyW', 'rSkill', 'rSlash', 'plug'].map((k) => (
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
