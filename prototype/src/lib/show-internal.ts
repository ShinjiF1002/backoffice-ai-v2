/**
 * show-internal.ts — `?debug=1` query opt-in constant for internal SSOT metadata visibility
 *
 * SSOT: prototype/audit/day-19-ux-clarity-integrated-plan.md v1.4 Commit 2 §gate (U-2)
 *
 * default false → 本番 / demo / dev server 全 hidden、URL に `?debug=1` を付けたときのみ visible。
 * `import.meta.env.DEV` を使うと dev server 起動時 (= demo 実行時) に常時 leak するため、
 * 明示的 URL opt-in 方式を採用 (Plan v1.4 P0 #1 critical review 反映)。
 *
 * 用途:
 *  - AuditTrail / KnowledgeBrowser の expanded DetailPanel 内 snake_case schemaKey sub-caption
 *  - `DOC-*` doc reference (audit doc trace 用、user-facing では削除)
 *  - その他 internal SSOT 用語 (`body` raw schemaKey、`source_path` raw 等)
 *
 * SSR 安全: `typeof window` guard で SSR 時は false。
 */
export const SHOW_INTERNAL_METADATA: boolean =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('debug') === '1'
