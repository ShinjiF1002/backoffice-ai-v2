import type { Weight, SendBackCategory } from './types'

/**
 * Mock knowledge snippets (staging + compiled)
 * SSOT: docs/_SSOT.md §1.4 (8 field schema) + prototype/CLAUDE.md
 *
 * weight semantics:
 *  - low: staging (未承認、AI auto-draft 直後)
 *  - medium: reviewed staging (人間が読んだが compiled 承認前)
 *  - high: compiled approved (手順承認済み、citation 候補)
 *
 * data_error は staging から除外 (別 routing、docs/04 §4.5)。
 */

export interface KnowledgeSnippet {
  id: string
  date: string
  workflowId: 'UC-BO-01' | 'UC-BO-02'
  workflowSlug: string
  agentId: string
  agentVersion: string
  sourceCase: string
  category: SendBackCategory
  weight: Weight
  title: string
  body: string
  sourcePath: string
}

export const mockKnowledge: KnowledgeSnippet[] = [
  // === Compiled approved (weight: high) — citation 候補 ===
  {
    id: 'KN-CORP-001',
    date: '2026-04-18',
    workflowId: 'UC-BO-01',
    workflowSlug: 'corporate-address-change',
    agentId: 'agent-corporate-address-change',
    agentVersion: 'v0.1',
    sourceCase: 'CASE-2026-031',
    category: 'judgment_gap',
    weight: 'high',
    title: 'OCR 信頼度閾値 0.85 — 手動 review 要求',
    body: 'OCR 信頼度が 0.85 を下回る case は AI 自動化対象外とし、入力者の手動 review を要求する。閾値以上の case は通常フロー。',
    sourcePath: 'workflows/corporate-address-change/knowledge/compiled/ocr-confidence-threshold.md',
  },
  {
    id: 'KN-CORP-002',
    date: '2026-04-22',
    workflowId: 'UC-BO-01',
    workflowSlug: 'corporate-address-change',
    agentId: 'agent-corporate-address-change',
    agentVersion: 'v0.1',
    sourceCase: 'CASE-2026-052',
    category: 'edge_case',
    weight: 'high',
    title: '多店舗法人の住所変更 — 全店舗一括処理',
    body: '本店住所変更に伴い全支店も同住所に揃える法人の case では、業務システム上で全店舗一括更新の API を使用する。',
    sourcePath: 'workflows/corporate-address-change/knowledge/compiled/multi-branch-address.md',
  },
  {
    id: 'KN-CORP-003',
    date: '2026-05-02',
    workflowId: 'UC-BO-01',
    workflowSlug: 'corporate-address-change',
    agentId: 'agent-corporate-address-change',
    agentVersion: 'v0.1',
    sourceCase: 'CASE-2026-078',
    category: 'misunderstanding',
    weight: 'high',
    title: '法人格変更を伴う住所変更 — 別 workflow 移行',
    body: '住所変更と同時に法人格 (合同会社 → 株式会社等) も変更する case は本 workflow 対象外とし、法人格変更 workflow に移行する。',
    sourcePath: 'workflows/corporate-address-change/knowledge/compiled/corporate-form-change.md',
  },

  // === Staging — citation 対象外 (未承認ヒントとして AI runtime visible だが citation 不可) ===
  {
    id: 'STG-CORP-005',
    date: '2026-05-15',
    workflowId: 'UC-BO-01',
    workflowSlug: 'corporate-address-change',
    agentId: 'agent-corporate-address-change',
    agentVersion: 'v0.1',
    sourceCase: 'CASE-2026-128',
    category: 'ui_change',
    weight: 'medium',
    title: '福岡支店の住所マスタが旧形式',
    body: '福岡支店の住所マスタ照合で旧形式 (-を含む) が残っている場合がある。新形式 (空白区切り) への正規化が必要。',
    sourcePath: 'workflows/corporate-address-change/knowledge/staging/2026-05-15-fukuoka-address-format.md',
  },
  {
    id: 'STG-CORP-006',
    date: '2026-05-18',
    workflowId: 'UC-BO-01',
    workflowSlug: 'corporate-address-change',
    agentId: 'agent-corporate-address-change',
    agentVersion: 'v0.1',
    sourceCase: 'CASE-2026-135',
    category: 'edge_case',
    weight: 'low',
    title: '国外住所の郵便番号フォーマット',
    body: '国外法人住所では郵便番号が日本形式でないため、郵便番号 field は空欄 OK の扱いを検討。',
    sourcePath: 'workflows/corporate-address-change/knowledge/staging/2026-05-18-foreign-postal-code.md',
  },

  // === UC-BO-02 (口座開設書類完備チェック) — Day 12 Page 8 拡張 (workflow filter demo 用) ===
  {
    id: 'KN-ACC-001',
    date: '2026-04-25',
    workflowId: 'UC-BO-02',
    workflowSlug: 'account-opening',
    agentId: 'agent-account-opening',
    agentVersion: 'v0.1',
    sourceCase: 'CASE-2026-061',
    category: 'judgment_gap',
    weight: 'high',
    title: '印鑑照合 信頼度閾値 0.90 — 手動 review 要求',
    body: '印鑑照合の信頼度が 0.90 を下回る case は AI 自動化対象外とし、入力者の手動 review を要求する。閾値以上の case は通常フロー。',
    sourcePath: 'workflows/account-opening/knowledge/compiled/seal-confidence-threshold.md',
  },
  {
    id: 'KN-ACC-002',
    date: '2026-05-08',
    workflowId: 'UC-BO-02',
    workflowSlug: 'account-opening',
    agentId: 'agent-account-opening',
    agentVersion: 'v0.1',
    sourceCase: 'CASE-2026-094',
    category: 'edge_case',
    weight: 'high',
    title: '法人口座 + 個人口座 同時開設 — 別 workflow へ分離',
    body: '法人口座と代表者個人口座を同時に開設する case は本 workflow 対象外とし、書類群を法人 / 個人で分離して別 workflow に移行する。',
    sourcePath: 'workflows/account-opening/knowledge/compiled/joint-corporate-personal.md',
  },
  {
    id: 'STG-ACC-003',
    date: '2026-05-20',
    workflowId: 'UC-BO-02',
    workflowSlug: 'account-opening',
    agentId: 'agent-account-opening',
    agentVersion: 'v0.1',
    sourceCase: 'CASE-2026-141',
    category: 'ui_change',
    weight: 'medium',
    title: '新フォーム (2026-05 改訂) の印鑑欄レイアウト',
    body: '2026-05 改訂の口座開設新フォームでは印鑑欄が右下から左下に移動。OCR の照合座標 update が必要。レビュー済み、手順承認待ち。',
    sourcePath: 'workflows/account-opening/knowledge/staging/2026-05-20-new-form-layout.md',
  },
]

export function getCitationsForCase(caseId: string): KnowledgeSnippet[] {
  // mock: corporate-address-change の case は compiled approved 3 件
  if (caseId === 'CASE-2026-0142') {
    return mockKnowledge.filter((k) => k.weight === 'high' && k.workflowId === 'UC-BO-01')
  }
  return []
}

export function getStagingHintsForCase(caseId: string): KnowledgeSnippet[] {
  if (caseId === 'CASE-2026-0142') {
    return mockKnowledge.filter((k) => k.weight !== 'high' && k.workflowId === 'UC-BO-01' && k.category !== 'data_error')
  }
  return []
}
