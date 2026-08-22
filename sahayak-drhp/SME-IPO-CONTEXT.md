# SME IPO & DRHP — Domain Context

Reference notes for **Sahayak DRHP** (SEBI Hackathon · PS-4). Collected from the Groww SME IPO
primer plus SEBI/NSE/BSE material on the SME framework, current as of the **SEBI (ICDR)
(Amendment) Regulations, 2025** (notified 3 March 2025).

> Purpose: give the prototype's mock data, rule engine, and copy a factual spine. Not legal advice.
> Verify against the live SEBI ICDR text and the exchange rulebook before treating any number as final.

---

## 1. What an SME IPO is

An SME IPO lets a small or medium enterprise raise equity from the public and list on a
**dedicated SME platform** — **NSE Emerge** or **BSE SME** — rather than the main board. The
segment exists because main-board thresholds (₹10 cr minimum post-issue capital, 1,000+ allottees,
SEBI-level document review) are out of reach for a company raising ₹20–40 crore.

The defining structural trade: **the exchange vets the offer document, not SEBI.** SEBI delegates
review of SME draft offer documents to the exchange, which is why the merchant banker's due
diligence and certification carry disproportionate weight in this segment.

### SME vs. Main board

| Aspect | SME IPO | Main board IPO |
|---|---|---|
| Post-issue paid-up capital | **≤ ₹25 cr** | ≥ ₹10 cr |
| Offer document reviewed by | **Stock exchange** (NSE Emerge / BSE SME) | SEBI |
| Minimum allottees | **50** | 1,000 |
| Underwriting | **100% mandatory**; lead manager underwrites ≥ 15% on its own books | Not mandatory |
| Market making | **Mandatory for 3 years** post-listing | Not required |
| Minimum application | **₹2 lakh (2 lots)** | ₹10,000–15,000 (1 lot) |
| Financial reporting | Half-yearly (historically); moving toward quarterly on migration | Quarterly |
| Retail participation | Effectively excluded by the ₹2 lakh ticket | Open |

---

## 2. Eligibility criteria

### 2.1 SEBI ICDR conditions (apply to both platforms)

| Condition | Requirement |
|---|---|
| Entity type | **Public limited company** (Pvt Ltd / LLP / partnership / proprietorship must convert first) |
| Operating track record | **≥ 3 years**; pre-conversion track record of the predecessor firm can count |
| Post-issue paid-up capital | **≤ ₹25 crore** |
| **Operating profit (EBITDA)** | **≥ ₹1 crore in at least 2 of the 3 preceding full FYs** — the 2025 test |
| Promoter contribution | **≥ 20% of post-issue capital**, locked in **3 years** |
| Promoter stability | No change in promoters in the year preceding filing |
| Disqualification | Promoters/directors not debarred; no pending winding-up or insolvency proceedings |
| Financials | 3 years of **restated audited** financials, ≤ 6 months old at filing |

The **₹1 crore EBITDA test is the single biggest disqualifier post-2025.** It closed the door on
loss-making SME listings entirely. It applies to DRHPs filed on or after **19 December 2024**.

### 2.2 Platform-specific overlays

| Criterion | NSE Emerge | BSE SME |
|---|---|---|
| Net worth | Positive (in 2 of 3 FYs) | **≥ ₹1 cr** in 2 preceding FYs |
| Net tangible assets | Not separately mandated | **≥ ₹3 cr** (raised from ₹1.5 cr in Jan 2024) |
| **Free Cash Flow to Equity (FCFE)** | **Positive in 2 of 3 FYs** (since 22 Aug 2024) | Not mandated |
| Leverage | Up to **3:1** | — |
| Public shareholders at migration | ≥ 500 | ≥ 250 |

FCFE = cash left after operating expenses, interest, tax, capex and debt repayment. NSE added it
to catch companies that report accounting profit while bleeding cash.

---

## 3. The 2025 tightening — what changed

Notified **3 March 2025**; the substantive tests bite for DRHPs filed on/after **19 Dec 2024**.
These are the provisions a DRHP co-pilot must enforce, because most of them are hard numeric gates:

| Change | Rule |
|---|---|
| **Profitability floor** | EBITDA ≥ ₹1 cr in 2 of last 3 FYs |
| **OFS cap** | Selling shareholders together ≤ **20% of issue size**; no single seller may offload > **50% of their pre-issue holding** |
| **Promoter lock-in (excess)** | Holding above the 20% minimum promoter contribution releases in stages — **half after 1 year, half after 2 years** |
| **General Corporate Purposes** | ≤ **15% of issue size or ₹10 cr, whichever is lower** |
| **Promoter/related-party loans** | IPO proceeds **cannot** be used to repay loans from promoters, promoter group, or related parties (directly or indirectly) |
| **Monitoring agency** | Mandatory for issues **> ₹50 cr** |
| **Public comment window** | Draft offer document must sit for **21 days** of public comment (announced via newspapers + QR code) |
| **NII allotment** | Moves from proportionate to **draw of lots** for the minimum lot, mirroring main board; pro-rata only for the residual |
| **Minimum application** | **₹2 lakh / 2 lots** (exchange bidding changes effective 1 July 2025) |
| **RPT norms** | LODR related-party-transaction rules extended to SME-listed entities; materiality threshold **10% of annual consolidated turnover or ₹50 cr, whichever is lower** |
| **Further issue beyond ₹25 cr** | Issuer may stay on the SME platform if it undertakes to comply with main-board LODR |

**Why it happened:** weak post-listing performance, promoter cash-outs dressed as OFS, inflated
subscription, and proceeds recycled into related-party pockets. Every one of these rules is a
symptom of a documented abuse — useful framing for the prototype's "why this check exists" copy.

---

## 4. The IPO process

### Steps

1. **Board + shareholder approval** — evaluate capital need, pass board resolution, special
   resolution under s.62(1)(c) of the Companies Act.
2. **Convert to public limited company** if not already; clean up cap table, ESOPs, RPTs.
3. **Appoint intermediaries** — SEBI-registered **merchant banker (lead manager)**, underwriter,
   **market maker**, registrar & transfer agent, peer-reviewed auditor, legal counsel, PR.
4. **Due diligence + restated financials** — 3 years restated per ICDR Schedule VI.
5. **Draft the DRHP** and file with the exchange (BSE SME / NSE Emerge) — *not* SEBI.
6. **Exchange scrutiny** — desk review, **site visit to the plant/office**, promoter interview
   before the **Listing Advisory Committee**; observation letters; then **in-principle approval**.
7. **21-day public comment** period on the draft.
8. **RHP** filed with the **Registrar of Companies**, price band and dates advertised.
9. **Issue opens** — ASBA / UPI mandate blocks funds; anchor book (if any) a day earlier.
10. **Allotment** — must reach **≥ 50 allottees** or the issue fails and money is refunded.
11. **Listing & trading** — market maker starts two-way quotes.

### Timeline and cost (indicative)

- **4–6 months** end to end: ~6 weeks diligence and restatement, ~8 weeks DRHP drafting,
  ~4 weeks exchange filing and observation cycle, ~4 weeks to RHP and opening, ~2 weeks to listing.
- **8–14% of issue size** all-in: merchant banker 2–5%, underwriting 1–3%, legal ₹15–50 L,
  audit/tax ₹10–40 L, RTA ₹3–10 L, exchange/regulatory ₹5–15 L, marketing ₹10–25 L.
- Ongoing compliance ₹8–15 L/year.

### Market making

Mandatory for **3 years** from listing. **5% of the issue size** is allotted to the designated
market maker as initial inventory; it must post continuous two-way quotes to keep the scrip liquid.
This is the segment's answer to its own biggest structural flaw — thin trading.

---

## 5. The DRHP itself

The **Draft Red Herring Prospectus** is the offer document filed before the issue. "Red herring"
because it omits final price and issue size; "draft" because it precedes regulator/exchange
observations. Disclosure contents are prescribed by **Schedule VI of SEBI ICDR, 2018** (Schedule
VIII under the older 2009 regime — still cited in places).

### Standard section order

| # | Section | What it must carry |
|---|---|---|
| I | Cover page & issue details | Issuer, promoters, issue type/size, price band, lot, intermediaries, listing platform |
| II | Definitions & abbreviations | Defined terms, conventions, currency and financial presentation |
| III | **Risk factors** | Top 10 ordered by materiality; issuer-specific + issue-specific; each quantified |
| IV | Introduction / general information | Registered office, RoC, board, bankers, statutory auditors |
| V | Industry overview | Market size, growth, competitive structure — must be sourced |
| VI | Our business | Model, products, operations, capacity, customers, supply chain, employees |
| VII | Financial information | 3 yrs **restated** financials, auditor report, MD&A, key ratios |
| VIII | Capital structure | Pre/post-issue shareholding, promoter contribution, lock-in schedule, dilution |
| IX | Objects of the issue | Object-wise deployment, schedule, means of finance, **GCP within cap** |
| X | Basis for issue price | Qualitative + quantitative justification, KPIs, listed peer comparison |
| XI | Legal & other information | Litigation, regulatory actions, material contracts, contingent liabilities |
| XII | Management | Board, KMP, remuneration, corporate governance, borrowing powers |
| XIII | Promoters & promoter group | Identity, background, interest, group entities, RPTs |
| XIV | Declarations | Certifications, sign-offs, material documents for inspection |

### Risk factors — where DRHPs actually fail

Three buckets: **universal** (governance, regulatory compliance), **situational** (customer or
supplier concentration, litigation history, promoter dependence), and **sector-specific**.

Recurring rejection causes:
- Vague language — "intense competition" with no market-share figure.
- No quantification — a risk without a rupee number is not a disclosure.
- **Cross-chapter inconsistency** — a PAT figure in the narrative that doesn't tie to the restated
  statements. *(This is exactly the class of defect the prototype's Gaps & Consistency stage models.)*
- Generic boilerplate copied from another issuer's document.
- Missing cross-references to the supporting section.

---

## 6. Post-listing obligations

- **LODR compliance** — SME-listed entities carry a lighter LODR set than the main board, but the
  2025 amendment pulled **RPT norms** into scope.
- Half-yearly financial results (main-board migration triggers quarterly, within 45 days).
- Continuous disclosure of material events, shareholding pattern, corporate governance report.
- Market making sustained for 3 years.
- **Migration to main board** (ICDR **Reg. 277**): post-issue paid-up capital between ₹10 cr and
  ₹25 cr, **≥ 2 years listed** on the SME platform, **special resolution by postal ballot**,
  promoter holding ≥ 20% of post-issue capital, and ≥ 500 (NSE) / ≥ 250 (BSE) public shareholders.
  Above ₹25 cr, migration is compulsory unless the issuer opts into main-board LODR.

---

## 7. Investor-side mechanics

- Demat account required; apply through broker/bank terminal with **ASBA** or **UPI mandate**;
  funds are blocked, not debited, until allotment.
- **₹2 lakh minimum (2 lots)** — retail is effectively priced out; the segment is now HNI/NII and
  institutional.
- **Draw of lots** decides NII allotment on oversubscription.
- Real risks: short operating history, **illiquidity** (the reason market making is mandatory),
  concentrated promoter control, and thin analyst coverage.

---

## 8. How this maps to the prototype

Where `src/data/mock.ts` and the rule engine already align, and where they'd drift from the
current framework:

**Already aligned** — ₹25 cr post-issue capital cap, ≥ 3-year track record, ₹3 cr NTA (BSE-style),
20% promoter contribution with 3-year lock-in, positive net worth, no winding-up proceedings,
material-litigation disclosure, the 14-section DRHP structure, and the four-party handoff
(promoter → co-pilot → merchant banker → exchange).

**Worth adding if the eligibility engine is extended** (`ELIGIBILITY.criteria` in `src/data/mock.ts:211`):

| Check | Rule | Satvik Foods (mock) |
|---|---|---|
| EBITDA floor | ≥ **₹1 cr** in 2 of 3 FYs — currently the criterion says only "operating profit in 2 of 3 FY" without the threshold | FY22 ₹4.68 cr, FY23 ₹7.12 cr → passes |
| FCFE (NSE Emerge) | Positive in 2 of 3 FYs | Not modelled — no cash-flow data in `FINANCIALS` |
| Leverage | ≤ 3:1 | D/E 0.29 → passes |
| GCP cap | ≤ 15% of issue or ₹10 cr, lower | Check against Objects of the Issue (Section IX) |
| OFS cap | ≤ 20% of issue size | N/A — mock issue is 100% fresh issue |
| Promoter-loan repayment | Prohibited use of proceeds | Would belong in the Objects consistency check |
| Monitoring agency | Required if issue > ₹50 cr | Mock issue ₹32 cr → not triggered |
| Minimum allottees | ≥ 50 | Post-issue condition, not a filing gate |

The mock lot (1,200 × ₹110 = ₹1.32 L) is consistent with the ₹2 lakh / 2-lot minimum application.

---

## Sources

- [Groww — SME IPO](https://groww.in/blog/sme-ipo)
- [Groww — Sebi Overhauls SME IPO Rules](https://groww.in/blog/sebi-overhauls-sme-ipo-rules)
- [Groww — NSE and BSE new SME IPO rules, effective 1 July 2025](https://groww.in/blog/nse-and-bse-issue-new-rules-for-sme-ipos)
- [MMJC — SME IPO Rules 2025: SEBI's ₹1-Crore EBITDA Test (ICDR)](https://mmjc.in/sme-ipo-rules-2025-sebis-new-%E2%82%B91-crore-ebitda-test-explained-icdr/)
- [SME Advisory — SME IPO Eligibility in India (2026): NSE Emerge & BSE SME](https://www.smeadvisory.in/blog/sme-ipo-india-guide)
- [Agama Law — Navigating SME IPOs: Recent Regulatory Changes](https://agamalaw.in/2025/05/16/navigating-sme-ipos-recent-regulatory-changes/)
- [NSE India — Emerge eligibility criteria](https://www.nseindia.com/static/companies-listing/raising-capital-public-issues-emerge-eligibility-criteria)
- [NSE India — Emerge merchant banker roles & responsibilities](https://www.nseindia.com/static/products-services/emerge-sme-merchant-bankers-roles-responsibilities)
- [BSE SME — eligibility criteria](https://www.bsesme.com/static/getlisted/criteriaisting.aspx?expandable=0)
- [Corporate Professionals — SME IPO eligibility, listing guidelines and procedure](https://www.corporateprofessionals.com/articles/sme-ipo-eligibility-criteria-listing-guidelines-and-procedure-a-guide/)
- [LiveLaw — The DRHP Rulebook](https://www.livelaw.in/law-firms/law-firm-articles-/the-drhp-rulebook-law-firms-articles-293635)
- [Chittorgarh — IPO eligibility requirements & SME IPO intermediaries](https://www.chittorgarh.com/book-chapter/ipo-eligibility/3/)
- [Seth & Associates — SME to Mainboard Migration](https://www.sethspro.com/post/sme-to-mainboard-migration-india)
- [Zerodha Z-Connect — No more retail participation in SME IPOs](https://zerodha.com/z-connect/updates/no-more-retail-participation-in-sme-ipos)
