#!/usr/bin/env python3
"""Build narration, music and the frame-accurate timeline for one lesson.

    python3 tools/build_audio.py day01 [--engine kokoro|espeak|silent] [--voice am_puck] [--speed 1.0]

Reads   src/lessons/<id>/script.json
Writes  src/lessons/<id>/timeline.json           (scenes, lines, word timings, cues, lip-sync)
        public/lessons/<id>/narration.wav         (voice, loudness-normalised)
        public/lessons/<id>/music.wav             (procedural bed, ducked under the voice)
        public/sfx/*.wav                          (shared UI sounds, created once)
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

sys.path.insert(0, str(Path(__file__).resolve().parent))
from audiolib import lipsync, music, sfx, tts  # noqa: E402
from audiolib.align import align_words  # noqa: E402
from audiolib.text import Sentence, build_sentences, find_phrase  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
SR = 48000


@dataclass
class Item:
    scene: str
    line: dict
    sentence: Sentence
    speech: tts.Speech
    last_in_line: bool
    last_in_scene: bool
    start: float = 0.0

    @property
    def dur(self) -> float:
        return len(self.speech.audio) / self.speech.sr


def assign_token_times(sentence: Sentence, speech: tts.Speech) -> None:
    counts = [len(t.spoken_words) for t in sentence.tokens]
    spoken = [w for t in sentence.tokens for w in t.spoken_words]
    spans = align_words(speech.phonemes, spoken) if speech.engine == "kokoro" else None
    if spans is None:
        spans = speech.words if len(speech.words) == len(spoken) else None
    if spans is not None:
        i = 0
        for tok, c in zip(sentence.tokens, counts):
            tok.start, tok.end = spans[i][0], spans[i + c - 1][1]
            i += c
        return
    print(f"  ! no word timing for {sentence.spoken_text!r}; estimating")
    words = speech.words
    a = words[0][0] if words else 0.03
    b = words[-1][1] if words else len(speech.audio) / speech.sr - 0.03
    w = np.array([sum(tts.syllables(x) for x in t.spoken_words) + 0.35 for t in sentence.tokens])
    edges = a + np.concatenate([[0], np.cumsum(w)]) / w.sum() * (b - a)
    for k, tok in enumerate(sentence.tokens):
        tok.start, tok.end = float(edges[k]), float(edges[k + 1]) - 0.02


def synthesize(script: dict, voice: dict, engine: str) -> list[Item]:
    items: list[Item] = []
    pron, kws = script.get("pronounce", {}), script.get("keywords", {})
    for scene in script["scenes"]:
        for li, line in enumerate(scene["lines"]):
            sents = build_sentences(line, pron, kws)
            line["_sentences"] = sents
            for si, s in enumerate(sents):
                sp = tts.say(s.spoken_text, voice, engine)
                assign_token_times(s, sp)
                items.append(Item(scene["id"], line, s, sp, si == len(sents) - 1, li == len(scene["lines"]) - 1 and si == len(sents) - 1))
    return items


def layout(items: list[Item], script: dict, gap_scale: float) -> float:
    tm = script["timing"]
    scenes = {s["id"]: s for s in script["scenes"]}
    t = tm["leadIn"]
    for it in items:
        it.start = t
        t += it.dur
        if it.last_in_scene:
            gap = tm["sceneGap"] * gap_scale + scenes[it.scene].get("holdAfter", 0.0)
        elif it.last_in_line:
            gap = it.line.get("pauseAfter", tm["lineGap"] * gap_scale)
        else:
            gap = (tm["colonGap"] if it.sentence.ends_with_colon else tm["sentenceGap"]) * gap_scale
        t += gap
    last = items[-1]
    return last.start + last.dur + tm["tail"]


def fade(x: np.ndarray, ms: float = 8) -> np.ndarray:
    n = int(ms / 1000 * SR)
    if len(x) > 2 * n:
        ramp = np.linspace(0, 1, n)
        x = x.copy()
        x[:n] *= ramp
        x[-n:] *= ramp[::-1]
    return x


def to_48k(x: np.ndarray, sr: int) -> np.ndarray:
    if sr == SR:
        return x
    from math import gcd

    g = gcd(SR, sr)
    return resample_poly(x, SR // g, sr // g).astype(np.float32)


def loudness_normalize(x: np.ndarray, target_lufs: float, peak_db: float = -1.0) -> np.ndarray:
    import pyloudnorm as pyln

    meter = pyln.Meter(SR)
    lufs = meter.integrated_loudness(x)
    if not np.isfinite(lufs):
        return x
    y = x * 10 ** ((target_lufs - lufs) / 20)
    peak = np.abs(y).max()
    limit = 10 ** (peak_db / 20)
    if peak > limit:  # gentle soft-knee limiting of the few loudest peaks
        y = np.sign(y) * np.where(np.abs(y) > limit * 0.8, limit * 0.8 + (limit * 0.2) * np.tanh((np.abs(y) - limit * 0.8) / (limit * 0.2)), np.abs(y))
    return y.astype(np.float32)


def speech_activity(voice: np.ndarray) -> np.ndarray:
    hop = int(0.01 * SR)
    frames = len(voice) // hop + 1
    rms = np.array([np.sqrt(np.mean(voice[i * hop : (i + 1) * hop] ** 2) + 1e-12) if len(voice[i * hop : (i + 1) * hop]) else 0.0 for i in range(frames)])
    active = (rms > rms.max() * 0.04).astype(float)
    env = np.zeros(frames)
    for i in range(frames):
        prev = env[i - 1] if i else 0.0
        k = 0.12 if active[i] > prev else 0.018  # ~80ms attack, ~550ms release
        env[i] = prev + (active[i] - prev) * k
    return np.repeat(env, hop)[: len(voice)]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("lesson")
    ap.add_argument("--engine")
    ap.add_argument("--voice")
    ap.add_argument("--speed", type=float)
    ap.add_argument("--no-music", action="store_true")
    args = ap.parse_args()

    lesson_dir = ROOT / "src" / "lessons" / args.lesson
    script = json.loads((lesson_dir / "script.json").read_text())
    fps = int(script.get("fps", 30))
    target = float(script.get("targetSeconds", 60))
    voice = dict(script.get("voice", {}))
    if args.engine:
        voice["engine"] = args.engine
    if args.voice:
        voice["name"] = args.voice
        voice.pop("mix", None)
    if args.speed:
        voice["speed"] = args.speed

    engine = tts.pick_engine(voice)
    print(f"[{script['id']}] TTS engine: {engine}  voice: {voice.get('mix') or voice.get('name')}  speed: {voice.get('speed', 1.0)}")

    # --- synthesize, then fit the timeline to the target length -------------
    items = synthesize(script, voice, engine)
    total = layout(items, script, 1.0)
    if total > target + 1.5 and not args.speed:
        speech = sum(i.dur for i in items)
        new_speed = float(np.clip(voice.get("speed", 1.0) * speech / max(speech - (total - target), 1), 1.0, 1.15))
        print(f"  {total:.1f}s is long; re-voicing at speed {new_speed:.2f}")
        voice["speed"] = round(new_speed, 3)
        items = synthesize(script, voice, engine)
        total = layout(items, script, 1.0)
    for scale in (0.9, 0.8, 0.7):
        if total <= target + 1.5:
            break
        total = layout(items, script, scale)
    for scale in (1.15, 1.3, 1.45):
        if total >= target - 1.5:
            break
        total = layout(items, script, scale)

    n_frames = int(round(total * fps))
    total = n_frames / fps

    # --- narration track ------------------------------------------------------
    voice_track = np.zeros(int(total * SR) + SR, dtype=np.float32)
    phonemes: list[tuple[str, float, float]] = []
    for it in items:
        a = fade(to_48k(it.speech.audio, it.speech.sr))
        s = int(round(it.start * SR))
        voice_track[s : s + len(a)] += a[: len(voice_track) - s]
        phonemes += [(p, it.start + st, it.start + en) for p, st, en in it.speech.phonemes]
    voice_track = voice_track[: int(total * SR)]
    if engine != "silent":
        voice_track = loudness_normalize(voice_track, -15.0)

    out_audio = ROOT / "public" / "lessons" / script["id"]
    out_audio.mkdir(parents=True, exist_ok=True)
    sf.write(out_audio / "narration.wav", voice_track, SR, subtype="PCM_16")

    # --- music ----------------------------------------------------------------
    music_rel = None
    mcfg = script.get("music", {})
    if mcfg.get("enabled", True) and not args.no_music:
        bed = music.make_music(total, bpm=mcfg.get("bpm", 96), seed=mcfg.get("seed", 1))
        bed = loudness_normalize(bed, mcfg.get("lufs", -28.0), peak_db=-6)
        duck_db = mcfg.get("duckDb", 6.0)
        env = speech_activity(voice_track) if engine != "silent" else np.zeros(len(bed))
        gain = 10 ** (-duck_db * env[: len(bed)] / 20)
        bed = (bed * gain[:, None]).astype(np.float32)
        sf.write(out_audio / "music.wav", bed, SR, subtype="PCM_16")
        music_rel = f"lessons/{script['id']}/music.wav"

    sfx.write_all(ROOT / "public" / "sfx")

    # --- timeline -------------------------------------------------------------
    def fr(t: float) -> int:
        return int(round(t * fps))

    scene_ids = [s["id"] for s in script["scenes"]]
    first_start = {sid: min(i.start for i in items if i.scene == sid) for sid in scene_ids}
    bounds = [0] + [fr(first_start[sid] - script["timing"]["sceneLead"]) for sid in scene_ids[1:]] + [n_frames]
    scenes = [{"id": sid, "from": bounds[i], "to": bounds[i + 1]} for i, sid in enumerate(scene_ids)]

    cues: dict[str, int] = {}
    lines = []
    for scene in script["scenes"]:
        cues[f"scene:{scene['id']}"] = next(s["from"] for s in scenes if s["id"] == scene["id"])
        cues[f"scene:{scene['id']}:end"] = next(s["to"] for s in scenes if s["id"] == scene["id"])
        for line in scene["lines"]:
            its = [i for i in items if i.line is line]
            toks = []
            for it in its:
                for t in it.sentence.tokens:
                    toks.append((t, it.start))
            words = [
                {"text": t.display, "from": fr(base + t.start), "to": max(fr(base + t.start) + 1, fr(base + t.end)), "kw": t.keyword}
                for t, base in toks
            ]
            lf, lt = fr(its[0].start), fr(its[-1].start + its[-1].dur)
            cues[f"line:{line['id']}"] = lf
            cues[f"line:{line['id']}:end"] = lt
            for name, phrase in line.get("cues", {}).items():
                idx = find_phrase([t for t, _ in toks], phrase)
                if idx is None:
                    print(f"  ! cue '{name}': phrase {phrase!r} not found in line '{line['id']}'")
                    continue
                cues[name] = words[idx]["from"]
            lines.append({
                "id": line["id"], "scene": scene["id"], "from": lf, "to": lt,
                "text": line["text"], "caption": line.get("caption", True), "words": words,
            })

    amp = lipsync.amplitude_per_frame(voice_track, SR, n_frames, fps)
    timeline = {
        "lessonId": script["id"],
        "fps": fps,
        "width": 1080,
        "height": 1920,
        "durationInFrames": n_frames,
        "engine": engine,
        "voice": voice,
        "meta": {"series": script["series"], "day": script["day"], "title": script["title"], "next": script.get("next")},
        "audio": {"narration": f"lessons/{script['id']}/narration.wav", "music": music_rel},
        "scenes": scenes,
        "lines": lines,
        "cues": cues,
        "visemes": lipsync.visemes_per_frame(sorted(phonemes, key=lambda p: p[1]), n_frames, fps),
        "amp": amp,
        "beats": lipsync.stress_beats(phonemes, fps),
    }
    (lesson_dir / "timeline.json").write_text(json.dumps(timeline, separators=(",", ":")))

    print(f"  total {total:.2f}s ({n_frames} frames)")
    for s in scenes:
        print(f"    {s['id']:<9} {s['from'] / fps:6.2f}s - {s['to'] / fps:6.2f}s")
    print(f"  wrote {lesson_dir.relative_to(ROOT)}/timeline.json and public/lessons/{script['id']}/*.wav")


if __name__ == "__main__":
    main()
