import React from 'react';
import type {LucideIcon} from 'lucide-react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, lerp, pop, ramp} from '../engine/timeline';
import {C, CONCEPT, ConceptKey, FONT, hexA} from '../theme';
import {Arrow} from './Arrow';
import {Module} from './Module';

// ------------------------------------------------------------------ VarBox
export type TypeTag = {at: number; label: string; tone: ConceptKey};

/** "A variable is a labelled box": name label on the front, value drops in, type tag on the corner. */
export const VarBox: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  tone: ConceptKey;
  name: string;
  nameAt: number;
  value: string;
  valueTone: ConceptKey;
  valueAt: number;
  types?: TypeTag[];
  appear: number;
  exit?: number;
  glow?: number;
}> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < p.appear) return null;
  const a = pop(frame, p.appear, fps, 12, 140);
  const out = p.exit !== undefined ? ramp(frame, p.exit, 12) : 0;
  if (out >= 1) return null;
  const tone = CONCEPT[p.tone];
  const vt = CONCEPT[p.valueTone];
  const k = p.w / 400;
  const rim = Math.round(p.h * 0.2);
  const chipFont = Math.round(46 * k);
  const drop = frame >= p.valueAt ? spring({frame: frame - p.valueAt, fps, config: {damping: 9, stiffness: 120, mass: 0.8}}) : 0;
  const chipY = lerp(-p.h * 0.95, rim - chipFont * 1.5 - 4 * k, drop);
  const namePop = pop(frame, p.nameAt, fps, 10, 170);
  let tag: TypeTag | undefined;
  let tagIdx = -1;
  (p.types ?? []).forEach((t, i) => {
    if (frame >= t.at) {
      tag = t;
      tagIdx = i;
    }
  });
  const tagPop = tag ? pop(frame, (tag as TypeTag).at, fps, 9, 190) : 0;
  const glow = p.glow ?? 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x - p.w / 2,
        top: p.y - p.h / 2,
        width: p.w,
        height: p.h,
        transform: `translateY(${(1 - a) * 40 + out * 20}px) scale(${(0.6 + 0.4 * a) * (1 - 0.15 * out)})`,
        opacity: Math.min(1, a * 1.6) * (1 - out),
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: p.w * 0.04,
          right: p.w * 0.04,
          top: 0,
          height: rim + 30,
          borderRadius: `${20 * k}px ${20 * k}px 0 0`,
          background: `linear-gradient(180deg, ${hexA(tone.deep, 0.95)}, #0E0C2A)`,
          border: `2.5px solid ${hexA(tone.main, 0.45)}`,
        }}
      />
      {drop > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: chipY,
            transform: 'translateX(-50%)',
            padding: `${8 * k}px ${26 * k}px`,
            borderRadius: 16 * k,
            background: vt.main,
            color: '#160F33',
            fontFamily: FONT.mono,
            fontWeight: 700,
            fontSize: chipFont,
            whiteSpace: 'nowrap',
            boxShadow: `0 0 26px ${hexA(vt.main, 0.6)}`,
          }}
        >
          {p.value}
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: rim,
          bottom: 0,
          borderRadius: 24 * k,
          background: `linear-gradient(180deg, ${hexA(tone.main, 0.3)}, ${hexA(tone.main, 0.1)}), ${C.inkRaised}`,
          border: `3px solid ${tone.main}`,
          boxShadow: `0 ${14 * k}px 0 ${tone.deep}, 0 0 ${20 + 60 * glow}px ${hexA(tone.main, 0.25 + 0.45 * glow)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {frame >= p.nameAt ? (
          <div
            style={{
              padding: `${8 * k}px ${24 * k}px`,
              borderRadius: 14 * k,
              background: C.paper,
              color: '#1B1B3F',
              fontFamily: FONT.mono,
              fontWeight: 700,
              fontSize: Math.round(40 * k),
              transform: `scale(${namePop}) rotate(-2deg)`,
              boxShadow: '0 6px 0 rgba(0,0,0,0.25)',
            }}
          >
            {p.name}
          </div>
        ) : null}
      </div>
      {tag ? (
        <div
          key={tagIdx}
          style={{
            position: 'absolute',
            left: 16 * k,
            top: rim + 14 * k,
            padding: `${6 * k}px ${18 * k}px`,
            borderRadius: 12 * k,
            background: CONCEPT[(tag as TypeTag).tone].main,
            color: '#160F33',
            fontFamily: FONT.mono,
            fontWeight: 700,
            fontSize: Math.round(34 * k),
            transform: `rotate(-8deg) scale(${tagPop})`,
            boxShadow: `0 0 20px ${hexA(CONCEPT[(tag as TypeTag).tone].main, 0.6)}`,
          }}
        >
          {(tag as TypeTag).label}
        </div>
      ) : null}
    </div>
  );
};

// ------------------------------------------------------------------ CodeAnatomy
export type AnatomyPart = {text: string; color: string; label?: string; tone?: ConceptKey; at?: number};

/** One line of code, big, with labelled brackets under its parts. */
export const CodeAnatomy: React.FC<{y: number; fontSize: number; parts: AnatomyPart[]; appear: number; exit?: number}> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < p.appear) return null;
  const a = pop(frame, p.appear, fps, 14, 140);
  const out = p.exit !== undefined ? ramp(frame, p.exit, 12) : 0;
  if (out >= 1) return null;
  const cw = p.fontSize * 0.6;
  const total = p.parts.reduce((n, x) => n + x.text.length, 0);
  const width = total * cw;
  const x0 = 540 - width / 2;
  let col = 0;
  const segs = p.parts.map((pt) => {
    const s = {...pt, x: x0 + col * cw, w: pt.text.length * cw};
    col += pt.text.length;
    return s;
  });
  const cardBottom = p.y + p.fontSize * 0.95;
  const by = cardBottom + 22;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: Math.min(1, a * 1.5) * (1 - out)}}>
      <div
        style={{
          position: 'absolute',
          left: x0 - 48,
          top: p.y - p.fontSize * 0.95,
          width: width + 96,
          height: p.fontSize * 1.9,
          borderRadius: 30,
          background: '#101030',
          border: '1.5px solid rgba(214,208,255,0.16)',
          boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
          transform: `scale(${0.9 + 0.1 * a})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x0,
          top: p.y - p.fontSize * 0.62,
          fontFamily: FONT.mono,
          fontSize: p.fontSize,
          fontWeight: 700,
          whiteSpace: 'pre',
          lineHeight: 1.2,
          fontVariantLigatures: 'none',
          fontFeatureSettings: '"liga" 0, "calt" 0',
        }}
      >
        {segs.map((s, i) => {
          const on = s.at !== undefined && frame >= s.at;
          return (
            <span key={i} style={{color: s.color, textShadow: on ? `0 0 26px ${hexA(CONCEPT[s.tone ?? 'neutral'].main, 0.85)}` : 'none'}}>
              {s.text}
            </span>
          );
        })}
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {segs.map((s, i) => {
          if (!s.label || s.at === undefined || frame < s.at) return null;
          const t = clamp01((frame - s.at) / 10);
          const d = `M ${s.x + 6} ${by} L ${s.x + 6} ${by + 24} L ${s.x + s.w - 6} ${by + 24} L ${s.x + s.w - 6} ${by}`;
          return (
            <path key={i} d={d} fill="none" stroke={CONCEPT[s.tone ?? 'neutral'].main} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} />
          );
        })}
      </svg>
      {segs.map((s, i) => {
        if (!s.label || s.at === undefined || frame < s.at) return null;
        const lp = pop(frame, s.at + 4, fps, 10, 170);
        return (
          <div
            key={`l${i}`}
            style={{
              position: 'absolute',
              left: s.x + s.w / 2 - 150,
              width: 300,
              top: by + 44,
              textAlign: 'center',
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: 46,
              color: CONCEPT[s.tone ?? 'neutral'].main,
              transform: `scale(${lp})`,
            }}
          >
            {s.label}
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ Decision
export type Branch = {label: string; Icon?: LucideIcon; tone: ConceptKey; at: number; x: number; y: number; w?: number; h?: number; tag: string; glow?: number};

/** Decision diamond with a "yes" branch and an "else" branch. */
export const Decision: React.FC<{x: number; y: number; size: number; question: string; mono?: boolean; at: number; exit?: number; yes: Branch; no: Branch; pulse?: number}> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < p.at) return null;
  const a = pop(frame, p.at, fps, 11, 150);
  const out = p.exit !== undefined ? ramp(frame, p.exit, 12) : 0;
  if (out >= 1) return null;
  const d = p.size * 0.7071;
  const pulse = p.pulse ?? 0;
  const amber = CONCEPT.api;
  const branch = (b: Branch, side: -1 | 1) => {
    const bh = b.h ?? 140;
    const tp = pop(frame, b.at + 2, fps, 10, 170);
    return (
      <React.Fragment key={side}>
        <Arrow pts={[[p.x + side * (d + 6), p.y], [b.x, p.y], [b.x, b.y - bh / 2 - 18]]} at={b.at} dur={12} exit={p.exit} color={CONCEPT[b.tone].main} />
        {frame >= b.at ? (
          <div
            style={{
              position: 'absolute',
              left: (p.x + side * d + b.x) / 2 - 100,
              width: 200,
              top: p.y - 66,
              textAlign: 'center',
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: 36,
              color: CONCEPT[b.tone].main,
              transform: `scale(${tp})`,
              opacity: 1 - out,
            }}
          >
            {b.tag}
          </div>
        ) : null}
        <Module x={b.x} y={b.y} w={b.w ?? 380} h={bh} tone={b.tone} label={b.label} Icon={b.Icon} appear={b.at + 8} exit={p.exit} glow={b.glow} />
      </React.Fragment>
    );
  };
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: p.x - p.size / 2,
          top: p.y - p.size / 2,
          width: p.size,
          height: p.size,
          borderRadius: 30,
          transform: `rotate(45deg) scale(${a * (1 - 0.15 * out) * (1 + 0.05 * pulse)})`,
          background: `linear-gradient(135deg, ${hexA(amber.main, 0.28)}, ${hexA(amber.main, 0.08)}), ${C.inkRaised}`,
          border: `3.5px solid ${amber.main}`,
          boxShadow: `0 0 ${24 + 50 * pulse}px ${hexA(amber.main, 0.35 + 0.4 * pulse)}`,
          opacity: Math.min(1, a * 1.6) * (1 - out),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: p.x - 200,
          width: 400,
          top: p.y - 30,
          textAlign: 'center',
          fontFamily: p.mono ? FONT.mono : FONT.display,
          fontWeight: 700,
          fontSize: p.mono ? 38 : 46,
          color: C.paper,
          opacity: Math.min(1, a * 1.6) * (1 - out),
          transform: `scale(${a})`,
          whiteSpace: 'nowrap',
          fontVariantLigatures: 'none',
          fontFeatureSettings: '"liga" 0, "calt" 0',
        }}
      >
        {p.question}
      </div>
      {branch(p.yes, -1)}
      {branch(p.no, 1)}
    </>
  );
};
