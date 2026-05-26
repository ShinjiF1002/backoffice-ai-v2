// CASE-2026-0142 subset for Claude Design Gate 1 context (F-2 reference)
// 全 mock-cases.ts は冗長なため Demo Chapter 1 中核 case のみ抽出
// SSOT: prototype/CLAUDE.md (active workflow / restricted leakage 0 / Tier 3 規制語 0)
//
// NOTE: F-2 では types.ts CaseField interface に optional metadata field を追加予定
// (changeAuthor / changeReason / affectedScope / reversibility)、本 subset の値は F-2 fix 後の期待 state

import type { CaseRecord } from './data-types'

export const demoCase: CaseRecord = {
  id: 'CASE-2026-0142',
  workflowId: 'UC-BO-01',
  workflowName: '法人住所変更',
  status: 'ready',
  statusLabel: '入力者確認待ち',
  elapsedLabel: '00:12:34',
  currentStep: '入力者確認',
  fields: [
    { label: '法人名', value: '株式会社サンプルホールディングス', confidence: 0.96, monospace: false },
    { label: '旧住所', value: '東京都千代田区丸の内 1 丁目 1 番 1 号 サンプルビル 8F', confidence: 0.92, monospace: false },
    {
      label: '新住所',
      value: '東京都千代田区丸の内 2 丁目 3 番 5 号 サンプルビル 8F',
      oldValue: '東京都千代田区丸の内 1 丁目 1 番 1 号 サンプルビル 8F',
      confidence: 0.84,
      hasDiff: true,
      monospace: false,
      // F-2 で追加予定の metadata field (Claude Design 投入時参考、現 types.ts に未定義)
      // changeAuthor: 'AI 抽出 v2.3',
      // changeReason: 'OCR 信頼度 0.84 (閾値 0.85 未達)、新住所の番地表記',
      // affectedScope: '1 customer (CASE-2026-0142 単一案件)',
      // reversibility: 'Revertible (反映前)',
    },
    { label: '支店コード', value: '042', confidence: 1.0, monospace: true },
    { label: '効力発生日', value: '2026-06-15', confidence: 1.0, monospace: true },
  ],
  pdfName: 'corp-address-change-CASE-2026-0142.pdf',
  pdfPages: 3,
  evidence: [
    { id: 'ev-1', name: '受付', timestamp: '2026-05-31 09:00:14', actor: 'system', source: 'intake.pdf-upload-v1', thumbnailLabel: 'PDF', status: 'completed' },
    { id: 'ev-2', name: 'OCR 抽出', timestamp: '2026-05-31 09:01:02', actor: 'AI', source: 'ocr-engine-v2.3', thumbnailLabel: 'IMG', confidence: 0.78, status: 'warning' },
    { id: 'ev-3', name: 'マスタ照合', timestamp: '2026-05-31 09:01:48', actor: 'AI', source: 'db.address_master', thumbnailLabel: 'DB', confidence: 0.91, status: 'completed' },
    { id: 'ev-4', name: 'AI 入力結果生成', timestamp: '2026-05-31 09:02:11', actor: 'AI', source: 'ai.address-extractor-v2.3', thumbnailLabel: 'AI', confidence: 0.92, status: 'completed' },
  ],
  alerts: [
    { id: 'al-1', severity: 'caution', message: 'OCR 信頼度が閾値 (0.85) を下回りました — 新住所の番地表記をご確認ください', sourceStep: 'OCR 抽出' },
    { id: 'al-2', severity: 'caution', message: '住所マスタ照合: 都道府県マスタに該当エントリがありません — 手動確認推奨', sourceStep: 'マスタ照合' },
  ],
  alertCount: 2,
  citations: [
    { knowledgeId: 'KN-CORP-001', title: 'OCR 信頼度閾値 0.85 — 手動 review 要求', relevance: 0.94, weight: 'high', trend: [0.82, 0.85, 0.86, 0.87, 0.86, 0.88, 0.89], sourcePath: 'workflows/corporate-address-change/knowledge/compiled/ocr-confidence-threshold.md' },
  ],
  stagingHints: [
    { knowledgeId: 'STG-CORP-005', title: '福岡支店の住所マスタが旧形式', weight: 'medium', category: 'ui_change', excerpt: '福岡支店の住所マスタ照合で旧形式 (-を含む) が残っている場合がある。', sourcePath: 'workflows/corporate-address-change/knowledge/staging/2026-05-15-fukuoka-address-format.md' },
  ],
  relatedRuleUpdates: [
    { ruleId: 'RULE-CORP-OCR-2026-05-28', ruleName: 'OCR 信頼度閾値の段階引き上げ (0.80 → 0.85)', approvedAt: '2026-05-28', proposalId: 'PROP-2026-031' },
  ],
  businessApprovalStatus: '未送付',
  assignee: '田中 美咲',
}

// NOTE for Claude Design (Gate 1, F-2):
// - 5 fields は AI 入力結果として表示中
// - "新住所" のみ hasDiff: true (AddressDiffBlock 経由 inline diff)
// - confidence 0.84 (新住所) が 0.85 threshold を下回り `閾値未達` chip 表示中
// - F-2 では 5 fields 全部を DiffPreviewBlock fieldTable view で wrap (before/after column 化)
// - MetadataStrip 5 element (Change author / reason / confidence / affectedScope / reversibility) は CaseField interface 拡張で対応予定 (PR 2 Commit 2)
