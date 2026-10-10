import React from 'react';
import {Composition} from 'remotion';
import {WorkspaceStill} from './components/Workspace';
import {PoseSheet} from './dev/PoseSheet';
import {LESSONS, lessonVideo} from './lessons';
import {loadFonts} from './theme';

loadFonts();

export const RemotionRoot: React.FC = () => (
  <>
    {LESSONS.map((l) => (
      <Composition
        key={l.id}
        id={l.id}
        component={lessonVideo(l)}
        durationInFrames={l.timeline.durationInFrames}
        fps={l.timeline.fps}
        width={1080}
        height={1920}
      />
    ))}
    <Composition id="workspace-bg" component={WorkspaceStill} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="dev-poses" component={PoseSheet} durationInFrames={8} fps={30} width={1080} height={1920} />
  </>
);
