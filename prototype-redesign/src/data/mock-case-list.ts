import type { CaseStatus } from './types'

/**
 * 案件一覧 (Cases) mock — screens-v2/02-cases parity / mock-fixture §3 (UC-BO-01)。
 * 計 28 件: 代表 8 件 (BASE_CASES、各 status + recommended + change、detail dict と整合)
 *   + pagination/sort/filter 実動検証用の deterministic fixture 20 件 (EXTRA_CASES、Phase 3)。
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

/** 手書きの代表 8 件 (各 status + recommended + change データを持つ、detail dict と整合)。 */
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
 * pagination / sort / filter の実動検証用 deterministic fixture (+20 行、計 28)。
 * Math.random は使わず index 由来で status/owner/flags/elapsed を生成 (再現性確保)。
 */
const STATUSES: CaseStatus[] = ['pending', 'ready', 'sent-back', 'business-approval-waiting', 'reflected']
const OWNERS = ['山田太郎', '鈴木課長', '佐藤花子']
const EXTRA_CASES: CaseListRow[] = Array.from({ length: 20 }, (_, i) => {
  const status = STATUSES[i % STATUSES.length]
  return {
    id: `CASE-2026-0${100 + i}`,
    workflow: '法人住所変更',
    status,
    elapsed: `${(i % 6) + 1}時間${((i * 7) % 60).toString().padStart(2, '0')}分`,
    owner: status === 'pending' ? '—' : OWNERS[i % OWNERS.length],
    flags: status === 'ready' ? i % 3 : 0,
  }
})

export const CASE_LIST: CaseListRow[] = [...BASE_CASES, ...EXTRA_CASES]
