import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile} from 'remotion';
import {Timeline, TimelineProvider} from '../engine/timeline';
import {C, loadFonts} from '../theme';

loadFonts();

/** Shared wrapper for every lesson: timeline context, base colour, narration + music. */
export const LessonFrame: React.FC<{timeline: Timeline; children?: React.ReactNode}> = ({timeline, children}) => (
  <TimelineProvider timeline={timeline}>
    <AbsoluteFill style={{backgroundColor: C.inkDeep, overflow: 'hidden'}}>{children}</AbsoluteFill>
    <Html5Audio src={staticFile(timeline.audio.narration)} />
    {timeline.audio.music ? <Html5Audio src={staticFile(timeline.audio.music)} /> : null}
  </TimelineProvider>
);
