import React from 'react';
import {ArrowRight} from 'lucide-react';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, pop, ramp} from '../engine/timeline';
import {C, CONCEPT, FONT, hexA} from '../theme';

/** "DAY n ✓" + "DAY n+1 → NEXT TITLE". */
export const EndCard: React.FC<{day: number; nextDay: number; nextTitle: string; doneAt: number; nextAt: number; glowAt: number}> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < p.doneAt - 2) return null;
  const a = pop(frame, p.doneAt, fps, 11, 150);
  const check = clamp01((frame - p.doneAt - 6) / 12);
  const b = pop(frame, p.nextAt, fps, 12, 140);
  const glow = frame >= p.glowAt ? Math.max(0, Math.sin(clamp01((frame - p.glowAt) / 30) * Math.PI)) : 0;
  const burst = clamp01((frame - p.doneAt - 8) / 22);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '16px 18px 16px 34px',
            borderRadius: 30,
            background: 'rgba(14,14,42,0.86)',
            border: `2.5px solid ${hexA(CONCEPT.csharp.main, 0.7)}`,
            boxShadow: `0 0 40px ${hexA(CONCEPT.csharp.main, 0.3)}`,
            transform: `scale(${a})`,
          }}
        >
          <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 64, color: C.paper, letterSpacing: '0.03em'}}>DAY {p.day}</div>
          <svg width={86} height={86} viewBox="0 0 86 86">
            <circle cx={43} cy={43} r={40} fill={CONCEPT.csharp.main} />
            <path d="M 24 44 L 38 58 L 63 30" fill="none" stroke="#063D27" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - check} />
          </svg>
          {Array.from({length: 12}, (_, i) => {
            const ang = (i / 12) * Math.PI * 2 + random(`sp${i}`) * 0.4;
            const dist = 60 + burst * (110 + random(`sd${i}`) * 70);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: '72%',
                  top: '50%',
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: [CONCEPT.csharp.main, CONCEPT.dotnet.main, CONCEPT.api.main, CONCEPT.aspnet.main][i % 4],
                  transform: `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist}px) scale(${1 - burst})`,
                  opacity: burst > 0 && burst < 1 ? 1 : 0,
                }}
              />
            );
          })}
        </div>
      </div>
      {frame >= p.nextAt ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '22px 34px',
              borderRadius: 30,
              background: `linear-gradient(180deg, ${hexA(CONCEPT.dotnet.main, 0.28)}, ${hexA(CONCEPT.dotnet.main, 0.1)}), ${C.inkRaised}`,
              border: `2.5px solid ${hexA(CONCEPT.dotnet.main, 0.75)}`,
              boxShadow: `0 14px 0 ${CONCEPT.dotnet.deep}, 0 0 ${30 + 60 * glow}px ${hexA(CONCEPT.dotnet.main, 0.35 + 0.4 * glow)}`,
              transform: `translateY(${(1 - b) * 40}px) scale(${0.7 + 0.3 * b})`,
              opacity: Math.min(1, b * 1.6),
            }}
          >
            <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 44, color: C.muted}}>DAY {p.nextDay}</div>
            <ArrowRight size={52} color={C.paper} strokeWidth={2.6} />
            <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 60, color: CONCEPT.csharp.main, letterSpacing: '0.02em'}}>
              {p.nextTitle.toUpperCase()}
            </div>
          </div>
        </div>
      ) : null}
      <div style={{opacity: ramp(frame, p.doneAt, 4) * 0}} />
    </>
  );
};
