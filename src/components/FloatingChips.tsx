import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {pop, ramp} from '../engine/timeline';
import {CONCEPT, ConceptKey, FONT, hexA} from '../theme';

/** Buzzwords swirling around the instructor's head ("where do I start?"). */
export const FloatingChips: React.FC<{items: {text: string; tone: ConceptKey; x: number; y: number; at?: number}[]; at: number; until: number}> = ({items, at, until}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > until + 16) return null;
  return (
    <>
      {items.map((it, i) => {
        const a = pop(frame, it.at ?? at + i * 4, fps, 10, 170);
        const out = ramp(frame, until + i * 2, 9);
        const tone = CONCEPT[it.tone];
        const bob = Math.sin((frame + i * 13) / 10) * 9;
        const rot = Math.sin((frame + i * 7) / 14) * 6 + (i % 2 ? 5 : -5);
        return (
          <div
            key={it.text}
            style={{
              position: 'absolute',
              left: it.x,
              top: it.y + bob,
              transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${a * (1 + out * 0.35)})`,
              opacity: Math.min(1, a * 1.6) * (1 - out),
              padding: '12px 24px',
              borderRadius: 20,
              background: 'rgba(14,14,42,0.82)',
              border: `2.5px solid ${hexA(tone.main, 0.8)}`,
              color: tone.main,
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: 40,
              whiteSpace: 'nowrap',
              boxShadow: `0 0 26px ${hexA(tone.main, 0.3)}`,
            }}
          >
            {it.text}
            <span style={{marginLeft: 10, color: CONCEPT.api.main}}>?</span>
          </div>
        );
      })}
    </>
  );
};
