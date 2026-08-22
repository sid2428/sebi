// ============================================================
//  Sahayak DRHP — Mock domain data (SME IPO / DRHP)
//  Anchor company: Satvik Foods Private Limited (D2C millet foods)
//  All figures illustrative. ₹ in lakh unless noted.
// ============================================================

import { MANDATORY_DOCS } from './documents'

export const COMPANY = {
  legalName: 'Satvik Foods Private Limited',
  proposedName: 'Satvik Foods Limited',
  brand: 'Satvik',
  logoLetters: 'SF',
  cin: 'U15490PN2016PTC167432',
  sector: 'Packaged Foods · FMCG (D2C)',
  subSector: 'Millet-based foods, cold-pressed oils & healthy snacks',
  incorporated: '14 March 2016',
  roc: 'RoC — Pune',
  regOffice: 'Plot 42, Baner Industrial Estate, Baner, Pune, Maharashtra 411045',
  website: 'www.satvikfoods.in',
  employees: 148,
  targetExchange: 'NSE Emerge',
  gstin: '27AAJCS4821K1ZP',
  pan: 'AAJCS4821K',
  about:
    'Satvik Foods is a Pune-based direct-to-consumer packaged foods company building a portfolio of millet-based snacks, cold-pressed oils and ready-to-cook health mixes. Founded in 2016, it sells across its own D2C channel, quick-commerce and 4,200+ modern-trade outlets across western and southern India.',
}

export const ISSUE = {
  type: 'Fresh Issue',
  platform: 'NSE Emerge (SME Platform)',
  sizeCr: 32.0,
  priceBand: '₹104 – ₹110',
  floorPrice: 104,
  capPrice: 110,
  faceValue: 10,
  lotSize: 1200,
  marketMaker: 'Anchor Securities Pvt. Ltd.',
  leadManager: 'Meridian Capital Advisors LLP',
  registrar: 'Bigshare Services Pvt. Ltd.',
}

// ---- Capital structure ----
// One place holds the share counts, so every derived figure in the app
// (EPS, NAV, promoter dilution, post-issue capital, market-maker
// inventory) is arithmetic rather than a number typed twice.
//
//   pre-issue      62,00,000 shares  @ ₹10 = ₹6.20 Cr
//   fresh issue    29,09,100 shares  @ ₹110 (cap) = ₹32.00 Cr
//   post-issue     91,09,100 shares  @ ₹10 = ₹9.11 Cr   (SME cap: ₹25 Cr)
export const CAPITAL = {
  preIssueShares: 62_00_000,
  freshIssueShares: 29_09_100,
  /** Promoters' combined pre-issue holding, from CAP_TABLE below. */
  promoterPreIssuePct: 62.8,
  /** Gross-to-net bridge for the objects of the issue. */
  issueExpensesCr: 2.6,
}

export const CAPITAL_DERIVED = (() => {
  const post = CAPITAL.preIssueShares + CAPITAL.freshIssueShares
  const promoterShares = Math.round((CAPITAL.promoterPreIssuePct / 100) * CAPITAL.preIssueShares)
  const latest = { pat: 421, netWorth: 1852 } // ₹ lakh, FY23 — mirrors FINANCIALS
  const patRs = latest.pat * 1e5
  const netWorthRs = latest.netWorth * 1e5
  const netProceedsCr = ISSUE.sizeCr - CAPITAL.issueExpensesCr
  return {
    postIssueShares: post,
    postIssueCapitalCr: (post * ISSUE.faceValue) / 1e7,
    preIssueCapitalCr: (CAPITAL.preIssueShares * ISSUE.faceValue) / 1e7,
    promoterShares,
    promoterPostIssuePct: +((promoterShares / post) * 100).toFixed(1),
    /** Basic EPS is struck on pre-issue shares — the year is already over. */
    epsFy23: +(patRs / CAPITAL.preIssueShares).toFixed(2),
    navPreIssue: +(netWorthRs / CAPITAL.preIssueShares).toFixed(2),
    navPostIssue: +((netWorthRs + netProceedsCr * 1e7) / post).toFixed(2),
    netProceedsCr: +netProceedsCr.toFixed(2),
    peAtCap: +(ISSUE.capPrice / (patRs / CAPITAL.preIssueShares)).toFixed(1),
    peAtFloor: +(ISSUE.floorPrice / (patRs / CAPITAL.preIssueShares)).toFixed(1),
    /** ICDR Reg. 261 — 5% of the issue goes to the market maker. */
    marketMakerShares: Math.round(CAPITAL.freshIssueShares * 0.05),
    /** ICDR Reg. 236 — minimum promoter contribution, locked in 3 years. */
    minPromoterContributionShares: Math.round(post * 0.2),
    lotValueAtCap: ISSUE.lotSize * ISSUE.capPrice,
  }
})()

export const GLOSSARY: Record<string, string> = {
  DRHP: 'Draft Red Herring Prospectus, the draft IPO document reviewed before filing.',
  'SEBI ICDR': 'SEBI ICDR is the rulebook that tells issuers what an IPO document must disclose.',
  KYC: 'Know Your Customer checks verify the people and entities named in the draft.',
  DIN: 'Director Identification Number, the unique ID used to verify a company director.',
  CIN: 'Corporate Identity Number, the registration number assigned when the company was incorporated.',
  NTA: 'Net tangible assets means net worth after removing intangible items like goodwill.',
  RoNW: 'Return on Net Worth shows how efficiently the company generates profit from shareholder capital.',
  'contingent liability': 'A possible liability that may arise later, depending on how an ongoing matter is decided.',
  merchant_banker: 'The SEBI-authorised intermediary who reviews, diligences, and certifies the draft before filing.',
}

export const REQUIREMENTS: {
  id: string
  label: string
  mappedSections: string[]
  covered: boolean
  status: 'full' | 'partial' | 'missing'
  note: string
}[] = [
  { id: 'issuer-identity', label: 'Issuer identity, corporate information, and offer structure', mappedSections: ['I', 'IV'], covered: true, status: 'full', note: 'Cover, company details, issue structure, and intermediaries are fully mapped.' },
  { id: 'definitions', label: 'Definitions, abbreviations, and document conventions', mappedSections: ['II'], covered: true, status: 'full', note: 'Defined terms and abbreviations are fully populated.' },
  { id: 'risk-factors', label: 'Risk factors with issuer-specific and issue-specific disclosures', mappedSections: ['III'], covered: true, status: 'partial', note: 'Risk section exists, but promoter-concentration risk still needs quantified wording.' },
  { id: 'industry-business', label: 'Industry overview, business model, products, and operations', mappedSections: ['V', 'VI'], covered: true, status: 'full', note: 'Industry context and business narrative are substantially complete.' },
  { id: 'financials', label: 'Restated financial information and auditor-linked disclosures', mappedSections: ['VII'], covered: true, status: 'partial', note: 'Financial statements are present, but FY22 PAT narrative must reconcile to audited figures.' },
  { id: 'capital-issue', label: 'Capital structure, objects of the issue, and pricing rationale', mappedSections: ['VIII', 'IX', 'X'], covered: true, status: 'partial', note: 'Capital and objects are ready; price-band justification needs one more comparable set.' },
  { id: 'legal-regulatory', label: 'Litigation, regulatory actions, material contracts, and contingent liabilities', mappedSections: ['XI'], covered: true, status: 'partial', note: 'GST appeal disclosure exists, but the counsel note is still pending.' },
  { id: 'management-promoters', label: 'Board, management, promoters, and promoter-group disclosures', mappedSections: ['XII', 'XIII'], covered: true, status: 'partial', note: 'Board and promoter sections are drafted; one independent director DIN remains unverified.' },
  { id: 'declarations', label: 'Declarations, certifications, and sign-off trail before filing', mappedSections: ['XIV'], covered: true, status: 'full', note: 'Declaration scaffolding is ready for intermediary sign-off.' },
  { id: 'statutory-disclosures', label: 'SME-platform statutory and intermediary disclosures before exchange filing', mappedSections: ['I', 'XI', 'XIV'], covered: false, status: 'missing', note: 'Final intermediary certification package appears only after merchant-banker review is completed.' },
]

export const HANDOFF_STAGES = [
  {
    id: 'promoter',
    label: 'Promoter drafts',
    detail: 'The issuer supplies business, financial, and legal inputs in a guided flow.',
  },
  {
    id: 'copilot',
    label: 'Co-pilot verifies & flags gaps',
    detail: 'Sahayak organises disclosures, checks consistency, and surfaces what still needs human attention.',
  },
  {
    id: 'banker',
    label: 'Merchant banker reviews & certifies',
    detail: 'The authorised intermediary performs due diligence, edits the draft, and certifies it before any filing.',
  },
  {
    id: 'filing',
    label: 'SEBI / Exchange filing',
    detail: 'Only the reviewed and certified draft proceeds to the exchange and regulator workflow.',
  },
] as const

export const TIME_TO_DRAFT = {
  traditionalRange: '4-6 months',
  copilotRange: '<1 day',
  stageDaysSaved: {
    base: 14,
    documents: 26,
    kyc: 35,
    eligibility: 52,
    synthesis: 81,
    gaps: 104,
    final: 128,
  },
}

// ---- 3-year financial snapshot (₹ lakh) ----
// `netBorrowing` is the year-on-year movement in `debt`, and
// fcfe = ocf − capex + netBorrowing. NSE Emerge requires FCFE to be
// positive in 2 of the last 3 years, so FY21 is deliberately negative —
// the company was still building the Baner line that year.
export const FINANCIALS = [
  { fy: 'FY21', revenue: 2184, ebitda: 262, pat: 96, netWorth: 892, nta: 640, debt: 720, ocf: 142, capex: 305, netBorrowing: 80, fcfe: -83 },
  { fy: 'FY22', revenue: 3421, ebitda: 468, pat: 258, netWorth: 1234, nta: 1010, debt: 610, ocf: 386, capex: 175, netBorrowing: -110, fcfe: 101 },
  { fy: 'FY23', revenue: 4863, ebitda: 712, pat: 421, netWorth: 1852, nta: 1418, debt: 540, ocf: 604, capex: 210, netBorrowing: -70, fcfe: 324 },
]

export const RATIOS = {
  revenueCagr: '49.2%',
  ebitdaMargin: '14.6%',
  patMargin: '8.7%',
  roe: '22.7%',
  debtEquity: '0.29',
  currentRatio: '1.84',
}

// ---- Cap table (pre-issue) ----
// Holders are ordered by size, so the swatches are a sequential ramp
// (one hue, dark → light) rather than six unrelated hues. Identity is
// carried by the adjacent legend text, never by colour alone.
export const CAP_TABLE = [
  { holder: 'Ananya Deshpande', role: 'Promoter · MD', pct: 34.2, color: '#1E3A6E' },
  { holder: 'Rohan Kulkarni', role: 'Promoter · WTD', pct: 28.6, color: '#2B58A8' },
  { holder: 'Kartik Gaikwad', role: 'Angel Investor', pct: 7.0, color: '#3E76D4' },
  { holder: 'Om Bhorkade', role: 'Angel Investor', pct: 6.0, color: '#4B7BEC' },
  { holder: 'Sahil Gadam', role: 'Investor', pct: 5.5, color: '#6098EF' },
  { holder: 'Khushi Chakke', role: 'Investor', pct: 5.0, color: '#92BEF7' },
  { holder: 'Vansh Jaiswal', role: 'Investor', pct: 4.1, color: '#C3DAFB' },
  { holder: 'ESOP Pool', role: 'Employees', pct: 6.1, color: '#7DB7F8' },
  { holder: 'Others', role: '—', pct: 3.5, color: '#A7BCDD' },
]

// ---- Source documents (feed the many-to-many mapping) ----
export const DOCS = [
  { id: 'AF', name: 'Audited Financials FY21–FY23', short: 'Audited Fin.', kind: 'Financial' },
  { id: 'CI', name: 'Certificate of Incorporation, MoA & AoA', short: 'Incorp.', kind: 'Corporate' },
  { id: 'BR', name: 'Board & Shareholder Resolutions', short: 'Resolutions', kind: 'Corporate' },
  { id: 'CT', name: 'Cap Table & Register of Members', short: 'Cap Table', kind: 'Corporate' },
  { id: 'KY', name: 'Promoter / Director KYC & DIN', short: 'KYC / DIN', kind: 'People' },
  { id: 'LT', name: 'Litigation & Regulatory Search', short: 'Litigation', kind: 'Legal' },
  { id: 'MC', name: 'Material Contracts & Leases', short: 'Contracts', kind: 'Legal' },
  { id: 'AR', name: "Statutory Auditor's Report", short: 'Auditor Rpt', kind: 'Financial' },
]

// ---- KYC / data-capture phases ----
export type PhaseStatus = 'done' | 'attention' | 'active' | 'todo'
export const PHASES: {
  id: string; title: string; sub: string; status: PhaseStatus;
  items: { label: string; note?: string; status: 'done' | 'attention' }[]
}[] = [
  {
    id: 'identity', title: 'Given Values Cross-Checks', sub: 'Cross-checking Company Base details against uploaded source documents', status: 'attention',
    items: [
      { label: 'Cross-check: Company Name (Satvik Foods Limited) matches Certificate of Incorporation', note: 'Match confirmed: Satvik Foods Limited', status: 'done' },
      { label: 'Cross-check: Registered Office address matches lease agreement', note: 'Match confirmed: Plot 42, Baner Industrial Estate, Pune', status: 'done' },
      { label: 'Cross-check: PAN / GSTIN matches MCA records', note: 'Match confirmed: AAJCS4821K / 27AAJCS4821K1ZP', status: 'done' },
      { label: 'Cross-check: ITR Entity Name matches Company Base', note: 'Mismatch: ITR reports MONT BLANC CONSTRUCTION LIMITED', status: 'attention' },
    ],
  },
  {
    id: 'people', title: 'Promoters & Directors', sub: 'KYC, DIN & shareholding of key persons', status: 'attention',
    items: [
      { label: '2 Promoters — PAN & DIN verified', status: 'done' },
      { label: '4 Board seats mapped (2 Executive, 2 Independent)', status: 'done' },
      { label: 'Independent Director DIN pending confirmation', note: 'Mr. S. Iyer — DIN validation awaited', status: 'attention' },
      { label: 'Promoter group & relatives disclosure built', status: 'done' },
    ],
  },
  {
    id: 'financials', title: 'Financial Information', sub: 'Audited accounts, ratios & restated summary', status: 'done',
    items: [
      { label: 'FY21–FY23 audited financials ingested', status: 'done' },
      { label: 'Restated summary statements generated', status: 'done' },
      { label: 'Key ratios & CAGR computed', note: 'Revenue CAGR 49.2%', status: 'done' },
      { label: "Auditor's report & CARO annexure attached", status: 'done' },
    ],
  },
  {
    id: 'capital', title: 'Capital Structure', sub: 'Cap table, share classes & ESOP', status: 'done',
    items: [
      { label: 'Register of members reconciled', status: 'done' },
      { label: 'Equity history & bonus/split trail built', status: 'done' },
      { label: 'ESOP pool (6.1%) & vesting schedule mapped', status: 'done' },
      { label: 'Pre & post-issue shareholding modelled', status: 'done' },
    ],
  },
  {
    id: 'legal', title: 'Legal & Litigation', sub: 'Cases, notices & regulatory actions', status: 'attention',
    items: [
      { label: 'Litigation search across courts & tribunals', status: 'done' },
      { label: 'Pending indirect-tax matter flagged', note: '₹18.4 lakh GST demand — under appeal', status: 'attention' },
      { label: 'No winding-up / insolvency proceedings found', status: 'done' },
      { label: 'Director disqualification check — clear', status: 'done' },
    ],
  },
  {
    id: 'contracts', title: 'Material Contracts', sub: 'Supply, distribution & lease agreements', status: 'done',
    items: [
      { label: 'Two key supply agreements parsed', status: 'done' },
      { label: 'Quick-commerce distribution MoU reviewed', status: 'done' },
      { label: 'Baner manufacturing lease (9 yrs) verified', status: 'done' },
      { label: 'Trademark & IP assignments confirmed', status: 'done' },
    ],
  },
]

// ---- Eligibility criteria ----
// Tested against the NSE Emerge norms as they stand after the SEBI
// (ICDR) (Amendment) Regulations, 2025 — which added the ₹1 crore
// EBITDA floor, the OFS cap and the general-corporate-purposes cap, and
// which sit alongside NSE's own positive-FCFE and 3:1 leverage tests.
// Values are computed from FINANCIALS / CAPITAL rather than restated,
// so the verdict moves if the underlying figures move.
const _ebitdaYearsAboveOneCr = FINANCIALS.filter((f) => f.ebitda >= 100).length
const _fcfePositiveYears = FINANCIALS.filter((f) => f.fcfe > 0).length
const _netWorthPositiveYears = FINANCIALS.filter((f) => f.netWorth > 0).length
const _latestFin = FINANCIALS[FINANCIALS.length - 1]
const _gcpCapCr = Math.min(ISSUE.sizeCr * 0.15, 10)
const _gcpAmtCr = 2.9 // mirrors OBJECTS below

const _criteria = [
  { title: '1. Incorporation', req: 'Under Companies Act, 1956 / 2013', val: 'Companies Act, 2013', ok: true, note: 'Incorporated on 14 March 2016 under the Companies Act, 2013.' },
  { title: '2. Post-issue paid-up capital', req: '≤ ₹25 crore', val: `₹${CAPITAL_DERIVED.postIssueCapitalCr.toFixed(2)} Cr`, ok: CAPITAL_DERIVED.postIssueCapitalCr <= 25, note: 'Within the platform ceiling after the fresh issue.' },
  { title: '3. Net tangible assets', req: '≥ ₹1.5 crore', val: `₹${(_latestFin.nta / 100).toFixed(2)} Cr`, ok: _latestFin.nta / 100 >= 1.5, note: 'Latest audited balance sheet shows ₹14.18 Cr.' },
  { title: '4. Track record', req: '≥ 3 years (combined proprietorship/partnership)', val: '10 years', ok: true, note: 'Incorporated 14 March 2016; operating history is 10 years.' },
  { title: '5. Operating profit (EBITDA)', req: 'Positive in 2 of preceding 3 FY', val: `Positive in ${_ebitdaYearsAboveOneCr} of 3 FY`, ok: _ebitdaYearsAboveOneCr >= 2, note: 'FY21: ₹2.62 Cr · FY22: ₹4.68 Cr · FY23: ₹7.12 Cr.' },
  { title: '6. Promoter lock-in', req: 'No promoter change for 1 year post-IPO', val: 'Locked (no change)', ok: true, note: 'Undertaking signed by promoters committing to no change for one year.' },
  { title: '7. Regulatory compliance', req: 'No disqualifications or trading suspensions', val: 'Clear', ok: true, note: 'Clear search across SEBI and stock exchange databases.' },
]

export const ELIGIBILITY = {
  /** Share of criteria cleared, so the headline can never contradict the list. */
  score: Math.round((_criteria.filter((c) => c.ok).length / _criteria.length) * 100),
  verdict: 'Eligible for NSE Emerge',
  summary:
    'Satvik Foods clears every quantitative norm for the NSE Emerge SME platform, including the ₹1 crore EBITDA floor introduced in 2025. One disclosed indirect-tax matter needs a counsel note but is not disqualifying.',
  criteria: _criteria,
}

// ---- DRHP sections (with completeness, sources, flags) ----
export type SectionFlag = { type: 'gap' | 'inconsistency'; text: string }
export const SECTIONS: {
  no: string; title: string; complete: number; sources: string[]; flags: SectionFlag[]
}[] = [
  { no: 'I', title: 'Cover Page & Issue Details', complete: 100, sources: ['CI', 'BR', 'CT'], flags: [] },
  { no: 'II', title: 'Definitions & Abbreviations', complete: 100, sources: ['CI'], flags: [] },
  { no: 'III', title: 'Risk Factors', complete: 82, sources: ['AF', 'LT', 'MC', 'CT'], flags: [{ type: 'gap', text: 'Promoter-concentration risk needs quantification' }] },
  { no: 'IV', title: 'Introduction & General Information', complete: 96, sources: ['CI', 'BR'], flags: [] },
  { no: 'V', title: 'Industry Overview', complete: 88, sources: ['AF'], flags: [] },
  { no: 'VI', title: 'Our Business', complete: 95, sources: ['MC', 'AF', 'CI'], flags: [] },
  { no: 'VII', title: 'Financial Information', complete: 91, sources: ['AF', 'AR'], flags: [{ type: 'inconsistency', text: 'FY22 PAT in narrative differs from audited figure' }] },
  { no: 'VIII', title: 'Capital Structure', complete: 100, sources: ['CT', 'BR'], flags: [] },
  { no: 'IX', title: 'Objects of the Issue', complete: 100, sources: ['BR', 'AF'], flags: [] },
  { no: 'X', title: 'Basis for Issue Price', complete: 74, sources: ['AF', 'CT'], flags: [{ type: 'gap', text: 'Listed-peer P/E comparison incomplete (2 comparables)' }] },
  { no: 'XI', title: 'Legal & Other Regulatory Disclosures', complete: 79, sources: ['LT', 'MC'], flags: [{ type: 'gap', text: 'Counsel note pending for GST appeal' }] },
  { no: 'XII', title: 'Our Management (Board & KMP)', complete: 93, sources: ['KY', 'BR'], flags: [{ type: 'gap', text: '1 independent director DIN unverified' }] },
  { no: 'XIII', title: 'Promoters & Promoter Group', complete: 90, sources: ['KY', 'CT'], flags: [] },
  { no: 'XIV', title: 'Declaration', complete: 100, sources: ['BR'], flags: [] },
]

// ---- Gaps & inconsistencies (aggregated) ----
export const GAPS: {
  id: string; severity: 'high' | 'medium' | 'low'; type: string; title: string; detail: string; location: string
}[] = [
  {
    id: 'fy22-pat-mismatch',
    severity: 'high', type: 'Inconsistency',
    title: 'FY22 PAT mismatch between narrative and audited financials',
    detail: 'The Financial Information section narrative cites FY22 PAT of ₹2.34 Cr, while the restated audited statements show ₹2.58 Cr. Figures must reconcile before certification.',
    location: 'Section VII · Financial Information',
  },
  {
    id: 'gst-counsel-note',
    severity: 'high', type: 'Gap',
    title: 'Counsel note required for pending GST appeal',
    detail: 'A ₹18.4 lakh indirect-tax demand is under appeal. SEBI ICDR requires a legal counsel note and quantified contingent-liability disclosure in the Legal section.',
    location: 'Section XI · Legal & Regulatory',
  },
  {
    id: 'director-din',
    severity: 'medium', type: 'Gap',
    title: 'Independent Director DIN unverified',
    detail: 'DIN for Mr. S. Iyer (Independent Director) is awaiting MCA validation. Board composition disclosure cannot be certified until confirmed.',
    location: 'Section XII · Our Management',
  },
  {
    id: 'peer-pe-gap',
    severity: 'medium', type: 'Gap',
    title: 'Peer P/E comparison incomplete',
    detail: 'Basis for Issue Price lists only 2 of the required 3–5 listed comparables. Add peer set with P/E, P/B and RoNW to substantiate the price band.',
    location: 'Section X · Basis for Issue Price',
  },
  {
    id: 'promoter-risk-quant',
    severity: 'low', type: 'Gap',
    title: 'Promoter-concentration risk not quantified',
    detail: 'Risk Factors flags promoter concentration qualitatively. Add quantified post-issue promoter holding (42.7%) and voting-control implications.',
    location: 'Section III · Risk Factors',
  },
]

// ---- Objects of the issue ----
// Objects are funded out of NET proceeds, not the gross issue size:
//   gross ₹32.00 Cr − issue expenses ₹2.60 Cr = net ₹29.40 Cr.
// General corporate purposes is held to ₹2.90 Cr, inside the 2025 cap of
// the lower of 15% of the issue size (₹4.80 Cr) and ₹10 Cr.
export const OBJECTS = [
  { purpose: 'Setting up a new millet-processing line at Baner facility', amtCr: 13.0 },
  { purpose: 'Funding incremental working-capital requirements', amtCr: 9.0 },
  { purpose: 'Brand-building & digital marketing spend', amtCr: 4.5 },
  { purpose: 'General corporate purposes', amtCr: 2.9 },
]

// ---- Board & KMP ----
export const BOARD = [
  { name: 'Ananya Deshpande', role: 'Managing Director & Promoter', tenure: 'Since 2016' },
  { name: 'Rohan Kulkarni', role: 'Whole-time Director & Promoter', tenure: 'Since 2016' },
  { name: 'S. Iyer', role: 'Independent Director', tenure: 'Since 2022' },
  { name: 'Meera Nair', role: 'Independent Director', tenure: 'Since 2023' },
]

// ---- Crawl steps for the ingestion animation ----
export const CRAWL_STEPS = [
  { label: 'Resolving domain & fetching homepage', meta: 'satvikfoods.in', ms: 1300 },
  { label: 'Discovering pages — About, Products, Investors, Contact', meta: '18 pages', ms: 3000 },
  { label: 'Extracting company identity & registered address', meta: 'CIN, GSTIN', ms: 1900 },
  { label: 'Detecting sector, product lines & business model', meta: 'D2C · FMCG', ms: 2400 },
  { label: 'Parsing press mentions & funding history', meta: '2 rounds', ms: 2600 },
  { label: 'Cross-referencing MCA master data', meta: 'MCA registry', ms: 3400 },
  { label: 'Building company knowledge base', meta: '42 attributes', ms: 1700 },
]


export const SOURCE_MAP: Record<string, string[]> = {
  CI: ['coi', 'coi-conversion', 'moa-aoa'],
  BR: ['board-resolution', 'special-resolution'],
  CT: ['register-members', 'shareholders-agreement', 'tripartite'],
  AF: ['audited-financials', 'restated-financials', 'auditor-report', 'capitalisation', 'accounting-ratios', 'tax-benefits', 'indebtedness', 'working-capital'],
  KY: ['promoter-kyc', 'din-consents', 'dir8', 'committees', 'promoter-group', 'employment-agreements', 'defaulter-declarations'],
  LT: ['litigation-search', 'tax-notices', 'counsel-opinion', 'materiality-policy', 'statutory-dues', 'regulatory-correspondence', 'itr-acknowledgement'],
  MC: ['facility-lease', 'supply-agreements', 'distribution-mou', 'related-party', 'insurance', 'ipo-intermediaries'],
  AR: ['auditor-report']
}

export function getLogicalSectionCompleteness(no: string, docRecords: Record<string, any>): number {
  const section = SECTIONS.find((s) => s.no === no)
  if (!section) return 0
  const sources = section.sources
  if (!sources || sources.length === 0) return 100
  let total = 0
  let uploaded = 0
  sources.forEach((src) => {
    const list = SOURCE_MAP[src] || []
    total += list.length
    list.forEach((id) => {
      if (docRecords[id]) uploaded++
    })
  })
  if (total === 0) return 100
  return Math.round((uploaded / total) * 100)
}

export function getCombinedGaps(docRecords: Record<string, any>) {
  const list = [...GAPS]
  const missingDocs = MANDATORY_DOCS.filter((d) => !docRecords[d.id])
  missingDocs.forEach((doc) => {
    list.push({
      id: `missing-doc-${doc.id}`,
      severity: 'high',
      type: 'Missing Document',
      title: `Required document not uploaded: ${doc.name}`,
      detail: `The mandatory document "${doc.name}" is missing. This document is required under ${doc.basis} for the DRHP chapters: ${doc.chapters.join(', ')}. Merchant Banker review or upload is required.`,
      location: 'Required Documents',
    })
  })
  return list
}
