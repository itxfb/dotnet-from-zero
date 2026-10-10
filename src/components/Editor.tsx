import React from 'react';
import {Play} from 'lucide-react';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {glide, pop, ramp, windowed} from '../engine/timeline';
import {C, CONCEPT, ConceptKey, FONT, hexA} from '../theme';
import type {Tok} from './CodeEditor';

/**
 * Multi-line code editor for lessons (Day 2+): line-by-line typing, highlight
 * boxes (inline, column or whole blocks) with labels, in-place edits,
 * repeated runs with terminal output, and execution focus (dims lines that
 * do not run).
 */
export const SYN2 = {
  keyword: '#B69CFF',
  type: '#56CFF5',
  method: '#FFD27A',
  string: '#FF9EB5',
  number: '#B5E8A8',
  punct: '#C9C4F2',
  comment: '#7C83B8',
  plain: '#F3F1FF',
};

const KEYWORDS = new Set([
  'string', 'int', 'bool', 'double', 'decimal', 'char', 'var', 'if', 'else', 'true', 'false', 'for', 'foreach',
  'while', 'return', 'new', 'public', 'private', 'static', 'void', 'class', 'using', 'namespace', 'in', 'null',
]);

/** Tiny C# highlighter for one line of code -> coloured tokens. */
export const cs = (line: string): Tok[] => {
  const out: Tok[] = [];
  const push = (t: string, c: string) => {
    if (!t) return;
    const last = out[out.length - 1];
    if (last && last.c === c) last.t += t;
    else out.push({t, c});
  };
  let i = 0;
  while (i < line.length) {
    const rest = line.slice(i);
    if (rest.startsWith('//')) {
      push(rest, SYN2.comment);
      break;
    }
    if (rest.startsWith('$"') || rest[0] === '"') {
      const interp = rest[0] === '$';
      push(interp ? '$"' : '"', SYN2.string);
      i += interp ? 2 : 1;
      while (i < line.length && line[i] !== '"') {
        if (interp && line[i] === '{') {
          const end = line.indexOf('}', i);
          push('{', SYN2.punct);
          push(line.slice(i + 1, end), SYN2.plain);
          push('}', SYN2.punct);
          i = end + 1;
        } else {
          push(line[i], SYN2.string);
          i++;
        }
      }
      if (i < line.length) push('"', SYN2.string);
      i++;
      continue;
    }
    const num = rest.match(/^\d+(\.\d+)?/);
    if (num) {
      push(num[0], SYN2.number);
      i += num[0].length;
      continue;
    }
    const id = rest.match(/^[A-Za-z_]\w*/);
    if (id) {
      const w = id[0];
      const after = rest.slice(w.length).trimStart();
      const c = KEYWORDS.has(w) ? SYN2.keyword : after.startsWith('(') ? SYN2.method : /^[A-Z]/.test(w) ? SYN2.type : SYN2.plain;
      push(w, c);
      i += w.length;
      continue;
    }
    push(line[i], line[i] === ' ' ? SYN2.plain : SYN2.punct);
    i++;
  }
  return out;
};

export type EdLine = {tokens: Tok[]; typeAt?: number | 'chain'; speed?: number};
export type EdSpan = {row: number; from: number; to: number; rowEnd?: number};
export type EdHighlight = {at: number; until?: number; spans: EdSpan[]; label?: string; tone?: ConceptKey};
export type EdEdit = {at: number; row: number; from: number; to: number; text: string; color: string};
export type EdRun = {at: number; output: string; focus?: number[]; lineAt?: number[]};

/** Frame each character appears, per line (null = present from the start). */
export const lineSchedules = (lines: EdLine[]): (number[] | null)[] => {
  const out: (number[] | null)[] = [];
  let prevEnd = 0;
  lines.forEach((ln, li) => {
    const text = ln.tokens.map((t) => t.t).join('');
    if (ln.typeAt === undefined) {
      out.push(null);
      return;
    }
    let f = ln.typeAt === 'chain' ? prevEnd + 4 : ln.typeAt;
    const sp = ln.speed ?? 1.8;
    const frames: number[] = [];
    let leading = true;
    for (let i = 0; i < text.length; i++) {
      if (leading && text[i] === ' ') {
        frames.push(Math.round(f)); // auto-indent appears at once
        continue;
      }
      leading = false;
      f += sp * (0.7 + random(`ed-${li}-${i}`) * 0.6);
      frames.push(Math.round(f));
    }
    prevEnd = frames.length ? frames[frames.length - 1] : f;
    out.push(frames);
  });
  return out;
};

/** Frames that should get a key-click sound. */
export const editorKeyFrames = (lines: EdLine[], edits: EdEdit[] = []) => {
  const set = new Set<number>();
  lineSchedules(lines).forEach((fr, li) => {
    if (!fr) return;
    const text = lines[li].tokens.map((t) => t.t).join('');
    fr.forEach((f, i) => {
      if (text[i] !== ' ') set.add(f);
    });
  });
  edits.forEach((e) => {
    set.add(e.at + 3);
    for (let k = 0; k < e.text.length; k++) set.add(e.at + 8 + k * 3);
  });
  return [...set].sort((a, b) => a - b);
};

type Ch = {ch: string; c: string};

export const Editor: React.FC<{
  rect: {x: number; y: number; w: number; h: number};
  enter: number;
  exit: number;
  filename: string;
  lines: EdLine[];
  fontSize?: number;
  lineHeight?: number;
  rows?: number;
  highlights?: EdHighlight[];
  edits?: EdEdit[];
  runs?: EdRun[];
  termHeight?: number;
  command?: string;
  lang?: string;
}> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < p.enter) return null;
  const a = glide(frame, p.enter, fps, 110);
  const out = ramp(frame, p.exit, 12);
  if (out >= 1) return null;

  const FS = p.fontSize ?? 36;
  const CW = FS * 0.6;
  const LH = p.lineHeight ?? Math.round(FS * 1.62);
  const TITLE = 78;
  const GUT = 86;
  const codeX = GUT + 24;
  const rowTop = (i: number) => TITLE + 26 + i * LH;
  const sched = lineSchedules(p.lines);
  const edits = p.edits ?? [];
  const runs = p.runs ?? [];
  const highlights = p.highlights ?? [];

  // visible characters per row (typing + edits)
  const rows: Ch[][] = p.lines.map((ln, li) => {
    let chars: Ch[] = [];
    ln.tokens.forEach((t) => {
      for (const ch of t.t) chars.push({ch, c: t.c});
    });
    const fr = sched[li];
    if (fr) chars = chars.slice(0, fr.filter((f) => f <= frame).length);
    for (const e of edits) {
      if (e.row !== li || frame < e.at + 8) continue;
      const k = Math.min(e.text.length, Math.floor((frame - e.at - 8) / 3) + 1);
      chars = [...chars.slice(0, e.from), ...e.text.slice(0, k).split('').map((ch) => ({ch, c: e.color})), ...chars.slice(e.to)];
    }
    return chars;
  });

  // caret follows the most recent keystroke
  let caretRow = -1;
  let caretCol = 0;
  let caretF = -1;
  sched.forEach((fr, li) => {
    if (!fr) return;
    fr.forEach((f, i) => {
      if (f <= frame && f >= caretF) {
        caretRow = li;
        caretCol = i + 1;
        caretF = f;
      }
    });
  });
  for (const e of edits) {
    if (frame < e.at) continue;
    const k = frame >= e.at + 8 ? Math.min(e.text.length, Math.floor((frame - e.at - 8) / 3) + 1) : 0;
    caretRow = e.row;
    caretCol = e.from + k;
    caretF = frame >= e.at + 8 ? e.at + 8 + (k - 1) * 3 : e.at;
  }
  const idle = frame - caretF > 6;
  const caretVisible = caretRow >= 0 && (!idle || Math.floor(frame / 15) % 2 === 0) && !(runs.length && frame >= runs[0].at && !edits.some((e) => frame >= e.at && e.at > runs[0].at && frame < e.at + 30));

  // run state
  let run: EdRun | undefined;
  for (const r of runs) if (frame >= r.at) run = r;
  const nextEvent = run
    ? Math.min(...[...runs.map((r) => r.at), ...edits.map((e) => e.at)].filter((f) => f > run!.at), Infinity)
    : Infinity;
  const focusOn = run && run.focus && frame < nextEvent;
  const dim = (row: number) => (focusOn && !run!.focus!.includes(row) ? 0.26 : 1);
  const press = runs.reduce((m, r) => (frame >= r.at ? Math.max(m, Math.sin(Math.min(1, (frame - r.at) / 8) * Math.PI)) : m), 0);
  const termH = runs.length ? (p.termHeight ?? 200) * glide(frame, runs[0].at + 2, fps, 140) : 0;
  const outPop = run ? pop(frame, run.at + 14, fps, 10, 160) : 0;
  const nRows = p.rows ?? Math.max(p.lines.length, 7);

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
        fontVariantLigatures: 'none',
        fontFeatureSettings: '"liga" 0, "calt" 0',
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
          <span style={{color: CONCEPT.csharp.main, fontWeight: 700, fontSize: 24}}>{p.lang ?? 'C#'}</span>
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

      {/* gutter, line numbers, current line */}
      <div style={{position: 'absolute', left: 0, top: TITLE, bottom: 0, width: GUT, background: '#0D0D2A'}} />
      {caretRow >= 0 && !focusOn ? (
        <div style={{position: 'absolute', left: GUT, right: 0, top: rowTop(caretRow) - 2, height: LH, background: hexA(CONCEPT.dotnet.main, 0.08)}} />
      ) : null}
      {Array.from({length: nRows}, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            width: GUT - 18,
            top: rowTop(i) + (LH - FS * 0.75) / 2 - 2,
            textAlign: 'right',
            fontSize: Math.round(FS * 0.72),
            color: i === caretRow ? C.muted : 'rgba(169,165,214,0.38)',
          }}
        >
          {i + 1}
        </div>
      ))}
      {focusOn
        ? run!.focus!.map((r) => (
            <div key={r} style={{position: 'absolute', left: GUT - 9, top: rowTop(r) + 3, width: 6, height: LH - 6, borderRadius: 3, background: CONCEPT.csharp.main, boxShadow: `0 0 12px ${hexA(CONCEPT.csharp.main, 0.8)}`}} />
          ))
        : null}

      {/* highlights */}
      {highlights.map((h, hi) => {
        const until = h.until ?? highlights[hi + 1]?.at ?? Infinity;
        const op = windowed(frame, h.at, until, 5, 6);
        if (op <= 0) return null;
        const tone = CONCEPT[h.tone ?? 'api'];
        const boxes = h.spans.map((s) => ({
          x: codeX + s.from * CW - 8,
          y: rowTop(s.row) - 3,
          w: (s.to - s.from) * CW + 16,
          h: ((s.rowEnd ?? s.row) - s.row + 1) * LH,
        }));
        const isBlock = h.spans.some((s) => s.rowEnd !== undefined);
        const labelW = (h.label?.length ?? 0) * 14.6 + 36;
        const low = boxes.reduce((m, b) => (b.y > m.y ? b : m), boxes[0]);
        const lx = isBlock ? boxes[0].x + boxes[0].w - labelW - 10 : low.x;
        const ly = isBlock ? boxes[0].y + 8 : low.y + low.h + 6;
        const labelIn = ramp(frame, h.at + 2, 6);
        return (
          <React.Fragment key={hi}>
            {boxes.map((b, bi) => (
              <div
                key={bi}
                style={{
                  position: 'absolute',
                  left: b.x,
                  top: b.y,
                  width: b.w,
                  height: b.h,
                  borderRadius: 14,
                  border: `3px solid ${tone.main}`,
                  background: hexA(tone.main, isBlock ? 0.07 : 0.13),
                  boxShadow: `0 0 24px ${hexA(tone.main, 0.4)}`,
                  opacity: op,
                }}
              />
            ))}
            {h.label ? (
              <div
                style={{
                  position: 'absolute',
                  left: lx,
                  top: ly,
                  padding: '6px 18px',
                  borderRadius: 12,
                  background: tone.main,
                  color: '#160F33',
                  fontFamily: FONT.display,
                  fontWeight: 600,
                  fontSize: 26,
                  whiteSpace: 'nowrap',
                  opacity: op * labelIn,
                  transform: `translateY(${(1 - labelIn) * 8}px)`,
                  zIndex: 3,
                }}
              >
                {h.label}
              </div>
            ) : null}
          </React.Fragment>
        );
      })}

      {/* edit selections */}
      {edits.map((e, ei) =>
        frame >= e.at && frame < e.at + 8 ? (
          <div
            key={ei}
            style={{
              position: 'absolute',
              left: codeX + e.from * CW,
              top: rowTop(e.row) + 4,
              width: (e.to - e.from) * CW,
              height: LH - 8,
              background: hexA(CONCEPT.dotnet.main, 0.55),
              borderRadius: 4,
            }}
          />
        ) : null,
      )}

      {/* code */}
      {rows.map((chars, ri) => {
        const runsOfColor: {t: string; c: string}[] = [];
        for (const ch of chars) {
          const last = runsOfColor[runsOfColor.length - 1];
          if (last && last.c === ch.c) last.t += ch.ch;
          else runsOfColor.push({t: ch.ch, c: ch.c});
        }
        return (
          <div
            key={ri}
            style={{
              position: 'absolute',
              left: codeX,
              top: rowTop(ri) + (LH - FS * 1.25) / 2,
              fontSize: FS,
              lineHeight: `${FS * 1.25}px`,
              whiteSpace: 'pre',
              color: C.paper,
              opacity: dim(ri),
            }}
          >
            {runsOfColor.map((r, i) => (
              <span key={i} style={{color: r.c}}>
                {r.t}
              </span>
            ))}
            {ri === caretRow ? (
              <span
                style={{
                  position: 'absolute',
                  left: caretCol * CW,
                  top: FS * 0.08,
                  width: 4,
                  height: FS * 1.1,
                  background: CONCEPT.dotnet.main,
                  opacity: caretVisible ? 1 : 0,
                }}
              />
            ) : null}
          </div>
        );
      })}

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
        <div style={{position: 'absolute', left: 34, top: 20, fontFamily: FONT.display, fontSize: 24, color: C.muted, opacity: 0.8}}>Terminal</div>
        {run ? (
          <>
            <div style={{position: 'absolute', left: 34, top: 62, fontSize: 30, color: C.muted, opacity: ramp(frame, run.at + 4, 4)}}>
              <span style={{color: CONCEPT.csharp.main}}>{'> '}</span>
              {p.command ?? 'dotnet run'}
            </div>
            <div
              style={{
                position: 'absolute',
                left: 34,
                top: 108,
                fontSize: 44,
                fontWeight: 700,
                color: C.paper,
                opacity: Math.min(1, outPop * 1.5),
                transform: `scale(${0.8 + 0.2 * outPop})`,
                transformOrigin: '0 50%',
                textShadow: `0 0 24px ${hexA(CONCEPT.csharp.main, 0.75)}`,
                whiteSpace: 'pre',
                lineHeight: 1.12,
              }}
            >
              {run.output
                .split('\n')
                .filter((_, k) => frame >= (run!.lineAt?.[k] ?? 0))
                .join('\n')}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
