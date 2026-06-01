import type { CaseStatus } from '@/data/types'

/**
 * SLA 経過時間の基準時刻 (FIXED constant、remediation W3 / §4 G7 / audit §3.2 scope-0 本実装)。
 * runtime clock (Date.now() / 引数なし new Date()) は使わない = test 決定性 + mock 再現性。
 * timezone を明示 (+09:00) して new Date(ISO) の parse を曖昧にしない (UTC 月境界ずれ回避)。
 */
export const NOW_ISO = '2026-05-30T18:00:00+09:00'

/**
 * 受付日時 (ISO) から経過 label を派生する (静的 elapsed 文字列の本算出化)。
 * store は受付 datetime を fact として持ち、表示 label は此処で都度算出する (S8: store に派生表示を載せない)。
 * バケット: 60 分未満 → 約N分 / 24 時間未満 → 約N時間 / それ以上 → N日。
 * 不正 / 未来の receivedAt は防御的に '—' (selector の白画面化を防ぐ)。
 */
export function elapsedLabelFrom(receivedAtISO: string, nowISO: string = NOW_ISO): string {
  const received = new Date(receivedAtISO).getTime()
  const now = new Date(nowISO).getTime()
  if (Number.isNaN(received) || Number.isNaN(now)) return '—'
  const diffMin = Math.floor((now - received) / 60000)
  if (diffMin < 0) return '—'
  if (diffMin < 60) return `約${diffMin}分`
  if (diffMin < 60 * 24) return `約${Math.floor(diffMin / 60)}時間`
  return `${Math.floor(diffMin / (60 * 24))}日`
}

/**
 * 案件一覧「経過」列の表示 label。終端 (reflected) は経過ではなく '処理済' を出す
 * (SLA clock は完了で停止し、受付→now の増加表示を避ける)。それ以外は受付からの経過。
 */
export function caseElapsedLabel(receivedAtISO: string, status: CaseStatus, nowISO: string = NOW_ISO): string {
  if (status === 'reflected') return '処理済'
  return elapsedLabelFrom(receivedAtISO, nowISO)
}
