import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {neutralRig, Rig, RigState} from '../components/instructor/Rig';
import {POSES, PoseName} from '../components/instructor/poses';
import {Workspace} from '../components/Workspace';
import {FONT} from '../theme';

/** Dev preview: one named pose per frame (open in Remotion Studio). */
export const PoseSheet: React.FC = () => {
  const f = useCurrentFrame();
  const names = Object.keys(POSES) as PoseName[];
  const name = names[f % names.length];
  const pose = POSES[name];
  const st: RigState = {...neutralRig(), R: pose.R, L: pose.L, brow: 'brow' in pose ? pose.brow ?? 0 : 0};
  return (
    <AbsoluteFill>
      <Workspace />
      <div style={{position: 'absolute', left: 540 - 400 * 1.3, top: 1925 - 1300, transform: 'scale(1.3)', transformOrigin: '0 0'}}>
        <Rig st={st} />
      </div>
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', color: 'white', fontFamily: FONT.display, fontSize: 64}}>{name}</div>
    </AbsoluteFill>
  );
};
