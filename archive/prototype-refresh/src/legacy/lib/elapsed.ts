/**
 * elapsed.ts — `HH:MM:SS` 形式 elapsed label を秒数に parse する utility
 *
 * SSOT: prototype/audit/day-19-ux-clarity-integrated-plan.md v1.4 Commit 3c
 *
 * 用途: NextActionStrip (Dashboard / Inbox) で「経過最大の alert case」を sort する operational priority logic
 *
 * 例: "03:45:51" → 3*3600 + 45*60 + 51 = 13551
 */
export function parseElapsed(label: string): number {
  const parts = label.split(':').map((p) => parseInt(p, 10))
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) return 0
  const [h, m, s] = parts
  return h * 3600 + m * 60 + s
}
