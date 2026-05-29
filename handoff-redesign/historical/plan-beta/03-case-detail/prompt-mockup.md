Requested output style: high-fidelity polished mockup (full color, real data render, design system applied)
(**新たな High Fidelity session を作成してから本 prompt を paste**してください — Claude Design UI に固定 mode pill あり、Hub pilot で確認済)
(design system は Project に登録済み (Step 1 で恒久 register)。**同 Project 内 Wireframe session で生成した同 page の wireframe を layout baseline として参照**してください — Claude Design は Project 共有 context で wireframe を継承します、再 attach 不要)

# Page: CaseDetail (案件レビュー + 差戻しコメント) — polished mockup 化

## Polish 指示

1. previous wireframe の 2-col layout + sticky Lifecycle Stepper + PrimaryAnchor + Section A/B + aux 4 panel はそのまま保持
2. design system full 適用 (token / typography / radius / shadow)
3. Lifecycle Stepper (sticky、Header 直下):
   - 5 step 横並び (受付 → AI 処理 → 入力者確認 → 承認者承認 → 反映)
   - current step (入力者確認): indigo dot (8px) + font-semibold + indigo border-bottom 2px
   - completed step (受付 / AI 処理): emerald check icon + 通常 weight
   - upcoming step: slate-400 dot + 通常 weight
   - 各 step 間に slate-200 1px hairline 横線
4. Diff block (旧住所 → 新住所):
   - 旧住所: text-error-soft-fg #B91C1C + line-through + bg diff-del #FEE2E2
   - 新住所: text-success-soft-fg #047857 + bg diff-add #D1FAE5
   - 信頼度 0.84 mono tabular、右端 inline
5. Confidence bar per field:
   - bar width = confidence × 100%、bg primary-soft / fg primary
   - threshold 0.85 未満は alert tone
6. Citation panel (3 件):
   - 各 entry: emerald badge "承認済" + title + snippet + reference link
   - bg emerald-soft、border emerald-200
7. Staging hint panel (L3 Disclosure):
   - toggle: "未承認ヒント (citation 対象外) を見る ▾"
   - 内側: slate-50 panel inset + 各 entry "citation 対象外" label (slate badge muted)
8. Alert strip (注意 2 件):
   - bg amber-50 / border-left 3px alert
   - 各 alert: AlertTriangle icon + message + reference link
9. PrimaryAnchor strip (Header 直下、status === "入力者確認待ち"):
   - bg alert-soft (slight tint)
   - CTA "承認" primary indigo full / "差戻し (コメント付き)" secondary outline alert
10. Footer (sticky bottom):
    - 入力者確認待ち: 同 CTA を右寄せ
    - BusinessApprovalChip mock 右端 (demoted text "業務責任者: 田中課長 (mock)")
11. micro-interaction:
    - View toggle (raw/diff/value): segmented control、active state primary-soft bg
    - Disclosure expand 250ms ease-out
    - PrimaryAnchor CTA hover: bg shift
    - Diff strike-through fade in 150ms
12. PrototypeModeLabel pill TopBar 右、Sidebar "受信トレイ" active (CaseDetail は Queue 系)

## Visual constraint re-stated

- Primary indigo #635BFF / Diff-add #D1FAE5 (bg) / Diff-del #FEE2E2 (bg) / Citation emerald-soft / Alert amber-soft
- Card radius 8px, control 6px, chip 4px
- Mono tabular for confidence / 案件 ID / 効力発生日
- No decoration

## State coverage

- **Ideal**: status === ready (入力者確認待ち)、5 field visible、Citation 3 件、Staging closed
- **Loading**: field 5 行 skeleton、confidence bar placeholder
- **Error**: AI 入力結果取得失敗時、Section A に EmptyState (error variant) + retry CTA
- **Empty**: rare、case fetch failed 時のみ
- **Partial**: AI 入力結果のうち一部 field のみ確信できた場合、低 confidence field に alert chip + "確認推奨" 注記

## Acceptance check
- [ ] Lifecycle Stepper が sticky、5 step 描画、current step が indigo dot + semibold
- [ ] Diff block (旧住所 → 新住所) が strike-through + emerald で描き分け
- [ ] Confidence bar が各 field 下に描画、0.84 で threshold 表示
- [ ] Citation panel が emerald-soft で 3 件描画、Staging panel は default closed
- [ ] Footer "承認" "差戻し (コメント付き)" CTA が status 連動描画
- [ ] PrototypeModeLabel pill が TopBar 右に visible
