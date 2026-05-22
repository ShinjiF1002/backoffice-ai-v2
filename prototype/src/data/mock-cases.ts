import type { CaseRecord } from './types'

/**
 * Mock cases
 * SSOT: prototype/CLAUDE.md (active workflow only、restricted leakage 0、Tier 3 規制語 0)
 *
 * Active workflows:
 *  - UC-BO-01 法人住所変更 (corporate-address-change)
 *  - UC-BO-02 口座開設書類完備チェック (account-opening-completeness)
 *
 * 国際送金 (restricted) は UI / mock data に含めない (docs/00 §2.1)。
 */

export const mockCases: CaseRecord[] = [
  {
    id: 'CASE-2026-0142',
    workflowId: 'UC-BO-01',
    workflowName: '法人住所変更',
    status: 'ready',
    statusLabel: '入力者確認待ち',
    elapsedLabel: '00:12:34',
    currentStep: '入力者確認',
    fields: [
      {
        label: '法人名',
        value: '株式会社サンプルホールディングス',
        confidence: 0.96,
        monospace: false,
      },
      {
        label: '旧住所',
        value: '東京都千代田区丸の内 1 丁目 1 番 1 号 サンプルビル 8F',
        confidence: 0.92,
        monospace: false,
      },
      {
        label: '新住所',
        value: '東京都千代田区丸の内 2 丁目 3 番 5 号 サンプルビル 8F',
        oldValue: '東京都千代田区丸の内 1 丁目 1 番 1 号 サンプルビル 8F',
        confidence: 0.84,
        hasDiff: true,
        monospace: false,
      },
      {
        label: '支店コード',
        value: '042',
        confidence: 1.0,
        monospace: true,
      },
      {
        label: '効力発生日',
        value: '2026-06-15',
        confidence: 1.0,
        monospace: true,
      },
    ],
    pdfName: 'corp-address-change-CASE-2026-0142.pdf',
    pdfPages: 3,
    evidence: [
      {
        id: 'ev-1',
        name: '受付',
        timestamp: '2026-05-31 09:00:14',
        actor: 'system',
        source: 'intake.pdf-upload-v1',
        thumbnailLabel: 'PDF',
        status: 'completed',
      },
      {
        id: 'ev-2',
        name: 'OCR 抽出',
        timestamp: '2026-05-31 09:01:02',
        actor: 'AI',
        source: 'ocr-engine-v2.3',
        thumbnailLabel: 'IMG',
        confidence: 0.78,
        status: 'warning',
      },
      {
        id: 'ev-3',
        name: 'マスタ照合',
        timestamp: '2026-05-31 09:01:48',
        actor: 'AI',
        source: 'db.address_master',
        thumbnailLabel: 'DB',
        confidence: 0.91,
        status: 'completed',
      },
      {
        id: 'ev-4',
        name: 'AI 入力結果生成',
        timestamp: '2026-05-31 09:02:11',
        actor: 'AI',
        source: 'ai.address-extractor-v2.3',
        thumbnailLabel: 'AI',
        confidence: 0.92,
        status: 'completed',
      },
    ],
    alerts: [
      {
        id: 'al-1',
        severity: 'amber',
        message: 'OCR 信頼度が閾値 (0.85) を下回りました — 新住所の番地表記をご確認ください',
        sourceStep: 'OCR 抽出',
      },
      {
        id: 'al-2',
        severity: 'amber',
        message: '住所マスタ照合: 都道府県マスタに該当エントリがありません — 手動確認推奨',
        sourceStep: 'マスタ照合',
      },
    ],
    alertCount: 2,
    citations: [
      {
        knowledgeId: 'KN-CORP-001',
        title: 'OCR 信頼度閾値 0.85 — 手動 review 要求',
        relevance: 0.94,
        weight: 'high',
        trend: [0.82, 0.85, 0.86, 0.87, 0.86, 0.88, 0.89],
        sourcePath: 'workflows/corporate-address-change/knowledge/compiled/ocr-confidence-threshold.md',
      },
      {
        knowledgeId: 'KN-CORP-002',
        title: '多店舗法人の住所変更 — 全店舗一括処理',
        relevance: 0.78,
        weight: 'high',
        trend: [0.71, 0.73, 0.74, 0.76, 0.77, 0.78, 0.78],
        sourcePath: 'workflows/corporate-address-change/knowledge/compiled/multi-branch-address.md',
      },
      {
        knowledgeId: 'KN-CORP-003',
        title: '法人格変更を伴う住所変更 — 別 workflow 移行',
        relevance: 0.62,
        weight: 'high',
        trend: [0.58, 0.59, 0.60, 0.61, 0.62, 0.63, 0.62],
        sourcePath: 'workflows/corporate-address-change/knowledge/compiled/corporate-form-change.md',
      },
    ],
    stagingHints: [
      {
        knowledgeId: 'STG-CORP-005',
        title: '福岡支店の住所マスタが旧形式',
        weight: 'medium',
        category: 'ui_change',
        excerpt: '福岡支店の住所マスタ照合で旧形式 (-を含む) が残っている場合がある。新形式 (空白区切り) への正規化が必要。',
        sourcePath: 'workflows/corporate-address-change/knowledge/staging/2026-05-15-fukuoka-address-format.md',
      },
      {
        knowledgeId: 'STG-CORP-006',
        title: '国外住所の郵便番号フォーマット',
        weight: 'low',
        category: 'edge_case',
        excerpt: '国外法人住所では郵便番号が日本形式でないため、郵便番号 field は空欄 OK の扱いを検討。',
        sourcePath: 'workflows/corporate-address-change/knowledge/staging/2026-05-18-foreign-postal-code.md',
      },
    ],
    relatedRuleUpdates: [
      {
        ruleId: 'RULE-CORP-OCR-2026-05-28',
        ruleName: 'OCR 信頼度閾値の段階引き上げ (0.80 → 0.85)',
        approvedAt: '2026-05-28',
      },
    ],
    businessApprovalStatus: '未送付',
  },
  {
    id: 'CASE-2026-0143',
    workflowId: 'UC-BO-02',
    workflowName: '口座開設書類完備',
    status: 'ready',
    statusLabel: '入力者確認待ち',
    elapsedLabel: '00:08:21',
    currentStep: '入力者確認',
    fields: [
      { label: '法人名', value: '株式会社サンプル商事', confidence: 0.97 },
      { label: '代表者', value: '田中 太郎', confidence: 0.95 },
      { label: '印鑑届出', value: '受領済', confidence: 0.82 },
    ],
    pdfName: 'account-opening-CASE-2026-0143.pdf',
    pdfPages: 5,
    evidence: [],
    alerts: [
      {
        id: 'al-3',
        severity: 'amber',
        message: '印鑑照合 信頼度 0.78 — 手動確認推奨',
      },
    ],
    alertCount: 1,
    citations: [],
    stagingHints: [],
    relatedRuleUpdates: [],
    businessApprovalStatus: '未送付',
  },
  {
    id: 'CASE-2026-0144',
    workflowId: 'UC-BO-01',
    workflowName: '法人住所変更',
    status: 'pending',
    statusLabel: 'AI 処理中',
    elapsedLabel: '00:01:12',
    currentStep: 'AI処理',
    fields: [],
    pdfName: 'corp-address-change-CASE-2026-0144.pdf',
    pdfPages: 2,
    evidence: [],
    alerts: [],
    alertCount: 0,
    citations: [],
    stagingHints: [],
    relatedRuleUpdates: [],
    businessApprovalStatus: '未送付',
  },
]

/** Get a single case by ID (mock helper) */
export function getCaseById(id: string): CaseRecord | undefined {
  return mockCases.find((c) => c.id === id)
}
