"""Per-video-frame animation data derived from the narration.

visemes : one character per frame
    X rest | M lips closed (m b p) | F lip-teeth (f v) | C consonant (t d s n ...)
    E mid vowel | A open vowel | I wide vowel | O rounded | U small round (u w)
amp     : 0..1 loudness per frame (drives jaw energy, head bob)
beats   : frames of primary-stressed syllables (drives nods / hand beats)
"""

from __future__ import annotations

import numpy as np

VISEME = {}
for ch in "ɑæaʌɐɒ":
    VISEME[ch] = "A"
for ch in "ɛeəɚɜɝᵻ":
    VISEME[ch] = "E"
for ch in "iɪjy":
    VISEME[ch] = "I"
for ch in "oɔʊ":
    VISEME[ch] = "O"
for ch in "uw":
    VISEME[ch] = "U"
for ch in "mbp":
    VISEME[ch] = "M"
for ch in "fv":
    VISEME[ch] = "F"
PUNCT = set(",.!?:;—…\"'()")


def viseme_for(ph: str, prev: str) -> str:
    if ph == "ː":
        return prev
    if ph in PUNCT:
        return "X"
    if ph in VISEME:
        return VISEME[ph]
    if ph.isalpha() or ph in "ʃʒθðŋɹɾʔɡ":
        return "C"
    return prev


def visemes_per_frame(phonemes: list[tuple[str, float, float]], n_frames: int, fps: int) -> str:
    """phonemes: global (phoneme, start, end) sorted by start."""
    labels: list[tuple[float, float, str]] = []
    prev = "X"
    for i, (ph, s, e) in enumerate(phonemes):
        if ph in "ˈˌ":
            # stress marks carry a little time: show the upcoming sound
            nxt = next((p for p in phonemes[i + 1 : i + 3] if p[0] not in "ˈˌ"), None)
            v = viseme_for(nxt[0], prev) if nxt else prev
        elif ph == " ":
            v = "C" if (e - s) < 0.09 else "X"
        else:
            v = viseme_for(ph, prev)
        labels.append((s, e, v))
        prev = v
    out = ["X"] * n_frames
    j = 0
    for f in range(n_frames):
        t = (f + 0.5) / fps
        while j < len(labels) and labels[j][1] <= t:
            j += 1
        if j < len(labels) and labels[j][0] <= t < labels[j][1]:
            out[f] = labels[j][2]
    return "".join(out)


def amplitude_per_frame(audio: np.ndarray, sr: int, n_frames: int, fps: int) -> list[float]:
    hop = sr / fps
    half = int(0.03 * sr)
    rms = np.zeros(n_frames)
    for f in range(n_frames):
        c = int((f + 0.5) * hop)
        seg = audio[max(0, c - half) : c + half]
        rms[f] = np.sqrt(np.mean(seg**2)) if len(seg) else 0.0
    voiced = rms[rms > rms.max() * 0.05] if rms.max() > 0 else rms
    ref = np.percentile(voiced, 92) if len(voiced) else 1.0
    amp = np.clip(rms / (ref + 1e-9), 0, 1) ** 0.7
    # light smoothing (attack fast, release slower) so the jaw does not flicker
    sm = np.zeros_like(amp)
    for f in range(n_frames):
        prev = sm[f - 1] if f else 0
        k = 0.75 if amp[f] > prev else 0.45
        sm[f] = prev + (amp[f] - prev) * k
    return [round(float(a), 3) for a in sm]


def stress_beats(phonemes: list[tuple[str, float, float]], fps: int, min_gap: int = 7) -> list[int]:
    beats: list[int] = []
    for ph, s, _ in phonemes:
        if ph == "ˈ":
            f = int(round(s * fps))
            if not beats or f - beats[-1] >= min_gap:
                beats.append(f)
    return beats
