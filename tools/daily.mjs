#!/usr/bin/env node
/**
 * Daily lesson: author the next lesson with Claude Code, render it, upload it to YouTube.
 *   node tools/daily.mjs                one run (no-op if today's video is already uploaded)
 *   node tools/daily.mjs auth           one-time Google sign-in -> .secrets/token.json
 *   node tools/daily.mjs upload day04   upload an already-rendered lesson
 *   node tools/daily.mjs prepare        author + render the next lesson now, upload on the next run
 * Topics: tools/curriculum.json   Uploads: published.json   Log: out/daily.log
 */
import {spawnSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, writeFileSync, writeSync} from 'node:fs';
import {createServer} from 'node:http';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
process.chdir(ROOT);
mkdirSync('out', {recursive: true});
mkdirSync('.cache/tmp', {recursive: true});
process.env.TEMP = process.env.TMP = path.resolve('.cache/tmp');

const win = process.platform === 'win32';
const npx = win ? 'npx.cmd' : 'npx';
const py = win ? '.venv/Scripts/python.exe' : '.venv/bin/python';
const REDIRECT = 'http://localhost:53682/';
const ALLOWED = `Read,Write,Edit,Glob,Grep,Bash(node:*),Bash(npx tsc:*),Bash(${py}:*),Bash(dotnet:*)`;
const topics = JSON.parse(readFileSync('tools/curriculum.json', 'utf8'));

const log = openSync('out/daily.log', 'a');
const say = (m) => {
  const line = `[${new Date().toISOString()}] ${m}\n`;
  process.stdout.write(line);
  writeSync(log, line);
};
const fail = (m) => {
  say(`FAILED: ${m}`);
  process.exit(1);
};
const sh = (cmd, args) => {
  say(`$ ${cmd} ${args.join(' ')}`);
  return spawnSync(cmd, args, {stdio: ['ignore', log, log], shell: win && cmd.endsWith('.cmd')}).status;
};
const json = (f) => JSON.parse(readFileSync(f, 'utf8'));
const pad = (n) => String(n).padStart(2, '0');
const today = () => new Date().toLocaleDateString('en-CA');
const published = () => (existsSync('published.json') ? json('published.json') : {});
const client = () => {
  if (process.env.YT_CLIENT_ID) return {client_id: process.env.YT_CLIENT_ID, client_secret: process.env.YT_CLIENT_SECRET};
  const c = json('.secrets/client_secret.json');
  return c.installed ?? c.web;
};

const auth = async () => {
  const {client_id, client_secret} = client();
  const q = {client_id, redirect_uri: REDIRECT, response_type: 'code', scope: 'https://www.googleapis.com/auth/youtube.upload', access_type: 'offline', prompt: 'consent'};
  say(`open this link and sign in with the YouTube channel's account:\nhttps://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(q)}`);
  const code = await new Promise((resolve) => {
    const srv = createServer((req, res) => {
      const p = new URL(req.url, REDIRECT).searchParams;
      res.end(p.get('code') ? 'Signed in. You can close this tab.' : `Sign-in failed: ${p.get('error')}`);
      if (p.get('code')) {
        srv.close();
        resolve(p.get('code'));
      }
    }).listen(53682);
  });
  const r = await fetch('https://oauth2.googleapis.com/token', {method: 'POST', body: new URLSearchParams({code, client_id, client_secret, redirect_uri: REDIRECT, grant_type: 'authorization_code'})});
  const t = await r.json();
  if (!t.refresh_token) fail(`token exchange: ${JSON.stringify(t)}`);
  writeFileSync('.secrets/token.json', JSON.stringify({refresh_token: t.refresh_token}));
  say('signed in: .secrets/token.json saved');
};

const accessToken = async () => {
  if (!process.env.YT_REFRESH_TOKEN && !existsSync('.secrets/token.json')) fail('not signed in: run node tools/daily.mjs auth');
  const {client_id, client_secret} = client();
  const refresh_token = process.env.YT_REFRESH_TOKEN ?? json('.secrets/token.json').refresh_token;
  const r = await fetch('https://oauth2.googleapis.com/token', {method: 'POST', body: new URLSearchParams({client_id, client_secret, refresh_token, grant_type: 'refresh_token'})});
  const t = await r.json();
  if (!r.ok) fail(`Google rejected the sign-in (${t.error}): run node tools/daily.mjs auth`);
  return t.access_token;
};

const upload = async (id) => {
  const {meta} = json(`src/lessons/${id}/timeline.json`);
  const clean = (s) => s.replace(/[<>]/g, '');
  const video = readFileSync(`out/${id}.mp4`);
  const body = {
    snippet: {
      title: clean(`${meta.title} | .NET From Zero Day ${meta.day} #Shorts`).slice(0, 100),
      description: clean(
        [
          `Day ${meta.day} of .NET From Zero: learn C# and .NET from scratch, one short a day.`,
          meta.next ? `Next: Day ${meta.next.day}, ${meta.next.title}.` : '',
          '',
          '#dotnet #csharp #programming #learntocode #shorts',
        ].join('\n'),
      ),
      tags: ['dotnet', '.NET', 'csharp', 'C#', 'programming', 'learn to code', clean(meta.title)],
      categoryId: '27',
    },
    status: {privacyStatus: 'public', selfDeclaredMadeForKids: false},
  };
  const authz = {Authorization: `Bearer ${await accessToken()}`};
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {...authz, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'video/mp4', 'X-Upload-Content-Length': String(video.length)},
    body: JSON.stringify(body),
  });
  if (!init.ok) fail(`upload start ${init.status}: ${await init.text()}`);
  const put = await fetch(init.headers.get('location'), {method: 'PUT', headers: {...authz, 'Content-Type': 'video/mp4'}, body: video});
  const v = await put.json();
  if (!put.ok) fail(`upload ${put.status}: ${JSON.stringify(v)}`);
  writeFileSync('published.json', JSON.stringify({...published(), [id]: {videoId: v.id, date: today(), channel: v.snippet.channelTitle, status: v.status}}, null, 2) + '\n');
  say(`uploaded ${id}: https://youtu.be/${v.id} on "${v.snippet.channelTitle}" (${v.status.privacyStatus}${v.status.publishAt ? `, public at ${v.status.publishAt}` : ''})`);
};

const prompt = (n) => {
  const id = `day${pad(n)}`;
  return `Create lesson ${id} of the ".NET From Zero" YouTube Shorts series in this repo. This runs unattended: nobody will answer questions, so make sensible choices and finish.
Day ${n}: "${topics[n - 1]}". Next lesson: Day ${n + 1}: "${topics[n] ?? 'More C#'}". Earlier days: ${topics.slice(0, n - 1).map((t, i) => `${i + 1}. ${t}`).join('; ')}.

Follow README.md "Make the next lesson" and use src/lessons/day${pad(n - 1)} as the template. Read it and the components it uses before writing.
1. src/lessons/${id}/script.json: id "${id}", day ${n}, the title above, next {day: ${n + 1}, title}, targetSeconds 60, the previous day's voice, music seed ${n}. Beginner level, building only on earlier days. Shape: hook question, everyday analogy with a visual, code demo in the Editor with a Run, recap, outro "That's Day ${n}! See you in Day ${n + 1}: <next topic>!".
2. Run ${py} tools/build_audio.py ${id}. Fix every "cue not found" warning. The total must be 59 s or less; shorten the script if not.
3. src/lessons/${id}/Day${pad(n)}.tsx exporting Day${pad(n)}: reuse the existing components. Only change a shared component if you must, and never in a way that changes earlier lessons.
4. Register it in src/lessons/index.ts and add its row to the README lessons table.
5. npx tsc --noEmit must pass.
6. Render stills at every key beat (node tools/stills.mjs ${id} <frame> <frame> ...) and Read each PNG in out/stills. Fix overlaps, clipped or off-screen text, captions covering visuals and highlights on the wrong characters, then check again.
The C# shown must compile and print exactly what the terminal shows: prove it with dotnet new console -o .cache/csharp/${id} and dotnet run --project .cache/csharp/${id}. Run commands from the repo root. Do not render the full video, upload anything, or edit other lessons.`;
};

const main = async (uploadNow) => {
  const pub = published();
  if (uploadNow && Object.values(pub).some((p) => p.date === today())) return say('already uploaded today');
  const last = Math.max(...readdirSync('src/lessons').filter((d) => /^day\d+$/.test(d)).map((d) => Number(d.slice(3))));
  const n = pub[`day${pad(last)}`] ? last + 1 : last;
  const id = `day${pad(n)}`;
  if (!topics[n - 1]) fail(`no topic for day ${n}: add one to tools/curriculum.json`);
  const tl = `src/lessons/${id}/timeline.json`;
  const ready = () =>
    existsSync(`src/lessons/${id}/Day${pad(n)}.tsx`) &&
    existsSync(tl) &&
    json(tl).durationInFrames / json(tl).fps <= 61 &&
    readFileSync('src/lessons/index.ts', 'utf8').includes(`'${id}'`) &&
    sh(npx, ['tsc', '--noEmit']) === 0;
  if (!ready()) {
    rmSync(`out/${id}.mp4`, {force: true});
    say(`authoring ${id}: ${topics[n - 1]}`);
    spawnSync('claude', ['-p', '--permission-mode', 'acceptEdits', '--allowedTools', ALLOWED], {input: prompt(n), stdio: ['pipe', log, log], timeout: 60 * 60e3});
    if (!ready()) fail(`${id} is incomplete, too long, or does not typecheck`);
  }
  if (!existsSync(`out/${id}.mp4`) && sh('node', ['tools/lesson.mjs', id]) !== 0) fail(`render ${id}`);
  if (win) copyFileSync(`out/${id}.mp4`, path.join(path.parse(ROOT).root, `dotnet-from-zero-${id}.mp4`));
  if (uploadNow) await upload(id);
  else say(`${id} ready: out/${id}.mp4 (uploads on the next run)`);
};

const [cmd, arg] = process.argv.slice(2);
try {
  await (cmd === 'auth' ? auth() : cmd === 'upload' ? upload(arg) : main(cmd !== 'prepare'));
} catch (e) {
  fail(e.stack ?? e);
}
