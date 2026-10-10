"""Speech synthesis with phoneme timings.

Engines, in order of preference:
  1. kokoro  - Kokoro-82M neural TTS via kokoro-onnx (natural voice, phoneme durations)
  2. espeak  - espeak-ng command line (robotic, timings estimated)
  3. silent  - no audio, timings estimated from syllables (video still renders)
"""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT / "models"
CACHE_DIR = ROOT / ".cache" / "tts"
KOKORO_MODEL = MODEL_DIR / "kokoro-v1.0.onnx"
KOKORO_VOICES = MODEL_DIR / "voices-v1.0.bin"
# The v1.1 export of the English model reports per-phoneme durations (word timing + lip-sync)
KOKORO_MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.onnx"
KOKORO_VOICES_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin"

PUNCT = set(",.!?:;—…\"'()")


@dataclass
class Speech:
    audio: np.ndarray  # float32 mono
    sr: int
    phonemes: list[tuple[str, float, float]]  # (phoneme, start, end) seconds
    words: list[tuple[float, float]]  # spoken word spans (seconds)
    engine: str


def syllables(word: str) -> int:
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w:
        return 1
    if len(w) <= 2 and w.isalpha() and word.isupper():
        return len(w)  # spelled letters
    groups = re.findall(r"[aeiouy]+", w)
    n = len(groups)
    if w.endswith("e") and not w.endswith("le") and n > 1:
        n -= 1
    return max(1, n)


def _words_from_phonemes(phonemes: list[tuple[str, float, float]]) -> list[tuple[float, float]]:
    words: list[tuple[float, float]] = []
    cur: list[tuple[str, float, float]] = []

    def flush():
        voiced = [p for p in cur if p[0] not in PUNCT and p[0] not in "ˈˌ"]
        if voiced:
            words.append((voiced[0][1], voiced[-1][2]))
        elif cur:
            words.append((cur[0][1], cur[-1][2]))

    for p in phonemes:
        if p[0] == " ":
            flush()
            cur = []
        else:
            cur.append(p)
    flush()
    return words


# ---------------------------------------------------------------- kokoro
_kokoro = None


def ensure_kokoro_models(download: bool = True) -> bool:
    if KOKORO_MODEL.exists() and KOKORO_VOICES.exists():
        return True
    if not download:
        return False
    import urllib.request

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    for url, dest in ((KOKORO_MODEL_URL, KOKORO_MODEL), (KOKORO_VOICES_URL, KOKORO_VOICES)):
        if dest.exists():
            continue
        print(f"  downloading {dest.name} ...")
        tmp = dest.with_suffix(".part")
        urllib.request.urlretrieve(url, tmp)
        tmp.rename(dest)
    return True


def _get_kokoro():
    global _kokoro
    if _kokoro is None:
        from kokoro_onnx import Kokoro

        _kokoro = Kokoro(str(KOKORO_MODEL), str(KOKORO_VOICES))
    return _kokoro


def _voice_style(k, voice_cfg: dict):
    mix = voice_cfg.get("mix")
    if not mix:
        return voice_cfg.get("name", "am_puck")
    total = sum(mix.values())
    return sum(k.get_voice_style(name) * (w / total) for name, w in mix.items()).astype(np.float32)


def _kokoro_say(text: str, voice_cfg: dict) -> Speech:
    k = _get_kokoro()
    audio, sr, timings = k.create_timed(
        text,
        voice=_voice_style(k, voice_cfg),
        speed=float(voice_cfg.get("speed", 1.0)),
        lang=voice_cfg.get("lang", "en-us"),
        trim=True,
        sentence_pause=0.0,
        clause_pause=float(voice_cfg.get("clausePause", 0.12)),
    )
    phonemes = [(t.phoneme, float(t.start), float(t.end)) for t in timings]
    return Speech(np.asarray(audio, dtype=np.float32), sr, phonemes, _words_from_phonemes(phonemes), "kokoro")


# ---------------------------------------------------------------- espeak / silent
def _estimate_words(text: str, start: float, end: float) -> list[tuple[float, float]]:
    words = text.split()
    weights = np.array([syllables(w) + 0.35 for w in words], dtype=float)
    edges = start + np.concatenate([[0], np.cumsum(weights)]) / weights.sum() * (end - start)
    return [(float(edges[i]), float(edges[i + 1]) - 0.02) for i in range(len(words))]


def _fake_phonemes(words: list[tuple[float, float]]) -> list[tuple[str, float, float]]:
    """Plausible open/close mouth pattern for engines without timings."""
    out = []
    cycle = ["ɛ", "t", "ɑ", "n", "i", "m", "o", "s"]
    for wi, (a, b) in enumerate(words):
        n = max(2, int((b - a) / 0.08))
        for j in range(n):
            s = a + (b - a) * j / n
            out.append((cycle[(wi + j) % len(cycle)], s, a + (b - a) * (j + 1) / n))
        out.append((" ", b, b + 0.02))
    return out


def _espeak_say(text: str, voice_cfg: dict) -> Speech:
    import soundfile as sf

    exe = shutil.which("espeak-ng") or shutil.which("espeak")
    with tempfile.TemporaryDirectory() as td:
        wav = Path(td) / "s.wav"
        rate = int(165 * float(voice_cfg.get("speed", 1.0)))
        subprocess.run([exe, "-v", "en-us+m3", "-s", str(rate), "-w", str(wav), text], check=True)
        audio, sr = sf.read(wav, dtype="float32")
    if audio.ndim > 1:
        audio = audio.mean(1)
    env = np.abs(audio)
    idx = np.where(env > env.max() * 0.03)[0]
    audio = audio[max(0, idx[0] - int(0.02 * sr)) : idx[-1] + int(0.04 * sr)] if len(idx) else audio
    words = _estimate_words(text, 0.02, len(audio) / sr - 0.04)
    return Speech(audio, sr, _fake_phonemes(words), words, "espeak")


def _silent_say(text: str, voice_cfg: dict) -> Speech:
    sr = 24000
    dur = sum(syllables(w) for w in text.split()) * 0.19 / float(voice_cfg.get("speed", 1.0)) + 0.15
    words = _estimate_words(text, 0.05, dur - 0.05)
    return Speech(np.zeros(int(dur * sr), dtype=np.float32), sr, _fake_phonemes(words), words, "silent")


# ---------------------------------------------------------------- public API
def pick_engine(voice_cfg: dict) -> str:
    wanted = voice_cfg.get("engine", "kokoro")
    if wanted == "kokoro":
        try:
            import kokoro_onnx  # noqa: F401

            if ensure_kokoro_models(download=True):
                return "kokoro"
        except Exception as e:  # pragma: no cover - environment dependent
            print(f"  ! kokoro unavailable ({e}); falling back")
    if wanted in ("kokoro", "espeak") and (shutil.which("espeak-ng") or shutil.which("espeak")):
        return "espeak"
    return "silent"


def say(text: str, voice_cfg: dict, engine: str) -> Speech:
    key = hashlib.sha1(json.dumps([engine, text, voice_cfg, "v3"], sort_keys=True).encode()).hexdigest()[:16]
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cached = CACHE_DIR / f"{key}.npz"
    if cached.exists():
        z = np.load(cached, allow_pickle=False)
        ph = json.loads(str(z["phonemes"]))
        return Speech(z["audio"], int(z["sr"]), [tuple(p) for p in ph], [tuple(w) for w in json.loads(str(z["words"]))], engine)
    fn = {"kokoro": _kokoro_say, "espeak": _espeak_say, "silent": _silent_say}[engine]
    sp = fn(text, voice_cfg)
    np.savez(cached, audio=sp.audio, sr=sp.sr, phonemes=json.dumps(sp.phonemes), words=json.dumps(sp.words))
    return sp
