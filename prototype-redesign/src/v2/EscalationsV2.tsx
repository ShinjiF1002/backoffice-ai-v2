import { PageHeader, ToneChip } from './ui'
import { DataTable } from './DataTable'

/** EscalationsV2 — エスカレーション受信 (list)。業務責任者の裁定待ちキュー。 */
const ESCALATIONS = [
  { id: 'CASE-2026-0142', workflow: '法人住所変更', reason: 'ビル名の判定基準が不明確で確認が必要', to: '鈴木課長', status: '裁定待ち' },
  { id: 'CASE-2026-0104', workflow: '口座開設書類完備', reason: '有効期限の読み取りに疑義あり', to: '高橋部長', status: '裁定待ち' },
]

export function EscalationsV2() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="エスカレーション"
        sub={
          <>
            業務責任者の裁定待ち — <span className="v2-tnum font-medium text-[var(--v2-fg)]">{ESCALATIONS.length}</span> 件
          </>
        }
      />
      <div className="flex-1 overflow-auto px-6 py-4">
        <DataTable
          gridCols="grid-cols-[150px_140px_1fr_104px_104px]"
          rows={ESCALATIONS}
          getKey={(r) => r.id}
          rowHref={(r) => '/v2/cases/' + r.id}
          cols={[
            { label: '案件ID', render: (r) => <span className="v2-mono font-medium text-[var(--v2-fg)]">{r.id}</span> },
            { label: '業務', render: (r) => <span className="truncate text-[var(--v2-fg-muted)]">{r.workflow}</span> },
            { label: '依頼理由', render: (r) => <span className="truncate text-[var(--v2-fg)]">{r.reason}</span> },
            { label: '宛先', render: (r) => <span className="text-[var(--v2-fg-muted)]">{r.to}</span> },
            { label: '状態', render: (r) => <ToneChip tone="alert" label={r.status} /> },
          ]}
        />
      </div>
    </div>
  )
}
