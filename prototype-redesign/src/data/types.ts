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

/** 設定承認 Type (DOC-APP-02 §4): A 通常 / B Security-impacting / C Automation Maturity 変更 */
export type ApprovalType = 'A' | 'B' | 'C'

// === Case lifecycle (docs/03 §2.7.2 + Day 11 Step 2 訂正後、手順承認 を含まない) ===
export type CaseLifecycleStep = '受付' | 'AI処理' | '入力者確認' | '承認者承認' | '反映'
export type CaseStatus = 'pending' | 'ready' | 'sent-back' | 'business-approval-waiting' | 'reflected'

// === F-2 / F-5 / F-7 Wave 2 拡張 (Implementation Plan v3.0 §PR 2、gate1-decision.md spec 通り) ===

/** Actor enum (ActorBand primitive 用、3 enum 統合: 入力者/承認者 → 'human') */
export type Actor = 'agent' | 'human' | 'system'

/** Reversibility (F-2 MetadataStrip 5 element の 1 つ) */
export type Reversibility = 'Revertible' | 'Partial' | 'Irreversible'

/** F-7 LifecycleStepper SLA per step + approver (Card 8 multi-step-approval-and-workflow 反映) */
export interface CaseLifecycleStepSpec {
  step: CaseLifecycleStep
  state: 'done' | 'current' | 'pending'
  /** SLA target label (`[仮説 / 要検証]` suffix 付与済、demo mock 固定値) */
  slaTargetLabel: string
  /** SLA target (分)、`'instant'` = 即時実行 */
  slaTargetMinutes: number | 'instant'
  /** current step のみ: 経過時間 label */
  elapsedLabel?: string
  /** current step のみ: 経過率 (0-200+、100 = SLA target ぴったり) */
  elapsedPercent?: number
  /** Approver (per step、Day 19 vocab 通り 入力者/承認者 etc.、ActorBand mapping は actor enum) */
  approver?: { name: string; role: '入力者' | '承認者' | 'AI' | 'system' }
}

/** F-7 Delegate info (Inbox MetaChip + LifecycleStepper hover で表示) */
export interface DelegateInfo {
  /** 元 assignee (e.g. '渡辺 真理') */
  from: string
  /** 代理 assignee (e.g. '鈴木 直樹') */
  to: string
  /** 不在 開始日 */
  absentFrom: string
  /** 不在 終了日 */
  absentTo: string
}

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
  // === F-2 metadata (Wave 2、MetadataStrip 5 element 対応、Implementation Plan v3.0 §PR 2 Commit 2) ===
  /** Change author (AI agent name + model version、e.g. 'AI 抽出 v2.3') */
  changeAuthor?: string
  /** Change reason (OCR 信頼度未達 等、operational rationale) */
  changeReason?: string
  /** Affected scope (e.g. '1 customer'、'12 cases (3 週間履歴)') */
  affectedScope?: string
  /** Reversibility (反映前/反映後 の rollback 可能性) */
  reversibility?: Reversibility
}

export interface CaseAlert {
  id: string
  /**
   * Alert severity (semantic enum、Day 14 P1.5 C2 で `'amber' | 'red'` color name から rename)
   * - `caution`: 注意水準 (旧 `'amber'`、現 mock-cases 6 entry 全て此処)
   * - `severe`: 重大水準 (旧 `'red'`、現 mock-cases 未使用、将来値)
   *
   * **Prop 命名規範** (Day 14 P1.5 C2 で SSOT 化):
   * - `tone`: 色 semantic (`'neutral'|'primary'|'success'|'alert'|'error'`)、StatusBadge / chip primitive で使う
   * - `severity`: 深刻度 (`'caution'|'severe'`)、Alert 系で使う
   * - `status`: workflow state (CaseStatus / ProposalStatus 等の domain enum)
   * - `kind`: type / variant 区別 (例: `'banner'|'inline'`)
   *
   * Color name (amber/red) vs semantic (caution/severe) は混在禁止。color name は token 経由でのみ表現 (`text-[var(--color-alert-soft-fg)]` 等、C1 規範)。
   */
  severity: 'caution' | 'severe'
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
  /** 関連手順更新 Alert (3 適用範囲、本案件作成後に承認されたルール) */
  ruleId: string
  ruleName: string
  /** 承認日 */
  approvedAt: string
  /** 該当 proposal ID (有る update のみ「更新内容を見る」link 表示、Day 14 P1 Spec gap 3) */
  proposalId?: string
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
  /** 関連手順更新 Alert (本案件作成後に承認されたルール) */
  relatedRuleUpdates: RelatedRuleUpdate[]
  /** Business approval status (chip 表示、Day 11.3 #5b: 未着手 → 未送付 semantic accuracy) */
  businessApprovalStatus: '未送付' | '承認待ち' | '承認済' | '差戻し'
  /** 担当者 (入力者 mock 氏名、Inbox queue 列で表示、Day 12 追加) */
  assignee?: string
  // === F-7 lifecycle SLA + delegate (Wave 2、Implementation Plan v3.0 §PR 2 Commit 2/5) ===
  /** Lifecycle step 別 SLA + approver spec (未指定なら従来の chip-only 表示) */
  lifecycleSpecs?: CaseLifecycleStepSpec[]
  /** 代理 routing が active な時のみ (Inbox MetaChip + LifecycleStepper hover で表示) */
  delegate?: DelegateInfo
}

// === Proposal (procedure update proposal、Day 12 Page 2 ProposalReview 追加) ===
// docs/03 §4.5 + docs/02 §3 (RACI: 提案ソース = AI / R = 手順管理者 / A = 業務責任者) と整合
export type ProposalStatus = 'pending-triage' | 'forwarded' | 'approved' | 'rejected'

/** 提案の判定基準 1 行 ([仮説 / 要検証] ラベル必須、AI 日次分析 logic から派生) */
export interface ProposalDecisionCriterion {
  label: string
  value: string
  threshold: string
  met: boolean
}

/** 提案の元になった差戻し case (source_case link 用) */
export interface ProposalSourceCase {
  caseId: string
  /** case タイトル (workflow + 簡易識別) */
  title: string
  /** 差戻し category (5-category enum、data_error は除外) */
  category: Exclude<SendBackCategory, 'data_error'>
  /** 差戻し理由 (入力者コメント抜粋) */
  sendbackReason: string
}

/** 提案を支える staging knowledge snippet (citation 対象外、weight: low/medium のみ) */
export interface ProposalStagingSnippet {
  knowledgeId: string
  title: string
  weight: 'low' | 'medium'
  excerpt: string
}

/** 提案で変更される workflow 文書の 変更前 / 変更後 */
export interface ProposalDiffSection {
  /** 対象 file path (workflow.md / agent-instructions.md / approval-policy.md) */
  targetFile: string
  /** § section identifier */
  section: string
  before: string
  after: string
  // === F-2 metadata (Wave 2、MetadataStrip 5 element 対応、Implementation Plan v3.0 §PR 2 Commit 2) ===
  /** Change author (AI agent name + model version、e.g. 'AI 日次分析 v1.2') */
  changeAuthor?: string
  /** Change reason */
  changeReason?: string
  /** Affected scope */
  affectedScope?: string
  /** Reversibility */
  reversibility?: Reversibility
}

/** RACI box (提案ソース 列を追加した final patch 整合) */
export interface ProposalRaci {
  proposalSource: string
  r: string
  a: string
  c: string[]
  i: string[]
}

export interface ProposalRecord {
  id: string
  workflowId: string
  workflowName: string
  /** 提案 short title (PageHeader h1 + 一覧 row 用) */
  proposalTitle: string
  status: ProposalStatus
  statusLabel: string
  /** AI 日次分析の生成日時 */
  createdAt: string
  /** 経過時間 label */
  elapsedLabel: string
  /** 提案 summary (1 段落、AI 日次分析の判断根拠を要約) */
  summary: string
  /** 判定基準 (3-5 件、各 [仮説 / 要検証] ラベル付き threshold + value 比較) */
  decisionCriteria: ProposalDecisionCriterion[]
  /** 元 source case 一覧 (link 元、3+ 件で「同種差戻し pattern」を満たす) */
  sourceCases: ProposalSourceCase[]
  /** 元 staging knowledge snippets (citation 対象外、weight: medium 中心) */
  stagingSnippets: ProposalStagingSnippet[]
  /** 提案 差分 (workflow.md / agent-instructions.md / approval-policy.md 変更前 / 変更後) */
  proposedDiff: ProposalDiffSection[]
  raci: ProposalRaci
  /** 整理担当 (手順管理者 mock 氏名、SoD 上 承認者 と別人) */
  queueOwner: string
  /** 承認者 (業務責任者 mock 氏名、SoD 上 整理担当 と別人) */
  approver: string
}

// ── Reconcile (CaseDetail rev.3 文書アンカー、canonical-design-spec §3-4) ──────
// data 状態は 6 種。UI 表示語は別 layer (lib/reconcile-display) で resolve し、
// `normalized_match` は UI 上「一致」に集約 (内部語「正規化」を画面に出さない契約を型で担保)。
export type ReconcileState =
  | 'matched'             // 一致
  | 'normalized_match'    // 正規化一致 (data のみ、UI は「一致」)
  | 'needs_review'        // 要確認
  | 'not_extracted'       // 未取得
  | 'manually_confirmed'  // 確認済 (override 済)
  | 'escalated'           // エスカレーション

export interface SourceLocator {
  /** 申請書類ファイル名 (mock) */
  doc: string
  /** ページ (例: P.2) */
  page: string
  /** 欄名 (例: 住所欄) */
  region: string
}

export interface FieldReview {
  fieldLabel: string
  aiValue: string
  ocrRawValue?: string
  ocrNormalizedValue?: string
  masterValue?: string
  humanValue?: string
  reconcileState: ReconcileState
  /** 正規化補正の説明 (normalized_match 時、UI は控えめ注記) */
  normalizationNote?: string
  sourceLocator?: SourceLocator
  mono?: boolean
}
