"""Original background music, synthesized from scratch (no samples, no licensing).

A calm "tech tutorial" bed: warm detuned pad, plucked arpeggio with ping-pong
delay, soft sub bass and a very light beat. Four chords (Am9 - Fmaj9 - Cmaj9 - G6/9),
two bars each. Everything is deterministic for a given seed.
"""

from __future__ import annotations

import numpy as np
from scipy import signal

SR = 48000


def mtof(m: float) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


def _saw(freq: float, t: np.ndarray, phase: float, harmonics: int = 10) -> np.ndarray:
    out = np.zeros_like(t)
    for k in range(1, harmonics + 1):
        if freq * k > SR * 0.45:
            break
        out += np.sin(2 * np.pi * freq * k * t + phase * k) / k
    return out


def _env(n: int, attack: float, release: float, hold: float) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    a = a * a * (3 - 2 * a)  # smoothstep attack
    r = np.clip(1 - (t - hold) / max(release, 1e-4), 0, 1)
    return a * np.where(t > hold, r * r, 1.0)


def _add(buf: np.ndarray, start: int, x: np.ndarray, pan: float = 0.0, gain: float = 1.0):
    if start >= len(buf):
        return
    x = x[: len(buf) - start]
    l = np.cos((pan + 1) * np.pi / 4) * gain
    r = np.sin((pan + 1) * np.pi / 4) * gain
    buf[start : start + len(x), 0] += x * l
    buf[start : start + len(x), 1] += x * r


CHORDS = [  # (bass midi, pad voicing)
    (45, [60, 64, 67, 71]),  # Am9
    (41, [57, 60, 64, 67]),  # Fmaj9
    (48, [55, 59, 62, 64]),  # Cmaj9
    (43, [59, 62, 64, 69]),  # G6/9
]


def make_music(duration: float, bpm: float = 96, seed: int = 1) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = int(duration * SR)
    beat = 60.0 / bpm
    bar = 4 * beat
    chord_len = 2 * bar
    n_chords = int(np.ceil(duration / chord_len)) + 1

    pad = np.zeros((n, 2))
    arp = np.zeros((n, 2))
    bass = np.zeros((n, 2))
    drums = np.zeros((n, 2))

    # ------------------------------------------------------------ pad
    for c in range(n_chords):
        start = int(c * chord_len * SR)
        if start >= n:
            break
        _, notes = CHORDS[c % len(CHORDS)]
        seg_len = int((chord_len + 1.6) * SR)
        t = np.arange(seg_len) / SR
        env = _env(seg_len, attack=0.9 if c else 1.6, release=1.6, hold=chord_len)
        for i, m in enumerate(notes):
            for d, pan in ((-7, -0.6), (0, 0.0), (7, 0.6)):
                f = mtof(m) * 2 ** (d / 1200)
                x = _saw(f, t, rng.uniform(0, 2 * np.pi), harmonics=9)
                _add(pad, start, x * env, pan=pan * (0.6 + 0.1 * i), gain=0.055)
    b, a = signal.butter(2, 1700 / (SR / 2), "low")
    pad = signal.lfilter(b, a, pad, axis=0)

    # ------------------------------------------------------------ arpeggio (8th notes)
    step = beat / 2
    pattern = [0, 1, 2, 3, 2, 1, 3, 1]
    pl_len = int(0.7 * SR)
    tp = np.arange(pl_len) / SR
    n_steps = int(duration / step)
    for k in range(n_steps):
        t0 = k * step
        c = int(t0 // chord_len)
        _, notes = CHORDS[c % len(CHORDS)]
        m = notes[pattern[k % len(pattern)]] + 12
        f = mtof(m)
        vel = 0.75 + 0.25 * rng.random()
        if k % 8 == 0:
            vel *= 1.15
        env = np.minimum(tp / 0.004, 1) * np.exp(-tp / 0.2)
        x = (np.sin(2 * np.pi * f * tp) + 0.22 * np.sin(4 * np.pi * f * tp) + 0.06 * np.sin(6 * np.pi * f * tp)) * env
        _add(arp, int(t0 * SR), x, pan=0.25 * np.sin(k * 0.7), gain=0.05 * vel)
    # ping-pong delay (dotted eighth)
    dly = int(0.75 * beat * SR)
    wet = np.zeros_like(arp)
    src = arp.copy()
    for tap in range(1, 5):
        g = 0.38**tap
        shifted = np.zeros_like(src)
        shifted[tap * dly :] = src[: n - tap * dly] if n > tap * dly else 0
        ch = tap % 2
        wet[:, ch] += (shifted[:, 0] + shifted[:, 1]) * 0.5 * g
    b, a = signal.butter(2, 3200 / (SR / 2), "low")
    arp = arp + signal.lfilter(b, a, wet, axis=0)

    # ------------------------------------------------------------ bass + drums
    kick_times: list[float] = []
    n_beats = int(duration / beat)
    bl = int(0.5 * SR)
    tb = np.arange(bl) / SR
    for i in range(n_beats):
        t0 = i * beat
        bar_i = int(t0 // bar)
        pos = i % 4
        c = int(t0 // chord_len)
        root = CHORDS[c % len(CHORDS)][0]
        if bar_i >= 2 and pos in (0, 2):  # bass on 1 and 3
            f = mtof(root)
            env = np.minimum(tb / 0.01, 1) * np.exp(-tb / 0.32)
            x = np.tanh(1.4 * (np.sin(2 * np.pi * f * tb) + 0.25 * np.sin(4 * np.pi * f * tb))) * env
            _add(bass, int(t0 * SR), x, gain=0.16)
        if bar_i >= 4 and pos in (0, 2):  # soft kick
            kl = int(0.3 * SR)
            tk = np.arange(kl) / SR
            freq = 48 + 72 * np.exp(-tk / 0.035)
            ph = 2 * np.pi * np.cumsum(freq) / SR
            x = np.sin(ph) * np.exp(-tk / 0.16)
            _add(drums, int(t0 * SR), x, gain=0.22)
            kick_times.append(t0)
        if bar_i >= 4 and pos in (1, 3):  # brushed snare
            sl = int(0.25 * SR)
            ts = np.arange(sl) / SR
            noise = rng.standard_normal(sl)
            bb, ba = signal.butter(2, [1400 / (SR / 2), 5200 / (SR / 2)], "band")
            x = signal.lfilter(bb, ba, noise) * np.exp(-ts / 0.075)
            _add(drums, int(t0 * SR), x, gain=0.05, pan=0.1)
        if bar_i >= 2:  # off-beat hats
            hl = int(0.06 * SR)
            th = np.arange(hl) / SR
            noise = rng.standard_normal(hl)
            hb, ha = signal.butter(2, 7000 / (SR / 2), "high")
            x = signal.lfilter(hb, ha, noise) * np.exp(-th / 0.018)
            _add(drums, int((t0 + beat / 2) * SR), x, gain=0.025 * (0.8 + 0.4 * rng.random()), pan=-0.3)

    # sidechain: pad/arp breathe with the kick
    sc = np.ones(n)
    for kt in kick_times:
        s = int(kt * SR)
        ln = min(int(0.35 * SR), n - s)
        tt = np.arange(ln) / SR
        sc[s : s + ln] = np.minimum(sc[s : s + ln], 1 - 0.3 * np.exp(-tt / 0.11))
    # arrangement: drums & bass drop out for the last two bars, then everything fades
    t = np.arange(n) / SR
    tail = np.clip((duration - 2 * bar - t) / (0.6 * bar), 0, 1)
    mix = (pad + arp) * sc[:, None] + (bass + drums) * tail[:, None]
    fade_in = np.clip(t / 0.6, 0, 1)
    fade_out = np.clip((duration - t) / 2.2, 0, 1)
    mix *= (fade_in * fade_out**1.5)[:, None]

    hb, ha = signal.butter(2, 32 / (SR / 2), "high")
    mix = signal.lfilter(hb, ha, mix, axis=0)
    mix = mix / (np.abs(mix).max() + 1e-9) * 0.89
    return np.tanh(mix * 1.1).astype(np.float32) / np.tanh(1.1)
