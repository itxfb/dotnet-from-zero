# .NET From Zero — programmatic YouTube Shorts

Each lesson is a 1080×1920, ~60 s video rendered entirely on your machine:
**Remotion** (React → video) for the visuals, **Kokoro-82M** (local neural TTS) for the voice,
and procedurally generated music + sound effects. No avatar services, no stock assets.

## Setup (once)

```bash
npm install
python -m venv .venv                     # Python 3.10–3.13 (kokoro-onnx has no 3.14 wheels yet)
.venv/Scripts/python -m pip install -r tools/requirements.txt   # lesson.mjs uses .venv automatically
```

The first audio build downloads the Kokoro voice model (~350 MB) into `models/`.
Remotion downloads its own Chrome Headless Shell on the first render
(or set `REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell`).

## Render a lesson

```bash
npm run lesson -- day01          # voice + music + timeline, then renders out/day01.mp4
```

That runs, in order:

```bash
python3 tools/build_audio.py day01
npx remotion still src/index.ts workspace-bg public/generated/workspace.png   # only if missing
npx remotion render src/index.ts day01 out/day01.mp4
```

Other useful commands:

```bash
npm run studio                     # live preview / scrub the timeline in the browser
npm run stills -- day01 300 690    # quick PNG previews of specific frames (out/stills)
npm run lesson -- day01 --skip-audio   # re-render visuals without re-voicing
```

## How it fits together

```
src/lessons/day01/script.json   narration (exact text), pronunciations, cue words, voice, music
        │  python3 tools/build_audio.py day01
        ▼
src/lessons/day01/timeline.json   frame-accurate scenes, word timings, cues, visemes (lip-sync)
public/lessons/day01/*.wav        narration (-15 LUFS) + music ducked under the voice
        │
src/lessons/day01/Day01.tsx     storyboard: camera shots, instructor gestures, diagrams, code, SFX
        ▼  npx remotion render
out/day01.mp4
```

Reusable building blocks (`src/components`):

| Component | What it does |
|---|---|
| `instructor/Rig.tsx` | the illustrated instructor (jointed arms, 5 hand shapes, eyes, brows, mouth) |
| `instructor/Instructor.tsx` | animates him: pose blending, pointing at screen positions, phoneme lip-sync, blinks, nods on stressed syllables, gaze |
| `instructor/poses.ts` | named poses: `rest`, `explain`, `openToViewer`, `shrug`, `wave`, `calm`, `presentRight`, … |
| `Studio.tsx` | camera: backdrop + instructor, shot moves, picture-in-picture card |
| `Module.tsx` | concept "keycaps" (`Module`), `QBadge` (?), `Glyph` (+ =), `Tag` |
| `Arrow.tsx` | self-drawing arrows with flowing pulses |
| `CodeEditor.tsx` | single-line editor with typing, autocomplete, highlights, Run + terminal (Day 1) |
| `Editor.tsx` | multi-line editor (Day 2+): `cs()` C# highlighter, line-by-line typing, column/block highlights with labels, in-place edits, repeated runs, execution focus |
| `Concepts.tsx` | `VarBox` (variable = labelled box), `CodeAnatomy` (one line of code with labelled parts), `Decision` (if/else diamond with two branches) |
| `Roadmap.tsx`, `EndCard.tsx`, `FloatingChips.tsx` | learning path, "DAY n ✓ / next" card, hook buzzwords |
| `Captions.tsx`, `SeriesBadge.tsx` | synced captions (keywords coloured), series badge |

Shots (`src/engine/direction.tsx`): `hero` (big, centred), `teach` (bottom-left, diagrams above),
`code` (PiP webcam card), `outro`.

## Lessons included

| Lesson | Title | Length |
|---|---|---|
| `day01` | What is .NET? | 59.6 s |
| `day02` | C# Basics: Variables | 52.6 s |
| `day03` | if & else: Making Decisions | 46.4 s |
| `day04` | Loops: Repeat Without Copy-Paste | 54.4 s |
| `day05` | Arrays | 48.6 s |
| `day06` | foreach | 42.6 s |
| `day07` | Lists | 37.6 s |
| `day08` | Methods | 39.0 s |
| `day09` | Parameters & Return Values | 34.2 s |
| `day10` | Classes & Objects | 36.3 s |
| `aitools-day01` | What Is an AI Coding Agent? | 44.2 s |
| `aitools-day02` | Slash Commands & Skills | 43.5 s |
| `aitools-day03` | Plugins: Share Your AI Setup | 42.5 s |
| `aitools-day04` | MCP: Give AI New Tools | 43.9 s |
| `aitools-day05` | Add Your First MCP Server | 37.8 s |
| `aitools-day06` | Subagents: Delegate the Work | 37.7 s |
| `aitools-day07` | Hooks: Automate Every Step | 41.5 s |
| `aitools-day08` | Run AI Agents in CI | 44.0 s |
| `aitools-day09` | Parallel Agents with Worktrees | 42.6 s |
| `aitools-day10` | Build Your Own MCP Server | 39.5 s |
| `tokens-day01` | What Is a Token? | 37.9 s |
| `tokens-day02` | The Context Window | 39.8 s |
| `tokens-day03` | Rules Files That Save Tokens | 39.0 s |
| `tokens-day04` | Memory: Teach It Once | 41.4 s |
| `tokens-day05` | Clear & Compact Your Chat | 36.5 s |
| `tokens-day06` | Short Prompts, Short Answers | 26.1 s |
| `tokens-day07` | Point to Files, Don't Paste | 27.9 s |
| `tokens-day08` | Switch to a Cheaper Model | 29.1 s |
| `tokens-day09` | Cut Costs with Prompt Caching | 29.4 s |
| `tokens-day10` | Use Subagents to Keep Context Clean | 31.3 s |
| `safeagents-day01` | Set Allow and Deny Permission Rules | 33.3 s |
| `safeagents-day02` | Keep Secrets Out of AI Context | 32.9 s |
| `safeagents-day03` | Block Dangerous Commands with a Hook | 34.3 s |
| `safeagents-day04` | Run Your Agent in a Sandbox | 30.6 s |
| `safeagents-day05` | Review Every Diff Before You Commit | 32.0 s |
| `safeagents-day06` | Spot Prompt Injection in a Repo File | 27.7 s |
| `safeagents-day07` | Vet an MCP Server Before You Install | 27.1 s |
| `safeagents-day08` | Give Agents Least-Privilege Tokens | 27.4 s |
| `safeagents-day09` | Run Agents in a Dev Container | 26.5 s |

## Make the next lesson (Day 4)

1. Copy the closest lesson folder, e.g. `src/lessons/day03` → `src/lessons/day04`, rename `Day03.tsx` → `Day04.tsx`
   (and the exported component to `Day04`). Delete the copied `timeline.json`.
   Day 2/3 are the best templates for code-heavy lessons (they use `Editor`).
2. Edit `script.json`: `id: "day04"`, `day: 4`, `title`, `next`, then the `scenes` → `lines`.
   - `text` is exactly what is said and shown in captions.
   - `pronounce` maps display text to how it should be spoken (".NET" → "dot net").
   - `keywords` colours terms in captions (`dotnet`, `csharp`, `aspnet`, `api`).
   - `cues` names a word/phrase inside a line, e.g. `"web": "web apps"`. The storyboard uses
     these names, so animations land exactly when the word is spoken.
   - For code read aloud, give a `say` field and set `"caption": false`.
3. Run `python3 tools/build_audio.py day04` — creates `timeline.json` and the audio, and prints
   the scene timings.
4. Edit `Day04.tsx`: keep the structure, change the content.
   - `shots`: which camera framing each scene uses.
   - `direction.gestures`: a pose name or `{point: [x, y]}` (screen pixels) at a cue.
   - Visuals: `<Module …>`, `<Arrow …>`, `<CodeEditor …>`, `<Roadmap …>`, `<EndCard …>` with
     `appear={c('cueName')}`; cue refs accept offsets like `'web+6'` or `'line:apps:end-10'`.
5. Register it in `src/lessons/index.ts`:
   `lesson('day04', day04Timeline, Day04)` (plus the two imports).
6. `npm run lesson -- day04`

## Daily automation (GitHub Actions)

`.github/workflows/daily.yml` runs at 10:00 and 20:00 Pakistan time (05/15:00 UTC) on GitHub, so no
PC needs to be on. Each run makes and uploads **one** lesson, at most 2 a day (`MAX_PER_DAY` in `tools/daily.mjs`):

1. `tools/curriculum.json` lists the series in order (.NET From Zero → AI Dev Tools → Token Saver → …).
   The next lesson is the first one not yet in `published.json`. Lesson ids are `<prefix><NN>`, e.g.
   `day07`, `aitools-day01`.
2. When the list is about to run out, Claude researches current trends in AI-assisted development
   (web search) and appends a new 10-lesson series of hands-on "do / build X" topics, so it keeps going forever.
3. Claude Code (`claude -p`) writes the lesson (at most 40 s, `MAX_SECONDS`): frame 0 shows the payoff with a
   hook line, then the demo, a takeaway, and an outro that asks a comment question. It checks stills, verifies
   commands against official docs and proves any C# output with `dotnet run`.
4. Claude also writes `youtube.json` (hook title, short description, trending hashtags, search tags, first comment).
5. It renders, uploads to YouTube as **public** with that metadata, and records the upload in `published.json`.
6. Every uploaded video is added to its series playlist (created if missing) and gets its first comment.
   Older uploads are added on the next run, so the playlists fill in by themselves.

Every Sunday at 12:00 Pakistan time (07:00 UTC) the workflow runs `compile`: each finished series that
has no long video yet is rendered, joined into one video with chapters (`<prefix>-all`), uploaded and
added to the series playlist.

The workflow then commits the new lesson back to this repo and attaches the mp4 + log to the run.
A lesson that fails its checks is not uploaded; the next run finishes it.

**Run it by hand:** Actions → *Daily lesson* → *Run workflow*, with mode `run` (make + upload today's),
`prepare` (make the next lesson without uploading), `compile` (long videos for finished series) or `check` (test the Claude login).
To change what comes next, edit `tools/curriculum.json` (add, remove or reorder series and topics).

**Secrets** (Settings → Secrets and variables → Actions): `CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`),
`YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN` (from `node tools/daily.mjs auth`, which saves
`.secrets/token.json` locally). The sign-in asks for `youtube.upload` and `youtube.force-ssl`, which playlists
and comments need: after changing scopes, run `auth` again and paste the new token into `YT_REFRESH_TOKEN`.

Locally the same script still works: `node tools/daily.mjs [prepare | plan | compile | upload <id> | auth]` (log: `out/daily.log`).
The consent screen's home page and privacy policy are served by GitHub Pages from `docs/`.

## Tuning

- Voice: `script.json → voice.name` (e.g. `am_puck`, `am_michael`, `am_fenrir`, `bm_george`),
  or blend: `"mix": {"am_puck": 0.7, "am_michael": 0.3}`; `speed` 0.9–1.15.
- Length: `targetSeconds` — the builder re-times pauses (and speed if needed) to land near it.
- Pauses: `timing` block (sentence / line / scene gaps); per-scene `holdAfter` for silent beats.
- Music: `music.enabled`, `bpm`, `seed` (new seed = new arrangement), `lufs`, `duckDb`.
- No TTS available? `--engine espeak` or `--engine silent` still produces a fully timed video;
  you can then record your own narration and replace `public/lessons/<id>/narration.wav`.

## Licensing notes

Remotion is free for individuals and companies with ≤ 3 employees; larger companies need a
Remotion company license. Kokoro-82M weights are Apache-2.0. Music and sound effects are
generated by this project's code. Fonts: Lexend and JetBrains Mono (SIL OFL).
