# Phase 1B 起動: Hub pilot findings を元に 02-06 prompt を一括 patch (Claude Code に paste 用)

> README Step 2.6 でこの file を Claude Code 新 session に paste します。

---

## Claude Code に paste する依頼文 (以下を全選択 + copy + paste)

```
@~/code/active/backoffice-ai-v2/handoff-redesign/00-shared/hub-pilot-findings.md を読み、user が Hub pilot (Phase 1A) で観察した制約を抽出してください:

1. Claude Design UI 上の固定 mode pill (Wireframe / Mockup 等) の有無 + 名称
2. 1 paste の文字数制限に当たったかどうか + 分割方針
3. Acceptance check 5 個の visual 判定可否 + 不能 check の理由
4. handoff bundle の取得が成立したか + 生成 file 構造
5. polished mockup の design system token 適用率 + 不適用箇所
6. 1 conversation 内 wireframe → mockup 継承 ("previous wireframe in this conversation") が成立したか
7. その他、02-06 prompt に必要な軽量修正

抽出結果に基づき、以下 10 file を一括 patch してください:

- handoff-redesign/02-queue/prompt-wireframe.md
- handoff-redesign/02-queue/prompt-mockup.md
- handoff-redesign/03-case-detail/prompt-wireframe.md
- handoff-redesign/03-case-detail/prompt-mockup.md
- handoff-redesign/04-proposal-detail/prompt-wireframe.md
- handoff-redesign/04-proposal-detail/prompt-mockup.md
- handoff-redesign/05-agent-detail/prompt-wireframe.md
- handoff-redesign/05-agent-detail/prompt-mockup.md
- handoff-redesign/06-observatory/prompt-wireframe.md
- handoff-redesign/06-observatory/prompt-mockup.md

patch 方針:

A. UI mode pill 観察結果に基づき:
   - mode pill あり → 各 prompt の `Requested output style:` 1 行を「UI で `<mode 名称>` を選択してください」に置換
   - mode pill なし → 現状 `Requested output style:` keep

B. paste 文字数制限に当たった場合:
   - 各 prompt 末尾の Anti-pattern + Acceptance check を「2 nd message として送信してください」と明示分割
   - 分割境界を `---` line で明示

C. Acceptance check visual 判定不能 check があった場合:
   - 該当表現を曖昧でない明確な記述に置換 (例: "Header chip は 1 つ" → "Header 内に件数表示用 chip 以外は表示しない、注意 chip / status chip / hedge chip は別段に分離")

D. handoff bundle 取得不成立の場合:
   - 99-claude-code-handoff/phase-2-instructions.md に「bundle ではなく HTML export + 構造説明を渡す」path を追加

E. design system token 適用率が低い場合:
   - 各 prompt の "Visual constraint re-stated" section に追加 token (shadow / spacing / typography weight 等) を inline
   - design system re-paste の指示 (mockup 冒頭) を追加

F. wireframe → mockup 継承が不成立の場合:
   - 各 prompt-mockup.md 冒頭に「Wireframe を再 paste してください (前 conversation の wireframe 出力をここに paste): ___」と明示指示

verification: patch 後、handoff-redesign/ にて mechanical gates を再実行し、全 gate pass を確認してください:

cd ~/code/active/backoffice-ai-v2/handoff-redesign

# 1 paste 完結 (internal file path 参照 0)
for f in 0[1-6]-*/prompt-*.md; do
  grep -En "(\.\./|\./00-shared/|^00-shared/|0[1-6]-[a-z]+/)" "$f" \
    && { echo "VIOLATION: $f"; exit 1; } || true
done

# output style header
for f in 0[1-6]-*/prompt-wireframe.md; do
  head -1 "$f" | grep -qE "^(Requested output style: low-fi wireframe sketch|UI で .* を選択)" \
    || { echo "missing wireframe header: $f"; exit 1; }
done
for f in 0[1-6]-*/prompt-mockup.md; do
  head -1 "$f" | grep -qE "^(Requested output style: high-fidelity polished mockup|UI で .* を選択)" \
    || { echo "missing mockup header: $f"; exit 1; }
done

# Acceptance check section
for f in 0[1-6]-*/prompt-*.md; do
  grep -q "^## Acceptance check" "$f" || { echo "missing Acceptance check: $f"; exit 1; }
done

patch 完了後、user に「02-06 prompt の patch 完了、README Step 3 に進んでください」と報告してください。
```

---

## 想定される patch 例 (参考)

### 例 1: UI mode pill が "Wireframe / Mockup / Prototype" 3 種で見つかった場合

各 `prompt-wireframe.md` の 1 行目を:

```
Requested output style: low-fi wireframe sketch (mono color, basic shapes, gray scale, placeholder text 可)
(Claude Design UI に固定 mode pill があれば UI 側を優先)
```

→

```
Claude Design UI で mode "Wireframe" を選択してください (UI に固定 mode pill あり、Hub pilot で確認済)。
```

### 例 2: paste 文字数制限に 4000 文字で当たった場合

各 prompt を:

```
... (前半: layout + data) ...

---
(以下は 2 nd message として送信してください)
---

## Anti-pattern ...

## Acceptance check ...
```

### 例 3: design system token 適用率 60% で shadow / spacing が不足の場合

各 `prompt-mockup.md` の "Visual constraint re-stated" section に追加:

```
## Visual constraint re-stated (Hub pilot で観察した適用不足箇所を追加)

(既存 token + 以下を追加)
- Shadow elevation: `0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)` (Card default)
- Spacing rhythm: card padding `p-5`, section gap `gap-4`, inline gap `gap-2`
- Typography weight: title 600, body 400, mono 500 (numeric)
```

---

## 想定外の場合

Hub pilot で `hub-pilot-findings.md` が空 or 観察結果が記録されていない場合、本 patch instructions は起動しません。user に「Hub pilot を再実行し、findings を記入してから本 patch を依頼してください」と返してください。
