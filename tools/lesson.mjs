#!/usr/bin/env node
/**
 * One command per lesson:   npm run lesson -- day01 [--skip-audio] [any remotion render flags]
 *   1. python3 tools/build_audio.py <id>   (voice, music, timeline.json)
 *   2. bakes the blurred studio backdrop once (public/generated/workspace.png)
 *   3. npx remotion render src/index.ts <id> out/<id>.mp4
 */
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';

const [id, ...flags] = process.argv.slice(2);
if (!id) {
  console.error('usage: npm run lesson -- <lessonId> [--skip-audio] [remotion flags]');
  process.exit(1);
}
const win = process.platform === 'win32';
const venvPy = win ? '.venv\\Scripts\\python.exe' : '.venv/bin/python';
const py = existsSync(venvPy) ? venvPy : win ? 'python' : 'python3';
const npx = win ? 'npx.cmd' : 'npx';
const run = (cmd, args) => {
  console.log(`\n$ ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, {stdio: 'inherit', shell: win});
  if (r.status !== 0) process.exit(r.status ?? 1);
};

if (!flags.includes('--skip-audio')) run(py, ['tools/build_audio.py', id]);
mkdirSync('public/generated', {recursive: true});
if (!existsSync('public/generated/workspace.png')) {
  run(npx, ['remotion', 'still', 'src/index.ts', 'workspace-bg', 'public/generated/workspace.png']);
}
mkdirSync('out', {recursive: true});
run(npx, ['remotion', 'render', 'src/index.ts', id, `out/${id}.mp4`, ...flags.filter((f) => f !== '--skip-audio')]);
console.log(`\nDone: out/${id}.mp4`);
