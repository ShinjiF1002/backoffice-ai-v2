import type { ProposalRecord } from './types'

/**
 * Mock proposals (Procedure Update Proposal、AI 日次分析が自動生成、Manual 管理者 R / 業務責任者 A)
 *
 * SSOT:
 *  - docs/03 §4.5 ProposalReview Screen Card
 *  - docs/02 §3 手順承認 RACI (Proposal source = AI / R = Manual 管理者 / A = 業務責任者 / SoD: Queue owner ≠ Approver)
 *  - docs/04 §4 Compiled 昇格 logic (同種差戻し 3+ 件 / 共通 pattern 確認可 / staging 内部矛盾なし [仮説 / 要検証])
 *
 * Mock 規範 (prototype/CLAUDE.md):
 *  - active workflow UC-BO-01 + UC-BO-02 のみ、国際送金 0、Tier 3 規制語 0
 *  - threshold 数値はすべて `[仮説 / 要検証]` ラベル付き、real-time guarantee 表現禁止
 *  - SoD: queueOwner と approver は別人物 (Type A 既定方針)
 *
 * Day 12 Page 2 (CR R29 条件): `PROP-2026-031` を Sidebar AI 提案レビュー の seed として正式 mock 化
 */
export const mockProposals: ProposalRecord[] = [
  {
    id: 'PROP-2026-031',
    workflowId: 'UC-BO-01',
    workflowName: '法人住所変更',
    proposalTitle: 'OCR 信頼度閾値の段階引き上げ提案 (0.85 → 0.88)',
    status: 'pending-triage',
    statusLabel: '手順管理者の整理待ち',
    createdAt: '2026-05-31 06:30:00',
    elapsedLabel: '01:42:18',
    summary:
      '直近 3 週間の差戻し履歴を AI が日次分析した結果、OCR 信頼度 0.85-0.88 の範囲で人手上書き率が高い (推定 12 件中 9 件) ことが判明。現行閾値 0.85 を 0.88 に引き上げ、0.85-0.88 範囲を人手確認に回す手順変更を提案。提案本体の数値はすべて [仮説 / 要検証]、Phase 1 で実値を検証・再設定する。',
    decisionCriteria: [
      {
        label: '同種差戻し件数',
        value: '12 件',
        threshold: '3 件以上 [仮説 / 要検証]',
        met: true,
      },
      {
        label: '共通 pattern 一致度',
        value: '0.81',
        threshold: '0.70 以上 [仮説 / 要検証]',
        met: true,
      },
      {
        label: 'staging 内部矛盾',
        value: 'なし',
        threshold: '矛盾なし',
        met: true,
      },
    ],
    sourceCases: [
      {
        caseId: 'CASE-2026-0142',
        title: '法人住所変更 (千代田区サンプルビル)',
        category: 'misunderstanding',
        sendbackReason: 'OCR 信頼度 0.86 で新住所の番地表記を誤抽出、入力者が手動修正',
      },
      {
        caseId: 'CASE-2026-0118',
        title: '法人住所変更 (品川区テストプラザ)',
        category: 'ui_change',
        sendbackReason: 'OCR 信頼度 0.87 で建物名フォント差異により誤読、入力者修正後に再 OCR',
      },
      {
        caseId: 'CASE-2026-0095',
        title: '法人住所変更 (中央区サンプルセンター)',
        category: 'misunderstanding',
        sendbackReason: 'OCR 信頼度 0.85 で旧字体住所を誤認識、人手再入力',
      },
    ],
    stagingSnippets: [
      {
        knowledgeId: 'STG-CORP-005',
        title: '福岡支店の住所マスタが旧形式',
        weight: 'medium',
        excerpt: '福岡支店の住所マスタ照合で旧形式 (-を含む) が残っている場合がある。新形式 (空白区切り) への正規化が必要。',
      },
      {
        knowledgeId: 'STG-CORP-012',
        title: 'OCR 信頼度 0.85-0.88 帯の建物名誤認識',
        weight: 'medium',
        excerpt: '建物名の活字フォント差異により OCR 信頼度 0.85-0.88 帯で誤認識が発生、人手上書き率が高い傾向。',
      },
      {
        knowledgeId: 'STG-CORP-018',
        title: '旧字体住所の OCR 信頼度低下',
        weight: 'medium',
        excerpt: '旧字体 (例: 廣 / 邊 / 髙) を含む住所では OCR 信頼度が 0.85-0.88 に集中。',
      },
    ],
    proposedDiff: [
      {
        targetFile: 'workflows/corporate-address-change/agent-instructions.md',
        section: '§3.2 OCR 信頼度判定',
        before:
          'AI 抽出後に信頼度が 0.85 以上の場合、確認なしで自動補完を完了する [仮説 / 要検証]。',
        after:
          'AI 抽出後に信頼度が 0.88 以上の場合、確認なしで自動補完を完了する [仮説 / 要検証]。0.85-0.88 の場合は人手確認に回す。',
      },
      {
        targetFile: 'workflows/corporate-address-change/approval-policy.md',
        section: '§2.1 自動補完条件',
        before: '住所 field の自動補完: OCR 信頼度 ≥ 0.85 [仮説 / 要検証]',
        after:
          '住所 field の自動補完: OCR 信頼度 ≥ 0.88 [仮説 / 要検証] (段階引き上げ、Phase 1 で実閾値を再検証)',
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
  },
]

/** Get a proposal by ID (mock helper) */
export function getProposalById(id: string): ProposalRecord | undefined {
  return mockProposals.find((p) => p.id === id)
}
