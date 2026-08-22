# Project Status — Sahayak DRHP

**Project:** Sahayak DRHP — SME IPO Offer-Document Co-pilot
**Event:** SEBI Hackathon · Problem Statement 4
**Date:** 8 August 2026
**Stage:** MVP — demonstration prototype (front-end only, fully mocked, no backend)

---

## 1. What this is

A working front-end MVP that shows how a non-expert SME promoter can go from a company
website to a substantially complete, disclosure-ready **Draft Red Herring Prospectus (DRHP)**,
while keeping the merchant banker in the review-and-certify loop.

The build is intentionally a **demonstration prototype**. There is no live backend, AI model,
or document engine wired in — everything is driven by realistic mock data modelled on the SEBI
(ICDR) SME framework and NSE Emerge / BSE SME listing norms. The whole demo is anchored on one
fictional company: **Satvik Foods Private Limited** (a Pune-based D2C millet-foods company).

## 2. Current status: what's built and working

The full 8-screen journey is implemented, navigable, and animated end to end:

1. **Landing** — frames the problem (months of work + many intermediaries) and the
   human-in-the-loop promise.
2. **Ingest** — paste a website URL → animated "crawl" → auto-built company base.
3. **Company Base** — extracted company profile with financial charts and cap table.
4. **Verification & KYC** — 6 phases that turn green; two are flagged as needing human input.
5. **Eligibility Check** — a rule engine scored against NSE Emerge criteria.
6. **DRHP Synthesis** — 14 sections with completeness rings, source provenance, and a
   document→section provenance matrix.
7. **Gaps & Consistency** — every gap ranked by severity and linked to its section.
8. **Final Draft DRHP** — a rendered, paginated prospectus with a *Send to merchant banker for
   certification* flow.

Also working:

- A persistent **AI co-pilot** side rail that narrates each step and answers scripted questions.
- A **workspace search** across sections, gaps, and KYC checks (keyboard-navigable).
- **Expert vs. First-time issuer** view toggle, which turns plain-language term explanations on/off.
- Client-side routing (`/`, `/ingest`, `/dashboard`, `/workspace/<step>`), a dashboard view,
  toasts, reduced-motion support, and mobile layouts.

## 3. Tech stack

React + TypeScript + Vite · Tailwind CSS · Framer Motion · Recharts · Zustand · lucide-react.
State is held in a single Zustand store; each screen is lazy-loaded as its own bundle.

## 4. How to run

```bash
cd sahayak-drhp
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle
```

## 5. Scope boundaries (important for the demo)

This is a front-end prototype for demonstration, **not** a functional production system.
Specifically, the following are **mocked / simulated**, not real:

- No real web crawling — the "Ingest" animation replays against fixed sample data.
- No live AI extraction, synthesis, or document generation — all outputs come from `src/data/mock.ts`.
- No real KYC / eligibility verification — statuses are pre-scripted.
- Export ("Export as PDF") and "Send to merchant banker" are UI flows only (mock actions/toasts).
- All company figures, names, and identifiers are illustrative.

<!-- ## 6. Next steps (post-hackathon, ignore)

- Wire a real ingestion + extraction backend behind the Ingest step.
- Connect a document-generation engine to produce the actual DRHP from verified inputs.
- Integrate live KYC / registry checks and a real SEBI ICDR rule engine for eligibility.
- Add authentication, persistence, and a real merchant-banker review/certification workflow. -->

---

*Prototype only. Not affiliated with SEBI, NSE, or BSE. All figures are illustrative.*
