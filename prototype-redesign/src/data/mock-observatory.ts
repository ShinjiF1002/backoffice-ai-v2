import type { MetricRow } from '@/components/cross-cutting/MetricVsThreshold'
import { KPI_ROWS } from './mock-kpi'
import { CASE_LIST } from './mock-case-list'

/**
 * Observatory (/observatory) data — Process-First v2, typology A, 監査者 view (read-only)
 * SSOT: mock-fixture §8 (lifecycle) / §9 (ledger) / §5 (metrics) / §10、reference: screens-v2/09-observatory。
 *
 * ▼ raw ledger 例外 (canonical-export §監査メモ):
 *   confidence は LedgerEvent (証跡台帳 = 監査 export schema) にのみ存在する。
 *   業務 view (LifecycleEvent) は型として confidence を持たない → 業務画面への confidence 流出を型で防ぐ。
 *   action code (ai_input 等) / actor id も raw 台帳のみの技術記録。
 *   ※ P2B-4 内部語 gate: 本 file の 'confidence' / action code は監査台帳の sanctioned 例外として許容 (業務画面では非表示)。
 */

/** 業務 view: 案件の経過 (confidence を持たない) */
export interface LifecycleEvent {
  time: string
  actor: string
  role: string // 業務語 (システム / AI / 入力者 / 承認者)
  tone: 'inset' | 'primary' | 'alert' | 'success'
  title: string
  body: string
}

/** 監査 view: 証跡台帳 (export schema)。confidence はこの型にのみ存在する (LifecycleEvent には無い)。 */
export interface LedgerEvent {
  ts: string
  actor: string
  role: string
  action: string
  beforeAfter: string
  doc: string
  policy: string
  approvalId: string
  /** 監査記録としてのみ保持。業務 view (LifecycleEvent) には型として存在しない。 */
  confidence: string
  /** P1-7: 横断台帳 (CROSS_LEDGER) の案件キー。row→/cases/:caseId drill + 案件/業務 filter の母集合。 */
  caseId: string
  workflowName: string
}

export interface KnowledgeGroup {
  process: string
  icon: 'building' | 'wallet'
  items: { title: string; id: string; version: string }[]
}

/**
 * Flywheel lineage の段階定義 (remediation P0-W3、Gate 5ii)。
 * 「差戻し → 改善ヒント (未承認) → 手順承認 → 設定承認」の 4 段。表示用ラベルのみ (内部 schema 語は出さない)。
 * staging 段は「未承認ヒント = AI 正式実行の根拠にはならない」を note で明示 (R0 非統制 disclaimer の継承)。
 */
export interface LineageStage {
  key: 'sendback' | 'staging' | 'procedure' | 'config'
  label: string
  note: string
}

export const FLYWHEEL_STAGES: LineageStage[] = [
  { key: 'sendback', label: '差戻し', note: '現場の差戻しが改善の起点になります。' },
  { key: 'staging', label: '改善ヒント（未承認）', note: 'AI が差戻しから候補を整理。未承認のため、AI が自動実行する根拠にはなりません。' },
  { key: 'procedure', label: '手順承認', note: '業務責任者が手順改定を承認します。' },
  { key: 'config', label: '設定承認', note: 'AI の設定変更として正式に反映されます。' },
]

export interface ObservatoryProcessMetrics {
  process: string
  icon: 'building' | 'wallet'
  rows: MetricRow[]
}

export const OBS_CASE_ID = 'CASE-2026-0142'

/** 職務分離 (SoD) 注記 */
export const OBS_SOD = { inputter: '山田太郎', approver: '鈴木課長' }

// §8: lifecycle (業務の流れ順、confidence なし)。代表 0142 の時刻は receivedAt (2026-05-30 16:40、mock-case-list) 起点で整合 (受付→反映 が受付時刻以降)。
export const OBS_LIFECYCLE: LifecycleEvent[] = [
  { time: '2026-05-30 16:40', actor: 'システム', role: 'システム', tone: 'inset', title: '受付', body: '申請書類を受け付けました。' },
  { time: '2026-05-30 16:42', actor: 'AI 担当 Agent', role: 'AI', tone: 'primary', title: 'AI 入力', body: '申請書類を読み取り、登録情報と照合して値を生成しました。' },
  { time: '2026-05-30 17:10', actor: '山田太郎', role: '入力者', tone: 'alert', title: '入力者確認', body: 'ビル名を申請書類の値で確定し、他の項目を確認しました。' },
  { time: '2026-05-30 17:35', actor: '鈴木課長', role: '承認者', tone: 'success', title: '承認者承認', body: '入力者の確認結果と申請書類を確認し、最終承認しました。' },
  { time: '2026-05-30 17:36', actor: 'システム', role: 'システム', tone: 'inset', title: '反映', body: '登録情報を更新しました。' },
]

// §9: raw event ledger (監査 export schema、confidence は本 view のみ)。代表 0142 = rich 5 event。
const C0142 = { caseId: OBS_CASE_ID, workflowName: '法人住所変更' }
export const OBS_LEDGER: LedgerEvent[] = [
  { ts: '2026-05-30 16:40:04', actor: 'system', role: 'system', action: 'intake', beforeAfter: '—', doc: 'CASE-2026-0142.pdf', policy: '—', approvalId: '—', confidence: '—', ...C0142 },
  { ts: '2026-05-30 16:42:11', actor: 'agent-corp-addr', role: 'AI', action: 'ai_input', beforeAfter: '(値生成) 法人名 / 新住所 / 支店 / 効力日 / ビル名', doc: 'CASE-2026-0142.pdf P.2', policy: 'v3.1', approvalId: '—', confidence: '法人名 0.98 / 住所 0.95 / ビル名 0.84', ...C0142 },
  { ts: '2026-05-30 17:10:42', actor: '山田太郎', role: 'inputter', action: 'field_override', beforeAfter: 'ビル名: サンプルビル → サンプルビルディング', doc: 'CASE-2026-0142.pdf P.2', policy: 'v3.1', approvalId: '—', confidence: '—', ...C0142 },
  { ts: '2026-05-30 17:35:08', actor: '鈴木課長', role: 'approver', action: 'business_approve', beforeAfter: 'status: 確認済 → 承認済', doc: '—', policy: 'v3.1', approvalId: 'A-7731', confidence: '—', ...C0142 },
  { ts: '2026-05-30 17:36:00', actor: 'system', role: 'system', action: 'reflect', beforeAfter: 'master 更新', doc: '—', policy: 'v3.1', approvalId: 'A-7731', confidence: '—', ...C0142 },
]

// P1-7: 横断台帳 (CROSS_LEDGER) = 13 業務 case を flatten (JG-1 (a)-lite)。代表 0142 は上記 rich event、
// 他 case は 4-event 雛形 (受付/AI入力/入力者確認/承認者承認) を deterministic 生成 (未来日回避: 2026-05-01..28、Date parse 不使用)。
const LEDGER_TEMPLATE: { action: string; role: string; beforeAfter: string; hasApproval: boolean }[] = [
  { action: 'intake', role: 'system', beforeAfter: '申請書類を受付', hasApproval: false },
  { action: 'ai_input', role: 'AI', beforeAfter: '(値生成) 申請項目を読み取り照合', hasApproval: false },
  { action: 'field_confirm', role: 'inputter', beforeAfter: '入力者が確認', hasApproval: false },
  { action: 'business_approve', role: 'approver', beforeAfter: 'status: 確認済 → 承認済', hasApproval: true },
]
function templateLedger(caseId: string, workflowName: string, owner: string, idx: number): LedgerEvent[] {
  const inputter = owner === '—' ? '(未割当)' : owner
  const day = String(((idx * 3) % 28) + 1).padStart(2, '0')
  return LEDGER_TEMPLATE.map((t, j) => ({
    ts: `2026-05-${day} ${String(9 + j).padStart(2, '0')}:${String((idx * 7 + j * 11) % 60).padStart(2, '0')}:00`,
    actor: t.role === 'system' ? 'system' : t.role === 'AI' ? 'agent' : t.role === 'inputter' ? inputter : '鈴木課長',
    role: t.role,
    action: t.action,
    beforeAfter: t.beforeAfter,
    doc: `${caseId}.pdf`,
    policy: 'v3.1',
    approvalId: t.hasApproval ? `A-${7100 + idx}` : '—',
    confidence: t.role === 'AI' ? '一括 0.9x' : '—',
    caseId,
    workflowName,
  }))
}
export const CROSS_LEDGER: LedgerEvent[] = [
  ...OBS_LEDGER,
  ...CASE_LIST.filter((c) => c.id !== OBS_CASE_ID).flatMap((c, i) => templateLedger(c.id, c.workflow, c.owner, i)),
]

// §5: Process 別 KPI — KPI SSOT (mock-kpi.ts) を唯一 source に (手書き denom drift を解消、B3)。
// P1-7: 未達 KPI のみ該当 Agent へ drill 先を付与 (調査導線、monitoring dead-end 解消)。frozen KPI_ROWS は複製して付与。
function withAgentDrill(rows: MetricRow[], agentId: string): MetricRow[] {
  return rows.map((r) => (r.achieved ? r : { ...r, agentHref: `/agents/${agentId}` }))
}
export const OBS_METRICS: ObservatoryProcessMetrics[] = [
  { process: '法人住所変更', icon: 'building', rows: withAgentDrill(KPI_ROWS['UC-BO-01'], 'agent-corporate-address-change') },
  { process: '口座開設書類完備', icon: 'wallet', rows: withAgentDrill(KPI_ROWS['UC-BO-02'], 'agent-account-opening') },
]

// ナレッジ (Process 別 grouping)。'番地表記正規化ルール' は KB 規定の正式名 (status enum の内部語ではなく domain 用語)。
export const OBS_KNOWLEDGE: KnowledgeGroup[] = [
  {
    process: '法人住所変更',
    icon: 'building',
    items: [
      { title: '法人住所変更フロー', id: 'KB-FLOW-022', version: 'v3.1' },
      { title: '番地表記正規化ルール', id: 'KB-RULE-008', version: 'v1.4' },
      { title: '効力発生日設定基準', id: 'KB-RULE-014', version: 'v2.0' },
    ],
  },
  {
    process: '口座開設書類完備',
    icon: 'wallet',
    items: [
      { title: '口座開設書類チェックリスト', id: 'KB-FLOW-031', version: 'v2.2' },
      { title: '本人確認書類の有効期限基準', id: 'KB-RULE-019', version: 'v1.1' },
    ],
  },
]
