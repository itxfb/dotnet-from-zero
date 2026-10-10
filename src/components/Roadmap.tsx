import React from 'react';
import type {LucideIcon} from 'lucide-react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, easeInOut, pop, ramp} from '../engine/timeline';
import {C, CONCEPT, ConceptKey, FONT, hexA} from '../theme';
import {Module} from './Module';

export type Step = {label: string; tone: ConceptKey; Icon: LucideIcon};

/** Vertical learning path: numbered stops light up one after another. */
export const Roadmap: React.FC<{
  steps: Step[];
  spineX: number;
  top: number;
  gap: number;
  moduleX: number;
  moduleW: number;
  moduleH: number;
  start: number;
  interval: number;
  exit: number;
  tag?: {text: string; step: number};
}> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < p.start - 4) return null;
  const out = ramp(frame, p.exit, 12);
  if (out >= 1) return null;
  const n = p.steps.length;
  const raw = (frame - p.start) / p.interval;
  const idx = Math.max(0, Math.min(n - 1, Math.floor(raw)));
  const fillY = p.top + p.gap * Math.min(n - 1, idx + easeInOut(clamp01(raw - idx)));
  const lastY = p.top + p.gap * (n - 1);
  const tagAt = p.start + n * p.interval + 4;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
      <div style={{position: 'absolute', left: p.spineX - 5, top: p.top, width: 10, height: lastY - p.top, borderRadius: 5, background: 'rgba(214,208,255,0.12)'}} />
      <div
        style={{
          position: 'absolute',
          left: p.spineX - 5,
          top: p.top,
          width: 10,
          height: Math.max(0, fillY - p.top),
          borderRadius: 5,
          background: `linear-gradient(180deg, ${CONCEPT.csharp.main}, ${CONCEPT.dotnet.main} 45%, ${CONCEPT.aspnet.main} 75%, ${CONCEPT.warm.main})`,
          boxShadow: `0 0 18px ${hexA(CONCEPT.dotnet.main, 0.6)}`,
        }}
      />
      {p.steps.map((s, i) => {
        const at = p.start + i * p.interval;
        const a = pop(frame, at, fps, 10, 170);
        const y = p.top + i * p.gap;
        const tone = CONCEPT[s.tone];
        return (
          <React.Fragment key={s.label}>
            <div
              style={{
                position: 'absolute',
                left: p.spineX - 34,
                top: y - 34,
                width: 68,
                height: 68,
                borderRadius: 34,
                background: frame >= at ? tone.deep : C.inkRaised,
                border: `3px solid ${tone.main}`,
                color: C.paper,
                fontFamily: FONT.display,
                fontWeight: 700,
                fontSize: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${0.4 + 0.6 * a})`,
                opacity: Math.min(1, a * 2),
                boxShadow: `0 0 ${12 + 20 * a}px ${hexA(tone.main, 0.45)}`,
              }}
            >
              {i + 1}
            </div>
            <Module
              x={p.moduleX + p.moduleW / 2}
              y={y}
              w={p.moduleW}
              h={p.moduleH}
              tone={s.tone}
              label={s.label}
              Icon={s.Icon}
              appear={at + 2}
              align="left"
              labelSize={38}
              glow={i === n - 1 ? 0.6 * Math.max(0, Math.sin((frame - at) / 9)) : 0}
            />
          </React.Fragment>
        );
      })}
      {p.tag && frame >= tagAt ? (
        <div
          style={{
            position: 'absolute',
            left: p.spineX - 210,
            top: p.top + p.tag.step * p.gap - 26,
            padding: '8px 16px',
            borderRadius: 14,
            background: CONCEPT.dotnet.main,
            color: '#170E45',
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 28,
            transform: `scale(${pop(frame, tagAt, fps)})`,
          }}
        >
          {p.tag.text}
        </div>
      ) : null}
    </div>
  );
};
