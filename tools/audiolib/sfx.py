"""Small UI sound effects, synthesized (no samples). Written once to public/sfx/."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000


def _norm(x: np.ndarray, peak: float) -> np.ndarray:
    return (x / (np.abs(x).max() + 1e-9) * peak).astype(np.float32)


def whoosh(seed: int = 3) -> np.ndarray:
    rng = np.random.default_rng(seed)
    dur = 0.62
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # time-varying one-pole low-pass sweeping up then down
    cutoff = 350 + 3800 * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.6
    alpha = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros(n)
    acc = 0.0
    for i in range(n):
        acc += alpha[i] * (noise[i] - acc)
        y[i] = acc
    hb, ha = signal.butter(2, 180 / (SR / 2), "high")
    y = signal.lfilter(hb, ha, y)
    env = np.sin(np.pi * np.clip(t / dur, 0, 1) ** 0.8) ** 2
    y *= env
    pan = np.clip(t / dur, 0, 1)
    stereo = np.stack([y * np.cos(pan * np.pi / 2), y * np.sin(pan * np.pi / 2)], axis=1)
    return _norm(stereo, 0.5)


def pop() -> np.ndarray:
    dur = 0.16
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 420 + 380 * (1 - np.exp(-t / 0.02))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.045) * np.minimum(t / 0.002, 1)
    x += 0.15 * np.sin(2 * ph) * np.exp(-t / 0.02)
    return _norm(x, 0.45)


def key(seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    dur = 0.05
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    bb, ba = signal.butter(2, [1800 / (SR / 2), 7000 / (SR / 2)], "band")
    click = signal.lfilter(bb, ba, noise) * np.exp(-t / 0.006)
    body = np.sin(2 * np.pi * (180 + 40 * rng.random()) * t) * np.exp(-t / 0.012) * 0.6
    return _norm(click + body, 0.35 + 0.1 * rng.random())


def chime() -> np.ndarray:
    dur = 1.4
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for start, f in ((0.0, 1046.5), (0.11, 1568.0)):  # C6 then G6
        s = int(start * SR)
        tt = t[: n - s]
        tone = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2.01 * tt) + 0.12 * np.sin(2 * np.pi * f * 3.98 * tt))
        out[s:] += tone * np.exp(-tt / 0.38) * np.minimum(tt / 0.003, 1)
    return _norm(out, 0.4)


def write_all(dest: Path, force: bool = False) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    items = {"whoosh.wav": whoosh, "pop.wav": pop, "chime.wav": chime}
    for i in range(4):
        items[f"key{i + 1}.wav"] = (lambda s=i: key(10 + s))
    for name, fn in items.items():
        p = dest / name
        if force or not p.exists():
            sf.write(p, fn(), SR, subtype="PCM_16")
