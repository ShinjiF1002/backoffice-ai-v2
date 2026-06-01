import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlusIcon, AlertTriangleIcon, ShieldCheckIcon } from 'lucide-react'
import { useCases, useStoreDispatch } from '@/store/hooks'
import { fieldLabelsForWorkflow } from '@/data/mock-case-detail'
import { PageHeader } from '@/components/shared/PageHeader'
import { NOW_ISO } from '@/lib/dates'
import { cn } from '@/lib/cn'

/**
 * 手動起票 (CaseDraft, /cases/new) — B 型 form / 入力者 (W3 C4、typology 15)
 * SSOT: remediation-roadmap §4.0 (manual entry、AI 障害時の業務継続)。
 * AI が使えない時に全項目を人手入力して案件を起票する。送信で case/create → /cases queue に入る。
 */
const WORKFLOWS = [
  { id: 'UC-BO-01', name: '法人住所変更' },
  { id: 'UC-BO-02', name: '口座開設書類完備' },
  { id: 'UC-BO-03', name: '口座振替登録' },
  { id: 'UC-BO-04', name: '改印・代表者変更届' },
  { id: 'UC-BO-05', name: 'カード再発行' },
]

/**
 * F-033: 項目ラベルから入力型・形式制約を導く (素テキスト入力で型/形式検証/入力支援が皆無だった)。
 * 日付系 (効力発生日 / 生年月日 / 有効期限) は type='date'、コード系 (支店コード等) は数値 inputMode + 桁 pattern。
 */
function fieldInputProps(label: string): { type: string; inputMode?: 'numeric'; pattern?: string; placeholder?: string } {
  if (label.includes('日') || label.includes('期限')) return { type: 'date' }
  if (label.includes('コード') || label.includes('番号')) return { type: 'text', inputMode: 'numeric', pattern: '[0-9]*', placeholder: '数字で入力（例: 042）' }
  return { type: 'text' }
}

export function CaseDraft() {
  const navigate = useNavigate()
  const dispatch = useStoreDispatch()
  const allCases = useCases('all')
  const [workflowName, setWorkflowName] = useState('法人住所変更')
  const [assignee, setAssignee] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [showError, setShowError] = useState(false)
  // F-008: 送信失敗時に最初の無効 field へ programmatic focus を移すための ref 束 (input は常時 render ゆえ submit 時に存在)。
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const labels = fieldLabelsForWorkflow(workflowName)
  const workflowId = WORKFLOWS.find((w) => w.name === workflowName)?.id ?? 'UC-BO-01'
  // 自動採番: 既存の手動起票 case 数 + 1 (store-truth 由来、決定的)。
  const manualCount = allCases.filter((c) => c.id.startsWith('CASE-MANUAL-')).length
  const newId = `CASE-MANUAL-${String(manualCount + 1).padStart(3, '0')}`
  const allFilled = labels.every((l) => (values[l] ?? '').trim() !== '')
  const filledCount = labels.filter((l) => (values[l] ?? '').trim() !== '').length

  const setValue = (label: string, v: string) => {
    setValues((prev) => ({ ...prev, [label]: v }))
    if (showError && v.trim()) setShowError(false)
  }
  // workflow 切替で前 workflow の入力値をクリア (別 field 集合ゆえ)。
  const onWorkflowChange = (name: string) => {
    setWorkflowName(name)
    setValues({})
    setShowError(false)
  }

  const handleSubmit = () => {
    if (!allFilled) {
      setShowError(true)
      // F-008: 最初の無効 field へ focus を移す (キーボード/SR 利用者が誤り箇所へ即到達)。
      const firstInvalid = labels.find((l) => !(values[l] ?? '').trim())
      if (firstInvalid) inputRefs.current[firstInvalid]?.focus()
      return
    }
    dispatch({
      type: 'case/create',
      id: newId,
      workflowId,
      workflowName,
      assignee: assignee.trim() || undefined,
      fieldLabels: labels,
      values,
      receivedAt: NOW_ISO,
    })
    // 起票後は作成した案件の詳細へ (作成 → 確認待ち案件として開ける end-to-end)。
    navigate(`/cases/${newId}`)
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={
          <h1 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-fg)]">
            <FilePlusIcon className="h-5 w-5 text-[var(--color-primary-strong)]" aria-hidden="true" />
            新規案件作成（手動起票）
          </h1>
        }
        subtitle="AI が使えない時に全項目を手入力して起票します。送信すると確認待ちの案件として一覧に入ります。"
      >
        {/* F-034: 起票が四眼のどの眼かを legible に — 起票=入力者の確認、別担当者の承認者承認が後段で必須 (SoD)。 */}
        <p className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-fg-tertiary)]">
          <ShieldCheckIcon className="h-3 w-3 flex-shrink-0 text-[var(--color-fg-tertiary)]" aria-hidden="true" />
          起票は「入力者の確認」に当たります。反映には別担当者（承認者）の承認が必要です（四眼原則：起票者 ≠ 承認者）。
        </p>
      </PageHeader>

      <div className="mx-auto w-full max-w-2xl p-6">
        <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <div className="flex items-center justify-between rounded-[var(--radius-control)] bg-[var(--color-panel-inset)] px-3 py-2 text-xs">
            <span className="text-[var(--color-fg-tertiary)]">案件 ID（自動採番）</span>
            <span className="font-mono text-[var(--color-fg)]">{newId}</span>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--color-fg)]">業務</span>
            <select
              value={workflowName}
              onChange={(e) => onWorkflowChange(e.target.value)}
              className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-primary)]"
            >
              {WORKFLOWS.map((w) => (
                <option key={w.id} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--color-fg)]">担当者（任意）</span>
            <input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="未入力なら未割当"
              className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-primary)]"
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--color-fg)]">項目（全項目 必須）</span>
              {/* F-033: 必須充足の進捗を入力中から提示 (送信後まで未充足が分からない問題の解消)。 */}
              <span className="text-[11px] font-medium text-[var(--color-fg-tertiary)]">
                {filledCount}/{labels.length} 入力済
              </span>
            </div>
            {labels.map((label) => {
              const invalid = showError && !(values[label] ?? '').trim()
              const inputProps = fieldInputProps(label)
              return (
                <label key={label} className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--color-fg-muted)]">{label}</span>
                  <input
                    ref={(el) => {
                      inputRefs.current[label] = el
                    }}
                    type={inputProps.type}
                    inputMode={inputProps.inputMode}
                    pattern={inputProps.pattern}
                    placeholder={inputProps.placeholder}
                    required
                    value={values[label] ?? ''}
                    onChange={(e) => setValue(label, e.target.value)}
                    aria-invalid={invalid}
                    aria-describedby={invalid ? 'casedraft-error' : undefined}
                    className={cn(
                      'rounded-[var(--radius-control)] border px-3 py-2 text-sm outline-none',
                      invalid
                        ? 'border-[var(--color-error)] bg-[var(--color-error-soft)]'
                        : 'border-[var(--color-border-strong)] bg-[var(--color-panel)] focus:border-[var(--color-primary)]'
                    )}
                  />
                </label>
              )
            })}
          </div>

          {showError && (
            // F-008: role=alert + aria-live で SR に即時通知 (各無効 input が aria-describedby で本文を参照)。
            <span id="casedraft-error" role="alert" aria-live="assertive" className="flex items-center gap-1 text-xs text-[var(--color-error-soft-fg)]">
              <AlertTriangleIcon className="h-3 w-3 text-[var(--color-error)]" aria-hidden="true" />
              全項目を入力してください
            </span>
          )}

          <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
            <button
              type="button"
              onClick={() => navigate('/cases')}
              className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] hover:bg-[var(--color-panel-inset)]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
            >
              <FilePlusIcon className="h-4 w-4" aria-hidden="true" />
              起票する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
