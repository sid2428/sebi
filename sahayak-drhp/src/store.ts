import { create } from 'zustand'

export type Screen = 'landing' | 'dashboard' | 'ingest' | 'workspace'
export type StepId = 'base' | 'documents' | 'kyc' | 'eligibility' | 'synthesis' | 'gaps' | 'final'
export type IssuerMode = 'expert' | 'firstTime'
export type JumpTarget =
  | { kind: 'section'; id: string }
  | { kind: 'gap'; id: string }
  | { kind: 'phase'; id: string }

export type ChatMsg = {
  id: number
  role: 'ai' | 'user'
  text: string
  callout?: { kind: 'warn' | 'ok'; text: string }
  quicks?: string[]
}

/** A file the issuer handed over during ingestion. */
export type UploadedDoc = {
  id: string
  name: string
  size: number
}

/** A DRHP section body the co-pilot has drafted (or the issuer has edited). */
export type SectionDraft = {
  body: string
  /** Which predefined variant is on screen — bumped by "Regenerate". */
  version: number
  savedAt: string
  edited: boolean
  complete: number
}

/** How a flagged gap was closed, kept for the audit trail. */
export type GapResolution = {
  choice: string
  note: string
  at: string
}

/**
 * One piece of evidence the issuer has supplied against a required
 * document. `flagged` means it was read successfully but the co-pilot
 * found something a merchant banker will ask about.
 */
export type DocRecord = {
  fileName: string
  size: number
  at: string
  /** Uploaded by the issuer, or pulled from a registry on their behalf. */
  source: 'upload' | 'registry'
  status: 'verified' | 'flagged'
}

type State = {
  screen: Screen
  step: StepId
  crawlDone: boolean
  issuerMode: IssuerMode
  bankerReviewStarted: boolean
  jumpTarget: JumpTarget | null
  chat: ChatMsg[]
  typing: boolean
  toast: string | null

  // ---- journey progress ----
  completedSteps: StepId[]

  // ---- stage 1: company base ----
  companyEdits: Record<string, string>
  baseConfirmed: boolean
  baseAttestationAccepted: boolean
  baseDigitalSignature: string
  uploadedDocs: UploadedDoc[]

  // ---- stage 2: document collection ----
  docRecords: Record<string, DocRecord>
  /** Tracks the issuer has signed off, so the rail can show them done. */
  clearedTracks: string[]

  // ---- stage 3: verification ----
  resolvedKyc: Record<string, string>

  // ---- stage 3: eligibility ----
  eligibilityRun: boolean

  // ---- stage 4: synthesis ----
  sectionDrafts: Record<string, SectionDraft>

  // ---- stage 5: gaps ----
  gapResolutions: Record<string, GapResolution>

  // ---- dashboard ----
  doneTasks: string[]

  goScreen: (s: Screen) => void
  goStep: (s: StepId) => void
  setCrawlDone: (b: boolean) => void
  setIssuerMode: (mode: IssuerMode) => void
  setBankerReviewStarted: (started: boolean) => void
  setJumpTarget: (target: JumpTarget | null) => void
  pushChat: (m: Omit<ChatMsg, 'id'>) => void
  setTyping: (b: boolean) => void
  showToast: (t: string) => void

  completeStep: (s: StepId) => void
  setCompanyField: (key: string, value: string) => void
  setBaseConfirmed: (b: boolean) => void
  setBaseAttestationAccepted: (accepted: boolean) => void
  setBaseDigitalSignature: (signature: string) => void
  addUploadedDocs: (docs: UploadedDoc[]) => void
  removeUploadedDoc: (id: string) => void
  setDocRecord: (docId: string, record: DocRecord) => void
  clearDocRecord: (docId: string) => void
  clearTrack: (trackId: string) => void
  resolveKycItem: (label: string, note: string) => void
  setEligibilityRun: (b: boolean) => void
  setSectionDraft: (no: string, draft: SectionDraft) => void
  resolveGap: (id: string, resolution: GapResolution) => void
  toggleTask: (title: string) => void
}

let cid = 100

export const STEP_IDS: StepId[] = [
  'base',
  'documents',
  'kyc',
  'eligibility',
  'synthesis',
  'gaps',
  'final',
]

/** One place names the stages — nav, breadcrumbs and headers all read this. */
export const STEP_TITLES: Record<StepId, string> = {
  base: 'Company Base',
  documents: 'Document Room',
  kyc: 'Verification & KYC',
  eligibility: 'Eligibility Check',
  synthesis: 'DRHP Synthesis',
  gaps: 'Gaps & Consistency',
  final: 'Final Draft DRHP',
}

export function stepIndex(step: StepId) {
  return STEP_IDS.indexOf(step)
}

export function nextStep(step: StepId): StepId | null {
  const i = stepIndex(step)
  return i >= 0 && i < STEP_IDS.length - 1 ? STEP_IDS[i + 1] : null
}

export function prevStep(step: StepId): StepId | null {
  const i = stepIndex(step)
  return i > 0 ? STEP_IDS[i - 1] : null
}

const ISSUER_MODE_KEY = 'sahayak-issuer-mode'

function isStepId(value: string): value is StepId {
  return STEP_IDS.includes(value as StepId)
}

function getStoredIssuerMode(): IssuerMode {
  if (typeof window === 'undefined') return 'expert'
  return window.localStorage.getItem(ISSUER_MODE_KEY) === 'firstTime' ? 'firstTime' : 'expert'
}

export function parsePath(pathname: string): Pick<State, 'screen' | 'step'> {
  if (pathname === '/ingest') return { screen: 'ingest', step: 'base' }
  if (pathname.startsWith('/workspace/')) {
    const maybeStep = pathname.slice('/workspace/'.length)
    if (isStepId(maybeStep)) return { screen: 'workspace', step: maybeStep }
  }
  if (pathname === '/workspace') return { screen: 'workspace', step: 'base' }
  if (pathname === '/dashboard') return { screen: 'dashboard', step: 'base' }
  if (pathname === '/') return { screen: 'landing', step: 'base' }
  return { screen: 'landing', step: 'base' }
}

function pathFor(screen: Screen, step: StepId) {
  if (screen === 'ingest') return '/ingest'
  if (screen === 'workspace') return `/workspace/${step}`
  if (screen === 'dashboard') return '/dashboard'
  if (screen === 'landing') return '/'
  return '/'
}

function pushPath(screen: Screen, step: StepId) {
  if (typeof window === 'undefined') return
  const next = pathFor(screen, step)
  if (window.location.pathname !== next) {
    window.history.pushState({}, '', next)
  }
}

export const useStore = create<State>((set, get) => ({
  ...parsePath(typeof window !== 'undefined' ? window.location.pathname : '/'),
  crawlDone: false,
  issuerMode: getStoredIssuerMode(),
  bankerReviewStarted: false,
  jumpTarget: null,
  chat: [],
  typing: false,
  toast: null,

  completedSteps: [],
  companyEdits: {},
  baseConfirmed: false,
  baseAttestationAccepted: false,
  baseDigitalSignature: '',
  uploadedDocs: [],
  docRecords: {},
  clearedTracks: [],
  resolvedKyc: {},
  eligibilityRun: false,
  sectionDrafts: {},
  gapResolutions: {},
  doneTasks: [],

  goScreen: (screen) => {
    const step = screen === 'workspace' ? get().step : 'base'
    pushPath(screen, step)
    set({ screen, step })
  },
  goStep: (step) => {
    pushPath('workspace', step)
    set({ screen: 'workspace', step })
  },
  setCrawlDone: (b) => set({ crawlDone: b }),
  setIssuerMode: (issuerMode) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ISSUER_MODE_KEY, issuerMode)
    }
    set({ issuerMode })
  },
  setBankerReviewStarted: (bankerReviewStarted) => set({ bankerReviewStarted }),
  setJumpTarget: (jumpTarget) => set({ jumpTarget }),
  pushChat: (m) => set((st) => ({ chat: [...st.chat, { ...m, id: cid++ }] })),
  setTyping: (b) => set({ typing: b }),
  showToast: (t) => {
    set({ toast: t })
    setTimeout(() => set((st) => (st.toast === t ? { toast: null } : {})), 3200)
  },

  completeStep: (s) =>
    set((st) => (st.completedSteps.includes(s) ? st : { completedSteps: [...st.completedSteps, s] })),

  setCompanyField: (key, value) =>
    set((st) => ({ companyEdits: { ...st.companyEdits, [key]: value } })),

  setBaseConfirmed: (baseConfirmed) => set({ baseConfirmed }),
  setBaseAttestationAccepted: (baseAttestationAccepted) => set({ baseAttestationAccepted }),
  setBaseDigitalSignature: (baseDigitalSignature) => set({ baseDigitalSignature }),

  addUploadedDocs: (docs) => set((st) => ({ uploadedDocs: [...st.uploadedDocs, ...docs] })),

  removeUploadedDoc: (id) =>
    set((st) => ({ uploadedDocs: st.uploadedDocs.filter((d) => d.id !== id) })),

  setDocRecord: (docId, record) =>
    set((st) => ({ docRecords: { ...st.docRecords, [docId]: record } })),

  clearDocRecord: (docId) =>
    set((st) => {
      const next = { ...st.docRecords }
      delete next[docId]
      return { docRecords: next }
    }),

  clearTrack: (trackId) =>
    set((st) =>
      st.clearedTracks.includes(trackId)
        ? st
        : { clearedTracks: [...st.clearedTracks, trackId] }
    ),

  resolveKycItem: (label, note) =>
    set((st) => (st.resolvedKyc[label] ? st : { resolvedKyc: { ...st.resolvedKyc, [label]: note } })),

  setEligibilityRun: (eligibilityRun) => set({ eligibilityRun }),

  setSectionDraft: (no, draft) =>
    set((st) => ({ sectionDrafts: { ...st.sectionDrafts, [no]: draft } })),

  resolveGap: (id, resolution) =>
    set((st) => (st.gapResolutions[id] ? st : { gapResolutions: { ...st.gapResolutions, [id]: resolution } })),

  toggleTask: (title) =>
    set((st) => ({
      doneTasks: st.doneTasks.includes(title)
        ? st.doneTasks.filter((t) => t !== title)
        : [...st.doneTasks, title],
    })),
}))

export function syncRouteFromLocation() {
  if (typeof window === 'undefined') return
  useStore.setState(parsePath(window.location.pathname))
}
