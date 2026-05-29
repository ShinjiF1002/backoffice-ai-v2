import type { FieldReview, CaseLifecycleStep } from './types'

/**
 * CaseDetail (CASE-2026-0142) mock model — P2B-2 CaseDetail pilot の data 契約
 * SSOT: handoff-redesign/00-shared/mock-fixture-spec-v2.md §4 (field) / §8 (lifecycle) / §11 (申請書類)
 * すべて synthetic。reconcileState は data enum (UI 表示は lib/reconcile-display で resolve)。
 */

export interface CaseLifecycleEvent {
  step: CaseLifecycleStep
  time: string
  actor: string
  detail: string
  done: boolean
  current?: boolean
}

/** 申請書類ビューア (左 pane) の faux PDF 1 欄 */
export interface DocumentRow {
  label: string
  value: string
  /** 該当 field とのリンク (要確認欄ハイライト用) */
  fieldLabel?: string
  highlight?: boolean
}

export interface CaseDetailModel {
  id: string
  workflowName: string
  statusLabel: string
  inputter: string
  approver: string
  fields: FieldReview[]
  document: {
    fileName: string
    page: string
    pageCount: number
    title: string
    rows: DocumentRow[]
  }
  lifecycle: CaseLifecycleEvent[]
  citations: { title: string; id: string; version: string; date: string }[]
}

export const CASE_2026_0142: CaseDetailModel = {
  id: 'CASE-2026-0142',
  workflowName: '法人住所変更',
  statusLabel: '入力者確認待ち',
  inputter: '山田太郎',
  approver: '鈴木課長',
  // mock-fixture §4: 要確認 1 / 一致(正規化含む) 4
  fields: [
    {
      fieldLabel: 'ビル名',
      aiValue: 'サンプルビル',
      ocrRawValue: 'サンプルビルディング',
      masterValue: 'サンプルビル',
      reconcileState: 'needs_review',
      sourceLocator: { doc: 'CASE-2026-0142.pdf', page: 'P.2', region: '住所欄' },
    },
    {
      fieldLabel: '法人名',
      aiValue: '株式会社サンプルHD',
      ocrRawValue: '株式会社サンプルＨＤ',
      ocrNormalizedValue: '株式会社サンプルHD',
      masterValue: '株式会社サンプルHD',
      reconcileState: 'normalized_match',
      normalizationNote: '全角英数→半角統一 (ＨＤ → HD)',
      sourceLocator: { doc: 'CASE-2026-0142.pdf', page: 'P.2', region: '法人名欄' },
    },
    {
      fieldLabel: '新住所',
      aiValue: '東京都千代田区丸の内 2 丁目 3 番 5 号',
      ocrRawValue: '千代田区丸の内２－３－５',
      ocrNormalizedValue: '東京都千代田区丸の内 2 丁目 3 番 5 号',
      reconcileState: 'normalized_match',
      normalizationNote: '丁目番地表記統一 + 都名補完',
      sourceLocator: { doc: 'CASE-2026-0142.pdf', page: 'P.2', region: '住所欄' },
    },
    {
      fieldLabel: '支店コード',
      aiValue: '042',
      ocrRawValue: '042',
      masterValue: '042',
      reconcileState: 'matched',
      mono: true,
      sourceLocator: { doc: 'CASE-2026-0142.pdf', page: 'P.2', region: '支店コード欄' },
    },
    {
      fieldLabel: '効力発生日',
      aiValue: '2026-06-15',
      ocrRawValue: '2026-06-15',
      reconcileState: 'matched',
      mono: true,
      sourceLocator: { doc: 'CASE-2026-0142.pdf', page: 'P.2', region: '効力日欄' },
    },
  ],
  // mock-fixture §11: 法人住所変更届 P.2
  document: {
    fileName: 'CASE-2026-0142.pdf',
    page: 'P.2',
    pageCount: 3,
    title: '法人住所変更届',
    rows: [
      { label: '法人名', value: '株式会社サンプルＨＤ', fieldLabel: '法人名' },
      { label: '支店コード', value: '042', fieldLabel: '支店コード' },
      { label: '新住所', value: '千代田区丸の内２－３－５ サンプルビルディング８Ｆ', fieldLabel: 'ビル名', highlight: true },
      { label: '効力発生日', value: '2026-06-15', fieldLabel: '効力発生日' },
      { label: '押印 / 署名欄', value: '(押印済)' },
    ],
  },
  // mock-fixture §8: 業務順 lifecycle (current = 入力者確認)
  lifecycle: [
    { step: '受付', time: '09:00', actor: 'システム', detail: '申請書類を受け付けました。', done: true },
    { step: 'AI処理', time: '09:02', actor: 'AI 担当 Agent', detail: '読み取り + 登録情報照合 + 値生成。', done: true },
    { step: '入力者確認', time: '進行中', actor: '山田太郎', detail: 'AI 入力と申請書類を照合して確認中。', done: false, current: true },
    { step: '承認者承認', time: '—', actor: '鈴木課長', detail: '最終承認。', done: false },
    { step: '反映', time: '—', actor: 'システム', detail: '登録情報を更新。', done: false },
  ],
  citations: [
    { title: '法人住所変更フロー', id: 'KB-FLOW-022', version: 'v3.1', date: '2026-04-12' },
    { title: '番地表記正規化ルール', id: 'KB-RULE-008', version: 'v1.4', date: '2026-03-08' },
    { title: '効力発生日設定基準', id: 'KB-RULE-014', version: 'v2.0', date: '2026-05-02' },
  ],
}
