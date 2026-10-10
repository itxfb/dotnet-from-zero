import React from 'react';
import {Play} from 'lucide-react';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {track} from '../engine/direction';
import {glide, pop, ramp, windowed} from '../engine/timeline';
import {C, CONCEPT, FONT, hexA} from '../theme';

export type Tok = {t: string; c: string};
export const SYN = {type: '#56CFF5', method: '#FFD27A', string: '#FF9EB5', punct: '#C9C4F2', comment: '#7C83B8'};
export type Completion = {after: number; len: number; pause: number; items: string[]};
export type Highlight = {at: number; from: number; to: number; label: string};

/** Frame at which each character appears (human-ish rhythm, autocomplete inserts a word at once). */
export const typingSchedule = (text: string, start: number, completion?: Completion) => {
  const frames: number[] = [];
  let f = start;
  for (let i = 0; i < text.length; i++) {
    if (completion && i >= completion.after && i < completion.after + completion.len) {
      if (i === completion.after) f += completion.pause;
      frames.push(Math.round(f));
      continue;
    }
    f += 1.5 + random(`type-${i}`) * 1.5;
    frames.push(Math.round(f));
  }
  return frames;
};

const FS = 40;
const CW = FS * 0.6; // JetBrains Mono advance width
const LH = 66;
const TITLE = 78;
const GUT = 92;
const PADX = 26;

export const CodeEditor: React.FC<{
  rect: {x: number; y: number; w: number; h: number};
  enter: number;
  exit: number;
  filename: string;
  comment?: string;
  tokens: Tok[];
  typeStart: number;
  completion?: Completion;
  highlights: Highlight[];
  highlightEnd: number;
  runAt: number;
  command: string;
  output: string;
}> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < p.enter) return null;
  const a = glide(frame, p.enter, fps, 110);
  const out = ramp(frame, p.exit, 12);
  if (out >= 1) return null;

  const text = p.tokens.map((t) => t.t).join('');
  const sched = typingSchedule(text, p.typeStart, p.completion);
  const n = sched.filter((f) => f <= frame).length;
  const typing = frame >= p.typeStart && frame <= sched[sched.length - 1] + 4;
  const codeX = GUT + PADX;
  const rowTop = (i: number) => TITLE + 34 + i * LH;
  const row = p.comment ? 1 : 0;

  // coloured, partially-typed tokens
  let left = n;
  const spans = p.tokens.map((tk, i) => {
    const part = tk.t.slice(0, Math.max(0, left));
    left -= tk.t.length;
    return part ? (
      <span key={i} style={{color: tk.c}}>
        {part}
      </span>
    ) : null;
  });
  const caretOn = typing || Math.floor(frame / 15) % 2 === 0;

  // autocomplete popup
  const c = p.completion;
  const popupOn = c && frame > sched[c.after - 1] && frame < sched[c.after];

  // highlight box glides from token to token
  const hk = p.highlights.map((h) => ({at: h.at, x: codeX + h.from * CW - 9, w: (h.to - h.from) * CW + 18}));
  const hb = hk.length ? track(frame, fps, hk, 170, 20) : {x: 0, w: 0};
  const hOpacity = hk.length ? windowed(frame, hk[0].at, p.highlightEnd, 5, 8) : 0;
  let hIdx = 0;
  p.highlights.forEach((h, i) => {
    if (frame >= h.at) hIdx = i;
  });
  const label = p.highlights[hIdx]?.label ?? '';
  const labelIn = p.highlights.length ? ramp(frame, p.highlights[hIdx].at, 6) : 0;

  // run + terminal
  const press = frame >= p.runAt ? Math.sin(Math.min(1, (frame - p.runAt) / 8) * Math.PI) : 0;
  const term = glide(frame, p.runAt + 2, fps, 140);
  const termH = 236 * term;
  const outPop = pop(frame, p.runAt + 14, fps, 10, 160);

  return (
    <div
      style={{
        position: 'absolute',
        left: p.rect.x,
        top: p.rect.y,
        width: p.rect.w,
        height: p.rect.h,
        transform: `translateY(${(1 - a) * 90 + out * 40}px) scale(${0.96 + 0.04 * a})`,
        opacity: Math.min(1, a * 1.4) * (1 - out),
        borderRadius: 28,
        background: '#101030',
        border: '1.5px solid rgba(214,208,255,0.16)',
        boxShadow: '0 40px 90px rgba(0,0,0,0.55)',
        overflow: 'hidden',
        fontFamily: FONT.mono,
      }}
    >
      {/* title bar */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: TITLE, background: '#0B0B24', borderBottom: '1.5px solid rgba(214,208,255,0.1)'}}>
        {['#FF6B81', '#FFC857', '#3FE0A0'].map((col, i) => (
          <div key={col} style={{position: 'absolute', left: 30 + i * 30, top: 31, width: 16, height: 16, borderRadius: 8, background: col, opacity: 0.85}} />
        ))}
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: 14,
            height: TITLE - 14,
            padding: '0 26px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#101030',
            borderRadius: '14px 14px 0 0',
            borderBottom: `3px solid ${CONCEPT.dotnet.main}`,
            color: C.paper,
            fontSize: 28,
          }}
        >
          <span style={{color: CONCEPT.csharp.main, fontWeight: 700, fontSize: 24}}>C#</span>
          {p.filename}
        </div>
        <div
          style={{
            position: 'absolute',
            right: 22,
            top: 14,
            height: 50,
            padding: '0 22px 0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 14,
            background: hexA(CONCEPT.csharp.main, 0.16 + 0.5 * press),
            border: `2px solid ${hexA(CONCEPT.csharp.main, 0.7)}`,
            color: CONCEPT.csharp.main,
            fontFamily: FONT.display,
            fontWeight: 600,
            fontSize: 26,
            transform: `scale(${1 - 0.08 * press})`,
          }}
        >
          <Play size={24} color={CONCEPT.csharp.main} fill={CONCEPT.csharp.main} />
          Run
        </div>
      </div>

      {/* gutter + current line band */}
      <div style={{position: 'absolute', left: 0, top: TITLE, bottom: 0, width: GUT, background: '#0D0D2A'}} />
      <div style={{position: 'absolute', left: GUT, right: 0, top: rowTop(row) - 2, height: LH, background: hexA(CONCEPT.dotnet.main, 0.08)}} />
      {Array.from({length: 7}, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            width: GUT - 18,
            top: rowTop(i) + 10,
            textAlign: 'right',
            fontSize: 28,
            color: i === row ? C.muted : 'rgba(169,165,214,0.38)',
          }}
        >
          {i + 1}
        </div>
      ))}
      {p.comment ? (
        <div style={{position: 'absolute', left: codeX, top: rowTop(0) + 6, fontSize: FS, color: SYN.comment, whiteSpace: 'pre'}}>{p.comment}</div>
      ) : null}

      {/* highlight */}
      <div
        style={{
          position: 'absolute',
          left: hb.x,
          width: hb.w,
          top: rowTop(row) - 4,
          height: LH,
          borderRadius: 14,
          border: `3px solid ${CONCEPT.api.main}`,
          background: hexA(CONCEPT.api.main, 0.12),
          boxShadow: `0 0 26px ${hexA(CONCEPT.api.main, 0.45)}`,
          opacity: hOpacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: hb.x,
          top: rowTop(row) + LH + 12,
          padding: '8px 18px',
          borderRadius: 12,
          background: CONCEPT.api.main,
          color: '#2A1600',
          fontFamily: FONT.display,
          fontWeight: 600,
          fontSize: 28,
          whiteSpace: 'nowrap',
          opacity: hOpacity * labelIn,
          transform: `translateY(${(1 - labelIn) * 8}px)`,
        }}
      >
        {label}
      </div>

      {/* typed code */}
      <div style={{position: 'absolute', left: codeX, top: rowTop(row) + 6, fontSize: FS, whiteSpace: 'pre', color: C.paper}}>
        {spans}
        <span
          style={{
            display: 'inline-block',
            width: 4,
            height: FS * 1.1,
            marginLeft: 2,
            verticalAlign: 'text-bottom',
            background: CONCEPT.dotnet.main,
            opacity: frame >= p.typeStart - 20 && caretOn && frame < p.runAt ? 1 : 0,
          }}
        />
      </div>

      {/* autocomplete */}
      {popupOn && c ? (
        <div
          style={{
            position: 'absolute',
            left: codeX + c.after * CW - 6,
            top: rowTop(row) + LH + 4,
            width: 330,
            borderRadius: 14,
            background: '#1A1A44',
            border: '1.5px solid rgba(214,208,255,0.22)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          {c.items.map((it, i) => (
            <div
              key={it}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '10px 16px',
                fontSize: 30,
                color: i === 0 ? C.paper : C.muted,
                background: i === 0 ? hexA(CONCEPT.dotnet.main, 0.35) : 'transparent',
              }}
            >
              <span style={{width: 16, height: 16, borderRadius: 4, background: SYN.method, opacity: 0.85}} />
              {it}
            </div>
          ))}
        </div>
      ) : null}

      {/* terminal */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: termH,
          background: '#08081C',
          borderTop: `2px solid ${hexA(CONCEPT.csharp.main, 0.35)}`,
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', left: 34, top: 26, fontFamily: FONT.display, fontSize: 24, color: C.muted, opacity: 0.8}}>Terminal</div>
        <div style={{position: 'absolute', left: 34, top: 74, fontSize: 32, color: C.muted, opacity: ramp(frame, p.runAt + 4, 4)}}>
          <span style={{color: CONCEPT.csharp.main}}>{'> '}</span>
          {p.command}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 34,
            top: 132,
            fontSize: 46,
            fontWeight: 700,
            color: C.paper,
            opacity: Math.min(1, outPop * 1.5),
            transform: `scale(${0.8 + 0.2 * outPop})`,
            transformOrigin: '0 50%',
            textShadow: `0 0 24px ${hexA(CONCEPT.csharp.main, 0.75)}`,
          }}
        >
          {p.output}
        </div>
      </div>
    </div>
  );
};
