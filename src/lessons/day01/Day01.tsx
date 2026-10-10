/**
 * Day 1 storyboard: "What is .NET?"
 * Everything is timed from cues in script.json (resolved to frames in timeline.json),
 * so re-voicing the script re-times the whole video automatically.
 */
import React from 'react';
import type {LucideIcon} from 'lucide-react';
import {Braces, Cloud, CodeXml, Database, Globe, Layers, Monitor, Package, Plug, Rocket, Server, Settings, Terminal, Wrench} from 'lucide-react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Arrow} from '../../components/Arrow';
import {Captions} from '../../components/Captions';
import {CodeEditor, SYN, Tok, typingSchedule} from '../../components/CodeEditor';
import {EndCard} from '../../components/EndCard';
import {FloatingChips} from '../../components/FloatingChips';
import {Direction} from '../../components/instructor/Instructor';
import {Glyph, Module, QBadge, Tag} from '../../components/Module';
import {Roadmap} from '../../components/Roadmap';
import {SeriesBadge} from '../../components/SeriesBadge';
import {Studio} from '../../components/Studio';
import {Sfx, ShotKey, ShotProvider, track, Within} from '../../engine/direction';
import {clamp01, CueRef, getScene, pop, ramp, resolveCue, useTimeline} from '../../engine/timeline';
import {CONCEPT, hexA} from '../../theme';

const useCues = () => {
  const tl = useTimeline();
  return {tl, c: (r: CueRef) => resolveCue(tl, r), scene: (id: string) => getScene(tl, id)};
};

// ------------------------------------------------------------------ code sample
const CODE: Tok[] = [
  {t: 'Console', c: SYN.type},
  {t: '.', c: SYN.punct},
  {t: 'WriteLine', c: SYN.method},
  {t: '(', c: SYN.punct},
  {t: '"Hello .NET!"', c: SYN.string},
  {t: ')', c: SYN.punct},
  {t: ';', c: SYN.punct},
];
const COMPLETION = {after: 8, len: 9, pause: 9, items: ['WriteLine', 'Write', 'ReadLine']};

// ------------------------------------------------------------------ small pieces
const ToolKey: React.FC<{Icon: LucideIcon; x: number; y: number; at: number; exit: number; pulse: number}> = ({Icon, x, y, at, exit, pulse}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const a = pop(frame, at, fps, 10, 180);
  const out = ramp(frame, exit, 10);
  const dy = (1 - a) * 150 - pulse * 14;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 39,
        top: y - 39 + dy,
        width: 78,
        height: 78,
        borderRadius: 20,
        background: `linear-gradient(180deg, ${hexA(CONCEPT.dotnet.main, 0.3)}, ${hexA(CONCEPT.dotnet.main, 0.1)}), #1E1E4A`,
        border: `2.5px solid ${hexA(CONCEPT.dotnet.main, 0.7)}`,
        boxShadow: `0 8px 0 ${CONCEPT.dotnet.deep}, 0 0 ${14 + 30 * pulse}px ${hexA(CONCEPT.dotnet.main, 0.35 + 0.4 * pulse)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: Math.min(1, a * 1.8) * (1 - out),
        transform: `scale(${0.5 + 0.5 * a})`,
      }}
    >
      <Icon size={40} color={CONCEPT.dotnet.main} strokeWidth={2.3} />
    </div>
  );
};

const DockFlash: React.FC<{x: number; y: number; at: number; color: string}> = ({x, y, at, color}) => {
  const frame = useCurrentFrame();
  const t = clamp01((frame - at) / 18);
  if (frame < at || t >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 260 * (0.4 + t),
        top: y - 40 * (0.4 + t),
        width: 520 * (0.4 + t),
        height: 80 * (0.4 + t),
        borderRadius: '50%',
        border: `5px solid ${color}`,
        opacity: 1 - t,
        boxShadow: `0 0 30px ${color}`,
      }}
    />
  );
};

// ------------------------------------------------------------------ scenes 2-4: one continuous concept board
const ConceptBoard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {c, scene} = useCues();
  const what = scene('what');
  const cs = scene('csharp');
  const asp = scene('aspnet');
  const boardExit = asp.to - 10;
  const tileExit = what.to - 10;

  // .NET and C# keep their identity while the story moves them around
  const net = track(frame, fps, [
    {at: c('whatNet'), x: 540, y: 410, w: 480, h: 156},
    {at: cs.from + 2, x: 540, y: 880, w: 760, h: 150},
    {at: c('remember'), x: 330, y: 820, w: 380, h: 140},
    {at: asp.from + 4, x: 780, y: 380, w: 330, h: 140},
  ]);
  const sharp = track(frame, fps, [
    {at: c('csharp'), x: 540, y: 470, w: 440, h: 150},
    {at: c('usedWith'), x: 540, y: 742, w: 440, h: 150},
    {at: c('remember'), x: 330, y: 580, w: 380, h: 140},
    {at: asp.from + 4, x: 300, y: 380, w: 330, h: 140},
  ]);
  const bob = Math.sin(frame / 9) * 8 * (1 - ramp(frame, c('usedWith'), 8));
  const netSub = ramp(frame, c('platform'), 10) * (1 - ramp(frame, c('remember'), 8));
  const sharpSub = ramp(frame, c('language'), 10) * (1 - ramp(frame, c('remember'), 8));
  const toolPulse = (i: number) => (frame >= c('tools') ? Math.max(0, Math.sin(clamp01((frame - c('tools') - i * 3) / 12) * Math.PI)) : 0);
  const aspAt = c('aspnet');
  const solidAt = (k: number) => 1 - ramp(frame, aspAt + k, 8);
  const aspGlow = frame >= aspAt + 10 ? 0.5 + 0.5 * Math.sin((frame - aspAt) / 8) : 0;
  const netGlow = frame >= c('isPlatform') && frame < asp.from ? 0.6 : 0;
  const sharpGlow = frame >= c('isLanguage') && frame < asp.from ? 0.6 : 0;
  const tools: LucideIcon[] = [Wrench, Braces, Terminal, Package, Settings];

  return (
    <>
      {/* -- What is .NET? -------------------------------------------- */}
      {tools.map((Icon, i) => (
        <ToolKey key={i} Icon={Icon} x={340 + i * 100} y={262} at={c('platform') + 2 + i * 3} exit={what.to - 8} pulse={toolPulse(i)} />
      ))}
      <Tag x={540} y={540} at={c('microsoft')} exit={c('types') - 8} text="by Microsoft" />
      <Arrow pts={[[540, 494], [540, 548], [300, 548], [300, 604]]} at={c('types')} dur={16} exit={tileExit} />
      <Arrow pts={[[540, 494], [540, 548], [780, 548], [780, 604]]} at={c('types')} dur={16} exit={tileExit} />
      <Module x={300} y={692} w={410} h={150} tone="aspnet" label="Web Apps" Icon={Globe} appear={c('web')} exit={tileExit} />
      <Module x={780} y={692} w={410} h={150} tone="api" label="APIs" Icon={Plug} appear={c('apis')} exit={tileExit + 2} />
      <Module x={300} y={872} w={410} h={150} tone="neutral" label="Desktop Apps" Icon={Monitor} appear={c('desktop')} exit={tileExit + 4} />
      <Module x={780} y={872} w={410} h={150} tone="neutral" label="Cloud" Icon={Cloud} appear={c('cloud')} exit={tileExit + 6} />

      {/* -- Where does C# fit in? ------------------------------------ */}
      <Module x={540} y={742} w={440} h={150} tone="csharp" label=" " ghost={1} appear={c('fit')} exit={c('usedWith') + 6} />
      <DockFlash x={540} y={812} at={c('usedWith') + 9} color={CONCEPT.csharp.main} />
      <Glyph x={565} y={580} at={c('isLanguage')} exit={asp.from} text="=" />
      <Glyph x={565} y={820} at={c('isPlatform')} exit={asp.from} text="=" />
      <Module variant="flat" x={800} y={580} w={360} h={124} tone="csharp" label="Language" Icon={CodeXml} appear={c('isLanguage')} exit={asp.from} />
      <Module variant="flat" x={800} y={820} w={360} h={124} tone="dotnet" label="Platform" Icon={Layers} appear={c('isPlatform')} exit={asp.from} />

      {/* -- ASP.NET Core --------------------------------------------- */}
      <Glyph x={540} y={380} at={c('useNet')} exit={boardExit} text="+" />
      <Module x={300} y={905} w={360} h={140} tone="aspnet" label="Web Apps" Icon={Globe} appear={c('websites')} ghost={solidAt(18)} exit={boardExit} />
      <Module x={780} y={905} w={360} h={140} tone="api" label="APIs" Icon={Plug} appear={c('apis2')} ghost={solidAt(22)} exit={boardExit} />
      <Arrow pts={[[330, 460], [470, 558]]} at={aspAt + 4} dur={10} exit={boardExit} color={CONCEPT.csharp.main} />
      <Arrow pts={[[750, 460], [610, 558]]} at={aspAt + 4} dur={10} exit={boardExit} color={CONCEPT.dotnet.main} />
      <Arrow pts={[[470, 730], [330, 828]]} at={aspAt + 14} dur={10} exit={boardExit} color={CONCEPT.aspnet.main} />
      <Arrow pts={[[610, 730], [750, 828]]} at={aspAt + 14} dur={10} exit={boardExit} color={CONCEPT.aspnet.main} />
      <Module x={540} y={644} w={560} h={160} tone="aspnet" label="ASP.NET Core" Icon={Server} appear={aspAt} exit={boardExit} glow={aspGlow} />

      {/* the two travelling modules sit on top */}
      <Module x={sharp.x} y={sharp.y} w={sharp.w} h={sharp.h} dy={bob} tone="csharp" label="C#" sub="programming language" subOpacity={sharpSub} Icon={Braces} appear={c('csharp')} exit={boardExit} glow={sharpGlow} />
      <QBadge x={sharp.x + sharp.w / 2 - 12} y={sharp.y - sharp.h / 2 + 8 + bob} at={c('csharp') + 4} until={c('language') - 2} />
      <Module x={net.x} y={net.y} w={net.w} h={net.h} tone="dotnet" label=".NET" sub="development platform" subOpacity={netSub} Icon={Layers} appear={c('whatNet')} exit={boardExit} glow={netGlow} />
      <QBadge x={net.x + net.w / 2 - 12} y={net.y - net.h / 2 + 8} at={c('whatNet') + 4} until={c('platform') - 4} />
    </>
  );
};

// ------------------------------------------------------------------ the video
export const Day01: React.FC = () => {
  const {c, scene} = useCues();
  const what = scene('what');
  const cs = scene('csharp');
  const asp = scene('aspnet');
  const code = scene('code');
  const road = scene('roadmap');
  const outro = scene('outro');

  const shots: ShotKey[] = [
    {at: 0, shot: 'hero'},
    {at: what.from - 6, shot: 'teach', dur: 26},
    {at: code.from - 6, shot: 'code', dur: 28},
    {at: road.from - 6, shot: 'teach', dur: 26},
    {at: outro.from - 6, shot: 'outro', dur: 28},
  ];

  const direction: Direction = {
    gestures: [
      {at: 0, pose: 'rest'},
      {at: 'line:hook', pose: 'openToViewer'},
      {at: 'confused', pose: 'shrug'},
      {at: 'line:welcome', pose: 'wave'},
      {at: 'understand', pose: 'explain'},
      {at: what.from, pose: 'explain'},
      {at: 'whatNet', pose: {point: [540, 410]}},
      {at: 'platform', pose: 'explain'},
      {at: 'microsoft', pose: 'openToViewer'},
      {at: 'tools', pose: {point: [540, 262]}},
      {at: 'web', pose: {point: [300, 692]}},
      {at: 'apis', pose: {point: [780, 692]}},
      {at: 'desktop', pose: {point: [300, 872]}},
      {at: 'cloud', pose: {point: [780, 872]}},
      {at: 'line:apps:end', pose: 'explain'},
      {at: 'csharp', pose: 'shrug'},
      {at: 'language', pose: {point: [540, 470]}},
      {at: 'usedWith', pose: 'explain'},
      {at: 'remember', pose: 'openToViewer'},
      {at: 'isPlatform', pose: {point: [800, 820]}},
      {at: 'isLanguage', pose: {point: [800, 580]}},
      {at: 'line:remember:end', pose: 'explain'},
      {at: 'useNet', pose: {point: [780, 380]}},
      {at: 'websites', pose: {point: [300, 905]}},
      {at: 'apis2', pose: {point: [780, 905]}},
      {at: 'aspnet', pose: {point: [540, 644]}},
      {at: 'line:aspnet:end', pose: 'explain'},
      {at: code.from, pose: 'explain'},
      {at: 'example', pose: 'openToViewer'},
      {at: 'console', pose: {point: [250, 420]}},
      {at: 'line:code:end', pose: 'explain'},
      {at: 'line:dontWorry', pose: 'calm'},
      {at: road.from, pose: 'explain'},
      {at: 'step', pose: {point: [360, 300]}},
      {at: 'step+16', pose: {point: [360, 580]}},
      {at: 'step+34', pose: {point: [360, 860]}},
      {at: 'line:stepByStep:end+22', pose: 'presentRight'},
      {at: outro.from, pose: 'explain'},
      {at: 'day1done', pose: 'openToViewer'},
      {at: 'seeYou', pose: 'wave'},
    ],
    smile: [
      {at: 0, v: 0.55},
      {at: 'line:welcome', v: 0.8},
      {at: 'understand', v: 0.55},
      {at: 'line:dontWorry', v: 0.85},
      {at: 'line:stepByStep', v: 0.6},
      {at: 'line:bye', v: 0.85},
      {at: 'line:bye:end', v: 1},
    ],
    brows: [
      {at: 'line:hook', v: 0.5, hold: 40},
      {at: 'confused', v: 0.9, hold: 40},
      {at: 'line:what', v: 0.8, hold: 34},
      {at: 'line:csharpQ', v: 0.9, hold: 44},
      {at: 'aspnet', v: 0.6, hold: 24},
      {at: 'line:bye', v: 0.5, hold: 30},
    ],
  };

  const typed = typingSchedule(CODE.map((t) => t.t).join(''), c('example') + 10, COMPLETION);
  const keyFrames = typed.filter((f, i) => typed.indexOf(f) === i);

  return (
    <ShotProvider keys={shots}>
      <Studio direction={direction} />

      <Within from={0} to={what.from + 10}>
        <FloatingChips
          at={c('confused') - 4}
          until={c('line:welcome') + 2}
          items={[
            {text: 'C#', tone: 'csharp', x: 205, y: 905},
            {text: 'ASP.NET', tone: 'aspnet', x: 870, y: 875},
            {text: 'APIs', tone: 'api', x: 190, y: 1165},
            {text: 'Cloud', tone: 'neutral', x: 885, y: 1150},
          ]}
        />
      </Within>

      <Within from={what.from} to={asp.to + 4}>
        <ConceptBoard />
      </Within>

      <Within from={code.from - 2} to={code.to + 6}>
        <CodeEditor
          rect={{x: 56, y: 236, w: 968, h: 860}}
          enter={code.from}
          exit={code.to - 8}
          filename="Program.cs"
          comment="// Your first C# program"
          tokens={CODE}
          typeStart={c('example') + 10}
          completion={COMPLETION}
          highlights={[
            {at: c('console'), from: 0, to: 7, label: 'the console window'},
            {at: c('writeline'), from: 8, to: 17, label: 'prints a line'},
            {at: c('hello'), from: 18, to: 31, label: 'the text to show'},
          ]}
          highlightEnd={c('line:code:end') + 4}
          runAt={c('line:code:end') + 2}
          command="dotnet run"
          output="Hello .NET!"
        />
      </Within>

      <Within from={road.from - 2} to={road.to + 6}>
        <Roadmap
          steps={[
            {label: 'C#', tone: 'csharp', Icon: Braces},
            {label: '.NET', tone: 'dotnet', Icon: Layers},
            {label: 'ASP.NET Core', tone: 'aspnet', Icon: Server},
            {label: 'APIs', tone: 'api', Icon: Plug},
            {label: 'Database', tone: 'neutral', Icon: Database},
            {label: 'Real Applications', tone: 'warm', Icon: Rocket},
          ]}
          spineX={360}
          top={300}
          gap={140}
          moduleX={430}
          moduleW={560}
          moduleH={104}
          start={road.from + 8}
          interval={11}
          exit={road.to - 10}
          tag={{text: 'Day 2', step: 0}}
        />
      </Within>

      <Within from={outro.from} to={outro.to + 1}>
        <EndCard day={1} nextDay={2} nextTitle="C# Basics" doneAt={c('day1done')} nextAt={c('day2')} glowAt={c('basics')} />
      </Within>

      <SeriesBadge pulseAt={c('day1')} />
      <Captions />

      {/* sound design */}
      {[what.from - 6, asp.from, code.from - 6, road.from - 6, outro.from - 6].map((f) => (
        <Sfx key={`w${f}`} at={f} name="whoosh" volume={0.3} />
      ))}
      {['whatNet', 'web', 'apis', 'desktop', 'cloud', 'csharp', 'isPlatform', 'isLanguage', 'aspnet', 'day2'].map((k) => (
        <Sfx key={k} at={c(k)} name="pop" volume={0.24} />
      ))}
      <Sfx at={c('usedWith') + 9} name="pop" volume={0.3} />
      {keyFrames.map((f, i) => (
        <Sfx key={`k${f}`} at={f} name={`key${(i % 4) + 1}`} volume={0.32} />
      ))}
      <Sfx at={c('line:code:end') + 2} name="key2" volume={0.5} />
      <Sfx at={c('day1done')} name="chime" volume={0.32} />
      <Sfx at={cs.from} name="whoosh" volume={0.18} />
    </ShotProvider>
  );
};
