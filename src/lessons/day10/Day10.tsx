/** Day 10 storyboard: "Classes & Objects" (timed from cues in script.json). */
import React from 'react';
import {DraftingCompass, House} from 'lucide-react';
import {Arrow} from '../../components/Arrow';
import {Captions} from '../../components/Captions';
import {CodeAnatomy} from '../../components/Concepts';
import {cs, Editor, editorKeyFrames, EdLine, SYN2} from '../../components/Editor';
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

const Blueprint: React.FC = () => {
  const {c, scene} = useCues();
  const life = scene('life');
  const xs = [190, 540, 890];
  return (
    <>
      <Module x={540} y={340} w={520} h={140} tone="api" label="blueprint" Icon={DraftingCompass} appear={c('blueprint')} exit={life.to - 12} />
      {xs.map((x, i) => (
        <React.Fragment key={x}>
          <Arrow pts={[[540, 420], [x, 560]]} at={c('houses') + i * 6} exit={life.to - 12} color={CONCEPT.api.main} />
          <Module x={x} y={640} w={300} h={130} tone="str" label="house" Icon={House} appear={c('houses') + 4 + i * 6} exit={life.to - 12} />
        </React.Fragment>
      ))}
      <Tag x={540} y={820} at={c('houses') + 24} exit={life.to - 12} text="one plan, many copies" color={CONCEPT.csharp.main} size={40} />
    </>
  );
};

const Recap: React.FC = () => {
  const {c, scene} = useCues();
  const recap = scene('recap');
  return (
    <>
      <CodeAnatomy
        y={420}
        fontSize={64}
        appear={recap.from + 4}
        exit={recap.to - 8}
        parts={[
          {text: 'class ', color: SYN2.keyword},
          {text: 'Dog', color: SYN2.type, label: 'blueprint', tone: 'api', at: c('rClass')},
        ]}
      />
      <Module x={540} y={820} w={440} h={120} tone="str" label='Dog "Rex"' appear={c('rObj')} exit={recap.to - 8} />
      <Tag x={540} y={990} at={c('rObj')} exit={recap.to - 8} text="one object built from it" color={CONCEPT.csharp.main} size={44} />
    </>
  );
};

export const Day10: React.FC = () => {
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
    {tokens: cs('Dog pet = new Dog();'), typeAt: c('line:new') + 8, speed: 0.9},
    {tokens: cs('pet.Name = "Rex";'), typeAt: c('line:set') + 2, speed: 0.9},
    {tokens: cs('Console.WriteLine(pet.Name);'), typeAt: c('line:print') + 2, speed: 0.9},
    {tokens: cs('')},
    {tokens: cs('class Dog'), typeAt: c('line:bp') + 2, speed: 0.9},
    {tokens: cs('{'), typeAt: 'chain', speed: 0.9},
    {tokens: cs('    public string Name = "";'), typeAt: 'chain', speed: 0.9},
    {tokens: cs('}'), typeAt: 'chain', speed: 0.9},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'design', pose: 'explain'},
      {at: 'many', pose: 'shrug'},
      {at: 'day10', pose: 'wave'},
      {at: life.from, pose: 'explain'},
      {at: 'blueprint', pose: {point: [540, 340]}},
      {at: 'houses', pose: {point: [540, 640]}},
      {at: 'line:houses:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'newW', pose: {point: [600, 340]}},
      {at: 'line:new:end', pose: 'explain'},
      {at: 'setW', pose: {point: [400, 400]}},
      {at: 'line:set:end', pose: 'explain'},
      {at: 'printW', pose: {point: [500, 460]}},
      {at: 'bpW', pose: {point: [300, 580]}},
      {at: 'n1', pose: {point: [200, 900]}},
      {at: 'line:run:end', pose: 'openToViewer'},
      {at: recap.from, pose: 'explain'},
      {at: 'rClass', pose: {point: [540, 420]}},
      {at: 'rObj', pose: {point: [540, 820]}},
      {at: 'line:recap:end', pose: 'explain'},
      {at: outro.from, pose: 'explain'},
      {at: 'end', pose: 'openToViewer'},
      {at: 'tools', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'day10', v: 0.85},
      {at: 'line:life', v: 0.55},
      {at: 'houses', v: 0.8},
      {at: 'line:new', v: 0.55},
      {at: 'n1', v: 0.85},
      {at: 'line:recap', v: 0.6},
      {at: 'line:bye', v: 0.85},
      {at: 'line:bye:end', v: 1},
    ],
    brows: [
      {at: 'line:hook', v: 0.8, hold: 50},
      {at: 'blueprint', v: 0.6, hold: 24},
      {at: 'newW', v: 0.6, hold: 24},
      {at: 'bpW', v: 0.7, hold: 24},
      {at: 'line:bye', v: 0.5, hold: 30},
    ],
  };

  const keyFrames = editorKeyFrames(lines);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={life.from + 10}>
        <FloatingChips
          at={c('design') - 4}
          until={c('day10') + 30}
          items={[
            {text: 'Dog', tone: 'api', x: 205, y: 905, at: c('design') - 4},
            {text: 'Dog', tone: 'str', x: 875, y: 880, at: c('many') + 2},
            {text: 'class', tone: 'dotnet', x: 195, y: 1160, at: c('design') + 6},
            {text: 'object', tone: 'dotnet', x: 885, y: 1150, at: c('many') + 8},
          ]}
        />
      </Within>

      <Within from={life.from} to={life.to + 4}>
        <Blueprint />
      </Within>

      <Within from={code.from - 2} to={code.to + 6}>
        <Editor
          rect={{x: 56, y: 236, w: 968, h: 900}}
          enter={code.from}
          exit={code.to - 8}
          filename="Program.cs"
          lines={lines}
          fontSize={36}
          lineHeight={56}
          rows={8}
          termHeight={300}
          highlights={[
            {at: c('newW'), until: c('line:new:end') + 4, spans: [{row: 0, from: 10, to: 19}], label: 'new object', tone: 'api'},
            {at: c('setW'), until: c('line:set:end') + 4, spans: [{row: 1, from: 4, to: 8}], tone: 'dotnet'},
            {at: c('printW'), until: c('line:print:end') + 4, spans: [{row: 2, from: 18, to: 26}], tone: 'csharp'},
            {at: c('bpW'), until: c('line:bp:end') + 6, spans: [{row: 4, from: 0, to: 9}], tone: 'api'},
            {at: c('n1'), until: code.to, spans: [{row: 2, from: 0, to: 28}], label: 'prints Rex', tone: 'str'},
          ]}
          runs={[{at: c('n1') - 14, output: 'Rex', lineAt: [c('n1')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Recap />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={10} nextDay={1} nextTitle="AI Dev Tools" doneAt={c('end')} nextAt={c('tools')} glowAt={c('tools') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('day10')} />
      <Captions />

      {[life.from - 6, code.from - 6, recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['design', 'many', 'blueprint', 'houses', 'newW', 'setW', 'printW', 'bpW', 'rClass', 'rObj', 'tools'].map((k) => (
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
