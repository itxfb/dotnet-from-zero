#!/usr/bin/env node
/** Render preview stills + a contact sheet:  node tools/stills.mjs day01 0 150 300 ... */
import path from 'node:path';
import {mkdirSync} from 'node:fs';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const [id, ...frames] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
mkdirSync('out/stills', {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id, browserExecutable});
for (const f of frames) {
  const output = `out/stills/${id}-${String(f).padStart(4, '0')}.png`;
  await renderStill({composition, serveUrl, output, frame: Number(f), scale: 0.5, browserExecutable});
  console.log('rendered', output);
}
