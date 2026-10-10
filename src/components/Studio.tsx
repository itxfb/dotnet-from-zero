import React from 'react';
import {AbsoluteFill, getStaticFiles, Img, staticFile} from 'remotion';
import {cameraTransform, PIP, useShot} from '../engine/direction';
import {lerp} from '../engine/timeline';
import {C, hexA} from '../theme';
import {Direction, Instructor} from './instructor/Instructor';
import {Workspace} from './Workspace';

const hasBakedBackdrop = () => getStaticFiles().some((f) => f.name === 'generated/workspace.png');

/** The blurred studio backdrop: pre-rendered PNG when available (fast), live SVG otherwise. */
const Backdrop: React.FC<{style: React.CSSProperties}> = ({style}) => (
  <AbsoluteFill style={style}>
    {hasBakedBackdrop() ? <Img src={staticFile('generated/workspace.png')} style={{width: 1080, height: 1920}} /> : <Workspace />}
  </AbsoluteFill>
);

/** Dark desk surface revealed around the picture-in-picture card. */
const Desk: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(900px 700px at 80% 15%, ${hexA('#9A7BFF', 0.16)}, transparent 70%), radial-gradient(700px 600px at 10% 90%, ${hexA('#3FE0A0', 0.08)}, transparent 70%), linear-gradient(180deg, #121236 0%, ${C.inkDeep} 100%)`,
    }}
  >
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${hexA('#D6D0FF', 0.05)} 1.5px, transparent 1.5px), linear-gradient(90deg, ${hexA('#D6D0FF', 0.05)} 1.5px, transparent 1.5px)`,
        backgroundSize: '60px 60px',
        backgroundPosition: '30px 0',
      }}
    />
  </AbsoluteFill>
);

/**
 * Everything the camera sees: studio backdrop + instructor. Shots move the
 * camera; in the code scene the whole camera view shrinks into a PiP card.
 */
export const Studio: React.FC<{direction: Direction}> = ({direction}) => {
  const shot = useShot();
  const cam = cameraTransform(shot);
  const p = shot.pip;
  const card = PIP.card;
  const inset = `inset(${lerp(0, card.y, p)}px ${lerp(0, 1080 - card.x - card.w, p)}px ${lerp(0, 1920 - card.y - card.h, p)}px ${lerp(0, card.x, p)}px round ${lerp(0, card.r, p)}px)`;
  const bgScale = 1.18 + (shot.s - 1) * 0.15;
  const bgX = (shot.x - 540) * 0.3;
  const bgY = (shot.y - 1925) * 0.2;
  return (
    <AbsoluteFill>
      <Desk />
      <AbsoluteFill style={{clipPath: inset}}>
        <AbsoluteFill style={{transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.sc})`, transformOrigin: '0 0'}}>
          <Backdrop style={{transform: `translate(${bgX}px, ${bgY}px) scale(${bgScale})`, transformOrigin: '540px 960px'}} />
          <Instructor direction={direction} layout={{x: shot.x, y: shot.y, s: shot.s}} cam={cam} />
        </AbsoluteFill>
      </AbsoluteFill>
      {p > 0.02 ? (
        <div
          style={{
            position: 'absolute',
            left: lerp(0, card.x, p),
            top: lerp(0, card.y, p),
            width: lerp(1080, card.w, p),
            height: lerp(1920, card.h, p),
            borderRadius: lerp(0, card.r, p),
            border: `3px solid ${hexA('#9A7BFF', 0.75 * p)}`,
            boxShadow: `0 0 0 8px ${hexA('#9A7BFF', 0.12 * p)}, 0 30px 70px rgba(0,0,0,${0.5 * p})`,
          }}
        />
      ) : null}
      {/* calm backdrop behind diagrams: dark wash + faint grid fading out above the instructor */}
      <AbsoluteFill
        style={{
          opacity: shot.dim * (1 - p),
          background: `linear-gradient(180deg, ${hexA('#0E0E2E', 0.93)} 0%, ${hexA('#0E0E2E', 0.88)} 50%, ${hexA('#0E0E2E', 0.5)} 60%, ${hexA('#0E0E2E', 0)} 71%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: Math.max(0, shot.dim - 0.35) * (1 - p) * 1.4,
          backgroundImage: `linear-gradient(${hexA('#D6D0FF', 0.055)} 1.5px, transparent 1.5px), linear-gradient(90deg, ${hexA('#D6D0FF', 0.055)} 1.5px, transparent 1.5px)`,
          backgroundSize: '60px 60px',
          backgroundPosition: '30px 0',
          WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 50%, transparent 62%)',
        }}
      />
    </AbsoluteFill>
  );
};
