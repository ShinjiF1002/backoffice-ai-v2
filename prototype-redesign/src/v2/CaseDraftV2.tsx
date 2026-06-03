import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheckIcon, AlertTriangleIcon } from 'lucide-react'
import { fieldLabelsForWorkflow } from '@/data/mock-case-detail'
import { useCases, useStoreDispatch, useCurrentActor } from '@/store/hooks'
import { NOW_ISO } from '@/lib/dates'
import { PageHeader, Card } from './ui'

/**
 * CaseDraftV2 — 手動起票 (form archetype、store 配線済)。AI が使えない場合の唯一の業務継続経路。
 * 起票=入力者の確認 (四眼の第一の眼)、反映には別担当者 (承認者) 承認が必須。store-truth で id 自動採番 (CASE-MANUAL-NNN)、
 * 全項目充足 gate を通過したら case/create を dispatch し、作成案件 (/cases/:id) へ遷移。AI prefill/OCR は出さない (honesty)。
 */
const WORKFLOWS = [
  { id: 'UC-BO-01', name: '法人住所変更' },
  { id: 'UC-BO-02', name: '口座開設書類完備' },
]
const DEFAULT_WORKFLOW = WORKFLOWS[0]?.name ?? '法人住所変更'

function fieldKind(label: string): { type: string; inputMode?: 'numeric'; placeholder?: string } {
  if (label.includes('コード')) return { type: 'text', inputMode: 'numeric', placeholder: '半角数字で入力（例: 042）' }
  if (label.includes('日') || label.includes('期限')) return { type: 'date' }
  return { type: 'text' }
}

export function CaseDraftV2() {
  const navigate = useNavigate()
  const dispatch = useStoreDispatch()
  const actor = useCurrentActor()
  const allCases = useCases('all')
  const [workflow, setWorkflow] = useState(DEFAULT_WORKFLOW)
  const [values, setValues] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const fields = fieldLabelsForWorkflow(workflow)
  const workflowId = WORKFLOWS.find((w) => w.name === workflow)?.id ?? 'UC-BO-01'
  // store-truth 由来の決定的採番 (CASE-MANUAL-NNN)。
  const manualCount = allCases.filter((c) => c.id.startsWith('CASE-MANUAL-')).length
  const newId = 'CASE-MANUAL-' + String(manualCount + 1).padStart(3, '0')
  const allFilled = fields.every((l) => (values[l] ?? '').trim() !== '')

  const changeWorkflow = (name: string) => {
    setWorkflow(name)
    setValues({})
    setTouched({})
    setSubmitted(false)
  }

  const handleSubmit = () => {
    if (!allFilled) {
      setSubmitted(true)
      // F-008 a11y: 最初の未入力 field へ programmatic focus (SR / keyboard user を error へ誘導)。
      const firstEmptyIdx = fields.findIndex((l) => (values[l] ?? '').trim() === '')
      if (firstEmptyIdx >= 0) document.getElementById('draft-f-' + firstEmptyIdx)?.focus()
      return
    }
    // 起票者 (現 actor) を assignee に既定 → 差戻し通知が起票者に届く (v2 は assignee 入力欄を持たないため自己割当)。
    dispatch({ type: 'case/create', id: newId, workflowId, workflowName: workflow, assignee: actor?.name, fieldLabels: fields, values, receivedAt: NOW_ISO })
    navigate('/cases/' + newId)
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      <PageHeader title="起票" sub="手動起票 — AI が使えない場合の手入力（書類走査なし）" />

      <div className="mx-auto w-full max-w-[640px] px-6 py-5">
        {/* four-eyes legibility */}
        <div className="mb-4 flex items-start gap-2 rounded-[var(--v2-radius-card)] border border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] px-3.5 py-2.5 text-[12px]">
          <ShieldCheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--v2-accent-soft-fg)]" aria-hidden="true" />
          <span className="text-[var(--v2-fg)]">
            起票は<strong>入力者の確認</strong>です。反映には<strong>別担当者（承認者）の承認</strong>が必須です（四眼: 起票者 ≠ 承認者）。
          </span>
        </div>

        <Card className="p-5">
          {/* workflow selector */}
          <fieldset>
            <legend className="text-[13px] font-medium text-[var(--v2-fg)]">業務</legend>
            <div className="mt-2 flex gap-2">
              {WORKFLOWS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => changeWorkflow(w.name)}
                  aria-pressed={workflow === w.name}
                  className={
                    'rounded-[var(--v2-radius-control)] border px-3 py-1.5 text-[13px] transition-colors ' +
                    (workflow === w.name
                      ? 'border-[var(--v2-accent-soft-border)] bg-[var(--v2-accent-soft)] font-medium text-[var(--v2-accent-soft-fg)]'
                      : 'border-[var(--v2-border)] bg-[var(--v2-panel)] text-[var(--v2-fg-muted)] hover:border-[var(--v2-border-strong)]')
                  }
                >
                  {w.name}
                </button>
              ))}
            </div>
          </fieldset>

          {/* fields */}
          <div className="mt-5 flex flex-col gap-4">
            {fields.map((label, i) => {
              const kind = fieldKind(label)
              const val = values[label] ?? ''
              // on-blur or submit 後に必須未入力を inline error 表示 (既存 error idiom を全必須項目へ)。
              const showErr = (touched[label] === true || submitted) && val.trim() === ''
              const id = 'draft-f-' + i
              return (
                <div key={label}>
                  <label htmlFor={id} className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--v2-fg)]">
                    {label}
                    <span className="text-[11px] font-normal text-[var(--v2-fg-tertiary)]">必須</span>
                  </label>
                  <input
                    id={id}
                    type={kind.type}
                    inputMode={kind.inputMode}
                    value={val}
                    placeholder={kind.placeholder}
                    aria-required="true"
                    aria-invalid={showErr || undefined}
                    aria-describedby={showErr ? id + '-err' : undefined}
                    onChange={(e) => setValues((v) => ({ ...v, [label]: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, [label]: true }))}
                    className={
                      'mt-1 h-9 w-full rounded-[var(--v2-radius-control)] border bg-[var(--v2-panel)] px-2.5 text-[14px] text-[var(--v2-fg)] placeholder:text-[var(--v2-fg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--v2-accent)] ' +
                      (showErr ? 'border-[var(--v2-error)]' : 'border-[var(--v2-border-strong)]')
                    }
                  />
                  {showErr && (
                    <p id={id + '-err'} role="alert" className="mt-1 flex items-center gap-1 text-[12px] text-[var(--v2-error-soft-fg)]">
                      <AlertTriangleIcon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                      {kind.inputMode === 'numeric' ? `${label}を半角数字でご入力ください（例: 042）。` : `${label}をご入力ください。`}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* footer: 単一決定 (起票) */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-[var(--v2-hairline)] pt-4">
            <button type="button" onClick={() => navigate('/cases')} className="rounded-[var(--v2-radius-control)] border border-[var(--v2-border-strong)] bg-[var(--v2-panel)] px-3.5 py-1.5 text-[13px] text-[var(--v2-fg)] hover:bg-[var(--v2-panel-inset)]">
              キャンセル
            </button>
            <button type="button" onClick={handleSubmit} className="rounded-[var(--v2-radius-control)] bg-[var(--v2-accent)] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[var(--v2-accent-hover)]">
              起票する
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
