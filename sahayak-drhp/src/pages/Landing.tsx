import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, ShieldCheck, Clock, Users, ScanLine, BadgeCheck,
  Landmark, Scale, Building2, TrendingDown, FileText, Check,
} from 'lucide-react'
import { useStore } from '../store'
import { Brand, Chip, SectionHeading } from '../components/ui'
import HandoffTimeline from '../components/HandoffTimeline'
import PipelineFilm from '../components/PipelineFilm'
import { Counter, Reveal, ScrollProgress, Stagger, StaggerItem } from '../components/motion'
import {
  DrhpDocument, MagnifyingGlass, SceneIngest, SceneVerify, SceneHandoff, ProvenanceThread,
} from '../components/illustrations'
import { useLenis } from '../lib/useLenis'
import { EASE, useReducedMotion } from '../lib/motion'
import gsap from 'gsap'

const NAV = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#for-intermediaries', label: 'For intermediaries' },
  { href: '#disclosures', label: 'Disclosures' },
]

export default function Landing() {
  const go = useStore((s) => s.goScreen)
  useLenis()

  return (
    <div className="min-h-screen bg-canvas">
      <ScrollProgress />

      {/* ===== NAV ===== */}
      <header className="sticky top-0 z-[100] border-b border-line/80 bg-canvas/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-6 2xl:max-w-[1360px] 3xl:max-w-[1480px]" aria-label="Primary">
          <Brand />
          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-[13.5px] font-semibold text-ink-3 transition-colors duration-200 hover:bg-panel hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            <button onClick={() => go('ingest')} className="btn btn-gold btn-sm ml-2">
              Launch app
            </button>
          </div>
          <button onClick={() => go('ingest')} className="btn btn-gold btn-sm md:hidden">
            Launch
          </button>
        </nav>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 hero-grid" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.02fr_.98fr] lg:pb-24 lg:pt-18 2xl:max-w-[1360px] 2xl:gap-16 3xl:max-w-[1480px]">
          <div>
            <Reveal shape="rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-3.5 py-1.5 text-[12.5px] font-bold text-accent-700">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                Built to SEBI (ICDR) SME norms · NSE Emerge &amp; BSE SME
              </span>
            </Reveal>

            <Reveal shape="rise" delay={0.06}>
              <h1 className="mt-6 text-[clamp(34px,5vw,58px)] font-extrabold leading-[1.04] tracking-[-0.035em]">
                Every line of your offer
                <br />
                document,{' '}
                <span className="relative whitespace-nowrap">
                  <span className="relative z-10 text-accent-700">traced to source</span>
                  <UnderlineStroke />
                </span>
              </h1>
            </Reveal>

            <Reveal shape="rise" delay={0.12}>
              <p className="mt-6 max-w-[52ch] text-[17.5px] leading-[1.6] text-ink-3">
                Sahayak reads your website and your files, drafts a substantially complete DRHP, and shows
                the exact document behind every figure. Your merchant banker still reviews and certifies —
                that part never moves.
              </p>
            </Reveal>

            <Reveal shape="rise" delay={0.18}>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => go('ingest')} className="btn btn-gold btn-lg">
                  Start with your website <ArrowRight size={17} />
                </button>
                <button onClick={() => go('ingest')} className="btn btn-ghost btn-lg">
                  <FileText size={17} /> See a live draft
                </button>
              </div>
            </Reveal>

            <Stagger className="mt-10 grid gap-x-7 gap-y-5 sm:grid-cols-3" each={0.07} delay={0.24}>
              {[
                { icon: ScanLine, t: 'No blank forms', s: 'We start from what you already published.' },
                { icon: ProvenanceThread, t: 'Traceable by default', s: 'Every field names its source document.' },
                { icon: Users, t: 'Banker in the loop', s: 'Nothing is filed without certification.' },
              ].map((item) => (
                <StaggerItem key={item.t} className="flex gap-2.5">
                  <item.icon size={17} className="mt-0.5 shrink-0 text-accent-600" />
                  <div>
                    <b className="block text-[13.5px] font-bold text-ink">{item.t}</b>
                    <span className="text-[12.5px] leading-snug text-muted">{item.s}</span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <HeroScan />
        </div>

        {/* Figures band — hairline rules, tabular numerals, no card. */}
        <div className="relative border-y border-line bg-white/60">
          <Stagger className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-7 px-6 py-8 md:grid-cols-4 2xl:max-w-[1360px] 3xl:max-w-[1480px]" each={0.08}>
            {/* Ranges are set, not counted — a range has no intermediate
                value, and counting one prints numbers that aren't true. */}
            {[
              { value: '4–6', suffix: ' months', label: 'Typical DRHP prep today' },
              { value: 'Under a', suffix: ' day', label: 'To a substantially complete draft' },
              { count: 14, suffix: ' sections', label: 'Synthesised from 8 source documents' },
              { count: 100, suffix: '%', label: 'Of fields traced to a source file' },
            ].map((s, i) => (
              <StaggerItem
                key={s.label}
                // Explicit hairline between figures — `divide-x` doesn't
                // survive the two-column-to-four-column reflow.
                className={`md:px-7 ${i === 0 ? 'md:pl-0' : 'md:border-l md:border-line'}`}
              >
                <div className="text-[clamp(24px,2.4vw,30px)] font-extrabold leading-none tracking-[-0.03em] text-ink">
                  {s.count !== undefined ? <Counter to={s.count} /> : s.value}
                  <span className="text-[15px] font-bold text-accent-600">{s.suffix}</span>
                </div>
                <div className="mt-2.5 text-[12.5px] leading-snug text-muted">{s.label}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ===== PROBLEM ===== */}
      <section className="py-22">
        <div className="mx-auto max-w-[1200px] px-6 2xl:max-w-[1360px] 3xl:max-w-[1480px]">
          <Reveal>
            <SectionHeading
              eyebrow="The barrier SEBI wants removed"
              title="Why SMEs stay off the public markets"
              align="center"
              className="max-w-[640px]"
            >
              Preparing an offer document is slow, expensive and expertise-heavy. Against the amounts an SME
              actually raises, the overhead is disproportionate.
            </SectionHeading>
          </Reveal>

          <Stagger className="mt-12 grid gap-5 md:grid-cols-3" each={0.08}>
            {[
              {
                icon: Clock,
                tone: 'warn',
                t: 'A quarter, minimum',
                p: 'The document is long and highly structured. Assembling it from scratch routinely consumes one or two full quarters.',
              },
              {
                icon: TrendingDown,
                tone: 'bad',
                t: 'Costs that never scale down',
                p: 'Bankers, counsel and compliance professionals are priced for the main board — not for a ₹30 crore raise.',
              },
              {
                icon: Users,
                tone: 'info',
                t: 'Dependence from step one',
                p: 'Lean promoter teams with no capital-markets exposure lean on advisors before they have written a line.',
              },
            ].map((c) => (
              <StaggerItem key={c.t} shape="settle" className="card lift-on-hover p-7">
                <span
                  className={`mb-5 grid h-11 w-11 place-items-center rounded-xl2 ${
                    c.tone === 'warn'
                      ? 'bg-warn-bg text-warn'
                      : c.tone === 'bad'
                        ? 'bg-bad-bg text-bad'
                        : 'bg-info-bg text-info'
                  }`}
                >
                  <c.icon size={21} />
                </span>
                <h3 className="text-[18px] font-bold tracking-[-0.02em]">{c.t}</h3>
                <p className="mt-2 text-[14.5px] leading-[1.6] text-ink-3">{c.p}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-line bg-panel/60 py-22">
        <div className="mx-auto max-w-[1200px] px-6 2xl:max-w-[1360px] 3xl:max-w-[1480px]">
          <Reveal>
            <SectionHeading
              eyebrow="The method"
              title="A path a non-expert can actually walk"
              align="center"
              className="max-w-[680px]"
            >
              One source document feeds several sections; one section pulls from several documents. Sahayak
              owns that mapping so you never hold it in your head.
            </SectionHeading>
          </Reveal>

          <Stagger className="mt-12 grid gap-5 md:grid-cols-3" each={0.1}>
            {[
              {
                Scene: SceneIngest,
                num: 'I',
                t: 'Hand over what exists',
                p: 'Your website and your files. We build a company base of 42 attributes and keep the page each one came from.',
              },
              {
                Scene: SceneVerify,
                num: 'II',
                t: 'Clear it phase by phase',
                p: 'Identity, promoters, financials, capital, legal, contracts. Each phase turns green only when it is genuinely clear.',
              },
              {
                Scene: SceneHandoff,
                num: 'III',
                t: 'Hand it to your banker',
                p: 'A traced draft plus every open flag goes to your lead manager. Filing happens after they certify, not before.',
              },
            ].map((s) => (
              <StaggerItem key={s.num} shape="settle" className="card lift-on-hover overflow-hidden">
                <div className="border-b border-line bg-white p-4">
                  <s.Scene className="h-auto w-full" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="numeral text-[13px]">{s.num}</span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                  <h3 className="mt-3 text-[17px] font-bold tracking-[-0.02em]">{s.t}</h3>
                  <p className="mt-2 text-[13.5px] leading-[1.6] text-ink-3">{s.p}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ===== HANDOFF ===== */}
      <section className="py-22">
        <div className="mx-auto max-w-[1200px] px-6 2xl:max-w-[1360px] 3xl:max-w-[1480px]">
          <Reveal>
            <SectionHeading
              eyebrow="Review handoff"
              title="The intermediary step is mandatory, not optional"
              align="center"
              className="max-w-[720px]"
            >
              The sample draft below sits in co-pilot verification. It cannot enter any filing workflow until
              a merchant banker has reviewed and certified it.
            </SectionHeading>
          </Reveal>
          <Reveal delay={0.08} className="mt-10">
            <HandoffTimeline currentStage="copilot" />
          </Reveal>
        </div>
      </section>

      {/* ===== PROCESS FILM — website to DRHP, animated ===== */}
      <section id="for-intermediaries" className="scroll-mt-20 pb-22">
        <div className="mx-auto max-w-[1200px] px-6 2xl:max-w-[1360px] 3xl:max-w-[1480px]">
          <Reveal>
            <SectionHeading
              eyebrow="From URL to draft"
              title="Watch the whole pipeline run"
              align="center"
              className="max-w-[700px]"
            >
              Sahayak reads your website, pulls in your documents, flags what’s off, tells you exactly what to
              fix — and assembles a source-traced DRHP. Your merchant banker still reviews and certifies before
              anything is filed.
            </SectionHeading>
          </Reveal>
          <Reveal shape="settle" delay={0.08} className="mx-auto mt-10 max-w-[720px]">
            <PipelineFilm />
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="pb-22">
        <div className="mx-auto max-w-[1200px] px-6 2xl:max-w-[1360px] 3xl:max-w-[1480px]">
          <Reveal shape="settle">
            {/* No decorative document behind this one — at 18% it read as a
                rendering artifact rather than an intentional layer. */}
            <div className="card relative overflow-hidden px-6 py-14 text-center sm:px-12">
              <div className="relative">
                <Chip tone="accent" className="mb-4">
                  Live interactive prototype
                </Chip>
                <h2 className="text-[clamp(24px,3vw,34px)] font-extrabold tracking-[-0.03em]">
                  Watch a full DRHP get built
                </h2>
                <p className="mx-auto mt-3 max-w-[52ch] text-[16.5px] leading-[1.6] text-ink-3">
                  Walk the whole journey — website URL to certified-ready draft — with our sample issuer,
                  Satvik Foods.
                </p>
                <button onClick={() => go('ingest')} className="btn btn-gold btn-lg mt-8">
                  Launch the co-pilot <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer id="disclosures" className="scroll-mt-20 border-t border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-9 text-[13px] text-muted 2xl:max-w-[1360px] 3xl:max-w-[1480px]">
          <Brand />
          <p className="max-w-[52ch] leading-relaxed">
            Prototype for the SEBI hackathon, problem statement 4. All figures are illustrative. Not
            affiliated with SEBI, NSE or BSE.
          </p>
        </div>
      </footer>
    </div>
  )
}

/* ============================================================
   Hero scan — the signature moment.

   The lens travels the cover page on a GSAP timeline; each clause it
   crosses lights up and pushes a verified fact out to the right,
   joined back to the page by a drawn thread. This is the product's
   claim, animated once, rather than described three times.
   ============================================================ */

// Placed clear of the cover page's masthead and stamp, so the facts
// read as sitting beside the document rather than obscuring it.
const FACTS = [
  { icon: BadgeCheck, tone: 'ok', title: 'CIN verified', sub: 'Matched to MCA master data', top: '-2%', right: '-13%' },
  { icon: ShieldCheck, tone: 'ok', title: '92% eligible', sub: 'NSE Emerge thresholds', top: '38%', right: '-17%' },
  { icon: Scale, tone: 'warn', title: '3 gaps flagged', sub: 'Disclosed before handoff', top: '77%', right: '-9%' },
] as const

function HeroScan() {
  const lensRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [lit, setLit] = useState<number[]>([])
  const [shown, setShown] = useState<number[]>([])
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      setLit([0, 1, 2, 3])
      setShown([0, 1, 2])
      return
    }

    const ctx = gsap.context(() => {
      const el = lensRef.current
      if (!el) return

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4, defaults: { ease: 'power2.inOut' } })
      gsap.set(el, { x: '-6%', y: '-8%', opacity: 0, scale: 0.9 })

      tl.to(el, { opacity: 1, scale: 1, duration: 0.5 })

      // Read each clause left-to-right, then drop to the next.
      ;[
        { y: '4%', clause: 0, fact: 0 },
        { y: '27%', clause: 1, fact: null },
        { y: '50%', clause: 2, fact: 1 },
        { y: '72%', clause: 3, fact: 2 },
      ].forEach((row, i) => {
        tl.to(el, { y: row.y, duration: 0.34 }, i === 0 ? '>' : '>-0.14')
          .to(el, { x: '52%', duration: 0.92 }, '<')
          .call(() => setLit((p) => (p.includes(row.clause) ? p : [...p, row.clause])), [], '<0.45')
        if (row.fact !== null) {
          tl.call(() => setShown((p) => (p.includes(row.fact!) ? p : [...p, row.fact!])), [], '<0.2')
        }
        tl.to(el, { x: '-6%', duration: 0.92 })
      })

      tl.to(el, { opacity: 0, scale: 0.94, duration: 0.45 }, '>0.5').call(() => {
        setLit([])
        setShown([])
      })
    }, stageRef)

    return () => ctx.revert()
  }, [reduced])

  return (
    <motion.div
      ref={stageRef}
      className="relative mx-auto w-full max-w-[440px] lg:mx-0 2xl:max-w-[500px] 3xl:max-w-[548px]"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
    >
      {/* Soft ground so the page does not float on nothing. */}
      <div
        className="pointer-events-none absolute inset-x-6 bottom-2 h-16 rounded-[50%] blur-2xl"
        style={{ background: 'rgba(91,141,239,.18)' }}
        aria-hidden="true"
      />

      <div className="relative px-8 py-2 sm:px-10">
        <DrhpDocument
          className="h-auto w-full drop-shadow-[0_24px_60px_rgba(22,35,58,.14)]"
          highlight={lit}
          title="A draft red herring prospectus being read clause by clause"
        />
        <div
          ref={lensRef}
          className="pointer-events-none absolute left-6 top-6 w-[42%] gpu"
          style={{ willChange: 'transform' }}
          aria-hidden="true"
        >
          <MagnifyingGlass className="h-auto w-full" tint={0.18} />
        </div>
      </div>

      {/* Extracted facts, tied back to the page. */}
      {FACTS.map((f, i) => (
        <motion.div
          key={f.title}
          className="absolute z-10 hidden sm:block"
          style={{ top: f.top, right: f.right }}
          initial={{ opacity: 0, x: 14, scale: 0.94 }}
          animate={shown.includes(i) ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 14, scale: 0.94 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className="flex items-center gap-2.5 rounded-xl2 border border-line bg-white/95 px-3.5 py-2.5 shadow-lg2 backdrop-blur">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                f.tone === 'ok' ? 'bg-ok-bg text-ok' : 'bg-warn-bg text-warn'
              }`}
            >
              <f.icon size={16} />
            </span>
            <div>
              <b className="block text-[13px] leading-tight text-ink">{f.title}</b>
              <span className="text-[11px] leading-tight text-muted">{f.sub}</span>
            </div>
            <Check size={13} className="ml-1 shrink-0 text-ok" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

/** Hand-drawn emphasis under the key phrase in the headline. */
function UnderlineStroke() {
  const reduced = useReducedMotion()
  return (
    <svg
      className="absolute -bottom-1 left-0 h-[10px] w-full"
      viewBox="0 0 200 10"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d="M2 7C38 3 82 2.4 128 4.2c26 1 48 2.2 70 3.6"
        stroke="#7DB7F8"
        strokeWidth="4"
        strokeLinecap="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
      />
    </svg>
  )
}
