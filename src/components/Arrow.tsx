import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeInOut, ramp} from '../engine/timeline';
import {hexA} from '../theme';

type Pt = [number, number];

/** Polyline arrow that draws itself (head rides the tip), then shows a flowing pulse. */
export const Arrow: React.FC<{pts: Pt[]; at: number; dur?: number; exit?: number; color?: string; width?: number; head?: boolean; flow?: boolean}> = ({
  pts,
  at,
  dur = 14,
  exit,
  color = '#C9C4F2',
  width = 7,
  head = true,
  flow = true,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const out = exit !== undefined ? ramp(frame, exit, 10) : 0;
  if (out >= 1) return null;
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  const drawn = ramp(frame, at, dur, easeInOut) * total;
  const shown: Pt[] = [pts[0]];
  let acc = 0;
  let tip: Pt = pts[0];
  let ang = 0;
  for (let i = 0; i < segs.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
    if (acc + segs[i] >= drawn) {
      const t = segs[i] ? (drawn - acc) / segs[i] : 0;
      tip = [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
      shown.push(tip);
      break;
    }
    acc += segs[i];
    shown.push(pts[i + 1]);
    tip = pts[i + 1];
  }
  const pointAt = (d: number): Pt => {
    let a2 = 0;
    for (let i = 0; i < segs.length; i++) {
      if (a2 + segs[i] >= d) {
        const t = (d - a2) / segs[i];
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t];
      }
      a2 += segs[i];
    }
    return pts[pts.length - 1];
  };
  const done = frame - at - dur;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 1 - out, overflow: 'visible'}}>
      <polyline
        points={shown.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
      {head && drawn > 4 ? (
        <path d="M 6 0 L -16 -13 L -16 13 Z" fill={color} transform={`translate(${tip[0]} ${tip[1]}) rotate(${ang})`} />
      ) : null}
      {flow && done > 0
        ? [0, 0.5].map((o) => {
            const d = ((done * 9 + o * total) % Math.max(1, total - 20)) + 4;
            const [x, y] = pointAt(d);
            return <circle key={o} cx={x} cy={y} r={width * 0.9} fill="#FFFFFF" opacity={0.9} style={{filter: `drop-shadow(0 0 8px ${hexA('#FFFFFF', 0.9)})`}} />;
          })
        : null}
    </svg>
  );
};
