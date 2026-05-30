#!/usr/bin/env node
/**
 * check-design.mjs — W0 design-lint gate (canonical-design-spec §8/§9 の機械化)
 *
 * 3 gate (全 active src `src/**`、`src/legacy` と `__tests__` は除外):
 *   1. R7 contrast: 意味テキストに `text-[var(--color-fg-subtle)]` を禁止 (§9)。
 *      装飾例外 (aria-hidden / Icon / disabled / cursor-not-allowed / pointer-events-none) を
 *      同一行 ±2 行の window に持つ場合のみ許容 (multi-line JSX 対応)。
 *   2. icon-suffix: `lucide-react` import は全て Icon suffix (§5/§8)。非 suffix import を検出。
 *   3. emoji: ✓✗✔✘✅❌⚠ 等の装飾 emoji を UI から禁止 (§5/§8)。
 *
 * off-token hex 全数 / 全画面 axe は本 gate の対象外 (P2B-4 / W3、§1.0)。
 * 既存 `typescript` 以外の新規 dep なし (Node 標準 fs のみ)。
 *
 * Exit: 違反 0 → 0 / 違反あり → 1 (check:all を red 化)。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SRC = new URL('../src', import.meta.url).pathname
const EXCLUDE_DIRS = new Set(['legacy', '__tests__'])

/** src 配下の .ts/.tsx を再帰収集 (legacy / __tests__ 除外)。 */
function collect(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (!EXCLUDE_DIRS.has(name)) out.push(...collect(full))
    } else if (/\.tsx?$/.test(name)) {
      out.push(full)
    }
  }
  return out
}

const files = collect(SRC)
const violations = []
const rel = (f) => f.replace(SRC, 'src')

// 装飾例外マーカー (これらが ±2 行 window にあれば fg-subtle 許容)
const EXCEPTION = /aria-hidden|Icon|cursor-not-allowed|disabled|pointer-events-none/
const FG_SUBTLE_TEXT = /text-\[var\(--color-fg-subtle\)\]/
const EMOJI = /[✓✔✗✘✅❌⚠]/ // ✓✔✗✘✅❌⚠
const LUCIDE_IMPORT = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g

for (const file of files) {
  const content = readFileSync(file, 'utf8')
  const lines = content.split('\n')

  // 1. R7 contrast (fg-subtle on text)
  lines.forEach((line, i) => {
    if (!FG_SUBTLE_TEXT.test(line)) return
    const window = lines.slice(Math.max(0, i - 2), i + 3).join('\n')
    if (!EXCEPTION.test(window)) {
      violations.push(`${rel(file)}:${i + 1}  R7: 意味テキストに fg-subtle (装飾例外マーカー無し)。fg-tertiary を使う`)
    }
  })

  // 3. emoji
  lines.forEach((line, i) => {
    if (EMOJI.test(line)) {
      violations.push(`${rel(file)}:${i + 1}  emoji: 装飾 emoji を UI から除去 (lucide icon を使う)`)
    }
  })

  // 2. icon-suffix (lucide import は全て Icon suffix)
  let m
  while ((m = LUCIDE_IMPORT.exec(content)) !== null) {
    const names = m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.includes(' as ') ? s.split(' as ')[1].trim() : s)) // alias の最終名で判定
    for (const name of names) {
      if (!/Icon$/.test(name)) {
        violations.push(`${rel(file)}  icon-suffix: lucide '${name}' は Icon suffix 必須 (例: ${name}Icon)`)
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`\n✗ check-design: ${violations.length} 件の違反\n`)
  for (const v of violations) console.error('  ' + v)
  console.error('')
  process.exit(1)
}
console.log('✓ check-design: R7 contrast / icon-suffix / emoji — 違反 0')
