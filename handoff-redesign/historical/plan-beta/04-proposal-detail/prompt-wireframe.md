Requested output style: low-fi wireframe sketch (mono color, basic shapes, gray scale, placeholder text 可)
(**New Session 作成時に "Wireframe" mode を選んでから本 prompt を paste**してください — Claude Design UI に固定 mode pill あり、Hub pilot で確認済)

# Page: ProposalDetail (AI 提案レビュー)
Typology: C (Detail Workspace、2-col grid)
Route: `/proposals/:proposalId`
Goal: 承認者が AI 提案 (手順承認 = staging から compiled へ昇格) を判定基準 + 元案件と照合し、業務責任者へ送付するか差戻すかを判断する

## Layout

### Header (sticky, min-h 88px)
- breadcrumb: "受信トレイ › AI 提案レビュー › PROP-2026-031"
- h1: 提案 title (truncate、例: "AI 抽出 v2.3: 番地表記正規化ルール改定")
- chip × 1 (status のみ): "[審査中]"
- L2 demoted: 経過 12h + 提案ソース v1.2
- 右端 hedge chip: "[仮説 / 要検証]"
- **Proposal Lifecycle Stepper (sticky、Header 下段)**: 整理 → ●承認 → 反映 (3 step、CaseDetail と pattern 統一)

### PrimaryAnchor strip (Header 直下)
- label: "業務責任者へ送付"
- summary: "判定基準 5 / 元案件 12 件影響 / Confidence 0.81"
- CTA primary "業務責任者へ送付" (status / meta visible 確認後 enabled)
- 副 CTA: "差戻し" (secondary outline)

### Body — Detail typology (2-col)

#### Primary (7/12 col)

##### Section A: 判定基準 (5 行 list、最重要)
1. 番地表記の semantic 変更検知精度 > 0.90
2. 信頼度閾値 0.85 を満たす case のみ反映
3. 影響範囲 ≤ 20 cases
4. Reversibility = Revertible
5. 業務責任者 sign-off 必須

##### Section B: 元案件 link (compact)
- "元案件: CASE-2026-0142 (法人住所変更、住所 diff: 1丁目→2丁目)"
- inline link → CaseDetail へ navigate (新 tab で開く optional)

##### Section C: 提案メタ (L2 demoted、compact 5 element):
- Change author: AI 日次分析 v1.2
- Reason: 人手上書き率 0.18 (閾値 0.15 超)
- Confidence: 0.81
- Affected scope: 12 cases
- Reversibility: Revertible

(NG: メタ詳細を L1 でフル表示しない、L3 Disclosure で詳細を出す)

#### Aux (5/12 col)

##### 未承認ヒント (L3 Disclosure、default closed)
- toggle: "未承認ヒント (staging entry、citation 対象外) を見る"
- 中身: staging entry の preview list

##### Citation (L1、emerald badge)
- 関連 compiled knowledge 2-3 件

##### 関連手順更新 alert (条件付き、amber)
- "本提案が反映されると、UC-BO-01 法人住所変更フローの §3.2 が更新されます"

### Footer (sticky)
- 業務責任者へ送付 (status enabled) + 差戻し + 草稿保存 (3 CTA、status 連動 disabled)
- caption: "本提案は staging entry の compiled 昇格。承認後、AI の正式実行根拠として扱われます"

## Data (mock PROP-2026-031)
- proposal title: "AI 抽出 v2.3: 番地表記正規化ルール改定"
- status: 審査中
- 経過: 12h
- author: AI 日次分析 v1.2
- reason: 人手上書き率 0.18 (閾値 0.15 超)
- confidence: 0.81
- affected: 12 cases (UC-BO-01)
- reversibility: Revertible
- 判定基準 5: (上記 Section A)
- 元案件 link: CASE-2026-0142

## Visual constraint (key tokens re-stated)
- Canvas slate-50 / Panel white
- Primary indigo / Alert-soft (関連手順更新) / Success-soft (Citation) / Slate (Staging)
- Radius card 8px / control 6px / chip 4px
- Inter + Noto Sans JP + JetBrains Mono (PROP ID / Confidence)
- 装飾禁止

## Chrome
- Sidebar 5 nav、"AI 提案レビュー" active
- TopBar: 共通

## Anti-pattern (旧 ProposalReview)
- 旧: 提案メタ 5 element を aux col に full 表示 → 新: L2 compact 5、L3 Disclosure で詳細
- 旧: 未承認ヒント panel が L1 visible → 新: L3 Disclosure default closed (citation 対象外であることを強調)
- 旧: PrimaryAnchor なし、Footer まで scroll しないと CTA に届かない → 新: Header 直下 PrimaryAnchor strip + Footer CTA 二段

## Acceptance check
- [ ] Proposal Lifecycle Stepper (3 step) が Header 下に sticky
- [ ] PrimaryAnchor strip が "業務責任者へ送付" CTA を primary 表示
- [ ] 判定基準 5 行 list が primary col に visible
- [ ] 提案メタ 5 element は L2 compact (L1 full 表示せず)
- [ ] 未承認ヒント panel は L3 Disclosure default closed
