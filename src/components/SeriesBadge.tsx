import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useShot} from '../engine/direction';
import {pop, useTimeline} from '../engine/timeline';
import {C, CONCEPT, FONT} from '../theme';

/** ".NET FROM ZERO" + "DAY n" — large in the hook, compact afterwards. */
export const SeriesBadge: React.FC<{pulseAt?: number}> = ({pulseAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tl = useTimeline();
  const shot = useShot();
  const enter = pop(frame, 3, fps, 14, 140);
  const big = Math.min(1, Math.max(0, shot.badge - 1));
  const visible = Math.min(1, shot.badge);
  const scale = 0.74 + 0.26 * big;
  const top = 92 + 68 * big;
  const pulse = pulseAt !== undefined && frame >= pulseAt ? Math.sin(Math.min(1, (frame - pulseAt) / 14) * Math.PI) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top,
        display: 'flex',
        justifyContent: 'center',
        opacity: enter * visible,
        transform: `translateY(${(1 - enter) * -50}px) scale(${scale})`,
        transformOrigin: '50% 0%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 14px 12px 12px',
          borderRadius: 24,
          background: 'rgba(14,14,42,0.82)',
          border: '1.5px solid rgba(214,208,255,0.16)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: CONCEPT.dotnet.deep,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT.mono,
            fontWeight: 700,
            fontSize: 24,
            color: C.paper,
          }}
        >
          {'>_'}
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 34, letterSpacing: '0.05em', color: C.paper}}>
          {tl.meta.series}
        </div>
        <div
          style={{
            padding: '8px 16px',
            borderRadius: 14,
            background: CONCEPT.dotnet.main,
            color: '#170E45',
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: '0.04em',
            transform: `scale(${1 + 0.18 * pulse})`,
            boxShadow: `0 0 ${10 + 40 * pulse}px rgba(154,123,255,${0.3 + 0.5 * pulse})`,
          }}
        >
          DAY {tl.meta.day}
        </div>
      </div>
    </div>
  );
};
