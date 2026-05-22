/**
 * Mock data shared types
 * SSOT: docs/_SSOT.md §1.1 enum + §1.4 Snippet schema + prototype/CLAUDE.md
 */

// === enum (docs/_SSOT.md §1.1 と整合) ===
export type TrustLevel = 'supervised' | 'checkpoint' | 'autonomous' | 'n/a'
export type RiskLevel = 'low' | 'medium' | 'high'
export type AutomationStatus = 'active' | 'restricted' | 'prohibited'
export type Weight = 'low' | 'medium' | 'high'
export type SendBackCategory = 'misunderstanding' | 'ui_change' | 'edge_case' | 'judgment_gap' | 'data_error'

// === Case lifecycle (docs/03 §2.7.2 + Day 11 Step 2 訂正後、手順承認 を含まない) ===
export type CaseLifecycleStep = '受付' | 'AI処理' | '入力者確認' | '承認者承認' | '反映'
export type CaseStatus = 'pending' | 'ready' | 'sent-back' | 'business-approval-waiting' | 'reflected'

// === Case ===
export interface CaseField {
  /** field 名 (日本語) */
  label: string
  /** AI 入力結果 (現在値) */
  value: string
  /** 旧値 (diff 表示用、optional) */
  oldValue?: string
  /** AI confidence (0-1) */
  confidence: number
  /** AI 提案 source (diff 表示が必要な field のみ) */
  hasDiff?: boolean
  /** monospace で表示するか (数値 / コード等) */
  monospace?: boolean
}

export interface CaseAlert {
  id: string
  /** Alert severity */
  severity: 'amber' | 'red'
  /** 表示文言 (operational copy、日本語、internal flavor は避ける) */
  message: string
  /** Source step (timeline 連動) */
  sourceStep?: string
}

export interface EvidenceStep {
  id: string
  /** Step name (受付 / OCR / マスタ照合 等) */
  name: string
  timestamp: string
  /** 実行 actor (AI / 入力者 / system) */
  actor: 'AI' | '入力者' | '承認者' | 'system'
  /** Source identifier (mono metadata line で表示、e.g. ocr-engine-v2.3 / db.address_master / ai.address-extractor-v2.3) */
  source?: string
  /** Thumbnail label (mock では絵文字 or 文字、Day 14-18 で実 image 想定) */
  thumbnailLabel: string
  /** Confidence at this step */
  confidence?: number
  /** Status */
  status: 'completed' | 'warning' | 'pending'
}

export interface CitationRef {
  knowledgeId: string
  /** タイトル (日本語) */
  title: string
  /** Relevance (0-1) */
  relevance: number
  /** Compiled 承認済 (weight: high のみ citation 候補) */
  weight: Extract<Weight, 'high'>
  /** 7-day confidence trend (sparkline 用、0-1 array、7 points) */
  trend: number[]
  /** Source path */
  sourcePath: string
}

export interface StagingHintRef {
  knowledgeId: string
  /** タイトル (日本語) */
  title: string
  /** Weight (low / medium のみ、high は citation 側) */
  weight: 'low' | 'medium'
  /** Category (data_error は除外、別 routing) */
  category: Exclude<SendBackCategory, 'data_error'>
  /** Excerpt */
  excerpt: string
  /** Source path */
  sourcePath: string
}

export interface RelatedRuleUpdate {
  /** 関連手順更新 Alert (3 適用範囲、本 case 作成後に承認されたルール) */
  ruleId: string
  ruleName: string
  /** 承認日 */
  approvedAt: string
}

export interface CaseRecord {
  /** Case ID */
  id: string
  /** Workflow ID */
  workflowId: string
  /** Workflow name (日本語) */
  workflowName: string
  /** 状態 */
  status: CaseStatus
  /** 状態 label (日本語) */
  statusLabel: string
  /** 経過時間 label */
  elapsedLabel: string
  /** Current lifecycle step */
  currentStep: CaseLifecycleStep
  /** AI 入力結果 fields */
  fields: CaseField[]
  /** PDF preview label (mock) */
  pdfName: string
  pdfPages: number
  /** Evidence timeline */
  evidence: EvidenceStep[]
  /** Alerts (amber / red chips) */
  alerts: CaseAlert[]
  alertCount: number
  /** AI Proposal citations (compiled approved only) */
  citations: CitationRef[]
  /** Staging hints (low / medium、別 panel で視覚分離、citation 対象外) */
  stagingHints: StagingHintRef[]
  /** 関連手順更新 Alert (本 case 作成後に承認されたルール) */
  relatedRuleUpdates: RelatedRuleUpdate[]
  /** Business approval status (chip 表示、Day 11.3 #5b: 未着手 → 未送付 semantic accuracy) */
  businessApprovalStatus: '未送付' | '承認待ち' | '承認済' | '差戻し'
}
