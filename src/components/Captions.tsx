import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useShot} from '../engine/direction';
import {ramp, useTimeline, Word} from '../engine/timeline';
import {C, CONCEPT, ConceptKey, FONT} from '../theme';

/** Split a line into short caption chunks: break at punctuation, then split long phrases evenly (no orphan words). */
const chunk = (words: Word[], maxWords = 5, maxChars = 30): Word[][] => {
  const phrases: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (/[.!?:]$/.test(w.text) || (/[,—]$/.test(w.text) && cur.length >= 3)) {
      phrases.push(cur);
      cur = [];
    }
  }
  if (cur.length) phrases.push(cur);
  const out: Word[][] = [];
  for (const ph of phrases) {
    const chars = ph.reduce((n, w) => n + w.text.length + 1, -1);
    const k = Math.max(Math.ceil(ph.length / maxWords), Math.ceil(chars / maxChars));
    const size = Math.ceil(ph.length / k);
    for (let i = 0; i < ph.length; i += size) out.push(ph.slice(i, i + size));
  }
  return out;
};

/** Small, synced captions; key terms take their concept colour. */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const tl = useTimeline();
  const shot = useShot();
  const lines = tl.lines.filter((l) => l.caption);
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const nextStart = lines[li + 1]?.from ?? Infinity;
    if (frame < line.from - 3 || frame >= Math.min(line.to + 14, nextStart - 2)) continue;
    const chunks = chunk(line.words);
    let idx = 0;
    for (let i = 0; i < chunks.length; i++) if (frame >= chunks[i][0].from - 3) idx = i;
    const ch = chunks[idx];
    const appear = ramp(frame, ch[0].from - 3, 5);
    return (
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: shot.captionY - 38,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            maxWidth: 900,
            padding: '12px 26px 14px',
            borderRadius: 22,
            background: 'rgba(12,12,36,0.74)',
            border: '1.5px solid rgba(214,208,255,0.12)',
            fontFamily: FONT.display,
            fontSize: 44,
            fontWeight: 500,
            lineHeight: 1.25,
            color: C.paper,
            textAlign: 'center',
            transform: `translateY(${(1 - appear) * 10}px) scale(${0.96 + 0.04 * appear})`,
            opacity: appear,
          }}
        >
          {ch.map((w, i) => {
            const spoken = frame >= w.from - 1;
            const kw = w.kw as ConceptKey | null;
            return (
              <span
                key={i}
                style={{
                  color: kw ? CONCEPT[kw].main : C.paper,
                  fontWeight: kw ? 700 : 500,
                  opacity: spoken ? 1 : 0.42,
                }}
              >
                {w.text}
                {i < ch.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};
