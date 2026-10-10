import React, {createContext, useContext} from 'react';
import {Html5Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CueRef, easeInOut, lerp, ramp, resolveCue, useTimeline} from './timeline';

// ------------------------------------------------------------------ camera shots
/**
 * A shot = where the camera puts the instructor + how the screen is laid out.
 * x/y: instructor anchor (bottom centre) in camera space, s: scale,
 * pip: 0 full-screen camera .. 1 picture-in-picture card, dim: diagram backdrop,
 * captionY: caption centre line, badge: 0 hidden, 1 compact, 2 large.
 */
export type Shot = {x: number; y: number; s: number; pip: number; dim: number; captionY: number; badge: number};

export const SHOTS = {
  hero: {x: 540, y: 1925, s: 1.32, pip: 0, dim: 0.35, captionY: 668, badge: 2},
  teach: {x: 300, y: 2005, s: 0.9, pip: 0, dim: 1, captionY: 1140, badge: 1},
  code: {x: 540, y: 1990, s: 1.0, pip: 1, dim: 0, captionY: 1200, badge: 1},
  outro: {x: 540, y: 1925, s: 1.32, pip: 0, dim: 0.35, captionY: 668, badge: 0},
} satisfies Record<string, Shot>;

export type ShotName = keyof typeof SHOTS;
export type ShotKey = {at: CueRef; shot: ShotName | Shot; dur?: number};

/** Picture-in-picture card on screen, and the camera-space crop shown inside it. */
export const PIP = {
  card: {x: 56, y: 1290, w: 380, h: 440, r: 36},
  crop: {x: 220, y: 1000, w: 640},
};

const mixShot = (a: Shot, b: Shot, t: number): Shot => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  s: lerp(a.s, b.s, t),
  pip: lerp(a.pip, b.pip, t),
  dim: lerp(a.dim, b.dim, t),
  captionY: lerp(a.captionY, b.captionY, t),
  badge: lerp(a.badge, b.badge, t),
});

const ShotContext = createContext<Shot>(SHOTS.hero);
export const useShot = () => useContext(ShotContext);

export const ShotProvider: React.FC<{keys: ShotKey[]; children: React.ReactNode}> = ({keys, children}) => {
  const frame = useCurrentFrame();
  const tl = useTimeline();
  const ks = keys
    .map((k) => ({at: resolveCue(tl, k.at), shot: typeof k.shot === 'string' ? SHOTS[k.shot] : k.shot, dur: k.dur ?? 24}))
    .sort((a, b) => a.at - b.at);
  let cur: Shot = {...ks[0].shot};
  for (let i = 1; i < ks.length; i++) {
    const k = ks[i];
    if (frame < k.at) break;
    cur = mixShot(cur, k.shot, ramp(frame, k.at, k.dur, easeInOut));
  }
  return <ShotContext.Provider value={cur}>{children}</ShotContext.Provider>;
};

/** Camera-space -> screen-space transform for the current shot (identity unless in PiP). */
export const cameraTransform = (shot: Shot) => {
  const k = PIP.card.w / PIP.crop.w;
  return {
    sc: lerp(1, k, shot.pip),
    tx: lerp(0, PIP.card.x - PIP.crop.x * k, shot.pip),
    ty: lerp(0, PIP.card.y - PIP.crop.y * k, shot.pip),
  };
};

// ------------------------------------------------------------------ keyframe tracks
export type Key = {at: number; [prop: string]: number};

/**
 * Springy keyframe interpolation. Each key may set any subset of props;
 * missing props inherit from the previous key.
 */
export const track = (frame: number, fps: number, keys: Key[], stiffness = 120, damping = 17) => {
  const filled: Key[] = [];
  let prev: Key = {...keys[0]};
  for (const k of keys) {
    prev = {...prev, ...k};
    filled.push(prev);
  }
  const out: Record<string, number> = {...filled[0]};
  for (let i = 1; i < filled.length; i++) {
    const k = filled[i];
    if (frame < k.at) break;
    const p = spring({frame: frame - k.at, fps, config: {damping, stiffness, mass: 0.9}});
    for (const name of Object.keys(k)) {
      if (name === 'at') continue;
      out[name] += (k[name] - filled[i - 1][name]) * p;
    }
  }
  return out;
};

// ------------------------------------------------------------------ helpers
export const Sfx: React.FC<{at: number; name: string; volume?: number}> = ({at, name, volume = 0.3}) => {
  const {fps} = useVideoConfig();
  if (!Number.isFinite(at) || at < 0) return null;
  return (
    <Sequence from={Math.round(at)} durationInFrames={Math.round(fps * 1.6)} layout="none">
      <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  );
};

/** Renders children only inside [from, to) - keeps per-frame work low. */
export const Within: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <>{children}</> : null;
};
