// Entry point bundled by dump-drhp-data.mjs. Re-exports exactly the domain
// values the offer document is typeset from, so the PDF and the UI can never
// disagree about a number.

import {
  COMPANY, ISSUE, CAPITAL, CAPITAL_DERIVED, FINANCIALS, RATIOS, CAP_TABLE,
  OBJECTS, BOARD, SECTIONS, GAPS, ELIGIBILITY, DOCS, GLOSSARY,
} from '../src/data/mock'
import { SECTION_DRAFTS } from '../src/data/drafts'

export const payload = {
  company: COMPANY,
  issue: ISSUE,
  capital: CAPITAL,
  capitalDerived: CAPITAL_DERIVED,
  financials: FINANCIALS,
  ratios: RATIOS,
  capTable: CAP_TABLE,
  objects: OBJECTS,
  board: BOARD,
  sections: SECTIONS,
  gaps: GAPS,
  eligibility: ELIGIBILITY,
  docs: DOCS,
  glossary: GLOSSARY,
  // First pass of each section's drafted prose — what the synthesis stage
  // shows before anyone hits "Regenerate".
  drafts: Object.fromEntries(
    Object.entries(SECTION_DRAFTS).map(([no, variants]) => [no, variants[0]])
  ),
}
