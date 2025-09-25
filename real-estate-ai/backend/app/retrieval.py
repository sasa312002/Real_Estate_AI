import math
from typing import List, Dict

# Very lightweight in-memory document store (could be replaced by a vector DB)
class DocumentStore:
    def __init__(self):
        self.docs: List[Dict] = []

    def add(self, doc_id: str, text: str, meta: Dict = None):
        self.docs.append({"id": doc_id, "text": text, "meta": meta or {}})

    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        if not query:
            return []
        q_terms = set(query.lower().split())
        scored = []
        for d in self.docs:
            text_terms = set(d["text"].lower().split())
            overlap = len(q_terms & text_terms)
            if overlap == 0:
                continue
            # Simple TF proxy: overlap / sqrt(len(doc))
            score = overlap / math.sqrt(len(text_terms) + 1)
            scored.append((score, d))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [
            {"doc_id": s[1]["id"], "snippet": s[1]["text"][:240], "score": round(s[0], 3), "meta": s[1]["meta"]}
            for s in scored[:top_k]
        ]

    def bootstrap_samples(self):
        # Seed with a few Sri Lanka real-estate context docs (placeholder text)
        samples = [
            ("market_trends", "Colombo luxury apartment demand remains resilient with supply constraints."),
            ("tourism_influence", "Coastal tourism in Galle and Matara drives premium for villas and beachfront land."),
            ("central_hill_value", "Properties near Nuwara Eliya tea estates attract eco-tourism and boutique hospitality interest."),
            ("infra_dev", "New highway connectivity improves commute times between Colombo and Kandy, modestly raising suburban values."),
        ]
        for i, (doc_id, text) in enumerate(samples):
            self.add(doc_id, text, meta={"source": "seed", "index": i})

store = DocumentStore()
store.bootstrap_samples()
