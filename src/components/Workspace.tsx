import React from 'react';
import {random} from 'remotion';

/**
 * A night-time developer studio drawn in SVG (1080x1920 space).
 * Rendered slightly out of focus (depth of field) behind the instructor.
 */
const W = 1080;
const H = 1920;

const Skyline: React.FC = () => {
  const blds = Array.from({length: 13}, (_, i) => {
    const w = 30 + random(`bw${i}`) * 50;
    const h = 120 + random(`bh${i}`) * 260;
    return {x: 70 + i * 38 + random(`bx${i}`) * 10, w, h};
  });
  return (
    <g>
      {blds.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={1060 - b.h} width={b.w} height={b.h} fill={i % 2 ? '#1A1A47' : '#151540'} />
          {Array.from({length: Math.floor(b.h / 26)}, (_, r) =>
            Array.from({length: Math.floor(b.w / 14)}, (_, c) =>
              random(`win${i}-${r}-${c}`) > 0.62 ? (
                <rect
                  key={`${r}-${c}`}
                  x={b.x + 5 + c * 14}
                  y={1060 - b.h + 10 + r * 26}
                  width={6}
                  height={9}
                  fill={random(`wc${i}${r}${c}`) > 0.5 ? '#FFD38A' : '#8FE3FF'}
                  opacity={0.55 + random(`wo${i}${r}${c}`) * 0.4}
                />
              ) : null,
            ),
          )}
        </g>
      ))}
    </g>
  );
};

const Book: React.FC<{x: number; y: number; w: number; h: number; c: string; tilt?: number}> = ({x, y, w, h, c, tilt = 0}) => (
  <g transform={`rotate(${tilt} ${x + w / 2} ${y})`}>
    <rect x={x} y={y - h} width={w} height={h} rx={3} fill={c} />
    <rect x={x + 3} y={y - h + 12} width={w - 6} height={4} fill="rgba(255,255,255,0.25)" />
  </g>
);

const CodeLines: React.FC<{x: number; y: number; w: number; rows: number; seed: string}> = ({x, y, w, rows, seed}) => {
  const palette = ['#9A7BFF', '#3FE0A0', '#56CFF5', '#FFB84D', '#C9C4F2', '#FF8FA8'];
  return (
    <g>
      {Array.from({length: rows}, (_, r) => {
        const indent = Math.floor(random(`${seed}i${r}`) * 3) * 18;
        let cx = x + indent;
        const segs = 1 + Math.floor(random(`${seed}n${r}`) * 3);
        return Array.from({length: segs}, (_, s) => {
          const sw = 20 + random(`${seed}w${r}${s}`) * (w * 0.32);
          const el = (
            <rect
              key={`${r}-${s}`}
              x={cx}
              y={y + r * 22}
              width={Math.min(sw, x + w - cx)}
              height={9}
              rx={4.5}
              fill={palette[Math.floor(random(`${seed}c${r}${s}`) * palette.length)]}
              opacity={0.8}
            />
          );
          cx += sw + 10;
          return cx < x + w ? el : null;
        });
      })}
    </g>
  );
};

const Leaf: React.FC<{x: number; y: number; r: number; a: number; c: string}> = ({x, y, r, a, c}) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <path d={`M0 0 C ${r * 0.55} ${-r * 0.15} ${r * 0.75} ${-r * 0.75} 0 ${-r} C ${-r * 0.75} ${-r * 0.75} ${-r * 0.55} ${-r * 0.15} 0 0 Z`} fill={c} />
    <path d={`M0 0 L0 ${-r * 0.9}`} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
  </g>
);

export const WorkspaceArt: React.FC = () => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{display: 'block'}}>
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1C1A4A" />
        <stop offset="0.55" stopColor="#17163E" />
        <stop offset="1" stopColor="#0E0D29" />
      </linearGradient>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#141C55" />
        <stop offset="0.55" stopColor="#3A2C8F" />
        <stop offset="0.85" stopColor="#7A47B8" />
        <stop offset="1" stopColor="#C2649F" />
      </linearGradient>
      <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#FFC67A" stopOpacity="0.55" />
        <stop offset="1" stopColor="#FFC67A" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="violetGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#8F6BFF" stopOpacity="0.5" />
        <stop offset="1" stopColor="#8F6BFF" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="mintGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#3FE0A0" stopOpacity="0.45" />
        <stop offset="1" stopColor="#3FE0A0" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="screenGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#56CFF5" stopOpacity="0.35" />
        <stop offset="1" stopColor="#56CFF5" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3A2F5E" />
        <stop offset="0.08" stopColor="#2A2249" />
        <stop offset="1" stopColor="#161233" />
      </linearGradient>
      <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#05051A" stopOpacity="0.7" />
      </radialGradient>
    </defs>

    {/* wall */}
    <rect width={W} height={H} fill="url(#wall)" />
    {/* ceiling LED strip */}
    <ellipse cx={540} cy={70} rx={700} ry={120} fill="url(#violetGlow)" />
    <rect x={0} y={64} width={W} height={8} fill="#B9A2FF" opacity={0.9} />

    {/* window with night skyline */}
    <rect x={60} y={250} width={500} height={830} rx={10} fill="#0B0B22" />
    <rect x={78} y={268} width={464} height={794} fill="url(#sky)" />
    <circle cx={430} cy={380} r={34} fill="#F6E7FF" opacity={0.85} />
    <circle cx={430} cy={380} r={90} fill="#F6E7FF" opacity={0.08} />
    <Skyline />
    <rect x={302} y={268} width={14} height={794} fill="#0B0B22" />
    <rect x={78} y={655} width={464} height={14} fill="#0B0B22" />
    <rect x={50} y={1076} width={520} height={22} rx={6} fill="#262055" />

    {/* neon braces sign */}
    <ellipse cx={850} cy={330} rx={220} ry={150} fill="url(#mintGlow)" />
    <text x={850} y={372} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={128} fontWeight={700} fill="#7FFFD0" opacity={0.95}>
      {'{ }'}
    </text>

    {/* shelves */}
    {[610, 840].map((y, i) => (
      <g key={y}>
        <rect x={640} y={y} width={400} height={16} rx={4} fill="#2E2860" />
        <rect x={640} y={y + 16} width={400} height={8} fill="#100E2A" opacity={0.6} />
        {i === 0 ? (
          <>
            <Book x={670} y={y} w={30} h={118} c="#6D5DD3" />
            <Book x={704} y={y} w={24} h={130} c="#3E7CB1" />
            <Book x={732} y={y} w={34} h={104} c="#E0A458" />
            <Book x={770} y={y} w={22} h={124} c="#44B39D" tilt={8} />
            <rect x={870} y={y - 70} width={64} height={70} rx={10} fill="#2B2B66" />
            <circle cx={902} cy={y - 35} r={18} fill="#161640" />
            <circle cx={902} cy={y - 35} r={7} fill="#56CFF5" opacity={0.8} />
            <path d={`M 975 ${y} l 8 -46 h 34 l 8 46 z`} fill="#C65D7B" />
            <Leaf x={1000} y={y - 44} r={46} a={-25} c="#3FAF7F" />
            <Leaf x={1000} y={y - 44} r={52} a={15} c="#2F8F6B" />
          </>
        ) : (
          <>
            <rect x={670} y={y - 92} width={120} height={92} rx={8} fill="#22224F" />
            <rect x={680} y={y - 82} width={100} height={64} rx={4} fill="#3A2C8F" />
            <Book x={820} y={y} w={28} h={120} c="#C65D7B" />
            <Book x={852} y={y} w={30} h={112} c="#6D5DD3" />
            <Book x={886} y={y} w={22} h={126} c="#E0A458" />
            <Book x={912} y={y} w={26} h={98} c="#3E7CB1" tilt={-12} />
          </>
        )}
      </g>
    ))}

    {/* monitors behind the instructor (right side of desk) */}
    <ellipse cx={850} cy={1210} rx={330} ry={240} fill="url(#screenGlow)" />
    <g>
      <rect x={600} y={1010} width={300} height={190} rx={14} fill="#0A0A1C" />
      <rect x={612} y={1022} width={276} height={166} rx={8} fill="#141436" />
      <CodeLines x={628} y={1040} w={244} rows={6} seed="m1" />
      <rect x={740} y={1200} width={20} height={120} fill="#0A0A1C" />
      <rect x={700} y={1316} width={100} height={12} rx={6} fill="#0A0A1C" />
    </g>
    <g>
      <rect x={880} y={970} width={240} height={330} rx={14} fill="#0A0A1C" />
      <rect x={892} y={982} width={216} height={306} rx={8} fill="#141436" />
      <CodeLines x={906} y={1000} w={190} rows={12} seed="m2" />
    </g>

    {/* desk lamp + plant (left) */}
    <ellipse cx={200} cy={1250} rx={260} ry={220} fill="url(#lamp)" />
    <g stroke="#2C2650" strokeWidth={16} strokeLinecap="round" fill="none">
      <path d="M 160 1376 L 120 1220 L 230 1140" />
    </g>
    <path d="M 214 1110 L 300 1158 L 262 1196 L 196 1140 Z" fill="#3B3470" />
    <ellipse cx={268} cy={1182} rx={30} ry={14} fill="#FFD9A0" opacity={0.95} />
    <rect x={120} y={1366} width={84} height={16} rx={8} fill="#2C2650" />
    <g>
      <Leaf x={40} y={1370} r={170} a={-35} c="#2F8F6B" />
      <Leaf x={60} y={1370} r={200} a={-8} c="#3FAF7F" />
      <Leaf x={70} y={1370} r={150} a={22} c="#2A7D5E" />
      <path d="M 10 1370 h 110 l -14 120 h -82 z" fill="#B9476A" />
    </g>

    {/* desk */}
    <rect x={0} y={1376} width={W} height={H - 1376} fill="url(#desk)" />
    <rect x={0} y={1376} width={W} height={5} fill="#5B4D93" opacity={0.6} />
    {/* mug */}
    <g>
      <rect x={940} y={1310} width={58} height={70} rx={10} fill="#E9E5FF" />
      <path d="M 998 1326 c 26 0 26 40 0 40" stroke="#E9E5FF" strokeWidth={9} fill="none" />
      <rect x={952} y={1330} width={34} height={8} rx={4} fill="#9A7BFF" />
    </g>

    <rect width={W} height={H} fill="url(#vignette)" />
  </svg>
);

/** Backdrop with depth-of-field blur (slightly oversized so blurred edges stay off-frame). */
export const Workspace: React.FC<{blur?: number}> = ({blur = 7}) => (
  <div style={{position: 'absolute', inset: 0, background: '#14143A', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: 'scale(1.06)', filter: `blur(${blur}px) saturate(1.05)`}}>
      <WorkspaceArt />
    </div>
  </div>
);

/** 1-frame composition used to bake the backdrop into public/generated/workspace.png. */
export const WorkspaceStill: React.FC = () => <Workspace />;
