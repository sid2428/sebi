import { create } from 'zustand'

export type Screen = 'landing' | 'dashboard' | 'ingest' | 'workspace'
export type StepId = 'base' | 'kyc' | 'eligibility' | 'synthesis' | 'gaps' | 'final'
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

type State = {
  screen: Screen
  step: StepId
  crawlDone: boolean
  issuerMode: IssuerMode
  bankerReviewStarted: boolean
  resolvedGapIds: string[]
  jumpTarget: JumpTarget | null
  chat: ChatMsg[]
  typing: boolean
  toast: string | null
  goScreen: (s: Screen) => void
  goStep: (s: StepId) => void
  setCrawlDone: (b: boolean) => void
  setIssuerMode: (mode: IssuerMode) => void
  setBankerReviewStarted: (started: boolean) => void
  resolveGap: (id: string) => void
  setJumpTarget: (target: JumpTarget | null) => void
  pushChat: (m: Omit<ChatMsg, 'id'>) => void
  setTyping: (b: boolean) => void
  showToast: (t: string) => void
}

let cid = 100

const STEP_IDS: StepId[] = ['base', 'kyc', 'eligibility', 'synthesis', 'gaps', 'final']
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
  resolvedGapIds: [],
  jumpTarget: null,
  chat: [],
  typing: false,
  toast: null,
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
  resolveGap: (id) => set((st) => (
    st.resolvedGapIds.includes(id) ? st : { resolvedGapIds: [...st.resolvedGapIds, id] }
  )),
  setJumpTarget: (jumpTarget) => set({ jumpTarget }),
  pushChat: (m) => set((st) => ({ chat: [...st.chat, { ...m, id: cid++ }] })),
  setTyping: (b) => set({ typing: b }),
  showToast: (t) => {
    set({ toast: t })
    setTimeout(() => set((st) => (st.toast === t ? { toast: null } : {})), 3200)
  },
}))

export function syncRouteFromLocation() {
  if (typeof window === 'undefined') return
  useStore.setState(parsePath(window.location.pathname))
}
