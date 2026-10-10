import React from 'react';

/**
 * Stylised developer instructor, drawn in an 800 x 1000 local canvas
 * (waist-up, anchor = bottom centre at 400,1000). Every moving part is a
 * nested SVG group so poses are just numbers.
 */
export type HandShape = 'relaxed' | 'open' | 'palm' | 'point' | 'fist';
export type ArmState = {s: number; e: number; w: number; hand: HandShape; f?: number};
export type MouthState = {open: number; wide: number; round: number; smile: number};
export type RigState = {
  R: ArmState; // character's right arm (viewer's left)
  L: ArmState; // character's left arm (viewer's right)
  headTilt: number;
  headY: number;
  headTurn: number; // -1 (looks to viewer's left) .. 1 (viewer's right)
  gaze: {x: number; y: number}; // -1..1
  blink: number; // 0 open .. 1 closed
  brow: number; // -1 frown .. 1 raised
  mouth: MouthState;
  bodyTilt: number;
  breath: number; // 0..1
  cheek: number; // 0..1, smile squint
};

export const RIG = {
  width: 800,
  height: 1000,
  shoulderR: {x: 252, y: 576},
  shoulderL: {x: 548, y: 576},
  upper: 214,
  fore: 184,
  headPivot: {x: 400, y: 440},
};

const SKIN = '#EDB48E';
const SKIN_SHADE = '#D4936D';
const SKIN_DEEP = '#B97A57';
const SKIN_LINE = '#A86C4C';
const HAIR = '#2B1B14';
const HAIR_HI = '#5A3B2A';
const SHIRT = '#22457E';
const SHIRT_DARK = '#152E57';
const SHIRT_LIGHT = '#2E5A9C';
const IRIS = '#6B4426';

// ------------------------------------------------------------------ hands
const finger = (x: number, y: number, len: number, w: number, rot: number, key: string) => (
  <rect key={key} x={-w / 2} y={0} width={w} height={len} rx={w / 2} transform={`translate(${x} ${y}) rotate(${rot})`} />
);

const Hand: React.FC<{shape: HandShape}> = ({shape}) => {
  const common = {fill: SKIN, stroke: SKIN_LINE, strokeWidth: 2.4} as const;
  switch (shape) {
    case 'open': // palm up / presenting, fingers together, thumb out on +x
      return (
        <g {...common}>
          {finger(25, 16, 42, 17, -52, 't')}
          {finger(-21, 46, 40, 15, 4, 'f4')}
          {finger(-7, 48, 50, 15, 1.5, 'f3')}
          {finger(7, 48, 52, 15, -1, 'f2')}
          {finger(21, 46, 45, 15, -3, 'f1')}
          <rect x={-30} y={0} width={60} height={60} rx={22} />
          <path d="M -12 30 C -4 38 8 38 16 30" fill="none" stroke={SKIN_DEEP} strokeWidth={2} opacity={0.6} />
        </g>
      );
    case 'palm': // facing viewer, fingers spread (wave)
      return (
        <g {...common}>
          {finger(-27, 20, 44, 17, 58, 't')}
          {finger(-21, 46, 38, 15, 14, 'f4')}
          {finger(-7, 50, 50, 15, 4, 'f3')}
          {finger(8, 50, 53, 15, -4, 'f2')}
          {finger(22, 46, 45, 15, -14, 'f1')}
          <rect x={-30} y={0} width={60} height={62} rx={22} />
          <path d="M -14 22 C -16 36 -10 48 0 52" fill="none" stroke={SKIN_DEEP} strokeWidth={2} opacity={0.55} />
        </g>
      );
    case 'point': // fist with index extended along +y
      return (
        <g {...common}>
          {finger(-15, 38, 62, 16, 0, 'idx')}
          <rect x={-29} y={0} width={58} height={56} rx={22} />
          <rect x={-8} y={40} width={36} height={26} rx={12} />
          <path d="M 4 44 L 4 64 M 16 44 L 16 63" stroke={SKIN_LINE} strokeWidth={2} />
          {finger(-24, 16, 34, 16, -38, 'thumb')}
        </g>
      );
    case 'fist':
      return (
        <g {...common}>
          <rect x={-29} y={0} width={58} height={58} rx={22} />
          <rect x={-27} y={40} width={54} height={28} rx={13} />
          <path d="M -13 44 L -13 66 M 0 44 L 0 67 M 13 44 L 13 66" stroke={SKIN_LINE} strokeWidth={2} />
          {finger(-24, 14, 32, 16, -30, 'thumb')}
        </g>
      );
    case 'relaxed':
    default:
      return (
        <g {...common}>
          {finger(-25, 14, 38, 16, 22, 't')}
          <rect x={-28} y={0} width={56} height={60} rx={22} />
          <path d="M -26 46 C -20 72 18 76 26 48" />
          <path d="M -10 52 C -8 62 -6 66 -4 70 M 6 52 C 8 62 9 66 10 69" fill="none" stroke={SKIN_LINE} strokeWidth={2} />
        </g>
      );
  }
};

// ------------------------------------------------------------------ arms
const SLEEVE = 'M -44 -6 C -47 40 -42 130 -37 214 L 37 214 C 42 130 47 40 44 -6 C 40 -46 -40 -46 -44 -6 Z';
const FOREARM = 'M -28 -4 C -29 60 -25 128 -22 184 L 22 184 C 25 128 29 60 28 -4 Z';

const Arm: React.FC<{side: 'R' | 'L'; st: ArmState}> = ({side, st}) => {
  const sh = side === 'R' ? RIG.shoulderR : RIG.shoulderL;
  const mirror = side === 'L' ? -1 : 1;
  return (
    <g transform={`translate(${sh.x} ${sh.y}) rotate(${st.s})`}>
      <path d={SLEEVE} fill={`url(#sleeve${side})`} stroke={SHIRT_DARK} strokeWidth={2} />
      <path d="M -30 40 C -26 100 -22 150 -20 196" stroke={SHIRT_DARK} strokeWidth={3} fill="none" opacity={0.35} />
      <g transform={`translate(0 ${RIG.upper}) rotate(${st.e})`}>
        <g transform={`scale(1 ${st.f ?? 1})`}>
        <path d={FOREARM} fill={SKIN} stroke={SKIN_LINE} strokeWidth={2.4} />
        <path d="M 10 30 C 14 80 12 130 8 170" stroke={SKIN_SHADE} strokeWidth={5} fill="none" opacity={0.45} />
        {side === 'L' ? (
          <g>
            <rect x={-25} y={146} width={50} height={24} rx={7} fill="#1B2236" />
            <rect x={-15} y={142} width={30} height={32} rx={8} fill="#0D1222" stroke="#2C3757" strokeWidth={2} />
            <rect x={-10} y={149} width={20} height={18} rx={4} fill="#3FE0A0" opacity={0.75} />
          </g>
        ) : null}
        </g>
        <g transform={`translate(0 ${RIG.fore * (st.f ?? 1)}) rotate(${st.w}) scale(${mirror * 1.24} 1.24)`}>
          <Hand shape={st.hand} />
        </g>
      </g>
      {/* rolled-up cuff covers the elbow joint */}
      <rect x={-41} y={RIG.upper - 30} width={82} height={40} rx={16} fill={SHIRT_LIGHT} stroke={SHIRT_DARK} strokeWidth={2} />
      <path d={`M -36 ${RIG.upper - 12} L 36 ${RIG.upper - 12}`} stroke={SHIRT_DARK} strokeWidth={2} opacity={0.5} />
    </g>
  );
};

// ------------------------------------------------------------------ face parts
const SCLERA = 'M -21 0 C -13 -12 13 -12 21 0 C 13 10 -13 10 -21 0 Z';

const Eye: React.FC<{x: number; y: number; gaze: {x: number; y: number}; blink: number; id: string; cheek: number}> = ({
  x,
  y,
  gaze,
  blink,
  id,
  cheek,
}) => {
  const open = Math.max(0.06, 1 - blink) * (1 - cheek * 0.22);
  const lid = -12 * open + 2 * (1 - open);
  return (
    <g transform={`translate(${x} ${y}) scale(1.1)`}>
      <g transform={`scale(1 ${open})`}>
        <clipPath id={id}>
          <path d={SCLERA} />
        </clipPath>
        <path d={SCLERA} fill="#FBF7F3" />
        <g clipPath={`url(#${id})`}>
          <circle cx={gaze.x * 7} cy={gaze.y * 4 + 0.5} r={10.5} fill={IRIS} />
          <circle cx={gaze.x * 7} cy={gaze.y * 4 + 0.5} r={5.4} fill="#1A0F0A" />
          <circle cx={gaze.x * 7 - 3.4} cy={gaze.y * 4 - 3.2} r={2.9} fill="#FFFFFF" />
          <path d="M -22 -2 C -12 -12 12 -12 22 -2 L 22 -14 L -22 -14 Z" fill="rgba(120,70,40,0.18)" />
        </g>
      </g>
      <path d={`M -23 1 C -13 ${lid} 13 ${lid} 23 0`} fill="none" stroke="#2A1810" strokeWidth={4.2} strokeLinecap="round" />
      <path d={`M -16 ${7 * open + 1} C -6 ${10 * open + 2} 6 ${10 * open + 2} 16 ${7 * open + 1}`} fill="none" stroke={SKIN_DEEP} strokeWidth={1.6} opacity={0.5} />
    </g>
  );
};

const Mouth: React.FC<{m: MouthState; dx: number; id: string}> = ({m, dx, id}) => {
  const cx = 400 + dx;
  const cy = 388;
  const halfW = 23 * (0.78 + 0.42 * m.wide) * (1 - 0.32 * m.round) + m.smile * 3;
  const lift = 2 + m.smile * 6;
  const cyC = cy - lift * 0.55;
  const open = m.open * 27;
  if (open < 1.6) {
    return (
      <g>
        <path d={`M ${cx - halfW} ${cyC} Q ${cx} ${cy + lift * 0.9} ${cx + halfW} ${cyC}`} fill="none" stroke="#7A3A2E" strokeWidth={4.4} strokeLinecap="round" />
        <path d={`M ${cx - halfW * 0.5} ${cy + 12} Q ${cx} ${cy + 16} ${cx + halfW * 0.5} ${cy + 12}`} fill="none" stroke={SKIN_DEEP} strokeWidth={2.2} opacity={0.45} strokeLinecap="round" />
      </g>
    );
  }
  const top = cyC - open * 0.22 - m.round * 4;
  const bottom = cy + open + lift * 0.3;
  const d = `M ${cx - halfW} ${cyC} Q ${cx} ${top - 4} ${cx + halfW} ${cyC} Q ${cx + halfW * 0.85} ${bottom} ${cx} ${bottom} Q ${cx - halfW * 0.85} ${bottom} ${cx - halfW} ${cyC} Z`;
  return (
    <g>
      <clipPath id={id}>
        <path d={d} />
      </clipPath>
      <path d={d} fill="#4A1C1E" />
      <g clipPath={`url(#${id})`}>
        <rect x={cx - halfW} y={top - 8} width={halfW * 2} height={11 + open * 0.12} fill="#FBF6F0" />
        <ellipse cx={cx} cy={bottom + 2} rx={halfW * 0.72} ry={4 + open * 0.38} fill="#D2656E" />
      </g>
      <path d={d} fill="none" stroke="#7A3A2E" strokeWidth={2.6} strokeLinejoin="round" />
      <path d={`M ${cx - halfW * 0.5} ${bottom + 9} Q ${cx} ${bottom + 13} ${cx + halfW * 0.5} ${bottom + 9}`} fill="none" stroke={SKIN_DEEP} strokeWidth={2.2} opacity={0.4} strokeLinecap="round" />
    </g>
  );
};

// ------------------------------------------------------------------ full rig
export const Rig: React.FC<{st: RigState; uid?: string}> = ({st, uid = 'inst'}) => {
  const fx = st.headTurn * 11;
  const browY = -st.brow * 7;
  return (
    <svg viewBox={`0 0 ${RIG.width} ${RIG.height}`} width={RIG.width} height={RIG.height} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <linearGradient id="shirtBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={SHIRT_DARK} />
          <stop offset="0.28" stopColor={SHIRT} />
          <stop offset="0.6" stopColor={SHIRT_LIGHT} />
          <stop offset="1" stopColor={SHIRT_DARK} />
        </linearGradient>
        <linearGradient id="sleeveR" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={SHIRT_DARK} />
          <stop offset="0.6" stopColor={SHIRT} />
          <stop offset="1" stopColor={SHIRT_LIGHT} />
        </linearGradient>
        <linearGradient id="sleeveL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={SHIRT_LIGHT} />
          <stop offset="0.4" stopColor={SHIRT} />
          <stop offset="1" stopColor={SHIRT_DARK} />
        </linearGradient>
        <radialGradient id="faceShade" cx="0.42" cy="0.38" r="0.7">
          <stop offset="0.55" stopColor={SKIN} />
          <stop offset="1" stopColor={SKIN_SHADE} />
        </radialGradient>
        <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={HAIR_HI} />
          <stop offset="0.45" stopColor={HAIR} />
          <stop offset="1" stopColor="#1C110C" />
        </linearGradient>
        <linearGradient id="rimLight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.75" stopColor="#8F6BFF" stopOpacity="0" />
          <stop offset="1" stopColor="#B49BFF" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <g transform={`rotate(${st.bodyTilt} 400 1000)`}>
        {/* ---------------- torso */}
        <g transform={`translate(400 1000) scale(1 ${1 + st.breath * 0.008}) translate(-400 -1000)`}>
          <path
            d="M 342 466 C 302 474 266 488 242 512 C 222 532 212 558 212 594 L 222 1000 L 578 1000 L 588 594 C 588 558 578 532 558 512 C 534 488 498 474 458 466 Z"
            fill="url(#shirtBody)"
            stroke={SHIRT_DARK}
            strokeWidth={2.5}
          />
          <path d="M 212 594 L 222 1000 L 578 1000 L 588 594 C 588 558 578 532 558 512" fill="url(#rimLight)" opacity={0.9} />
          {/* folds */}
          <path d="M 262 650 C 300 690 330 720 350 790" stroke={SHIRT_DARK} strokeWidth={4} fill="none" opacity={0.35} strokeLinecap="round" />
          <path d="M 540 650 C 505 690 478 730 462 800" stroke={SHIRT_DARK} strokeWidth={4} fill="none" opacity={0.3} strokeLinecap="round" />
          <path d="M 300 930 C 340 950 360 960 380 990" stroke={SHIRT_DARK} strokeWidth={4} fill="none" opacity={0.25} strokeLinecap="round" />
          {/* pocket */}
          <path d="M 446 640 L 516 640 L 514 716 C 500 726 462 726 448 716 Z" fill={SHIRT} stroke={SHIRT_DARK} strokeWidth={2.5} />
          <path d="M 446 640 L 516 640 L 515 656 L 447 656 Z" fill={SHIRT_LIGHT} stroke={SHIRT_DARK} strokeWidth={2} />
          {/* placket + buttons */}
          <rect x={390} y={552} width={20} height={448} fill={SHIRT_LIGHT} opacity={0.55} />
          <path d="M 410 552 L 410 1000" stroke={SHIRT_DARK} strokeWidth={2.5} />
          {[620, 720, 820, 920].map((y) => (
            <g key={y}>
              <circle cx={400} cy={y} r={6.5} fill="#DCE3F2" stroke="#8E9BB8" strokeWidth={1.5} />
              <circle cx={400} cy={y} r={1.6} fill="#8E9BB8" />
            </g>
          ))}
          {/* collar back band */}
          <path d="M 344 470 C 366 446 434 446 456 470 L 450 486 C 430 470 370 470 350 486 Z" fill="#1A3767" />
        </g>

        {/* ---------------- neck */}
        <path d="M 364 372 L 436 372 L 440 476 C 426 494 374 494 360 476 Z" fill={SKIN} stroke={SKIN_LINE} strokeWidth={2} />
        <path d="M 362 410 C 380 440 420 440 438 410 L 438 380 L 362 380 Z" fill={SKIN_SHADE} opacity={0.75} />
        <path d="M 364 474 L 400 556 L 436 474 C 420 486 380 486 364 474 Z" fill={SKIN_SHADE} />
        <path d="M 372 478 L 400 540 L 428 478" fill={SKIN} opacity={0.6} />
        {/* collar flaps */}
        <path d="M 344 462 C 356 494 376 526 398 558 L 330 548 C 324 528 318 506 316 488 C 324 476 334 468 344 462 Z" fill={SHIRT_LIGHT} stroke={SHIRT_DARK} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M 456 462 C 444 494 424 526 402 558 L 470 548 C 476 528 482 506 484 488 C 476 476 466 468 456 462 Z" fill={SHIRT_LIGHT} stroke={SHIRT_DARK} strokeWidth={2.5} strokeLinejoin="round" />

        {/* ---------------- head */}
        <g transform={`translate(0 ${st.headY}) rotate(${st.headTilt} ${RIG.headPivot.x} ${RIG.headPivot.y}) translate(400 440) scale(1.08) translate(-400 -440)`}>
          {/* ears */}
          <path d="M 304 276 C 282 270 270 290 273 314 C 276 340 290 356 306 352 Z" fill={SKIN} stroke={SKIN_LINE} strokeWidth={2.2} />
          <path d="M 296 296 C 288 304 290 324 300 334" stroke={SKIN_DEEP} strokeWidth={3} fill="none" opacity={0.6} />
          <path d="M 496 276 C 518 270 530 290 527 314 C 524 340 510 356 494 352 Z" fill={SKIN} stroke={SKIN_LINE} strokeWidth={2.2} />
          <path d="M 504 296 C 512 304 510 324 500 334" stroke={SKIN_DEEP} strokeWidth={3} fill="none" opacity={0.6} />
          {/* face */}
          <path
            d="M 400 172 C 458 172 504 210 505 272 C 506 334 495 376 469 404 C 448 426 425 438 400 438 C 375 438 352 426 331 404 C 305 376 294 334 295 272 C 296 210 342 172 400 172 Z"
            fill="url(#faceShade)"
            stroke={SKIN_LINE}
            strokeWidth={2.4}
          />
          {/* side shade (light from the left window) */}
          <path d="M 472 228 C 500 262 504 330 488 374 C 478 398 460 418 438 430 C 466 400 482 360 484 318 C 486 280 482 252 472 228 Z" fill={SKIN_SHADE} opacity={0.55} />
          {/* stubble */}
          <path
            d={`M ${300 + fx * 0.3} 316 C 304 372 340 432 400 440 C 460 432 496 372 ${500 + fx * 0.3} 316 C 490 352 470 382 ${444 + fx} 396 C ${430 + fx} 374 ${370 + fx} 374 ${356 + fx} 396 C 330 382 310 352 ${300 + fx * 0.3} 316 Z`}
            fill="#6E4A35"
            opacity={0.17}
          />
          <path d={`M ${366 + fx} 366 C ${382 + fx} 357 ${418 + fx} 357 ${434 + fx} 366 C ${420 + fx} 371 ${380 + fx} 371 ${366 + fx} 366 Z`} fill="#6E4A35" opacity={0.18} />
          {/* cheeks */}
          <ellipse cx={336 + fx} cy={346} rx={24} ry={12} fill="#E58E7A" opacity={0.22 + st.cheek * 0.15} />
          <ellipse cx={464 + fx} cy={346} rx={24} ry={12} fill="#E58E7A" opacity={0.22 + st.cheek * 0.15} />
          {/* nose */}
          <path d={`M ${404 + fx * 1.1} 300 C ${410 + fx * 1.1} 320 ${416 + fx * 1.2} 334 ${414 + fx * 1.2} 346 C ${412 + fx * 1.2} 351 ${407 + fx * 1.2} 352 ${403 + fx * 1.2} 351 Z`} fill={SKIN_SHADE} opacity={0.7} />
          <path d={`M ${392 + fx * 1.2} 344 C ${396 + fx * 1.2} 354 ${410 + fx * 1.2} 354 ${416 + fx * 1.2} 346`} stroke={SKIN_LINE} strokeWidth={3.2} fill="none" strokeLinecap="round" />
          {/* eyes + brows */}
          <Eye x={356 + fx} y={292} gaze={st.gaze} blink={st.blink} id={`${uid}-eyeR`} cheek={st.cheek} />
          <Eye x={444 + fx} y={292} gaze={st.gaze} blink={st.blink} id={`${uid}-eyeL`} cheek={st.cheek} />
          <path d={`M ${328 + fx} ${262 + browY} C ${342 + fx} ${249 + browY * 1.2} ${366 + fx} ${247 + browY * 1.2} ${386 + fx} ${254 + browY}`} stroke={HAIR} strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d={`M ${414 + fx} ${254 + browY} C ${434 + fx} ${247 + browY * 1.2} ${458 + fx} ${249 + browY * 1.2} ${472 + fx} ${262 + browY}`} stroke={HAIR} strokeWidth={10} fill="none" strokeLinecap="round" />
          {/* mouth */}
          <Mouth m={st.mouth} dx={fx * 1.1} id={`${uid}-mouth`} />
          {/* hair */}
          <path
            d="M 292 304 C 284 262 286 222 302 194 C 320 160 358 138 404 136 C 452 134 492 154 508 192 C 520 222 518 262 510 304 L 498 304 C 498 276 494 254 486 240 C 470 234 456 228 446 216 C 420 228 384 234 352 228 C 334 238 316 254 308 272 L 304 304 Z"
            fill="url(#hairGrad)"
          />
          <path
            d={`M 298 220 C 290 170 326 118 386 104 C 442 92 500 112 518 158 C 526 180 524 204 512 220 C 500 194 476 180 448 178 C 456 168 454 158 446 150 C 428 168 392 180 358 182 C 334 188 312 200 298 220 Z`}
            fill="url(#hairGrad)"
            transform={`translate(${st.headTurn * 4} 0)`}
          />
          <path d="M 330 160 C 360 130 410 118 460 132" stroke={HAIR_HI} strokeWidth={6} fill="none" opacity={0.7} strokeLinecap="round" />
          <path d="M 352 178 C 380 160 420 150 452 152" stroke={HAIR_HI} strokeWidth={4} fill="none" opacity={0.5} strokeLinecap="round" />
          <path d="M 298 262 L 304 304 L 312 304 L 312 266 Z" fill={HAIR} />
          <path d="M 502 262 L 496 304 L 488 304 L 488 266 Z" fill={HAIR} />
        </g>

        {/* ---------------- arms (in front of torso) */}
        <Arm side="R" st={st.R} />
        <Arm side="L" st={st.L} />
      </g>
    </svg>
  );
};

export const neutralRig = (): RigState => ({
  R: {s: 9, e: -12, w: 0, hand: 'relaxed'},
  L: {s: -9, e: 12, w: 0, hand: 'relaxed'},
  headTilt: 0,
  headY: 0,
  headTurn: 0,
  gaze: {x: 0, y: 0},
  blink: 0,
  brow: 0,
  mouth: {open: 0, wide: 0.5, round: 0, smile: 0.5},
  bodyTilt: 0,
  breath: 0,
  cheek: 0,
});
