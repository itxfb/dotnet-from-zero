import React from 'react';
import {LessonFrame} from '../components/LessonFrame';
import {Timeline} from '../engine/timeline';
import {Day01} from './day01/Day01';
import day01Timeline from './day01/timeline.json';
import {Day02} from './day02/Day02';
import day02Timeline from './day02/timeline.json';
import {Day03} from './day03/Day03';
import day03Timeline from './day03/timeline.json';
import {Day04} from './day04/Day04';
import day04Timeline from './day04/timeline.json';
import {Day05} from './day05/Day05';
import day05Timeline from './day05/timeline.json';
import {Day06} from './day06/Day06';
import day06Timeline from './day06/timeline.json';
import {Day07} from './day07/Day07';
import day07Timeline from './day07/timeline.json';
import {Day08} from './day08/Day08';
import day08Timeline from './day08/timeline.json';
import {Day09} from './day09/Day09';
import day09Timeline from './day09/timeline.json';
import {Day10} from './day10/Day10';
import day10Timeline from './day10/timeline.json';
import {AitoolsDay01} from './aitools-day01/AitoolsDay01';
import aitoolsDay01Timeline from './aitools-day01/timeline.json';
import {AitoolsDay02} from './aitools-day02/AitoolsDay02';
import aitoolsDay02Timeline from './aitools-day02/timeline.json';
import {AitoolsDay03} from './aitools-day03/AitoolsDay03';
import aitoolsDay03Timeline from './aitools-day03/timeline.json';
import {AitoolsDay04} from './aitools-day04/AitoolsDay04';
import aitoolsDay04Timeline from './aitools-day04/timeline.json';

/**
 * Lesson registry. To add a lesson: create src/lessons/dayNN/{script.json, DayNN.tsx},
 * run `python3 tools/build_audio.py dayNN` once (creates timeline.json), then add a line here.
 */
type Lesson = {id: string; timeline: Timeline; Story: React.FC};

const lesson = (id: string, timeline: unknown, Story: React.FC): Lesson => ({id, timeline: timeline as Timeline, Story});

export const LESSONS: Lesson[] = [
  lesson('day01', day01Timeline, Day01),
  lesson('day02', day02Timeline, Day02),
  lesson('day03', day03Timeline, Day03),
  lesson('day04', day04Timeline, Day04),
  lesson('day05', day05Timeline, Day05),
  lesson('day06', day06Timeline, Day06),
  lesson('day07', day07Timeline, Day07),
  lesson('day08', day08Timeline, Day08),
  lesson('day09', day09Timeline, Day09),
  lesson('day10', day10Timeline, Day10),
  lesson('aitools-day01', aitoolsDay01Timeline, AitoolsDay01),
  lesson('aitools-day02', aitoolsDay02Timeline, AitoolsDay02),
  lesson('aitools-day03', aitoolsDay03Timeline, AitoolsDay03),
  lesson('aitools-day04', aitoolsDay04Timeline, AitoolsDay04),
];

export const lessonVideo = (l: Lesson): React.FC => {
  const Video: React.FC = () => React.createElement(LessonFrame, {timeline: l.timeline}, React.createElement(l.Story));
  return Video;
};
