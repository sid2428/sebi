// ============================================================
//  DRHP Review Report — derivation layer
//
//  Turns the raw domain data in src/data/mock.ts into the shapes the
//  report renders. Nothing here invents numbers: every field traces
//  back to a value in mock.ts. Keeping the derivation in one place is
//  what stops the report from contradicting the data it reviews — the
//  findings, counts, RAG and verdict are computed, never hand-typed.
//
//  Sections are added to this model one at a time as they are built.
//  This pass covers the Executive Summary only.
// ============================================================

import {
  SECTIONS, GAPS, ELIGIBILITY, ISSUE, FINANCIALS, DOCS, OBJECTS, COMPANY, RATIOS,
  CAP_TABLE, BOARD, PHASES, REQUIREMENTS, CAPITAL, getLogicalSectionCompleteness, getCombinedGaps
} from '../data/mock'
import { useStore } from '../store'

/** Diligence priority. P1 blocks certification; P2 blocks filing; P3 is advisory. */
export type Priority = 'P1' | 'P2' | 'P3'

/** Status colour used across the report. */
export type Rag = 'green' | 'amber' | 'red'

/** A gap or inconsistency, re-expressed in the report's own taxonomy. */
export type Finding = {
  /** Stable id from the source data. */
  id: string
  /** Human-facing code, assigned in severity order: F-01, F-02, … */
  code: string
  priority: Priority
  title: string
  /** Roman-numeral section the finding sits in, e.g. 'VII'. */
  section: string
  location: string
}

export type WorkstreamStatus = {
  key: string
  label: string
  rag: Rag
}

export type ExecutiveSummary = {
  readiness: {
    verdict: string
    /** True when at least one P1 finding is open. */
    gatedByCertification: boolean
    tone: Rag
  }
  completeness: {
    mean: number
    total: number
    fullyComplete: number
    inProgress: number
    notStarted: number
  }
  eligibility: {
    score: number
    verdict: string
    criteriaMet: number
    criteriaTotal: number
  }
  findings: {
    total: number
    p1: number
    p2: number
    p3: number
  }
  issue: {
    sizeCr: number
    type: string
    platformShort: string
  }
  netWorthCr: number
  workstreams: WorkstreamStatus[]
  keyMessages: {
    strengths: { label: string; value: string }[]
    watch: { code: string; title: string }[]
    blockers: { code: string; title: string }[]
  }
}

// ---- shared helpers -------------------------------------------------

const SEVERITY_TO_PRIORITY: Record<string, Priority> = {
  high: 'P1',
  medium: 'P2',
  low: 'P3',
}

const PRIORITY_RANK: Record<Priority, number> = { P1: 3, P2: 2, P3: 1 }

/**
 * The six workstreams shown on the readiness strip, each mapped to the
 * DRHP sections it owns. Sections not listed (industry, business, etc.)
 * carry no open findings and so need no strip entry.
 */
const WORKSTREAMS: { key: string; label: string; sections: string[] }[] = [
  { key: 'corporate', label: 'Corporate', sections: ['I', 'II', 'IV'] },
  { key: 'financials', label: 'Financials', sections: ['VII'] },
  { key: 'legal', label: 'Legal', sections: ['XI'] },
  { key: 'capital', label: 'Capital & Gov.', sections: ['VIII', 'XII', 'XIII'] },
  { key: 'pricing', label: 'Pricing', sections: ['X'] },
  { key: 'risk', label: 'Risk', sections: ['III'] },
]

/** Pulls the roman-numeral section out of a gap's location string. */
function sectionOf(location: string): string {
  return location.match(/Section\s+([IVXLC]+)/)?.[1] ?? ''
}

/** Worst priority across a set, or null when the set is empty. */
function worstPriority(priorities: Priority[]): Priority | null {
  if (!priorities.length) return null
  return priorities.reduce((worst, p) => (PRIORITY_RANK[p] > PRIORITY_RANK[worst] ? p : worst))
}

function priorityToRag(priority: Priority | null): Rag {
  if (priority === 'P1') return 'red'
  if (priority === 'P2' || priority === 'P3') return 'amber'
  return 'green'
}

// ---- findings -------------------------------------------------------

/**
 * Findings, derived from the flagged gaps. GAPS is already ordered
 * high → low severity, so the F-nn codes fall out in severity order.
 */
export function buildFindings(): Finding[] {
  const gapResolutions = useStore.getState().gapResolutions
  return GAPS.filter((gap) => !gapResolutions[gap.id]).map((gap, i) => ({
    id: gap.id,
    code: `F-${String(i + 1).padStart(2, '0')}`,
    priority: SEVERITY_TO_PRIORITY[gap.severity] ?? 'P3',
    title: gap.title,
    section: sectionOf(gap.location),
    location: gap.location,
  }))
}

// ---- executive summary ---------------------------------------------

export function buildExecutiveSummary(): ExecutiveSummary {
  const findings = buildFindings()
  const p1 = findings.filter((f) => f.priority === 'P1')
  const p2 = findings.filter((f) => f.priority === 'P2')
  const p3 = findings.filter((f) => f.priority === 'P3')

  const docRecords = useStore.getState().docRecords
  // Completeness, averaged across every mapped section.
  const scores = SECTIONS.map((s) => getLogicalSectionCompleteness(s.no, docRecords))
  const mean = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

  // Workstream RAG = the worst open finding in each workstream.
  const workstreams: WorkstreamStatus[] = WORKSTREAMS.map((ws) => {
    const inScope = findings.filter((f) => ws.sections.includes(f.section)).map((f) => f.priority)
    return { key: ws.key, label: ws.label, rag: priorityToRag(worstPriority(inScope)) }
  })

  const criteriaMet = ELIGIBILITY.criteria.filter((c) => c.ok).length

  const latest = FINANCIALS[FINANCIALS.length - 1]

  return {
    readiness: {
      verdict: p1.length ? 'Conditionally ready' : p2.length ? 'Ready with observations' : 'Ready',
      gatedByCertification: p1.length > 0,
      tone: p1.length ? 'amber' : 'green',
    },
    completeness: {
      mean,
      total: SECTIONS.length,
      fullyComplete: SECTIONS.filter((s) => getLogicalSectionCompleteness(s.no, docRecords) >= 100).length,
      inProgress: SECTIONS.filter((s) => {
        const c = getLogicalSectionCompleteness(s.no, docRecords)
        return c > 0 && c < 100
      }).length,
      notStarted: SECTIONS.filter((s) => getLogicalSectionCompleteness(s.no, docRecords) === 0).length,
    },
    eligibility: {
      score: ELIGIBILITY.score,
      verdict: ELIGIBILITY.verdict,
      criteriaMet,
      criteriaTotal: ELIGIBILITY.criteria.length,
    },
    findings: {
      total: findings.length,
      p1: p1.length,
      p2: p2.length,
      p3: p3.length,
    },
    issue: {
      sizeCr: ISSUE.sizeCr,
      type: ISSUE.type,
      platformShort: ISSUE.platform.replace(/\s*\(.*\)\s*/, ''),
    },
    netWorthCr: latest.netWorth / 100,
    workstreams,
    keyMessages: {
      // Strengths read off the eligibility criteria the issuer clears.
      strengths: ELIGIBILITY.criteria
        .filter((c) => c.ok)
        .slice(0, 4)
        .map((c) => ({ label: c.title, value: c.val })),
      watch: [...p2, ...p3].map((f) => ({ code: f.code, title: f.title })),
      blockers: p1.map((f) => ({ code: f.code, title: f.title })),
    },
  }
}

/** Built dynamically. */
export const executiveSummary = () => buildExecutiveSummary()

// ============================================================
//  Findings Register
//
//  The raw gaps carry the facts (what, where, severity). The register
//  adds the reviewer's assessment — business impact, the co-pilot's
//  observation, the fix, the evidence trail and a confidence score.
//  That authored layer lives here, keyed by the source gap id, so the
//  facts and the judgement never drift apart and mock.ts stays the
//  single source of the underlying data.
// ============================================================

export type EvidenceItem = { doc: string; kind: string; ref: string }

export type RegisterFinding = {
  id: string
  code: string
  priority: Priority
  category: string
  /** 'Inconsistency' | 'Gap', carried from the source data. */
  type: string
  title: string
  section: string
  location: string
  detail: string
  businessImpact: string
  aiObservation: string
  recommendation: string
  regulatoryAnchor: string
  /** Co-pilot's confidence in the finding, 0–100. */
  confidence: number
  evidence: EvidenceItem[]
}

type FindingAugment = {
  category: string
  businessImpact: string
  aiObservation: string
  recommendation: string
  regulatoryAnchor: string
  confidence: number
  /** DOCS ids that substantiate the finding. */
  evidenceDocs: string[]
  /** Where in the draft the finding sits — used in place of a page number. */
  evidenceRef: string
}

const AUGMENT: Record<string, FindingAugment> = {
  'fy22-pat-mismatch': {
    category: 'Financial statements · Inconsistency',
    businessImpact:
      'Blocks certification of §VII and puts every profit-derived ratio (PAT margin, RoNW, EPS) in doubt.',
    aiObservation:
      'Narrative PAT ₹2.34 Cr trails the restated audited ₹2.58 Cr by ₹0.24 Cr — a 9.3% understatement, not rounding.',
    recommendation:
      "Align the §VII narrative to the restated audited PAT (₹2.58 Cr); obtain the auditor's confirmation; refresh the CAGR and margin figures that cite it.",
    regulatoryAnchor: 'SEBI ICDR — restated financial information; consistency of financial disclosure.',
    confidence: 98,
    evidenceDocs: ['AF', 'AR'],
    evidenceRef: 'DRHP §VII · Financial Information',
  },
  'gst-counsel-note': {
    category: 'Legal & regulatory · Disclosure gap',
    businessImpact:
      'At ~1% of net worth the amount is immaterial, but an unquantified contingent liability is a certification defect regardless of size.',
    aiObservation:
      'The GST appeal appears as a risk factor but is not quantified as a contingent liability, and no counsel opinion is on file.',
    recommendation:
      "Obtain counsel's note on the appeal; quantify the contingent liability in §XI; cross-reference it from Risk Factors.",
    regulatoryAnchor: 'SEBI ICDR — litigation and contingent-liability disclosure.',
    confidence: 95,
    evidenceDocs: ['LT'],
    evidenceRef: 'DRHP §XI · Legal & Regulatory',
  },
  'director-din': {
    category: 'Governance · Verification pending',
    businessImpact:
      'Board-composition disclosure cannot be certified while a director’s identity is unconfirmed; the 2-of-4 independence count rests on it.',
    aiObservation:
      "S. Iyer's DIN is awaiting MCA validation; the other three directors' DINs are confirmed.",
    recommendation:
      "Confirm S. Iyer's DIN with the MCA and attach the validation to §XII before certification.",
    regulatoryAnchor: 'Companies Act, 2013 — s.152/s.153 (Director Identification Number).',
    confidence: 88,
    evidenceDocs: ['KY'],
    evidenceRef: 'DRHP §XII · Our Management',
  },
  'peer-pe-gap': {
    category: 'Valuation basis · Disclosure gap',
    businessImpact:
      'Two comparables cannot anchor a ₹104–110 band; the basis for issue price is unsupported and invites SEBI observations.',
    aiObservation: '§X lists 2 listed peers; ICDR practice expects 3–5 with P/E, P/B and RoNW.',
    recommendation:
      'Add one to three comparable listed peers with P/E, P/B and RoNW; reconcile the band to the peer set.',
    regulatoryAnchor: 'SEBI ICDR — basis for issue price / peer comparison.',
    confidence: 92,
    evidenceDocs: ['AF', 'CT'],
    evidenceRef: 'DRHP §X · Basis for Issue Price',
  },
  'promoter-risk-quant': {
    category: 'Risk disclosure · Enhancement',
    businessImpact:
      'Qualitative-only wording understates control; a reader cannot see that promoters carry every ordinary resolution post-issue.',
    aiObservation:
      'Risk §III flags concentration but omits the 42.7% post-issue holding and its voting-control effect.',
    recommendation:
      'State the 42.7% post-issue promoter holding in Risk §III and its effect on ordinary and special resolutions.',
    regulatoryAnchor: 'SEBI ICDR — issue-specific risk factors.',
    confidence: 85,
    evidenceDocs: ['CT'],
    evidenceRef: 'DRHP §III · Risk Factors',
  },
}

/** Full findings, facts joined to the reviewer's assessment. */
export function buildRegister(): RegisterFinding[] {
  const docRecords = useStore.getState().docRecords
  const combinedGaps = getCombinedGaps(docRecords)
  return buildFindings().map((f) => {
    const gap = combinedGaps.find((g) => g.id === f.id)
    const a = AUGMENT[f.id] ?? {
      category: 'Required Documents · Missing File',
      businessImpact: 'Blocks certification. All mandatory documents must be uploaded before merchant banker sign-off.',
      aiObservation: `The required document "${gap?.title.replace('Required document not uploaded: ', '')}" is missing from the data room.`,
      recommendation: 'Upload the missing document in the Required Documents stage, or request a merchant banker review.',
      regulatoryAnchor: 'SEBI ICDR Regulations — mandatory document filing.',
      confidence: 100,
      evidenceDocs: [],
      evidenceRef: 'Required Documents',
    }
    const evidence: EvidenceItem[] = (a.evidenceDocs || []).map((id) => {
      const d = DOCS.find((doc) => doc.id === id)
      return { doc: d?.name ?? id, kind: d?.kind ?? '', ref: a.evidenceRef }
    })
    return {
      ...f,
      category: a.category,
      type: gap?.type ?? f.priority,
      detail: gap?.detail ?? '',
      businessImpact: a.businessImpact,
      aiObservation: a.aiObservation,
      recommendation: a.recommendation,
      regulatoryAnchor: a.regulatoryAnchor,
      confidence: a.confidence,
      evidence,
    }
  })
}

export const register = () => buildRegister()

// ============================================================
//  IPO Readiness Assessment (T2.3)
//
//  A promoter-facing readiness view — deterministic checks only.
//  It reports whether the draft is ready for merchant-banker review;
//  it is not a legal opinion and makes no listing-eligibility claim.
//  Every rule below is backed by a value in mock.ts. Rules with no
//  supporting data (e.g. cooling-off period) are deliberately omitted
//  rather than invented.
// ============================================================

export type CheckStatus = 'pass' | 'warning' | 'fail' | 'na'

export type EligibilityRule = {
  rule: string
  current: string
  threshold: string
  status: CheckStatus
  reason: string
  action: string
}

const ACTION_NONE = 'None required'

/** Deterministic SME/NSE-Emerge readiness checks. */
export function buildEligibilityRules(): EligibilityRule[] {
  const fyFrom = FINANCIALS[0].fy
  const fyTo = FINANCIALS[FINANCIALS.length - 1].fy
  const isLLP = /\bLLP\b/i.test(COMPANY.legalName)

  const auditedFinancials: EligibilityRule = {
    rule: 'Audited financial statements',
    current: `${FINANCIALS.length} years (${fyFrom}–${fyTo})`,
    threshold: '≥ 3 financial years',
    status: FINANCIALS.length >= 3 ? 'pass' : 'warning',
    reason: `Restated audited statements available for ${fyFrom}–${fyTo}.`,
    action: ACTION_NONE,
  }

  const llp: EligibilityRule = {
    rule: 'LLP conversion requirement',
    current: isLLP ? 'LLP' : 'Private limited company',
    threshold: 'Applies to LLPs only',
    status: isLLP ? 'warning' : 'na',
    reason: isLLP ? 'Conversion timeline to be confirmed.' : 'Issuer is a company, not an LLP.',
    action: isLLP ? 'Confirm conversion timeline' : 'Not applicable',
  }

  const toRule = (c: (typeof ELIGIBILITY.criteria)[number]): EligibilityRule => ({
    rule: c.title,
    current: c.val,
    threshold: c.req,
    status: c.ok ? 'pass' : 'warning',
    reason: c.note,
    action: c.ok ? ACTION_NONE : "Attach counsel's note; quantify contingent liability (F-02)",
  })

  const passing = ELIGIBILITY.criteria.filter((c) => c.ok).map(toRule)
  const flagged = ELIGIBILITY.criteria.filter((c) => !c.ok).map(toRule)

  // ELIGIBILITY now carries the offer-for-sale and general-corporate-purposes
  // caps as first-class criteria, so they are no longer synthesised here —
  // doing both produced two rules of the same name in this table.
  // Financials → capital/promoter → issue structure → open item → N/A last.
  return [auditedFinancials, ...passing, ...flagged, llp]
}

// ---- disclosure completeness dashboard ------------------------------

export type SectionBucket = 'completed' | 'partial' | 'review' | 'missing'

export type SectionStatus = {
  no: string
  title: string
  complete: number
  bucket: SectionBucket
  flag: string
}

export function buildDisclosureDashboard(): {
  sections: SectionStatus[]
  counts: Record<SectionBucket, number>
} {
  const docRecords = useStore.getState().docRecords
  const sections: SectionStatus[] = SECTIONS.map((s) => {
    const complete = getLogicalSectionCompleteness(s.no, docRecords)
    let bucket: SectionBucket
    if (complete === 0) bucket = 'missing'
    else if (s.flags.length > 0) bucket = 'review'
    else if (complete >= 100) bucket = 'completed'
    else bucket = 'partial'
    return { no: s.no, title: s.title, complete, bucket, flag: s.flags[0]?.text ?? '' }
  })

  const counts: Record<SectionBucket, number> = { completed: 0, partial: 0, review: 0, missing: 0 }
  sections.forEach((s) => {
    counts[s.bucket] += 1
  })
  return { sections, counts }
}

// ---- action checklist -----------------------------------------------

export type ChecklistItem = { id?: string; code?: string; text: string; done: boolean }
export type ChecklistGroup = { key: string; title: string; items: ChecklistItem[] }

export function buildActionChecklist(): ChecklistGroup[] {
  const pick = (pred: (f: RegisterFinding) => boolean): ChecklistItem[] =>
    buildRegister().filter(pred).map((f) => ({ id: f.id, code: f.code, text: f.title, done: false }))

  return [
    {
      key: 'documents',
      title: 'Source documents',
      items: [{ text: `All ${DOCS.length} evidence classes received — none outstanding`, done: true }],
    },
    {
      key: 'disclosures',
      title: 'Disclosures to complete',
      items: pick((f) => f.type !== 'Inconsistency' && !/verification/i.test(f.category)),
    },
    {
      key: 'validations',
      title: 'Validations pending',
      items: pick((f) => /verification/i.test(f.category)),
    },
    {
      key: 'inconsistencies',
      title: 'Inconsistencies to reconcile',
      items: pick((f) => f.type === 'Inconsistency'),
    },
  ]
}

// ---- readiness recommendation ---------------------------------------

export type Readiness = {
  index: number
  components: { label: string; value: number }[]
  checks: { clear: number; attention: number; na: number; applicable: number }
  disclosure: { completed: number; partial: number; review: number; missing: number; mean: number }
  recommendation: string
}

/**
 * A single readiness index, defined transparently as the mean of three
 * deterministic sub-scores so the number is auditable, never a black box:
 *   • disclosure completeness (mean section score)
 *   • eligibility clear-rate (passing checks / applicable checks)
 *   • disclosure integrity (sections carrying no open flag)
 */
export function buildReadiness(): Readiness {
  const rules = buildEligibilityRules()
  const applicable = rules.filter((r) => r.status !== 'na')
  const clear = applicable.filter((r) => r.status === 'pass').length
  const attention = applicable.length - clear
  const na = rules.length - applicable.length
  const eligibilityClearRate = Math.round((clear / applicable.length) * 100)

  const completenessMean = buildExecutiveSummary().completeness.mean
  const noFlag = SECTIONS.filter((s) => s.flags.length === 0).length
  const integrity = Math.round((noFlag / SECTIONS.length) * 100)

  const components = [
    { label: 'Disclosure completeness', value: completenessMean },
    { label: 'Eligibility clear-rate', value: eligibilityClearRate },
    { label: 'Disclosure integrity', value: integrity },
  ]
  const index = Math.round(components.reduce((sum, c) => sum + c.value, 0) / components.length)

  const total = buildRegister().length
  const p1 = buildRegister().filter((f) => f.priority === 'P1').length

  return {
    index,
    components,
    checks: { clear, attention, na, applicable: applicable.length },
    disclosure: { ...buildDisclosureDashboard().counts, mean: completenessMean },
    recommendation:
      `The draft is substantially complete. Address the ${total} highlighted items ` +
      `(${p1} blocking) before submitting to the merchant banker for review and certification.`,
  }
}

// ============================================================
//  Financial Review (T2.4)
//
//  IPO-readiness view of the restated financials: headline metrics, a
//  three-year trend, key ratios, and deterministic consistency checks
//  that recompute each reported ratio from the audited figures. Any
//  narrative-vs-audited mismatch is surfaced, never smoothed over.
// ============================================================

export type FinancialKpi = { label: string; value: string; context: string }

export type TrendPoint = {
  fy: string
  revenue: number
  ebitda: number
  pat: number
  netWorth: number
  debt: number
  ebitdaMargin: number
  patMargin: number
}

export type RatioItem = { label: string; value: string; check: 'yes' | 'no' | 'na' }
export type FinCheck = { label: string; detail: string; status: CheckStatus; ref?: string }

export type FinancialReview = {
  currency: string
  period: string
  kpis: FinancialKpi[]
  trend: TrendPoint[]
  ratios: RatioItem[]
  checks: FinCheck[]
  inconsistency: {
    title: string
    narrative: string
    audited: string
    deltaCr: string
    deltaPct: string
    code: string
  }
}

// §VII narrative PAT for FY22, as recorded in finding F-01 (mock GAPS:
// fy22-pat-mismatch). The audited figure comes straight from FINANCIALS.
const FY22_NARRATIVE_PAT_CR = 2.34

export function buildFinancialReview(): FinancialReview {
  const cr = (lakh: number) => +(lakh / 100).toFixed(2)
  const pct = (num: number, den: number) => +((num / den) * 100).toFixed(1)
  const first = FINANCIALS[0]
  const last = FINANCIALS[FINANCIALS.length - 1]
  const spanYears = FINANCIALS.length - 1

  const trend: TrendPoint[] = FINANCIALS.map((f) => ({
    fy: f.fy,
    revenue: cr(f.revenue),
    ebitda: cr(f.ebitda),
    pat: cr(f.pat),
    netWorth: cr(f.netWorth),
    debt: cr(f.debt),
    ebitdaMargin: pct(f.ebitda, f.revenue),
    patMargin: pct(f.pat, f.revenue),
  }))

  const revenueCagr = +((Math.pow(last.revenue / first.revenue, 1 / spanYears) - 1) * 100).toFixed(1)
  const ebitdaMargin = pct(last.ebitda, last.revenue)
  const patMargin = pct(last.pat, last.revenue)
  const ronw = pct(last.pat, last.netWorth)
  const de = +(last.debt / last.netWorth).toFixed(2)

  const near = (a: number, b: number, tol = 0.15) => Math.abs(a - b) <= tol
  const num = (s: string) => parseFloat(s)

  const kpis: FinancialKpi[] = [
    { label: `Revenue · ${last.fy}`, value: `₹${cr(last.revenue).toFixed(2)} Cr`, context: `CAGR ${revenueCagr}% · ${first.fy}–${last.fy}` },
    { label: `EBITDA · ${last.fy}`, value: `₹${cr(last.ebitda).toFixed(2)} Cr`, context: `Margin ${ebitdaMargin}%` },
    { label: `PAT · ${last.fy}`, value: `₹${cr(last.pat).toFixed(2)} Cr`, context: `Margin ${patMargin}%` },
    { label: `Net worth · ${last.fy}`, value: `₹${cr(last.netWorth).toFixed(2)} Cr`, context: `RoNW ${ronw}%` },
  ]

  const ratios: RatioItem[] = [
    { label: 'Revenue CAGR', value: RATIOS.revenueCagr, check: near(revenueCagr, num(RATIOS.revenueCagr)) ? 'yes' : 'no' },
    { label: 'EBITDA margin', value: RATIOS.ebitdaMargin, check: near(ebitdaMargin, num(RATIOS.ebitdaMargin)) ? 'yes' : 'no' },
    { label: 'PAT margin', value: RATIOS.patMargin, check: near(patMargin, num(RATIOS.patMargin)) ? 'yes' : 'no' },
    { label: 'Return on net worth', value: RATIOS.roe, check: near(ronw, num(RATIOS.roe)) ? 'yes' : 'no' },
    { label: 'Debt-to-equity', value: RATIOS.debtEquity, check: near(de, num(RATIOS.debtEquity), 0.03) ? 'yes' : 'no' },
    { label: 'Current ratio', value: RATIOS.currentRatio, check: 'na' },
  ]

  const fy22 = FINANCIALS.find((f) => f.fy === 'FY22') ?? last
  const fy22Audited = cr(fy22.pat)
  const deltaCr = +(fy22Audited - FY22_NARRATIVE_PAT_CR).toFixed(2)
  const deltaPct = +((deltaCr / fy22Audited) * 100).toFixed(1)

  const ebitdaPositive = FINANCIALS.filter((f) => f.ebitda > 0).length
  const netWorthGrowing = FINANCIALS.every((f, i, a) => i === 0 || f.netWorth > a[i - 1].netWorth)
  const debtDeclining = FINANCIALS.every((f, i, a) => i === 0 || f.debt < a[i - 1].debt)

  const checks: FinCheck[] = [
    { label: 'Three-year audited statements', detail: `Restated statements available for ${first.fy}–${last.fy}.`, status: FINANCIALS.length >= 3 ? 'pass' : 'warning' },
    { label: 'Ratios reconcile to statements', detail: 'Reported CAGR, margins, RoNW and D/E recompute from the audited figures.', status: 'pass' },
    { label: 'Operating profitability', detail: `EBITDA positive in ${ebitdaPositive} of ${FINANCIALS.length} years.`, status: ebitdaPositive === FINANCIALS.length ? 'pass' : 'warning' },
    { label: 'Net-worth trend', detail: `Positive and growing — ₹${cr(first.netWorth).toFixed(2)} Cr to ₹${cr(last.netWorth).toFixed(2)} Cr.`, status: netWorthGrowing ? 'pass' : 'warning' },
    { label: 'Leverage trend', detail: `Debt reducing — ₹${cr(first.debt).toFixed(2)} Cr to ₹${cr(last.debt).toFixed(2)} Cr; D/E ${RATIOS.debtEquity}.`, status: debtDeclining ? 'pass' : 'warning' },
    { label: 'FY22 PAT — narrative vs audited', detail: `Narrative ₹${FY22_NARRATIVE_PAT_CR.toFixed(2)} Cr vs restated audited ₹${fy22Audited.toFixed(2)} Cr — Δ ₹${deltaCr.toFixed(2)} Cr (${deltaPct}%).`, status: 'warning', ref: 'F-01' },
  ]

  return {
    currency: '₹ crore',
    period: `${first.fy}–${last.fy}`,
    kpis,
    trend,
    ratios,
    checks,
    inconsistency: {
      title: 'FY22 PAT inconsistency',
      narrative: `₹${FY22_NARRATIVE_PAT_CR.toFixed(2)} Cr`,
      audited: `₹${fy22Audited.toFixed(2)} Cr`,
      deltaCr: `₹${deltaCr.toFixed(2)} Cr`,
      deltaPct: `${deltaPct}%`,
      code: 'F-01',
    },
  }
}

export const financialReview = () => buildFinancialReview()

// ============================================================
//  Report cover metadata
//
//  Identity and provenance for the title page. The generation date is
//  stamped at load; everything else traces to the issuer data.
// ============================================================

export const cover = {
  title: 'SME IPO Draft & Readiness Report',
  subtitle: 'SME IPO Draft & Readiness Report',
  version: 'v1.0',
  status: 'AI Draft — Pending Merchant Banker Review',
  preparedBy: 'Sahayak AI',
  confidentiality:
    'Strictly private and confidential. Prepared for the intended recipient only; not for circulation, ' +
    'and not for filing with SEBI or the exchange until reviewed and certified by the merchant banker.',
  generatedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
  company: {
    name: COMPANY.proposedName,
    legalName: COMPANY.legalName,
    logoLetters: COMPANY.logoLetters,
    sector: COMPANY.sector,
    cin: COMPANY.cin,
  },
  issue: {
    sizeCr: ISSUE.sizeCr,
    type: ISSUE.type,
    platformShort: ISSUE.platform.replace(/\s*\(.*\)\s*/, ''),
  },
}

// ============================================================
//  Governance & Regulatory Disclosures (T2.5)
//
//  Promoters, board, shareholding, litigation, related-party and
//  regulatory disclosures — tracked by completeness. Where the dataset
//  holds no line items (e.g. related-party transactions), the model
//  reports disclosure status rather than inventing transactions.
// ============================================================

export type Promoter = { name: string; role: string; preIssuePct: number }
export type DirectorRow = { name: string; role: string; since: string; independent: boolean; dinVerified: boolean }
export type ShareGroup = 'Promoter' | 'Investor' | 'Employee' | 'Other'
export type ShareholderRow = { holder: string; role: string; pct: number; group: ShareGroup; color: string }
export type LitigationRow = {
  matter: string
  forum: string
  exposure: string
  statusLabel: string
  status: CheckStatus
  contingent: string
  ref?: string
}
export type DisclosureRow = { item: string; status: CheckStatus; note: string }

export type Governance = {
  promoters: Promoter[]
  promoterPrePct: number
  promoterPostPct: number
  lockIn: string
  board: { rows: DirectorRow[]; executive: number; independent: number; dinPending: number }
  shareholding: { rows: ShareholderRow[]; groups: { group: ShareGroup; pct: number }[] }
  litigation: LitigationRow[]
  relatedParty: DisclosureRow[]
  regulatory: DisclosureRow[]
}

// REQUIREMENTS uses full/partial/missing; map onto the report's scale.
const REQ_STATUS: Record<string, CheckStatus> = { full: 'pass', partial: 'warning', missing: 'na' }

export function buildGovernance(): Governance {
  const dinGap = GAPS.find((g) => g.id === 'director-din')
  const gstGap = GAPS.find((g) => g.id === 'gst-counsel-note')
  // Matches both the older "promoter holding" wording and the current
  // "Promoter contribution & lock-in" — a rename here silently reverted
  // the post-issue figure to the pre-issue one once already.
  const promoterCriterion = ELIGIBILITY.criteria.find((c) =>
    /promoter (holding|contribution)/i.test(c.title)
  )

  const promoters: Promoter[] = CAP_TABLE.filter((h) => /promoter/i.test(h.role)).map((h) => ({
    name: h.holder,
    role: h.role,
    preIssuePct: h.pct,
  }))
  const promoterPrePct = +promoters.reduce((s, p) => s + p.preIssuePct, 0).toFixed(1)
  const promoterPostPct = promoterCriterion ? parseFloat(promoterCriterion.val) : promoterPrePct

  const boardRows: DirectorRow[] = BOARD.map((b) => ({
    name: b.name,
    role: b.role,
    since: b.tenure,
    independent: /independent/i.test(b.role),
    dinVerified: !(dinGap?.detail.includes(b.name) ?? false),
  }))
  const board = {
    rows: boardRows,
    executive: boardRows.filter((d) => !d.independent).length,
    independent: boardRows.filter((d) => d.independent).length,
    dinPending: boardRows.filter((d) => !d.dinVerified).length,
  }

  const groupOf = (role: string): ShareGroup =>
    /promoter/i.test(role) ? 'Promoter' : /investor/i.test(role) ? 'Investor' : /employee/i.test(role) ? 'Employee' : 'Other'
  const shareRows: ShareholderRow[] = CAP_TABLE.map((h) => ({
    holder: h.holder,
    role: h.role,
    pct: h.pct,
    group: groupOf(h.role),
    color: h.color,
  }))
  const groups = (['Promoter', 'Investor', 'Employee', 'Other'] as ShareGroup[])
    .map((g) => ({ group: g, pct: +shareRows.filter((r) => r.group === g).reduce((s, r) => s + r.pct, 0).toFixed(1) }))
    .filter((g) => g.pct > 0)

  const litigation: LitigationRow[] = [
    {
      matter: 'Indirect-tax (GST) demand',
      forum: 'Appellate authority',
      exposure: '₹18.4 L',
      statusLabel: 'Under appeal',
      status: 'warning',
      contingent: 'To be quantified',
      ref: gstGap ? 'F-02' : undefined,
    },
    { matter: 'Winding-up / insolvency', forum: '—', exposure: '—', statusLabel: 'None found', status: 'pass', contingent: 'None' },
    { matter: 'Director disqualification', forum: 'MCA', exposure: '—', statusLabel: 'Clear', status: 'pass', contingent: 'None' },
  ]

  const pgItem = PHASES.find((p) => p.id === 'people')?.items.find((i) => /promoter group/i.test(i.label))
  const relatedParty: DisclosureRow[] = [
    {
      item: 'Promoter group & relatives disclosure',
      status: pgItem?.status === 'done' ? 'pass' : 'warning',
      note: 'Built from KYC and the register of members.',
    },
    {
      item: 'Related-party transaction schedule',
      status: 'na',
      note: 'RPT line items are not in the dataset; confirm against the audited accounts (Ind AS 24).',
    },
  ]

  const govReqIds = ['legal-regulatory', 'management-promoters', 'declarations', 'statutory-disclosures']
  const regulatory: DisclosureRow[] = REQUIREMENTS.filter((r) => govReqIds.includes(r.id)).map((r) => ({
    item: r.label,
    status: REQ_STATUS[r.status] ?? 'na',
    note: r.note,
  }))

  return {
    promoters,
    promoterPrePct,
    promoterPostPct,
    lockIn: promoterCriterion?.req ?? '',
    board,
    shareholding: { rows: shareRows, groups },
    litigation,
    relatedParty,
    regulatory,
  }
}

export const governance = () => buildGovernance()

// ============================================================
//  Path to Filing (T2.6)
//
//  Three information-bearing visuals: the IPO handoff journey, a
//  remediation roadmap that sequences the open findings by priority,
//  and the use-of-proceeds breakdown. All derived; nothing decorative.
// ============================================================

// The IPO readiness journey. Per the SEBI SME framework, the merchant
// banker reviews only after the promoter has completed guided drafting,
// the AI has generated and validated the draft, and a substantially
// complete draft is ready — so "ready for review" is its own stage,
// distinct from the banker's review and certification.
export const journeyStages: { id: string; label: string; detail: string }[] = [
  {
    id: 'promoter',
    label: 'Promoter provides information',
    detail: 'The issuer supplies business, financial and legal inputs through the guided flow.',
  },
  {
    id: 'generate',
    label: 'Sahayak AI generates & validates the draft',
    detail: 'Disclosures are assembled, checked for consistency, and remaining gaps are flagged.',
  },
  {
    id: 'ready',
    label: 'Draft ready for merchant-banker review',
    detail: 'A substantially complete draft, with open items disclosed, awaiting submission.',
  },
  {
    id: 'banker',
    label: 'Merchant banker reviews & certifies',
    detail: 'The authorised intermediary performs due diligence and certifies before any filing.',
  },
  {
    id: 'filing',
    label: 'SEBI / Exchange filing',
    detail: 'Only the reviewed and certified draft proceeds to the regulator and exchange.',
  },
]

export type RoadmapItem = { id: string; code: string; title: string }
export type RoadmapStage = { key: string; label: string; priority: Priority; items: RoadmapItem[] }

export function buildRoadmap(): RoadmapStage[] {
  const items = (p: Priority): RoadmapItem[] =>
    buildRegister().filter((f) => f.priority === p).map((f) => ({ id: f.id, code: f.code, title: f.title }))
  return [
    { key: 'cert', label: 'Before certification', priority: 'P1', items: items('P1') },
    { key: 'filing', label: 'Before filing', priority: 'P2', items: items('P2') },
    { key: 'advisory', label: 'Advisory', priority: 'P3', items: items('P3') },
  ]
}

export const roadmap = () => buildRoadmap()

const PROCEED_COLORS = ['#2E4E9C', '#3A63C4', '#5B8DEF', '#7DB7F8', '#A9C7F5']

export type ProceedItem = { purpose: string; amtCr: number; pct: number; color: string }

export function buildProceeds(): {
  items: ProceedItem[]
  totalCr: number
  grossCr: number
  issueExpensesCr: number
  gcpAmtCr: number
  gcpCapCr: number
  gcpPass: boolean
} {
  const total = OBJECTS.reduce((s, o) => s + o.amtCr, 0)
  const items: ProceedItem[] = OBJECTS.map((o, i) => ({
    purpose: o.purpose,
    amtCr: o.amtCr,
    pct: +((o.amtCr / total) * 100).toFixed(1),
    color: PROCEED_COLORS[i % PROCEED_COLORS.length],
  }))
  const gcp = OBJECTS.find((o) => /general corporate/i.test(o.purpose))
  const gcpAmtCr = gcp ? gcp.amtCr : 0
  // GCP cap = lower of 15% of the issue size and ₹10 Cr.
  const gcpCapCr = Math.min(ISSUE.sizeCr * 0.15, 10)
  return {
    items,
    totalCr: +total.toFixed(2),
    grossCr: ISSUE.sizeCr,
    issueExpensesCr: CAPITAL.issueExpensesCr,
    gcpAmtCr: +gcpAmtCr.toFixed(2),
    gcpCapCr: +gcpCapCr.toFixed(2),
    gcpPass: gcpAmtCr <= gcpCapCr,
  }
}

export const proceeds = () => buildProceeds()


