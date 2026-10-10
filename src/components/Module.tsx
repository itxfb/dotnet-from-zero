import React from 'react';
import type {LucideIcon} from 'lucide-react';
import {Easing, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, pop, ramp} from '../engine/timeline';
import {C, CONCEPT, ConceptKey, FONT, hexA} from '../theme';

export type ModuleProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  tone: ConceptKey;
  label: string;
  sub?: string;
  subOpacity?: number;
  Icon?: LucideIcon;
  appear: number;
  exit?: number;
  ghost?: number; // 1 = dashed placeholder, 0 = solid key
  glow?: number;
  variant?: 'key' | 'flat';
  labelSize?: number;
  align?: 'center' | 'left';
  dy?: number;
};

/**
 * A concept "keycap": tactile module with an extruded base that presses down
 * when it lands. Position/size can be animated by the caller.
 */
export const Module: React.FC<ModuleProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < p.appear) return null;
  const a = pop(frame, p.appear, fps, 11, 150, 0.8);
  const out = p.exit !== undefined ? ramp(frame, p.exit, 12, Easing.in(Easing.cubic)) : 0;
  if (out >= 1) return null;
  const tone = CONCEPT[p.tone];
  const flat = p.variant === 'flat';
  const D = flat ? 0 : Math.max(9, Math.round(p.h * 0.08));
  const press = flat ? 0 : Math.sin(Math.PI * clamp01((frame - p.appear - 5) / 9)) * D * 0.6;
  const ghost = p.ghost ?? 0;
  const glow = p.glow ?? 0;
  const r = Math.min(30, p.h * 0.22);
  const faceH = p.h - D;
  const iconSize = Math.round(faceH * 0.36);
  const labelSize = p.labelSize ?? Math.round(faceH * 0.27);
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x - p.w / 2,
        top: p.y - p.h / 2 + (p.dy ?? 0),
        width: p.w,
        height: p.h,
        transform: `translateY(${(1 - a) * -34}px) scale(${(0.6 + 0.4 * a) * (1 - 0.15 * out)})`,
        opacity: Math.min(1, a * 1.7) * (1 - out),
      }}
    >
      {D > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: D,
            bottom: 0,
            borderRadius: r,
            background: `linear-gradient(180deg, ${tone.deep}, ${hexA(tone.deep, 0.75)})`,
            opacity: 1 - ghost,
            boxShadow: `0 22px 44px rgba(4,4,22,${0.55 * (1 - ghost)})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: press,
          height: faceH,
          borderRadius: r,
          boxShadow: `0 0 ${16 + 70 * glow}px ${hexA(tone.main, (0.22 + 0.45 * glow) * (1 - ghost))}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: r,
            opacity: 1 - ghost,
            background: flat
              ? `linear-gradient(90deg, ${hexA(tone.main, 0.2)}, ${hexA(tone.main, 0.06)}), ${C.inkRaised}`
              : `linear-gradient(180deg, ${hexA(tone.main, 0.26)} 0%, ${hexA(tone.main, 0.09)} 100%), ${C.inkRaised}`,
            border: `2.5px solid ${hexA(tone.main, 0.72)}`,
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: r,
            opacity: ghost,
            border: `3px dashed ${hexA(tone.main, 0.6)}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: p.align === 'left' ? 'flex-start' : 'center',
            gap: Math.round(faceH * 0.14),
            padding: `0 ${Math.round(faceH * 0.22)}px`,
            opacity: 0.45 + 0.55 * (1 - ghost),
          }}
        >
          {p.Icon ? <p.Icon size={iconSize} color={tone.main} strokeWidth={2.3} style={{flexShrink: 0}} /> : null}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: p.align === 'left' ? 'flex-start' : 'center'}}>
            <div
              style={{
                fontFamily: FONT.display,
                fontWeight: 700,
                fontSize: labelSize,
                color: C.paper,
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
                whiteSpace: 'nowrap',
              }}
            >
              {p.label}
            </div>
            {p.sub ? (
              <div
                style={{
                  fontFamily: FONT.display,
                  fontWeight: 500,
                  fontSize: Math.round(faceH * 0.19),
                  color: C.muted,
                  marginTop: 6,
                  whiteSpace: 'nowrap',
                  opacity: p.subOpacity ?? 1,
                  height: (p.subOpacity ?? 1) > 0.01 ? undefined : 0,
                }}
              >
                {p.sub}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Floating "?" bubble. */
export const QBadge: React.FC<{x: number; y: number; at: number; until: number; size?: number}> = ({x, y, at, until, size = 58}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > until + 10) return null;
  const a = pop(frame, at, fps, 9, 180, 0.6);
  const out = ramp(frame, until, 8);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2 + Math.sin(frame / 7) * 5,
        width: size,
        height: size,
        borderRadius: size / 2,
        background: CONCEPT.api.main,
        color: '#2A1600',
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: size * 0.62,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${a * (1 - out)}) rotate(${Math.sin(frame / 9) * 8}deg)`,
        boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
      }}
    >
      ?
    </div>
  );
};

/** Big operator glyph such as "+" or "=". */
export const Glyph: React.FC<{x: number; y: number; at: number; exit?: number; text: string; size?: number}> = ({x, y, at, exit, text, size = 72}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const a = pop(frame, at, fps);
  const out = exit !== undefined ? ramp(frame, exit, 10) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 60,
        top: y - 60,
        width: 120,
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: size,
        color: C.muted,
        opacity: Math.min(1, a) * (1 - out),
        transform: `scale(${a})`,
      }}
    >
      {text}
    </div>
  );
};

/** Short label floating near something (e.g. "by Microsoft"). */
export const Tag: React.FC<{x: number; y: number; at: number; exit?: number; text: string; color?: string; size?: number}> = ({
  x,
  y,
  at,
  exit,
  text,
  color = C.muted,
  size = 30,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const a = ramp(frame, at, 10);
  const out = exit !== undefined ? ramp(frame, exit, 10) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 300,
        width: 600,
        top: y - size,
        textAlign: 'center',
        fontFamily: FONT.display,
        fontWeight: 500,
        fontSize: size,
        color,
        opacity: a * (1 - out),
        transform: `translateY(${(1 - a) * 12}px)`,
      }}
    >
      {text}
    </div>
  );
};
