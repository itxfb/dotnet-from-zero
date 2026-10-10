"""Turn a lesson line into display tokens, spoken text and sentences.

A *display token* is what the viewer sees in captions (".NET", "ASP.NET Core,").
Its *spoken* form is what the TTS engine reads ("dot net", "ASP dot net core,").
Multi-word terms from the pronunciation / keyword tables stay a single token.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

SENTENCE_END = re.compile(r"[.!?:][\"')\]]*$")
TRAILING_PUNCT = re.compile(r"[\s.,!?:;—–\"')\]]+$")
LEADING_PUNCT = re.compile(r"^[\"'(\[]+")


@dataclass
class Token:
    display: str
    spoken: str
    keyword: str | None = None
    # filled in after synthesis (seconds, relative to the sentence audio)
    start: float = 0.0
    end: float = 0.0

    @property
    def core(self) -> str:
        """Display text without surrounding punctuation (".NET?" -> ".NET")."""
        return LEADING_PUNCT.sub("", TRAILING_PUNCT.sub("", self.display))

    @property
    def spoken_words(self) -> list[str]:
        return self.spoken.split()


@dataclass
class Sentence:
    tokens: list[Token] = field(default_factory=list)

    @property
    def spoken_text(self) -> str:
        return " ".join(t.spoken for t in self.tokens)

    @property
    def ends_with_colon(self) -> bool:
        return self.tokens[-1].display.rstrip("\"')]").endswith(":")


def make_replacer(mapping: dict[str, str]):
    if not mapping:
        return lambda s: s
    keys = sorted(mapping, key=len, reverse=True)
    rx = re.compile("|".join(re.escape(k) for k in keys))
    return lambda s: rx.sub(lambda m: mapping[m.group(0)], s)


def tokenize(text: str, protected: list[str]) -> list[str]:
    """Split on spaces, keeping multi-word protected terms together."""
    placeholders: dict[str, str] = {}
    multi = sorted({t for t in protected if " " in t}, key=len, reverse=True)
    for i, term in enumerate(multi):
        if term in text:
            ph = f"\u2063{i}\u2064"
            text = text.replace(term, ph)
            placeholders[ph] = term
    out: list[str] = []
    for raw in text.split():
        for ph, term in placeholders.items():
            raw = raw.replace(ph, term)
        if out and not re.search(r"[\w#]", raw):
            # punctuation-only token such as an em dash: glue to the previous word
            out[-1] = f"{out[-1]} {raw}"
        else:
            out.append(raw)
    return out


def spoken_form(display: str, replace) -> str:
    s = replace(display)
    s = re.sub(r"\s*[—–]\s*", ", ", s)  # dashes become a short clause pause
    s = re.sub(r",\s*,", ",", s)
    s = s.replace('"', "").replace("(", " ").replace(")", " ").replace(";", "")
    return " ".join(s.split())


def build_sentences(line: dict, pronounce: dict, keywords: dict) -> list[Sentence]:
    replace = make_replacer(pronounce)
    protected = list(pronounce) + list(keywords)
    if line.get("say"):
        # explicit spoken text (e.g. code read aloud): tokens are the spoken words
        words = tokenize(line["say"], protected)
        tokens = [Token(display=w, spoken=spoken_form(w, replace)) for w in words]
    else:
        tokens = [Token(display=w, spoken=spoken_form(w, replace)) for w in tokenize(line["text"], protected)]
    for t in tokens:
        t.keyword = keywords.get(t.core)

    sentences: list[Sentence] = [Sentence()]
    for t in tokens:
        if not t.spoken_words:
            continue
        sentences[-1].tokens.append(t)
        if SENTENCE_END.search(t.display) and not t.display.endswith("..."):
            sentences.append(Sentence())
    return [s for s in sentences if s.tokens]


def normalize_for_match(s: str) -> str:
    return TRAILING_PUNCT.sub("", LEADING_PUNCT.sub("", s)).lower()


def find_phrase(tokens: list[Token], phrase: str) -> int | None:
    """Index of the first token where `phrase` (space separated) starts."""
    target = [normalize_for_match(p) for p in phrase.split()]
    cores = [normalize_for_match(t.display) for t in tokens]
    # also allow matching against expanded multi-word tokens
    expanded: list[tuple[int, str]] = []
    for i, c in enumerate(cores):
        for part in c.split():
            expanded.append((i, part))
    parts = [p for _, p in expanded]
    for j in range(len(parts) - len(target) + 1):
        if parts[j : j + len(target)] == target:
            return expanded[j][0]
    # fall back to substring match on a single token ("WriteLine" in "Console.WriteLine(")
    for i, c in enumerate(cores):
        if target and target[0] in c:
            return i
    return None
