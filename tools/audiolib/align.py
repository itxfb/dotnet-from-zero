"""Map spoken words onto the phoneme timings produced by the TTS model.

espeak sometimes merges words ("in the" -> "ɪnðə") or splits them ("WriteLine" ->
"ɹˈaɪt lˈaɪn"), so counting spaces is not reliable. Instead every word is
phonemized on its own and the resulting character stream is aligned against
the timed sentence stream with difflib.
"""

from __future__ import annotations

from difflib import SequenceMatcher
from functools import lru_cache

SKIP = set(" ˈˌ,.!?:;—…\"'()")


@lru_cache(maxsize=None)
def _word_phonemes(word: str) -> str:
    from kokoro_onnx.tokenizer import Tokenizer

    return "".join(c for c in _tok().phonemize(word) if c not in SKIP)


_TOKENIZER = None


def _tok():
    global _TOKENIZER
    if _TOKENIZER is None:
        from kokoro_onnx.tokenizer import Tokenizer

        _TOKENIZER = Tokenizer()
    return _TOKENIZER


def align_words(phonemes: list[tuple[str, float, float]], words: list[str]) -> list[tuple[float, float]] | None:
    stream = [(p, s, e) for p, s, e in phonemes if p not in SKIP]
    if not stream:
        return None
    a = "".join(p for p, _, _ in stream)
    word_chars = [_word_phonemes(w) or "ə" for w in words]
    b = "".join(word_chars)
    # map every index of b onto an index of a
    m = [None] * len(b)
    for tag, i1, i2, j1, j2 in SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if tag in ("equal", "replace"):
            for j in range(j1, j2):
                m[j] = min(i2 - 1, i1 + (j - j1) * max(1, i2 - i1) // max(1, j2 - j1))
        elif tag == "insert":
            for j in range(j1, j2):
                m[j] = max(0, min(len(a) - 1, i1))
    # fill gaps by nearest previous value
    last = 0
    for j in range(len(m)):
        if m[j] is None:
            m[j] = last
        last = m[j]
    out, pos = [], 0
    for wc in word_chars:
        first, final = m[pos], m[pos + len(wc) - 1]
        final = max(final, first)
        out.append((stream[first][1], stream[final][2]))
        pos += len(wc)
    # keep words monotonic and non-overlapping
    for k in range(1, len(out)):
        s, e = out[k]
        s = max(s, out[k - 1][0] + 0.01)
        out[k] = (s, max(e, s + 0.04))
    return out
