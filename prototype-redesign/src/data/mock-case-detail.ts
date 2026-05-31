import type { FieldReview, CaseLifecycleStep, CaseStatus } from './types'
import { CASE_LIST } from './mock-case-list'
import type { CaseListRow } from './mock-case-list'
import { caseStatusLabel } from '@/lib/status-tones'

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
  /** 案件 status (remediation status-badge-resolver / 2b)。header badge・stepper の tone/label を resolver で導出する source。 */
  status: CaseStatus
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
  status: 'ready', // 確認待ち (入力者確認段階)。badge/stepper は CaseDetail で liveStatus 経由 resolve。
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
      // P1-8: 法人住所変更の現行登録値 (変更前)。before/after で「現在の登録値 → 確定値」を表示。
      previousValue: '東京都千代田区丸の内 1 丁目 1 番 1 号',
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

// ──────────────────────────────────────────────────────────────────────────
// Phase 4a — id-keyed detail dict (X-10 解消)
// CASE_LIST の全行に対し status / flags / change と整合した detail を量産する軽量 factory。
// 手書き canonical (CASE_2026_0142) は温存し、dict 登録時に factory 出力を上書きする。
// rich data (fields/document/lifecycle/citations) は store ではなく本 dict 側に置く (S8 / 4b 境界)。
// ──────────────────────────────────────────────────────────────────────────

/** owner と別人の承認者を返す (SoD 表示の整合: 入力者 ≠ 承認者)。 */
function approverFor(inputter: string): string {
  return inputter === '鈴木課長' ? '田中部長' : '鈴木課長'
}

/** 既定 5 項目 (全 matched)。change がある field は申請後の新値を反映。 */
function baseFields(change?: CaseListRow['change']): FieldReview[] {
  const newAddr = change?.field === '新住所' ? change.to : '東京都千代田区丸の内 2 丁目 3 番 5 号'
  const corpName = change?.field === '法人名' ? change.to : '株式会社サンプル商事'
  // P1-8: 変更系 field は現行登録値 (change.from) を previousValue に保持し before/after 表示。変更対象でない field は省略。
  const prevAddr = change?.field === '新住所' ? change.from : undefined
  const prevCorp = change?.field === '法人名' ? change.from : undefined
  return [
    { fieldLabel: '法人名', aiValue: corpName, ocrRawValue: corpName, masterValue: corpName, previousValue: prevCorp, reconcileState: 'matched', sourceLocator: { doc: '', page: 'P.2', region: '法人名欄' } },
    { fieldLabel: '新住所', aiValue: newAddr, ocrRawValue: newAddr, previousValue: prevAddr, reconcileState: 'matched', sourceLocator: { doc: '', page: 'P.2', region: '住所欄' } },
    { fieldLabel: 'ビル名', aiValue: 'サンプルビル', ocrRawValue: 'サンプルビル', masterValue: 'サンプルビル', reconcileState: 'matched', sourceLocator: { doc: '', page: 'P.2', region: '住所欄' } },
    { fieldLabel: '支店コード', aiValue: '042', ocrRawValue: '042', masterValue: '042', reconcileState: 'matched', mono: true, sourceLocator: { doc: '', page: 'P.2', region: '支店コード欄' } },
    { fieldLabel: '効力発生日', aiValue: '2026-06-15', ocrRawValue: '2026-06-15', reconcileState: 'matched', mono: true, sourceLocator: { doc: '', page: 'P.2', region: '効力日欄' } },
  ]
}

/**
 * 口座開設書類完備 (UC-BO-02) 用 5 項目 (全 matched)。法人住所変更とは別 field 集合 = 証拠アンカー整合 (B2)。
 * 汎用化せず口座開設専用に固定 (mock-fixture: 本人確認書類 / 氏名 / 生年月日 / 有効期限 / 住所)。
 * change がある field (例 有効期限) は申請書類の読み取り値で上書き。
 */
function accountOpeningFields(change?: CaseListRow['change']): FieldReview[] {
  const fields: FieldReview[] = [
    { fieldLabel: '本人確認書類', aiValue: '運転免許証', ocrRawValue: '運転免許証', masterValue: '運転免許証', reconcileState: 'matched', sourceLocator: { doc: '', page: 'P.2', region: '本人確認書類欄' } },
    { fieldLabel: '氏名', aiValue: '佐藤花子', ocrRawValue: '佐藤花子', masterValue: '佐藤花子', reconcileState: 'matched', sourceLocator: { doc: '', page: 'P.2', region: '氏名欄' } },
    { fieldLabel: '生年月日', aiValue: '1988-04-12', ocrRawValue: '1988-04-12', reconcileState: 'matched', mono: true, sourceLocator: { doc: '', page: 'P.2', region: '生年月日欄' } },
    { fieldLabel: '有効期限', aiValue: '2029-04-11', ocrRawValue: '2029-04-11', reconcileState: 'matched', mono: true, sourceLocator: { doc: '', page: 'P.2', region: '有効期限欄' } },
    { fieldLabel: '住所', aiValue: '東京都新宿区西新宿 2-8-1', ocrRawValue: '東京都新宿区西新宿 2-8-1', reconcileState: 'matched', sourceLocator: { doc: '', page: 'P.2', region: '住所欄' } },
  ]
  if (change) {
    const f = fields.find((x) => x.fieldLabel === change.field)
    if (f) {
      f.aiValue = change.to
      f.ocrRawValue = change.to
      if (f.masterValue !== undefined) f.masterValue = change.to
    }
  }
  return fields
}

/** workflow に応じた field 集合を返す (口座開設は法人住所変更と別 detail = B2 証拠アンカー整合)。 */
function fieldsForWorkflow(workflow: string, change?: CaseListRow['change']): FieldReview[] {
  return workflow === '口座開設書類完備' ? accountOpeningFields(change) : baseFields(change)
}

/** status → 現在の lifecycle step index (reflected は全 done = current なし)。 */
const CASE_CURRENT_STEP: Record<CaseStatus, number> = {
  pending: 1, // AI処理
  ready: 2, // 入力者確認
  'sent-back': 1, // AI処理 (差戻し後の再処理)
  'business-approval-waiting': 3, // 承認者承認
  reflected: 5, // 全 done (current なし)
}

/** status × 担当者 → lifecycle 段 (remediation status-badge-resolver: CaseDetail が liveStatus で再計算するため export)。 */
export function buildLifecycle(status: CaseStatus, inputter: string, approver: string): CaseLifecycleEvent[] {
  const steps: { step: CaseLifecycleStep; actor: string; detail: string }[] = [
    { step: '受付', actor: 'システム', detail: '申請書類を受け付けました。' },
    { step: 'AI処理', actor: 'AI 担当 Agent', detail: '読み取り + 登録情報照合 + 値生成。' },
    { step: '入力者確認', actor: inputter, detail: 'AI 入力と申請書類を照合して確認。' },
    { step: '承認者承認', actor: approver, detail: '最終承認。' },
    { step: '反映', actor: 'システム', detail: '登録情報を更新。' },
  ]
  const current = CASE_CURRENT_STEP[status]
  return steps.map((s, i): CaseLifecycleEvent => ({
    ...s,
    time: i < current ? '完了' : i === current ? '進行中' : '—',
    done: i < current,
    current: i === current,
  }))
}

function buildDocRows(fields: FieldReview[]): DocumentRow[] {
  const rows: DocumentRow[] = fields.map((f) => ({
    label: f.fieldLabel,
    value: f.ocrRawValue ?? f.aiValue,
    fieldLabel: f.fieldLabel,
    highlight: f.reconcileState === 'needs_review',
  }))
  rows.push({ label: '押印 / 署名欄', value: '(押印済)' })
  return rows
}

/** list row 1 行 → CaseDetailModel。status/flags/change を整合させて量産。 */
function buildCaseDetail(row: CaseListRow): CaseDetailModel {
  const fileName = `${row.id}.pdf`
  const inputter = row.owner === '—' ? '未割当' : row.owner
  const approver = approverFor(inputter)

  const change = row.change
  const isAccountOpening = row.workflow === '口座開設書類完備'
  let fields = fieldsForWorkflow(row.workflow, change)
  // change.field を先頭へ (要確認の先頭割当 + 申請書類強調の先頭化、gate 3)
  if (change) {
    const idx = fields.findIndex((f) => f.fieldLabel === change.field)
    if (idx > 0) {
      const [moved] = fields.splice(idx, 1)
      if (moved) fields.unshift(moved)
    }
  }
  // status × flags → reconcileState
  if (row.status === 'pending') {
    // AI 未処理 → 未取得 (要確認数 = 申請書類は表示するが値は未抽出)
    fields = fields.map((f): FieldReview => ({ ...f, reconcileState: 'not_extracted', aiValue: '—' }))
  } else if (row.status === 'ready' && row.flags > 0) {
    // 先頭 flags 件を要確認に (change.field を先頭化済 → reviewFields[0] = change.field)
    fields = fields.map((f, i): FieldReview => (i < row.flags ? { ...f, reconcileState: 'needs_review' } : f))
  } else if (row.status === 'business-approval-waiting' || row.status === 'reflected') {
    // 入力者確認を通過済 → 確認済
    fields = fields.map((f): FieldReview => ({ ...f, reconcileState: 'manually_confirmed' }))
  }
  // sent-back / ready(flags=0) は matched のまま
  // 申請書類名を sourceLocator に注入
  fields = fields.map((f): FieldReview => ({
    ...f,
    sourceLocator: f.sourceLocator ? { ...f.sourceLocator, doc: fileName } : f.sourceLocator,
  }))

  return {
    id: row.id,
    workflowName: row.workflow,
    status: row.status,
    statusLabel: caseStatusLabel(row.status),
    inputter,
    approver,
    fields,
    document: {
      fileName,
      page: 'P.2',
      pageCount: 3,
      title: isAccountOpening ? '口座開設申込書' : `${row.workflow}届`,
      rows: buildDocRows(fields),
    },
    lifecycle: buildLifecycle(row.status, inputter, approver),
    citations: CASE_2026_0142.citations,
  }
}

/** id-keyed dict。全 CASE_LIST id を網羅し、canonical 0142 は手書き版で上書き (温存)。 */
export const CASE_DETAILS: Record<string, CaseDetailModel> = Object.fromEntries(
  CASE_LIST.map((row): [string, CaseDetailModel] => [row.id, buildCaseDetail(row)]),
)
CASE_DETAILS['CASE-2026-0142'] = CASE_2026_0142

// 提案の根拠 (PROP-2026-031 sourceCases) として参照される過去案件 = 参照専用 historical detail。
// CASE_LIST には載せない (store/list 非対象 = seed されない)。CASE_DETAILS にのみ登録し
// 「元の案件を開く」リンクの NotFound を防ぐ (CR P1)。store entity が無いため detail は参照専用で描画される。
const HISTORICAL_CASE_ROWS: CaseListRow[] = [
  // PROP-2026-031 sourceCases (住所読み取り基準) — ビル名 / 新住所
  { id: 'CASE-2026-0098', workflow: '法人住所変更', status: 'reflected', receivedAt: '2026-05-22T09:00:00+09:00', owner: '山田太郎', flags: 0, change: { field: 'ビル名', from: 'サンプルビル', to: 'サンプルビルディング' } },
  { id: 'CASE-2026-0087', workflow: '法人住所変更', status: 'reflected', receivedAt: '2026-05-18T09:00:00+09:00', owner: '山田太郎', flags: 0, change: { field: '新住所', from: '東京都千代田区丸の内 2 丁目 3', to: '東京都千代田区丸の内 2 丁目 3 番 5 号' } },
  { id: 'CASE-2026-0079', workflow: '法人住所変更', status: 'reflected', receivedAt: '2026-05-14T09:00:00+09:00', owner: '山田太郎', flags: 0, change: { field: 'ビル名', from: 'サンプルビル', to: 'サンプルビル' } },
  // PROP-2026-028 sourceCases (法人名の表記ゆれ補正) — 法人名 (B2: 0118/0106 を法人名 historical に実体化、id 空間衝突回避)
  { id: 'CASE-2026-0118', workflow: '法人住所変更', status: 'reflected', receivedAt: '2026-05-15T09:00:00+09:00', owner: '山田太郎', flags: 0, change: { field: '法人名', from: '株式会社髙橋商店', to: '株式会社高橋商店' } },
  { id: 'CASE-2026-0106', workflow: '法人住所変更', status: 'reflected', receivedAt: '2026-05-11T09:00:00+09:00', owner: '山田太郎', flags: 0, change: { field: '法人名', from: 'サンプル株式会社', to: '株式会社サンプル' } },
]
for (const row of HISTORICAL_CASE_ROWS) {
  CASE_DETAILS[row.id] = buildCaseDetail(row)
}

/** workflow の field label 群 (手動起票 form の入力項目、W3 C4)。 */
export function fieldLabelsForWorkflow(workflow: string): string[] {
  return fieldsForWorkflow(workflow).map((f) => f.fieldLabel)
}

/**
 * 手動起票 (W3 C4) の store-only draft を CaseDetailModel に組む (CASE_DETAILS 不在の draft が一覧から開ける)。
 * AI 抽出が無いので全項目を人手入力値 (overrides) で確認済表示し、左 pane は入力値の faux 申込書とする。
 */
export function buildManualCaseDetail(
  id: string,
  workflowName: string,
  assignee: string | undefined,
  overrides: Record<string, string>,
): CaseDetailModel {
  const inputter = assignee && assignee !== '—' ? assignee : '未割当'
  const approver = approverFor(inputter)
  const fileName = `${id}.pdf`
  const isAccountOpening = workflowName === '口座開設書類完備'
  const fields = fieldsForWorkflow(workflowName).map((f): FieldReview => {
    const ov = overrides[f.fieldLabel]
    const base: FieldReview = ov !== undefined ? { ...f, aiValue: ov, ocrRawValue: ov, humanValue: ov } : { ...f }
    return {
      ...base,
      reconcileState: 'manually_confirmed',
      sourceLocator: base.sourceLocator ? { ...base.sourceLocator, doc: fileName } : base.sourceLocator,
    }
  })
  return {
    id,
    workflowName,
    status: 'ready',
    statusLabel: caseStatusLabel('ready'),
    inputter,
    approver,
    fields,
    document: {
      fileName,
      page: 'P.1',
      pageCount: 1,
      title: isAccountOpening ? '口座開設申込書（手動起票）' : `${workflowName}届（手動起票）`,
      rows: buildDocRows(fields),
    },
    lifecycle: buildLifecycle('ready', inputter, approver),
    citations: [],
  }
}
