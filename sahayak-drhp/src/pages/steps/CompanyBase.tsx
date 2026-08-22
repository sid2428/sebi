import { useState } from 'react'
import { Check, FileText, Info, Pencil, Save, X, Globe2, MapPin, ShieldCheck } from 'lucide-react'
import { useStore } from '../../store'
import { Chip } from '../../components/ui'
import { ActionButton, ResultNote, StageBlock, StageFooter, StageHeader } from '../../components/stage'
import { COMPANY } from '../../data/mock'
import { Reveal } from '../../components/motion'
import { useSimulatedAction } from '../../lib/actions'

type Field = { key: string; label: string; value: string; hint?: string; pending?: boolean }

const IDENTITY_FIELDS: Field[] = [
  { key: 'legalName', label: 'Legal name', value: COMPANY.legalName },
  { key: 'cin', label: 'CIN', value: '', hint: 'Available from the company or a registry lookup.', pending: true },
  { key: 'incorporated', label: 'Incorporated', value: '', pending: true },
  { key: 'roc', label: 'Registrar', value: '', pending: true },
  { key: 'gstin', label: 'GSTIN', value: '', pending: true },
]

const BUSINESS_FIELDS: Field[] = [
  { key: 'website', label: 'Website', value: COMPANY.website },
  { key: 'sector', label: 'Sector', value: COMPANY.sector },
  { key: 'subSector', label: 'What it sells', value: COMPANY.subSector },
  { key: 'regOffice', label: 'Published address', value: COMPANY.regOffice },
]

export default function CompanyBase() {
  const goStep = useStore((s) => s.goStep)
  const completeStep = useStore((s) => s.completeStep)
  const baseConfirmed = useStore((s) => s.baseConfirmed)
  const setBaseConfirmed = useStore((s) => s.setBaseConfirmed)
  const baseAttestationAccepted = useStore((s) => s.baseAttestationAccepted)
  const setBaseAttestationAccepted = useStore((s) => s.setBaseAttestationAccepted)
  const baseDigitalSignature = useStore((s) => s.baseDigitalSignature)
  const setBaseDigitalSignature = useStore((s) => s.setBaseDigitalSignature)
  const companyEdits = useStore((s) => s.companyEdits)
  const showToast = useStore((s) => s.showToast)
  const confirm = useSimulatedAction({ ms: 900 })

  const editedCount = Object.keys(companyEdits).length
  const attestationReady = baseAttestationAccepted && baseDigitalSignature.trim().length > 1

  return (
    <div>
      <StageHeader
        step="base"
        eyebrow={
          <Chip tone="blue">
            <Info size={12} /> Website crawl complete
          </Chip>
        }
        why="This chapter establishes only the company facts a crawl or public registry can support. It does not assume ownership, financial or IPO details."
        todo="Check the public profile and registration match. Correct anything that is wrong, then confirm this company base before we request private evidence."
      />

      {/* Issuer banner */}
      <Reveal shape="settle" className="mt-6">
        <div
          className="flex flex-wrap items-center gap-5 rounded-3xl2 border border-accent-100 bg-gradient-to-br from-accent-50 via-white to-panel px-6 py-6 shadow-sm2 sm:px-7"
        >
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl2 bg-accent-600 text-[20px] font-extrabold text-white shadow-accent"
          >
            {COMPANY.logoLetters}
          </span>
          <div className="min-w-[240px] flex-1">
            <h2 className="text-[18px] font-bold text-ink">
              {companyEdits.legalName ?? COMPANY.legalName}
            </h2>
            <p className="mt-1.5 max-w-[62ch] text-[13px] leading-[1.6] text-ink-3">{COMPANY.about}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip tone="blue"><Globe2 size={12} /> Website found</Chip>
            <Chip tone="gray"><ShieldCheck size={12} /> Registry check pending</Chip>
          </div>
        </div>
      </Reveal>

      {/* ===== Main task ===== */}
      <StageBlock
        title="Public company profile"
        hint="These are the facts the crawl can support today. Every field names its source so the draft remains traceable."
        aside={
          editedCount > 0 ? (
            <Chip tone="blue">
              {editedCount} field{editedCount === 1 ? '' : 's'} edited
            </Chip>
          ) : undefined
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <EditableCard title="Corporate registration" src="Website disclosure" fields={IDENTITY_FIELDS} />
          <EditableCard title="Website profile" src="Company website" fields={BUSINESS_FIELDS} />
        </div>
      </StageBlock>

      <StageBlock title="What comes next" hint="We request private evidence only in the chapters where it is actually needed.">
        <ResultNote tone="info">
          Financial statements, cap table, investor details, planned issue terms and internal legal records have not been inferred from the crawl. You will add and verify them in the Document Room.
        </ResultNote>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { icon: FileText, title: 'Financial evidence', text: 'Audited statements and restatement inputs' },
            { icon: ShieldCheck, title: 'Ownership & KYC', text: 'Promoter, director and cap-table records' },
            { icon: MapPin, title: 'Offer details', text: 'Issue structure, objects and intermediary appointments' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl2 border border-line bg-panel/55 p-4">
              <Icon size={17} className="text-accent-600" />
              <b className="mt-3 block text-[13.5px]">{title}</b>
              <p className="mt-1 text-[12px] leading-[1.5] text-muted">{text}</p>
            </div>
          ))}
        </div>
      </StageBlock>

      <StageBlock title="Issuer attestation & confirmation" hint="This keeps a clear record of who confirmed the information before private evidence is requested.">
        <div
          className={`card flex flex-wrap items-center gap-4 p-5 ${
            baseConfirmed ? 'border-ok-line bg-ok-bg/40' : ''
          }`}
        >
          <div className="min-w-[240px] flex-1">
            <b className="block text-[14.5px] font-bold">
              {baseConfirmed ? 'Base confirmed and saved' : 'Is everything above correct?'}
            </b>
            <p className="mt-1 max-w-[58ch] text-[13px] leading-[1.6] text-muted">
              {baseConfirmed
                ? 'These details are now the foundation for every DRHP section. You can still come back and edit them.'
                : 'Only confirm facts you know to be accurate. Fields not found on the website remain unverified until you supply evidence.'}
            </p>
          </div>
          {!baseConfirmed && (
            <div className="w-full rounded-2xl2 border border-warn-line bg-warn-bg/60 p-4 text-[12.5px] leading-[1.55] text-ink-2">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={baseAttestationAccepted}
                  onChange={(event) => setBaseAttestationAccepted(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#3A63C4]"
                />
                <span>
                  <b className="block text-ink">I confirm this information is true, complete and supported by my records.</b>
                  <span className="mt-1 block text-muted">
                    Website-derived details are a starting point only. This acknowledgment is for the prototype audit trail; it is not a statutory declaration or a substitute for merchant-banker due diligence and certification.
                  </span>
                </span>
              </label>
              <label className="mt-4 block max-w-[460px]">
                <span className="block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-2">Type your full name as digital signature</span>
                <input
                  value={baseDigitalSignature}
                  onChange={(event) => setBaseDigitalSignature(event.target.value)}
                  placeholder="Authorised signatory's full name"
                  className="mt-1.5 w-full rounded-xl2 border border-warn-line bg-white px-3 py-2.5 text-[13.5px] outline-none transition-colors focus:border-accent-500"
                />
              </label>
              <div className="mt-4 rounded-xl2 border border-info-line bg-info-bg/55 px-3.5 py-3 text-[11.5px] leading-[1.55] text-ink-2">
                <b className="text-info">SEBI ICDR context.</b> The offer document must contain material information that is true and adequate for an informed investment decision. The final filing and due-diligence certification remain the responsibility of the issuer’s SEBI-registered lead merchant banker.
              </div>
              {!attestationReady && (
                <p className="mt-3 text-[11.5px] font-semibold text-warn">Tick the confirmation and enter the authorised signatory’s name to continue.</p>
              )}
            </div>
          )}
          {baseConfirmed ? (
            <button
              onClick={() => {
                setBaseConfirmed(false)
                confirm.reset()
                showToast('Base unlocked for editing')
              }}
              className="btn btn-ghost shrink-0"
            >
              Reopen for editing
            </button>
          ) : (
            <ActionButton
              state={confirm.state}
              idle="Confirm these details"
              running="Saving…"
              done="Confirmed"
              icon={<Check size={16} />}
              className="btn btn-gold shrink-0"
              disabled={!attestationReady}
              onClick={() =>
                confirm.run({
                  onComplete: () => {
                    setBaseConfirmed(true)
                    showToast('Company base confirmed')
                  },
                })
              }
            />
          )}
        </div>
      </StageBlock>

      <StageFooter
        step="base"
        canContinue={baseConfirmed}
        blockedReason="Confirm the company base first — every document we collect next is checked against it."
        continueLabel="Start document collection"
        note={
          baseConfirmed
            ? 'Next: we collect the evidence behind this, one DRHP chapter group at a time.'
            : undefined
        }
        onContinue={() => {
          completeStep('base')
          goStep('documents')
        }}
      />
    </div>
  )
}

/* ============================================================
   An editable detail card
   ============================================================ */

function EditableCard({ title, src, fields }: { title: string; src: string; fields: Field[] }) {
  const companyEdits = useStore((s) => s.companyEdits)
  const setCompanyField = useStore((s) => s.setCompanyField)
  const showToast = useStore((s) => s.showToast)
  const save = useSimulatedAction({ ms: 700, holdMs: 2400 })

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const current = (field: Field) => companyEdits[field.key] ?? field.value

  function startEditing() {
    setDraft(Object.fromEntries(fields.map((f) => [f.key, current(f)])))
    setErrors({})
    setEditing(true)
  }

  function commit() {
    const next: Record<string, string> = {}
    fields.forEach((f) => {
      if (!f.pending && !draft[f.key]?.trim()) next[f.key] = `${f.label} cannot be empty.`
    })
    setErrors(next)
    if (Object.keys(next).length) return

    save.run({
      onComplete: () => {
        fields.forEach((f) => {
          const value = draft[f.key].trim()
          if (value !== current(f)) setCompanyField(f.key, value)
        })
        setEditing(false)
        showToast(`${title} saved`)
      },
    })
  }

  return (
    <div className="card flex h-full flex-col p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <b className="text-[15px] font-bold">{title}</b>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-50 px-2 py-1 text-[11px] font-bold text-accent-700">
            <FileText size={11} /> {src}
          </span>
          {!editing && (
            <button onClick={startEditing} className="btn btn-ghost btn-sm">
              <Pencil size={13} /> Edit
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="flex flex-1 flex-col">
          <div className="space-y-3">
            {fields.map((f) => {
              const errorId = `${f.key}-error`
              return (
                <div key={f.key}>
                  <label htmlFor={f.key} className="block text-[12px] font-semibold text-muted">
                    {f.label}
                  </label>
                  <input
                    id={f.key}
                    value={draft[f.key] ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                    aria-invalid={!!errors[f.key]}
                    aria-describedby={errors[f.key] ? errorId : undefined}
                    className={`mt-1 w-full rounded-xl2 border bg-white px-3 py-2 text-[13.5px] outline-none transition-colors duration-200 focus:border-accent-400 ${
                      errors[f.key] ? 'border-bad' : 'border-line-strong'
                    }`}
                  />
                  {errors[f.key] && (
                    <p id={errorId} role="alert" className="mt-1 text-[11.5px] font-semibold text-bad">
                      {errors[f.key]}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton
              state={save.state}
              idle="Save changes"
              running="Saving…"
              done="Saved"
              icon={<Save size={14} />}
              className="btn btn-gold btn-sm"
              onClick={commit}
            />
            <button
              onClick={() => {
                setEditing(false)
                setErrors({})
              }}
              className="btn btn-ghost btn-sm"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <dl className="flex-1">
            {fields.map((f) => {
              const edited = companyEdits[f.key] !== undefined
              return (
                <div
                  key={f.key}
                  className="flex justify-between gap-4 border-b border-dashed border-line py-2.5 text-[13.5px] last:border-0"
                >
                  <dt className="shrink-0 text-muted">
                    {f.label}
                    {f.hint && (
                      <span className="mt-0.5 block max-w-[24ch] text-[11px] leading-snug text-faint">{f.hint}</span>
                    )}
                  </dt>
                  <dd className="mono min-w-0 break-words text-right font-bold text-ink">
                    {current(f) || (f.pending ? <span className="font-medium text-faint">—</span> : '')}
                    {edited && (
                      <span className="ml-2 rounded bg-accent-50 px-1.5 py-0.5 text-[10px] font-bold text-accent-700">
                        edited
                      </span>
                    )}
                    {f.pending && !edited && (
                      <span className="mt-1 block text-[10.5px] font-medium normal-case tracking-normal text-muted">Not found on website</span>
                    )}
                  </dd>
                </div>
              )
            })}
          </dl>
          {save.state === 'done' && (
            <ResultNote className="mt-3" tone="ok">
              Changes saved to the draft.
            </ResultNote>
          )}
        </>
      )}
    </div>
  )
}
