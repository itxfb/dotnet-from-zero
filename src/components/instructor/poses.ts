import {ArmState} from './Rig';

/**
 * Named body poses. Angles are SVG degrees: for the character's right arm (R,
 * viewer's left) positive `s` swings the arm outward; for the left arm (L)
 * negative `s` swings it outward. `f` foreshortens the forearm (pointing at
 * the camera), `beat` scales how much the hands bounce on stressed syllables.
 */
export type Pose = {R: ArmState; L: ArmState; beat?: number; wave?: 'R' | 'L'; brow?: number; tilt?: number};

const restR: ArmState = {s: 9, e: -12, w: 0, hand: 'relaxed'};
const restL: ArmState = {s: -9, e: 12, w: 0, hand: 'relaxed'};

export const POSES = {
  rest: {R: restR, L: restL, beat: 0.2},
  explain: {
    R: {s: 16, e: -134, f: 0.62, w: -16, hand: 'open'},
    L: {s: -16, e: 134, f: 0.62, w: 16, hand: 'open'},
    beat: 1,
  },
  explainR: {R: {s: 14, e: -128, f: 0.6, w: -18, hand: 'open'}, L: restL, beat: 0.8},
  openToViewer: {R: {s: 12, e: -118, f: 0.55, w: -28, hand: 'open'}, L: restL, beat: 0.7},
  shrug: {
    R: {s: 24, e: 76, f: 0.42, w: 8, hand: 'open'},
    L: {s: -24, e: -76, f: 0.42, w: -8, hand: 'open'},
    beat: 0.3,
    brow: 1,
    tilt: -4,
  },
  wave: {R: {s: 62, e: 108, w: -6, hand: 'palm'}, L: restL, wave: 'R', beat: 0},
  calm: {
    R: {s: 20, e: -112, f: 0.58, w: 18, hand: 'open'},
    L: {s: -20, e: 112, f: 0.58, w: -18, hand: 'open'},
    beat: 0.5,
  },
  presentRight: {R: restR, L: {s: -50, e: -66, f: 0.85, w: 12, hand: 'open'}, beat: 0.4},
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;
