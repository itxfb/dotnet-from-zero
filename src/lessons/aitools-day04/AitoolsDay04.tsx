/** AI Dev Tools Day 4 storyboard: "Plugins: Share Your AI Setup" (timed from cues in script.json). */
import React from 'react';
import {Package, Plug, Users, Wrench} from 'lucide-react';
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
      <Module x={540} y={340} w={640} h={140} tone="api" label="MCP = USB port" labelSize={36} Icon={Wrench} appear={c('boxW')} exit={life.to - 12} />
      <Arrow pts={[[540, 420], [540, 570]]} at={c('allW') - 4} exit={life.to - 12} color={CONCEPT.api.main} />
      <Module x={540} y={650} w={640} h={140} tone="str" label="your AI" labelSize={40} Icon={Users} appear={c('allW')} exit={life.to - 12} />
      <Tag x={540} y={830} at={c('allW') + 10} exit={life.to - 12} text="plug in, get a new tool" color={CONCEPT.csharp.main} size={40} />
    </>
  );
};

const Recap: React.FC = () => {
  const {c, scene} = useCues();
  const recap = scene('recap');
  return (
    <>
      <Module x={290} y={480} w={380} h={130} tone="dotnet" label="MCP" Icon={Package} appear={c('rPack')} exit={recap.to - 8} />
      <Arrow pts={[[490, 480], [590, 480]]} at={c('rInst') - 2} exit={recap.to - 8} color={CONCEPT.neutral.main} />
      <Module x={790} y={480} w={380} h={130} tone="api" label="server" Icon={Plug} appear={c('rInst')} exit={recap.to - 8} />
      <Tag x={540} y={700} at={c('rInst') + 8} exit={recap.to - 8} text="port + server = new tool" color={CONCEPT.csharp.main} size={44} />
    </>
  );
};

export const AitoolsDay04: React.FC = () => {
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
    {tokens: tk('{', SYN2.keyword), typeAt: c('line:file') + 8, speed: 0.9},
    {tokens: [...tk('  "mcpServers": ', SYN2.keyword), ...tk('{')], typeAt: c('line:file') + 20, speed: 0.9},
    {tokens: [...tk('    '), ...tk('"docs"', SYN2.method), ...tk(': {')], typeAt: c('line:name') + 2, speed: 0.9},
    {tokens: [...tk('      "type": ', SYN2.keyword), ...tk('"http"'), ...tk(',')], typeAt: c('line:type') + 2, speed: 0.9},
    {tokens: [...tk('      "url": ', SYN2.keyword), ...tk('"https://mcp.context7.com/mcp"')], typeAt: c('line:url') + 2, speed: 0.9},
    {tokens: tk('    }', SYN2.keyword), typeAt: c('line:url') + 40, speed: 0.9},
    {tokens: tk('  }', SYN2.keyword), typeAt: c('line:url') + 46, speed: 0.9},
    {tokens: tk('}', SYN2.keyword), typeAt: c('line:url') + 52, speed: 0.9},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'word', pose: 'explain'},
      {at: 'routine', pose: 'shrug'},
      {at: 'day4', pose: 'wave'},
      {at: life.from, pose: 'explain'},
      {at: 'boxW', pose: {point: [540, 340]}},
      {at: 'allW', pose: {point: [540, 650]}},
      {at: 'line:all:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'fileW', pose: {point: [300, 330]}},
      {at: 'nameW', pose: {point: [400, 330]}},
      {at: 'urlW', pose: {point: [500, 460]}},
      {at: 'typeW', pose: {point: [450, 520]}},
      {at: 'n1', pose: {point: [200, 900]}},
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
      {at: 'day4', v: 0.85},
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
      {at: 'urlW', v: 0.6, hold: 24},
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
          until={c('day4') + 30}
          items={[
            {text: 'tool', tone: 'dotnet', x: 205, y: 905, at: c('word') - 4},
            {text: 'give', tone: 'csharp', x: 875, y: 880, at: c('routine') + 2},
            {text: 'MCP', tone: 'api', x: 195, y: 1160, at: c('skillsT') - 4},
            {text: 'new tools', tone: 'aspnet', x: 885, y: 1150, at: c('skillsT') - 2},
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
          filename=".mcp.json"
          lang="JSON"
          command="claude mcp list"
          lines={lines}
          fontSize={32}
          lineHeight={52}
          rows={8}
          termHeight={300}
          highlights={[
            {at: c('fileW'), until: c('line:file:end') + 4, spans: [{row: 1, from: 3, to: 13}], label: 'servers', tone: 'dotnet'},
            {at: c('nameW'), until: c('line:name:end') + 4, spans: [{row: 2, from: 4, to: 10}], tone: 'csharp'},
            {at: c('typeW'), until: c('line:type:end') + 4, spans: [{row: 3, from: 14, to: 20}], tone: 'aspnet'},
            {at: c('urlW'), until: c('line:url:end') + 4, spans: [{row: 4, from: 13, to: 43}], tone: 'api'},
          ]}
          runs={[{at: c('n1') - 14, output: 'docs: ✔ Connected', lineAt: [c('n1')]}]}
        />
      </Within>

      <Within from={recap.from} to={recap.to + 4}>
        <Recap />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={4} nextDay={5} nextTitle="First MCP Server" doneAt={c('end')} nextAt={c('plug')} glowAt={c('plug') + 4} />
      </Within>

      <SeriesBadge pulseAt={c('day4')} />
      <Captions />

      {[life.from - 6, code.from - 6, recap.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['word', 'routine', 'boxW', 'allW', 'fileW', 'nameW', 'urlW', 'typeW', 'rPack', 'rInst', 'plug'].map((k) => (
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
