import type { MetricRow } from '@/components/cross-cutting/MetricVsThreshold'
import { KPI_ROWS } from './mock-kpi'

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
}

export interface KnowledgeGroup {
  process: string
  icon: 'building' | 'wallet'
  items: { title: string; id: string; version: string }[]
}

export interface ObservatoryProcessMetrics {
  process: string
  icon: 'building' | 'wallet'
  rows: MetricRow[]
}

export const OBS_CASE_ID = 'CASE-2026-0142'

/** 職務分離 (SoD) 注記 */
export const OBS_SOD = { inputter: '山田太郎', approver: '鈴木課長' }

// §8: lifecycle (業務の流れ順、confidence なし)
export const OBS_LIFECYCLE: LifecycleEvent[] = [
  { time: '2026-05-31 09:00', actor: 'システム', role: 'システム', tone: 'inset', title: '受付', body: '申請書類を受け付けました。' },
  { time: '2026-05-31 09:02', actor: 'AI 担当 Agent', role: 'AI', tone: 'primary', title: 'AI 入力', body: '申請書類を読み取り、登録情報と照合して値を生成しました。' },
  { time: '2026-05-31 10:15', actor: '山田太郎', role: '入力者', tone: 'alert', title: '入力者確認', body: 'ビル名を申請書類の値で確定し、他の項目を確認しました。' },
  { time: '2026-05-31 11:30', actor: '鈴木課長', role: '承認者', tone: 'success', title: '承認者承認', body: '入力者の確認結果と申請書類を確認し、最終承認しました。' },
  { time: '2026-05-31 11:31', actor: 'システム', role: 'システム', tone: 'inset', title: '反映', body: '登録情報を更新しました。' },
]

// §9: raw event ledger (監査 export schema、confidence は本 view のみ)
export const OBS_LEDGER: LedgerEvent[] = [
  { ts: '2026-05-31 09:00:04', actor: 'system', role: 'system', action: 'intake', beforeAfter: '—', doc: 'CASE-2026-0142.pdf', policy: '—', approvalId: '—', confidence: '—' },
  { ts: '2026-05-31 09:02:11', actor: 'agent-corp-addr', role: 'AI', action: 'ai_input', beforeAfter: '(値生成) 法人名 / 新住所 / 支店 / 効力日 / ビル名', doc: 'CASE-2026-0142.pdf P.2', policy: 'v3.1', approvalId: '—', confidence: '法人名 0.98 / 住所 0.95 / ビル名 0.84' },
  { ts: '2026-05-31 10:15:42', actor: '山田太郎', role: 'inputter', action: 'field_override', beforeAfter: 'ビル名: サンプルビル → サンプルビルディング', doc: 'CASE-2026-0142.pdf P.2', policy: 'v3.1', approvalId: '—', confidence: '—' },
  { ts: '2026-05-31 11:30:08', actor: '鈴木課長', role: 'approver', action: 'business_approve', beforeAfter: 'status: 確認済 → 承認済', doc: '—', policy: 'v3.1', approvalId: 'A-7731', confidence: '—' },
  { ts: '2026-05-31 11:31:00', actor: 'system', role: 'system', action: 'reflect', beforeAfter: 'master 更新', doc: '—', policy: 'v3.1', approvalId: 'A-7731', confidence: '—' },
]

// §5: Process 別 KPI — KPI SSOT (mock-kpi.ts) を唯一 source に (手書き denom drift を解消、B3)。
export const OBS_METRICS: ObservatoryProcessMetrics[] = [
  { process: '法人住所変更', icon: 'building', rows: KPI_ROWS['UC-BO-01'] },
  { process: '口座開設書類完備', icon: 'wallet', rows: KPI_ROWS['UC-BO-02'] },
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
