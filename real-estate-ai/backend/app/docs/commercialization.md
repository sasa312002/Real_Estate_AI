# Commercialization & Pricing Strategy

## Target Users
- Individual property buyers & investors in Sri Lanka.
- Small real estate agencies seeking quick comparative analysis.

## Value Proposition
- Coordinate-sensitive AI valuation with contextual market reasoning.
- Integrated NLP entity extraction & concise summaries for rapid due diligence.
- Transparent market range + deal recommendation with risk flags.

## Pricing Model (Tiered SaaS)
| Plan | Monthly Price (LKR) | Analyses Included | Key Features |
|------|---------------------|-------------------|--------------|
| Free | 0 | 5 | Basic AI valuation, market range, limited history |
| Standard | 2,500 | 50 | All Free + Entities, Summaries, Retrieval context, Priority latency |
| Premium | 15,000 | 500 | All Standard + Advanced geo analytics, Extended history, Export API |

Overage Pricing: Optionally LKR 80 per extra analysis (standard/premium) after cap (future).

## Upsell Triggers
- When `analyses_remaining` == 0 show upgrade modal with value deltas.
- Highlight locked advanced metrics (e.g., extended retrieval docs) in Free plan UI.

## Cost Structure (Indicative)
- LLM API calls (pricing & deal) dominate variable cost; retrieval & NLP local.
- Estimate per-analysis cost ~ LKR 25 (LLM + infra) => healthy margin at Standard tier.

## Go-To-Market
- Partner with local listing platforms for referral traffic.
- Offer embeddable widget for agencies (Premium upsell).

## Roadmap Extensions
- Add comparative comps retrieval via vector store.
- Batch portfolio valuation endpoint (Premium add-on).
- Rate limit & usage-based billing integration.
