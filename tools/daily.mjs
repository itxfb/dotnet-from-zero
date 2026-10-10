#!/usr/bin/env node
/**
 * Daily lesson: author the next lesson with Claude Code, render it, upload it to YouTube.
 *   node tools/daily.mjs                make + upload the next lesson (no-op once MAX_PER_DAY are up today)
 *   node tools/daily.mjs auth           one-time Google sign-in -> .secrets/token.json
 *   node tools/daily.mjs upload day04   upload an already-rendered lesson
 *   node tools/daily.mjs prepare        author + render the next lesson now, upload on the next run
 *   node tools/daily.mjs plan           have Claude research trends and append a new series to the curriculum
 * Series run in the order of tools/curriculum.json; when it runs out, Claude plans a new trending series.
 * One upload per run, at most MAX_PER_DAY a day.   Uploads: published.json   Log: out/daily.log
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
const ALLOWED = `Read,Write,Edit,Glob,Grep,WebSearch,WebFetch,Bash(node:*),Bash(npx tsc:*),Bash(${py}:*),Bash(dotnet:*)`;
const CURRICULUM = 'tools/curriculum.json';
const MAX_PER_DAY = 3;

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
const queue = () => json(CURRICULUM).flatMap((s) => s.topics.map((title, i) => ({...s, title, day: i + 1, id: `${s.prefix}${pad(i + 1)}`})));
const {YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN, ...claudeEnv} = process.env;
const claude = (prompt, tools, minutes) =>
  spawnSync('claude', ['-p', '--permission-mode', 'acceptEdits', '--allowedTools', tools], {input: prompt, stdio: ['pipe', log, log], timeout: minutes * 60e3, env: claudeEnv});
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
  const s = queue().find((l) => l.id === id);
  let y = {};
  try {
    y = json(`src/lessons/${id}/youtube.json`);
  } catch {}
  const clean = (t) => t.replace(/[<>]/g, '');
  const description = y.description ?? [`Day ${s.day} of ${s.name}: ${s.about}. New shorts every day.`, meta.next ? `Next: ${meta.next.title}.` : '', '', s.hashtags].join('\n');
  const video = readFileSync(`out/${id}.mp4`);
  const body = {
    snippet: {
      title: clean(`${y.title ?? `${meta.title} | ${s.name} Day ${s.day}`} #Shorts`).slice(0, 100),
      description: clean(/#shorts/i.test(description) ? description : `${description} #shorts`).slice(0, 4900),
      tags: [...new Set([...(y.tags ?? []), ...s.tags, clean(meta.title)])].slice(0, 20),
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

const prompt = (q, pos) => {
  const l = q[pos];
  const next = q[pos + 1];
  const same = next.prefix === l.prefix;
  const comp = l.id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');
  const earlier = q.filter((x) => x.prefix === l.prefix && x.day < l.day).map((x) => `${x.day}. ${x.title}`).join('; ');
  return `Create lesson ${l.id} for a YouTube Shorts channel of short beginner lessons. This runs unattended: nobody will answer questions, so make sensible choices and finish.
Series "${l.name}" (${l.about}), Day ${l.day}: "${l.title}". ${same ? `Next lesson: Day ${next.day}: "${next.title}".` : `This is the last lesson of the series; the next video starts the new series "${next.name}" with Day 1: "${next.title}".`}
Earlier days of this series: ${earlier || 'none, so the hook also introduces the series'}.

Follow README.md "Make the next lesson" and use src/lessons/${q[pos - 1].id} as the template. Read it and the components it uses before writing.
1. src/lessons/${l.id}/script.json: id "${l.id}", series "${l.badge}", day ${l.day}, title "${l.title}", next {day: ${next.day}, title: "${next.title}"}, targetSeconds 60, the template's voice, music seed ${pos + 1}. Beginner level, building only on earlier days of this series. Shape: hook question, everyday analogy with a visual, a demo (code, config or terminal) in the Editor with a Run, recap, outro ${same ? `"That's Day ${l.day}! See you in Day ${next.day}: <next topic>!"` : `"That's the end of ${l.name}! Next up, a new series: ${next.name}!"`}.
2. Run ${py} tools/build_audio.py ${l.id}. Fix every "cue not found" warning. The total must be 59 s or less; shorten the script if not.
3. src/lessons/${l.id}/${comp}.tsx exporting ${comp}: reuse the existing components. Only change a shared component if you must, and never in a way that changes earlier lessons.
4. Register it in src/lessons/index.ts and add its row to the README lessons table.
5. npx tsc --noEmit must pass.
6. Render stills at every key beat (node tools/stills.mjs ${l.id} <frame> <frame> ...) and Read each PNG in out/stills. Fix overlaps, clipped or off-screen text, captions covering visuals and highlights on the wrong characters, then check again.
7. src/lessons/${l.id}/youtube.json: {"title", "description", "tags"} for the upload. title: at most 70 characters, a curiosity hook that contains the main search keyword (no hashtags; "#Shorts" is added for you). description: concise and inviting: a one-line hook, 2-3 short lines (or ✅ bullets) on what the viewer learns, "Day ${l.day} of ${l.name}" plus what comes next, a short call to follow for a new short every day, then one line of 5-8 hashtags. Use WebSearch to pick hashtags that are popular right now for this topic on YouTube Shorts, and always include #shorts. tags: 8-15 search phrases people actually type. Only claim what the video shows; no "<" or ">" characters.
Everything shown must be correct for today's versions: check official docs with WebSearch/WebFetch for any command, config or API you are not sure about. Set the Editor's filename, lang and command props to match the demo (e.g. ".mcp.json", lang "JSON", command "claude mcp list"). Any C# must compile and print exactly what the terminal shows: prove it with dotnet new console -o .cache/csharp/${l.id} and dotnet run --project .cache/csharp/${l.id}. Run commands from the repo root. Do not render the full video, upload anything, or edit other lessons.`;
};

const plan = () => {
  const before = readFileSync(CURRICULUM, 'utf8');
  const n = queue().length;
  say('planning a new series from current trends');
  claude(
    `Plan the next series for a YouTube Shorts channel of short beginner lessons for developers. This runs unattended: nobody will answer questions, so make sensible choices and finish.
Series so far (never repeat these topics): ${json(CURRICULUM).map((s) => `${s.name}: ${s.topics.join('; ')}`).join(' | ')}.
Use WebSearch and WebFetch to find what developers are talking about right now (the last two weeks) in AI-assisted software development: AI coding agents and assistants, MCP and agent tooling, prompting, token and cost efficiency, new model and tool releases. Pick a theme with clear demand that can be taught with short code, config or terminal demos.
Append ONE new object to the JSON array in ${CURRICULUM}, in exactly the same shape as the existing entries: name (2-4 words), badge (the name in capitals, at most 16 characters), prefix (a new lowercase slug followed by "-day", e.g. "agents-day"), about (one short line), tags (5-8), hashtags (4, space separated), topics (exactly 10 titles of at most 40 characters, from basics to advanced). Edit nothing else.`,
    'Read,Edit,WebSearch,WebFetch',
    30,
  );
  try {
    const q = queue();
    if (q.length > n && new Set(q.map((l) => l.id)).size === q.length && q.every((l) => /^[a-z0-9-]+$/.test(l.id) && l.name && l.badge && l.about && l.tags && l.hashtags)) return;
  } catch {}
  writeFileSync(CURRICULUM, before);
  fail(`planning did not add a valid series to ${CURRICULUM}`);
};

const main = async (uploadNow) => {
  const done = Object.values(published()).filter((p) => p.date === today()).length;
  if (uploadNow && done >= MAX_PER_DAY) return say(`${done} videos already uploaded today`);
  const next = () => queue().findIndex((l) => !published()[l.id]);
  if (next() < 0 || next() === queue().length - 1) plan();
  const q = queue();
  const pos = next();
  const l = q[pos];
  const dir = `src/lessons/${l.id}`;
  const tl = `${dir}/timeline.json`;
  const ready = () =>
    existsSync(tl) &&
    readdirSync(dir).some((f) => f.endsWith('.tsx')) &&
    json(tl).durationInFrames / json(tl).fps <= 61 &&
    readFileSync('src/lessons/index.ts', 'utf8').includes(`'${l.id}'`) &&
    sh(npx, ['tsc', '--noEmit']) === 0;
  if (!ready()) {
    rmSync(`out/${l.id}.mp4`, {force: true});
    say(`authoring ${l.id}: ${l.name}, Day ${l.day}: ${l.title}`);
    claude(prompt(q, pos), ALLOWED, 60);
    if (!ready()) fail(`${l.id} is incomplete, too long, or does not typecheck`);
  }
  if (!existsSync(`out/${l.id}.mp4`) && sh('node', ['tools/lesson.mjs', l.id]) !== 0) fail(`render ${l.id}`);
  if (win) copyFileSync(`out/${l.id}.mp4`, path.join(path.parse(ROOT).root, `dotnet-from-zero-${l.id}.mp4`));
  if (uploadNow) await upload(l.id);
  else say(`${l.id} ready: out/${l.id}.mp4 (uploads on the next run)`);
};

const [cmd, arg] = process.argv.slice(2);
try {
  await (cmd === 'auth' ? auth() : cmd === 'upload' ? upload(arg) : cmd === 'plan' ? plan() : main(cmd !== 'prepare'));
} catch (e) {
  fail(e.stack ?? e);
}
