// ============================================================
//  Sahayak DRHP — Document collection model
//
//  The issuer hands over evidence in the order a DRHP is actually
//  assembled. Tracks map 1:1 onto the chapter groups of a real SME
//  offer document — the structure and the document inventory are taken
//  from the sample DRHP (Gemini Edibles & Fats India Limited), from its
//  "Material Contracts and Documents for Inspection" list and its
//  "Government and Other Approvals" chapter, and from the disclosure
//  buckets in Schedule VI of the SEBI (ICDR) Regulations, 2018.
//
//  Everything is mocked against the anchor issuer, Satvik Foods.
// ============================================================

/** What verification pulls off the page once a document is read. */
export type ExtractedField = { label: string; value: string }

export type DocNecessity = 'mandatory' | 'conditional'

export type RequiredDoc = {
  id: string
  name: string
  /** Plain-language: what this is, in one line. */
  detail: string
  /** The provision that asks for it — shown as the authority chip. */
  basis: string
  /** DRHP chapters this document feeds. */
  chapters: string[]
  necessity: DocNecessity
  /** Accepted file types, for the picker and the hint line. */
  accept: string
  /**
   * Registry-backed documents can be pulled rather than uploaded. The
   * string names the registry so the button can say where it goes.
   */
  autoSource?: string
  /** What the co-pilot reports having read off the document. */
  extracts: ExtractedField[]
  /** Shown as the placeholder filename on an auto-fetch. */
  sample: string
  /**
   * Set where the mock deliberately produces a finding, so the flow has
   * something real for the issuer to deal with rather than all-green.
   */
  flag?: { tone: 'warn' | 'bad'; text: string }
}

export type DocTrack = {
  id: string
  title: string
  /** The DRHP section heading this track sits under. */
  drhpSection: string
  sub: string
  /** Why the section exists, in the issuer's language. */
  why: string
  docs: RequiredDoc[]
}

// ============================================================
//  Track 1 — Corporate records & capital structure
// ============================================================

const corporate: RequiredDoc[] = [
  {
    id: 'coi',
    name: 'Certificate of Incorporation',
    detail: 'The certificate issued when Satvik Foods was first registered, in March 2016.',
    basis: 'Companies Act, 2013 · s.7',
    chapters: ['History & Corporate Matters', 'General Information'],
    necessity: 'mandatory',
    accept: 'PDF',
    autoSource: 'MCA registry',
    sample: 'CoI_Satvik_Foods_2016.pdf',
    extracts: [
      { label: 'CIN', value: 'U15490PN2016PTC167432' },
      { label: 'Date of incorporation', value: '14 March 2016' },
      { label: 'Registrar', value: 'RoC — Pune, Maharashtra' },
      { label: 'Original name', value: 'Satvik Foods Private Limited' },
    ],
  },
  {
    id: 'coi-conversion',
    name: 'Fresh Certificate of Incorporation on conversion',
    detail:
      'Only a public limited company can make a public issue. This is the fresh certificate issued when the private company converted.',
    basis: 'Companies Act, 2013 · s.18',
    chapters: ['History & Corporate Matters', 'Capital Structure'],
    necessity: 'mandatory',
    accept: 'PDF',
    autoSource: 'MCA registry',
    sample: 'CoI_Conversion_Public_Ltd.pdf',
    extracts: [
      { label: 'New name', value: 'Satvik Foods Limited' },
      { label: 'Conversion date', value: '22 January 2026' },
      { label: 'Status', value: 'Public company limited by shares' },
    ],
  },
  {
    id: 'moa-aoa',
    name: 'Memorandum & Articles of Association',
    detail:
      'The constitutional documents, as amended to date. The objects clause has to cover everything the business actually does.',
    basis: 'ICDR Schedule VI · Companies Act s.4, s.5',
    chapters: ['History & Corporate Matters', 'Description of Equity Shares'],
    necessity: 'mandatory',
    accept: 'PDF',
    autoSource: 'MCA registry',
    sample: 'MoA_AoA_amended.pdf',
    extracts: [
      { label: 'Main objects', value: 'Manufacture & trade in food products' },
      { label: 'Authorised capital', value: '₹12.00 crore' },
      { label: 'Last amended', value: '22 January 2026' },
      { label: 'Objects cover current business', value: 'Yes' },
    ],
  },
  {
    id: 'board-resolution',
    name: 'Board resolution authorising the offer',
    detail: 'The board meeting minute in which the directors approved going to the public market.',
    basis: 'Companies Act, 2013 · s.179(3)',
    chapters: ['General Information', 'Other Regulatory Disclosures'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Board_Resolution_Offer.pdf',
    extracts: [
      { label: 'Meeting date', value: '18 February 2026' },
      { label: 'Issue authorised', value: 'Fresh Issue up to ₹32.00 crore' },
      { label: 'Directors present', value: '4 of 4' },
    ],
  },
  {
    id: 'special-resolution',
    name: 'Shareholders’ special resolution',
    detail:
      'A further issue of shares to the public needs a three-fourths majority of shareholders, passed at a general meeting.',
    basis: 'Companies Act, 2013 · s.62(1)(c)',
    chapters: ['Capital Structure', 'Other Regulatory Disclosures'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Special_Resolution_EGM.pdf',
    extracts: [
      { label: 'Meeting', value: 'Extraordinary General Meeting' },
      { label: 'Date', value: '4 March 2026' },
      { label: 'Votes in favour', value: '96.5%' },
    ],
  },
  {
    id: 'register-members',
    name: 'Register of Members & share transfer history',
    detail:
      'The statutory register behind your cap table. Every allotment, transfer, bonus and split since 2016 has to reconcile to it.',
    basis: 'Companies Act, 2013 · s.88 · ICDR Schedule VI',
    chapters: ['Capital Structure'],
    necessity: 'mandatory',
    accept: 'PDF, XLSX',
    sample: 'Register_of_Members.xlsx',
    extracts: [
      { label: 'Holders on record', value: '6' },
      { label: 'Promoter holding (pre-issue)', value: '62.8%' },
      { label: 'ESOP pool', value: '6.1%' },
      { label: 'Reconciles to cap table', value: 'Yes' },
    ],
  },
  {
    id: 'shareholders-agreement',
    name: 'Shareholders’ & share subscription agreements',
    detail:
      'The investor agreements with Kartik, Om, Sahil, Khushi & Vansh. Special rights must be disclosed and normally fall away on listing.',
    basis: 'ICDR Schedule VI · LODR Reg. 31A',
    chapters: ['Capital Structure', 'History & Corporate Matters'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'SHA_Investor_Group.pdf',
    extracts: [
      { label: 'Investors', value: 'Kartik Gaikwad, Om Bhorkade, Sahil Gadam, Khushi Chakke, Vansh Jaiswal' },
      { label: 'Executed', value: '11 August 2021' },
      { label: 'Special rights', value: 'Board seat, anti-dilution' },
      { label: 'Termination on listing', value: 'Not stated' },
    ],
    flag: {
      tone: 'warn',
      text: 'Special rights do not expressly fall away on listing — needs an amendment or termination deed.',
    },
  },
  {
    id: 'tripartite',
    name: 'Tripartite agreements with NSDL & CDSL',
    detail: 'Shares must be capable of being held in demat form before they can be listed.',
    basis: 'Depositories Act, 1996 · ICDR Reg. 269',
    chapters: ['Offer Procedure', 'General Information'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Tripartite_NSDL_CDSL.pdf',
    extracts: [
      { label: 'ISIN', value: 'INE0QK901018' },
      { label: 'NSDL agreement', value: 'Executed 6 March 2026' },
      { label: 'CDSL agreement', value: 'Executed 6 March 2026' },
    ],
  },
]

// ============================================================
//  Track 2 — Financial information
// ============================================================

const financial: RequiredDoc[] = [
  {
    id: 'audited-financials',
    name: 'Audited financial statements, FY21–FY23',
    detail:
      'Three full years of audited accounts. These are the base figures every number in the draft is checked against.',
    basis: 'ICDR Schedule VI · Reg. 11(1)',
    chapters: ['Restated Financial Information', 'Summary of Financial Information'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Audited_Financials_FY21_FY23.pdf',
    extracts: [
      { label: 'FY23 revenue', value: '₹48.63 crore' },
      { label: 'FY23 EBITDA', value: '₹7.12 crore' },
      { label: 'FY23 PAT', value: '₹4.21 crore' },
      { label: 'Net worth (FY23)', value: '₹18.52 crore' },
      { label: 'Audit opinion', value: 'Unmodified' },
    ],
  },
  {
    id: 'restated-financials',
    name: 'Restated financial information & examination report',
    detail:
      'Your audited accounts re-cast into the format SEBI prescribes, examined and signed off by a peer-reviewed auditor.',
    basis: 'ICDR Schedule VI · Reg. 11(1)',
    chapters: ['Restated Financial Information'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Restated_Financial_Information.pdf',
    extracts: [
      { label: 'Period covered', value: 'FY21, FY22, FY23' },
      { label: 'Examining auditor', value: 'Peer-reviewed · ICAI reg. valid' },
      { label: 'FY22 PAT (restated)', value: '₹2.58 crore' },
      { label: 'Restatement adjustments', value: '3 recorded' },
    ],
    flag: {
      tone: 'bad',
      text: 'Restated FY22 PAT of ₹2.58 Cr does not agree with the ₹2.34 Cr used in the business narrative.',
    },
  },
  {
    id: 'auditor-report',
    name: 'Statutory auditor’s report with CARO annexure',
    detail:
      'The auditor’s formal report for each year, including the CARO annexure on statutory dues, related parties and fixed assets.',
    basis: 'Companies Act, 2013 · s.143 · CARO 2020',
    chapters: ['Restated Financial Information', 'Risk Factors'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Auditors_Report_CARO.pdf',
    extracts: [
      { label: 'Qualifications', value: 'None' },
      { label: 'CARO adverse remarks', value: 'None' },
      { label: 'Statutory dues', value: 'Regular, except disputed GST' },
    ],
  },
  {
    id: 'capitalisation',
    name: 'Capitalisation statement',
    detail: 'Debt and equity as they stand today, and as they will stand after the issue.',
    basis: 'ICDR Schedule VI · Part A',
    chapters: ['Capitalisation Statement', 'Capital Structure'],
    necessity: 'mandatory',
    accept: 'PDF, XLSX',
    sample: 'Capitalisation_Statement.xlsx',
    extracts: [
      { label: 'Debt (pre-issue)', value: '₹5.40 crore' },
      { label: 'Equity (pre-issue)', value: '₹18.52 crore' },
      { label: 'Debt / equity (pre)', value: '0.29' },
      { label: 'Debt / equity (post)', value: '0.11' },
    ],
  },
  {
    id: 'accounting-ratios',
    name: 'Statement of accounting ratios',
    detail:
      'Earnings per share, return on net worth, net asset value and EBITDA — the figures that justify your price band.',
    basis: 'ICDR Schedule VI · Basis for Offer Price',
    chapters: ['Basis for Offer Price', 'Other Financial Information'],
    necessity: 'mandatory',
    accept: 'PDF, XLSX',
    sample: 'Accounting_Ratios.xlsx',
    extracts: [
      { label: 'Basic EPS (FY23)', value: '₹6.79' },
      { label: 'Return on net worth', value: '22.7%' },
      { label: 'NAV per share (pre-issue)', value: '₹29.87' },
      { label: 'P/E at cap price', value: '16.2×' },
    ],
  },
  {
    id: 'tax-benefits',
    name: 'Statement of possible special tax benefits',
    detail:
      'A note from your auditor on the tax benefits available to the company and to its shareholders after listing.',
    basis: 'ICDR Schedule VI · Part A, Cl. 9(J)',
    chapters: ['Statement of Special Tax Benefits'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Special_Tax_Benefits.pdf',
    extracts: [
      { label: 'Issued by', value: 'Statutory auditor' },
      { label: 'Company benefits', value: 'Sec. 115BAA concessional rate' },
      { label: 'Shareholder benefits', value: 'Sec. 112A / 111A stated' },
    ],
  },
  {
    id: 'indebtedness',
    name: 'Sanction letters & loan agreements',
    detail:
      'Every borrowing, with its terms and security. Lender consent is usually needed before a company can list.',
    basis: 'ICDR Schedule VI · Financial Indebtedness',
    chapters: ['Financial Indebtedness', 'Risk Factors'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Sanction_Letters_Facilities.pdf',
    extracts: [
      { label: 'Facilities outstanding', value: '2 (term loan, CC)' },
      { label: 'Aggregate outstanding', value: '₹5.40 crore' },
      { label: 'Lender', value: 'Bank of Maharashtra' },
      { label: 'Lender NOC for IPO', value: 'Awaited' },
    ],
    flag: { tone: 'warn', text: 'Lender no-objection for the listing has not been received yet.' },
  },
  {
    id: 'working-capital',
    name: 'Working-capital assessment note',
    detail:
      'The basis on which you estimated the ₹9.00 crore working-capital object — holding periods, certified by the auditor.',
    basis: 'ICDR Reg. 230 · Objects of the Offer',
    chapters: ['Objects of the Offer', 'MD&A'],
    necessity: 'mandatory',
    accept: 'PDF, XLSX',
    sample: 'Working_Capital_Assessment.pdf',
    extracts: [
      { label: 'Inventory days', value: '46' },
      { label: 'Receivable days', value: '38' },
      { label: 'Payable days', value: '41' },
      { label: 'Auditor certified', value: 'Yes' },
    ],
  },
]

// ============================================================
//  Track 3 — Statutory registrations & business licences
// ============================================================

const statutory: RequiredDoc[] = [
  {
    id: 'pan-tan',
    name: 'Company PAN & TAN',
    detail: 'The company’s permanent account number and tax deduction account number.',
    basis: 'Income Tax Act, 1961',
    chapters: ['Government & Other Approvals'],
    necessity: 'mandatory',
    accept: 'PDF, JPG',
    autoSource: 'Income Tax database',
    sample: 'PAN_TAN_Satvik.pdf',
    extracts: [
      { label: 'PAN', value: 'AAJCS4821K' },
      { label: 'TAN', value: 'PNES19472B' },
      { label: 'Status', value: 'Active' },
    ],
  },
  {
    id: 'gst',
    name: 'GST registration certificates',
    detail: 'One certificate for each state you operate in. All of them are disclosed in the approvals chapter.',
    basis: 'CGST Act, 2017 · s.25',
    chapters: ['Government & Other Approvals'],
    necessity: 'mandatory',
    accept: 'PDF',
    autoSource: 'GSTN portal',
    sample: 'GST_Registrations.pdf',
    extracts: [
      { label: 'Primary GSTIN', value: '27AAJCS4821K1ZP' },
      { label: 'States registered', value: 'Maharashtra, Karnataka' },
      { label: 'Filing status', value: 'Returns current to Jan 2026' },
    ],
  },
  {
    id: 'fssai',
    name: 'FSSAI Central Licence',
    detail:
      'You manufacture and sell packaged food, so a central food licence is the single most material approval in your file.',
    basis: 'Food Safety and Standards Act, 2006',
    chapters: ['Government & Other Approvals', 'Our Business', 'Key Regulations'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'FSSAI_Central_Licence.pdf',
    extracts: [
      { label: 'Licence no.', value: '10019064002537' },
      { label: 'Type', value: 'Central — Manufacturer' },
      { label: 'Premises', value: 'Baner, Pune' },
      { label: 'Valid until', value: '30 September 2026' },
    ],
  },
  {
    id: 'factory-licence',
    name: 'Factory licence',
    detail: 'The licence to run the Baner manufacturing unit, issued by the state factories inspectorate.',
    basis: 'Factories Act, 1948 · s.6',
    chapters: ['Government & Other Approvals', 'Our Business'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Factory_Licence_Baner.pdf',
    extracts: [
      { label: 'Licence no.', value: 'MH/PUN/041/2019' },
      { label: 'Workers permitted', value: '180' },
      { label: 'Valid until', value: '31 December 2026' },
    ],
  },
  {
    id: 'pollution-consent',
    name: 'Consent to Operate — pollution control board',
    detail: 'Consent from the Maharashtra Pollution Control Board to run the plant under the water and air statutes.',
    basis: 'Water Act, 1974 · Air Act, 1981',
    chapters: ['Government & Other Approvals', 'Risk Factors'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'MPCB_Consent_to_Operate.pdf',
    extracts: [
      { label: 'Issuing board', value: 'Maharashtra PCB' },
      { label: 'Category', value: 'Green' },
      { label: 'Valid until', value: '31 March 2027' },
    ],
  },
  {
    id: 'legal-metrology',
    name: 'Legal Metrology packer registration',
    detail: 'Required because you sell in pre-packaged form with declared weights on the label.',
    basis: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    chapters: ['Government & Other Approvals', 'Key Regulations'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Legal_Metrology_Packer.pdf',
    extracts: [
      { label: 'Registration no.', value: 'LM/PKR/MH/2287' },
      { label: 'Category', value: 'Manufacturer & packer' },
      { label: 'Valid until', value: '14 June 2027' },
    ],
  },
  {
    id: 'labour-registrations',
    name: 'EPF, ESI & Shops and Establishments registrations',
    detail: 'Your labour-law registrations across the plant, the office and the depots.',
    basis: 'EPF Act, 1952 · ESI Act, 1948',
    chapters: ['Government & Other Approvals'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Labour_Registrations.pdf',
    extracts: [
      { label: 'EPF code', value: 'MHPUN2298471000' },
      { label: 'ESI code', value: '34000512930000999' },
      { label: 'Employees covered', value: '148' },
    ],
  },
  {
    id: 'fire-noc',
    name: 'Fire safety no-objection certificate',
    detail: 'The fire NOC for the Baner premises.',
    basis: 'Maharashtra Fire Prevention Act, 2006',
    chapters: ['Government & Other Approvals'],
    necessity: 'conditional',
    accept: 'PDF',
    sample: 'Fire_NOC_Baner.pdf',
    extracts: [
      { label: 'Issued by', value: 'Pune Fire Brigade' },
      { label: 'Status', value: 'Renewal filed 12 Feb 2026' },
    ],
    flag: { tone: 'warn', text: 'Renewal application is pending — disclose as a pending approval.' },
  },
  {
    id: 'trademarks',
    name: 'Trademark registrations & IP assignments',
    detail:
      'The “Satvik” word mark and logo. If the brand sits with a promoter rather than the company, that has to be assigned and disclosed.',
    basis: 'Trade Marks Act, 1999 · ICDR Schedule VI',
    chapters: ['Our Business', 'Risk Factors', 'Government & Other Approvals'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Trademark_Certificates.pdf',
    extracts: [
      { label: 'Marks registered', value: '3 (Class 29, 30)' },
      { label: 'Registered proprietor', value: 'Satvik Foods Limited' },
      { label: 'Assignment from promoter', value: 'Recorded 2019' },
    ],
  },
  {
    id: 'itr-acknowledgement',
    name: 'Income Tax Return (ITR-6) Acknowledgement',
    detail: 'Income tax return acknowledgement for the preceding financial year.',
    basis: 'Income Tax Act, 1961 · s.139',
    chapters: ['Government & Other Approvals', 'Financial Information'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'ITR6_Acknowledgement_2025.pdf',
    extracts: [
      { label: 'Entity Name', value: 'MONT BLANC CONSTRUCTION LIMITED' },
      { label: 'PAN', value: 'AACCM396G' },
      { label: 'Acknowledgement Number', value: '823066891101225' },
      { label: 'Assessment Year', value: '2025-26' },
      { label: 'Filing Date', value: '10 December 2025' },
    ],
    flag: {
      tone: 'bad',
      text: 'Entity name on ITR (MONT BLANC CONSTRUCTION LIMITED) does not match the company base name (Satvik Foods Limited).',
    },
  },
]

// ============================================================
//  Track 4 — Promoters, directors & management
// ============================================================

const people: RequiredDoc[] = [
  {
    id: 'promoter-kyc',
    name: 'Promoter identity & KYC particulars',
    detail:
      'PAN, Aadhaar, passport and bank particulars for both promoters. These are filed with the exchange, not printed in the draft.',
    basis: 'ICDR Schedule VI · Our Promoters',
    chapters: ['Our Promoters & Promoter Group'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Promoter_KYC_Pack.pdf',
    extracts: [
      { label: 'Promoters', value: 'Ananya Deshpande, Rohan Kulkarni' },
      { label: 'PAN verified', value: '2 of 2' },
      { label: 'Passport particulars', value: 'On file' },
    ],
  },
  {
    id: 'din-consents',
    name: 'DIN records & Form DIR-2 consents',
    detail: 'Director identification numbers, and each director’s written consent to act.',
    basis: 'Companies Act, 2013 · s.152 · Rule 8',
    chapters: ['Our Management'],
    necessity: 'mandatory',
    accept: 'PDF',
    autoSource: 'MCA registry',
    sample: 'DIN_DIR2_Consents.pdf',
    extracts: [
      { label: 'Directors on board', value: '4' },
      { label: 'DIN verified', value: '3 of 4' },
      { label: 'Pending', value: 'S. Iyer — Independent Director' },
    ],
    flag: { tone: 'warn', text: 'DIN for Mr. S. Iyer is still awaiting MCA validation.' },
  },
  {
    id: 'dir8',
    name: 'Form DIR-8 non-disqualification declarations',
    detail:
      'Each director declares they are not disqualified. A disqualified director is a hard stop on the whole issue.',
    basis: 'Companies Act, 2013 · s.164(2)',
    chapters: ['Our Management', 'Other Regulatory Disclosures'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'DIR8_Declarations.pdf',
    extracts: [
      { label: 'Declarations received', value: '4 of 4' },
      { label: 'Any disqualification', value: 'None' },
    ],
  },
  {
    id: 'committees',
    name: 'Board committee constitution resolutions',
    detail:
      'Audit Committee, Nomination & Remuneration Committee and Stakeholders Relationship Committee, each properly constituted.',
    basis: 'Companies Act s.177, s.178 · LODR Reg. 18–20',
    chapters: ['Our Management'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Committee_Resolutions.pdf',
    extracts: [
      { label: 'Audit Committee', value: 'Constituted · ID majority' },
      { label: 'NRC', value: 'Constituted' },
      { label: 'SRC', value: 'Constituted' },
    ],
  },
  {
    id: 'promoter-group',
    name: 'Promoter group & relatives declaration',
    detail:
      'Who counts as promoter group is defined by regulation, not by choice. It drives the related-party disclosures.',
    basis: 'ICDR Reg. 2(1)(pp)',
    chapters: ['Our Promoters & Promoter Group', 'Our Group Companies'],
    necessity: 'mandatory',
    accept: 'PDF, XLSX',
    sample: 'Promoter_Group_Declaration.xlsx',
    extracts: [
      { label: 'Promoter group entities', value: '2' },
      { label: 'Relatives listed', value: '9' },
      { label: 'Group companies', value: '1 — Satvik Agri Sourcing LLP' },
    ],
  },
  {
    id: 'employment-agreements',
    name: 'Executive director employment agreements',
    detail: 'The terms on which your managing director and whole-time director are appointed and paid.',
    basis: 'Companies Act s.196, s.197 · ICDR Schedule VI',
    chapters: ['Our Management'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Employment_Agreements_ED.pdf',
    extracts: [
      { label: 'Agreements on file', value: '2' },
      { label: 'MD remuneration (FY23)', value: '₹36.00 lakh' },
      { label: 'Shareholder approved', value: 'Yes' },
    ],
  },
  {
    id: 'defaulter-declarations',
    name: 'Wilful defaulter & fugitive offender declarations',
    detail:
      'Confirmations that no promoter or director is a wilful defaulter or a fugitive economic offender. Either would bar the issue.',
    basis: 'ICDR Reg. 5(2), 5(3)',
    chapters: ['Other Regulatory Disclosures', 'Our Promoters & Promoter Group'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Defaulter_Declarations.pdf',
    extracts: [
      { label: 'Wilful defaulter check', value: 'Clear — 6 of 6' },
      { label: 'Fugitive offender check', value: 'Clear' },
      { label: 'Debarred from markets', value: 'None' },
    ],
  },
]

// ============================================================
//  Track 5 — Legal, litigation & contingencies
// ============================================================

const legal: RequiredDoc[] = [
  {
    id: 'litigation-search',
    name: 'Litigation search report',
    detail:
      'A search across courts, tribunals and consumer fora for matters involving the company, its directors and its promoters.',
    basis: 'ICDR Schedule VI · Outstanding Litigation',
    chapters: ['Outstanding Litigation', 'Risk Factors'],
    necessity: 'mandatory',
    accept: 'PDF',
    autoSource: 'e-Courts & MCA',
    sample: 'Litigation_Search_Report.pdf',
    extracts: [
      { label: 'Matters against company', value: '1 (indirect tax)' },
      { label: 'Criminal proceedings', value: 'None' },
      { label: 'Matters against promoters', value: 'None' },
      { label: 'Search date', value: '2 March 2026' },
    ],
  },
  {
    id: 'tax-notices',
    name: 'Tax demands, notices & appeal memoranda',
    detail:
      'The ₹18.4 lakh GST demand for FY21 and the appeal you filed against it, with the acknowledgement.',
    basis: 'ICDR Schedule VI · Contingent liabilities',
    chapters: ['Outstanding Litigation', 'Restated Financial Information'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'GST_Demand_Appeal.pdf',
    extracts: [
      { label: 'Demand', value: '₹18.40 lakh' },
      { label: 'Period', value: 'FY21 — input tax credit' },
      { label: 'Forum', value: 'Commissioner (Appeals)' },
      { label: 'Status', value: 'Pending hearing' },
    ],
  },
  {
    id: 'counsel-opinion',
    name: 'Legal counsel opinion on material matters',
    detail:
      'Your lawyer’s written view on the GST appeal — the basis on which it is shown as contingent rather than provided for.',
    basis: 'ICDR Schedule VI · Materiality policy',
    chapters: ['Outstanding Litigation', 'Risk Factors'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Counsel_Opinion_GST.pdf',
    extracts: [{ label: 'Status', value: 'Not yet received' }],
    flag: {
      tone: 'bad',
      text: 'No counsel note on file. Section XI cannot be certified without it.',
    },
  },
  {
    id: 'materiality-policy',
    name: 'Board-adopted materiality policy for litigation',
    detail:
      'The threshold your board set for deciding which matters are material enough to disclose. It has to be stated in the draft.',
    basis: 'ICDR Schedule VI · LODR Reg. 30',
    chapters: ['Outstanding Litigation'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Materiality_Policy.pdf',
    extracts: [
      { label: 'Threshold', value: '2% of turnover or ₹50 lakh' },
      { label: 'Adopted', value: '18 February 2026' },
    ],
  },
  {
    id: 'statutory-dues',
    name: 'Statutory dues & MSME payment certificate',
    detail: 'Confirmation that PF, ESI, GST and income tax are current, and that MSME vendors are paid on time.',
    basis: 'CARO 2020 · MSMED Act, 2006 · s.22',
    chapters: ['Outstanding Litigation', 'Restated Financial Information'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Statutory_Dues_Certificate.pdf',
    extracts: [
      { label: 'Undisputed dues outstanding', value: 'None' },
      { label: 'MSME dues beyond 45 days', value: 'None' },
    ],
  },
  {
    id: 'regulatory-correspondence',
    name: 'Regulatory correspondence & show-cause notices',
    detail: 'Any letters from a regulator — FSSAI, the pollution board, the RoC — in the last three years.',
    basis: 'ICDR Schedule VI · Actions by regulatory authorities',
    chapters: ['Outstanding Litigation', 'Other Regulatory Disclosures'],
    necessity: 'conditional',
    accept: 'PDF',
    sample: 'Regulatory_Correspondence.pdf',
    extracts: [
      { label: 'Notices received', value: 'None in 3 years' },
      { label: 'Penalties levied', value: 'None' },
    ],
  },
]

// ============================================================
//  Track 6 — Material contracts & property
// ============================================================

const contracts: RequiredDoc[] = [
  {
    id: 'facility-lease',
    name: 'Manufacturing facility lease deed',
    detail:
      'The nine-year lease on the Baner plant. Everything you make comes out of one site, so its tenure is a disclosed risk.',
    basis: 'ICDR Schedule VI · Our Business — Property',
    chapters: ['Our Business', 'Material Contracts', 'Risk Factors'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Lease_Deed_Baner.pdf',
    extracts: [
      { label: 'Premises', value: 'Plot 42, Baner Industrial Estate' },
      { label: 'Tenure', value: '9 years from 1 April 2021' },
      { label: 'Registered', value: 'Yes' },
      { label: 'Lock-in remaining', value: '4 years' },
    ],
  },
  {
    id: 'supply-agreements',
    name: 'Raw-material supply agreements',
    detail:
      'Your sourcing arrangements with millet farmer producer organisations in Maharashtra and Karnataka.',
    basis: 'ICDR Schedule VI · Our Business',
    chapters: ['Our Business', 'Risk Factors', 'Material Contracts'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Supply_Agreements_FPO.pdf',
    extracts: [
      { label: 'Agreements on file', value: '2' },
      { label: 'Top 5 suppliers', value: '61% of purchases' },
      { label: 'Longest tenure', value: '3 years' },
    ],
    flag: {
      tone: 'warn',
      text: 'Supplier concentration of 61% needs a quantified risk factor in Section III.',
    },
  },
  {
    id: 'distribution-mou',
    name: 'Distribution & quick-commerce agreements',
    detail: 'The modern-trade listings and quick-commerce MoUs that carry most of your revenue.',
    basis: 'ICDR Schedule VI · Our Business',
    chapters: ['Our Business', 'Risk Factors'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Distribution_MoUs.pdf',
    extracts: [
      { label: 'Modern-trade outlets', value: '4,200+' },
      { label: 'Quick-commerce partners', value: '3' },
      { label: 'Revenue concentration', value: 'Top partner 22%' },
    ],
  },
  {
    id: 'related-party',
    name: 'Related-party agreements & transaction register',
    detail:
      'Every arrangement with a promoter, a director or a group entity. SEBI extended the related-party rules to SME issuers in 2025.',
    basis: 'LODR Reg. 23 · Ind AS 24 · Companies Act s.188',
    chapters: ['Restated Financial Information', 'Our Promoters & Promoter Group'],
    necessity: 'mandatory',
    accept: 'PDF, XLSX',
    sample: 'Related_Party_Register.xlsx',
    extracts: [
      { label: 'Related parties', value: '4' },
      { label: 'FY23 RPT value', value: '₹1.84 crore' },
      { label: 'Audit Committee approved', value: 'Yes' },
      { label: 'Arm’s length', value: 'Certified' },
    ],
  },
  {
    id: 'insurance',
    name: 'Insurance policies',
    detail:
      'Cover on the plant, stock and public liability. Under-insurance against asset value is a standard risk-factor disclosure.',
    basis: 'ICDR Schedule VI · Our Business',
    chapters: ['Our Business', 'Risk Factors'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Insurance_Policies.pdf',
    extracts: [
      { label: 'Policies in force', value: '4' },
      { label: 'Sum insured', value: '₹9.60 crore' },
      { label: 'Cover vs. asset value', value: '68%' },
    ],
    flag: { tone: 'warn', text: 'Assets are insured to 68% of book value — disclose as a risk factor.' },
  },
  {
    id: 'ipo-intermediaries',
    name: 'Intermediary engagement letters',
    detail:
      'Your appointments of the lead manager, registrar and market maker. Market making is compulsory for three years on the SME board.',
    basis: 'ICDR Reg. 260, 261 · Offer Agreement',
    chapters: ['General Information', 'Material Contracts'],
    necessity: 'mandatory',
    accept: 'PDF',
    sample: 'Intermediary_Engagements.pdf',
    extracts: [
      { label: 'Lead manager', value: 'Meridian Capital Advisors LLP' },
      { label: 'Registrar', value: 'Bigshare Services Pvt. Ltd.' },
      { label: 'Market maker', value: 'Anchor Securities Pvt. Ltd.' },
      { label: 'Underwriting', value: '100% · LM 15% on own books' },
    ],
  },
]

// ============================================================
//  The tracks, in the order the issuer works through them
// ============================================================

export const DOC_TRACKS: DocTrack[] = [
  {
    id: 'corporate',
    title: 'Corporate Records & Capital',
    drhpSection: 'Section III & IV — Introduction · About Our Company',
    sub: 'Incorporation, constitution, resolutions and the share register',
    why:
      'Your website told us who you say you are. These documents prove it, and they fix the capital structure every later section is built on.',
    docs: corporate,
  },
  {
    id: 'financial',
    title: 'Financial Information',
    drhpSection: 'Section V — Financial Information',
    sub: 'Audited and restated accounts, ratios, borrowings',
    why:
      'This is the heaviest section of any DRHP and the one exchanges scrutinise hardest. Every rupee quoted anywhere in the draft is checked back to these files.',
    docs: financial,
  },
  {
    id: 'statutory',
    title: 'Registrations & Licences',
    drhpSection: 'Section VI — Government and Other Approvals',
    sub: 'Tax registrations, food licence, factory and environmental consents',
    why:
      'You make and sell packaged food, so your licences are material. A lapsed or missing approval becomes a risk factor rather than a blocker — but only if it is disclosed.',
    docs: statutory,
  },
  {
    id: 'people',
    title: 'Promoters, Directors & Management',
    drhpSection: 'Section IV — Our Management · Our Promoters',
    sub: 'KYC, DIN, committees, promoter group and declarations',
    why:
      'SEBI cares as much about who runs the company as about what it earns. A disqualified director or an undisclosed promoter-group entity stops an issue outright.',
    docs: people,
  },
  {
    id: 'legal',
    title: 'Legal, Litigation & Contingencies',
    drhpSection: 'Section VI — Outstanding Litigation and Material Developments',
    sub: 'Searches, tax matters, counsel opinions and statutory dues',
    why:
      'Nothing here disqualifies you on its own. Failing to disclose it does. Everything found in this track is carried into Risk Factors with a rupee figure attached.',
    docs: legal,
  },
  {
    id: 'contracts',
    title: 'Material Contracts & Property',
    drhpSection: 'Section IX — Material Contracts and Documents for Inspection',
    sub: 'Lease, supply, distribution, related parties and intermediaries',
    why:
      'The agreements that make the business work. They are listed at the back of every DRHP and made available for inspection by any investor who asks.',
    docs: contracts,
  },
]

export const ALL_DOCS: RequiredDoc[] = DOC_TRACKS.flatMap((t) => t.docs)

export const MANDATORY_DOCS = ALL_DOCS.filter((d) => d.necessity === 'mandatory')

/** Look-up used by the verification panel and the co-pilot. */
export const DOC_BY_ID: Record<string, RequiredDoc> = Object.fromEntries(
  ALL_DOCS.map((d) => [d.id, d])
)

export const TRACK_OF_DOC: Record<string, string> = Object.fromEntries(
  DOC_TRACKS.flatMap((t) => t.docs.map((d) => [d.id, t.id]))
)

/** Narration shown while a document is being read. */
export const VERIFY_STEPS = [
  'Opening the file and checking it is readable…',
  'Identifying the document type…',
  'Extracting the fields this chapter needs…',
  'Cross-checking against your company base…',
  'Filing it against the sections it feeds…',
]
