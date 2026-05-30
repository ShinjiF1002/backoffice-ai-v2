import type { CaseStatus } from './types'

/**
 * 案件一覧 (Cases) mock — screens-v2/02-cases parity / mock-fixture §3。
 * 業務 case = 法人住所変更 (UC-BO-01) 8 件 + 口座開設書類完備 (UC-BO-02) 5 件 = 計 13 件 (CASE_LIST)。
 *   remediation B3 (gate 3=案A / gate 6=案B): 口座開設業務を正規 CASE_LIST 入りさせ (業務追加)、
 *   検証専用 fixture は CASE_LIST から分離する → seed/Hub/KPI が「業務母数 13」を正直に反映する。
 * pagination/sort/filter の実動検証 fixture は `VERIFICATION_EXTRA_CASES` に分離 (別 id 空間 CASE-VRF-、test-only 注入)。
 *   seed/CASE_DETAILS には載せない = Hub の業務母数に検証 noise を混ぜない (監査 M1/D2)。
 */
export interface CaseListRow {
  id: string
  workflow: string
  status: CaseStatus
  elapsed: string
  owner: string
  /** 要確認 項目数 (0 = 全項目一致) */
  flags: number
  recommended?: boolean
  /** 何が変わったか (drawer 用) */
  change?: { field: string; from: string; to: string }
}

/** 法人住所変更 (UC-BO-01) 代表 8 件 (各 status + recommended + change、detail dict と整合)。 */
const BASE_CASES: CaseListRow[] = [
  { id: 'CASE-2026-0142', workflow: '法人住所変更', status: 'ready', elapsed: '1時間20分', owner: '山田太郎', flags: 1, recommended: true,
    change: { field: '新住所', from: '東京都千代田区丸の内 1 丁目 1 番 1 号', to: '東京都千代田区丸の内 2 丁目 3 番 5 号' } },
  { id: 'CASE-2026-0145', workflow: '法人住所変更', status: 'ready', elapsed: '38分', owner: '山田太郎', flags: 2,
    change: { field: '新住所', from: '大阪市北区梅田 1-2', to: '大阪市北区梅田 3-4-5' } },
  { id: 'CASE-2026-0139', workflow: '法人住所変更', status: 'ready', elapsed: '2時間05分', owner: '山田太郎', flags: 0,
    change: { field: '新住所', from: '名古屋市中区栄 2-1', to: '名古屋市中区栄 4-1-1' } },
  { id: 'CASE-2026-0131', workflow: '法人住所変更', status: 'sent-back', elapsed: '4時間12分', owner: '山田太郎', flags: 0,
    change: { field: '法人名', from: '株式会社旧商号', to: '株式会社サンプル商事' } },
  { id: 'CASE-2026-0128', workflow: '法人住所変更', status: 'business-approval-waiting', elapsed: '5時間30分', owner: '鈴木課長', flags: 0,
    change: { field: '新住所', from: '福岡市博多区 1-1', to: '福岡市博多区博多駅前 2-2-2' } },
  { id: 'CASE-2026-0150', workflow: '法人住所変更', status: 'pending', elapsed: '8分', owner: '—', flags: 0 },
  { id: 'CASE-2026-0149', workflow: '法人住所変更', status: 'pending', elapsed: '14分', owner: '—', flags: 0 },
  { id: 'CASE-2026-0120', workflow: '法人住所変更', status: 'reflected', elapsed: '昨日 16:40', owner: '山田太郎', flags: 0,
    change: { field: '新住所', from: '札幌市中央区 1-2', to: '札幌市中央区大通西 3-1' } },
]

/**
 * 口座開設書類完備 (UC-BO-02) 5 件 (remediation B3、業務追加)。status 分布は HUB 契約と一致:
 *   pending 1 / ready 2 / business-approval-waiting 1 / reflected 1。
 * 0112 / 0104 / 0101 は PROP-2026-024 sourceCases ・ agent-account-opening samples の証拠アンカー先
 *   (B2: detail を口座開設書類で表示し「別明細なのに法人住所変更データ」破綻を解消)。
 */
const ACCOUNT_OPENING_CASES: CaseListRow[] = [
  { id: 'CASE-2026-0112', workflow: '口座開設書類完備', status: 'reflected', elapsed: '昨日 14:10', owner: '佐藤花子', flags: 0 },
  { id: 'CASE-2026-0101', workflow: '口座開設書類完備', status: 'ready', elapsed: '1時間02分', owner: '佐藤花子', flags: 0 },
  { id: 'CASE-2026-0104', workflow: '口座開設書類完備', status: 'ready', elapsed: '46分', owner: '高橋', flags: 1, recommended: true,
    change: { field: '有効期限', from: '(申請書類より読み取り)', to: '2026-06-12' } },
  { id: 'CASE-2026-0103', workflow: '口座開設書類完備', status: 'pending', elapsed: '11分', owner: '—', flags: 0 },
  { id: 'CASE-2026-0110', workflow: '口座開設書類完備', status: 'business-approval-waiting', elapsed: '3時間20分', owner: '高橋', flags: 0 },
]

/**
 * pagination / sort / filter の実動検証用 deterministic fixture (20 行、CASE-VRF- id 空間)。
 * remediation B3 (gate 3=案A): 業務 case (CASE_LIST) とは別 export に分離し seed/Hub/KPI 母数に混ぜない。
 *   検証は test-only 注入で確保する (DataTable pagination test)。Math.random は使わず index 由来で再現性確保。
 */
const STATUSES = ['pending', 'ready', 'sent-back', 'business-approval-waiting', 'reflected'] as const satisfies readonly CaseStatus[]
const OWNERS = ['山田太郎', '鈴木課長', '佐藤花子'] as const
export const VERIFICATION_EXTRA_CASES: CaseListRow[] = Array.from({ length: 20 }, (_, i) => {
  // i % length は常に範囲内 → ?? fallback は NUIA narrow 用の unreachable (STATUSES[0]/OWNERS[0] は tuple ゆえ non-undefined)
  const status: CaseStatus = STATUSES[i % STATUSES.length] ?? STATUSES[0]
  return {
    id: `CASE-VRF-${String(i + 1).padStart(4, '0')}`,
    workflow: '法人住所変更',
    status,
    elapsed: `${(i % 6) + 1}時間${((i * 7) % 60).toString().padStart(2, '0')}分`,
    owner: status === 'pending' ? '—' : (OWNERS[i % OWNERS.length] ?? OWNERS[0]),
    flags: status === 'ready' ? i % 3 : 0,
  }
})

/** 業務 case (法人住所変更 8 + 口座開設書類完備 5 = 13)。seed / CASE_DETAILS / Cases 一覧の権威 source。 */
export const CASE_LIST: CaseListRow[] = [...BASE_CASES, ...ACCOUNT_OPENING_CASES]
