import React from 'react';
import {random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {beatPulse, clamp01, CueRef, lerp, resolveCue, useTimeline, windowed} from '../../engine/timeline';
import {ArmState, MouthState, RIG, Rig, RigState} from './Rig';
import {Pose, PoseName, POSES} from './poses';

/** A gesture is a named pose, or "point at this screen position". */
export type PoseSpec = PoseName | {point: [number, number]; arm?: 'L' | 'R'; base?: PoseName};
export type GestureKey = {at: CueRef; pose: PoseSpec};
export type LookKey = {at: CueRef; target: 'viewer' | [number, number]};
export type ValueKey = {at: CueRef; v: number};
export type BrowKey = {at: CueRef; v: number; hold?: number};

export type Direction = {
  gestures: GestureKey[];
  looks?: LookKey[];
  smile?: ValueKey[];
  brows?: BrowKey[];
};

type Layout = {x: number; y: number; s: number};
type CamXf = {tx: number; ty: number; sc: number};

// open, wide, round for each viseme class (see tools/audiolib/lipsync.py)
const VIS: Record<string, [number, number, number]> = {
  X: [0, 0.5, 0],
  M: [0, 0.42, 0.1],
  F: [0.13, 0.55, 0],
  C: [0.3, 0.55, 0],
  E: [0.52, 0.62, 0],
  A: [0.86, 0.55, 0],
  I: [0.34, 0.9, 0],
  O: [0.6, 0.3, 0.75],
  U: [0.3, 0.15, 1],
};

const wrapNear = (target: number, current: number) => {
  let t = target;
  while (t - current > 180) t -= 360;
  while (t - current < -180) t += 360;
  return t;
};

const lerpArm = (a: ArmState, b: ArmState, t: number): ArmState => ({
  s: lerp(a.s, wrapNear(b.s, a.s), t),
  e: lerp(a.e, wrapNear(b.e, a.e), t),
  w: lerp(a.w, wrapNear(b.w, a.w), t),
  f: lerp(a.f ?? 1, b.f ?? 1, t),
  hand: t > 0.42 ? b.hand : a.hand,
});

const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  R: lerpArm(a.R, b.R, t),
  L: lerpArm(a.L, b.L, t),
  beat: lerp(a.beat ?? 0.3, b.beat ?? 0.3, t),
  brow: lerp(a.brow ?? 0, b.brow ?? 0, t),
  tilt: lerp(a.tilt ?? 0, b.tilt ?? 0, t),
  wave: t > 0.5 ? b.wave : a.wave,
});

/** Aim one arm at a point (camera space): elbow out to the side, forearm + index finger on the target. */
const pointArm = (arm: 'L' | 'R', target: [number, number], layout: Layout): ArmState => {
  const sh = arm === 'L' ? RIG.shoulderL : RIG.shoulderR;
  const Sx = layout.x + (sh.x - 400) * layout.s;
  const Sy = layout.y - (1000 - sh.y) * layout.s;
  const k = clamp01((Sy - target[1]) / 1100);
  const s = (arm === 'L' ? -1 : 1) * (38 + 34 * k);
  const rad = (s * Math.PI) / 180;
  const Ex = Sx - RIG.upper * layout.s * Math.sin(rad);
  const Ey = Sy + RIG.upper * layout.s * Math.cos(rad);
  const world = (Math.atan2(-(target[0] - Ex), target[1] - Ey) * 180) / Math.PI;
  let e = world - s;
  while (e > 180) e -= 360;
  while (e < -180) e += 360;
  return {s, e, w: 0, f: 1, hand: 'point'};
};

const blinkAmount = (frame: number) => {
  let start = 22;
  let i = 0;
  for (;;) {
    const next = start + 78 + Math.floor(random(`blink-${i}`) * 72);
    if (frame < next) break;
    start = next;
    i++;
  }
  const d = frame - start;
  const double = random(`dbl-${i}`) > 0.8 ? 9 : -100;
  const one = (x: number) => (x < 0 ? 0 : x < 3 ? x / 3 : x < 4 ? 1 : x < 7 ? 1 - (x - 3) / 4 : 0);
  return Math.max(one(d), one(d - double));
};

const valueAt = (frame: number, keys: {at: number; v: number}[], fallback: number, fps: number) => {
  if (!keys.length) return fallback;
  let v = keys[0].v;
  for (let i = 1; i < keys.length; i++) {
    if (frame < keys[i].at) break;
    v = lerp(v, keys[i].v, spring({frame: frame - keys[i].at, fps, config: {damping: 200, stiffness: 80}}));
  }
  return v;
};

export const Instructor: React.FC<{direction: Direction; layout: Layout; cam: CamXf}> = ({direction, layout, cam}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tl = useTimeline();
  const t = frame / fps;
  const toCam = (p: [number, number]): [number, number] => [(p[0] - cam.tx) / cam.sc, (p[1] - cam.ty) / cam.sc];

  const resolvePose = (spec: PoseSpec): Pose => {
    if (typeof spec === 'string') return POSES[spec] as Pose;
    const base = POSES[spec.base ?? 'rest'] as Pose;
    const arm = spec.arm ?? 'L';
    return {...base, [arm]: pointArm(arm, toCam(spec.point), layout), beat: 0.2, wave: undefined};
  };

  // ---------------------------------------------------------- body pose
  const keys = direction.gestures
    .map((g) => ({at: resolveCue(tl, g.at), spec: g.pose}))
    .sort((a, b) => a.at - b.at);
  let pose: Pose = resolvePose(keys[0].spec);
  let active = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (frame < k.at) break;
    const p = spring({frame: frame - k.at, fps, config: {damping: 15, stiffness: 115, mass: 0.85}});
    pose = lerpPose(pose, resolvePose(k.spec), p);
    active = k;
  }

  const bp = beatPulse(frame, tl.beats);
  let beatIdx = 0;
  for (let i = 0; i < tl.beats.length && tl.beats[i] <= frame; i++) beatIdx = i;
  const beatAmt = pose.beat ?? 0.3;
  const R = {...pose.R};
  const L = {...pose.L};
  R.s += 1.3 * Math.sin(t * 1.25 + 0.3);
  R.e += 2.2 * Math.sin(t * 1.6 + 1.1) - beatAmt * 7 * bp;
  L.s += 1.3 * Math.sin(t * 1.18 + 2.1);
  L.e += 2.2 * Math.sin(t * 1.5 + 0.4) + beatAmt * 7 * bp;
  if (pose.wave && typeof active.spec === 'string' && POSES[active.spec as PoseName] && (POSES[active.spec as PoseName] as Pose).wave) {
    const since = frame - active.at;
    const env = clamp01((since - 5) / 6) * (1 - clamp01((since - 52) / 10));
    const arm = pose.wave === 'R' ? R : L;
    arm.w += env * 17 * Math.sin((since * 2 * Math.PI * 2.3) / fps);
  }

  // ---------------------------------------------------------- gaze
  const autoLooks: {at: number; target: 'viewer' | [number, number]}[] = [];
  keys.forEach((k, i) => {
    if (typeof k.spec === 'string') return;
    autoLooks.push({at: k.at, target: k.spec.point});
    const next = keys[i + 1];
    if (!next || next.at > k.at + 30) autoLooks.push({at: k.at + 30, target: 'viewer'});
  });
  const explicit = (direction.looks ?? []).map((l) => ({at: resolveCue(tl, l.at), target: l.target}));
  const looks = [{at: 0, target: 'viewer' as const}, ...autoLooks, ...explicit].sort((a, b) => a.at - b.at);
  const headX = layout.x;
  const headY = layout.y - 700 * layout.s;
  const gazeOf = (target: 'viewer' | [number, number]) => {
    if (target === 'viewer') return {x: 0, y: 0};
    const [tx, ty] = toCam(target);
    return {x: Math.max(-1, Math.min(1, (tx - headX) / 420)), y: Math.max(-1, Math.min(1, (ty - headY) / 600))};
  };
  let gaze = gazeOf(looks[0].target);
  for (let i = 1; i < looks.length; i++) {
    if (frame < looks[i].at) break;
    const p = spring({frame: frame - looks[i].at, fps, config: {damping: 20, stiffness: 160}});
    const g = gazeOf(looks[i].target);
    gaze = {x: lerp(gaze.x, g.x, p), y: lerp(gaze.y, g.y, p)};
  }
  const sacc = Math.floor(frame / 37);
  gaze = {
    x: gaze.x + (random(`sx${sacc}`) - 0.5) * 0.14,
    y: gaze.y + (random(`sy${sacc}`) - 0.5) * 0.1,
  };

  // ---------------------------------------------------------- face
  const vis = (f: number) => VIS[tl.visemes[f] ?? 'X'] ?? VIS.X;
  const a = vis(frame - 1);
  const b = vis(frame);
  const c = vis(frame + 1);
  const amp = tl.amp[frame] ?? 0;
  const speaking = (tl.visemes[frame] ?? 'X') !== 'X';
  const smileKeys = (direction.smile ?? []).map((k) => ({at: resolveCue(tl, k.at), v: k.v})).sort((x, y) => x.at - y.at);
  let smile = valueAt(frame, smileKeys, 0.5, fps);
  let open = (0.25 * a[0] + 0.5 * b[0] + 0.25 * c[0]) * (0.55 + 0.65 * amp);
  if (speaking) smile *= 0.8;
  if (!speaking && smile > 0.85) open = Math.max(open, 0.24 * clamp01((smile - 0.85) / 0.15));
  const mouth: MouthState = {
    open,
    wide: 0.25 * a[1] + 0.5 * b[1] + 0.25 * c[1],
    round: 0.25 * a[2] + 0.5 * b[2] + 0.25 * c[2],
    smile,
  };
  const brows = (direction.brows ?? []).reduce((acc, k) => {
    const at = resolveCue(tl, k.at);
    return acc + k.v * windowed(frame, at, at + (k.hold ?? 30), 6, 10);
  }, 0);

  const st: RigState = {
    R,
    L,
    headTilt: (pose.tilt ?? 0) + 1.5 * Math.sin(t * 0.7) + (beatIdx % 2 ? 1.6 : -1.6) * bp - gaze.x * 2,
    headY: 2.6 * bp + 1.2 * Math.sin(t * 1.1) + gaze.y * 3,
    headTurn: gaze.x * 0.6,
    gaze,
    blink: blinkAmount(frame),
    brow: Math.min(1, (pose.brow ?? 0) * 0.8 + brows + 0.22 * bp - Math.max(0, gaze.y) * 0.2),
    mouth,
    bodyTilt: 0.8 * Math.sin(t * 0.45) + gaze.x * 0.8,
    breath: 0.5 + 0.5 * Math.sin((t * 2 * Math.PI) / 3.8),
    cheek: clamp01((smile - 0.62) * 2.6),
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: layout.x - 400 * layout.s,
        top: layout.y - 1000 * layout.s,
        width: 800,
        height: 1000,
        transform: `scale(${layout.s})`,
        transformOrigin: '0 0',
      }}
    >
      <Rig st={st} />
    </div>
  );
};
