Requested output style: high-fidelity polished mockup (full color, real data render, design system applied)
(**新たな High Fidelity session を作成してから本 prompt を paste**してください — Claude Design UI に固定 mode pill あり、Hub pilot で確認済)
(design system は Project に登録済み (Step 1 で恒久 register)。**同 Project 内 Wireframe session で生成した同 page の wireframe を layout baseline として参照**してください — Claude Design は Project 共有 context で wireframe を継承します、再 attach 不要)

# Page: ProposalDetail (AI 提案レビュー) — polished mockup 化

## Polish 指示

1. previous wireframe の 2-col layout + sticky Proposal Lifecycle Stepper + PrimaryAnchor + Section A/B/C + aux 3 panel はそのまま保持
2. design system full 適用
3. Proposal Lifecycle Stepper (3 step、sticky):
   - 整理 → ●承認 → 反映
   - current step "承認": indigo dot + font-semibold + bottom border 2px
   - CaseDetail の 5 step stepper と同 pattern (radius / dot size 8px)
4. 判定基準 5 行 list:
   - 番号 (mono、circle 16px) + text
   - 各行 row-padding `py-2`
   - hover で bg slate-50
5. 元案件 link:
   - inline card-style row、案件 ID mono + workflow + 簡潔 description
   - click → 新 tab で CaseDetail
6. 提案メタ 5 element (L2 compact):
   - 2-col grid (label + value)、各行 small text
   - Confidence は mono tabular + progress bar (60% width、bg primary-soft / fg primary)
   - Reversibility: badge "Revertible" (success-soft tone)
7. 未承認ヒント Disclosure:
   - toggle text "未承認ヒント (staging entry、citation 対象外) を見る ▾"
   - 内側 bg slate-50 inset、各 entry に slate badge "citation 対象外"
8. Citation panel (emerald-soft、2-3 件)
9. 関連手順更新 alert:
   - bg amber-50 / border-left 3px amber
   - icon AlertTriangle + text + reference
10. PrimaryAnchor strip:
    - bg primary-soft (slight tint、indigo な背景)
    - "業務責任者へ送付" CTA primary full + "差戻し" secondary outline
11. Footer (sticky bottom):
    - 業務責任者へ送付 (primary right) / 差戻し (secondary) / 草稿保存 (tertiary text)
    - 左 caption "本提案は staging entry の compiled 昇格..."
12. micro-interaction:
    - PrimaryAnchor CTA hover: bg shift
    - Disclosure expand 250ms
    - Confidence progress bar fade in 200ms on mount
13. PrototypeModeLabel pill TopBar 右、Sidebar "AI 提案レビュー" active

## Visual constraint re-stated

- Primary indigo #635BFF / Success-soft (Citation, Reversibility badge) / Amber-soft (関連手順更新) / Slate (Staging)
- Card radius 8px, control 6px, chip 4px
- Mono tabular for proposal ID / confidence / 影響件数
- No decoration

## State coverage

- **Ideal**: status === 審査中、meta visible、Citation 3 件、Staging closed
- **Loading**: 5 行 list skeleton、Citation skeleton 2 行
- **Error**: proposal 取得失敗時 EmptyState (error)
- **Empty**: proposal 過去履歴 0 件のとき (rare)
- **Partial**: meta の一部欠落時、L2 compact 内側に "情報不足" badge

## Acceptance check
- [ ] Proposal Lifecycle Stepper 3 step sticky 描画
- [ ] PrimaryAnchor strip が primary-soft bg + CTA "業務責任者へ送付"
- [ ] 判定基準 5 行 list が numbered + hover state
- [ ] 提案メタ 5 element が L2 compact (Confidence は progress bar)
- [ ] 未承認ヒント Disclosure が default closed、citation 対象外 badge
- [ ] Citation 2-3 件 emerald-soft、関連手順更新 alert は amber 描画
