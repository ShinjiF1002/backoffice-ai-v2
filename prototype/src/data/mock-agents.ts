import type { TrustLevel, RiskLevel, AutomationStatus, ApprovalType } from './types'

/**
 * Mock agents — Day 12 Page 5 拡張 (AgentSettings wireframe 用)
 * SSOT:
 *  - docs/_SSOT.md §1.1 enum + workflows/_index.md (3 業務並列、Trust Level Progression)
 *  - docs/03-ui-prototype-design.md §4.6 (AgentSettings Screen Card)
 *
 * 国際送金 (restricted) は UI 対象外、本 mock data に含めない (docs/00 §2.1)。
 *
 * Day 12 Page 5 で AgentRecord に 5 領域 (Model / Prompt / Tool / 権限 / Trust Level) の現状値 + 変更履歴を拡張。
 * 編集 form / submit-approval interaction は Day 14-15+ で AppContext 経由。
 */

export interface AgentToolEntry {
  id: string
  name: string
  description: string
}

export interface AgentPermissions {
  /** データ scope (個別顧客データ access 範囲) */
  dataScope: string
  /** automation boundary 説明 */
  boundary: string
}

export interface AgentChangeHistoryEntry {
  id: string
  /** YYYY-MM-DD */
  date: string
  type: ApprovalType
  summary: string
  approver: string
}

export interface AgentRecord {
  id: string
  name: string
  workflowId: string
  trustLevel: TrustLevel
  riskLevel: RiskLevel
  automationStatus: AutomationStatus
  /** agent_version (_meta.yaml 由来) */
  version: string
  modelLabel: string
  promptVersion: string
  promptSummary: string
  tools: AgentToolEntry[]
  permissions: AgentPermissions
  /** 直近 3 件の設定承認変更 (詳細 timeline は AuditTrail page で展開) */
  changeHistory: AgentChangeHistoryEntry[]
}

export const mockAgents: AgentRecord[] = [
  {
    id: 'agent-corporate-address-change',
    name: '法人住所変更 Agent',
    workflowId: 'UC-BO-01',
    trustLevel: 'supervised',
    riskLevel: 'medium',
    automationStatus: 'active',
    version: 'v0.1',
    modelLabel: 'AI ベースモデル A (mock)',
    promptVersion: 'v0.1',
    promptSummary:
      '住所変更の OCR 抽出 + 住所マスタ照合 + 信頼度 0.85 閾値 + 多店舗 / 法人格 / 海外住所 の境界判定',
    tools: [
      {
        id: 'tool-ocr',
        name: 'OCR 抽出',
        description: 'PDF → text 抽出 (信頼度 0.85 閾値、未達 → 注意 raise)',
      },
      {
        id: 'tool-master-lookup',
        name: '住所マスタ照合',
        description: '都道府県マスタ + 郵便番号 cross-check (未登録 → 注意 raise)',
      },
      {
        id: 'tool-staging-knowledge',
        name: '未承認ナレッジ参照',
        description: '未承認 entry を prompt 注入 (citation 対象外、引用根拠には使わない)',
      },
    ],
    permissions: {
      dataScope: 'UC-BO-01 法人住所変更 内の個別顧客データ (read-only)',
      boundary: 'active (通常 AI 自動化対象、Trust Level Supervised で全件 確認)',
    },
    changeHistory: [
      {
        id: 'chg-uc01-003',
        date: '2026-05-28',
        type: 'A',
        summary: 'Prompt v0.0 → v0.1: OCR 信頼度閾値 0.80 → 0.85 引き上げ',
        approver: '佐藤 隆 (AI 管理者)',
      },
      {
        id: 'chg-uc01-002',
        date: '2026-05-15',
        type: 'A',
        summary: '住所マスタ照合 tool に都道府県 cross-check 機能を追加',
        approver: '佐藤 隆 (AI 管理者)',
      },
      {
        id: 'chg-uc01-001',
        date: '2026-04-22',
        type: 'C',
        summary: 'Trust Level Supervised 確立 (初回設定、Automation Maturity 開始)',
        approver: '渡辺 真理 (業務責任者) + 佐藤 隆 (AI 管理者)',
      },
    ],
  },
  {
    id: 'agent-account-opening',
    name: '口座開設書類完備 Agent',
    workflowId: 'UC-BO-02',
    trustLevel: 'supervised',
    riskLevel: 'medium',
    automationStatus: 'active',
    version: 'v0.1',
    modelLabel: 'AI ベースモデル A (mock)',
    promptVersion: 'v0.1',
    promptSummary:
      '口座開設書類の OCR 抽出 + 印鑑照合 + 本人確認書類 2 点完備チェック + 有効期限確認',
    tools: [
      {
        id: 'tool-ocr',
        name: 'OCR 抽出',
        description: 'PDF → text 抽出 (信頼度 0.85 閾値、未達 → 注意 raise)',
      },
      {
        id: 'tool-seal-verification',
        name: '印鑑照合',
        description: '届出印鑑画像との照合 (信頼度 0.80 閾値)',
      },
      {
        id: 'tool-id-doc-check',
        name: '本人確認書類チェック',
        description: '2 点完備 + 有効期限確認 (運転免許証 / マイナンバーカード等)',
      },
    ],
    permissions: {
      dataScope: 'UC-BO-02 口座開設書類完備 内の個別顧客データ (read-only)',
      boundary: 'active (通常 AI 自動化対象、Trust Level Supervised で全件 確認)',
    },
    changeHistory: [
      {
        id: 'chg-uc02-002',
        date: '2026-05-22',
        type: 'A',
        summary: 'Prompt v0.0 → v0.1: 印鑑照合の信頼度閾値 調整',
        approver: '伊藤 翔 (AI 管理者)',
      },
      {
        id: 'chg-uc02-001',
        date: '2026-04-22',
        type: 'C',
        summary: 'Trust Level Supervised 確立 (初回設定、Automation Maturity 開始)',
        approver: '渡辺 真理 (業務責任者) + 伊藤 翔 (AI 管理者)',
      },
    ],
  },
]

/** Get a single agent by ID (mock helper) */
export function getAgentById(id: string): AgentRecord | undefined {
  return mockAgents.find((a) => a.id === id)
}
