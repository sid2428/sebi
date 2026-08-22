# Sahayak DRHP — SME IPO Offer-Document Co-pilot

A front-end prototype for **SEBI Hackathon · Problem Statement 4**: helping a non-expert SME
promoter generate a substantially complete, disclosure-ready **Draft Red Herring Prospectus (DRHP)**
while keeping the merchant banker in the review-and-certify loop.

Everything is **mocked** (no backend) but modelled on the real SEBI (ICDR) SME framework and the
NSE Emerge / BSE SME listing norms. The demo is anchored on a fictional D2C foods company,
**Satvik Foods Private Limited**.

## The journey (7 screens)

1. **Landing** — frames the problem (months + intermediaries) and the human-in-loop promise.
2. **Ingest** — paste a website URL → animated crawl → auto-built company base (42 attributes).
3. **Company Base** — extracted profile with live financial charts and cap table, all source-traced.
4. **Verification & KYC** — 6 phases that turn green (identity, promoters, financials, capital,
   legal, contracts); two flagged for human input.
5. **Eligibility Check** — rule engine scored against NSE Emerge criteria with the figure behind
   every verdict.
6. **DRHP Synthesis** — the many-to-many mapping made visible: 14 sections with completeness rings,
   source-document provenance, gap flags, and a full document→section **provenance matrix**.
7. **Gaps & Consistency** — every gap/inconsistency ranked by severity, linked to its section.
8. **Final Draft DRHP** — a rendered, paginated prospectus with a *Send to merchant banker for
   certification* flow.

A persistent **AI co-pilot** rail narrates each step, flags issues, and answers scripted questions.

## Stack

React + TypeScript + Vite · Tailwind CSS · Framer Motion · Recharts · Zustand · lucide-react.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle
```

> Prototype only. Not affiliated with SEBI, NSE or BSE. All figures are illustrative.
