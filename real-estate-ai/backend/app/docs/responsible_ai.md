# Responsible AI & Governance Plan

## Principles
- Fairness: Avoid geographically biased pricing explanations; document geo factors explicitly.
- Transparency: Include rationale fields (`location_rationale`, `market_range_rationale`, `llm_explanation`).
- Privacy: Sanitize user inputs and remove potential PII in outputs via `SecurityAgent`.
- Accountability: Log provenance of retrieval contexts and agent messages (see `protocol_agent` bus history).
- Reliability: Fallback heuristics when LLM unavailable; confidence score returned.

## Risk Mitigations
| Risk | Mitigation |
|------|------------|
| Over-reliance on LLM hallucinations | Structured JSON prompts + parsing with validation |
| Biased geo multipliers | Deterministic distance-based adjustments; expose rationale |
| Leakage of sensitive data | Input/output sanitization + length caps |
| Model drift / cost spikes | Config flags `strict_gemini`, debug mode, fallback heuristic |

## Data Handling
- No long-term storage of raw LLM prompts/responses beyond sanitized rationale.
- Retrieval store limited to non-sensitive public market context.

## Monitoring & Audit
- Add future hook to persist `agent_bus.history()` for compliance logs.
- Track per-plan usage for abuse monitoring.

## Future Enhancements
- Differential privacy for aggregated analytics.
- Fairness tests across districts.
- Red-team prompt testing harness.
