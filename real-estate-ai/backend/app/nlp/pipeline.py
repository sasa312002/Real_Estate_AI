import re
from typing import Dict, List

try:
    import spacy  # type: ignore
except ImportError:  # Lightweight fallback if spaCy not installed
    spacy = None

class NLPPipeline:
    """Basic NLP pipeline offering NER + summarization fallback.

    This keeps dependencies optional. If spaCy (and an English model) are present,
    we leverage them; otherwise we fall back to simple regex extraction and a
    heuristic sentence summarizer.
    """

    def __init__(self):
        self.enabled = False
        self.model = None
        if spacy:
            try:
                self.model = spacy.load("en_core_web_sm")
                self.enabled = True
            except Exception:
                self.enabled = False

    def extract_entities(self, text: str) -> List[Dict[str, str]]:
        if not text:
            return []
        if self.enabled and self.model:
            doc = self.model(text)
            return [
                {"text": ent.text, "label": ent.label_}
                for ent in doc.ents
            ]
        # Fallback: pull out capitalized word sequences (simplistic)
        pattern = re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b")
        found = pattern.findall(text)
        return [{"text": f, "label": "PROPER_NOUN"} for f in set(found)]

    def summarize(self, text: str, max_sentences: int = 3) -> str:
        if not text:
            return ""
        if self.enabled and self.model:
            # Very naive importance: prefer earlier sentences + longer nouns
            sents = list(self.model(text).sents)
            ranked = sorted(
                sents,
                key=lambda s: (-len([t for t in s if t.pos_ in ("NOUN", "PROPN")]), s.start),
            )
            picked = sorted(ranked[:max_sentences], key=lambda s: s.start)
            return " ".join([s.text.strip() for s in picked])
        # Fallback: take first N sentences via period splitting
        sentences = re.split(r"(?<=[.!?])\s+", text.strip())
        return " ".join(sentences[:max_sentences])

nlp_pipeline = NLPPipeline()
