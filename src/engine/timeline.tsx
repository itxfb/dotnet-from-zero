import React, {createContext, useContext} from 'react';
import {Easing, interpolate, spring} from 'remotion';

// ----------------------------------------------------------------- types
export type Word = {text: string; from: number; to: number; kw: string | null};
export type Line = {
  id: string;
  scene: string;
  from: number;
  to: number;
  text: string;
  caption: boolean;
  words: Word[];
};
export type SceneSpan = {id: string; from: number; to: number};
export type Timeline = {
  lessonId: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  engine: string;
  meta: {series: string; day: number; title: string; next?: {day: number; title: string} | null};
  audio: {narration: string; music: string | null};
  scenes: SceneSpan[];
  lines: Line[];
  cues: Record<string, number>;
  visemes: string;
  amp: number[];
  beats: number[];
};

/** A cue reference: a frame number, or a cue name with optional offset ("web", "line:apps:end-10"). */
export type CueRef = number | string;

// ----------------------------------------------------------------- context
const TimelineContext = createContext<Timeline | null>(null);

export const TimelineProvider: React.FC<{timeline: Timeline; children: React.ReactNode}> = ({
  timeline,
  children,
}) => <TimelineContext.Provider value={timeline}>{children}</TimelineContext.Provider>;

export const useTimeline = (): Timeline => {
  const t = useContext(TimelineContext);
  if (!t) throw new Error('useTimeline() must be used inside <TimelineProvider>');
  return t;
};

export const resolveCue = (t: Timeline, ref: CueRef): number => {
  if (typeof ref === 'number') return ref;
  const m = ref.match(/^(.*?)([+-]\d+)?$/);
  const name = m ? m[1] : ref;
  const offset = m && m[2] ? parseInt(m[2], 10) : 0;
  const base = t.cues[name];
  if (base === undefined) {
    throw new Error(`Unknown cue "${name}". Available: ${Object.keys(t.cues).join(', ')}`);
  }
  return base + offset;
};

export const useCue = (ref: CueRef): number => resolveCue(useTimeline(), ref);

export const useScene = (id: string): SceneSpan => {
  const s = useTimeline().scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene "${id}"`);
  return s;
};

// ----------------------------------------------------------------- animation helpers
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 over [start, start+dur] with easing, clamped. */
export const ramp = (frame: number, start: number, dur: number, easing = easeOut) =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Bouncy 0→1 spring that starts at `start`. */
export const pop = (frame: number, start: number, fps: number, damping = 12, stiffness = 170, mass = 0.7) =>
  frame < start ? 0 : spring({frame: frame - start, fps, config: {damping, stiffness, mass}});

/** Smooth (no overshoot) spring. */
export const glide = (frame: number, start: number, fps: number, stiffness = 90) =>
  frame < start ? 0 : spring({frame: frame - start, fps, config: {damping: 200, stiffness, mass: 1}});

/** Visible window: fades in at `from`, out at `to`. */
export const windowed = (frame: number, from: number, to: number, fadeIn = 8, fadeOut = 8) =>
  Math.min(ramp(frame, from, fadeIn), 1 - ramp(frame, to - fadeOut, fadeOut, Easing.in(Easing.quad)));

/** Exponentially decaying pulses at the narration's stressed syllables. */
export const beatPulse = (frame: number, beats: number[], decay = 4.5) => {
  let v = 0;
  for (let i = beats.length - 1; i >= 0; i--) {
    const d = frame - beats[i];
    if (d < 0) continue;
    if (d > 20) break;
    v += Math.exp(-d / decay) * (d < 2 ? d / 2 : 1);
  }
  return Math.min(1, v);
};

export const getScene = (t: Timeline, id: string): SceneSpan => {
  const s = t.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene "${id}"`);
  return s;
};
