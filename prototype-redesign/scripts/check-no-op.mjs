#!/usr/bin/env node
/**
 * check-no-op.mjs — enabled no-op <button> detection (Day 19 verification gate 10)
 *
 * SSOT: prototype/audit/day-19-ux-clarity-integrated-plan.md v1.4 Commit 0 §Verification gate 10
 *
 * 役割: 全 prototype/src/**\/*.tsx の JSX <button> 要素を AST 走査し、
 *      pass 条件 (onClick / disabled / type="submit" / type="reset") の 4 条件いずれも
 *      欠落している enabled no-op を検出して exit 1 で失敗させる。
 *
 * 既存 `typescript: ~6.0.2` devDependency の Compiler API のみ使用 (新規 dep 追加なし)。
 *
 * Whitelist:
 *   - `<DisabledAction>` JSX wrapper は <button> tag ではないため skip (内部で <button disabled> render)
 *   - form submit context 内の type="submit" / type="reset" button は pass
 *
 * Excluded from pass conditions (Plan v1.3 strict 4 条件):
 *   - `onKeyDown` 単独: <button> は browser native で Enter/Space → click 自動発火、onClick で十分
 *   - `aria-disabled` 単独: visual のみで native disabled でない、`disabled` 併用時の補助扱い
 *
 * 使用法 (project root = prototype/ から):
 *   npm run check:no-op
 *   npm run check:all  # lint + check:no-op + build
 *
 * Exit code:
 *   0 = 全 <button> pass、enabled no-op 0 件
 *   1 = enabled no-op 検出、stderr に file:line list 出力
 */
import ts from 'typescript'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC_DIR = resolve(__dirname, '../src')
const REPO_ROOT = resolve(__dirname, '../..')

/** Recursively collect .tsx files under dir. */
function walkTsx(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) walkTsx(full, out)
    else if (full.endsWith('.tsx')) out.push(full)
  }
  return out
}

/** Check if JSX attribute list contains attribute with given name. */
function hasAttr(props, name) {
  return props.some((a) => ts.isJsxAttribute(a) && a.name.getText() === name)
}

/** Extract literal text of `type` attribute initializer, or empty string. */
function getTypeAttrValue(props) {
  const typeAttr = props.find((a) => ts.isJsxAttribute(a) && a.name.getText() === 'type')
  if (!typeAttr || !typeAttr.initializer) return ''
  return typeAttr.initializer.getText()
}

const files = walkTsx(SRC_DIR)
const noOp = []

for (const file of files) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

  function visit(node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText() === 'button'
    ) {
      const props = node.attributes.properties
      const typeVal = getTypeAttrValue(props)
      const isSubmitOrReset = typeVal.includes('submit') || typeVal.includes('reset')
      const hasOnClick = hasAttr(props, 'onClick')
      const hasDisabled = hasAttr(props, 'disabled')

      if (!hasOnClick && !hasDisabled && !isSubmitOrReset) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart())
        const rel = relative(REPO_ROOT, file)
        noOp.push(`${rel}:${line + 1}`)
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(source)
}

if (noOp.length > 0) {
  console.error(`✗ ${noOp.length} enabled no-op <button> element(s) found:`)
  for (const loc of noOp) console.error(`  ${loc}`)
  console.error('')
  console.error('Pass 条件: onClick / disabled / type="submit" / type="reset" のいずれかが必要')
  console.error('Whitelist: <DisabledAction> wrapper は OK (内部で <button disabled> render)')
  process.exit(1)
}

console.log(`✓ no enabled no-op <button> (checked ${files.length} .tsx file${files.length === 1 ? '' : 's'})`)
