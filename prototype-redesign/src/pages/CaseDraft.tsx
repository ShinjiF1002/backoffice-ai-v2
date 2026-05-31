import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlusIcon, AlertTriangleIcon } from 'lucide-react'
import { useCases, useStoreDispatch } from '@/store/hooks'
import { fieldLabelsForWorkflow } from '@/data/mock-case-detail'
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
]

export function CaseDraft() {
  const navigate = useNavigate()
  const dispatch = useStoreDispatch()
  const allCases = useCases('all')
  const [workflowName, setWorkflowName] = useState('法人住所変更')
  const [assignee, setAssignee] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [showError, setShowError] = useState(false)

  const labels = fieldLabelsForWorkflow(workflowName)
  const workflowId = WORKFLOWS.find((w) => w.name === workflowName)?.id ?? 'UC-BO-01'
  // 自動採番: 既存の手動起票 case 数 + 1 (store-truth 由来、決定的)。
  const manualCount = allCases.filter((c) => c.id.startsWith('CASE-MANUAL-')).length
  const newId = `CASE-MANUAL-${String(manualCount + 1).padStart(3, '0')}`
  const allFilled = labels.every((l) => (values[l] ?? '').trim() !== '')

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
      <header
        data-page-header
        className="sticky top-0 z-30 flex min-h-[var(--height-pageheader)] flex-col justify-center border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4"
      >
        <h1 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-fg)]">
          <FilePlusIcon className="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
          新規案件作成（手動起票）
        </h1>
        <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
          AI が使えない時に全項目を手入力して起票します。送信すると確認待ちの案件として一覧に入ります。
        </p>
      </header>

      <div className="mx-auto w-full max-w-2xl p-6">
        <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <div className="flex items-center justify-between rounded-[var(--radius-control)] bg-[var(--color-panel-inset)] px-3 py-2 text-xs">
            <span className="text-[var(--color-fg-muted)]">案件 ID（自動採番）</span>
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
            <span className="text-xs font-medium text-[var(--color-fg)]">項目（全項目 必須）</span>
            {labels.map((label) => {
              const invalid = showError && !(values[label] ?? '').trim()
              return (
                <label key={label} className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--color-fg-muted)]">{label}</span>
                  <input
                    value={values[label] ?? ''}
                    onChange={(e) => setValue(label, e.target.value)}
                    aria-invalid={invalid}
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
            <span className="flex items-center gap-1 text-xs text-[var(--color-error-soft-fg)]">
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
