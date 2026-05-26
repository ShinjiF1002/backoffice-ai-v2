// PROP-2026-031 subset for Claude Design Gate 1 context (F-2 reference)
// Demo Chapter 2 中核 proposal、F-2 で DiffPreviewBlock + MetadataStrip wrap 対象

import type { ProposalRecord } from './data-types'

export const demoProposal: ProposalRecord = {
  id: 'PROP-2026-031',
  workflowId: 'UC-BO-01',
  workflowName: '法人住所変更',
  proposalTitle: 'OCR 信頼度閾値の段階引き上げ提案 (0.85 → 0.88)',
  status: 'pending-triage',
  statusLabel: '手順管理者の整理待ち',
  createdAt: '2026-05-31 06:30:00',
  elapsedLabel: '01:42:18',
  summary:
    'OCR 信頼度 0.85-0.88 範囲で人手上書き率が高い (12 件中 9 件)。現行閾値 0.85 → 0.88 に引き上げ、0.85-0.88 範囲を人手確認に回す手順変更を提案。',
  decisionCriteria: [
    { label: '同種差戻し件数', value: '12 件', threshold: '3 件以上 [仮説 / 要検証]', met: true },
    { label: '共通 pattern 一致度', value: '0.81', threshold: '0.70 以上 [仮説 / 要検証]', met: true },
    { label: 'staging 内部矛盾', value: 'なし', threshold: '矛盾なし', met: true },
  ],
  sourceCases: [
    { caseId: 'CASE-2026-0142', title: '法人住所変更 (千代田区サンプルビル)', category: 'misunderstanding', sendbackReason: 'OCR 信頼度 0.86 で新住所の番地表記を誤抽出、入力者が手動修正' },
    { caseId: 'CASE-2026-0118', title: '法人住所変更 (品川区テストプラザ)', category: 'ui_change', sendbackReason: 'OCR 信頼度 0.87 で建物名フォント差異により誤読、入力者修正後に再 OCR' },
    { caseId: 'CASE-2026-0095', title: '法人住所変更 (中央区サンプルセンター)', category: 'misunderstanding', sendbackReason: 'OCR 信頼度 0.85 で旧字体住所を誤認識、人手再入力' },
  ],
  stagingSnippets: [],
  proposedDiff: [
    {
      targetFile: 'workflows/corporate-address-change/agent-instructions.md',
      section: '§3.2 OCR 信頼度判定',
      before: 'AI 抽出後に信頼度が 0.85 以上の場合、確認なしで自動補完を完了する [仮説 / 要検証]。',
      after: 'AI 抽出後に信頼度が 0.88 以上の場合、確認なしで自動補完を完了する [仮説 / 要検証]。0.85-0.88 の場合は人手確認に回す。',
      // F-2 で追加予定の metadata field (Claude Design 投入時参考、現 types.ts に未定義)
      // changeAuthor: 'AI 日次分析 v1.2',
      // changeReason: 'OCR 信頼度 0.85-0.88 帯で人手上書き率 75% (12 件中 9 件、3 週間集約)',
      // affectedScope: '12 cases (3 週間 historical) + 将来 UC-BO-01 全 case',
      // reversibility: 'Revertible (手順承認後も rollback 可、設定承認で本番反映前に戻せる)',
    },
    {
      targetFile: 'workflows/corporate-address-change/approval-policy.md',
      section: '§2.1 自動補完条件',
      before: '住所 field の自動補完: OCR 信頼度 ≥ 0.85 [仮説 / 要検証]',
      after: '住所 field の自動補完: OCR 信頼度 ≥ 0.88 [仮説 / 要検証] (段階引き上げ、Phase 1 で実閾値を再検証)',
    },
  ],
  raci: {
    proposalSource: 'AI (日次分析)',
    r: '手順管理者 (整理担当)',
    a: '業務責任者',
    c: ['SME (法人事務 SME)', 'AI 管理者'],
    i: ['入力者', '承認者'],
  },
  queueOwner: '高橋 美穂',
  approver: '渡辺 真理',
}

// NOTE for Claude Design (Gate 1, F-2):
// - proposedDiff は 2 件 (各々 structured { targetFile, section, before, after })
// - 現状は plaintext で文中記述 (DiffPreviewBlock sideBySide view 未実装)
// - F-2 では DiffPreviewBlock sideBySide view で左=before / 右=after column 化
// - MetadataStrip 5 element は ProposalDiffSection interface 拡張で対応予定 (PR 2 Commit 2)
//   (上記コメントアウト fields = 期待 state、実 mock data は PR 2 Commit 2 で投入)
