# Backoffice AI v2 — Greenfield UI/UX 方向性分析

**日付**: 2026-06-02 ／ **STATUS**: pre-checkpoint 方向分析 (proposal、locked SSOT ではない) ／ **軸数**: 23

> 本書は greenfield 再設計 prompt の §2 (visual thesis) / §4 (research 採否) / §6 (UI 原則) に供給する方向分析であり、**§8 方向 checkpoint (reference 1 画面 + 新 IA route-map + Codex review + user 承認) で確定**する。locked SSOT ではない。
>
> **生成方法**: research-compounder の UI/UX card 群 + 2026-05-29 platform 監査 + project SSOT を、2-round multi-agent workflow (round1: 16 軸 + synthesis + critique / round2: 欠落 7 軸 + live-code corrections 反映 + synthesis/critique 更新) で分析。platform の version/percentage は 2026-05-29 監査が point-in-time の典拠。
>
> **原則**: research を全部盛りしない。end-to-end operator UX 最適化のため curate した結果を「最適 UI」として描く。

---

## 0. 補正 (live-code 整合 errata、stale SSOT より優先)

初回分析は一部 canonical-spec の stale naming を参照したため、live code 実測 (2026-06-02) で次を補正する。§3 の該当 4 軸には冒頭に補正バナーを付す。

1. **radius**: live `--radius-card: 12px / --radius-control: 8px / --radius-chip: 6px`。canonical「card8/control6/chip4」は stale naming で実値ではない。card=12px は意図的 (「8px 超皆無」は誤り)。
2. **nav**: live Sidebar = 4 named group (処理/改善/監視/承認) + ハブ、計 **9 nav item**。/inbox・/search は Sidebar 非所属で **TopBar** (BellIcon→/inbox、検索 input→Enter で /search)。「3 group」「6-nav」「8 item」は stale/誤算 (canonical §2.3 / prototype CLAUDE.md / Sidebar comment)。現行 SSOT は roadmap §1b。
3. **icon (route nav)**: live は既に整合 — Sidebar InboxIcon→/cases、TopBar BellIcon→/inbox。iconography 軸が提案した「InboxIcon→/inbox」は live で不採用済 (衝突なし)。checkpoint = 1 glyph 単射の回帰防止のみ。
4. **execute 表現**: mock+in-memory ゆえ「承認 commit」= mock state 更新であり実 execute ではない (propose-only 規律と矛盾しない)。
5. **confidence gate**: 「業務面 UI に生 confidence 0 / 監査台帳 (Observatory raw ledger) は許容」と surface 限定。
6. **density tier owner**: typology→tier 割当の owner は `[information-density-hierarchy]` 軸に一元化 (layout 軸は grid/spacing 素地のみ)。
7. **reversal glyph**: live は 反映取消/reverted=`RotateCcwIcon` (Notifications.tsx:24 / CaseDetail.tsx:204,255)、差戻し/sendback=`CornerUpLeftIcon` (Notifications.tsx:23 / CaseDetail.tsx:243)。`[state-feedback-machine]` 軸の「reverted=CornerUpLeftIcon」は差戻しと衝突 → **取消=RotateCcwIcon** に読み替え (1 concept 1 glyph 維持)。
8. **差し戻し gate**: live の `差し戻し` は 1 箇所のみ (CaseDetail.tsx:476、toast の動詞活用「差し戻しました / 再処理へ差し戻し」= 正当な日本語)。`[content-microcopy-tone]` 軸の「2 箇所→統一・grep 差し戻し=0 gate」は誤算 + over-broad。gate は **Tier1 名詞「差戻し」の用法のみ禁止、動詞活用は許容** に再設計。
> 補足: 上記 stale SSOT (canonical-spec §1/§2.3・prototype-redesign/CLAUDE.md・Sidebar header comment) は live と乖離しており、別途 SSOT 同期 (roadmap §1b へ) を推奨。

---

## 1. 方向軸タクソノミ map (23 軸)

### Foundation 層 — 視覚基盤

- **色・テーマシステム (OKLCH spine / semantic tone / dark mode)** `[color-theme-system]` (core) — 中立 spine と accent の規律、status semantic tone (受付/確認/差戻し/エスカレーション) への色割当、dark mode 派生を決める。誤操作を防ぐ色 = status tone の意味整合をここで固定する。
- **タイポグラフィ・数値表現 (editorial / tabular / JP type / hierarchy)** `[typography-numerics]` (core) — display〜caption の type scale、tabular-nums による金額・件数の桁揃え、JP 本文 type、weight 段数を決める。熟練 operator の数値スキャン速度を支える基盤。
- **サーフェス・素材・elevation (frosted 限定 / shadow / hairline / radius)** `[surface-material-elevation]` (important) — panel/inset の階層、shadow による浮き、hairline 区切り、radius/shape 言語を決める。frosted/translucency は文字・データ背後では使わず chrome 限定 (監査: iOS26.1 後退 + NN/g 批判)。
- **レイアウト・グリッド・余白基盤 (container query / subgrid / density band / breakpoint)** `[layout-grid-density-foundation]` (important) — container/subgrid grid、余白 scale と vertical rhythm、density band の基盤値、breakpoint を決める。各画面の密度判断が乗る土台 (subgrid/container query は監査 NOW)。
- **アイコン・視覚記号 (lucide / icon-per-concept / status glyph)** `[iconography-visual-signs]` (supporting) — icon ライブラリ統一、概念ごとの icon 割当 (差戻し/再取得/SoD/エスカレーション)、status glyph の一貫性を決める。記号の曖昧さが誤読を生むため概念-記号 1:1 を固定する。

### Structure 層 — IA / 構成

- **IA・ナビゲーション・shell (route topology / nav model / 15-capability shell)** `[ia-navigation-shell]` (core) — 15 capability の route topology、sidebar/nav grouping (処理/改善/監視)、shell chrome と画面間遷移動線を決める。end-to-end の operator 動線の骨格。
- **情報密度・階層・スキャン (density tier / scan pattern / JP density)** `[information-density-hierarchy]` (core) — 画面ごとの density tier 割当、scan pattern の意図的設計、JP 助詞 prefix 由来の bypassing 抑制、過剰削減を避ける文脈判定を決める。状況把握の速さの中核。
- **データテーブル・キュー (premium tier: density / sort / filter / select / inline-edit / virtualization / hit-target)** `[data-table-queue]` (core) — 案件キュー・承認待ち・提案一覧の table 設計 — density/sort/filter/multi-select/inline-edit/virtualization/hit-target を決める。triage 速度と一括処理の安全性を支える主力 surface。
- **Hub・概況 composition (KPI hierarchy / 今日 framing / oversight 入口)** `[hub-overview-composition]` (core) — Hub と Observatory の概況構成 — KPI 階層、「今日やること」framing、fleet 健康度の 1 秒把握、各 oversight への入口配置を決める。1 日の注意配分の起点。
- **フォーム・入力・起票 (/cases/new field / validation / SoD / optimistic)** `[forms-input-entry]` (important) — 手動起票 /cases/new の field 構成・JP 法人 field・validation surface・重複/SoD check・React19 actions/optimistic を決める。typology A 主画面の reference owner。
- **検索・retrieval (/search cross-entity / query / scope / result density)** `[search-retrieval]` (important) — 横断検索 /search の query 入力・scope 切替・result density・grouping・no-result state・keyboard 操作を決める。複数 entity (案件/提案/agent/台帳) 横断の retrieval 動線。

### Interaction 層 — 動線 / 判断

- **判断・承認・SoD (4-tier confirmation / 5-state timeline / four-eyes / 単一決定面)** `[approval-sod-decision]` (core) — action confirmation の 4 段階、承認 timeline の 5 状態、four-eyes (入力者/承認者) の actor 分離、object 単位の単一決定面を決める。誤操作ゼロと SoD 遵守の核心。
- **Diff・根拠・説明可能性 (diff preview / citation / confidence-uncertainty / document viewer)** `[diff-evidence-explainability]` (core) — AI 提案の変更 diff 事前可視化、一次証拠への citation、confidence/uncertainty 表現、文書ビューア 2-pane アンカーを決める。「常に根拠が見える」安心の中核。
- **Agent 監督・信頼較正 (vigilance / zone-out / progressive autonomy / above-the-loop)** `[agent-supervision-trust]` (core) — Agent 一覧/詳細・Observatory での監督設計 — vigilance decrement / automation bias 対策、zone-out 防止、autonomy の実績昇格 (Supervised/Checkpoint/Autonomous)、above-the-loop triage を決める。任せる量を増やしつつ制御を渡さない要。
- **例外・escalation・recovery (agentic exception / handoff / HIL error recovery)** `[exception-escalation-recovery]` (core) — escalation 画面と例外動線 — agent 誤り検知→封じ込め→復旧→学習、agent→人 handoff、SLA breach / wrong decision からの HIL recovery を決める。差戻し→staging Flywheel の例外側を担う。
- **通知・inbox・async engagement (notification channel / slow-agent wait-reengage / proactivity)** `[notification-inbox-async]` (important) — 通知 (/inbox) の channel 設計、分〜日単位で走る slow-agent の待機・離脱・呼び戻し、agent proactivity の割り込み制御を決める。非同期に走る業務の再エンゲージ動線。
- **コマンド・power-user 操作・入力 (palette / keyboard / shortcut / form / optimistic action)** `[command-power-user-input]` (important) — command palette、keyboard shortcut、手動起票/検索の form 設計 (validation / optimistic action / React19 actions) を決める。1 動作で完了する判断と熟練者の速度を支える操作層。

### Quality 層 — 横断品質

- **モーション・遷移・progressive enhancement (motion budget / view-transitions / reduced-motion)** `[motion-transition-progressive]` (important) — tier 別 motion budget、view-transitions による画面間遷移、status 変化の micro-animation、reduced-motion 全停止、progressive enhancement (Chrome-only を base にしない) を決める。
- **状態機械・フィードバック (empty/loading/error/blocked/completed/reverted)** `[state-feedback-machine]` (core) — 6 状態 × 15 画面 × tier 維持の SSOT を所有。skeleton/empty/error/blocked/completed/reverted の表現と復旧導線、inline feedback、status signaling を決める。
- **アクセシビリティ・包摂 (WCAG2.1AA / R7 gate / ARIA grid / grayscale / focus)** `[accessibility-inclusive]` (core) — a11y 合否の owner。R7 contrast gate / ARIA grid + roving tabindex / color-blind grayscale 検証 / focus order / keyboard semantics / ADA-EAA を所有し責任空白を埋める。
- **コンテンツ・microcopy・トーン (JP-only / 語彙 / decision-useful / text density)** `[content-microcopy-tone]` (core) — UI copy の SSOT。JP-only、Tier 語彙の一貫使用、decision-useful な label/empty/error 文言、object-first ラベル、text-density 5 軸、conversational tone/refusal、[仮説/要検証] hedge を決める。
- **レスポンシブ・viewport 戦略 (desktop-primary / mobile smoke / shell / print)** `[responsive-viewport]` (supporting) — desktop-primary 前提、mobile smoke 対応、responsive shell、breakpoint 挙動、2-pane→tab fallback、@media print を決める。density を壊さない responsive 規律。
- **監査・開示・規制透明性 (disclosure journey / explainability / provenance / prototype label)** `[audit-disclosure-transparency]` (core) — 規制 disclosure 動線・explainability 開示の timing/量・audit access 動線・provenance/prototype labeling・SR11-7 reconstruct を決める。approval/diff 軸と重複せず「開示の journey と透明性」を所有。

---

## 2. End-to-end 最適化 synthesis (軸横断、23 軸版)

## End-to-end 最適化 thesis (23 軸版に更新、既存 thesis を保つ)

**この prototype が狙う唯一の operator Wow は「速い・迷わない・間違えない・説明できる」を素材と規律で物理的に保証することであり、spectacle を一切足さないこと自体が差別化になる。** 貫く方針は「**boring-reliable を 1 段だけ premium に研ぐ**」— 全 surface を solid (translucency 全面不採用)、全 motion を抑制 default、全色を OKLCH 6-tone semantic に固定し red を「真に止まれ」だけに独占させ、意味は色単独に絶対載せず glyph+ラベル+tone の 3 重で運ぶ。新 7 軸はこの thesis を**周縁から中心へ閉じる**: happy path だけ規律化していた既存 16 軸に対し、**非 happy path・入力源流・到達不能・包摂の物理層**を 1 つの状態機械・1 つの起票契約・1 つの a11y gate・1 つの copy SSOT・1 つの retrieval 安全網・1 つの viewport invariant・1 つの監査到達動線として束ねる。具体的には、6 状態 (empty/loading/error/blocked/completed/reverted) を新 component を増やさず既存 disabled-gate/Toast/banner に mapping した単一 SSOT に閉じ、起票 `/cases/new` は AI 障害時の唯一の業務継続経路として typed field 契約 + 3 層 validation + `useActionState` で「源流で間違えない」を保証し、a11y は実装ではなく**検証 gate の owner** として偽 green (jsdom axe が contrast を silent skip) を撲滅し grayscale 判別と keyboard 単射を物理強制する。「人のコントロールを渡さない」不変条項は全新軸が継承する — 起票・承認・反映・reversal・escalation の重 action に optimistic を一切使わず wait+明示確定し、生 confidence は 23 軸すべてで業務面から消え Observatory raw ledger だけに型隔離される。透明性は「実規制条文の cite」ではなく「監査時に 5 秒で台帳へ飛べる 1-click reconstruct 動線」で示し、これが mock prototype で誠実に作れる唯一の disclosure である。結果としてこの prototype は「機能を全部見せる demo」ではなく「熟練 operator が 30 秒で状況を掴み 1 動作で安全に裁き、異常分岐でも迷わず戻れ、なぜそう裁いたかを台帳が語る」**運用 OS の縮図**になる。

---

## 軸横断の衝突解決

| # | 緊張 | 解決 | 根拠 |
|---|---|---|---|
| 1 | **状態 component の所有権** (state 軸 × color/icon/density 軸 × 既存実装) | 6 状態を**新 component 増設せず**既存 `EmptyState`/`LoadingState`/`ErrorState`/`Toast`/disabled-gate/banner に mapping する 1 SSOT (`useResourceState` の機械状態) と workflow 状態 (CaseStatus 5値+reversal+escalation) を**型レベルで直交**。tone は status-tones SSOT、glyph は icon 軸、tier は density 軸に従属し state 軸は値を再宣言しない | `state-feedback-machine` 軸 + corrections#6 (density owner 一元化) + CLAUDE.md「Tech Debt を生まない」 |
| 2 | **起票契約の所有権** (forms 軸 × command-power-user 軸の重複、synthesis line 1199 が明記) | 政策層 (palette 起動・optimistic 可否 rule・3 層 validation 方針) = command 軸 / **field 粒度 spec (型/桁/inputmode/重複キー/SoD プリ警告の実装契約)** = forms 軸。両軸の optimistic 結論は一致 (起票=wait) | `forms-input-entry` 軸 + greenfield 除外#8 (重 action 除外 rule) |
| 3 | **偽 a11y green** (a11y 軸 × 既存 15-route jest-axe gate) | jest-axe (jsdom) は color-contrast を**silent skip** → gate を「構造のみ・contrast 非評価」と降格明記し、**独立に** token AA 台帳 (sRGB 4.5:1 実測) + grayscale visual gate を追加。`fg-subtle` 意味テキスト禁止を negative-grep で強制 | `accessibility-inclusive` 軸 + 監査「OKLCH L 値 ≠ WCAG contrast、token 採用後 sRGB 実測必須」 |
| 4 | **confidence の surface** (content 軸の定性語化 × typography 軸の tnum 生数字 × audit 軸の reconstruct) | 業務面 = 定性語 `一致/要確認/未取得` (content 軸 owner、生数字 0) / Observatory raw ledger = `confidence(監査用)` 列の tnum 生数字 (typography 軸、型保証、SR 11-7 reconstruct 担保)。surface 完全分離 | corrections#5 + `content-microcopy-tone`/`audit-disclosure` 軸 + greenfield 除外#2 |
| 5 | **Tier1 語彙の二重定義** (content 軸 × color 軸 × data-table 軸) | status key = `lib/status-tones.ts` / 表示ラベル = 新設 `lib/copy.ts` / key→label は単一 mapping。`差し戻し` 2 箇所 → `差戻し` 統一 (grep 0 gate)。同一 status を別 surface で二重宣言しない | `content-microcopy-tone` 軸 + corrections#5 |
| 6 | **/search と Cmd+K の機能重複** (search 軸 × command 軸 × IA 軸、greenfield §534 open question) | **Cmd+K = transient jump/dispatch (no facet/no deep-link/action escalation)、`/search` = durable faceted retrieval (chip scope/`?q=` 共有/4 entity/table)**。no-result から Cmd+K へ誘導する 1 行で分界を教える。重複でなく depth 違いの 2 surface | `search-retrieval` 軸が greenfield §534 を確定 + `command-palette-and-power-user-action-ui.md` (prefix は palette 専用) |
| 7 | **監査 entity の検索可能性** (search 軸 × audit/Observatory 軸) | `/search` に 4 つ目 entity `台帳` を追加 (案件/提案/Agent/台帳)、ID 断片で過去処理を引ける = "説明できる" の retrieval 担保。ただし台帳 SSOT は二重化せず row href は Observatory anchor/案件 detail への参照に留める | `search-retrieval` 軸 + `audit-disclosure` 軸 (L3 ledger = SSOT) |
| 8 | **responsive と density の衝突点** (responsive 軸 × density 軸、corrections#6) | density tier owner は density 軸。responsive は font/padding/radius を**不可侵 invariant** とし、3 帯 (1024 full / 768 stack / <768 mobile smoke) で「列の畳み + chrome 出し入れ」のみ。`cqi`/`dvh` は negative-grep で不在保証 | `responsive-viewport` 軸 + corrections#6 + 監査「業務系は静的 svh default」 |
| 9 | **監査透明性の所有権** (audit 軸 × diff-evidence 軸、greenfield §821 が audit を citation 軸に飲み込みかけ) | **根拠の中身 (passage/tier/diff) = diff-evidence 軸 / 記録への到達動線 + actor 表明 + prototype-label = audit 軸**。両軸とも disclosure-journey card を引くが audit 軸が「動線」を独立 owner として切り出す | `audit-disclosure-transparency` 軸が greenfield §821 の飲み込みを解消 |
| 10 | **radius の stale naming** (全軸 × canonical-spec) | live src/index.css 実値 `--radius-card:12px / control:8px / chip:6px` を SSOT とし、canonical-spec §1「card8/control6/chip4」「8px 超皆無」は stale として無効化。全新軸は live token を参照し値を再宣言しない | corrections#1 (live 実測 > stale SSOT) |
| 11 | **nav の stale group 数 / icon 跨ぎ** (responsive/IA 軸 × stale doc) | nav = 4 named group (処理/改善/監視/承認) + ハブ ungrouped = 8 item (live Sidebar.tsx、roadmap §1b が SSOT)。`/inbox` に InboxIcon を割当てず BellIcon 等にし InboxIcon を /cases 単射に。mobile bottom-nav も icon 単射順守 | corrections#2,#3 (live Sidebar.tsx) |
| 12 | **重 action optimistic** (forms/state/command 軸 横断) | 起票・承認・反映・reversal・escalation の台帳に乗る重 action に optimistic 一切不採用、wait+明示確定。mock は `setTimeout(~250ms)` で 1 frame wait を再現し「承認 commit = mock state 更新で propose-only と矛盾しない」をコメント明記 | corrections#4 + greenfield 除外#8 + 不変条項「人のコントロールを渡さない」 |

---

## End-to-end journey 統合 (queue→案件→根拠/diff→判断/承認→例外→監査、新軸連結)

**0. 入口の包摂層 (a11y 軸が全 journey の floor)。** どの step も**マウス不使用 + grayscale でも完遂可能**を物理前提とする。skip-link→nav→filter→sort→行 Link→決定 footer の focus order を route ごとに固定、target size 24×24 floor、`prefers-contrast:more` で低 chroma 輪郭を boost。これが「間違えない」の物理的土台。

**1. Queue (`/cases`, `/approvals` — T3, reference)。** Hub 5-KPI で注意配分を 1 秒判定 → exception triage list から該当 queue へ。Tier 3 Compact table、要確認行は alert-soft 塗り marking + pinTop、操作列は object-first (bypassing 撲滅)。**state 軸**: 取得 loading は skeleton (0 text)、filtered-empty は ≤15字+Reset のみ (illustration 禁止、tier 維持)、Approval queue empty には「直近処理履歴を見る」link 併設。**content 軸**: 列ヘッダ・filter chip・bulk label は `lib/copy.ts` lexicon 参照。

**2. 起票 (`/cases/new` — forms 軸 net-new、AI 障害時の唯一の業務継続経路)。** typed field schema (型/桁/必須/重複キー) を read、支店コード=`inputmode="numeric"`+桁 placeholder、日付=`type="date"`、全 input ≥16px (iOS auto-zoom 回避)。**3 層 validation**: on blur inline 敬語 actionable error (`role="alert"`) → on submit summary + 最初の無効 field へ focus → 起票確定時に同一 workflow×重複キーの既存 case を mock async check (重複=error block / 担当者==承認者 SoD 衝突=warning 続行可)。`useActionState` で pending/error 一括、button は `aria-busy`+「起票中」、**optimistic 不採用**。header に「起票=入力者の確認 / 別担当者の承認者承認が必須 (四眼)」を常時 legible、AI prefill/OCR は出さない (honesty)。

**3. 案件 (`/cases:id` — T3 2-pane, reference for state 軸)。** row click → View Transition で master↔detail morph。素材階層が信頼レベルを 0.2 秒で語る (canvas→文書 panel-inset→ReconcilePanel panel)。**state 軸 6 状態が同一面に同時露出**: 取得 loading/error、文書 empty、SoD/precondition blocked (button disabled + `LockIcon`+理由 inline、非表示にしない=説明可能性保全)、承認→completed、反映済→reverted。

**4. 根拠/diff (ReconcilePanel)。** field hover/click で左文書の該当欄 highlight scroll (source locator)、inline char-level diff。**生 confidence はどこにも出ず** 6 reconcile 状態+tone。**content 軸**: 定性語 `一致/要検証/未取得`、mock 試算に `[仮説/要検証]`。**audit 軸**: actor chip (AI 提案/入力者確認/承認者確定) で per-action 表明、技術 schema は ledger に隔離。承認 button は全 field 一致/確認済 で enabled。

**5. 判断/承認 (単一決定面 footer)。** object 単位 1 セット、ActorBand「あなたは今 承認者 — 入力者は田中」、入力者==承認者なら disabled + SoD tooltip。T3 案件承認=footer 内 2-step、T4 (設定承認/反映取消) のみ typed confirmation modal。**state 軸 completed**: Toast (`role=status` polite) + LifecycleStepper 前進、**undo は出さない** (重 action、reversal は別動線)。差戻し reason は min 10字 gate + 過去 reason datalist suggest (content 軸、Flywheel input 保護)、toast 文型=`{動詞過去} — {次の行き先}`。

**6. 例外/escalation。** 新画面ゼロで既存 4 画面に分散接続。**state 軸 reverted**: 反映済の誤承認は CaseDetail footer の `[反映を取消(別tx)]` — reflected→ready 直行せず **sent-back** へ (false-success 防止)、原 entry は override せず compensating 行を追記、二重 reversal は blocked。裁定理由は staging に流れ Flywheel 例外側の閉路。

**7. 監査 (Observatory ledger — T4 forensic、audit 軸 L3 到達先)。** 全 outcome を 7-state controlled vocab + 生 confidence + actor で記録、reason 列 full text、read-only。**audit 軸 net-new**: ProposalDetail/CaseDetail footer に「証跡を台帳で確認 →Observatory(案件 pre-filter)」1-click link を新設し、`/observatory?...&q={caseId}` で当該案件 filter 済 ledger に到達 (5 秒 reconstruct、audit fatigue 解消)。**search 軸**: `/search` の 4 つ目 entity `台帳` から ID 断片で同 ledger を引ける。連結の鍵は status→tone を `lib/status-tones.ts`、ラベルを `lib/copy.ts`、機械状態を `useResourceState` の **3 つの SSOT** で全画面が共有し drift を構造封じ。

**8. 全帯 viewport invariant (responsive 軸が journey 全体を覆う)。** ≥1024 full 2-pane / 768–1023 sidebar+単pane stack (証拠上/決定下、footer sticky) / <768 mobile bottom-nav smoke (閲覧のみ、業務完遂非対象)。`h-screen`→`h-[100svh]`+fallback、bottom-nav に `safe-area-inset-bottom`、全帯で font/padding/radius 不変。print は CaseDetail+Observatory に chrome 除去+page header 保持。

---

## 意図的除外 ledger (統合)

| # | 捨てたもの | なぜ | 由来 |
|---|---|---|---|
| 1 | **translucency / frosted glass on data・text** | iOS26.1 後退 + NN/g legibility 批判、operator の数値読取を破壊。state 軸も skeleton/error を solid 強制 | 監査 + `liquid-glass-design-language-2025.md` |
| 2 | **生 confidence 数字 (0.84/%/★) を業務面に** | automation complacency 誘発、文脈なしで行動不能。23 軸すべてで業務面 0、ledger のみ型隔離 | corrections#5 + `confidence-and-uncertainty-visualization-ui.md` |
| 3 | **重 action への optimistic / undo toast / auto-retry** | 起票・承認・反映・reversal・escalation は台帳に乗る。false-success は規制 surface で逆効果、throughput より「人のコントロール」上位 | corrections#4 + greenfield 除外#8 + `react-19-ui-patterns.md` |
| 4 | **新しい状態 component の増設** | blocked/completed/reverted は live で既に disabled-gate/Toast/banner に分散実装済、SSOT は mapping table で足りる。新 component は Tech Debt | `state-feedback-machine` 軸 + CLAUDE.md |
| 5 | **起票への AI prefill / OCR / auto-fill** | 本画面の存在理由が「AI 障害時の手入力」。AI prefill は honesty 違反 (F-006/F-007、起きていない処理を捏造) かつ画面目的と矛盾 | `forms-input-entry` 軸 + honesty test |
| 6 | **multi-step wizard / stepper (起票)** | 現行 5-6 field で single page が最速、step 分割は context switch で縦スキャン速度を落とす (card 16+ 閾値未満) | `forms-input-entry` 軸 + `forms-and-data-entry-patterns.md` |
| 7 | **empty/error への illustration・3-paragraph copy** | tier mismatch (mechanical: empty が primary state の 1.5x element で fail) + AI-cliche tell。banking は type-only icon + 短 copy が operator Wow | `state-feedback-machine`/`content-microcopy-tone` 軸 + `state-text-density-alignment.md` |
| 8 | **full ARIA grid / spreadsheet keyboard nav** | triage table は read/sort/select で full grid overshoot、Arrow-key cell focus は inline-edit 前提。native `<table>`+Tab が SR に素直、行は先頭 Link 単射 | `accessibility-inclusive` 軸 + `data-table` card (grid 推奨は inline-edit 前提) |
| 9 | **persona 名 / empathy tone / AI disclosure copy / 長謝罪文** | 読者=熟練 operator 単一 persona、customer-facing でない。emotional copy は scan を物理的に遅延、operator Wow (速い) に逆行 | `content-microcopy-tone` 軸 + `conversational-ai-tone-and-persona.md` |
| 10 | **scope prefix (`#`/`>`) を /search に / semantic / fuzzy / Did-you-mean** | prefix は Cmd+K と語彙衝突 + JP IME 干渉、chip で代替済。semantic/fuzzy は mock+in-memory に index 基盤なく exact-ID retrieval を殺す | `search-retrieval` 軸 + `search-and-filter-premium-tier.md` |
| 11 | **Saved view / Recent searches / 起票への optimistic 先行表示** | 永続化 backend 不在で機能が空気化、prototype で偽の状態を作らない | `search-retrieval` 軸 + 監査 (永続化 scope-out) |
| 12 | **full mobile responsive (15画面×全機能 mobile 完遂)** | 読者は desktop operator、密度破壊 + 検証コスト (3帯×状態) が E2E 価値を上回る。mobile は smoke (閲覧のみ) | `responsive-viewport` 軸 + `backoffice-responsive-shell` card |
| 13 | **`cqi`/container-query fluid type / `dvh` 動的追従** | reuse 文脈薄く YAGNI、`dvh` reflow は業務帳票の reading 妨害 (規制 UI で静的 svh default)。negative-grep で不在保証 | `responsive-viewport` 軸 + `modern-css-units-viewport-container-2025.md` |
| 14 | **実規制条文の UI cite (Art.50/SR11-7/GDPR 等)** | Tier 3 hedge 違反 + prototype-label「実規制の引用なし」と自己矛盾。透明性は条文名でなく「再現できる」動線で示す | `audit-disclosure-transparency` 軸 + project CLAUDE.md Tier 3 |
| 15 | **顧客向け disclosure flow (P1 pre-interaction / P3 adverse-decision 説明権)** | 実 customer・実 adverse 自動判断なし、mock を mock で開示するだけ。card に記録し本番化で起動 | `audit-disclosure-transparency` 軸 + `regulated-agent-disclosure-audit-journey-2026.md` |
| 16 | **監査人/規制当局/顧客の 3 系統別 UI + write 権限分離** | mock single-persona ゆえ 1 read-only ledger に集約、3 系統分離は本番化まで過剰 | `audit-disclosure-transparency` 軸 (anti-pattern #5) |
| 17 | **cognitive a11y reading-aid (font/行間 toggle / OpenDyslexic)** | 読者が単一熟練 persona、consumer 向け dyslexia toggle は YAGNI。plain language + error recovery だけ floor | `accessibility-inclusive` 軸 + `cognitive-accessibility-deep.md` |
| 18 | **ADA/EAA を「法的義務」として訴求** | 両法は consumer 限定で内部ツールに直接 binding せず、捏造的 compliance claim は anti-pattern。justification は Art.14 oversight 実効性 + 内部包摂に限定 | `accessibility-inclusive` 軸 + `ada-web-accessibility-litigation-us-2025.md` |
| 19 | **郵便番号 API auto-fill / Save draft auto-save (起票)** | 外部接続・永続化 scope-out、mock+in-memory に持ち込むと faux 機能 | `forms-input-entry` 軸 |
| 20 | **bulk 直接承認 / palette からの承認 direct execute** | 「人のコントロールを渡さない」が throughput より上位、bulk は「確認の一括化」止まり | greenfield 除外#8 + `command-palette-and-power-user-action-ui.md` |

---

## checkpoint で確定すべき open question

1. **起票 validation timing の体感 (forms 軸)。** `/cases/new` の支店コード/日付で on blur inline error が「早期に気づける」か「打鍵中の noise」か。reference では型のある 1-2 field で確立し残りを on submit summary に委ねる分割が、熟練 operator の起票速度を落とさないか目視。
2. **blocked の伝え方 (state 軸)。** 承認/差戻し button を**非表示でなく disabled+理由 inline** にした時、「なぜ押せないか」(SoD/precondition/二重 reversal guard) が読めて、かつ Tier 3 密度を壊さないか。disabled の inset tone が「停止だが破壊でない」と red と弁別して読めるか。
3. **/search 4 entity の row 異質性 (search 軸)。** 案件/提案/Agent/台帳を kind 混在 1 table + kind sort で並べた時、台帳 row (時刻/操作種別/actor) の異質性が scan を壊さず塊として読めるか。kind-grouped collapsible に倒すべきか目視。
4. **監査到達動線の発見性 (audit 軸)。** ProposalDetail/CaseDetail footer の「証跡を台帳で確認 →」link を operator が差戻し時に 5 秒で見つけられるか。footer 二次 link の重み付けが弱すぎ/強すぎないか、deep-link 先の pre-filter が正しく効くか。
5. **偽 green の解消確認 (a11y 軸)。** jest-axe gate に「構造のみ・contrast 非評価」明記が残り、独立に token AA 台帳 (全 soft-fg×soft + fg 階層×全背景が sRGB 4.5:1) が存在するか。15 route の grayscale 撮影で全 status badge が色なしでも glyph+label 判別可か。
6. **768–1023 中間帯の意図確認 (responsive 軸)。** live の shell=768 / 2-pane=1024 の 2 段が生む「sidebar あり + 単 pane stack」帯を意図と認めるか buggy gap とみなすか。CaseDetail を 1024/768/390px 実機撮影し、いずれの帯でも font/padding が同一 (density 不変) かを確認。
7. **confidence surface 分離の grep gate (content/audit 軸横断、corrections#5)。** 業務画面 (src/pages から Observatory ledger view 除く) の生 confidence (`信頼度 0.xx`/`.toFixed`/裸`%`) grep が 0、`差し戻し` grep が 0 (→`差戻し` のみ)、Observatory ledger 内のみ `confidence(監査用)` 列が存在するか。
8. **canonical-spec の responsive 章追補 + stale 是正 (responsive 軸 + corrections#1,#2)。** canonical-design-spec に responsive 章 (3 帯/svh/safe-area/print/density-invariant) が追補され、radius を live 値 (12/8/6) に、nav を 4-group/8-item に是正したか。`grep -rE "100dvh|cqi|container-type" src/` が 0 hit (Reject 手段の不在 gate)。

---

## 3. 方向軸 詳細分析 (23 軸)

### Foundation 層 — 視覚基盤

#### 色・テーマシステム (OKLCH spine / semantic tone / dark mode) `[color-theme-system]` — core

##### この軸が決めること / なぜ E2E UX に効くか
中立 spine と単一 accent の規律、status 4 局面 (受付/確認/差戻し/エスカレーション) への tone 割当、dark mode 派生方針を固定する。color は operator が「今どの状態か・どこに目を向けるか・誤って何かを壊さないか」を**読む前に**知覚で判定する第一層。tone の意味整合が崩れると 15 画面横断で誤操作と判断遅延が起き、E2E の状況把握速度を直接毀損する。本軸は「誤操作を防ぐ色」を status tone の semantic 整合として固定し、reference 1 画面の token block まで落とす。

##### 研究が示すこと (card ファイル名 / 監査 verdict を必ず引用)
- `modern-css-color-oklch-p3-2025.md`: **OKLCH と color-mix() は Baseline Widely available (2025-11-09)、fallback 不要で本番投入可**。light-dark()/relative color は Newly available で「enterprise は静的 fallback を上段に残す」。**OKLCH の L 値 ≠ WCAG contrast、token 採用後に sRGB 基準で実測必須**。2026-05-29 監査 NOW verdict も「OKLCH/color-mix = fallback 不要、token system の base に採用可」を追認。
- `color-system-for-premium-web.md`: neutral spine (12-14 step) を主、accent は 1 brand hue + 4 status に限定。**status は muted (success chroma 0.08-0.12 / hue~145、warning 0.10-0.14 / hue~75-85、error は高 chroma 0.18-0.22 / hue~25-30)**、error のみ高 saturation で階層を作る。Error を `#ff0000` full chroma にしない。
- `dark-mode-design-beyond-default.md`: dark は pure black 不可、tinted (`oklch 0.10-0.14`)、**surface は additive lightness で 3-5 tier**、accent chroma を light より -10〜-20% (vibrating 回避)、foreground は pure white でなく `oklch(0.96)`、focus ring は別途確保。
- 監査 verdict (2026-05-29): **「文字・データ背後に translucency を使わない」**(Apple iOS26.1 後退 + NN/g legibility 批判)、`prefers-reduced-transparency` は Limited で単独退避不可。frosted は backdrop-filter blur のみ cross-engine、規制 surface では不採用が安全。
- 現状 SSOT (`canonical-design-spec.md` §4 + `index.css`): 既に **6-tone semantic** (inset=中立/受付/却下, primary=進行中/AI/確認中, alert=要対応/人手介在, slate=次段待ち, success=完了, error=重大/エスカレーション) を OKLCH で実装済、status→tone は `lib/status-tones.ts` 単一 SSOT。

##### 選択肢と緊張 (tradeoff)
| 論点 | 選択 A | 選択 B | 緊張 |
|---|---|---|---|
| status tone 数 | 4-tone (success/warning/error/info の card 標準) | **6-tone** (受付/確認中/次段待ち/要対応/完了/重大、現状) | card 標準は accent 抑制を優先。だが本業務は workflow 状態が 4 局面 × lifecycle で、4-tone では「受付済(中立)」と「却下(中立)」を「次段待ち(進行)」と区別できず誤操作リスク |
| 差戻し の tone | error (red、強い停止) | **alert (amber、要対応)** | red は「破壊/失敗」を意味づける。差戻しは Flywheel の正常な学習入口で破壊ではない。red 化は operator に過剰な恐怖を与え、差戻しを躊躇させ Flywheel を殺す |
| dark mode | light only | **両対応 (toggle)** | back-office は長時間凝視 + 夜間 batch 監視あり。dark 需要は実在。だが 15 画面 × 6-tone × soft-fg AA 実測コストが二重化 |
| translucency | 採用 (modern Wow) | **不採用** | 監査 verdict で規制 surface に却下済。data 背後の透過は legibility 毀損 |

##### 決定 (本プロダクトの方向、reference 1 画面に落とせる具体 spec まで)
**OKLCH single-source の 6-tone semantic system を確定し、light を base、dark を hue 固定派生で追加する。translucency は全面不採用。**

1. **Color space**: OKLCH 直書き (`oklch(L% C H)`)、fallback 無し (Widely available)。color-mix(`in oklab`) で hover/active/disabled state を機械派生。light-dark()/relative color は採用しない (Newly、enterprise fallback 不要化が 2026-11 以降 + 二重定義削減の便益 < 規律明示性)。`[data-theme]` 二重定義を SSOT とする。
2. **Neutral spine**: cool slate (hue 264、chroma ≤0.014) を維持。現状の `canvas 97.7%` (content 地) / `panel 100%` (最明 card) / `chrome 96.3%` (nav は一段沈め data を前進) の recessive chrome 構造を base 規律として固定。pure white/black は不採用 (panel=100% は唯一の例外、content card の最明面として意図的)。
3. **Accent discipline**: brand = indigo (hue 274)。**fill 用 `--color-primary` (L55% C0.215) と text 用 `--color-primary-strong` (L47% C0.2) を分離** (light 地で AA、`--color-primary` は TEXT 禁止)。これが card の「accent saturation 規律」の本プロダクト実装。
4. **Status 4 局面 → tone (誤操作防止の核、`lib/status-tones.ts` SSOT)**:

| 業務局面 | tone | OKLCH (light) | semantic 根拠 |
|---|---|---|---|
| **受付** (受付済/却下) | `inset` (中立面) | `panel-inset 95.8%` | 処理結果の中立記録。色で attention を引かない (DC1 解消: 却下=inset、error から除去) |
| **確認** (確認待ち/確認中/AI 進行) | `primary` (indigo soft) | soft `96.5% 0.022 274` / fg `47% 0.2 274` | 「人の判断を待つ進行中」を brand hue で。次段待ち は `slate` (`fg` solid fill) で primary と区別 |
| **差戻し** (差戻し再処理/要対応/人手介在) | `alert` (amber) | soft `97.6% 0.035 85` / fg `43% 0.085 60` | **red ではなく amber**。差戻しは Flywheel 正常入口、破壊ではない。「要対応」を喚起しつつ恐怖を与えない |
| **エスカレーション** (重大/reconcile escalation) | `error` (red、唯一高 chroma) | `58% 0.215 27` / soft-fg `50% 0.19 27` | **error は唯一 chroma 0.215** で階層最上位。ここだけ red を独占させ、operator は「red = 真に止まれ」を学習。差戻しに red を使わないことで red の警告価値を保全 |

5. **soft-fg regime**: 全 status tone に `-soft` (背景) と `-soft-fg` (AA 通過 foreground) を対で持ち、`text-{amber,emerald,red}-{700,800,900}` 直書き禁止。これが「OKLCH L ≠ WCAG contrast」への対処 — soft-fg は sRGB 基準で AA 実測済の値に固定。
6. **Dark mode**: hue (264/274/85/27/165) を全 tone で固定し、L/C のみ派生 (OKLCH の hue 固定派生 advantage)。background は tinted (`oklch(0.13 0.02 264)`)、surface は additive 4-tier (`0.13→0.16→0.19→0.22`)、accent chroma を light より -15% (`primary 0.215→0.18`)、foreground は `oklch(0.96 0.005 264)`、focus ring は dark 専用に L を上げ別途確保。**dark 専用 soft-fg を再 AA 実測** (light 値の流用禁止)。
7. **Reference 画面 = `/approvals` (承認待ち)**: 4 tone が一画面に同時露出する唯一の面 (受付済=inset / 確認待ち=primary / 差戻し=alert / エスカレーション=error)。ここで tone hierarchy が成立すれば全画面で成立する。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: OKLCH 直書き + color-mix(`in oklab`) state 派生 (Widely、fallback 不要、`modern-css-color-oklch-p3-2025.md`)。neutral spine + 1 brand accent + status muted、error のみ高 chroma の階層規律 (`color-system-for-premium-web.md`)。dark = tinted + additive surface + accent -15% (`dark-mode-design-beyond-default.md`)。
- **Adapt**: card の 4-tone (success/warning/error/info) → 本業務 6-tone へ拡張。理由: workflow 状態 (受付/次段待ち) が card の汎用 4 軸に収まらず、中立 2 種 (inset) と進行 2 種 (primary/slate) の区別が誤操作防止に必須。card の「accent 抑制」精神は status muted + error 独占で保持。差戻し を card 想定の error(red) ではなく alert(amber) に再割当 (Flywheel semantic)。
- **Reject**: translucency / glass on data (監査 verdict)。light-dark()/relative color (Newly、便益 < 規律明示性)。P3 wide-gamut accent (規制 surface に HDR-only 差別化は不要、sRGB AA が binding)。pure black dark (`dark-mode` card)。`#ff0000` full-chroma error。
- **Defer**: `contrast-color()` での text 色自動算出 (Newly ~2026-04、engine version 未確認、`@supports` gate でも本番化時に再検証)。dark mode の実装自体は light 確定 + 全 tone AA 実測完了**後** (二重 AA コストを light 安定後に分離)。

##### 意図的に捨てるもの (全部盛りしない判断) + なぜ
- **light-dark() / relative color / P3**: 技術的に魅力だが、規制 back-office で「fallback 必須 (Newly)」「HDR-only 差別化」は便益が薄く、`[data-theme]` 明示二重定義の方が監査時の追跡性が高い。規律 > 新規性。
- **多 brand hue / gradient accent**: `color-system-for-premium-web.md` の Tier 1 cliche。operator Wow は spectacle ではなく状況把握速度なので accent は indigo 単一に固定。
- **status を 7+ tone に細分**: tone 数が増えるほど色の弁別が落ち誤操作が増える。6-tone が「区別が必要な最小数」で、これ以上は semantic を icon + label に逃がす (他軸へ委譲)。
- **translucency / 装飾 motion**: 監査 + 規制 surface 規律で却下済。

##### 他軸との依存・整合 / 衝突
- **typography 軸**: soft-fg の AA 実測は font weight/size に依存。soft-fg token は本軸が値を固定するが、最終 AA 判定は実 component の文字サイズで typography 軸と共同検証。
- **component/chip 軸**: tone は StatusBadge/MetaChip/FilterChip の 3 系統と `lib/status-tones.ts` 経由でのみ結合。本軸は **値**を、chip 軸は **適用面**を担当。軸混在禁止 (tone=色 semantic / status=workflow / severity=深刻度 / kind=variant) を両軸で守る。
- **icon 軸との冗長性 (重要)**: 色だけに意味を載せない (color-blind + WCAG 1.4.1)。差戻し=amber + `CornerUpLeftIcon`、エスカレーション=red + `ChevronsUpIcon` のように tone と icon を必ず対にする。色単独で status を判定させない — これが「誤操作が起きない安心」の本体。
- **motion 軸**: dark の focus ring・state 派生は color-mix で静的、motion とは独立 (regulated UI は motion default off)。
- **衝突点**: 既存 `lib/status-tones.ts` の v2 値 (差戻し=alert / 受付=inset / 却下=inset) と本決定は一致。**衝突なし、現状を正式 spec として承認・固定する**。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かるか)
1. `/approvals` で 4 tone が同時に見え、**error(red) が画面で唯一の高 chroma**として最も目立ち、差戻し(amber) と受付済(中立) が明確に弁別できる。red が差戻しに混入していない。
2. 全 status chip が tone + **icon の対**で表示され、grayscale 化しても (color-blind sim) status が判別可能。
3. off-token hex 0 (全色が `--color-*` token 経由、`scripts/check-design.mjs` gate pass)、status→tone のローカル再宣言 0 (`lib/status-tones.ts` 単一 import)。
4. soft-fg テキストが各 soft 背景上で WCAG AA (4.5:1) を sRGB 基準で実測 pass (OKLCH L 値を contrast と混同していない)。
5. data table / 文書ビューアの文字背後に translucency が無い (全 surface が solid)。
6. (dark 実装時) hue が light と一致、surface が additive 4-tier で elevation を語り、accent が light より低 chroma、dark 専用 soft-fg が再 AA pass。

参照した現物: `color-system-for-premium-web.md` / `modern-css-color-oklch-p3-2025.md` / `dark-mode-design-beyond-default.md` / 監査 `2026-05-29-frontend-ui-trends-2025-2026.md` (NOW=OKLCH Widely / translucency=Watch-only 後退) / `canonical-design-spec.md` §2・§4 / `prototype-redesign/src/index.css` (実装済 OKLCH token)。

#### タイポグラフィ・数値表現 (editorial / tabular / JP type / hierarchy) `[typography-numerics]` — core

##### この軸が決めること / なぜ E2E UX に効くか
display22→micro11 の type scale 各段の役割確定、金額・件数・confidence・時刻の桁揃え方式 (`tnum` 適用面)、JP 本文の leading/word-break/句読点処理、weight 段数 (max 3) の意味割当を決める。熟練 operator の中核タスクは「N 行の案件キュー/承認待ち/監査台帳を 30 秒以内に縦スキャンし逸脱を 1 つ見つける」こと (`scan-pattern-induced-by-layout.md` T3=spotted+marking)。桁が揃わない・weight が氾濫する・JP 行頭が bypassing で重複すると、この縦スキャンが破綻し operator Wow (圧倒的状況把握の速さ) が消える。typography はこの product の決定的な機能層であり装飾ではない。

##### 研究が示すこと (card / 監査 verdict 引用)
- `dashboard-density-tier-bands-ui.md`: 本 product の主画面は **Tier 3 Operator console** (≤60 element/viewport、row 24-32px、body 12-14px、time-to-comprehend ≤30s)。Tier 4 trader 化 (10-12px mono) は overshoot、Tier 1 exec 化 (24-32pt KPI 全面) は ops worker に 5+click context loss。**1 dashboard 1 tier、混在禁止**。
- `data-table-premium-tier.md`: 数値 column は `tnum` または monospaced を**強制**。density 3-tier (Compact 32 / Default 40 / Comfortable 48px) は toggleable で localStorage persist。
- `editorial-typography-for-premium-web.md`: Display は **1 weight**、Body は **2 weight** が editorial discipline。leading uniform 1.5 全域 = table が tall すぎ rhythm 喪失。KPI/価格/日付に tabular numeral 必須。ただしこれは「premium Web/marketing」起点 card で、Tier A-C display font (Söhne 等) 採用は本 regulated operator UI の文脈では過剰。
- `jp-display-typography-premium.md` + `jp-layout-conventions.md`: JP は EN と**逆**で tracking **0〜+1%** (tight で潰れる)、body leading **1.7-1.9**。`word-break: break-strict`(または `keep-all`)+`line-break: strict`+`palt`/`pkna`。元号のみ NG、西暦併記。
- `scan-pattern-induced-by-layout.md`: T3 は spotted+marking を induce。**bypassing 検出 = list/table 任意 column で先頭 token が 25%+ 行で重複**。JP 助詞 prefix (「〜について承認/差戻し」) が頻発元、「object: action」形式に再構成。Cockpit は heading 弱で layer-cake 未成立の前科あり。
- 監査 (2026-05-29): `text-spacing-trim` (句読点詰め) は **Chrome 121+ = Chrome-only 帯**、3-engine 未達。`field-sizing` も Watch-only。→ これらは base 不可、progressive enhancement 限定。Variable font `opsz` は audit に明示 verdict なし=未確認、本軸では採用しない。

##### 選択肢と緊張 (tradeoff)
| 軸 | 選択肢 A | 選択肢 B | 緊張 |
|---|---|---|---|
| 数値 font | sans + `tnum` (現状) | mono (Geist/JetBrains) を金額・confidence・ID に専用 | mono は桁揃え最強で「数値=機械的真実」signal、但し JP 本文と混植で visual rhythm 断裂、Tier 4 寄り |
| display font | Inter only (現状、Tier D) | Tier A-C editorial display | editorial card は Tier A-C を premium とするが、規制 operator UI で装飾 display は operator Wow に無関係 + cliche risk より craft floor 違反の方が軽い |
| 句読点詰め | `text-spacing-trim` 採用 | 不採用 | Chrome-only、監査が base 不可と verdict |
| density | 単一固定 | 3-tier toggle | toggle は operator adapt を許すが prototype scope で実装/検証コスト |

##### 決定 (本 product の方向、reference 1 画面=`/cases` 案件キューに落とせる spec)
**数値表現を最優先軸に置き、display 装飾は捨てる。** 現状の `--font-sans: Inter, Noto Sans JP` + body `tnum` 1 + cv11 + JP `palt` は方向として正しい。これを以下に確定:

1. **type scale 役割固定** (現 7 段を維持、追加しない):
   - `display22/700` = 画面 1 個の最重要 KPI 数値のみ (例: 承認待ち件数)。1 画面に 1-2 個まで。
   - `title18/600` = section heading (layer-cake induce の主役、上 margin > 下 margin 1.5x)。
   - `subtitle15/600` = card title / table group header。
   - `body14/400` = 本文・table cell 既定。
   - `body-sm13/400` = 副次 cell・補足。
   - `caption12/500` = meta chip・label・timestamp。
   - `micro11(2xs)/500` = badge・eyebrow のみ。
   - **weight は 400/500/600/700 の 4 値で固定、display は 700 単独、body emphasis は 600**。italic 全面禁止 (regulated UI、editorial card の UI italic 禁則に一致)。

2. **`tnum` の適用面を mechanical に定義** — 全 table の数値 column、金額 (`¥1,234,567`)、件数、confidence (監査 raw ledger のみ、業務 UI には生数字を出さない=CLAUDE.md 既定遵守)、時刻 (`14:30`)、case ID。これらは `.tabular` (`font-variant-numeric: tabular-nums`) を**明示 class で**強制 (body 既定の `tnum` に依存せず、column 単位で保証)。金額は `Intl.NumberFormat('ja-JP', {style:'currency', currency:'JPY'})`、日付は西暦`2026年6月2日`基準・元号単独 NG。

3. **数値強調の font は sans `tnum` を base とし、mono は使わない** — 金額・confidence への mono 専用化 (選択肢 B) は**却下**。理由: 案件キューは JP 案件名・業務種別と金額が同一 row に混植され、mono 混植は rhythm 断裂 (Tier 4 寄り)。sans の `tnum`+lining で桁揃えは十分成立し、operator が読む面の一貫性を優先。mono は監査台帳の `case ID`・hash・diff snippet など「機械的識別子」column のみ `--font-mono` に限定許容。

4. **JP 本文規律** — table cell/本文 leading **1.6-1.7** (dense table は editorial card の table 1.3-1.4 を採るが、JP のため下限を 1.5 に上げ最大 1.7)、tracking **0** (EN tight 禁止)、`word-break: break-strict`(fallback `keep-all`+`overflow-wrap: break-word`)、`line-break: strict`、`:lang(ja)` に `palt`+`pkna`。`text-spacing-trim: trim-start` は **`@supports` gate 付き progressive enhancement のみ** (Chrome-only、監査 verdict 遵守。不在でも layout 成立すること)。

5. **bypassing 撲滅 (reference 画面の合否を分ける mechanical gate)** — `/cases` の action label・status 列で JP 助詞 prefix 連続を禁止。「〜について承認/差戻し」→「承認: 案件名」「差戻し: 案件名」の **object 先頭** に再構成。先頭 token が 25%+ 行で重複したら fail。

6. **scan pattern induce** — `/cases` は **spotted** (status badge の distinct shape + `tnum` 数値整列) を主、**marking** (逸脱行の highlight) を従。section heading (`title18`) で **layer-cake** を補強し Cockpit の前科 (heading 弱) を繰り返さない。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: `tnum`+lining による桁揃え (`data-table-premium`/`editorial-typography`)、Tier 3 spec の row 24-32px・body 12-14px (`dashboard-density-tier`)、weight max 3-4 + display 1 weight (`editorial-typography`)、JP tracking 0 + leading 1.6-1.7 + word-break/line-break/palt (`jp-display`/`jp-layout`)、bypassing 25% mechanical gate + spotted/marking induce (`scan-pattern`)。
- **Adapt**: editorial card の Display/Body family separation → **family separation せず weight separation のみ** (Inter/Noto 単一系統で 400-700)。理由: 規制 operator UI に editorial display font は無関係、運用・license・cliche risk を避け weight で hierarchy を作る。editorial table leading 1.3-1.4 → JP のため 1.5-1.7 に緩める。
- **Reject**: Tier A-C 装飾 display font (Söhne/Tiempos)・明朝 accent (本 product に IR/長文 editorial 面なし)・金額/confidence の mono 専用化 (JP 混植で rhythm 断裂)・縦書き (UI 絶対禁則)・Tier 4 mono 10-12px (overshoot)。
- **Defer**: density 3-tier toggle (Compact/Default/Comfortable + localStorage persist) — substrate token (`--density-row-*`) は既に index.css に存在。reference 画面では **Default 40px 単一**で確定し、toggle 実装は後続 wave。`text-spacing-trim` は `@supports` enhancement として defer-on (不在前提で base 設計)。

##### 意図的に捨てるもの + なぜ
- **editorial display font 系統 (Söhne/GT America/Tiempos)** — editorial card の Tier A-C は marketing/IR 起点。本 product の Wow は「数値スキャン速度 × 誤操作ゼロ」であり装飾 display は寄与せず、運用負荷と AI-cliche tell を増やすだけ。Inter+Noto の weight separation で hierarchy は成立する。
- **金額・confidence の monospace 専用化** — 桁揃えは sans `tnum` で達成可能。mono 混植は JP 案件名との同一 row rhythm を壊し Tier 4 寄りになる。mono は機械的識別子 column のみ。
- **density 3-tier の reference 画面同時実装** — operator adapt 価値はあるが prototype の検証焦点 (1 画面の縦スキャン成立) を分散させる。substrate は残し toggle は defer。
- **明朝・縦書き・ruby・両端揃え justify** — 本 product に editorial 長文面が存在しないため全捨て。

##### 他軸との依存・整合 / 衝突
- **density 軸**: type scale の段と row height は連動。Tier 3 (row 24-32px / body 12-14px) を density 軸と共有 SSOT 化必須。本軸が body14 を既定とするのに対し density 軸が Tier 3 で 12-13px を要求する場合、**table cell は body-sm13、本文は body14** で分離して解決 (衝突せず)。
- **color/tone 軸**: spotted induce の status badge は tone v2 (status-tones.ts SSOT) に依存。数値の意味色 (alert 金額赤等) は soft-fg regime 経由 (直書き禁止) で本軸の `tnum` と直交。
- **layout/IA 軸**: layer-cake の section heading (title18) は IA の section 分割に依存。`tnum` column 整列は data-table 軸の column 定義に依存。
- **motion 軸**: 数値更新 (件数 count-up 等) は Tier 3 motion budget ≤2 event + `prefers-reduced-motion` global block 遵守。`tnum` は count-up 中の桁ガタつき防止に必須 (依存)。
- 衝突なし。現 index.css の token (body `tnum`+cv11、`:lang(ja) palt`、`.tabular`) は本決定と整合済、追加変更は **column 単位 `.tabular` 明示適用・weight 4 値固定・JP word-break/line-break 追加・`text-spacing-trim` の `@supports` 化**のみ。

##### checkpoint 受け入れ signal (`/cases` reference 画面で見るべきもの)
1. **桁揃え**: 金額・件数・時刻・ID column が縦に桁ピッタリ整列 (`tnum` 効いている)。試しに `1` と `8` を含む金額で 1px もずれない。
2. **weight 段数**: 画面内 font-weight が 400/500/600/700 の 4 値のみ (DevTools computed で grep)。display22 が 700 単独、italic ゼロ。
3. **JP 行頭**: action/status 列の先頭 token が 25%+ 行で重複しない (「承認: 」「差戻し: 」が連続行頭に並ばない=bypassing 不在)。
4. **scan**: 30 秒で N 行を縦スキャンし逸脱 1 行を特定できる。status badge の distinct shape (spotted) + 逸脱行 highlight (marking) が機能。section heading (title18) で視覚段差 (layer-cake) が見える。
5. **JP rhythm**: 案件名 cell が char 途中で不自然に折れない (break-strict)、句読点が行頭に流れない (line-strict)、本文 leading が窮屈でない (1.6-1.7)。
6. **tier 整合**: row 24-32px / body 12-14px の Tier 3 density で、KPI が exec 化 (24pt 全面) も trader 化 (10px mono) もしていない。
7. **enhancement 安全**: Chrome で `text-spacing-trim` が効き、非 Chrome で**崩れず**同 layout を保つ (`@supports` gate 成立)。

#### サーフェス・素材・elevation (frosted 限定 / shadow / hairline / radius) `[surface-material-elevation]` — important

> ⚠ **補正 (live code)**: radius は live `--radius-card: 12px / --radius-control: 8px / --radius-chip: 6px`。本文の「card8/control6/chip4 厳守・8px 超なし」は canonical-spec の stale naming に基づく誤りで、**card=12px は意図的**。radius 主張はこの実値で読み替えること。

##### この軸が決めること / なぜ E2E UX に効くか
panel/canvas/panel-inset の 3 段サーフェス階層、shadow による浮き (resting / floating / overlay の 3 段)、hairline 区切りの罫線素材、radius/shape 言語、frosted の許容範囲を確定する。operator Wow の中核「圧倒的状況把握の速さ × 根拠が常に見える安心」は、**どの面が"今あなたが操作する対象"でどの面が"システムが提示した根拠"かを、色ではなく素材 (elevation/hairline/inset) で 0.2 秒で区別させる**ことで成立する。差戻し→staging→手順承認→設定承認の Flywheel では「人が編集する面」「AI が提案した面 (未承認)」「確定した監査台帳」が 1 画面に同居するため、素材階層が弱いと operator が信頼レベルを誤認し、誤承認 (= governance 違反) を招く。素材は安心・誤操作防止に直結する機能要素であり装飾ではない。

##### 研究が示すこと (card ファイル名 / 監査 verdict を必ず引用)
- `liquid-glass-design-language-2025.md` + 2026-05-29 監査 verdict: frosted (backdrop-filter: blur) は 3 engine で Newly available・安全だが、**屈折は Chromium-only**。Apple 公式 (WWDC25 session 219) は Clear (半透明) を「dimming layer 必須・非適応・全 context legibility 非保証」と定義し、Apple 自身 iOS 26.1 で opacity 増 + toggle を出して**後退**。NN/g「text on top of something else becomes harder to see」。→ **文字・データ背後の translucency は禁則、frosted は chrome 限定**。
- `boring-reliable-ui-banking-healthcare.md` B5 Restraint: regulated UI で「視覚装飾を排除、cognitive resource は核 task に」。Reference は SEC EDGAR / Federal Reserve = plain text + 明示。装飾的 shadow/glow は trust を毀損する。
- `card-design-beyond-default.md`: Border/Shadow は併用せず役割分担 ("Border 1px subtle" = Default separation / "Shadow only no border" = Elevated/Material / "Inset shadow" = Premium ring)。**Default static card に hover effect → clickable 誤認**。shadow token は `0 1px 2px oklch(0 0 0 / 0.05)` 級の極薄を resting に。
- `dashboard-density-tier-bands-ui.md` (production-safe): 本プロダクトの主画面は **Tier 3 Operator console** (≤60 elements, whitespace 15-20%, element height 24-32px)。Tier 3 では whitespace 過多を premium と評価するのは fail。素材階層は密度を犠牲にせず深さを出す必要がある。
- `material-identity-glass-metal-paper.md`: M1 Glass を 4 effect 未満で宣言は Tier 1 cliche。系統 mix は identity 喪失、1 系統 primary。→ 本プロダクトは Glass を primary にしない。

##### 選択肢と緊張 (tradeoff)
| 軸 | 選択肢 A | 選択肢 B | 緊張 |
|---|---|---|---|
| 階層の出し方 | shadow (浮き) 中心 | hairline + inset (面色) 中心 | shadow 多用は Tier 3 密度で視覚ノイズ・装飾化リスク / hairline 中心は深さ表現が弱く overlay の優先度が伝わりにくい |
| AI 提案面の素材差別化 | primary-glow ambient で浮かす | inset + 左 accent rule (border) で沈める | glow は「AI=特別演出」で consumer spectacle 寄り・監査批判 / inset は地味だが boring-reliable に整合 |
| frosted | overlay (modal/drawer) 背後に薄く使う | 一切使わず solid scrim | frosted は奥行きが綺麗だが Chromium-only 屈折なし + a11y 退避コスト / solid は確実だが奥行き演出ゼロ |

##### 決定 (本プロダクトの方向、reference 1 画面に落とせる具体 spec まで)
**素材言語 = "Paper-on-canvas, hairline-first, shadow-sparingly"。frosted は overlay chrome の 1 箇所のみ、文字・データ背後は全 solid。** 既存 token を SSOT とし新規 token は最小限。

**サーフェス 3 段 (色で深さ、shadow ではない)**:
- `canvas` #f8fafc = アプリ地。AppShell 背景。
- `panel` #fff = 情報カード/テーブル/フォームの実体面。**resting は `border 1px var(--border)` のみ、shadow なし** (boring-reliable + card-design の Default = border separation)。
- `panel-inset` #f1f5f9 = panel 内の「読み取り専用の根拠/受付済/系側」領域 (reconcile の未取得値、監査台帳の確定行、AI が読んだ原文)。**inset 面に意味テキストを置くなら `fg-tertiary` 以上** (canonical-spec §9、`fg-muted` は inset 上 AA 未達)。

**Elevation 3 段 (shadow は浮く必要がある面だけ)**:
- E0 resting (panel 標準): shadow なし + hairline border。Tier 3 密度のため大多数の面はここ。
- E1 floating (`--shadow-sm`): sticky header / 選択中の行 / drag 中。極薄、`0 1px 2px` 級。
- E2 overlay (`--shadow-lg`): modal / drawer / popover / command palette のみ。

**Hairline (区切りの主役)**: テーブル行間・セクション間・KPI 群の区切りは全て `1px var(--border)` の hairline。`border-strong` は SoD/承認境界など「越えてはいけない線」(four-eyes の入力者面と承認者面の境界、設定承認ゲート) に限定使用 = 線の太さが governance の意味を持つ。

**Radius/shape**: 既存 `card8 / control6 / chip4` を厳守、画面追加でも逸脱しない。8px 超の大 radius は使わない (regulated/dense は角丸過大が consumer 寄り)。data table セルは radius 0、外枠 panel のみ card8。

**AI 提案面の差別化 (glow ではなく inset + accent rule)**: 未承認 AI 提案は `panel-inset` 背景 + **左 3px `border-primary` の accent rule** + 右上に確定状態 chip。`--shadow-primary-glow` は使わない (監査の「規制 surface に spectacle を入れない」)。確定/承認後は accent rule を外し plain panel に昇格 = 素材変化が「未承認→承認」の状態遷移を語る。

**Frosted の唯一の許容点**: modal/drawer 開時の背後 scrim と、AppShell の sticky header (スクロール時に下のテーブルが透ける chrome) のみ。実装は solid scrim を baseline、`backdrop-filter: blur(8px)` は progressive enhancement、`prefers-reduced-transparency`/`forced-colors` で solid に退避。**header 上のテキスト (KPI ピル等) は header を高 opacity solid に保ち translucency 背後に置かない**。

**reference 1 画面 = 案件詳細 (/cases/:id)** にこれが全部出る: canvas 地 → 左に案件メタ panel (E0, hairline 区切り) → 中央に reconcile 2-pane (左=AI 抽出値 panel-inset+primary accent rule, 右=原文 panel-inset) → 右に監査台帳 panel (E0, 確定行は inset) → 差戻しボタン押下で drawer (E2 + frosted scrim)。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: frosted = overlay chrome 限定 (liquid-glass card + 監査); border/shadow 役割分担と Default=hover なし (card-design); B5 Restraint で装飾 shadow 排除 (boring-reliable); inset 面の `fg-tertiary` floor (canonical-spec §9)。
- **Adapt**: card-design の「inset shadow = premium ring」を**選択 ring** (`box-shadow: 0 0 0 2px primary-ring`) として SoD 選択状態のみに転用 / dashboard-density Tier 3 を主画面に適用するが KPI overview 部分 (Hub) のみ Tier 2 寄りに緩める。
- **Reject**: M1 Glass を primary material 化 (4 effect 不可能 + 規制 UI 不適); `--shadow-primary-glow` を AI 面に常用 (spectacle・監査批判); 屈折表現全般 (Chromium-only); 大 radius/skeuomorphic torn-paper (material-identity の cliche tell)。
- **Defer**: dark mode の elevation 再キャリブレーション (dashboard-density「dark の density 視覚比は要 calibration」未確認点・本 prototype は light 確定後); noise/grain overlay (M4、editorial 専用で operator UI に不要、必要になれば再検討)。

##### 意図的に捨てるもの (全部盛りしない判断) + なぜ
- **Liquid Glass / frosted を panel に使う案を全捨て** — 文字・データ背後の translucency は監査 verdict が明確に禁止 (NN/g 批判 + Apple 後退)、operator の数値読み取りを破壊。chrome 1 箇所に封じる。
- **多段 shadow による richness 演出を捨て** — Tier 3 密度では shadow がノイズ化し scan path を乱す。深さは色 (inset) と hairline で出す方が高密度に両立。
- **AI 面の glow/ambient 演出を捨て** — operator Wow は「派手さ」でなく「誤認しない安心」。glow は trust を上げず spectacle に振れる。状態は accent rule + chip という読み取り可能な記号で表す。
- **Metal/Paper/Grain の material identity を捨て** — 1 系統 primary 原則、かつどれも regulated dense UI に warmth/装飾を持ち込み restraint に反する。material identity は「flat + typography で identity」(material-identity decision tree の default safe) を採る。

##### 他軸との依存・整合 / 衝突
- **色軸**: inset/accent rule は色軸の semantic tone (primary=進行中/AI, success=完了) と token 共有。canonical-spec の ToneV2 (inset/slate/primary/success/alert/error) と素材階層が衝突しないよう、**素材 = 信頼レベル軸 (編集対象/根拠/確定)、色 = 状態軸 (進行/完了/要対応)** と直交させる。両者を混ぜると過剰になる。
- **density/typography 軸**: Tier 3 前提なので素材は whitespace を増やさず色面で深さを出す方針が density 軸と整合。
- **motion 軸**: elevation 遷移 (hover lift, drawer 出現) は motion budget T3≤2/T4=0 と `prefers-reduced-motion` global block を継承。hover lift は主画面 T1 でも -1px 程度に抑制 (装飾 motion 禁則)。
- **衝突候補**: 色軸が AI 面を primary 色で強調する方針を採ると、素材軸の primary accent rule と二重化する。→ accent rule (3px line) は素材軸が所有、面塗りの primary-soft は色軸が所有、と分担を明記して回避。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かるか)
1. /cases/:id で **canvas / panel / panel-inset の 3 階層が shadow なしでも色だけで判別できる** (squint test で深さが見える)。
2. **resting panel に shadow が乗っていない** (DevTools で E0 = border のみ、shadow は sticky header/drawer だけ)。
3. AI 抽出 panel に **左 3px primary accent rule + 確定 chip があり、glow がない**。承認後に accent rule が消え plain panel になる。
4. drawer/modal の背後 scrim は `prefers-reduced-transparency` ON で solid に切り替わり、**header の KPI テキストが translucency 背後に来ていない** (常に高 opacity solid)。
5. テーブル行区切りが全て 1px hairline で、**`border-strong` が SoD 境界 (入力者/承認者面の仕切り・設定承認ゲート) にのみ出現** する (grep で border-strong の出現箇所が governance 境界に限定)。
6. radius が `card8/control6/chip4` のみで、data table セルが radius 0、8px 超が皆無。

#### レイアウト・グリッド・余白基盤 (container query / subgrid / density band / breakpoint) `[layout-grid-density-foundation]` — important

##### この軸が決めること / なぜ E2E UX に効くか
container/subgrid grid、余白 scale と vertical rhythm、density band の基盤値、breakpoint。各画面 (15 capability) の密度判断が乗る**唯一の土台**で、ここを mechanical に固定しないと監査が指摘した 5 drift (各画面 self-contained 生成で一貫性強制層が無い) が再発する。operator Wow の中核「圧倒的状況把握の速さ」は density band と grid track の規律で、「常に根拠が見え誤操作が起きない」は 2-pane 証拠アンカー幅と sticky footer の余白規律で物理的に決まる。土台が揺れると 15 画面が個別に dense/疎を判断し、scan cost が上がる。

##### 研究が示すこと (card / 監査 verdict を引用)
- **density は subjective でなく mechanical**: `dashboard-density-tier-bands-ui.md` は element budget / min-height / typography pt / whitespace% の 4 軸で 4 band 化、「1 dashboard = 1 tier、multi-tier 混在は禁則」「audience の time-to-comprehend と tier の time-to-comprehend 不一致 = 最頻 fail mode」と断定。本プロダクトの operator は Tier 3 (Operator Console: ≤60 element/viewport, 24-32px row, 12-14pt body, whitespace 15-20%, ≤30 sec scan) が base。
- **grid family は宣言制**: `grid-system-for-premium-web.md` — G1 (12-col default modular) が SaaS dashboard 適合、「全 artifact を G1 で組むのは Tier 2 cliche」だが本プロダクトは marketing でなく業務 console ゆえ G1 base + 局所 subgrid が正。同 section 内 family mix は禁則。
- **subgrid / container query は監査 NOW (無条件採用可)**: `modern-css-layout-capabilities-2025.md` + 2026-05-29 監査 Verdict Matrix — container queries=Baseline Widely (2025-08)、subgrid=Widely (2026-03)、いずれも「fallback 不要、JS 高さ同期を置換可」。監査の NOW 表に明記。`field-sizing` は Watch-only (Firefox rollout 途上) ゆえ採用しない。
- **spacing は intent-driven、ただし dense UI 向けは 4px base**: `spacing-and-rhythm-for-premium-web.md` — 4px base が dense functional UI、8px base が marketing。「Tailwind default 全 step 使用は cluttered、5-6 step 厳選」「container max-width 全域 1280px uniform は editorial で readable 超過」。本軸は wide dense container (1440px+) が dashboard/table の default。
- **viewport 単位**: `modern-css-units-viewport-container-2025.md` — operator UI は静的 `svh` を default (`dvh` の resize は reading 妨害、regulated UI で局所限定)。
- **density × 熟達度**: `progressive-disclosure-and-density.md` — Expert は Compact density (8-12px padding, 13-14px font, 32-36px row)。読者=熟練 operator ゆえ Compact 寄り Tier 3。
- **現状実装の制約 (memory + project SSOT)**: §10 で density T1–T4 token は「定義のみ、per-screen 適用は W1」。実装は既に Hub `max-w-[1120px]`、Observatory `max-w-[1080px]`、CaseDetail/Proposal/AgentDetail が `lg:grid-cols-[52fr_48fr]` / `[7fr_5fr]` の 2-pane。memory `feedback_section_reveal_scroll_container.md`: AppShell の overflow-auto scroller 内では `container-type` 祖先と IntersectionObserver root の扱いに注意 (container query 祖先は scroller 内側 div に置く)。

##### 選択肢と緊張 (tradeoff)
| 論点 | 選択肢 A | 選択肢 B | 緊張 |
|---|---|---|---|
| base density | 全画面 Tier 3 統一 | 画面 typology 別 (list=T3 / detail=T2-3 / hub=T2) | A は一貫だが Hub の状況把握に余白不足、B は drift リスク → **typology→tier 固定表で B** |
| grid | 全画面 12-col G1 | list=table(border-sep) / detail=2-pane track / hub=card grid | grid family 混在は禁則だが画面間は別 family 可 → **画面 type ごと 1 family 宣言** |
| responsive 単位 | container query (component-level) | media query (page-level) | 同 card を sidebar/main で reuse する箇所のみ CQ、page layout は MQ で十分 (監査: reuse 無き CQ 化は overhead) |
| container 幅 | 全域 wide 1440 | dense=wide / editorial(文書ビューア)=narrow 64-72ch | 文書 reading は narrow が正、dashboard は wide → **content-type 別 3 種** |
| subgrid 適用 | 全 card 整列 | list 行の多列 header/body baseline 揃えのみ | over-engineering gate → **明確に integ 価値ある箇所限定** |

##### 決定 (本プロダクトの方向、reference 1 画面に落とせる spec)

**density band = Operator Console Tier 3 (`dashboard-density-tier-bands-ui.md`) を全 capability の base に固定。Expert 熟達度ゆえ Compact 寄り (`progressive-disclosure-and-density.md`)。typology→band を mechanical 表で fix:**

| capability typology | band | row/cell height | body / KPI font | whitespace | grid family |
|---|---|---|---|---|---|
| list (cases/approvals/proposals/agents/search/inbox/config-approvals/escalations) | **T3 Compact** | 36-44px row | body 13-14px / tnum | 15-18% | data table (gap 0 + border separator) |
| detail C型 (cases/:id, proposals/:id, agents/:id) | **T3** 2-pane | — | body 14px | 18% | `grid-cols-[52fr_48fr]` (CaseDetail) / `[7fr_5fr]`、証拠左 + 項目右 |
| hub / overview (Hub, Observatory, business-approver) | **T2 寄り** (status把握優先) | 56-64px KPI card | KPI 22-28px / body 14px | 25-28% | 12-col card grid (`grid-cols-3` sm) |
| form (cases/new) | **T2** single-col | — | body 14px | comfortable | editorial narrow (`max-w-2xl`) |

**spacing**: 4px base atomic scale (`--space-1..40`、§10 既存 token 維持)。5-6 step 厳選で off-grid 値 0。section pacing は dashboard ゆえ dense variant (py-8〜12) を default、breath variant は使わない (業務 console に marketing breath は不要)。vertical rhythm は row height を band 値に snap。

**breakpoint (mechanical、既存実装と整合)**: モバイル非対象 (operator は desktop 27" base、監査 Tier 3 = Desktop ceiling)。`md 768` (tablet 業務端末 fallback、2-pane→stack) / `lg 1024` (2-pane 成立) / `xl 1280`〜 (full density)。primary target は ≥1280px。

**container max-width 3 種** (`spacing-and-rhythm-for-premium-web.md`): wide dense **1440px** = list/dashboard の default、mid **1080-1120px** = hub/observatory (既存値踏襲)、narrow **64-72ch** = 文書ビューア (CaseDetail 左 pane) + form。

**subgrid (監査 NOW、限定適用)**: list 行内の「申請項目名 / 入力値 / AI 提案値 / 差分 / 操作」多列を行間で baseline 揃えする箇所、および reconcile 2-pane の左右行対応のみ `grid-template-rows: subgrid`。card 全体への subgrid 化はしない (over-engineering gate)。

**container query (監査 NOW、限定適用)**: StatusBadge/MetaChip/KpiCard 等の **再利用 primitive のみ** `container-type: inline-size` 宣言、`@container` で sidebar 内 (狭) / main 内 (広) の密度自動調整。**AppShell scroller の内側 div に container-type を置く** (memory `feedback_section_reveal_scroll_container.md` の overflow-auto 罠回避)。page-level layout は media query。fluid type は使わない (operator UI は固定 px の方が scan 安定、`clamp(rem...)` 下限規律は不要)。

**reference 1 画面 = `/cases` (list)**: T3 Compact data table (36-44px row, body 13-14px tnum, gap 0 border-sep, whitespace 15-18%), wide 1440 container, 多列 subgrid で列 baseline 揃え, StatusBadge/MetaChip は container query primitive。これが正しく組めれば 8 list 画面に横展開できる。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: ① `dashboard-density-tier-bands-ui.md` の 4 軸 mechanical band + typology→band 固定表 (drift 構造防止)。② subgrid / container query (監査 NOW、Baseline Widely、無条件)。③ 4px base atomic scale + 5-6 step 厳選 (既存 §10 token 維持、dense UI 適合)。④ 静的 `svh` (operator UI default)。
- **Adapt**: ① Tier 3 Operator Console を Expert 向け **Compact 寄り** に振る (row 36-44px、`progressive-disclosure-and-density.md` Compact 値を Tier 3 spec に合成)。② grid family は「画面 type ごと 1 family」に緩める (`grid-system-for-premium-web.md` は同 section 内 mix のみ禁則ゆえ画面間別 family は規律内)。③ container query は AppShell scroller 内側 div に祖先を置く (memory の overflow-auto 罠 adapt)。
- **Reject**: ① fluid type (`cqi clamp`) — operator scan は固定 px が安定、reuse の密度調整は CQ breakpoint で足り fluid 不要。② `field-sizing` — 監査 Watch-only (Firefox rollout 途上)、regulated UI で機能要件化しない。③ marketing breath section (py-32〜40) — 業務 console に余白演出は scan cost 増。④ Bento/Modular/Editorial grid を主画面に — 業務 console は G1 + data table が正、editorial は文書ビューア局所のみ。
- **Defer**: ① user-toggle density (Comfortable/Default/Compact 切替、`progressive-disclosure-and-density.md`) — 初版は Compact 固定、運用 feedback 後に検討。② `dvh` 下部固定 CTA 追従 — sticky footer が現状成立、追従が機能要件化したら局所追加。

##### 意図的に捨てるもの (全部盛りしない) + なぜ
- **fluid type 全面 (cqi)**: operator の高速 scan は予測可能な固定行高/文字サイズが効く。container ごとに文字が伸縮すると視線アンカーが揺れ、Wow「状況把握の速さ」を毀損。CQ は密度 layout 切替に限定、type は固定。
- **density user-toggle**: 読者が単一 persona (熟練 operator) ゆえ初版で Compact 固定が最速。toggle は novice/expert 両対応 UI の craft で、本プロダクトは expert 専用。
- **subgrid の全 card 適用 / Bento**: integ 価値が明確な多列行揃えのみに絞る。card 全 subgrid 化は debt、Bento は heterogeneity 演出で業務 console の均質スキャンに逆行。
- **mobile full responsive**: operator は desktop base、監査 Tier 3 = Desktop ceiling。tablet fallback (2-pane→stack) まで、phone は非対象。

##### 他軸との依存・整合 / 衝突
- **typography 軸**: band の font pt (body 13-14px / KPI 22-28px) と tnum は本軸が band 値を提供、字形 detail は typography 軸。衝突点 = fluid type 採否 → 本軸は **固定 px 推奨** で整合要請。
- **color/elevation 軸**: whitespace% と density は本軸、panel/shadow tier (§10 shadow-sm/md/lg) は elevation 軸。dense T3 は shadow 控えめ (border separator 主)、衝突なし。
- **component 軸**: data table の row height / gap、StatusBadge の container-type 宣言は本軸が基盤値、component の内部構造は component 軸。container query 祖先の置き場所 (scroller 内側) は AppShell 軸と要調整。
- **motion 軸**: T3 motion budget ≤2 event (§10)、本軸の density と motion-density は `motion-density-budget.md` で整合済 (dense ほど motion 抑制)。
- **衝突リスク**: 既存実装 Hub `max-w-[1120px]` / Observatory `[1080px]` は mid container、list を wide 1440 にすると同一 AppShell 内で container 幅が画面間で変わる → これは **content-type 別 3 種の意図通り** (衝突でなく仕様)、ただし TopBar/Sidebar は固定幅で AppShell 軸と整合確認要。

##### checkpoint 受け入れ signal (reference 画面 `/cases` で何を見れば正しいと分かるか)
1. **band mechanical 確認**: row height 36-44px / body 13-14px / 1 viewport (1440×900) 内 element 数が Tier 3 budget (≤60) 内 / whitespace 目視 15-18% → Tier 3 Compact 一致。
2. **grid family 単一**: `/cases` 内で data table (border-sep gap 0) 以外の grid family が混在しない (Bento/card grid 不在)。
3. **subgrid 列揃え**: 行が変わっても 項目名/入力値/提案値/操作 の列左端が pixel 一致 (subgrid baseline 揃え動作)。
4. **container query 動作**: StatusBadge を sidebar 幅 (狭) と main 幅 (広) で render し、密度が自動で変わる (CQ 発火)。`container-type` 祖先が AppShell scroller の**内側** div にあり、overflow-auto 内で fallback (sv*) に退化していない。
5. **container 幅**: list が 1440px wide、文書ビューア (CaseDetail 左) に切替えると 64-72ch narrow に変わる → content-type 別 3 種が効いている。
6. **単位**: full-height 要素が `svh` (`dvh` の scroll resize jank が起きない)。
7. **off-grid 0**: spacing が `--space-*` (4px base) のみ、5px/7px/11px 等の off-grid 値・Tailwind 全 step 乱用が無い。
8. **drift 横展開可能性**: `/cases` の band/grid/container 値をそのまま `/approvals` `/proposals` 等 8 list 画面に適用して破綻しない (typology→band 固定表が機能)。

#### アイコン・視覚記号 (lucide / icon-per-concept / status glyph) `[iconography-visual-signs]` — supporting

> ⚠ **補正 (live code)**: InboxIcon は live で **/cases(label「受信トレイ」)に bind 済**、/approvals=ClipboardCheckIcon。本文が提案する「InboxIcon→/inbox」は live で不採用済 (TopBar BellIcon→/inbox)、衝突は存在しない。checkpoint = 単射の回帰防止のみ。

##### この軸が決めること / なぜ E2E UX に効くか
- 概念 → lucide glyph の **1:1 固定**、status → glyph+tone の決定的 mapping、confidence/uncertainty の glyph 表現、SoD/差戻し/再取得/エスカレーションの**衝突しない記号体系**を確定する。
- 規制業務 UI では記号の曖昧さ=誤読=誤操作=監査 finding に直結する。同一 glyph が複数概念を指す(例: `RotateCw`=再取得 と `RotateCcw`=可逆 を取り違える)と、operator の「常に根拠が見え誤操作が起きない安心」(operator Wow の第3要素) が崩れる。glyph 体系は status/tone 軸・confirmation 軸・a11y 軸すべての**前提層**なので、ここがブレると下流全画面がブレる。

##### 研究が示すこと (card / 監査 verdict を引用)
- **`a11y-default-for-enterprise-ai.md`**: 「Color-only signaling 禁則 (icon + text 併用)」「Good: green check + "Approved" text / Bad: green pill only」— enterprise AI a11y の **regulatory baseline**。status は色だけで意味を担わせてはならない。
- **`micro-interaction-inventory.md`**: success=checkmark morph、error=red border+inline message、loading=skeleton/spinner の **6 surface 標準 glyph**。状態 glyph は ad-hoc でなく inventory 固定。Icon hover は `scale 1.05 OR color shift` の 1-2 property に限定。
- **`confidence-and-uncertainty-visualization-ui.md`**: banking operator (Medium stake, Classification) の default は **Form 1 (%) + Form 2 (qualitative band ●●○) 併記**。「Color のみで a11y 不足 → Color + shape / number / label の 3 重表記」「Form 3 (star rating) を banking で使用は avoid」。confidence は dot glyph(●●○)で band を表す craft が Microsoft Copilot reference。
- **`agent-action-confirmation-ui.md`**: T4 destructive は `<Icon variant="warning" />` + 赤系、tier badge に accessible label。glyph は tier の視覚 anchor。
- **`kill-switch-and-emergency-control-ui.md`**: 「emoji (🛡↑✓) は使わない」相当 = 規制 surface の記号は controlled。reason code は controlled vocabulary。
- **`figma-mcp-asset-icon-font-handoff-contract.md`**: 「New icon package is added only because Figma showed an icon」を Reject。「Icon is recreated from screenshot/inline SVG」を Reject。**lucide(既存 library)+ Code Connect 経由 = production-safe、inline SVG 増設は禁則**。これは project SSOT (canonical-spec §5 `inline <svg> 0`) と完全一致。
- **監査 verdict (2026-05-29)**: glyph 自体は CSS feature 帯ではないが、status pill の **frosted/translucency 背後にテキスト** は「文字・データ背後に translucency 不可」verdict に抵触。status glyph は solid surface に置く。emoji/vibe-code 生成 glyph は規制 surface に入れない。

##### 選択肢と緊張 (tradeoff)
| 論点 | 選択肢 A | 選択肢 B | 緊張 |
|---|---|---|---|
| 概念-glyph cardinality | 1 概念=1 glyph 厳格 (canonical §5) | 文脈で glyph 流用 (icon 数削減) | A=学習負荷↑だが誤読↓ / B=icon 経済的だが「再取得 vs 可逆」衝突 |
| status 表現 | glyph+色+ラベルの 3 重 | 色 pill のみ (省スペース) | B は a11y card 明確違反、密度は稼ぐが規制 fail |
| confidence | Form1%+Form2 dot 併記 | % 単独 | 単独は over-confidence/anchoring bias (Kahneman card) |
| SoD 記号 | `ShieldCheckIcon` 専用固定 | 汎用 lock/person 共用 | 共用は「保護」と「権限」概念が混線 |
| 装飾 glyph | 機能 glyph のみ | sparkle/glow 装飾追加 | 装飾は AI-cliche tell、operator surface で noise |

##### 決定 (本プロダクトの方向、reference 1 画面の具体 spec)
**原則: glyph は「概念 anchor」専用。意味を色やラベルから独立して 1 glyph で運べるよう、概念-glyph を 1:1 で凍結し、status は glyph+tone+ラベルの 3 重で表す。** canonical-spec §5 の既存 map を SSOT として継承し、不足分のみ追加。reference 画面 = **承認待ち (`/approvals`) 行 + 案件詳細 reconcile セクション**:

**1. 概念-glyph 1:1 凍結表 (canonical §5 継承 + 確定値)**
| 概念 | glyph | tone 既定 | サイズ |
|---|---|---|---|
| 一致/確認済 | `CheckCircle2Icon` | success | 16px |
| 要確認 | `AlertTriangleIcon` | alert | 16px |
| 未取得 | `MinusCircleIcon` (※追加) | inset/neutral | 16px |
| エスカレーション | `ChevronsUpIcon` | error | 16px |
| 差戻し | `CornerUpLeftIcon` | alert | 16px |
| 再取得 (データ再 fetch) | `RotateCwIcon` | primary | 16px |
| 可逆/取消可 (reversal banner) | `RotateCcwIcon` | inset | 16px |
| 反映の取消 | `Undo2Icon` | alert | 16px |
| 修正/override | `PencilLineIcon` | alert | 16px |
| SoD/保護 (four-eyes) | `ShieldCheckIcon` | primary | 16px |

**2. status glyph 3 重原則 (a11y card 由来)**: 全 status は `[glyph]+[ラベル日本語]+[tone 色]`。色 pill 単独禁止。glyph は `aria-hidden`、意味は隣接ラベルが担保 (= R7 contrast gate と整合、glyph に fg-subtle 許容)。
- 一致: `<CheckCircle2Icon class=success/> 一致` / 要確認: `<AlertTriangleIcon class=alert/> 要確認` / 未取得: `<MinusCircleIcon class=inset/> 未取得`。

**3. confidence glyph (confidence card 由来)**: AI 提案行の確信度は **dot band `●●○` + qualitative ラベル (高/中/低)** を default 表示、% は drawer/詳細でのみ。star rating 禁止。dot は `text` glyph(filled circle Unicode でなく `CircleIcon`/`CircleDotIcon` 3 連、または塗り分け span)で実装、色 tone は confidence 階調と一致させるが**色だけに依存しない**(dot 数で読める)。

**4. SoD 専用固定**: four-eyes/承認分離は `ShieldCheckIcon` のみ。person/lock を SoD に流用しない(person は actor 表示、lock は読取専用に限定)。

**5. glyph 状態遷移 (micro-interaction card)**: 行 success 時は static checkmark appear (`prefers-reduced-motion` で morph 無効化)、error 時は border tone shift のみ(shake は規制 surface で抑制、motion budget T1)。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: lucide-react + Icon suffix 統一 + canonical §5 の既存 1:1 map (project SSOT で確立済、`figma-mcp-asset-icon-font-handoff-contract.md` の「既存 library 経由」reject-gate と整合)。a11y card の color+icon+text 3 重。
- **Adapt**: confidence card の Form1+Form2 を、operator 一覧は **dot band 既定 / % は詳細 drawer** に role-based progressive disclosure 化(一覧密度を守りつつ over-confidence bias 回避)。micro-interaction の success morph を motion-budget に合わせ静的化。
- **Reject**: star rating (Form 3) — banking 不適 (confidence card)。emoji glyph (🛡↑✓) — kill-switch/canonical 明示禁止。inline SVG / 新 icon package 増設 — handoff card reject-gate + canonical §5。status を色 pill 単独 — a11y card 違反。装飾 sparkle を機能 glyph に混入。
- **Defer**: uncertainty 3 layer (Aleatoric/Epistemic/Operational) の glyph 化 — confidence card でも drawer/expert 向け、mock prototype の表層には不要。確信度 calibration (Brier) glyph も同様に defer。

##### 意図的に捨てるもの + なぜ
- **uncertainty source の glyph 別化** を捨てる: confidence card 自身が「drawer で expert 向け、main surface は単一 confidence」と role-based disclosure を指示。screen-only prototype に 3 layer glyph を出すと operator surface が noise 化し密度を毀損。
- **アニメ status glyph (success morph / error shake)** を抑制: motion-density budget T1 (規制 UI は default off) と整合。誤操作防止が目的の surface で動く glyph は注意資源を奪う。
- **icon 経済性のための glyph 流用** を捨てる: icon 数は増えるが、「再取得/可逆/取消」の 3 概念衝突を避ける方が誤読コストより安い。1:1 厳格を優先。

##### 他軸との依存・整合 / 衝突
- **status/tone 軸**: glyph の tone は `lib/status-tones.ts` SSOT に従属。glyph 単独で tone を再宣言しない(canonical §4 drift b 回避)。confidence dot の色階調は status-tones に新 tone を足さず既存 success/alert/error/inset の範囲で表現 — **要調整点**: confidence 用 3 階調が既存 tone で足りるか status/tone 担当と擦り合わせ必要。
- **a11y/contrast 軸**: glyph は `aria-hidden` 前提ゆえ fg-subtle 許容 (R7 gate 例外マーカー)。意味は必ず隣接ラベルに置き、glyph に意味を独占させない。
- **motion 軸**: success/error glyph の遷移は motion budget に従属、`prefers-reduced-motion` 必須。
- **IA/navigation 軸**: nav glyph (LayoutGrid/Inbox/ClipboardCheck 等) も同 1:1 表に含め、nav と content で同概念=同 glyph を保証(例: 差戻し glyph はキューでも詳細でも `CornerUpLeftIcon`)。
- **衝突 risk**: `RotateCwIcon`(再取得) と `RotateCcwIcon`(可逆) は鏡像で視認差が小さい。並置せず、可逆は banner 文脈・再取得は行 action 文脈に**配置分離**して取り違えを防ぐ(canonical §5 注記と整合)。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かる)
1. **grep gate green**: inline `<svg>` 0 / 非 Icon-suffix import 0 / emoji 0 (canonical §8 `check-design.mjs` 既存 gate がそのまま通る)。
2. **1:1 単射**: 全画面で 1 概念が常に同 glyph(差戻し=`CornerUpLeftIcon` がキュー/詳細/通知で一致)。逆に 1 glyph が 2 概念を指す箇所が 0。
3. **status 3 重**: 全 status pill が glyph+日本語ラベル+tone を備え、色を外しても(grayscale 視認テスト)意味が glyph+ラベルで読める。
4. **confidence**: AI 提案行に `●●○`+(高/中/低) が見え、% は行に露出せず詳細でのみ出る。star rating が 0。
5. **SoD**: four-eyes 表現が `ShieldCheckIcon` のみで、person/lock が SoD 文脈に混入していない。
6. **再取得/可逆の非並置**: `RotateCw` と `RotateCcw` が同一視野に隣接しておらず、文脈(行 action vs banner)で分離されている。

(参照 ground: `confidence-and-uncertainty-visualization-ui.md` / `micro-interaction-inventory.md` / `a11y-default-for-enterprise-ai.md` / `agent-action-confirmation-ui.md` / `kill-switch-and-emergency-control-ui.md` / `figma-mcp-asset-icon-font-handoff-contract.md`、監査 2026-05-29 translucency/emoji verdict、project SSOT canonical-spec §5/§8。)

### Structure 層 — IA / 構成

#### IA・ナビゲーション・shell (route topology / nav model / 15-capability shell) `[ia-navigation-shell]` — core

> ⚠ **補正 (live code)**: live nav は **4 named group (処理/改善/監視/承認) + ハブ(ungrouped)、計 8 nav item**。本文の「3 group」「6-nav grouped」は stale SSOT (canonical §2.3 / prototype CLAUDE.md / Sidebar header comment) 由来。現行 SSOT は roadmap §1b。

##### この軸が決めること / なぜ E2E UX に効くか
15 capability の route topology・nav grouping・shell chrome を「業務 Process で思考し exception だけを triage する熟練オペレータの 1 日の動線」に最適化する骨格。これが効くのは、operator Wow (状況把握の速さ × 1 動作完了 × 常時根拠) は個別画面の完成度ではなく「画面間を context を失わず最短で巡る shell」で決まるから。15 画面は単独 nav に並べると Miller 上限を超え分類崩壊する規模で、grouping と Process scope を誤ると差戻し→staging→手順承認→設定承認 の Flywheel 動線が分断される。

##### 研究が示すこと (card / 監査 verdict を必ず引用)
- `enterprise-saas-information-architecture.md`: enterprise IA は 3 階層 (L1 workspace switcher / L2 primary nav **5-9 個で fix、10+ は分類崩壊 signal** / L3 view 内 segmented control)、master-detail を default、URL share 必要 (casework/audit) は detail page、command palette を top 70% feature に expose。**15 capability を flat に L2 へ並べるのは即 anti-pattern**。
- `operator-cockpit-multi-agent-oversight-ui.md`: oversight 面は **3 viewport (aggregate KPI strip / 状態 sort 済 per-agent grid / drill-down detail)**、drill-down は **tab で隠さず 1 click で context preserve**、intervention は controlled 4 verb、bulk は別 confirmation。Observatory/agents の shell topology に直結。
- `multi-agent-oversight-journey-2026.md`: 監督は **全件 review を放棄し exception-only triage**。shell の主仕事は step 最適化でなく**注意予算の保護** — interrupt/override を常時 1 動作到達 (EU AI Act Art.14(4)(e) 法要件)、escalation rate を health signal 化、silent green wall を能動 probe で破る。
- `command-palette-and-power-user-action-ui.md`: Cmd+K は 4 layer (navigate / action / AI prompt / recent-pinned)、scope prefix (`>` `/` `@` `#`)、**regulator-touchable action は palette から直実行不可で 2-person modal に escalate**。本プロダクトの SoD と整合。
- `progressive-disclosure-and-density.md` / `dashboard-density-tier-bands-ui.md`: 熟練オペレータ向けは **Tier 3 operator console (row 24-32px / 12-14pt / whitespace 15-20%)** が floor、1 dashboard 1 tier。`trading-terminal-density-ui.md` の Tier 4 (resizable multi-panel) は本プロダクトには過剰。
- 監査 (2026-05-29): View Transitions (same-document SPA) は **NOW (3 engine、progressive enhancement 込み)** で route 遷移演出に採用可。Command palette を支える Popover API も NOW。**translucency on text / Liquid Glass は Watch-only/後退** で shell chrome に不使用。CSS Carousels は **Chrome-only で tab 用途禁止** → L3 の view 切替に scroll-marker carousel を使わず segmented control を使う。

##### 選択肢と緊張 (tradeoff)
| 緊張軸 | A | B | 採否 |
|---|---|---|---|
| 第一組織軸 | Process-first (現状 Global Process Selector) | 機能-first (15 nav) | **Process selector を L1 維持 + 機能を L2 (現状継続)**。15 画面を機能 nav で flat 化すると 5-9 rule 破綻 |
| L2 nav 数 | 15 全部 nav | **役割でグループ化し 5-9 に圧縮** | B。現状の 3 group (処理/改善/監視) を維持し業務責任者面を吸収 |
| oversight 動線 | Observatory 単独画面 | cockpit 3 viewport に escalations/inbox を接続 | **接続**。exception triage を shell 横断動線として張る |
| 遷移演出 | 無し | SPA View Transition | **採用 (NOW verdict)**。context 連続性が operator の状況把握速度に効く |

##### 決定 (本プロダクトの方向、reference 1 画面に落とせる spec)
**3 階層 shell を確定する。**

- **L1 chrome (TopBar, 高さ 56px)**: 左 = `[業務: 法人住所変更 ▾]` Process selector (全画面で URL `?process=` 保持、選択肢 = 各 Process + 全業務)。中央 = Cmd+K command palette trigger (placeholder「案件・操作・横断検索…」)。右 = 通知ベル (`/inbox` 未読 badge) + PrototypeModeLabel「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」常時表示 + user。
- **L2 sidebar (3 group / 5-9 visible)**: `◆ ハブ /` → **処理**: 案件 `/cases`・承認待ち `/approvals`・手動起票 `/cases/new`(案件 nav 下の sub-action として配置、独立 nav にしない) → **改善**: 提案 `/proposals`・Agent `/agents`・設定承認 `/config-approvals` → **監視**: モニタリング `/observatory`・例外 escalation `/escalations`・横断検索 `/search`。**業務責任者 hub `/business-approver` は role landing として L1 の role 切替か Hub 内 entry に置き、L2 の 8 nav visible を維持** (8 ≤ 9 rule 充足)。detail 3 画面 (`/cases/:id` `/proposals/:id` `/agents/:id`) は master row click から遷移し sidebar 非表示で **URL share 可 (audit casework 要件)**。
- **L3 (画面内)**: master 画面は segmented control で view 切替 (Carousel禁止)。Observatory は cockpit 3 viewport (KPI strip 上 / 状態 sort grid 左 / drill-down 右、**右 detail は tab で隠さず常時並列**)。
- **横断 exception 動線**: escalation/sendback は通知ベル → `/inbox` → 該当 detail へ 1 動作到達。**「業務に任せて止める」= 差戻し/停止は Cmd+K と detail footer の両方から常時 1 click 到達** (Art.14 interrupt 要件を shell レベルで保証)。
- **遷移**: route 間は SPA View Transition で master↔detail を morph、`prefers-reduced-motion` で静的 fallback (監査 NOW verdict + motion budget Tier 3)。

**reference 1 画面に落とすなら Observatory (`/observatory`)**: TopBar に Process selector + Cmd+K + PrototypeModeLabel、L2 sidebar に 3-group 8-nav (監視 group highlight)、本体に KPI strip → Agent 状態 sort grid → 右 drill-down detail (差戻し/停止ボタンが隅配置・常時可視) が同時に見えれば shell が正しい。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: enterprise IA 3 階層 + 5-9 nav rule (`enterprise-saas-information-architecture.md`)。command palette 4 layer + regulator-touchable escalation (`command-palette-and-power-user-action-ui.md`)。oversight 3 viewport + drill-down 1 click (`operator-cockpit...`)。SPA View Transition (監査 NOW)。interrupt/override 常時 1 動作 (`multi-agent-oversight-journey-2026.md` / Art.14)。
- **Adapt**: Process-first 第一軸は現状継続だが**業務責任者 3 画面を独立 nav で増やさず role landing + group 吸収**して 5-9 を死守。density は Tier 3 operator console を base に採用 (`dashboard-density-tier-bands-ui.md`)、Tier 4 trading 密度は不採用。
- **Reject**: 15 画面 flat nav (5-9 rule 破綻)。CSS Carousel での tab/view 切替 (Chrome-only + a11y、監査 verdict)。translucency on text / Liquid Glass shell chrome (Watch-only/後退)。Card grid を master default (density loss)。
- **Defer**: workspace customization (drag-drop nav 並べ替え)・multi-monitor panel pop-out (`trading-terminal-density-ui.md`) は本 prototype scope 外、現 operator population で需要未検証。smart default (使用頻度学習 toolbar pin) も backend 不在で defer。

##### 意図的に捨てるもの (全部盛りしない判断) + なぜ
- **15 個別 nav の網羅露出**を捨てる → 5-9 rule。sub-action (手動起票) と role landing (業務責任者) と low-frequency 監督面 (escalation/search) を group 内 sub または entry 化して visible nav を 8 に抑える。
- **trading terminal の resizable multi-panel workspace** を捨てる → 熟練でも back-office は trading desk ではない。1 dashboard 1 tier (Tier 3) で十分、panel 自由配置は誤操作 risk と保守 cost に見合わない。
- **派手な route 演出の全画面適用**を捨てる → View Transition は master↔detail の context 連続性に限定。Tier 3 motion budget を超える chrome アニメは zone-out を誘発 (`motion-density-budget` / vigilance)。

##### 他軸との依存・整合 / 衝突
- **detail/decision 軸 (C 型 contract)**: detail は sidebar 非表示 + URL share。footer の単一決定面に「差戻し/停止」を置き、shell の Cmd+K と二重に interrupt 到達点を確保 — **両軸で interrupt 配置を二重化する合意が必要**。
- **oversight/exception 軸**: escalation rate を Observatory KPI strip に出すか、shell 横断の通知優先度に出すかで衝突しうる → KPI strip (集約) と通知ベル (個別) の役割分離で解決。
- **visual/token 軸**: PrototypeModeLabel・Process selector・通知 badge は継承 token (lucide / chip taxonomy / status-tones SSOT) を使う。translucency 不使用は visual 軸と整合済。
- **search 軸 (`/search`)**: Cmd+K の `#` records scope と `/search` 全画面が機能重複しうる → Cmd+K は jump/dispatch、`/search` は faceted な腰を据えた探索、と役割分離を確定する必要。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かるか)
1. L2 sidebar の visible nav が **8 個 (≤9)**、3 group (処理/改善/監視) に正しく属し、手動起票/業務責任者が独立 nav に昇格していない。
2. TopBar に Process selector + Cmd+K trigger + PrototypeModeLabel が常時可視、Process 切替で全 nav が scoped される。
3. Cmd+K で navigate/action/AI/recent の 4 group が出て、停止系 action に warning + 2-person modal escalation が掛かる (直実行不可)。
4. Observatory が 3 viewport (KPI strip / 状態 sort grid / 右 drill-down 常時並列、tab 非依存)、差戻し/停止が隅に常時可視で 1 click 到達。
5. master row click → detail が View Transition で morph、detail は URL 共有可・sidebar 非表示、`prefers-reduced-motion` で静的退化。
6. shell chrome に translucency on text / Chrome-only Carousel が**無い**こと (監査 verdict 遵守の negative check)。

#### 情報密度・階層・スキャン (density tier / scan pattern / JP density) `[information-density-hierarchy]` — core

##### この軸が決めること / なぜ E2E UX に効くか
画面ごとの density tier 割当 (T1〜T4)、各画面が誘発すべき scan pattern、JP 助詞 prefix 由来の bypassing 抑制、削減してはいけない高 stakes 文脈の境界線を確定する。狙う "operator Wow" の核 = 「圧倒的状況把握の速さ」は、tier と scan pattern が時間目標 (T3=30s で N row scan+decide) と一致して初めて成立する。tier mismatch は `dashboard-density-tier-bands-ui.md` が「最頻 fail mode / UI critique primary check」と明言する単一最大リスクで、ここを外すと他軸 (color/motion/layout) を磨いても状況把握速度が出ない。

##### 研究が示すこと (card / 監査 verdict 引用)
- `dashboard-density-tier-bands-ui.md`: tier は element count + min height + typography pt + whitespace% で **mechanical** に決まる (T3 Operator = ≤60 elem / 24-32px row / 12-14pt / whitespace 15-20% / 30s 理解)。**1 dashboard 1 tier**、tier mixed は禁則。drill-down は tier-respecting (T1→T3 jump は context switch loss)。
- `scan-pattern-induced-by-layout.md`: scan pattern は user でなく **layout が induce**。T3 Operator = spotted (status badge) + marking (highlight)、T4 Trader = spotted (numerals) + ARIA grid。**bypassing (行頭同一 token 25%+) は scan path 切断の anti-pattern、JP 助詞 prefix で頻発** → 「object: action」形式に再構成。同 card が backoffice-ai-v2 旧 showcase を M11 audit し、Cockpit の weak layer-cake と Audit Trail の ARIA grid 未実装を既に検出済。
- `when-more-text-is-correct.md`: 削減は default 反射でなく decision。**7 文脈で verbose が正解** (audit log / consent / AI claim citation / high-stakes error / 差戻し reason / complex onboarding / editor)。3-axis gate = reading mode / compliance gate / reversibility。
- `state-text-density-alignment.md`: empty/error/loading は主画面と **同 tier** を保つ。filtered-empty = ≤15 字 + Reset (illustration 禁止)、error は主画面より**短く**、loading = 0 text + skeleton。旧 showcase で 5/6 pattern が empty state 未実装。
- `progressive-disclosure-and-density.md`: PD1 inline / PD3 drawer / PD5 cmd+K / PD6 shortcut。density 残したまま reading load を下げる手段 = hierarchy 強化 + PD 投入 (削除より優先)。
- 監査 verdict (2026-05-29): translucency on text は iOS26.1 後退 + NN/g 批判で**規制 surface 不可**、frosted glass は装飾層のみ。density tier の評価軸 (Tufte/Few) は監査対象外で stable、そのまま採用可。

##### 選択肢と緊張 (tradeoff)
| 緊張 | A | B | 評価 |
|---|---|---|---|
| 全画面 tier | 全画面 T3 統一 (Datadog 風一貫) | 画面役割別に T2/T3/T4 混在 | B。Hub/business-approver は判断画面 (T2)、case queue/proposals は scan 画面 (T3)、audit ledger は forensic (T4)。統一は status把握 hub を過密化 |
| 削減 vs verbose | 一律削減で軽量化 | 7 文脈は verbose 維持 | B 必須。差戻し reason・citation・audit ledger は不変条項 (監査台帳の存在) と直結、削ると Flywheel input を壊す |
| JP bypassing | 助詞自然文で親和性 | object:action 形式で scan path 確保 | 後者。CJK 1.5-2x 視覚密度 + 助詞 prefix で T3 row scan が最も劣化する箇所 |

##### 決定 (本プロダクトの方向 + reference 1 画面 spec)
**画面別 tier 割当 (1 画面 1 tier、固定):**
- **T4 Trader-grade**: `/observatory` 監査台帳・`/search` 横断検索結果 — ≤200 elem 上限内・row 32px・13px・tabular-nums・mono は ID/timestamp のみ・whitespace 8-12% (CJK のため audit card の 5-10% より緩める)。ARIA grid + 単一 tab-stop + arrow nav 必須。
- **T3 Operator (主力)**: `/cases`・`/approvals`・`/proposals`・`/escalations`・`/config-approvals`・`/inbox` — row 28-32px・本文 13-14px・status は **spotted (state pill + actor band + freshness dot)**・filter result は **marking**・30s で N row scan+decide。
- **T2 Manager (判断 hub)**: Hub・`/business-approver`・`/cases/:id`・`/proposals/:id`・`/agents/:id` — KPI strip (spotted) + section heading **layer-cake** (h2/h3 weight 差 + 上 margin 1.5x)・whitespace 25-30%・15s で section 別 status。
- **T1 は使わない** (consumer spectacle 回避、不変条項の operator 読者と不整合)。

**reference 1 画面 = `/approvals` (承認待ちキュー、T3) の具体 spec:**
1. 上部 filter bar (24px) → 直下に件数 + status 内訳 chip (spotted)。
2. table: `grid-cols-[44px_案件種別_金額(tabular-nums,右)_起票者_SoD状態pill_経過時間_操作]`、row 28px、border-b、12-13px。
3. **scan pattern = spotted**: SoD 状態は色 dot + 形 (pill) + ラベルの三重符号 (色覚多様性対応)、金額は tabular-nums 右寄せで縦に揃え micro-saccade 可能に。
4. **bypassing 抑止**: 操作列を「承認 / 差戻し / 保留」の object-first ラベル、行頭は案件種別 (varied)。`〜について承認` 形式は禁止。
5. row hover で PD3 drawer (案件詳細 + 根拠 + 監査 trail) — drill は T3→T3 維持 (T2 hub へ飛ばさない)。
6. **states**: filtered-empty = 「該当 0 件」+ Reset (≤15 字, illustration 禁止)、loading = 5 row skeleton (0 text)、error = observable cause + Retry (主画面より短く)。
7. **verbose 維持点**: 差戻し時の reason は min 10 字 gate + 過去 reason suggest (Flywheel input、削減禁止)。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: `dashboard-density-tier-bands-ui.md` の mechanical tier rubric (element/height/pt/whitespace)、`scan-pattern` の Tier×Pattern matrix + bypassing mechanical 判定 (先頭 token 25%+)、`state-text-density-alignment` の state 別 tier 維持、`when-more-text-is-correct` の 7 文脈 + 3-axis gate。すべて production-safe verdict。
- **Adapt**: T4 whitespace を 5-10% → **8-12%** に緩和 (JP CJK 1.5-2x 視覚密度 + body leading 1.7、`jp-display-typography-premium.md` 準拠)。mono は数値全般でなく **ID/timestamp 限定** (JP 混在で mono 本文は字形破綻)。tracking 0〜+1% (EN tight は JP 潰れ)。
- **Reject**: T1 Executive tier 採用 (consumer spectacle、operator 読者と不整合)、translucency on dense text (監査 verdict)、empty state illustration (tier 違反)、5 軸の全 surface 同時適用 (痛点 1-2 軸に絞る = framework の指示)。
- **Defer**: `progressive-disclosure-and-density` の Expert mode toggle / smart default / customizable layout (運用データ前提、screen-only prototype では premature)。L3 user test plan (規制本番化フェーズまで defer)。AI summary inline の tier 影響 (未確認点、directional)。

##### 意図的に捨てるもの (全部盛りしない) + なぜ
- **density toggle / Comfortable-Compact 切替**: prototype は固定 tier で「正しい状況把握速度」を示すのが目的。toggle は運用 personalization 課題で、screen-only では検証不能 + 認知負荷増。
- **T4 を主力画面に拡大**: Bloomberg 風全画面 dense は trader 用、本プロダクトの判断 hub (T2) を過密化し誤操作不安を増やす ("誤操作が起きない安心" を毀損)。T4 は audit/search の 2 画面に限定。
- **bypassing 検出の全列適用**: mechanical 判定は scan が起きる主列 (操作列・status 列) のみ。全列に適用すると過剰最適化。
- **5 軸 framework の網羅 audit**: text-density framework 自身が「痛点 1-2 軸」を指示。本プロダクトの痛点は C軸 (scan/hierarchy) と E軸 (JP) に集中するため、A/B/D は per-screen 局所対応のみ。

##### 他軸との依存・整合 / 衝突
- **layout/IA 軸**: tier 割当は route 役割定義に依存 (どの画面が scan か判断か)。IA 軸の route 構造と tier map を 1 対 1 で contract 化する必要 — 衝突点は「Hub を dashboard と見るか入口と見るか」で T2/T3 が分岐。
- **color/component 軸**: spotted induce は status pill の色+形+ラベル三重符号を要求 → color 軸の semantic token (success/alert/error + soft) と整合必須。filter result marking は highlight token を要求。
- **motion 軸**: T3-T4 dense surface は `motion-density-budget` で motion event 上限が低い。spotted の live update flicker は T4 のみ許容、T2-T3 では誤操作不安を避け抑制 — motion 軸と budget を共有。
- **state/accessibility 軸**: T4 ARIA grid の単一 tab-stop は a11y 軸と共同実装。state-density は state 軸 (empty/error/loading machine) と直交だが tier は本軸が SSOT。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かるか)
- `/approvals` で **5 秒以内に承認待ち件数と SoD 警告のある案件が視認できる** (spotted 成立)。
- 金額列が tabular-nums で縦に揃い、視線が縦 micro-saccade で走る (T4-grade 整列が T3 にも効く)。
- 操作列ラベルが行ごとに異なる先頭 token (案件種別先頭)、**「〜について承認」連続が無い** (bypassing 0)。
- filter 0 件で **illustration が出ず ≤15 字 + Reset のみ** (state tier 維持)。
- 差戻し reason 欄が**残っており短縮されていない** (verbose 維持点が削られていない)。
- mechanical: 1 viewport の element count ≤60、font size 種類数 ≤5・最大差 <14px (tier mixed suspect の閾値内)、row height 28-32px。
- `/observatory` で audit ledger の reason 列が ellipsis truncate されず full text 取得可能 (監査台帳の不変条項 + 7 文脈②③)。

#### データテーブル・キュー (premium tier: density / sort / filter / select / inline-edit / virtualization / hit-target) `[data-table-queue]` — core

> ⚠ **補正 (live code)**: checkpoint の「radius 8px 超皆無」は live と矛盾 (card=12px)。「control/chip は 8px 以下、card=12px は意図」と読み替え。

##### この軸が決めること / なぜ E2E UX に効くか
案件キュー(/cases)・承認待ち(/approvals)・提案一覧(/proposals) の table を、operator が「30 秒で全 row を scan → 1 動作で triage/一括処理 → 誤操作なく承認」できる主力 surface に確定する。具体的には density tier・sort 軸・filter モデル・multi-select と bulk action の SoD 安全性・inline 展開 (peek) vs detail 遷移・virtualization 採否・hit-target を決める。3 画面とも「Flywheel の入口」(差戻し判断・手順承認・設定承認の起点) であり、ここの scan 速度と一括処理の安全性が pipeline 全体の throughput を律速する。既に共通 `DataTable` (582 行、density/sort/filter/selection/expand/pagination 実装済、sticky-header/inline-edit/virtualization は deferred) が存在するため、本軸の決定は「機能追加」ではなく「operator 向けに何を採用し何を捨てるか」の curation。

##### 研究が示すこと (card / 監査 verdict を引用)
- `data-table-premium-tier.md`: premium table = 3-tier density (Compact 32 / Default 40 / Comfortable 48px) toggleable + column-header sort (3-state, `aria-sort` 必須) + global+per-column filter の 2 軸 + checkbox selection と sticky bulk toolbar + inline-edit は double-click/icon の **explicit** mode (silent discard は anti-pattern) + **200+ row で virtualization 必須**。row-click navigate と checkbox の二重 navigate は click conflict、明確 separation を要求。
- `dashboard-density-tier-bands-ui.md`: Tier 3 Operator console = 24-32px row / 12-14px body / element ≤60 / time-to-comprehend ≤30s。本 3 画面は Tier 3 が正。Tier 4 (Bloomberg 16-20px mono) は本プロダクトの「熟練だが規制下で誤操作不可」な読者には密すぎる。
- `trading-terminal-density-ui.md`: keyboard primary + zero motion + "全 cell animation = noise, changes だけ subtle flash"。triage 速度は keyboard で稼ぐべきだが、Bloomberg 級の F-key 化は規制 back-office には過剰。
- `scan-pattern-induced-by-layout.md` (NN/g primary): Tier 3 table の正しい scan は **spotted (status badge/数値) + marking (要確認 highlight)**。**bypassing 警告 — JP 助詞 prefix の行頭重複 (「〜について承認」「〜について差戻」) が scan path を切断**、「object: action」形式に再構成せよ。先頭 token が 25%+ row で重複したら flag。
- `search-and-filter-premium-tier.md`: table-scoped は toolbar filter (faceted chip) + saved view。NL/semantic filter は exact match 上位の hybrid のみ。
- 2026-05-29 監査 verdict: virtualization/table 系は監査対象外 (platform CSS card のみ) ゆえ table 設計は **NOW 帯の安全 primitive (container queries Widely / OKLCH Widely / `:has()` Newly) で組む**。`field-sizing` は Watch-only ゆえ inline-edit の auto-resize input に依存しない。translucency は文字・データ背後で禁止 (Liquid Glass 後退 + NN/g 批判) — status badge / selected row の塗りは **solid fill** で。

##### 選択肢と緊張 (tradeoff)
| 緊張 | A 案 | B 案 | 本質 |
|---|---|---|---|
| density default | Compact 32px (情報量最大) | Default 40px (誤クリック余裕) | 熟練 operator は密を好むが、規制下の承認誤操作 risk が hit-target を要求 |
| triage の主操作 | inline 展開 peek (modal なし) | detail page 遷移 | 一覧で判断完結 (速い) vs 全根拠を見て承認 (安全) |
| 一括処理 | multi-select → bulk 承認 | 1 件ずつ承認のみ | throughput vs SoD/誤操作。承認待ちは特に危険 |
| filter | faceted chip (状態/担当) | NL semantic | 16 row では NL は over-engineering |
| virtualization | 入れる | deferred 維持 | mock 16 row では純粋に不要、入れると sticky-header と競合 |

##### 決定 (reference 1 画面 = 承認待ち /approvals に落とす具体 spec)
**Tier 3 Operator table を 3 画面共通の `DataTable` で確定。density default = Compact (32px row / 13px body / tabular-nums)、toggle で Default(40)/Comfortable(48)。** hit-target は row 全体 (32px でも row click 領域は full-width、checkbox は別 column で min 36px touch box を padding で確保) — density と hit-target を分離する。

承認待ち画面の確定 spec:
- **列**: `[checkbox] 案件ID(mono 13px) / 種別バッジ / 要約(object:action 形式, 助詞 prefix 禁止) / 金額(tabular-nums 右寄せ) / 入力者 / 経過(滞留, 古い順 sort 可) / SoD状態 / [→]`。scan は spotted (種別+SoD badge) + marking (要確認 row を `alert-soft` solid 塗り)。
- **sort**: column-header 3-state, default = 経過 desc (滞留長い=triage 優先を上位)。`aria-sort` 明示。要確認 row は pinTop で sort 後も先頭群固定。
- **filter**: faceted FilterChip 2 軸 (状態 / 入力者)、候補 2 未満の filter は非表示 (退化 UI 回避)。NL filter は採用しない。
- **multi-select + bulk action (SoD-safe)**: checkbox 選択 >0 で sticky bulk toolbar 出現。ただし **bulk は「承認」を直接実行させない**。bulk action = 「まとめて確認 → 一覧で各件の SoD/根拠を展開 peek → 確認 dialog で件数と差分を明示 → 承認」の 2 段。SoD 違反 (自分が入力者の案件) は checkbox を disabled + tooltip で選択不可にし、bulk から構造的に除外。bulk 実行後は監査台帳に件数・対象 ID を記録 (mock)。
- **inline peek**: row 展開で根拠 peek (業務/状態/担当/要確認 flag/裁定依頼)。承認の最終確定は detail 遷移ではなく peek 内の primary action で完結可、ただし根拠未読を防ぐため peek を開かず承認 button は出さない (展開がゲート)。
- **motion**: zero motion default。row 状態変化のみ 200ms subtle bg flash。`prefers-reduced-motion` で flash も無効。
- **virtualization / sticky header / inline-edit**: 採用しない (後述)。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: 3-tier density toggle (default=Compact)、column-header 3-state sort + `aria-sort`、faceted FilterChip 2 軸、checkbox multi-select + sticky bulk toolbar、inline 展開 peek、spotted+marking scan、tabular-nums、solid-fill badge、zero-motion+subtle flash。
- **Adapt**: trading-terminal の keyboard primary → **F-key 化はせず**、J/K row 移動・X 選択・Enter で peek・/ で filter focus の軽量 shortcut のみ (規制 back-office 向けに縮約)。bulk action → **直接実行せず 2 段承認 + SoD 除外**に adapt (card の bulk toolbar をそのまま規制 surface に入れない)。inline-edit → 一覧では reject、detail/staging 側に限定。
- **Reject**: NL/semantic filter (16 row で over-engineering、規制下で query 誤訳 risk)、translucency 塗り (監査 verdict)、Tier 4 Bloomberg density (読者に密すぎ・誤操作 risk)、row-click と checkbox の二重 navigate、Apple Bento 的 spectacle。
- **Defer**: virtualization (200+ row 到達時に発火、現状 mock 16 row で不要、入れると sticky-header と競合)、sticky header (height-constrained scroller 化が前提条件、まず AppShell scroller 整備後)、column resize/reorder/pin (operator 価値が低く保守 cost が勝る)、saved view (運用データ蓄積後)。

##### 意図的に捨てるもの (全部盛りしない判断) + なぜ
- **virtualization を今は入れない** — mock 16 row では純粋に死蔵、`useIntersectionVisible`/sticky-header と競合し tech debt 化。200 row gate を `DataTable` に閾値コメントで残し、到達時のみ TanStack Virtual で発火。
- **bulk 直接承認を捨てる** — throughput より「人のコントロールを渡さない」不変条項が上位。一括は「確認の一括化」までに留め、承認は根拠展開ゲート経由。
- **NL filter / column resize / multi-monitor workspace / saved view を捨てる** — trading terminal card 由来だが、本読者の triage には faceted chip + sort + peek で十分、追加 surface は scan を遅くする。
- **Comfortable を default にしない** — 熟練読者は密度を価値とする (dashboard-density Tier 3)。余白過多を premium と誤認する anti-pattern を避ける。

##### 他軸との依存・整合 / 衝突
- **status/badge 軸**: SoD state・案件 status の tone は canonical-design-spec の resolver (受付済=inset / 確認待ち=primary / 差戻し=alert / 承認待ち=slate solid / 反映済=success) に従う。table 側で独自 tone を作らない。**衝突注意**: badge は solid fill 指定 (translucency 禁止) を badge 軸と同期させること。
- **modal/drawer 軸**: bulk 確認 dialog と detail 遷移の境界 (peek=一覧内 / 確定=dialog or detail) を modal-vs-drawer 決定と整合。peek は drawer ではなく row inline 展開で確定済。
- **motion 軸**: zero-motion default + 状態 flash のみは motion-density-budget の Tier 3 (≤2 event) と整合。
- **keyboard/a11y 軸**: 軽量 shortcut (J/K/X/Enter//) と Tier 4 ARIA grid (roving tabindex) は別物。本軸は Tier 3 ゆえ通常の tab + `aria-sort` + checkbox `aria-label` で足り、ARIA grid は採用しない — keyboard 軸が grid を要求したら本軸の density と衝突するので調停が必要。
- **scan/density 軸**: 要約列の JP 助詞 prefix bypassing 検出 (先頭 token 25%+ 重複 flag) を copy 軸と共有。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かる)
1. 承認待ち画面が default Compact (32px row / 13px) で開き、16 row が 1 viewport に scroll なしで収まる (Tier 3 達成)。
2. column header click で 3-state sort が効き、矢印 + `aria-sort` が DOM に出る。default が経過 desc。
3. 要確認 row が solid `alert-soft` 塗りで marking され、pinTop で sort 後も先頭群に残る。
4. checkbox 複数選択で sticky bulk toolbar が出るが、**自分が入力者の row は checkbox disabled (SoD 除外)**、bulk「承認」は直接実行せず確認 dialog (件数+各件 SoD 表示) を経由する。
5. row 展開で peek が出て、**peek を開く前は承認 primary action が見えない** (根拠未読防止ゲート)。
6. 要約列の行頭 token が 25%+ 重複しない (「object: action」形式、助詞 prefix なし)。
7. status badge / selected row が solid fill で、文字・金額の背後に translucency が一切ない (監査 verdict 遵守)。
8. motion は状態変化の 200ms flash のみ、`prefers-reduced-motion` で無効化される。
9. virtualization/sticky-header/inline-edit が一覧に存在しない (deferred どおり、tech debt なし)。

参照ファイル: `/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/src/components/shared/DataTable.tsx` (582 行, 既存 premium 基盤), `/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/src/pages/Approvals.tsx` (reference 画面), `/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/src/pages/Cases.tsx`, `/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/src/pages/Proposals.tsx`, `/Users/shinjifujiwara/code/active/backoffice-ai-v2/handoff-redesign/00-shared/canonical-design-spec.md` (badge tone resolver SSOT)。

#### Hub・概況 composition (KPI hierarchy / 今日 framing / oversight 入口) `[hub-overview-composition]` — core

##### この軸が決めること / なぜ E2E UX に効くか
Hub と Observatory の概況構成 — operator が shift 開始時に「今日どこに注意を割くか」を 1 秒で決め、各 oversight surface (承認待ち / 提案 / Agent / escalation) へ最短経路で入る起点。E2E UX で効く理由: 15 capability の注意配分はすべてこの 2 画面の framing から流れる。ここで「全件 review を放棄し exception-only triage に振る」journey を構造化しないと (multi-agent-oversight-journey-2026.md)、下流の全画面が rubber-stamp 化 / vigilance decrement の温床になる。Hub = 1 人 operator の daily attention router、Observatory = fleet 健康度の常時監視面、という役割分離をここで確定する。

##### 研究が示すこと (card ファイル名 / 監査 verdict を必ず引用)
- **3-tier KPI 階層**: `executive-dashboard-layout-pattern.md` — Headline tier 3-5 KPI (各 = single number + delta + sparkline、actionable のみ、vanity 禁則) / Drill-down tier / Diagnostic tier。Time-window は global 1 control、chart 別 toggle 禁則。color は warning/danger/success/neutral の semantic のみ、装飾色禁則。
- **fleet 概況 = aggregate KPI 5 指標**: `operator-cockpit-multi-agent-oversight-ui.md` — Throughput / Queue depth / Error rate / Pending escalation / Avg latency を top strip で「fleet 健康度を 1 sec で読む」。status icon は color のみ不可、icon shape + color 両方 (a11y)。auto-sort (alarm→top)、manual sort は option。
- **「今日やること」= exception-only triage**: `multi-agent-oversight-journey-2026.md` — 5-phase journey の Phase 1 (Shift Start: 注意 baseline 設定、引き継ぎ未消化 exception を先に triage) と Phase 3-4。attention-budget 保護 7 ルール。Silent green wall (全 green で監視停止) が Anti-Pattern 1。escalation rate を system health signal に。
- **silent green への能動 counter**: `agent-oversight-cognitive-load-vigilance-flow-2026.md` — 高・安定信頼性で automation complacency が最大化 (Merritt/Parasuraman 査読、production-safe)。受動監視を active surfacing (periodic probe / sample / status feed) で能動化。capacity ceiling を per-person で置く。
- **liveness signal**: `real-time-presence-and-live-data-ui.md` (Evidence Strength = **directional**) — L1 Number ticker / L2 Status pulse / L4 Activity feed。**Fake live (data 非連動 random animate) は Tier 1 cliche 隣接で信用棄損、必ず real(mock) data tied**。
- **platform 監査 verdict** (`2026-05-29-frontend-ui-trends`): translucency on text は Apple iOS26.1 後退 + NN/g 批判で Watch-only。motion は prefers-reduced-motion mandatory。Chrome-only (CSS Carousels / 屈折 glass) は base 不可。

##### 選択肢と緊張 (tradeoff)
| 軸 | 選択 A | 選択 B | 緊張 |
|---|---|---|---|
| Hub と Observatory の役割 | 統合 (1 画面に全部) | 分離 (Hub=今日の router / Observatory=fleet 監視) | 統合は密度崩壊、分離は遷移 1 段増 |
| Hub headline KPI | fleet 健康度 5 指標 (cockpit) | 個人の今日タスク件数 | cockpit は exec 視点、operator は「自分が今何をすべきか」が要る |
| liveness | static (実装安全) | live ticker/pulse (operator Wow) | fake live は信用棄損、real(mock)-tied は state 設計コスト |
| complacency 対策 | 表示のみ (green wall) | active surfacing 組込 | green wall は楽だが vigilance decrement を必然化 |

中核緊張: `executive-dashboard` の headline KPI (fleet 健康度) と operator journey の「今日やること」(個人タスク) は**別物**。両者を混ぜると Hub が exec dashboard 化し、operator の 1 動作判断が遅れる。

##### 決定 (本プロダクトの方向、reference 1 画面に落とせる具体 spec まで)
**Hub と Observatory を役割分離し、Hub を「operator の今日 router」、Observatory を「fleet 健康度監視面」に確定する。**

**Hub (`/`) reference spec** — 3 zone 縦構成:
- **Zone 1 (top strip, ~80px) = 「今日の注意 baseline」5 KPI bar** (cockpit の aggregate 5 を operator 視点に翻訳): ①承認待ち件数 (queue depth) ②要対応差戻し ③Agent 警告 (warning+alarm 数) ④未処理 escalation ⑤手順承認待ち。各 = single number + delta (前 shift 比 ↑/↓) + status icon (shape+color)。auto-sort せず固定順、threshold 色 (success/alert/error semantic、装飾色なし)。`mock-kpi.ts` SSOT 分母 980 と整合。すべて actionable (vanity 禁則、累積処理数を headline に置かない)。
- **Zone 2 = 「今すぐやること」exception triage list** (journey Phase 1+3): 高優先 exception を 1 件ずつ context 付きカード ("何の案件 / なぜ浮上 / 次の選択肢" — Context-starved escalation を回避) で 5-7 件。各カードは行クリックで該当 surface (承認待ち/escalation/提案) へ直行。空なら EmptyState「未処理 exception なし」+ active probe 誘導 (sample 監査への入口、silent green wall 回避)。
- **Zone 3 = oversight 入口 grid** (4-6 tile): 承認待ち / AI 提案レビュー / Agent 設定 / 監視 / 横断検索 への入口、各 tile に件数 badge + 直近 delta。Diagnostic tier 相当は「監視へ」で Observatory に委譲 (link-out でなく Observatory が drill 受け皿)。

**Observatory (`/observatory`) reference spec** — cockpit 3-viewport を本プロダクトに適合:
- V1 top strip = aggregate 5 KPI (上記と同 SSOT、Hub と同値を共有)。
- V2 left = per-Agent card grid (現 Agent 数 = Tier 1-2、60-120px rich card、status icon shape+color / 4 mini-metric)。auto-sort alarm→warning→pending→healthy。
- V3 right = 選択 Agent drill-down (action history timeline + 直近 error)。**ただし intervention (kill/re-route/throttle) は本 prototype の不変条項「propose のみ・実 execute なし」に従い、操作ボタンは escalation/監視ルートへの導線に留め、実行系は出さない**。

**liveness**: Zone 1 KPI に L1 number ticker (200-400ms ease-out、tabular-nums) + Zone 2 新着 exception に L4 activity feed (slide-in 200-300ms、`aria-live="polite"`)。**すべて in-memory mock state 駆動 = real-tied** (fake random 禁止)。motion は T1≤5 event、`prefers-reduced-motion` で全停止 (canonical-spec §10)。translucency は文字・データ背後に**使わない** (監査 verdict)。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: `executive-dashboard` の 3-tier + 「headline 3-5 actionable KPI + delta + sparkline」+ global time-window 1 control + semantic color。理由: KPI hierarchy の標準で operator の 1 秒把握に直結。`operator-cockpit` の aggregate 5 KPI + auto-sort + status icon shape+color。理由: fleet 健康度の確立パターン。
- **Adapt**: cockpit の「fleet 健康度 5 KPI」を Hub では**operator 個人視点に翻訳**(throughput→承認待ち件数 等)、Observatory では原型のまま fleet 視点で使用。journey の exception-triage を Hub Zone 2 に落とす。real-time primitive (L1/L4) を mock-state 駆動に Adapt。理由: exec 視点と operator 視点を画面役割で分ける。
- **Reject**: L5 data-tied shader / L3 multi-cursor (collaborative product でない、規制 surface に spectacle 不適)。fake live ticker。translucency on text/data (監査 verdict)。Chrome-only CSS Carousels を概況に使う。装飾色 KPI。理由: operator Wow ≠ 消費者 spectacle、信用と可読性を毀損。
- **Defer**: Tier 3-4 density (30-100+ Agent の heat-map 化)。理由: 現 Agent 数が少なく Tier 1-2 で十分、scale 時に density tier 切替を再設計。capacity ceiling の数値閾値 (fan-out 上限) は未確立 (unverified) ゆえ数値断定せず、telemetry 表示のみに留める。

##### 意図的に捨てるもの (全部盛りしない判断) + なぜ
- **Hub への chart 多用 (Drill-down tier 全載)**: 捨てる。Hub は「今日どこへ行くか」の router に徹し、chart drill は Observatory に集約。→ Hub の 1 秒把握を chart が阻害する (executive-dashboard の attention dilute)。
- **liveness の派手演出 (shader/multi-cursor/glass)**: 捨てる。operator Wow は「速さ・1 動作完了・根拠が見える安心」であり spectacle ではない (前提の operator Wow 定義)。
- **fleet KPI と個人タスクの混載**: 捨てる。混ぜると Hub が exec dashboard 化し operator の即断を遅らせる。
- **vanity metric (累積処理数等) の headline 配置**: 捨てる (executive-dashboard 禁則)。

##### 他軸との依存・整合 / 衝突
- **KPI SSOT**: Zone 1 の分母・件数は `mock-kpi.ts` (980) と `lib/status-tones.ts` に強依存。KPI 軸を別担当が触る場合は値の単一 SSOT を共有 (画面ローカル再計算禁止)。
- **triage→遷移先**: Zone 2 の行クリック先は承認待ち / escalation / 提案レビュー軸の画面契約と整合必須。exception の「次の選択肢」表現は escalation 軸の context-card 設計と語彙統一。
- **Agent card**: Observatory V2 は Agent 一覧/詳細軸と status icon・tone・trust badge を共有 (TrustLevelBadge 別系統)。
- **衝突 (要調整)**: Observatory V3 の intervention ボタンは本プロダクトの「propose のみ / 実 execute なし」不変条項と衝突しうる。**実行系ボタンは出さず escalation 導線に置換**で解消 — この決定を Agent 軸・escalation 軸と共有する。
- **motion/density**: canonical-spec §10 (T1≤5 motion, prefers-reduced-motion 全停止) と整合。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かるか)
1. Hub Zone 1 が **5 KPI 以内**、各に number + delta + status icon (shape+color 両方)、装飾色 0、vanity metric 0。
2. Hub Zone 2 に exception triage list が存在し、各カードに「何が・なぜ浮上・次の選択肢」の 3 要素が揃い、行クリックで該当 surface へ直行。空時は EmptyState + active probe 入口 (green wall 単独でない)。
3. Hub と Observatory で aggregate 5 KPI が**同値** (SSOT 共有、再計算 drift 0)。
4. Observatory が V1/V2/V3 の 3-viewport、V2 が auto-sort (alarm→top)、V3 に**実 execute ボタンが無い** (escalation 導線のみ)。
5. liveness (ticker/feed) が mock state 連動で、reload せず state 変化時のみ更新 (fake random 0)。`prefers-reduced-motion` で全停止。
6. 文字・データ背後に translucency 0、Chrome-only 機能 0、JP-only copy。

#### フォーム・入力・起票 (/cases/new field / validation / SoD / optimistic) `[forms-input-entry]` — important

##### この軸が決めること / なぜ E2E UX に効くか

手動起票 `/cases/new` (typology A 主画面) の field レベル契約を決める唯一の軸: **field 構成・JP 法人 field・入力支援 (type/inputmode/桁) ・validation surface (timing/tone/focus 移動) ・SoD と重複 check の actor 文脈・React19 actions/optimistic 可否**。既存 `[command-power-user-input]` 軸は palette/keyboard/optimistic「政策」を所有するが、起票画面の reference spec を「操作層の付録」に薄く併呑しており、synthesis §自身 (line 1199) がこの欠落を明記している。

E2E UX への効き目: 起票は **AI 障害時の唯一の業務継続経路**であり、ここで型なし素テキスト入力 (旧実装の F-033 欠陥) だと operator が「間違える」。本軸が「速い (型/桁/inputmode で打鍵削減)・迷わない (進捗 N/M・label-above)・間違えない (field 直下 inline + 重複/SoD block)・説明できる (起票=入力者の確認が四眼のどの眼かを legible)」を field 粒度で物理保証する。起票が雑だと、後段の reconcile/承認/監査台帳の入力品質が源流で汚れる。

##### 研究が示すこと (card / verdict 引用)

- `form-design-premium-tier.md` (directional): label-above 必須 (placeholder-only は a11y 絶対禁則)、validation = **on blur inline + on submit summary + server async** の 3 層、error は specific+actionable+polite、required は color 単独不可で `*`+text、iOS は font-size ≥16px で auto-zoom 回避。
- `forms-and-data-entry-patterns.md` (banking BO 明示): **required default / optional のみ marker**、AI auto-fill は source 明示 + **重要 field は Confirm 必須で submit block**、validation は client instant (on blur) → cross-field (on submit) → server (duplicate check/authorization) → async の rule layer、warning は inline disclosure + proceed 可・**error のみ block**。anti-pattern: on-keystroke validation / Save draft skip。
- `jp-form-conventions.md` (法令 production-safe + 実装 directional): 氏名は姓/名分離、ふりがな (銀行=カタカナ) 別 field、郵便番号→住所 auto-fill、電話/コードは `inputmode="numeric"`/`tel` で IME 抑制 + ハイフン両許容で normalize、error tone は敬語「7 桁でご入力ください (例: 123-4567)」。
- `react-19-ui-patterns.md` (監査 verdict: production-safe, downgraded 0): form mutation は `useActionState` (pending/error/直前結果一括)・自前 `useState(isSubmitting)` 二重管理禁止、子 button は `useFormStatus`、**`useOptimistic` は失敗 revert が安全な軽 action 限定 — 送金/承認/規制 transaction では wait + 明示確定**。pending は視覚のみにせず `aria-busy`+`aria-live` で SR に伝える。
- `banking-mobile-app-jp-conventions.md` (directional): 受取人名カナ ONLY・口座番号 7 digit・支店コード 3 digit 等の桁制約、確認→認証→完了の確認 step で「内容 review」を挟む慣習。

##### 選択肢と緊張 (tradeoff)

| 論点 | A | B | 緊張 |
|---|---|---|---|
| field 由来 | label 文字列から型推論 (現行 `fieldInputProps`) | workflow ごとに typed field schema (型/桁/必須/重複キー を明示宣言) | A は脆い (label rename で破綻)・B は SSOT 明確だが mock-case-detail.ts に schema 層追加 |
| validation timing | submit 一括 (現行) | on blur inline + on submit summary | submit 一括は「間違えてから気づく」、on blur は早期だが noise リスク (on change は不採用で合意) |
| SoD/重複 | 起票時 check なし | 起票確定時に同一 field-set 重複 + 担当者=承認者プリ警告を mock async | check 無は二重起票/SoD 後段発覚、async は loading 1 frame 増だが「源流で間違えない」 |
| 起票 commit | optimistic 先行表示 | wait + success morph | optimistic は体感速い (synthesis 除外 #8 で却下済) — 台帳に乗る重 action は誠実さ優先 |
| 進捗可視化 | submit 後に不足判明 | N/M 入力済 を入力中表示 (現行 F-033 済) | 後者確定、long form 化したら step indicator 検討 |

##### 決定 (reference 1 画面に落とせる具体 spec)

reference 画面 = `/cases/new` (CaseDraft.tsx)。以下を field 粒度で確定:

1. **field schema を typed 化 (label 推論を廃す)**: `mock-case-detail.ts` の `fieldsForWorkflow` 各 field に `{ inputKind: 'text'|'date'|'code'|'kana'|'name', required: true, maxLen?, pattern?, dedupeKey?: bool }` を持たせ、CaseDraft はそれを read。GROUND-TRUTH corrections#6 (typology→tier owner は density 軸) と直交: 本軸は field の**入力契約**のみ所有。
2. **入力支援**: date=`type="date"`、コード/番号 (支店コード 3 digit 等)=`inputmode="numeric"` + `pattern="[0-9]*"` + placeholder「数字で入力（例: 042）」、法人名=text、(口座開設で氏名カナ系が出るなら) kana=`pattern="^[ァ-ヴー]+$"` + 敬語 error。全 input font-size ≥16px (iOS auto-zoom 回避)。
3. **validation 3 層**: (a) on blur で field 直下 inline error (`role="alert"`, JP 敬語 actionable「支店コードを 3 桁の半角数字でご入力ください（例: 042）」)、(b) on submit で全 field summary + **最初の無効 field へ programmatic focus** (現行 F-008 維持)、(c) 起票確定時に **同一 workflow×dedupeKey の既存 case 重複** + **担当者==後段承認者になる SoD 衝突**を mock async check → warning は inline disclosure + 続行可、重複は error で block。required は全 field default、ラベルに「必須」可視 + `aria-required`。
4. **React19 actions**: `handleSubmit` を `useActionState` 化し pending/error/直前結果を一括管理 (自前 `showError` state の二重管理を解消)、起票 button は `useFormStatus` で `aria-busy`+「起票中」を `aria-live` 提示、layout shift 0 の loading→success morph。**起票に `useOptimistic` は使わない** (台帳に乗る重 action、synthesis 除外 #8 と一致)。mock+in-memory ゆえ async は `await new Promise(r=>setTimeout(r,~250))` で 1 frame の wait を再現 (corrections#4: 「承認 commit」= mock state 更新で propose-only 規律と矛盾しない旨をコメントで明記)。
5. **SoD legibility (現行 F-034 維持・強化)**: header に「起票=入力者の確認、反映には別担当者（承認者）承認が必須（四眼: 起票者 ≠ 承認者）」を ShieldCheckIcon + tertiary text で常時。confidence 生数字は出さない (corrections#5: 業務面 UI に生 confidence 0)。
6. **container/density は委譲**: `max-w-2xl` 単列・label-above・radius は density/layout 軸 SSOT に従う (本軸は値を再宣言しない)。radius は corrections#1 の live 値 (`--radius-control: 8px`) をそのまま使用。

##### Adopt / Adapt / Reject / Defer

- **Adopt**: label-above 必須 + placeholder-only 禁則 (`form-design-premium-tier`)、required-default/optional-marker (`forms-and-data-entry`)、on blur inline + on submit summary + focus 移動 (現行 F-008)、`inputmode`/桁 pattern/敬語 error (`jp-form-conventions`)、`useActionState`+`useFormStatus`+`aria-busy`/`aria-live` (`react-19-ui-patterns`)、font-size ≥16px。
- **Adapt**: card の「氏名分離/ふりがな/郵便番号 auto-fill」は **prototype の現行 2 workflow に実在する field のみ**に縮約 — 法人住所変更=法人名/新住所/ビル名/支店コード/効力発生日、口座開設=本人確認書類ほか。card の汎用 JP 個人 field を全部盛りせず、起きている field にだけ JP convention (桁/inputmode/敬語) を適用。AI auto-fill UX は本画面では「AI 障害時の手入力」が前提ゆえ採用せず、source 明示 rule は後段 reconcile 面に委ねる。
- **Reject**: 起票への `useOptimistic` (重 action、誠実さ違反、synthesis 除外 #8)。多 step wizard 化 (現行 5-6 field で single page が最速、card の「16+ で multi-step」閾値未満)。Save draft auto-save (mock+in-memory scope-out、crash recovery 不在の prototype で過剰)。郵便番号 API auto-fill (外部接続 scope-out)。
- **Defer**: on blur 即時 inline の **全 field 実装** — reference では支店コード/日付など型のある field 1-2 個で確立し、残りは on submit summary に委ねて後続 wave で拡張。Save & resume・field 単位 kana auto-推定も defer。

##### 意図的に捨てるもの + なぜ

- **AI auto-fill / prefill の起票画面適用** — 本画面の存在理由が「AI が使えない時の手入力」(CaseDraft.tsx docstring)。ここで AI prefill を出すと honesty 違反 (F-006/F-007: 起きていない AI 処理を捏造しない) と画面の目的が矛盾する。
- **multi-step wizard + stepper** — 現行 field 数が single page 閾値内。step 分割は context switch を生み、熟練 operator の縦スキャン速度を落とす (synthesis density 軸の「1 tier 縦スキャン成立」と整合)。
- **起票の optimistic 先行表示** — 承認台帳に乗る重 action。「成功したと思った」誤認は規制 surface で逆効果 (`react-19-ui-patterns` 重 action 除外 rule = 不変条項「人のコントロールを渡さない」)。
- **郵便番号→住所 auto-fill / Save draft auto-save** — 外部接続・永続化 scope-out。mock+in-memory に持ち込むと faux 機能になる。

##### 他軸との依存・整合 / 衝突

- **`[command-power-user-input]` 軸 (重複の主因)**: 政策層 (palette `>起票を開始` 起動・optimistic 可否 rule・3 層 validation の方針) はあちら所有、**field 粒度 spec (型/桁/inputmode/重複キー/SoD check の実装契約) は本軸所有**。両軸の optimistic 結論は一致 (起票=wait)。衝突なし、分業を明記。
- **`[approval-sod-decision]` 軸**: 起票=入力者の確認という four-eyes 起点を本軸が header で legible 化し、後段の承認者 footer (ActorBand/SoD disable) へ actor を引き渡す。SoD enforce の本体はあちら、起票時の **担当者→承認者衝突プリ警告**は本軸。
- **`[information-density-hierarchy]`/layout 軸 (corrections#6)**: container 幅・row height・radius・tier は委譲。本軸は値を再宣言せず live token (`--radius-control: 8px`, corrections#1) を参照。
- **`[exception-escalation-recovery]` 軸**: 起票後の重複/SoD warning が escalation に化ける経路は本軸では起こさない (warning=inline 続行可、error=block のみ)。
- **honesty test (F-006/F-007/F-051)**: 起票 detail が AI/OCR/.pdf/押印を捏造しない既存契約を本軸の schema 変更が破らないこと (typed schema 追加は label を変えない)。

##### checkpoint 受け入れ signal

1. `/cases/new` で支店コード field が `inputmode="numeric"` + 桁 placeholder を持ち、日付 field が `type="date"`、全 input font-size ≥16px (iOS auto-zoom なし)。
2. field 離脱 (on blur) で当該 field 直下に敬語 actionable inline error が `role="alert"` で出る (型のある field 1-2 個で確認)、submit で summary + 最初の無効 field に focus。
3. 起票 submit が `useActionState` 経由で、button が「起票中」を `aria-busy`+`aria-live` で提示し layout shift 0、success morph 後 detail へ遷移。**optimistic 先行表示が起きない** (送信中は確定値が一覧に現れない)。
4. 同一 workflow×重複キーの既存 case があると起票確定時に error block、担当者==承認者になる入力で SoD warning が inline 表示 (続行可)。
5. header に「起票=入力者の確認 / 別担当者の承認者承認が必須」が常時 legible、業務面に生 confidence 数字が 0 (grep gate: corrections#5)。
6. 起票画面に AI prefill/OCR/auto-fill が出ず、honesty test (F-006/F-007/F-051) が green を維持。

#### 検索・retrieval (/search cross-entity / query / scope / result density) `[search-retrieval]` — important

##### この軸が決めること / なぜ E2E UX に効くか
横断検索 `/search` は「entity を跨いで 1 つの retrieval 動線に集約する唯一の面」を決める。具体的には (a) 検索対象 entity universe (案件/提案/Agent + **監査台帳**)、(b) scope 切替の操作モデル (種別 facet か prefix か)、(c) result density と grouping (kind 混在の 1 table か kind-grouped か)、(d) no-result の fallback、(e) keyboard 動線、(f) Cmd+K との役割分離。E2E に効くのは、熟練オペレータの「迷わない・速い」の最後の保険がここだから — Process scope と nav grouping で辿り着けない時 (ID 断片だけ・種別を跨ぐ・古い台帳事例を引く) に operator が落ちる単一の安全網であり、ここが faceted で deep-link 可能でないと「探せず止まる」失敗が残る。greenfield §107 が「Cmd+K の `#` records と `/search` の機能重複」を未解決 open question として明示しており (line 534)、本軸はその境界線を閉じる責務を負う。

##### 研究が示すこと (card ファイル名 / 監査 verdict を引用)
- `search-filter-and-discovery.md`: 検索は **prefix match + typo tolerance を 2-3 char から start**、filter は **URL encode で persistent (bookmark/share 可)**、**semantic は keyword fallback 必須** (exact ID/number 検索を殺さない)、bulk entry は filter result から。現 live は `?q=` deep-link 済 (`SearchResults.tsx:53`) でこの規律に既に適合。
- `search-and-filter-premium-tier.md`: result は **instant (debounce 150-200ms) + ranked + grouped**、ranking は **exact match (title/name) → partial → semantic → recent** の順、grouping は result type で collapsible、**empty は Recent/Suggested/Did-you-mean の 3 fallback**。監査 Notes が「LLM semantic で exact match 後回し」「Empty を No results 単独」を明示の anti-pattern と判定。
- `command-palette-and-power-user-action-ui.md`: Cmd+K は **scope prefix `#`=records**。Anti-pattern に「**AI prompt result の inline preview を palette 内で表示**」「palette は dispatch のみ、preview は別 surface」と明記 — これが本軸との分界点の根拠。Cmd+K は jump/dispatch、腰を据えた探索は `/search` という役割分離は card 由来の craft。
- `empty-state-as-wow-opportunity.md`: 検索 0 件 (E4) と filter 0 件 (E2) は別 type。E4 は「scope 拡大 CTA + Did you mean」、E2 は「filter summary 明示 + Clear」。**全 empty を同一 component で実装するのは premium tier 違反**と判定。live は `EmptyState` で `truly-empty`/`filtered-empty` を既に分離済 (`EmptyState.tsx:16`)。
- `enterprise-saas-information-architecture.md`: master-detail を default、**URL share 必要 (audit/casework) は detail page**。横断検索の row→detail 遷移は本規律と整合。
- 監査 (2026-05-29): **3-engine NOW = Popover API / View Transitions / `<dialog>`**。LLM semantic / vector search は本 prototype が mock+in-memory ゆえ実装基盤なし — semantic は構造上 reject 確定。

##### 選択肢と緊張 (tradeoff)
| 論点 | 選択肢 A | 選択肢 B | 緊張 |
|---|---|---|---|
| scope 切替モデル | 種別 FilterChip (現 live) | scope prefix `#案件:` 等 | prefix は Cmd+K と語彙衝突 + JP 入力で IME 干渉。chip は discoverable で degeneracy guard 既存 |
| entity universe | 3 entity (現 live: 案件/提案/Agent) | 4 entity (+ 監査台帳) | 台帳 (CROSS_LEDGER + auditEvents) を入れると「説明できる」が強化されるが、kind 混在 table の row 異質性が上がる |
| result 構造 | kind 混在 1 table + kind sort (現 live) | kind-grouped collapsible section | card は grouped 推奨だが、混在 table は density 高く scan 速い。4 entity で混在は重くなる |
| no-result | 文言のみ (現 live) | Did-you-mean + 近接候補 | mock では typo correction の index 基盤が薄い、過剰実装 risk |
| matcher | substring `includes` (現 live) | prefix + fuzzy | fuzzy は mock 規模 (数十件) で over-engineering |

##### 決定 (reference 1 画面に落とせる具体 spec)
**reference 画面 = `/search`、density tier = T4 Trader-grade** (greenfield line 566 が `/search` を T4 に割当て済、本軸はそれを継承し owner は information-density 軸)。

1. **scope モデル = 種別 FilterChip を維持・拡張** (prefix 不採用)。現 `kind` filter (`SearchResults.tsx:37`) に **4 つ目 `ledger`=「監査台帳」を追加**し、entity universe を 案件/提案/Agent/**台帳** の 4 に拡張 (prompt 明示の cross-entity 要件を満たす)。FilterChip は `options.length >= 2` degeneracy guard を継承 (`DataTable.tsx:128`)。
2. **検索対象に監査台帳を追加** = `useSearchResults` に `useCrossLedger()` 由来の event を `kind:'ledger'` で merge。match field = event の case ID / 操作種別 / actor。row href は該当案件 detail か Observatory anchor。**これにより「過去にどう処理したか」を operator が ID 断片から引ける** = "説明できる" の retrieval 担保。
3. **result = kind 混在 1 table を維持**、ただし **default sort を kind asc に固定**して種別が視覚的に塊になるよう並べる (collapsible group 化はしない — T4 density で section header は scan を遅くする)。column 構成 = `種別chip / ID(mono 13px) / 名称 / 詳細`、row 32-36px、tabular-nums、ID/timestamp のみ mono (greenfield line 566/573 と整合)。
4. **ranking = exact-ID-prefix 優先**。現 substring `includes` matcher (`hooks.ts:290`) に薄い rank を足す: ID が query で**前方一致**する行を最上位、それ以外は現状の entity 順。fuzzy/semantic は入れない。
5. **no-result = E4 型を採用**。zero-result 時 (`emptyTitle`「「q」に一致する項目がありません」現状維持) に **secondary として「全業務横断で再検索」は既に default なので不要 → 代わりに「Cmd+K で操作・移動を検索」への誘導 1 行**を description に追加 (scope 拡大の代替: 検索が探索専用、action は palette という役割を no-result でも教える)。Did-you-mean は **mock 規模ゆえ defer**。
6. **keyboard**: 結果 table は ARIA grid + 単一 tab-stop + arrow nav (greenfield line 566 の T4 要件)、row Enter で detail 遷移。`/search` 自体への到達は Cmd+K と TopBar 検索 input の双方 (live 済)。
7. **confidence 規律**: 監査台帳 row は raw ledger surface ゆえ生 confidence 許容 (corrections #5)、案件/提案/Agent row には confidence を出さない。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: URL `?q=` persistent deep-link (`search-filter-and-discovery.md`、live 実装済)。E2/E4 empty 分離 (`empty-state-as-wow-opportunity.md`、live 実装済)。faceted FilterChip + degeneracy guard (`search-and-filter-premium-tier.md`)。exact-ID-prefix ranking (同 card の ranking 規律)。ARIA grid keyboard nav (T4 監査要件)。
- **Adapt**: 監査台帳を 4 つ目 entity として search universe に追加 — card は「複数 entity 横断」を説くが、本プロダクトでは台帳が "説明できる" の中核なので**重み付けして昇格**。card の kind-grouped collapsible は**混在 1 table + kind sort に adapt** (T4 density で section header を回避)。
- **Reject**: scope prefix (`#`/`>`) を `/search` に持ち込む案 — Cmd+K と語彙衝突 + JP IME 干渉、chip で代替済 (`command-palette-and-power-user-action-ui.md` の prefix は palette 専用)。LLM semantic / vector search — mock+in-memory で基盤不在、exact-ID retrieval を殺すなと card 自身が警告。fuzzy match — mock 規模で over-engineering。
- **Defer**: Saved view / Recent searches fallback — backend/永続化不在で空気化、需要も未検証 (`search-filter-and-discovery.md` の saved view)。Did-you-mean typo correction — index 基盤が薄い。"Create [query]" reverse-search CTA — 手動起票は `/cases/new` に既存導線があり重複。

##### 意図的に捨てるもの + なぜ
- **scope prefix 構文** を捨てる: discoverable な chip で同等の triage が可能、prefix は Cmd+K と二重学習 + JP 入力で IME 確定が干渉する。
- **kind-grouped collapsible section** を捨てる: T4 density 画面で group header は縦スクロールと scan を増やす。kind sort で塊化すれば section の利得は出る。
- **semantic / fuzzy / Did-you-mean** を捨てる: mock+in-memory に index 基盤がなく、捏造した "賢い検索" は demo で破綻する。exact retrieval の誠実さを優先。
- **Saved view / Recent** を捨てる: 永続化 backend 不在で機能が空気化、prototype で偽の状態を作らない。

##### 他軸との依存・整合 / 衝突
- **`[command-power-user-input]` / `[ia-navigation-shell]` と境界共有 (最重要)**: greenfield §534 の open question を本軸が**確定** — **Cmd+K = transient jump/dispatch (keyboard, no facet, no deep-link, action escalation 付き)、`/search` = durable faceted retrieval (chip scope, `?q=` 共有可, 4 entity, table density)**。Cmd+K の `#` records は「目的の 1 件へ即 jump」、`/search` は「条件で絞って見渡す」。両者は重複でなく depth 違いの 2 surface。no-result から Cmd+K へ誘導する 1 行でこの分界を operator に教える。
- **`[information-density-hierarchy]` 軸が tier owner** (corrections #6): `/search` の T4 割当・row 高さ・mono 範囲はその軸が SSOT、本軸は consume するのみ。
- **`[oversight/exception]` (Observatory) 軸**: 監査台帳 (CROSS_LEDGER) は Observatory が主消費面。search が台帳を引く時、row href は Observatory anchor か案件 detail へ — 台帳の SSOT を二重化せず参照に留める。
- **detail/C 型 contract 軸**: search row→detail は sidebar 非表示 + URL share の master-detail 規律 (`enterprise-saas-information-architecture.md`) に従う。衝突なし。
- **icon 軸 (corrections #3)**: `/search` 自体は SearchIcon、`/inbox` は InboxIcon を奪わない (BellIcon 等)。本軸は SearchIcon 単射で衝突なし。

##### checkpoint 受け入れ signal
1. `/search` に種別 FilterChip が **4 つ (案件/提案/Agent/台帳)** 出て、台帳 row が ID 断片検索で hit する (entity universe 拡張の確認)。
2. ID 前方一致した行が結果最上位に来る (exact-ID ranking)、substring hit はその下。
3. `?q=` を URL に貼って別 tab で開くと同じ結果が再現する (deep-link persistence)。
4. 0 件時に「一致なし」+「Cmd+K で操作・移動を検索」誘導が出て、空クエリ時の prompt empty (truly-empty) とは別文言 (E2/E4 分離)。
5. 結果 table が arrow key で行移動でき Enter で detail 遷移、種別が視覚的に塊で並ぶ (kind sort)。
6. Cmd+K で同じ語を打つと「即 jump 候補」が出て、`/search` の「絞って見渡す table」と機能が**重複でなく depth 違い**だと体感できる。

ファイル参照: 実装対象 `/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/src/pages/SearchResults.tsx` (現 3-entity search、`?q=` 同期済) と `/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/src/store/hooks.ts:285` (`useSearchResults`、台帳 entity 追加 + ID-prefix ranking の改修点)。境界根拠 = `greenfield-ui-direction-2026-06-02.md` line 534 (未解決 open question) を本軸が確定。

### Interaction 層 — 動線 / 判断

#### 判断・承認・SoD (4-tier confirmation / 5-state timeline / four-eyes / 単一決定面) `[approval-sod-decision]` — core

##### この軸が決めること / なぜ E2E UX に効くか
4 段階の action confirmation 強度、承認 timeline の 状態セット、four-eyes(入力者/承認者)の actor 分離 enforcement、object 単位の単一決定面の 4 つを確定する。これは「誤操作ゼロ × SoD 遵守 × 1動作で完了する判断」という operator Wow の中核であり、全 15 capability の判断接点 (/cases/:id, /approvals, /proposals/:id, /config-approvals, /escalations) が共有する文法。ここが曖昧だと「どのボタンが取り返しのつかない操作か」「自分が今どの帽子(入力者か承認者か)で見ているか」が散らばり、E2E の信頼が崩れる。

##### 研究が示すこと (card ファイル名 / 監査 verdict を必ず引用)
- **4-tier confirmation** (`agent-action-confirmation-ui.md`): T1 read-only=自動 / T2 local mutation=自動+undo / T3 external mutation=明示確認+1行サマリ / T4 critical/irreversible=2-step+typed confirmation+audit。「全確認」も「全自動」も regulated AI では違反。同 card の banking 制約: **agent は propose のみ、execute は operator-auth backend** (本 prototype は backend 無しだが UI 上「AI=提案・人=決定」を視覚的に分離する根拠)。
- **承認 state の数の緊張**: `ai-native-hil-approval-ui.md` は **5-state** (pending/approved/rejected/failed/escalated) を timeline 列で常時露出、agent/human を icon+color band で区別、approved は常に human action と明言。一方 `action-history-timeline-audit-trail-ui.md` は **7-state outcome** (Proposed/Approved/Rejected/Executed/Failed/Reverted/Escalated) を監査台帳側で要求。両者は対象が違う (前者=判断 UI の進行表示、後者=監査台帳の outcome 語彙)。
- **failed ≠ rejected の分離** (`ai-native-hil-approval-ui.md` 強い反論): failed=実行エラー(再実行可)、rejected=人の意思却下(再実行禁止)。merge すると recovery flow が破綻。
- **単一決定面** (project SSOT `canonical-design-spec.md` §6 C型 contract): standing 決定ボタンは object 単位 1セット (sticky footer は画面あたり 1つ)、field/部分操作は行クリック→modal。contract test で「sticky footer == 1」を機械強制。
- **surface 選定** (`modal-vs-drawer-vs-fullpage-decision.md`): HIL approval=Drawer、disclosure を含む不可逆 action=Fullpage、kill switch=Modal。typed confirmation は modal。
- **multi-step approval** (`multi-step-approval-and-workflow.md`): reject/return は理由必須、approver は個人 (「チーム」でなく) を可視化、AI auto-approve は SR 11-7 の effective challenge 違反。
- **platform 監査** (`2026-05-29-frontend-ui-trends-2025-2026.md` verdict): translucency on text は iOS26.1 後退+NN/g 批判で **Watch-only / 規制 surface 不可**。frosted glass は backdrop-filter で 3-engine 可だが「文字・データ背後には使わない」。typed confirmation や決定 footer は solid surface で組む。

##### 選択肢と緊張 (tradeoff)
| 論点 | 選択肢 A | 選択肢 B | 緊張 |
|---|---|---|---|
| state 数 | 5-state (HIL card) | 7-state (audit card) | 判断 UI で 7 は scan 過多、監査台帳で 5 は outcome 不足 |
| T4 typed confirm | research default (typed) | object 名再入力は重い | mock prototype で typed が過剰演出か / 安心の核か |
| 単一決定面 | object 単位 1 footer | field ごと inline decide | inline は速いが SoD 境界が溶ける |
| four-eyes 露出 | 常時 actor band | hover/click で開示 | 常時は noise / 但し誤帽子操作はゼロにしたい |
| AI 提案の確定 | 提案=即反映可 | 提案→人承認必須 | 自律量を増やしたいが control を渡さない |

##### 決定 (本プロダクトの方向、reference 1 画面に落とせる具体 spec まで)
**2 層分離: 判断面の 5-state + 監査台帳の 7-state を明示的に橋渡しする。** 判断 UI (LifecycleStepper, /approvals 行, /escalations) は **5-state** = `確認待ち(primary) / 承認待ち(slate) / 反映済(success) / 差戻し(alert) / エスカレーション(error)` (status-tones SSOT §4 と完全一致、既存語彙を変えない)。監査台帳 (Observatory 詳細 drawer, CaseDetail の操作履歴) は **7-state outcome** = 提案/承認/却下/反映/失敗/取消(reversal)/エスカレーション を controlled vocabulary で記録。「反映済」(5-state) は台帳側で「反映(Executed)」、「失敗」「取消」は台帳のみで露出 — 判断面に出さない (W3 で reversal=`Undo2Icon`/`RotateCcwIcon` が既に入っている)。

**4-tier confirmation を本 prototype の操作にマッピング** (typed confirmation は最上位 1 種に限定し alert fatigue を避ける):

| Tier | 本 prototype の操作 | 確認強度 | surface |
|---|---|---|---|
| T1 | 一覧 filter / 案件を開く / 履歴閲覧 | なし(即時) | inline |
| T2 | override 訂正値の下書き / 差戻し理由の入力途中 | なし + 取消可 | inline (sticky footer に未確定 badge) |
| T3 | **案件承認 / 手順承認 / 差戻し実行** | 明示確認 + 1行サマリ + 理由(差戻し/却下は必須) | sticky footer ボタン → 確認 row 展開 (modal 不要、footer 内 2-step) |
| T4 | **設定承認 (config-approvals) / 反映の取消(reversal) / escalation の最終確定** | typed confirmation (対象 ID or 「承認」を入力) + 影響リスト + audit | **Modal** (solid, focus-trap, role=alertdialog) |

**reference 1 画面 = CaseDetail (/cases/:id) の sticky footer**:
- footer は object 単位 **1セットのみ** (C型 contract §6, sticky footer==1)。入力者 mode は `[差戻し(理由必須)] [承認へ送る]`、承認者 mode は `[差戻し] [承認(T3)]`。
- footer 左に **ActorBand** を常時表示: 「あなたは今 **承認者** として閲覧中 — この案件の入力者は 田中(2026-05-30 起票)」。入力者==承認者の場合は footer の承認ボタンを **disabled + 理由ツールチップ「SoD: 起票者は承認不可」** (four-eyes を UI で hard enforce、SoD card の「approved は常に human、actor 区別不能を作らない」を満たす)。
- T3 確認: ボタン押下で footer 内に確認 row が slide 展開 (「CASE-2026-0142 を承認します。反映後は監査台帳に記録されます。」+ `[確定] [取消]`)。modal を使わない = context preserve (drawer/footer 思想)。
- T4 (この画面では「反映の取消」のみ該当) は Modal に昇格、`取消対象 ID を入力` + 影響(「反映済の住所変更を巻き戻します」) + typed gate。
- 全 surface は **solid panel** (translucency 禁止、監査 verdict 遵守)。actor 区別は color band + icon prefix (`ShieldCheckIcon`=SoD/保護) で a11y 両立。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: 4-tier confirmation 分類 (`agent-action-confirmation-ui.md`)、failed≠rejected 分離、approved=常に human (`ai-native-hil-approval-ui.md`)、単一決定面 contract (project §6)、reject/return 理由必須 (`multi-step-approval-and-workflow.md`)、HIL approval=Drawer/typed=Modal の surface 規律。
- **Adapt**: state 数を「判断面 5 / 台帳 7」の 2 層に再構成 (両 card の対象差を解決、既存 status-tones 語彙を 1 字も変えずに再利用)。typed confirmation を card の T3/T4 両方からではなく **T4 1 種に限定** (mock + JP operator 文脈で alert fatigue を回避、card の「全 action confirm は frustration」反論に整合)。
- **Reject**: agent が approved を押せる UI / 全 action 一律 typed confirm / translucency on decision surface (監査 verdict) / multi-step を 6+ tab 化 (process design failure signal)。
- **Defer**: per-step SLA timer の数値化、delegate(out-of-office)自動 routing、audit log の export(CSV/JSON/PDF) — いずれも backend/データ依存で mock では空 surface になるため Observatory 拡張時に回す。

##### 意図的に捨てるもの (全部盛りしない判断) + なぜ
- **AP2 mandate / scope×lifetime×revocability の grant flow** (`agent-action-consent-authorization-ux-2026.md`): 本軸は「1 action の確認 + 承認 timeline」。grant 粒度・撤回経路は authorization 軸の別レイヤで、backend 無し prototype では空気化する。kill-switch 連動のみ別軸に委譲。
- **conditional/parallel DAG routing** (`multi-step-approval-and-workflow.md`): 本 prototype の loop は逐次 (差戻し→staging→手順承認→設定承認) で固定。parallel review は表現せず、逐次 LifecycleStepper に集約。
- **7-state を判断 UI に全露出**: scan 過多。失敗/取消は台帳側のみ。
- **typed confirmation の T3 適用**: 案件承認は頻度が高く、毎回 typing は熟練 operator の速度を殺す。footer 内 2-step で十分。

##### 他軸との依存・整合 / 衝突
- **status/tone 軸**: 5-state は `lib/status-tones.ts` §4 と完全一致 (新語彙ゼロ)。衝突なし。
- **surface/navigation 軸**: 「T3=footer 内 2-step / T4=Modal / 詳細=Drawer」は `modal-vs-drawer-vs-fullpage` の banking use-case 表と整合。kill-switch を Modal にする決定と衝突しない。
- **monitoring/audit 軸**: 台帳 7-state outcome の controlled vocabulary はこの軸が source。Observatory drill-down drawer の field 構成 (input/reasoning/output/reviewer ID/timestamp) を共有 — 整合確認が必要。
- **authorization/kill-switch 軸**: T4 typed confirmation と kill-switch Modal の視覚言語を統一すべき (両方 solid alertdialog + 影響リスト)。衝突リスク=低、要 cross-check。
- **潜在衝突**: ActorBand の常時表示が dense list (/approvals) で noise 化しうる。一覧では actor 列、詳細では band と密度を分ける。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かるか)
1. CaseDetail の sticky footer が **画面あたり 1セット**で、入力者==承認者時に承認ボタンが disabled + SoD 理由が出る (four-eyes hard enforce)。
2. LifecycleStepper が **5-state のみ** (失敗/取消が判断面に出ていない) で、各 state の tone が status-tones §4 と一致。
3. 案件承認 (T3) が footer 内 2-step (modal 無し) で完了、差戻しは理由入力必須でないと確定不可。
4. 「反映の取消」(T4) だけが Modal + typed gate + 影響リストで、他の承認操作には typed が出ない (alert fatigue ゼロ)。
5. すべての決定 surface が solid (文字背後に translucency が一切無い)、actor 区別が color band + `ShieldCheckIcon` で成立。
6. Observatory の操作履歴 drawer が **7-state outcome** (反映/失敗/取消含む) を controlled vocabulary で記録し、判断面の 5-state と矛盾なく対応している。

#### Diff・根拠・説明可能性 (diff preview / citation / confidence-uncertainty / document viewer) `[diff-evidence-explainability]` — core

##### この軸が決めること / なぜ E2E UX に効くか

AI が案件 field / 設定 / 手順を変更する提案を、operator が「何が・どこ根拠で・どれだけ確かか」を**読み直さずに 30 秒で承認/差戻し**できる根拠表示の規約を決める。具体には (1) diff の事前可視化 view、(2) 一次証拠 (申請書類) への source locator/citation、(3) confidence の扱い、(4) 文書ビューア 2-pane の anchor 機構の 4 点。これは "operator Wow=常に根拠が見え誤操作が起きない安心" の中核で、CaseDetail / ProposalReview / ConfigApproval の承認接点すべての承認速度と差戻し質を左右する。曖昧だと operator が full state を読み直し承認時間が 5-10x に膨張する (`diff-and-change-preview-ui.md`)。

##### 研究が示すこと (card ファイル名 / 監査 verdict を必ず引用)

- **Diff は 3 view + metadata strip**: side-by-side / inline / field-table を user role で使い分け、metadata strip (author/reason/affected scope/reversibility) 確認後にのみ承認 button を active 化する UX gate。critical-first sort (regulator-touchable+irreversible を top)、color は green/red/yellow/grey に icon+label 併用 (`diff-and-change-preview-ui.md`)。本プロジェクトは既に `DiffPreviewBlock.tsx` で 3 view を実装済 (CaseReview=inline/fieldTable, ProposalReview=sideBySide/inline)。
- **Citation は 3 表現 × 4 tier**: in-line[1]/drawer/footnote、T1 primary(green)/T2 secondary(blue)/T3 directional(yellow)/Internal estimate(grey)。URL のみで passage 不在は regulator verify 不能 = audit fail。source 不在 claim は赤下線で fail-loud (`citation-and-source-disclosure-ui.md`)。
- **Confidence は 4 form を role×stake で選ぶ**が、card 自身が「一般 operator に裸の % は over-confidence bias を誘発、false precision」と警告。**本プロジェクト SSOT はこれを更に進め `confidence 0.84` 生数字を UI から完全削除する決定を既に下している** (`reconcile-panel-spec.md §1`: ユーザー指摘で「0.84 が良いか悪いか文脈なしに判断不能」)。代わりに「AI 入力値 vs 申請書類 (一次証拠) の突合結果」= 行動直結の 6 reconcile 状態で示す。これは confidence card の Form 選択を超える**局所決定で、生 confidence card は本軸では reject**。
- **説明は 4 層 progressive disclosure**: L0 結論 → L1 一行根拠 → L2 source/confidence → L3 full trace。L0-L1 常時 / L2-L3 は drawer・別画面に逃がす。「説明を足せば過信が減る」は Cecil 2024 (単一ドメイン) が支持せず、high stake は説明追加でなく反証併置 (`agent-explainability-disclosure-flow-2026.md`)。
- **規制開示の動線**: passage 付き記録は SR 11-7 reconstruct 要件、source 不在は Hamburg DPA €492,000 制裁の根拠 (`regulated-agent-disclosure-audit-journey-2026.md`)。
- **2-pane anchor**: 文書ビューア(左)+全項目(右)、source locator (document/page/field locator/timestamp) で AI 値と OCR raw を並置 diff 強調 (`reconcile-panel-spec.md §4`, `transaction-list-and-statement-ui.md` の reconciliation grid)。
- **監査 verdict 適用**: 文字・データ背後の translucency 不可 (Apple iOS26.1 後退 + NN/g 批判)。diff/citation/document は全て不透明 surface に置く (2026-05-29 監査 Watch-only)。Chrome-only の CSS Carousels/Liquid Glass 屈折は base 採用不可。`backdrop-filter: blur()` は 3 engine 対応だが規制 surface のテキスト背後では使わない。

##### 選択肢と緊張 (tradeoff)

| 論点 | 選択肢 A | 選択肢 B | 緊張 |
|---|---|---|---|
| Confidence 表示 | 生 % / interval を field 横表示 (confidence card) | 突合結果 (reconcile state) に置換、生 % は audit metadata に退避 (project SSOT) | A は SR 11-7 transparency に直接見えるが operator に行動不能 + over-confidence。B は operator 行動直結だが「confidence を隠した」と監査に問われ得る → §6 audit metadata 保持で両立 |
| Source 提示深度 | 全 field に in-line citation 常時 | 要確認/未取得 field のみ source locator | 全件は density 崩壊 (操作画面)、最小は audit trail 不足 → L1 常時+L2 on-demand で解消 |
| Diff color | green/red/yellow フル | tone token (diff-add/del) のみ | フルは scan 50% 高速だが操作面で過剰彩度、project は `diff-add/del(+bg)` token に集約済 |

##### 決定 (本プロダクトの方向、reference 1 画面に落とせる具体 spec まで)

**Reference 画面 = CaseDetail (`/cases/:id`)**。doc-anchored 2-pane で本軸 4 要素を 1 画面に集約:

1. **2-pane anchor (左 文書ビューア / 右 全項目)**: 左 = 申請書類ビューア (`--color-paper*` token、`FileTextIcon` locator)。右 = ReconcilePanel 全項目。右 field hover/click で左の該当欄を highlight scroll (source locator = document/page/field locator/timestamp で anchor)。translucency 禁止 = 両 pane 不透明、highlight は outline + bg-tint (`success-soft`/`alert-soft`)。
2. **Diff 表示**: 各 field で AI 入力値 vs 申請書類 OCR raw を `DiffPreviewBlock` inline view で並置、char-level highlight。diff color = `diff-add`(green)/`diff-del`(red) token + icon (`PencilLineIcon` override / `CheckIcon` 一致)。critical-first sort = 「要確認」「未取得」を上部固定、一致は下部。
3. **Confidence**: 生数字を UI に出さない。代わりに 6 reconcile 状態を operator ラベル (一致/要確認/未取得/確認済/エスカレーション) + tone で表示。生 confidence は `FieldReview` schema の audit metadata として保持 (Observatory raw ledger 専用)。
4. **Citation/source**: 要確認・未取得 field に source locator 必須表示 (申請書類名/P.x/欄名/取得時刻)。承認済手順への参照は「この案件で参照した、承認済の手順・ルール」と平易 JP。tier 区別は operator 面では露出せず audit metadata。
5. **承認 gate**: footer 単一決定面 (承認/差戻し 1 セットのみ)。**承認 button は全 field が 一致/確認済 のときのみ enabled** (要確認・未取得 残存で disabled + tooltip) = diff card の「metadata 確認後 active 化」gate の本プロジェクト実装。
6. **説明 4 層**: L0=承認可否判定 (footer) / L1=field tone + 1 行突合結果 (常時) / L2=field click 統合 modal で source locator + 詳細 (on-demand) / L3=Observatory audit ledger (別画面、6 状態 + 生 confidence + actor 全記録)。

##### Adopt / Adapt / Reject / Defer

- **Adopt**: diff 3-view (`DiffPreviewBlock` 実装済) / critical-first sort / footer 単一決定面の承認 gate / source locator 4 要素 (document/page/field/timestamp) / L0-L3 progressive disclosure / translucency 禁止・不透明 surface (監査 verdict)。
- **Adapt**: citation 4-tier (T1/T2/T3/Internal) → operator 面は tier 非露出 + audit metadata 保持に変形 (regulated-disclosure の「UI に内部語を出さない」規範に整合)。in-line[1] superscript → 申請書類 source locator の欄名 anchor に置換 (操作画面に Wikipedia 風脚注は density 過剰)。
- **Reject**: 生 confidence の field 横表示 (project SSOT §1 で明示削除、operator が行動不能 + over-confidence bias)。star rating Form 3 (banking 不適、confidence card 自身が禁止)。diff の yellow=modify 全適用 (project は add/del 2 token に集約、modify は OCR raw vs AI 値の char diff で表現)。
- **Defer**: interval/range (Form 4) — 与信スコア等の regression output が出る将来業務で再検討、現 scope (住所変更/口座開設等の field 突合) では不要。multi-source citation の UI craft (1 claim 複数 source)、time-series 3-way diff。

##### 意図的に捨てるもの (全部盛りしない判断) + なぜ

- **生 confidence 数字・% bar・uncertainty 3-layer 分解 (aleatoric/epistemic/operational)**: operator に意味不明で行動不能、project がユーザー指摘で既に却下。捨てるが audit metadata には残す (SR 11-7 reconstruct 担保)。
- **in-line numbered citation [1][2] + drawer + footnote の 3 表現フルセット**: 操作画面の density を崩す。source locator (欄 anchor) 1 表現に絞る。footnote/endnote は将来の loan memo 生成画面 (artifact) でのみ採用候補。
- **4-tier color dot を operator surface に露出**: 内部語露出禁止規範に反する。tier は audit 専用。
- **bulk-change diff summary chart**: 現 scope は単一案件 field 突合中心、bulk (247 件 rate 変更) は本プロジェクトに業務として存在しない。捨てる。

##### 他軸との依存・整合 / 衝突

- **[approval-decision-flow] 軸と直結**: 承認 button enable 条件 (全 field 一致/確認済) と footer 単一決定面は共有契約。本軸が diff/突合結果、承認軸が SoD/four-eyes と差戻し flow を持つ → 接合点 = ReconcilePanel footer。衝突回避には「standing button 1 セット」規範を両軸で固定。
- **[audit-trail] 軸と補完**: 本軸は operator surface の最小表示、audit 軸は L3 full trace (6 状態 + 生 confidence + actor)。生数字を「UI 非表示・記録は full」で分離する規範を両軸で共有 (`agent-explainability §3`)。
- **[layout-density] 軸と緊張**: 2-pane は viewport 占有大。density 軸の T1 主画面で左右比率 (文書 55% / 項目 45% 目安、`conversation-plus-artifact-panel-pattern.md` の artifact>conversation 原則を doc>項目 に転用) を調整要。narrow screen は tab 切替 fallback。
- **[motion] 軸**: highlight scroll anchor は motion budget T1≤5 event 内、`prefers-reduced-motion` で即時 scroll に degrade。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かるか)

CaseDetail (`/cases/:id`) を開いて以下が確認できれば本軸は正しい:

1. **生 confidence 数字 (0.84 / 87% / ★) がどこにも表示されない** (grep `confidence` で UI string ヒット 0、audit metadata のみ)。
2. 右 field を click/hover すると**左 文書ビューアの該当欄が highlight + scroll** する (source locator anchor 動作)。
3. 「要確認」「未取得」field が**上部に固定**され、各々に**申請書類名/ページ/欄名**の source locator が見える。
4. 各 field で AI 入力値 vs 申請書類値が**並置 diff (char-level highlight、add=green/del=red token + icon)** で示される。
5. footer に**承認/差戻しの 1 セットのみ**、要確認/未取得が残ると**承認が disabled + tooltip**。
6. 文字・データの背後に **translucency (frosted/glass) が一切ない** (全 surface 不透明)。
7. operator 面に**内部語 (confidence / OCR raw / master / 突合 / R-RECON-xx / T1/T2)** が露出しない (平易 JP のみ)。
8. field click → 統合 modal (L2) に source locator 詳細、Observatory (L3) に 6 状態 + 生 confidence + actor が記録として辿れる。

#### Agent 監督・信頼較正 (vigilance / zone-out / progressive autonomy / above-the-loop) `[agent-supervision-trust]` — core

##### この軸が決めること / なぜ E2E UX に効くか
「任せる量を増やすが制御を渡さない」の運用 OS — どの autonomy 段階 (全件確認/要所確認/自動) に上げるか・どう実績で昇格降格するか・自動化が進んだ後 operator が zone-out せず監督し続けられるかを決める。E2E に効く理由: 案件キュー→承認→提案→設定承認の Flywheel が回るほど exception 比率が下がり、operator の主リスクが「見落とし」から automation complacency / rubber-stamp に構造シフトする (`agent-oversight-cognitive-load-vigilance-flow-2026.md`)。ここを設計しないと、他軸が磨いた処理速度がそのまま「速い思考停止」になる。本軸は Agents 一覧 / AgentDetail / Observatory の 3 surface で「昇格の正当化」と「高止まり後の vigilance 維持」を担う。

##### 研究が示すこと (card / 監査 verdict 引用)
- **昇格は時間経過でなく measurable track record で**: `trust-calibration-progressive-autonomy-flow-2026.md` — autonomy は accuracy / override 率 / 連続 N 件 / trailing window で昇格、誤りは同軸で降格。**昇格は遅延・複数条件 AND、降格は単一 event で即時**(非対称)。`human-agent-collaboration-modes-2026.md` も「降格は昇格より速く・低閾値」を反復。閾値数値 (98%/1000件) は vendor 例で domain 校正必須・捏造禁止。
- **高 mode が常に優れるわけではない**: `human-agent-collaboration-modes-2026.md` — 高 risk action は Copilot 上限・Autopilot 禁則。「mode を上げる = 成熟」は anti-pattern。本プロダクトの「自動 (autonomous)」は高 risk では作らない。
- **99% 正しい agent こそ危険**: `agent-oversight-cognitive-load-vigilance-flow-2026.md` — failure mode は見落としでなく automation complacency + vigilance decrement で、attentional ゆえ training で治らず flow で潰す。4 レバー = active surfacing (silent green wall 禁止) / CIT (理解できないなら承認させない) / capacity ceiling / scaffolded friction (stakes に比例)。
- **全件 review を放棄し exception-only triage へ**: `multi-agent-oversight-journey-2026.md` — そのとき false-positive 比が一次 KPI、escalation rate が system health signal。bulk action は同型性 gate 必須。
- **cockpit は 3 viewport**: `operator-cockpit-multi-agent-oversight-ui.md` — aggregate KPI / per-agent card (alarm→top auto-sort) / drill-down + intervention。ただし production-safe は「aggregate-to-detail drill」骨格まで、5 KPI 選定は craft。
- **kill switch は graduated + 認可 + reason code + auto-resume 禁則**: `kill-switch-and-emergency-control-ui.md`。
- **監査 verdict (2026-05-29)**: translucency を文字・データ背後に使わない / Chrome-only を base にしない / vibe-code を規制 surface にそのまま入れない — 監視画面は全部 solid surface・cross-engine の boring-reliable で作る。

##### 選択肢と緊張 (tradeoff)
| 論点 | 選択 A | 選択 B | 緊張 |
|---|---|---|---|
| 昇格根拠 | 単一「承認率」gate (現状) | 多軸 gate (承認率+上書き率+Alert+差戻し率の全達成、現に 4 KPI ある) | A は automation bias を誘発、B は card 整合だが「1 指標未達で保留」UX が既にあるので拡張は安い |
| vigilance 維持 | 自動化後も同じ画面 | active surfacing (sampling キュー + 異常承認速度検知) | B は新規 surface コスト。だが card が「設計の中心」と断定 |
| cockpit 規模 | 2 agent の現状 (cockpit 不要) | N agent 前提 fan-out cockpit | 本プロダクトは少数 agent。full cockpit は over-engineering |
| friction | 全 stakes 一律 confirm | stakes 比例 (低=流す/高=理由必須) | 全面 friction は capacity を食う本末転倒 |

##### 決定 (本プロダクトの方向 + reference 1 画面 spec)
**方向**: 本プロダクトは「少数 agent × 高 risk regulated BO」。よって (1) **fan-out cockpit は作らない**、(2) **昇格は 4 KPI 全達成 + 別系統独立検証 + 設定承認 (四眼) の三重 gate**(現に揃っている部品を「昇格の正当化 panel」として AgentDetail に統合)、(3) **自動化が進んだ後の vigilance を Observatory に「抜き取り確認 (sampling)」surface として明示新設**する。これが現状の最大 gap — 現 Observatory は KPI 未達 drill はあるが「99% 正しい後の能動監督」surface が無く、silent green wall に陥る。

**reference 画面 = AgentDetail (`/agents/:id`) を昇格決定面として確定。具体 spec**:
- **Header**: `現在 {全件確認} {Supervised}` + paused 時 `緊急停止中` chip(実装済)。**追加**: 自動化レベルが checkpoint/autonomous の場合のみ「抜き取り確認 N 件待ち」MetaChip を出し Observatory sampling へ link(vigilance hook、低 mode では非表示)。
- **主列**: `実績 vs 閾値 (4 指標すべて)`(集約値を捨て全 KPI 提示=CIT の verification capacity 担保、実装済)+ `昇格の帰結 (全件確認→要所確認)` consequence panel(実装済)+ 独立検証 disclaimer(実装済)。**追加**: consequence の guard 行「承認率が 7 日連続で基準割れ → 全件確認に自動降格」を**降格を昇格より目立たせる**ため alert tone の独立 strip に格上げ(非対称の可視化、card 整合)。
- **補助列**: Flywheel lineage(実装済)+ 実績の裏付け sample(実装済、原則 B)+ 設定(実装済)。
- **Footer (単一決定面)**: manual=申請 / owner=設定承認・差戻し、SoD self-block(実装済)。昇格ボタンの活性条件を**現状の `hasUnmet`(承認率のみ判定の疑い)から 4 KPI 全達成 AND に明示**(`a.metrics.some(m=>!m.achieved)` は既に全 KPI 走査だが、コピー「承認率が基準(95%)に未達」が単一指標に見える → 「4 指標のいずれかが未達」に修正)。
- **Header 右の緊急停止 (kill-switch)**: 理由必須・降格・再開は理由必須(1-click 廃止、実装済)。graduated 3 level までは本プロダクト規模では不要、現 1 level + reason + 再開 gate を維持(card の Resume gate 思想は満たす)。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: track-record ベース昇格 + 非対称降格 (`trust-calibration`)、99%-complacency の active surfacing と CIT 「理解できねば承認させない」(`vigilance-flow`)、kill-switch の reason code + auto-resume 禁則 (`kill-switch`)、aggregate-to-detail drill 骨格 (`operator-cockpit`)。
- **Adapt**: 4-mode を本プロダクト 3 段 (全件確認=Copilot / 要所確認=条件付き Autopilot / 自動=低 risk のみ) に写像。cockpit 3 viewport を「2 agent では per-agent card = Agents 一覧の row、drill = AgentDetail」に縮約。sampling キューを Observatory タブとして新設(専用 cockpit は作らない)。
- **Reject**: fan-out N-agent cockpit / heat-map density tier(規模不一致)。bulk intervention modal(2 agent に同型 bulk は無意味)。translucency 系装飾(監査 verdict)。
- **Defer**: graduated 3-level kill (L1/L2/L3 + 2 名認可) と regulator SLA countdown(本番 module、prototype は 1 level + 監査台帳記録で代替)。escalation-rate-as-health の時系列グラフ(scope=次 wave)。

##### 意図的に捨てるもの + なぜ
- **大規模 cockpit / per-agent カード壁** — 本プロダクトは少数 agent。`operator-cockpit` card 自身が「Tier 区別必要」と警告し、fan-out は span-of-control 上限の話。少数では Agents 一覧 (alarm→top sort で代替) + AgentDetail drill で十分。全部盛りは density 崩壊。
- **autonomy 数値閾値の UI 露出 (98%/1000件 等)** — card が「vendor 例・domain 校正必須・本番転記禁止」と明記。prototype は `[仮説/要検証]` ラベル付き % のみ、確定基準として書かない。
- **常時 confidence/explanation 提示** — `trust-calibration` anti-pattern 1「透明性=信頼の誤認」。confidence 生数字は監査 raw ledger のみ(現状の型境界を維持)、業務画面では逸脱時のみ厚く。
- **scaffolded friction の全面適用** — capacity を食う。高 stakes(昇格申請・緊急停止・設定承認)にのみ理由必須 friction、低 stakes case 確認は流す。

##### 他軸との依存・整合 / 衝突
- **[approval/SoD 軸] と強依存**: 昇格 = 設定承認 (四眼) は config-approvals 軸が owner。本軸は「昇格の measurable 根拠」を供給、最終承認は四眼。self-promotion block は両軸で一致必須(実装済)。
- **[Flywheel/proposal 軸] と整合**: AgentDetail の lineage は「差戻し→提案→設定反映」を昇格の出所として可視化。昇格 = autonomy +1 は Flywheel の compiled 段の帰結。
- **[escalation 軸] と境界**: vigilance の sampling で異常検知 → escalation surface へ。本軸は検知 trigger、処理は escalation 軸。
- **衝突リスク**: 「自動 (autonomous)」を高 risk 業務で活性化すると `human-agent-collaboration-modes` の Autopilot 禁則と矛盾 → 自動段は低 risk 業務のみ昇格可とし、高 risk は要所確認を上限とする business rule を data 層に明示する(現 2 agent は両方 supervised で未抵触だが、将来追加時の guard)。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かるか)
1. AgentDetail で**全 4 KPI が個別に見え**、1 つでも未達なら昇格ボタンが disabled + 「いずれかが未達」コピー(集約値で昇格判断していない = CIT 担保)。
2. **降格 guard が昇格より視覚的に強い**(alert tone strip)。昇格ボタンは複数条件 AND で慎重、緊急停止/降格は即時 — 非対称が画面で読める。
3. 昇格申請を**申請者自身が承認できない**(SoD self-block disabled + 四眼コピー)。
4. checkpoint/autonomous の agent でのみ「抜き取り確認待ち」hook が出て Observatory sampling へ繋がる(自動化後の能動監督導線がある = silent green wall でない)。supervised では非表示。
5. 緊急停止に**理由必須**、再開も理由必須(1-click でない)、停止理由が header に persist、台帳記録文言あり。
6. confidence 生数字 (0.84 等) が**業務画面に出ず**監査台帳のみ。autonomy 閾値が確定基準でなく `[仮説/要検証]` 付き。
7. 全 surface が solid・cross-engine(translucency/Chrome-only 装飾なし、監査 verdict 遵守)。

#### 例外・escalation・recovery (agentic exception / handoff / HIL error recovery) `[exception-escalation-recovery]` — core

##### この軸が決めること / なぜ E2E UX に効くか
本軸は「agent が誤った／止まったときに、operator が**最小動作で・根拠を見ながら・誤操作なく**封じ込め→復旧→学習に到達する動線」を決める。具体的には (1) 現 `/escalations` の薄い queue を **5-phase exception journey (検知→封じ込め→根絶→復旧→学習)** に拡張、(2) Flywheel の「差戻し→staging」と排他でない**例外側ループ**（反映済の取消・誤承認の補正）を CaseDetail/Observatory に接続、(3) **段階停止 (Pause/Freeze/Kill)** を AgentDetail に置く、の 3 接点を確定する。E2E に効く理由: 熟練 operator の "operator Wow" は happy path の速さより、**「壊れたとき何が起きていて、どこまで戻せて、誰が止められるか」が一画面で即読める安心**で決まる。ここが弱いと自動化レベルを上げる意思決定そのものが止まる（Flywheel の前提が崩れる）。

##### 研究が示すこと (card / 監査 verdict を引用)
- `agentic-exception-recovery-journey-2026.md`: exception は **Detection→Containment→Eradication→Recovery→Postmortem の 5-phase を 1 journey** に。**point-of-no-return 境界**で「前=rollback / 後=compensating transaction（原 action は override せず別 tx 記録）」。compensating は機械的逆順でなく **semantic undo + business rule**。postmortem は **blameless（root cause は欠落 guardrail に帰す）**。EU AI Act Art.14(4)(e) safe-state halt と Reg E の error-resolution 時計（10/45/90 営業日）が production-safe な裏付け。
- `hil-error-recovery-flow.md`: **4 failure-mode × recovery operator** (`agent-error`=auto-retry→escalate / `sla-breach`=auto-escalate / `human-wrong-approval`=freeze+compensating / `downstream-fail`=retry(idempotency)→compensate)。**approved を後から rejected に override しない**＝監査整合の核。
- `agent-human-handoff-escalation-flow-2026.md`: handoff は**常時承認でなく trigger 5 軸 (confidence/amount/risk/regulatory/unknown) で selective firing**。**amnesia problem（context 渡さず丸投げ）と queue flooding（全部承認に回す）が二大失敗**。handoff package = who/intent/attempted/why-escalating/推奨。判断は **1 個に圧縮**（automation bias 回避）。
- `kill-switch-and-emergency-control-ui.md`: **3 層 graduated halt + 2-person 認可** (L1 Pause=owner 単独/L2 Freeze=2 名/L3 Kill+Quarantine=2 名)、**controlled-vocabulary reason code 必須**、**auto-resume 禁則**（re-approval gate）。anti-pattern「single Stop button」「同一 modal で L1-3 並列」。
- `agent-failure-explainability-ui.md`: 「なぜ誤ったか」を **5 element (decision trace / source attribution / confidence+ablation / policy match / override evidence) を 1 画面 5 秒読み**。json dump は不可、master-detail timeline。
- 監査 verdict (2026-05-29): 本軸の primitive はすべて **DOM/CSS の標準実装で足り、Chrome-only も translucency も不要** → countdown/timeline/modal は安全。**文字・データ背後の translucency 禁止**（規制 surface に legibility 後退を持ち込まない）、vibe-code 生成物をそのまま停止 UI に入れない。

##### 選択肢と緊張 (tradeoff)
| 論点 | 選択肢 A | 選択肢 B | 緊張 |
|---|---|---|---|
| journey の置き場所 | 専用「例外センター」新画面 | 既存 3 画面に分散接続 (Escalations=queue / CaseDetail=recovery 決定面 / AgentDetail=kill / Observatory=detection) | A は把握が一点に集まるが画面追加 +1〜2、本軸が肥大化。B は既存 IA を壊さず溶かし込めるが「全体像」が散る |
| kill-switch 認可 | card 準拠の 2-person dual-control を mock で再現 | prototype は 1 操作で停止、認可は注記のみ | 2-person は SoD/four-eyes 不変条項と整合し "誤操作が起きない安心" の核。だが完全再現は画面増 |
| compensating の見せ方 | 反映済 case に「取消(別 tx)」を新規 action 系統で追加 | 既存 reversal (W3 `Undo2Icon`/`RotateCcwIcon`) を exception 文脈に流用 | 新系統は概念純度↑だが icon/語彙が増える。流用は不変条項（語彙固定）と整合 |

##### 決定 (方向 + reference 1 画面 spec)
**B（分散接続）採用。新画面ゼロ。** 例外 journey の 5-phase を**既存 4 画面の役割分担**に溶かし込み、唯一の新規 UI 概念を「**封じ込め状態 (containment banner)** + **kill-switch cluster (AgentDetail)** + **復旧決定面 (CaseDetail 既存 footer 拡張)**」に限定する。Flywheel の例外側＝「反映済の誤り→compensating tx→（必要なら）手順承認」を Flywheel と排他にせず接続する。

**reference 画面 = AgentDetail `/agents/:id` の「緊急制御」セクション（新規、ページ内 1 区画）**を本軸の primary deliverable とする。spec:
- **配置**: 既存 C 型 detail の単一決定 footer とは別の、ページ本文末尾 1 区画（footer 二重化しない＝canonical §6 違反回避）。見出し「緊急制御」。
- **3 ボタン cluster (横並び、危険度で視覚段階化)**: `[一時停止]`(L1, `PauseIcon`)＝default visible、`[凍結]`(L2)・`[停止・隔離]`(L3) は **1 click 展開後に出す**（同一 modal 並列表示は anti-pattern）。色は L1=alert-soft / L2=alert / L3=error（既存 tone v2 のみ、新 token なし）。
- **confirmation modal (L2/L3)**: ① **reason code select**（controlled vocabulary: `MODEL_DRIFT`/`OUTLIER_DETECTED`/`EXTERNAL_INCIDENT`/`REGULATOR_REQUEST`/`INTERNAL_AUDIT_FINDING`/`DATA_QUALITY`/`SECURITY_INCIDENT`、free-text は任意 note 別欄）② **2-person 認可行**（承認者1=現操作者 ✓ / 承認者2=待ち。本不変条項 four-eyes と同じ ActorBand/SoD 表現を流用）③ `[キャンセル]`/`[実行]`。実行で AgentDetail の TrustLevelBadge 隣に **containment banner**（「一時停止中 — 新規処理を受け付けません／在荷 N 件は完走」等、level 別文言）を出す。**JP-only**、translucency なし（solid scrim）。
- **post-kill**: 同区画に incident draft（timestamp / level / reason / 認可者2名 / 影響 instance 数 / 在荷件数）を auto-populate 表示。**resume は別 gate**（「再開は再承認が必要」注記、auto-resume なし）。
- **Detection 接続**: Observatory の metric-vs-threshold 逸脱行 →（行内導線）AgentDetail 緊急制御へ。
- **Recovery 接続 (CaseDetail)**: 反映済 case の「誤承認発見」時、既存 footer に **`[反映を取消(別 tx)]`**（既存 `Undo2Icon` 流用、原 entry は `反映済` 維持）を追加。実行は **compensating entry を action-history timeline に別行追記**（原 action は不変）。可逆 step（staging 前）は通常の差戻しに合流、不可逆 step（反映済）のみ compensating。
- **Postmortem 接続**: 裁定/停止/取消の理由を staging に流し、**blameless（root cause = 欠落手順/設定）**として手順承認候補に載せる＝Flywheel 例外側の閉路。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: 5-phase journey 構造 / point-of-no-return 境界（rollback vs compensating）/ approved を override しない監査整合 / 3 層 graduated halt + 2-person 認可 + controlled reason code + auto-resume 禁則 / handoff の selective firing（既存 escalate trigger を 5 軸に整理）/ failure-explainability 5 element を CaseDetail の証拠アンカー＋action-history に割り当て。理由: すべて規制要件 or 監査整合に直結し、不変条項（four-eyes / 監査台帳 / Flywheel）と同方向。
- **Adapt**: compensating transaction を会計概念でなく **operator 向け「取消(別 tx)」UI** に翻訳（card の Microsoft pattern は技術過多なので user-facing 化）。kill-switch の SRE/CTO/CRO role を本 prototype の **actor set（入力者/承認者/業務責任者）**に読み替え、2-person は業務責任者 + 承認者で表現。理由: prototype の actor 体系と語彙固定に合わせる。
- **Reject**: 専用「例外センター」新画面、confidence 生数値の operator 露出（ablation の confidence は監査 raw のみ、業務面は `[仮説]` 規律）、translucent overlay、Chrome-only countdown 実装、Reg E/SR 11-7 等の規制語を UI 表層に出すこと（Tier 3 規制語禁止＝CLAUDE.md）。理由: IA 肥大・automation bias・不変条項違反・platform 監査違反。
- **Defer**: regulator-notification SLA countdown（Reg E/FSA の法定時計）, fleet-wide kill propagation, blameless postmortem の専用 board。理由: 規制語表層化禁止と scope（mock）に抵触、または本軸の operator Wow に対し限界効用が低い。Detection の自動分類 dashboard も本 prototype では mock seam に留める。

##### 意図的に捨てるもの + なぜ
- **「例外センター」集約画面を作らない** — 5-phase を一画面に集めると見映えはするが、熟練 operator の実動線は「停止は agent 画面」「復旧は case 画面」で発生する。文脈から切り離した集約は context switch を生み operator Wow を下げる（amnesia/queue flooding の同根）。
- **confidence/ablation の数値露出を捨てる** — explainability card の counterfactual は監査価値が高いが、業務 UI に生数字を出すと automation bias を誘発し JP-only `[仮説]` 規律にも反する。証拠アンカー（根拠 case / 紙文書）で「なぜ」を見せ、数値は監査 raw に隔離。
- **規制 SLA countdown / 法定時計表示を捨てる** — production では必須だが、本 prototype は Tier 3 規制語禁止 + mock。中核 message（差戻し→正解手順）に寄与しないため defer。

##### 他軸との依存・整合 / 衝突
- **oversight/cockpit 軸**: Detection の入口は Observatory（metric-vs-threshold）。本軸は「逸脱→停止→復旧」の下流を担う。逸脱行の導線設計は共有が必要（衝突しないよう「監視＝検知、本軸＝対処」で境界を切る）。
- **approval/Flywheel 軸**: compensating（取消別 tx）と通常差戻しの分岐点＝point-of-no-return。`status-tones` SSOT で「差戻し再処理=alert」「エスカレーション=error」が既に定義済み（canonical §4）なので衝突なし。取消後の手順承認は Flywheel 本線に合流。
- **detail-contract 軸**: CaseDetail の単一決定 footer に `[取消(別 tx)]` を足すが footer は 1 つのまま（C 型 contract test = sticky footer==1 を壊さない）。AgentDetail の緊急制御は footer ではなく本文区画にするのが整合の鍵。
- **icon/語彙不変条項**: 新 icon は `PauseIcon` のみ追加検討（停止系）。取消は既存 `Undo2Icon`、再取得 `RotateCwIcon` と衝突しないこと（canonical §5 既存定義）。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かるか)
1. AgentDetail で **default は `[一時停止]` のみ可視**、L2/L3 は展開後に出る（同一 modal で 3 つ並ばない）。
2. L2/L3 modal に **reason code select（free-text 不可の controlled vocabulary）+ 2 人目認可待ち行**があり、1 人では実行ボタンが押せない（four-eyes 表現と一致）。
3. 実行後 **containment banner** が level 別文言で出て、**resume は再承認注記**があり auto-resume 導線がない。
4. CaseDetail で反映済 case に **`[反映を取消(別 tx)]`** があり、実行しても **原 `反映済` entry は残り、action-history に compensating 行が別途追加**される（override されない）。
5. 全 surface が **JP-only / solid（translucency なし）/ off-token hex 0 / lucide Icon-suffix / confidence 生数値なし**。
6. Observatory の閾値逸脱行から AgentDetail 緊急制御へ **1 動線**で到達でき、停止理由が staging（手順承認候補）へ blameless に流れる。

#### 通知・inbox・async engagement (notification channel / slow-agent wait-reengage / proactivity) `[notification-inbox-async]` — important

##### この軸が決めること / なぜ E2E UX に効くか
back-office の AI は本質的に非同期 (夜間 reconciliation・複数日 KYC・日次 staging 分析) なので、オペレータは席を立つ前提で待機・離脱・呼び戻しの時間軸を持つ。この軸は (1) 通知の channel/tier 配送ルール、(2) 分〜日単位 slow-agent の dispatch→wait→re-engage choreography、(3) agent proactivity (差戻し staging からの改善提案など unprompted 割り込み) の interruption budget を決める。operator Wow の三本柱 ("状況把握の速さ × 1動作完了 × 誤操作不在") のうち「離れていた間に何が起きたか」を再合流コストゼロで把握させる部分が、ここで成否が決まる。現状 `/inbox` は audit event を並べる受動 list で、async run の observability も呼び戻し cue も proactivity 制御も無く、E2E では「走っている業務の現在地」が画面に存在しない欠落がある。

##### 研究が示すこと (card / 監査 verdict)
- `async-slow-agent-wait-reengage-flow-2026.md`: slow-agent UX は 4-phase (dispatch-and-walk-away → pull dashboard observability → tiered 呼び戻し → checkpoint+cue 再合流)。**pull (status dashboard) を authoritative、push を best-effort に降格** (WorkOS MCP Tasks の実装契約)。二大失敗は push-only re-engagement (取りこぼしで永久に戻らない) と amnesia re-entry (cue 無しで読み直し)。EU AI Act Art.14(4)(e) で dormant 中も stop が safe-state へ 1動作到達する義務。**閾値数値 (何分で離脱/poll間隔/resumption lag 秒数) は card が持たない=本プロダクトでも数値断定しない**。
- `notification-channel-design.md`: 5 channel × 3 tier matrix。informational=in-app inbox+weekly digest / actionable=+toast+email / critical=+SMS+push。通知 4 要素必須 = cause / action expected / when(SLA) / deep link。fatigue 回避は同 event 60min collapse + digest。anti-pattern: deep link 無しで homepage 着地、cause/action 省略。
- `agent-proactivity-initiation-control-flow-2026.md`: 割り込みは「割り込むか (importance×time×context×history が interruption budget 超か)」と「どの action level (inform / silently-draft / auto-act)」を分離。**high-stakes (financial=banking) は user accountable ゆえ auto-act 禁止、inform/draft 止まり** (Google PAIR verbatim)。dismiss は同種 budget 引上げ signal。
- `agent-interruptibility-pause-redirect-flow-2026.md`: 走行中 stop/redirect は risk-threshold 超え action にだけ brief summary + one-tap (全 step gate は automation bias 悪化で禁則, Art.14(4)(b))。idempotency 無き resume = 二重送金。
- 監査 verdict (2026-05-29): notification の realtime push 系は **Watch-only** に該当する技術 (cross-doc View Transitions = Firefox 未対応 / WebSocket-presence は core 不可) を base にしない。**文字・データ背後に translucency 禁止** (Apple iOS26.1 後退 + NN/g 批判) → 通知 panel/toast を frosted-glass overlay にしない、solid surface。Popover API は NOW (Newly, @supports+role/keyboard で本番可) なので通知 popover は採用可。

##### 選択肢と緊張 (tradeoff)
| 論点 | 選択肢 A | 選択肢 B | 緊張 |
|---|---|---|---|
| 観測の真実源 | push 通知主導 (toast/badge で完了を知らせる) | **pull dashboard 主導** (Observatory が active run の SSOT、通知は導線) | A は実装が軽いが取りこぼしで宙吊り。card が B を authoritative と明示 |
| 通知 surface | リアルタイム toast 多用 | inbox + 控えめ toast + digest | toast 過多は alert fatigue、規制業務で見逃しに直結 |
| async run の置き場所 | /inbox に run も混ぜる | **Observatory に "進行中の自動処理" lane、/inbox は人間宛 actionable のみ** | inbox に run progress を混ぜると triage が壊れる (card: pull dashboard は別) |
| proactivity (staging→改善提案) | 検知次第 inform | **silently-draft → operator 来訪時に pull 提示** | 即 inform は budget 消費、改善提案は中 importance で draft が適 (card When-to-use) |
| SLA 表示 | 偽 SLA を出して切迫感を演出 | **occurredAt の事実時刻のみ、SLA は実 backend 不在ゆえ scope-0** | 現コードは既に「偽 SLA でない」を明示。card の "when=deadline" は実データ前提、mock では捏造禁止 |

##### 決定 (本プロダクトの方向、reference 1 画面に落とせる具体 spec)
**pull-authoritative・3-tier・push-best-effort** を採る。3 つの surface に役割分担する:

1. **Observatory に "進行中の自動処理 (active runs)" lane を新設** = slow-agent の pull dashboard (SSOT)。各 run row = { 業務名 + case/batch ref, 状態 chip (実行中 / 入力待ち / 完了 / 失敗 — `async-slow-agent` の 5 state を 4 に圧縮), ETA は **window 表記 (例「~18:40 目安」)** で点推定にしない, partial 件数 (例「840/980 件処理済」=progressive disclosure の salvage 表示), one-tap **停止** (Art.14(4)(e) safe-state halt、dormant 行にも常設) }。完了 run は静かに terminal 化し badge を出さない (completion は低優先 tier)。off-token hex 禁止・lucide のみ・status→tone は `status-tones.ts` SSOT・solid surface (translucency 不使用) を遵守。

2. **/inbox は「人間宛 actionable のみ」に純化** (現行 4 kind = sendback/reversal/escalation/escalation-resolved を維持)。各 notification row は card の 4 要素を満たす: cause (kind chip = なぜ来たか) / action expected (title) / when (occurredAt 事実時刻、偽 SLA は出さない) / **deep link (href で該当 case の単一決定面へ直行、homepage 着地禁止)**。未読 = primary-soft 背景 + ドット (現行維持)。「未読のみ」トグル + 「すべて既読」(現行維持) = triage 回復。**digest 行を 1 本追加**: 「過去 N 時間に完了した自動処理 X 件」を informational tier の collapsed 1 行で示し、tap で Observatory active-runs lane へ (run progress を inbox に流し込まない境界)。

3. **proactivity = silently-draft default**。staging からの改善提案 (差戻し→手順承認 loop) は中 importance ゆえ即 inform せず、AI 提案一覧 (/proposals) に黙って draft 化し、operator 来訪時に pull で提示 (現行 /proposals が既にこの器)。inbox に proactive push しない。例外: escalation 裁定依頼など time-sensitive な人間宛は inform (現 escalation kind が該当)。**auto-act は一切しない** (banking=financial high-stakes、PAIR accountability + 不変条項「人のコントロールを渡さない」)。

4. **再合流 cue (amnesia 回避)**: 完了/失敗 run を operator が開いた時、Observatory lineage/lifecycle timeline (既存 `LifecycleEvent`) が「離脱中に何が起きたか」structured cue を兼ねる。新規 amnesia 専用 UI は作らず既存 timeline に役割を melt-in。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: pull-authoritative dashboard (Observatory active-runs lane) / 通知 4 要素 (cause/action/when/deep-link) / tiered 呼び戻し 3 段 (critical→escalation inform / quality→draft / completion→静かに digest) / dormant でも 1-tap stop (Art.14(4)(e)) / silently-draft proactivity default / ETA は window 表記。
- **Adapt**: card の 5 state (working/input_required/completed/failed/cancelled) → UI は 4 chip に圧縮し既存 `status-tones` tone に mapping (primary=実行中 / alert=入力待ち / success=完了 / error=失敗)。card の "when=SLA deadline" は実 backend 前提 → 本プロダクトは occurredAt 事実時刻 + ETA window に Adapt (偽 SLA 捏造禁止)。digest を別画面でなく /inbox 内 collapsed 1 行に Adapt。
- **Reject**: SMS/push/email channel (mock+in-memory・screen-only ゆえ実配送不能、in-app inbox + Observatory pull で完結) / realtime WebSocket presence・toast 洪水 (監査 Watch-only + fatigue) / 通知/run-progress を背後に敷く translucent overlay (監査: translucency on data 禁止) / auto-act + 事後報告 (banking high-stakes) / 偽 SLA カウントダウン (数値捏造禁止)。
- **Defer**: 通知 channel preference (opt-out 設定) UI = 実 user account 不在ゆえ defer / push webhook 標準化待ち (MCP Tasks experimental、refresh trigger) / resumption-lag 効果量の表示根拠 = 原典 gated ゆえ数値表示しない。

##### 意図的に捨てるもの + なぜ
- **toast を完了通知の主機構にしない**: push は best-effort、取りこぼしで宙吊り (card 二大失敗の一)。完了は Observatory pull + digest 1 行で十分。toast は critical (escalation 発生) の瞬間提示のみに限定。
- **SMS/push/email の実装**: screen-only prototype で実配送できず、matrix を全部盛りすると説得力を装った嘘になる。in-app 2 surface に絞る。
- **proactive な inbox 割り込み**: 改善提案を inbox に push すると人間宛 actionable の triage を汚す。draft 化して /proposals に滞留させ、operator が能動的に取りに行く (budget 消費ゼロ)。
- **偽 SLA カウントダウン / resumption-lag 数値**: 切迫感は出せるが mock では捏造。事実時刻と window 表記に留める (card の no-go 表現)。

##### 他軸との依存・整合 / 衝突
- **Observatory/監視軸**: active-runs lane は Observatory に住むので監視軸と SSOT を共有。run state chip の tone は `status-tones.ts` 単一 SSOT を共用 (画面ローカル再宣言禁止)。衝突回避点 = 「run progress は Observatory、人間宛 actionable は inbox」の境界を両軸で合意する必要。
- **interruptibility/kill-switch 軸**: active-runs lane の 1-tap 停止は kill-switch 軸の safe-state halt UI と同一機構。redirect 粒度 (full-stop/部分 steer) は interruptibility 軸が所有、本軸は「停止導線が dormant 行にも届く」到達性のみ担保。
- **escalation 軸 (/escalations)**: escalation kind の inform 通知は escalation 軸の裁定 flow への入口。deep link 先が escalation 軸画面と整合する必要。
- **proposals/Flywheel 軸**: silently-draft の着地先が /proposals。proactivity が draft を生む頻度 (budget) は Flywheel の日次分析 cadence と整合させる。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かるか)
1. Observatory に「進行中の自動処理」lane が存在し、各 run が { 状態 chip + ETA window + partial 件数 + 1-tap 停止 } を持つ。停止ボタンが「入力待ち/dormant」状態の行にも表示される (Art.14(4)(e))。
2. /inbox に流れるのは人間宛 actionable のみ (sendback/reversal/escalation 系) で、run progress event が混入していない。各 row に deep link があり tap で homepage でなく該当 case の決定面に直行する。
3. /inbox 上部に「完了した自動処理 X 件」の collapsed digest 1 行があり、tap で Observatory active-runs へ飛ぶ (push 通知でなく pull 導線)。
4. toast が出るのは critical (escalation 発生) のみ。完了 run では toast/badge が出ず静かに terminal 化する。
5. 改善提案は inbox でなく /proposals に draft として現れる (proactive inbox 割り込み不在)。
6. SLA カウントダウンや「あと N 分」の偽 deadline が画面に無く、表示は occurredAt 事実時刻と ETA window のみ。translucent overlay の背後にデータが無い (solid surface)。auto-act された痕跡 (人間承認を経ない反映) が監査台帳に無い。

#### コマンド・power-user 操作・入力 (palette / keyboard / shortcut / form / optimistic action) `[command-power-user-input]` — important

##### この軸が決めること / なぜ E2E UX に効くか
熟練 operator が「探す→判断する→起票/承認する」までを mouse に手を離さず最短経路で完了させる**操作層 (command palette / global keyboard shortcut / form 設計 / optimistic 可否)** を決める。15 capability を route 横断で繋ぐ第二の IA であり、`operator Wow = 状況把握の速さ × 1動作完了 × 誤操作が起きない安心` の「速さ」と「安心」を同時に担う。ここが弱いと画面 polish が高くても処理 throughput が `keyboard-shortcuts-and-power-user.md` の言う 30-50% 落ちる。

##### 研究が示すこと (card / 監査 verdict 引用)
- `command-palette-and-power-user-action-ui.md`: Cmd+K を **4 layer (search / 4-type result group / keyboard nav / context awareness)** で構築。scope prefix `>`(action) `/`(navigate) `@`(AI) `#`(record)。**regulator-touchable action は palette から direct execute 禁止 — warning badge + approval modal に escalate、起動元 (palette) を audit log 記録**。
- `keyboard-shortcuts-and-power-user.md`: 4 layer + 銀行固有 rule。**destructive/承認系は shortcut で confirmation skip 不可**、`?` で cheat sheet 常時、button label に inline hint (例「承認 (A)」)、mouse-equivalent 常設、**delete 禁則 (audit 整合性) → archive のみ**、`G then C` 等の navigation chord。
- `react-19-ui-patterns.md` (監査 verdict: production-safe, downgraded_claims 0): form mutation は `useActionState` (pending/error/直前結果一括)、子 button は `useFormStatus`、**`useOptimistic` は失敗 revert が安全な軽 action 限定 — 送金/承認/規制 transaction では使わず wait + 明示確定** (誠実さ優先)。engine gating 無し。
- `form-design-premium-tier.md` (directional): label-above 必須 (placeholder-only 禁則)、**on blur inline + on submit summary + server async** の 3 層 validation、long form は 16+ field で multi-step (3-5 step)、submit は loading→success morph で layout shift 無し。
- `jp-form-conventions.md`: 氏名/ふりがな 姓名分離、郵便番号 auto-fill、`inputmode` で IME 切替、エラーは敬語 actionable (「不正な値」禁止)。本プロダクトは法人 back-office なので消費者 KYC field は対象外だが、**JP 敬語 error tone と inputmode は適用**。
- 監査 verdict 適用: Popover API / Invoker Commands は NOW (3 engine) だが palette の focus trap / `role="combobox"` + `aria-activedescendant` は自前責務。**`<ViewTransition>` は experimental で palette open に使わない**。translucency は文字背後で禁止 (Apple iOS26.1 後退 + NN/g)。

##### 選択肢と緊張 (tradeoff)
| 論点 | 選択肢 | 緊張 |
|---|---|---|
| Palette の権限 | (a) 全 action 起動可 / (b) navigate+検索+提案 dispatch のみ、承認系は escalate | 速度 vs SoD・audit 整合 |
| Optimistic 適用範囲 | (a) 一律不使用 / (b) 軽 action のみ (filter/通知既読/pin/draft保存) | 誠実さ vs 体感速度 |
| Shortcut 学習負荷 | core 10-15 / 30+ | 熟練速度 vs novice 負担・discoverability |
| Form validation 即時性 | on change / on blur | typing noise vs 早期 feedback |

##### 決定 (reference 1 画面に落とせる spec)
**1. Command palette = "navigate + 検索 + AI提案 dispatch" の高速層。承認・設定承認・差戻し・kill は palette からは "対象画面へ jump + 該当 modal を開く" だけで、palette 内で直接 commit させない。**
- 起動: `⌘K` / `Ctrl+K` (`event.preventDefault()` で browser override)。open latency <100ms、search debounce 200ms、fuzzy match。
- Result group 4 種を本プロダクト語彙に bind: `/` 移動 (15 capability + 案件/提案/Agent record へ jump)、`#` record (案件ID/提案ID/Agent名)、`@` AI (「この案件の提案根拠を要約」等、提案詳細へ dispatch)、`>` action だが**ここは "起票を開始" "差戻しキューを開く" 等の遷移系のみ**。承認/設定承認/escalation 確定 verb は group に `⚠ 承認台帳に記録` badge を付け、Enter で対象画面の確認 modal を開く (palette は起動元として audit 候補)。
- a11y: `role="combobox"` + `aria-activedescendant`、focus trap、SR に result count + selected index announce。translucency 不使用 (solid surface)。

**2. Global keyboard layer (core 13、`?` で cheat sheet):**
- Navigation chord: `G H`(Hub) `G C`(案件キュー) `G A`(承認待ち) `G O`(監視) `G S`(検索) — route SSOT (roadmap §1b) に 1:1。
- List/queue: `J/K` 移動、`Enter` 詳細、`I` drawer。承認系 `A`(承認) `R`(差戻し) `E`(escalation) は**必ず確認 modal 経由、modal 内で actor/理由を取り、shortcut で skip 不可**。
- Form: `⌘S` draft 保存、`⌘Enter` submit、`Tab` 次 field、`Esc` cancel。
- 全 button に inline hint (「承認 (A)」)。mouse-equivalent 常設。delete は提供せず archive のみ。

**3. Form (手動起票 `/cases/new` を reference 画面):**
- `useActionState` で submit pending/error/直前結果を一元管理 (自前 `isSubmitting` 二重管理禁止)。共通 Submit button は `useFormStatus` で pending 連動、`aria-busy` + `aria-live` で「送信中」announce。
- Validation 3 層: on blur inline (label-above, `role="alert"` で field 直下) + on submit summary + 起票確定時に SoD/重複 check を server-mock async。error は JP 敬語 actionable (「取引金額を半角数字でご入力ください」)。`inputmode` 指定。
- **起票 submit に optimistic を使わない** (台帳に乗る重 action = 誠実さ優先、wait + 確定表示)。成功は loading→success morph、layout shift 0。

**4. Optimistic を許す surface (軽 action のみ):** 検索/キューの filter・sort 反映、通知既読 (`/inbox`)、pin/お気に入り、draft 一時保存。`useOptimistic` の set は Action 内のみ、reducer 形式。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: `⌘K` 4-layer palette / scope prefix 4 種 / core keyboard shortcut + `?` cheat sheet / inline hint / `useActionState`+`useFormStatus` / on blur+on submit+server async validation / JP 敬語 error tone / `inputmode` / archive-only。
- **Adapt**: palette の `>` action group を「遷移+modal 起動」に限定し直接 commit を剥がす (card の banking warning badge を本プロダクトの**承認台帳記録 badge**に翻訳)。card の loan/KYC 例を案件/提案/Agent 語彙に置換。
- **Reject**: palette からの承認系 direct execute (SoD/four-eyes 違反)。起票/承認への `useOptimistic` (重 action、誠実さ違反)。`<ViewTransition>` での palette open (experimental)。translucency on text。voice 起動 (card 未確認点)。
- **Defer**: customizable shortcut remap (admin governance 要、card も security 懸念)、cross-app palette、plugin system、multi-language fuzzy match (JP-only なので不要に近い)、command palette の inline AI preview (palette は dispatch のみ)。

##### 意図的に捨てるもの + なぜ
- **scope prefix を 4 種に固定** (`!` `?` 等の追加 prefix を捨てる) — card が「4 prefix が cognitive load 上限」と明示。
- **shortcut を core 13 に絞り 30+ を出さない** — card の「core 10-15 で 80% productivity」。熟練向けでも一覧肥大は discoverability を下げる。
- **optimistic を体感速度のために重 action へ広げない** — `react-19-ui-patterns.md` の重 action 除外 rule が SoD/監査台帳の不変条項と一致。"全部速く見せる" は規制 surface で逆効果。
- **palette を action hub 化しない** — 承認の単一実行点を palette/画面で二重化すると audit 起動元が曖昧化し four-eyes が崩れる。

##### 他軸との依存・整合 / 衝突
- **承認/SoD 軸**: palette の `⚠承認台帳記録` badge と shortcut の確認 modal は、承認軸が定義する four-eyes modal の**唯一の commit 経路**を共有する (palette/shortcut は起動のみ)。commit point が分散しないことが整合条件。
- **状況把握/dashboard 軸**: `G` chord と `#` record jump の遷移先 route は IA/route 軸の SSOT (roadmap §1b) に 1:1 依存。route 改番時に chord map も更新。
- **AI提案/Flywheel 軸**: `@` dispatch は提案詳細/staging へ遷移し、palette 内に AI 出力を inline 展開しない (差戻し→staging→手順承認 loop の visibility を画面側に保つ)。
- **visual/motion 軸**: palette open・success morph の motion は motion-density budget と `prefers-reduced-motion` に従属、translucency 不使用で衝突回避。
- **衝突注意**: `⌘K` と browser/`⌘S` と既定保存の override は preventDefault で握る必要があり、a11y (SR の shortcut conflict) と両立確認が必須。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かるか)
1. 任意画面で `⌘K` → 100ms 以内に solid surface の palette が開き、`/ # @ >` で result group が切り替わる。承認系候補に `⚠承認台帳記録` badge が付き、Enter で**確定せず**対象画面の確認 modal が開く。
2. `?` で cheat sheet、`G C`/`G A` 等で route 即遷移、queue で `J/K`→`I` drawer、承認 `A` が**必ず modal を挟む** (直接確定しない)。
3. `/cases/new` で field 離脱時に label-above の field 直下 inline error (JP 敬語)、submit で summary、送信中は button が `aria-busy` で「送信中」表示・layout shift 0、成功で success morph。起票は optimistic で先行表示**しない**。
4. `/search`・`/inbox` の filter/既読のみ即時反映 (optimistic)、台帳系は wait。
5. 全 action button に inline hint (「承認 (A)」)、mouse でも全操作完結、delete が存在せず archive のみ。
6. SR で palette の result count/selected index と form の送信状態が announce される。translucency が文字・データ背後に無い。

### Quality 層 — 横断品質

#### 状態機械・フィードバック (empty/loading/error/blocked/completed/reverted) `[state-feedback-machine]` — core

> ⚠ **補正 (live code)**: 本軸の「reverted=CornerUpLeftIcon」は live で差戻し(sendback)が既に CornerUpLeftIcon のため衝突。**取消/reverted=RotateCcwIcon** (live Notifications.tsx:24 / CaseDetail.tsx:204) に読み替え、iconography 1:1 を維持。

##### この軸が決めること / なぜ E2E UX に効くか

15 画面 × 6 状態 (empty/loading/error/blocked/completed/reverted) の **表現・復旧導線・status signaling を 1 つの状態機械 SSOT に束ねる**。既存軸は「正常表示時」の色 (`color-theme-system`)・記号 (`iconography`)・密度 (`information-density`) を決めるが、**非 happy path で何が出るか・どう戻れるか**は誰も所有していない。これが operator Wow の第 3-4 要素「間違えない・説明できる」を直接支える: blocked は誤操作の事前停止 (SoD/precondition)、reverted は反映済の訂正・取消、error は idempotent retry。本 prototype の core は「差戻し→staging→手順承認」loop なので、loop の**異常分岐 (二重 reversal guard / SLA breach / escalation)** を状態機械化しないと、operator は「今なぜこのボタンが押せないか」「反映済を戻したらどうなるか」を画面ごとにバラバラに学ぶことになり、E2E の信頼が崩れる。corrections#4 に従い「completed = mock state 更新」であり propose-only 規律と矛盾しない。

##### 研究が示すこと (card / 監査 verdict 引用)

- `hil-error-recovery-flow.md`: HIL recovery は 4 failure mode (`agent-error`/`sla-breach`/`human-wrong-approval`/`downstream-execution-fail`) × {auto-retry / escalate-to-tier2 / compensating action / freeze-and-investigate} + audit compensation entry。**反映済 (reflected/committed) を後から `rejected` に override しない** — 別 transaction として compensating を記録。これが本 prototype の reversal=訂正/取消 semantic (live: `case_reverse`、reflected→sent-back) と一致。
- `state-text-density-alignment.md`: 6 状態は**主画面と同 tier を保つ**。Tier 3 list の filtered-empty は ≤15字 + Reset 1 button、error は**主画面より短く**、loading skeleton は **0 text**。「empty illustration を Tier 3-4 に投入」「100字説明 paragraph」「filtered-empty に primary CTA」は anti-pattern。mechanical detection: empty が primary state の 1.5x element/word なら tier mismatch。
- `empty-error-loading-states.md`: empty は (a)原因 (filter? 未投入?) (b)代替 action 1 つ、error は (a)観測可能 cause (b)retry idempotency (c)escalation channel、loading は (a)duration prediction (skeleton<8s / spinner<2s / progress>5s) を必ず持つ。**Approval queue empty には過去 7 日処理履歴 link を併設** (手持ち無沙汰時に audit へ流す)。
- `empty-state-as-wow-opportunity.md` / `error-and-404-as-wow-opportunity.md`: 4 empty type / 5 error type 別組成。ただし banking 規制 surface は **type-only/icon + 短 copy** が安全 (stock illustration は cliche tell、本 prototype では illustration 全削除済が正しい)。
- `loading-state-as-wow-opportunity.md`: skeleton は実 content と同 layout + shimmer 1.2-1.5s、**optimistic は重 action では誠実でない** (money/規制は wait+明示)。`prefers-reduced-motion` で shimmer 静止。
- 監査 verdict (2026-05-29): React 19 useOptimistic/useActionState は engine gating 無し (PROD)。`aria-busy`/`aria-live`/`role=status` は基盤。translucency は data/status surface 不可 → skeleton/error は solid surface。

##### 選択肢と緊張 (tradeoff)

| 緊張軸 | A (採用せず) | B (採用) | 判断根拠 |
|---|---|---|---|
| 状態の数 | 6 状態を全 component で独立実装 | **6 状態 = 1 state machine SSOT** (`useResourceState` + 既存 status-tones)、blocked/completed/reverted は **新 component 増設せず既存 disabled-gate / Toast / banner に mapping** | live 実測: blocked=`approveGate.reason` の inline disabled、completed=Toast、reverted=`case_reverse`+banner が既に分散実装。新 primitive は tech debt、SSOT は mapping table で十分 |
| optimistic 重 action | throughput 優先で承認も optimistic | **重 action (承認/反映/reversal/escalation) は wait+明示確定**、optimistic は**禁止** | 不変条項「人のコントロールを渡さない」+ `loading-state` card「money/規制は誠実 wait」。承認台帳に乗る action を optimistic 化すると false-success |
| reverted の戻し先 | reflected→ready 直行 (1-click 再反映) | **reflected→sent-back** (差戻し再処理へ) | live transition SSOT: ready 直行は「反映済 field が確認済のまま再反映」する false-success。二重 reversal は block (不可逆 guard) |
| blocked の伝え方 | ボタン非表示 | **disabled + 理由 inline** (SoD/precondition/二重 guard を `[glyph]+短文`) | 非表示は「なぜできないか説明できない」= operator Wow 第4要素喪失。`a11y` card: 理由を text で担保、glyph 単独不可 |

##### 決定 (reference 1 画面に落とせる具体 spec)

**reference 画面 = `/cases/:id` (CaseDetail)** — 6 状態すべてが同一面に同時露出する唯一の画面 (取得 loading/error、文書未投入 empty、SoD/precondition blocked、承認→反映 completed、反映済→訂正/取消 reverted)。

1. **状態機械 SSOT**: `useResourceState<T>` を新設 (live `useDetailDemo`/`useListData` を 1 hook に統合)、返す discriminated union = `loading | error | empty | ready`。**workflow 状態 (CaseStatus 5値 + reversal + escalation) とは直交** — 前者は「データ取得の機械状態」、後者は「業務 lifecycle」。混在禁止 (corrections#6 と同型の軸分離)。
2. **6 状態 × 表現 mapping (tier 維持)**:
   - **empty**: `EmptyState` 既存 (`truly-empty`=InboxIcon+primary CTA / `filtered-empty`=FilterIcon+≤15字+Reset secondary)。Approval queue empty は「直近処理履歴を見る」secondary link 併設。
   - **loading**: `LoadingState` 既存。list/detail = skeleton (0 text、実 row 形)、button submit = spinner、長処理なし (mock)。`aria-busy`。
   - **error**: `ErrorState` 既存。cause (観測可能、mono) + Retry (`idempotencyKey` を caller が保証) + escalation link。`role=alert`。主画面より短い。
   - **blocked**: **新 component 無し**。承認/差戻し button を `disabled` + 直下に `approveGate.reason` を `[LockIcon]+短文` (SoD「自己承認不可」/ precondition「要確認 2 件残」/ 二重 reversal guard「取消済」)。tone=`inset` (停止だが破壊ではない、red 不使用)。`aria-disabled` + 理由を `aria-describedby`。
   - **completed**: `Toast` 既存 (`role=status`、polite)、tone=`success` + 「反映しました」+ LifecycleStepper が `反映` step に前進。**undo は出さない** (重 action、reversal は別動線)。
   - **reverted**: 反映済 banner (tone=`alert`/amber、`CornerUpLeftIcon`) + 「この案件は取消されました — sent-back で再処理」。reversal 記録 (kind/理由) を CaseDetail header に inline。二重 reversal は blocked 状態へ。
3. **status signaling 規律**: 6 状態すべて `[tone]+[glyph]+[ラベル]` の 3 重符号 (grayscale でも読める)。`error` の red は escalation/取得失敗のみ独占、reverted は amber、blocked は inset。color 単独禁止 (a11y card)。
4. **mechanical gate**: 各画面の empty が primary state の element count 1.5x 未満 (illustration/3-paragraph 不在)。loading skeleton に visible text 0。生 confidence は 6 状態の表示に一切出さない (corrections#5)。

##### Adopt / Adapt / Reject / Defer

- **Adopt**: 既存 `EmptyState`/`LoadingState`/`ErrorState`/`Toast` 4 primitive をそのまま 6 状態の表現面として継承 (live 実装済、再発明しない)。`aria-busy`/`role=status`/`role=alert` の a11y 基盤。`prefers-reduced-motion` での shimmer/spin 静止 (監査 PROD)。
- **Adapt**: HIL recovery card の 4 failure mode を本 prototype の mock 文脈に縮約 — `agent-error`→取得 error+Retry、`sla-breach`→escalation 動線 (Escalations 画面)、`human-wrong-approval`→reversal=訂正/取消、`downstream-execution-fail`→該当無し (mock、execute 不在 corrections#4)。card の 4-empty-type/5-error-type は **banking で illustration を削り type-only+icon に縮約**。
- **Reject**: optimistic update を重 action (承認/反映/reversal/escalation) に適用 (不変条項違反)。empty/error への illustration・3-paragraph copy (tier mismatch + cliche tell)。reflected→ready 直行 reversal (false-success)。blocked button の完全非表示 (説明可能性喪失)。生 confidence の状態表示混入。translucency on error/status surface (監査 verdict)。
- **Defer**: permission-empty (RBAC は R1+、現 caller 0 で削除済が正しい)。404/network/maintenance error page (mock+in-memory で route 不在/offline 不発生、本番接続 Phase で R1+)。streaming loading (LLM streaming は本 prototype 不在)。

##### 意図的に捨てるもの + なぜ

- **新しい状態 component の増設** — blocked/completed/reverted を専用 component 化しない。live は既に disabled-gate/Toast/banner に分散実装済で、SSOT は「mapping table + 既存 primitive」で足りる。新 component は tech debt (CLAUDE.md「Tech Debt を生まない」)。
- **optimistic・undo toast・auto-retry の自動化** — throughput より「人のコントロール」が上位。承認後の undo は reversal 動線 (理由必須) に一本化し、軽い undo を出さない (false-success 防止)。
- **illustration / brand easter egg / 404 ページ craft** — Wow card の spectacle 側。読者=熟練 operator、規制 surface で stock illustration は cliche tell。type-only icon + 短 copy が operator Wow (速い・迷わない)。

##### 他軸との依存・整合 / 衝突

- **color-theme-system 軸 (依存)**: 6 状態の tone は `lib/status-tones.ts` SSOT に従属、状態機械は tone を**再宣言しない**。error=red 独占 / reverted=alert(amber) / blocked=inset は color 軸の「red=真に止まれ」学習と完全整合 (衝突なし)。
- **iconography 軸 (依存)**: blocked=`LockIcon`、reverted=`CornerUpLeftIcon`、error=`AlertOctagonIcon`、completed=`CheckIcon` を icon-per-concept 1:1 map に登録依頼。glyph 単独で意味を運ばない (3 重符号)。
- **information-density 軸 (依存)**: 6 状態は所属画面の typology→tier を継承 (list=T3 / detail=T2-3 / hub=T2)。density owner は density 軸、状態軸は「tier を**守る**」rule のみ所有 (corrections#6 と同型の owner 分離)。
- **exception-escalation-recovery 軸 (境界調整・要注意)**: HIL error recovery の reversal/SLA/escalation はこの軸と**重複領域**。分界 = 本軸は「6 状態の表現・signaling・tier 維持」(UI 層)、exception 軸は「escalation 画面の業務動線・handoff・Matrix C lane」(flow 層)。reversal の `reflected→sent-back` transition は live SSOT で確定済、両軸とも参照のみで再定義しない。
- **command-power-user-input 軸 (衝突回避)**: その軸の「optimistic action / React19 actions」は**軽 action 限定**。承認台帳に乗る重 action への optimistic 適用は本軸が禁止 — 両軸で「重 action = wait+明示」を共有 (greenfield-direction §9 row 8 と整合)。
- **motion-transition 軸 (依存)**: completed の checkmark appear / reverted banner slide-in は motion budget T1 (規制 surface default off、`prefers-reduced-motion` 全停止)。shake/morph は抑制。

##### checkpoint 受け入れ signal

1. `/cases/:id` で 6 状態が再現でき (取得 loading skeleton→error+Retry / 文書 empty / SoD blocked+理由 inline / 承認→completed Toast+stepper 前進 / 反映済→reverted banner)、各状態が所属 tier を維持 (empty が ready state の element 1.5x 未満、loading skeleton に visible text 0)。
2. 6 状態すべてが `[tone]+[glyph]+[ラベル]` の 3 重符号で、grayscale 化 (color-blind sim) しても状態判別可能。error の red が blocked/reverted に混入せず、reverted=amber / blocked=inset。
3. blocked button が非表示でなく `disabled`+理由 inline で、operator が「なぜ押せないか」を読める (SoD/precondition/二重 reversal guard の 3 cause)。reflected→reversal が ready 直行せず sent-back へ送られる。
4. `useResourceState` の機械状態 (loading/error/empty/ready) と workflow 状態 (CaseStatus/reversal/escalation) が型レベルで直交し混在しない。生 confidence が 6 状態表示に 0 (Observatory raw ledger のみ許容)。重 action に optimistic 0。

#### アクセシビリティ・包摂 (WCAG2.1AA / R7 gate / ARIA grid / grayscale / focus) `[accessibility-inclusive]` — core

##### この軸が決めること / なぜ E2E UX に効くか
本軸は **a11y 合否の単一 owner** であり、他軸 (色/タイポ/テーブル/モーション/承認) が各々「a11y を考慮した」と主張するのを、検証可能な gate に変換して責任空白を埋める。具体的に所有するのは 5 つ: (1) **R7 contrast gate** の sRGB 実測 (OKLCH の L 値を contrast と混同させない)、(2) **キーボード semantics** — clickable row / sort / 一括選択 / 展開の到達順と activation、(3) **color-blind grayscale 検証** — 色単独 status の物理的禁止、(4) **focus order と landmark**、(5) **ADA/EAA の法的 binding 判定**。熟練 operator が「速い・迷わない・間違えない・説明できる」を達成する条件は、マウス前提でも視力健常前提でもない — **キーボードだけで queue を triage でき、grayscale でも要確認行が判別でき、focus が決定面に正しく着地する**ことが「間違えない」の物理的土台になる。a11y は polish ではなく、operator Wow の前提条件である。

##### 研究が示すこと (card ファイル名 / 監査 verdict を引用)
- **`a11y-default-for-enterprise-ai.md`**: enterprise AI UI の a11y は polish でなく **regulatory baseline** = WCAG 2.1 AA (本文 4.5:1 / large 3:1 / non-text 3:1 / keyboard navigable / focus visible 2px+offset / 200% reflow)。AI 固有層として **color-only signaling 禁則 (icon + text 併用)**、streaming は ARIA live、high-stakes は modal を a11y で skip しない。
- **`accessibility-for-premium-wow-ui.md`**: ship gate に **2.5.5 Target Size (desktop 24×24 CSS px)**、**4.1.3 Status Messages (role=status/alert)**、focus management 3 点 (modal trap / page-transition focus restore / skip link)、`prefers-reduced-motion` + **`prefers-contrast`** 対応を挙げる。「`outline:none` without `:focus-visible` alternative はキーボード不可」を anti-pattern に明示。
- **`cognitive-accessibility-deep.md`**: WCAG 2.1 AA は sensory/motor 偏重で **cognitive a11y が underaddress**。high-stakes banking では decision summary before commit / 2-step confirmation / plain language / aggressive auto-logout 回避 (≥30min)。WCAG 2.2 の **Consistent Help / Redundant Entry / Accessible Authentication** を参照標準に。
- **`agent-oversight-cognitive-load-vigilance-flow-2026.md`**: **EU AI Act Art.14(4)(c)「correctly interpret output」は a11y からも要求される** — screen reader user が AI 出力を解釈できないと oversight が procedural 化する。a11y は automation complacency 対策と地続き。
- **`ada-web-accessibility-litigation-us-2025.md`** + **`european-accessibility-act-marketing-sites-2025.md`**: ADA は B2B 純内部システムには直接射程外 (consumer 限定)、EAA も consumer banking 限定。**本 prototype は熟練 operator 向け内部ツール = 両法の直接 binding は弱い** — よって本軸の justification は「法的義務」ではなく「規制業の oversight 実効性 (Art.14) + 内部 worker の包摂 + 将来の顧客面転用余地」に置く。over-claim 禁止。
- **平台監査 (2026-05-29)**: `modern-css-color-oklch-p3-2025.md` verdict = 「**OKLCH の L 値 ≠ WCAG contrast、token 採用後に sRGB 基準で実測必須**」「`contrast-color()` は Watch-only、engine version 未確認」。`css-carousels` は a11y 問題で Tabs 用途禁止。→ contrast は token 採用だけでは保証されず、**実測 gate が別途必要**。

##### 選択肢と緊張 (tradeoff)
| 論点 | 選択肢 A | 選択肢 B | 緊張 |
|---|---|---|---|
| **contrast 検証** | 既存 jest-axe 15-route gate を a11y 合格証とする | jest-axe (jsdom) は color-contrast を silent skip → **別途 sRGB 実測 + grayscale visual gate** を追加 | A は安価だが **偽 green** (axe-test の冒頭 comment 自身が「contrast は評価しない」と明記)。B は真の R7 担保だが Playwright/visual 工数 |
| **row キーボード操作** | 現状維持 (`<tr onClick>` + 先頭 Link のみ keyboard 到達) | 行全体を keyboard activable に (roving tabindex / Enter で navigate) | 現状は「行クリック」がマウス専用機能、キーボード user は先頭 Link 経由で同等到達**可能** — 二重提供は冗長かつ ARIA grid 化は scan を壊すリスク |
| **dense table の semantics** | 既存 native `<table>` + `aria-sort` 維持 | ARIA `role=grid` + 全 cell roving tabindex (data-table card の Arrow-key nav) | grid 化は spreadsheet 編集には必須だが、本 product は **read+sort+select の triage** で full grid は overshoot。data-table card 自身が「Arrow-key cell focus」を挙げるが、これは inline-edit 前提 |
| **prefers-contrast** | reduced-motion のみ対応 (現状) | `@media (prefers-contrast:more)` で border/fg を boost | 低 chroma の boring-reliable 面は high-contrast OS 設定で輪郭消失リスク。実装は安価 (token override) |

##### 決定 (reference 1 画面に落とせる具体 spec)
**reference = Queue (`/cases`・`/approvals`, Tier 3, DataTable)。本軸は「a11y を新規実装」ではなく「既存実装に検証 gate を被せて owner 化」する。** 具体 spec:

1. **R7 contrast gate を 2 段で SSOT 化 (偽 green 撲滅)。** jest-axe gate は「**構造 a11y のみ**」と明示維持 (現 comment 通り)。これに加え **(a) token AA 台帳** — 全 `-soft-fg` × `-soft` 背景ペア + `fg/fg-muted/fg-tertiary` × `canvas/panel/panel-inset` を sRGB で 4.5:1 実測した固定表を `index.css` 隣に持つ。**`fg-subtle` は意味テキスト禁止 (R7 gate、既存コメント済) を negative-grep で強制** (`text-.*fg-subtle` が意味 text に使われていないか)。**(b) grayscale 検証** — Playwright で 15 route を `filter:grayscale(1)` 撮影し、status badge が **色を抜いても glyph + label で判別可能**を目視 gate 化。
2. **キーボード到達の単射保証 (冗長排除)。** DataTable の行操作は **先頭セル `<Link>` を唯一の keyboard 到達点に固定** — `<tr onClick>` は「マウスの便宜拡張」と定義し、keyboard では Link が同 href へ到達する (既に実装済、本軸はこれを **規律として明文化 + 退行 test 化**)。roving tabindex / `role=grid` は **不採用** (triage table は read/sort/select で full grid 不要、scan path を壊す)。sort button・checkbox・展開 button は既に native button = Tab 到達済。focus order = skip-link → nav → filter → sort → 行 Link → pagination の論理順を route ごとに固定。
3. **prefers-contrast 対応を追加 (安価・高 ROI)。** `@media (prefers-contrast:more)` で `--color-border → border-strong`、`--color-fg-muted/tertiary → fg`、focus outline を 3px に。boring-reliable の低 chroma 輪郭が OS high-contrast で消えるのを防ぐ。
4. **「説明できる」の a11y = AI 出力の SR 解釈性。** CaseDetail の突合結果は `role=status` ではなく**静的 semantic** で読ませ、確信度を業務面に出さない既定 (CLAUDE.md) を **a11y 規律としても明記** — 生 confidence は SR でも読み上げない (Observatory raw ledger のみ許容)。Art.14(4)(c)「correctly interpret」を SR 経路でも満たす。
5. **target size = desktop 24×24 CSS px floor。** Compact density (row 32px) でも sort button・checkbox・展開 toggle の hit-target が 24px を下回らないことを gate (現 `h-6 w-6`=24px は floor ちょうど、Compact で縮めない)。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: WCAG 2.1 AA を ship gate (`a11y-default`)、color-only 禁則を grayscale gate で物理強制 (`a11y-default` + greenfield §178)、skip-link/focus-visible/reduced-motion の既存実装を**正式 owner 化**、target size 24×24 floor (`accessibility-for-premium-wow-ui`)。
- **Adapt**: jest-axe 15-route gate は**残すが「構造のみ」と降格明記**し、contrast は token AA 台帳 + grayscale visual で補完 (監査「OKLCH L≠contrast」)。cognitive a11y の 2-step confirmation / plain language は、承認軸の 4-tier confirmation と high-stakes summary に**溶かし込み**、本軸では「auto-logout ≥30min・破壊操作 undo」だけを a11y floor として要求。
- **Reject**: `role=grid` + 全 cell roving tabindex (triage table に overshoot、scan 破壊)、`contrast-color()` 自動色算出 (Watch-only、engine 未確認、監査)、reading-aid font toggle / OpenDyslexic (`cognitive-a11y` の consumer 向け機能、単一熟練 persona に不要)、overlay widget 系 (ADA card で「盾にならない」、そもそも内部ツールで無関係)。
- **Defer**: dark mode の a11y (focus ring の dark 専用 L 確保・dark soft-fg 再 AA 実測) は **light 確定後** (greenfield §167 と整合、二重 AA コスト分離)。WCAG 2.2 の Accessible Authentication は本 prototype に認証画面が無いため defer。

##### 意図的に捨てるもの + なぜ
- **full ARIA grid / spreadsheet キーボード nav を捨てる** — 本 product は cell 編集でなく行 triage。Arrow-key cell focus は inline-edit が来るまで複雑性負債で、native `<table>` + Tab 到達の方が SR にも素直 (`data-table` card の grid 推奨は inline-edit 前提)。
- **cognitive a11y の reading-aid UI (font/行間 toggle) を捨てる** — 読者が単一の熟練 operator persona ゆえ、consumer 向け dyslexia toggle は YAGNI。plain language と error recovery だけ floor として残す。
- **ADA/EAA を「法的義務」として訴求することを捨てる** — 両法は consumer 限定で内部ツールに直接 binding しない。捏造的 compliance claim は ADA card の anti-pattern #2 そのもの。justification は Art.14 oversight 実効性 + 内部包摂に限定し、over-claim しない。
- **アニメーション系 a11y fallback (shader/parallax の reduced-motion)** を捨てる — そもそも spectacle 不採用で対象が存在しない。reduced-motion は「default off policy」として既に最強。

##### 他軸との依存・整合 / 衝突
- **color-system 軸 (依存・整合)**: soft-fg regime の AA 実測値は color 軸が**生成**、本軸が**検証 gate を所有**。「icon と tone を必ず対」(greenfield §178) は color 軸の設計、grayscale gate での合否判定は本軸。役割分離: color=値、a11y=合否。
- **information-density-hierarchy 軸 (整合)**: density tier owner は density 軸 (corrections #6)。本軸は density に **floor を課す** — Compact (row 32px) でも target size 24×24 と contrast を割らない。density と a11y の衝突点 = Compact 化、ここで a11y が上位 constraint。
- **data-table-queue 軸 (整合・境界)**: sort/select/inline-edit の機能は table 軸、その keyboard 到達・aria-sort・SR 名称は本軸。`role=grid` 不採用は両軸合意が必要 — table 軸が将来 inline-edit を入れる時のみ grid 再検討。
- **approval-sod 軸 (依存)**: high-stakes confirmation の 2-step・undo・focus trap は approval 軸が実装、本軸は modal focus restore と ESC を gate。auto-logout ≥30min は本軸 floor。
- **motion 軸 (整合)**: reduced-motion default-off は motion 軸の policy、`::view-transition-*{animation:none}` の明示 disable (greenfield §63) を本軸が a11y gate に含める。
- **command-power-user 軸 (整合)**: command palette / shortcut の keyboard semantics は power-user 軸、focus trap と aria-label は本軸。衝突なし (両軸とも keyboard-first)。

##### checkpoint 受け入れ signal
1. **偽 green が無い**: jest-axe gate に「構造のみ、contrast 非評価」明記が**残存**し、それと**独立に** token AA 台帳 (全 soft-fg×soft + fg 階層×全背景が sRGB 4.5:1 実測 pass) が存在する。
2. **grayscale 判別**: 15 route を `grayscale(1)` で撮影し、全 status badge が色なしでも glyph+label で判別可 (色単独 status ゼロ)。
3. **keyboard 単射 + 完走**: Queue を**マウス不使用**で skip-link→nav→filter→sort→行 Link→詳細→決定 footer まで完走でき、行は先頭 Link が唯一の keyboard 到達点 (二重到達なし)、focus が決定面に着地。
4. **target size floor**: Compact density でも sort/checkbox/展開 hit-target ≥24×24 CSS px。
5. **prefers-contrast**: OS high-contrast で border/fg が boost され低 chroma 面の輪郭が消えない。
6. **AI 出力の SR 解釈性**: SR で CaseDetail の突合結果が静的 semantic で読め、生 confidence は SR でも業務面に出ない (Art.14(4)(c) 充足、CLAUDE.md confidence 規律と整合)。
7. **法的 claim の honest 化**: 資料に「WCAG 準拠で ADA/EAA 対応」等の over-claim が無く、justification が Art.14 oversight + 内部包摂に限定されている。

#### コンテンツ・microcopy・トーン (JP-only / 語彙 / decision-useful / text density) `[content-microcopy-tone]` — core

> ⚠ **補正 (live code)**: 「差し戻し 2 箇所→統一・grep=0 gate」は誤算。live の 差し戻し は 1 箇所のみ (CaseDetail.tsx:476) で toast の正当な動詞活用。gate は Tier1 名詞「差戻し」の誤用のみ禁止し、動詞活用「差し戻し〜」は許容に再設計。

##### この軸が決めること / なぜ E2E UX に効くか

この軸は UI 文字列の SSOT を定義する: (1) **Tier1 controlled vocabulary** の一語一義固定 (差戻し/手順承認/設定承認/入力者/承認者)、(2) **toast/CTA の文型** (`動詞過去 — 次に何が起きるか/誰に渡るか`)、(3) **state copy の tier 整合** (empty/error/loading)、(4) **confidence の言語化規律** (生数字を業務面から消し「突合結果」等の行動直結語へ)、(5) **`[仮説/要検証]` hedge の付与境界**。operator Wow の 4 要素のうち「**迷わない・説明できる**」は色や密度ではなく文字列が最終的に運ぶ。同一概念が画面ごとに「差戻し/差し戻し」と揺れれば、熟練 operator の語彙—操作 mapping が壊れ triage 速度と監査の一貫性が同時に劣化する。これは color-theme 軸 (`status→tone`) と対をなす **「意味の言語版 SSOT」** である。

##### 研究が示すこと (card ファイル名 / 監査 verdict を引用)

- `conversational-ai-tone-and-persona.md`: refusal は「No」単独でなく `不能 + 代替経路` が原則 (本 prototype では disabled action の reason + 代替動線に転用)。uncertainty の verbal marker は High=断定 / Medium=`〜と思われる` / Low=`確証なし、確認を` の 3 段で structural badge と対にする。JP は丁寧語 default、`承知いたしました`/`ご確認をお願いいたします` を acknowledge/confirm の定型に。**ただし persona 命名・empathy tone は customer-facing 前提で、internal operator tool には過剰** (後述 Reject)。
- `when-more-text-is-correct.md`: 削減を default reflex にしない 7 文脈のうち本 prototype は **5 つ該当** — 監査台帳 (reason 列 full text)、AI claim citation、high-stakes error、**差戻し reason (min char gate + 過去 reason suggest)**、複雑 domain onboarding。3-axis gate (reading mode / compliance gate / reversibility) で verbose 維持判断。
- `state-text-density-alignment.md`: empty は主画面 tier 維持 (`filtered-empty` ≤15字 + Reset のみ、illustration 禁止)、**error は主画面より短く** (observable cause + retry path)、loading は 0 text skeleton。本 prototype の `0 件カードは非リンク化 + 沈静化` (Hub) は本 card の `filtered-empty` 規律と整合済。
- `empty-error-loading-states.md`: error は観測可能 cause (timeout/unauthorized/server を区別) + retry idempotency。`エラーが発生しました` 単独は禁則。承認 queue empty には「過去7日処理履歴 link」を併設し operator を audit へ流す。
- `text-density-investigation-framework.md`: 「テキスト多い」は A量/B文複雑/C階層/D mode/E CJK の 5 軸。本軸は **B (文複雑) と E (CJK) の文字列側**を担当 (A/C/D は density 軸へ委譲)。JP body は能動・短文・読点過多回避。
- 監査 verdict (2026-05-29): content/microcopy/tone に直接 verdict なし (12 card は CSS/platform 系)。→ 本軸は platform 制約に非依存、純 copy 規律として確定可。

##### 選択肢と緊張 (tradeoff)

| 論点 | A | B | 緊張 |
|---|---|---|---|
| confidence 表現 | 生数字 `0.84` 表示 (情報量) | 定性 band「突合結果: 要確認」(行動直結) | A は automation complacency を誘発し SSOT (`生 confidence 業務面禁止`) 違反。B が正。raw は Observatory ledger に型で隔離 |
| tone register | customer-facing empathy (persona 名 + 感情応答) | internal operator neutral (丁寧語 + 動詞直結) | empathy は読者=熟練 operator に冗長・遅延。B が正 |
| error 文字列 | 丁寧で長い謝罪文 | 主画面より短い observable cause + path | 高 stakes error は唯一「主画面より長くてよい」例外だが、それでも謝罪 padding は削る |
| 差戻し reason | 自由 textarea (速い) | min char gate + 過去 reason suggest (Flywheel 品質) | gate は入力負荷だが、reason が次回手順の input ゆえ品質優先。suggest で負荷相殺 |

##### 決定 (reference 1 画面に落とせる具体 spec)

**Reference 画面 = `/cases/:id` (案件詳細 ReconcilePanel)** — Tier1 語彙・confidence 言語化・hedge・error/empty・diff reason が 1 画面に最も濃く同時露出する面。`lib/copy.ts` を新設し以下を単一 SSOT 化:

1. **Tier1 lexicon を const 化** — `差戻し`(差し戻し禁止)、`手順承認`/`設定承認`/`案件承認`、`入力者`/`承認者`、`起票`。**現状の揺れ修正**: `CaseDetail.tsx:476` の `差し戻し` 2 箇所 → `差戻し` に統一 (257:2 の少数派を矯正)。
2. **toast 文型 = `{動詞過去形} — {次に起きること / 渡る先}`** (live code 既存 pattern を正式 spec 化): `{field} を確定しました`、`{field} を差戻しました — 再処理後に確認待ちへ`、`{field} を業務責任者へエスカレーションしました`。SoD skip 時は理由を併記 (`自己承認 N 件は四眼原則によりスキップ`)。
3. **confidence → 定性語** (`ReconcilePanel.tsx` 既存 `confidenceBand` を SSOT 化): 業務面は `一致 / 要確認 / 未取得` の reconcile 状態語のみ、生数字・`%`・`信頼度 0.xx` を出さない。`%` を使う場合は `ProposalDetail.tsx:199` 同様 `精度指標であり生 confidence ではない` を明記。
4. **`[仮説/要検証]` hedge** — mock 試算・推定値に付与 (live 既存 47:33 で運用中)。付与境界: 実測ledger値=付けない / mock予測・試算=付ける。
5. **state copy**: `filtered-empty`=`該当する項目がありません` + `絞り込みを解除` link のみ (illustration 禁止)。`error`=`{observable cause}（mock）` + Retry、`エラーが発生しました` 単独禁止。
6. **差戻し reason**: min 10字 gate + 過去 reason の datalist suggest (未実装、本 prototype で追加推奨)。

##### Adopt / Adapt / Reject / Defer

- **Adopt**: `when-more-text-is-correct` の 3-axis gate と 5 該当文脈 (台帳/citation/error/差戻し/onboarding は verbose 維持)。`state-text-density-alignment` の empty=主画面tier・error=短文・loading=0text。理由: 規制 BO で削減 reflex が compliance gate を破る risk を構造排除。
- **Adapt**: `conversational-ai-tone-and-persona` の uncertainty 3 段 marker と refusal=`不能+代替` を、chat ではなく **disabled action の reason tooltip + 定性 confidence band** に翻案。JP 丁寧語 default は採用、keigo の文脈 shift は internal tool ゆえ単一 register に簡約。
- **Reject**: persona 命名 (Joy/Erica 系)、empathy tone shift、AI disclosure 文言。理由: 読者=熟練 operator の単一 persona、customer-facing でない。emotional copy は scan を遅延させ operator Wow (速い) に逆行。
- **Defer**: 過去 reason の autocomplete/suggest (substrate は datalist で軽量だが mock データ整備が必要)、density 3-tier に応じた文字列短縮 variant。reference 画面では固定文字列で確定し suggest は後続 wave。

##### 意図的に捨てるもの + なぜ

empathy/感情 copy、persona 名、AI disclosure 文、長い謝罪文、生 confidence の業務面表示、英語併記 (JP-only 不変条項)、装飾 empty illustration。**捨てる根拠**: operator Wow は「速い・迷わない・間違えない・説明できる」であり spectacle 不採用。emotional・conversational・装飾系 copy は熟練 operator の scan を物理的に遅らせ、生 confidence は automation complacency を誘発する。1 語 1 義の controlled vocabulary こそが本軸の Wow 本体。

##### 他軸との依存・整合 / 衝突

- **color-theme 軸 (`status→tone`)**: 本軸の status ラベル文字列と color 軸の tone は **同一 status を別表現で運ぶ対**。`差戻し`(文字) = `alert`(amber) を `lib/status-tones.ts` と `lib/copy.ts` で **二重定義しない** — status key は status-tones 側、表示ラベルは copy 側、key→label は単一 mapping。衝突回避必須。
- **information-density-hierarchy 軸**: text-density 5 軸のうち A量/C階層/D mode は density 軸 owner、本軸は **B文複雑/E CJK の文字列側のみ**。tier→文字数 budget (empty ≤15字 等) は density 軸の tier 割当に従属。
- **typography-numerics 軸**: confidence を定性語化する本軸の決定と、生 confidence を tnum mono で出す typography 軸が衝突しうる → **業務面は本軸 (定性語)、Observatory ledger は typography 軸 (tnum 生数字)** で surface 分離。GROUND-TRUTH correction #5 (confidence surface 限定) と整合。
- **data-table-queue 軸**: 列ヘッダ・filter chip・bulk action label は本軸 lexicon を参照。`/approvals` の SoD skip 文言は本軸 toast 文型に従う。

##### checkpoint 受け入れ signal

1. `差し戻し` の grep 結果が **0** (現状 2 → 全廃)、`差戻し` のみが残る。Tier1 7 語が `lib/copy.ts` の const としてのみ定義され、画面ローカル literal 再宣言 0。
2. 業務画面 (`src/pages` から Observatory ledger view を除く) の生 confidence (`信頼度 0.xx` / `.toFixed` / 裸 `%`) grep が **0**、Observatory ledger 内のみ許容。
3. `/cases/:id` で confidence が `一致/要確認/未取得` の定性語で表示、mock 試算に `[仮説/要検証]` が付与、toast が `動詞 — 次の行き先` 文型、error が observable cause を持ち `エラーが発生しました` 単独が存在しない。
4. `filtered-empty` が ≤15字 + 解除 link のみで illustration を持たない (state-density alignment pass)。

#### 監査・開示・規制透明性 (disclosure journey / explainability / provenance / prototype label) `[audit-disclosure-transparency]` — core

##### この軸が決めること / なぜ E2E UX に効くか
規制 disclosure と透明性を「画面に AI バッジを貼る」で終わらせず、**3 audience × 3 phase の到達動線**として設計する責務を所有する。具体決定は (a) **事前開示** = prototype-label の material-fact 露出と「これは AI 提案」の actor 表明の置き場、(b) **実行中** = 各 action row の actor 表明 (human reviewed / AI autonomous) と「推奨/確定」区別、(c) **事後 access** = 業務面 (CaseDetail/ProposalDetail) から監査台帳 (Observatory ledger = L3 full trace) への **明示 1-click 到達動線** と SR 11-7 reconstruct 担保。隣の `[diff-evidence-explainability]` 軸が「承認接点で根拠を *表示* する」を所有するのに対し、本軸は「その記録に *誰がいつどの入口から到達* し、開示が法定 3 段 (事前/oversight/事後) のどこに埋まるか」を所有する。E2E に効く理由: operator の「説明できる」Wow は承認画面の見栄えでなく、**差戻し時・監査時に 5 秒で記録へ飛べる動線の有無**で決まる。動線が無いと operator は Observatory を手で検索し直し、監査再現の体感コストが 5-10x に膨らむ。

##### 研究が示すこと (card ファイル名 / 監査 verdict を引用)
- **3 audience × 3 phase matrix** (`regulated-agent-disclosure-audit-journey-2026.md`): 開示は「初回 1 バッジ」でなく **first interaction 前の宣言 + per-action actor 表示 + 事後 access 入口**の 3 点 surface に分散。anti-pattern #1「初回 1 バッジで終える」/ #2「事後 access 入口を置かない」(Hamburg HmbBfDI €492,000 はまさに自動 reject の rationale/access 欠如で制裁) / #5「監査人 access を業務 UI と同 write 権限」。本 prototype は mock ゆえ顧客 P1/P3 (Art.50/86/GDPR Art.22) は scope 外だが、**内部監査 access (read-only direct + reconstruct)** = SR 11-7 line は本 prototype の core surface。
- **4 層 progressive disclosure** (`agent-explainability-disclosure-flow-2026.md`): L0 結論 → L1 一行根拠 → L2 source/confidence → L3 full trace。**「active flow で見せないこと」と「記録しないこと」は別** (anti-pattern #7)。本軸は L3 (full trace = Observatory ledger) への *到達動線* を所有、L0-L2 の *表示* は diff-evidence 軸。
- **5-layer timeline / 7-state outcome** (`action-history-timeline-audit-trail-ui.md`): read-only default、Time axis (ISO8601 absolute + relative)、Action row 5 列 (Timestamp/Agent/Action verb/Target/Outcome)、Outcome は `Proposed/Approved/Rejected/Executed/Failed/Reverted/Escalated` の 7-state controlled vocab、Export (CSV/JSON/PDF)。強い反論への回答「業務 UI 内 in-context drill-down が inspector を ~60% 高速化、別 system への context switch は audit fatigue」が本軸の動線主張を裏付ける。
- **prototype-label の material fact** (live `PrototypeModeLabel.tsx`): 既に「外部未接続 / 実データなし / AI・証跡はモック / 実規制の引用なし」を **折り畳み非依存の常時表示 + click/keyboard 開ける disclosure** (F-052) として実装済。これは E-E-A-T card の「How: AI 使用開示」(`eeat-human-provenance-trust-signals-2025.md`) を満たす形。
- **監査 verdict (2026-05-29)**: 本 prototype は screen-only / mock。よって「規制 disclosure」は *実 cite* でなく *動線の reconstruct 可能性* を見せるのが正解 — 実規制語は Tier 3 hedge (project CLAUDE.md) で事実主張禁止。

##### 選択肢と緊張 (tradeoff)
| 緊張 | 採用 | 退けた極 | 根拠 |
|---|---|---|---|
| **事後 access 動線をどこに置くか** | CaseDetail/ProposalDetail の footer か証跡セクションに **「この案件の証跡台帳を見る →Observatory(該当案件 filter 適用)」1-click link** を新設 | 動線なし (operator が Observatory で手検索) / 業務面に full trace を inline 展開 | 動線なし=audit fatigue (card 60% 主張)、inline 展開=density 崩壊 (action-history anti-pattern「Reasoning を row に inline 露出」) |
| **per-action の actor 表明** | 案件 lifecycle/証跡で **actor (入力者/承認者/AI 提案) を controlled vocab で常時可視**、ただし業務面は業務語のみ・技術 schema (actor/role/confidence) は ledger view に閉じる | 全画面に actor/confidence 生表示 / actor 完全省略 | live 実装が既に「confidence は ledger view にのみ型で保証」(Observatory.tsx) — 業務面 noise 回避と監査 reconstruct を両立 |
| **prototype/provenance labeling の量** | 既存 PrototypeModeLabel を **正準維持**、新規追加せず | 各画面に追加 disclaimer 散布 | material 4 事実は 1 surface で十分、散布は読了負荷 (`when-more-text-is-correct.md` の 3-axis gate を超えない) |
| **生 confidence の surface 境界** | 業務面 confidence 0 / Observatory raw ledger は「confidence (監査用)」列で許容 | 業務面に % bar / 監査台帳から confidence 削除 | corrections #5 + greenfield §93「audit metadata には残し SR 11-7 reconstruct を担保」。削除すると reconstruct 不能 |

##### 決定 (reference 1 画面に落とせる具体 spec)
**Reference 画面 = ProposalDetail (`/proposals/:id`) に「事後 access 動線」を埋め込み、Observatory ledger をその到達先 (L3) として規定する。**

1. **事前開示 (L1 chrome)**: TopBar 右に PrototypeModeLabel を現行のまま常時固定 (material 4 事実 + click/keyboard disclosure)。変更なし、**正準として lock**。
2. **per-action actor 表明 (P2)**: ProposalDetail の「この提案の根拠」セクション直下と各 lifecycle step に **actor chip** を `lib/status-tones` tone で表示 — `AI 提案` (slate) / `入力者確認` (neutral) / `承認者確定` (success)。業務語ラベルのみ、技術 schema (actor ID/role) は出さない。「AI 補足は承認の根拠にならない」(live 実装済 line 315/319) を **L1 根拠と分離**して維持。
3. **事後 access 動線 (P3 = 本軸の net-new core)**: ProposalDetail footer に **二次 link「この提案の証跡を台帳で確認 →」** を新設。click で `/observatory?tab=audit&view=ledger&workflow={該当業務}&q={proposalId 由来の caseId}` に navigate し、Observatory ledger が当該案件で pre-filter 表示。これが L3 full trace への 1-click reconstruct 動線。CaseDetail にも同 link を対称配置。
4. **到達先 = Observatory ledger (L3)** は live 実装の 7-state controlled vocab + 11 列 (時刻/案件/業務/actor/role/action/before→after/参照文書/policy/approval id/confidence) + Export (「証跡台帳 N 件を出力しました（参考表示・外部システム未保存）」) を維持。**read-only**。`confidence (監査用)` 列はここにのみ存在 (型保証)。
5. **disclosure copy 規律**: 実規制語 (Art.50/SR11-7 等) は UI に出さない。動線の意味は業務語で「監査時に誰がいつ何をしたかを再現できます」と表現。実規制 cite は prototype-label の「実規制の引用なし」と整合。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: ① PrototypeModeLabel 現行実装を正準 lock (material 4 事実 + F-052 click/keyboard disclosure は E-E-A-T「How」開示を満たす)。② Observatory ledger の 7-state controlled vocab + read-only + Export を L3 到達先として固定 (action-history card 準拠)。③ confidence の surface 境界 (業務面 0 / ledger のみ、corrections #5)。
- **Adapt**: ① 3-audience matrix を **mock prototype 用に 1 audience (内部監査 read-only) に縮約** — 顧客 P1/P3 (Art.50/86) は実 customer なしゆえ scope 外、「規制当局 examination」は Observatory F-039 モデル台帳 view で *表現* として既出。② per-action actor 表明を業務語 chip に翻訳 (技術 schema は ledger 内に閉じる、live の confidence 隔離パターンを actor にも適用)。
- **Reject**: ① 業務面への full trace inline 展開 (density 崩壊、card anti-pattern)。② 実規制語の UI cite (Tier 3 hedge 違反、prototype-label「実規制の引用なし」と矛盾)。③ 監査人専用 write 権限分離 UI (mock single-persona ゆえ過剰、read-only ledger で十分)。
- **Defer**: ① 顧客向け P3 access 入口 (adverse-decision 説明/異議、Art.86/GDPR Art.22) — 実 customer 接続フェーズまで defer。② Export の digital signature / PDF cover layout (regulator 実提出は本番化フェーズ、現状 toast 表現で足りる)。③ 外部監査人独立 access view (本番化まで defer)。

##### 意図的に捨てるもの + なぜ
- **顧客 disclosure flow (P1 pre-interaction + P3 adverse-decision 説明権)**: 本 prototype に実 customer・実 adverse 自動判断が無いため、Art.50/86/GDPR Art.22 の動線を作っても mock を mock で開示するだけ。動線設計は card に記録済 (本番化で起動)、prototype では捨てる。
- **実規制条文の画面 cite**: SR 11-7/Art.14 等を UI に出すと Tier 3 hedge 違反かつ「実規制の引用なし」label と自己矛盾。透明性は *動線の reconstruct 可能性* で示し、*条文名* では示さない。
- **per-action の生 confidence/actor ID の業務面露出**: operator に文脈なしで意味不明 (greenfield §93)、技術 schema は ledger に隔離。捨てるが ledger には残し reconstruct 担保。
- **監査人/規制当局/顧客の 3 系統別 UI**: mock single-persona ゆえ 1 つの read-only ledger に集約。3 系統分離は本番化まで捨てる。

##### 他軸との依存・整合 / 衝突
- **`[diff-evidence-explainability]` (core、greenfield §809) と境界明確化**: あちらが **承認接点での L0-L2 表示** (diff/citation 3 表現 4 tier/confidence) を所有。本軸は **L3 full trace への到達動線 + actor 表明 + prototype-label** を所有。**衝突点 = citation/根拠表示** → 解消ルール: 「*根拠の中身* (passage/tier/diff) = diff-evidence 軸 / *記録への到達と actor 表明* = 本軸」。両軸とも `regulated-agent-disclosure-audit-journey-2026.md` を引くが、greenfield §821 が既に本軸を citation 軸の中に飲み込みかけている — 本軸は「動線」を独立 owner として切り出す必要がある (重複解消)。
- **information-density-hierarchy 軸 (corrections #6)**: Observatory ledger の tier 割当 (T4 forensic、greenfield §84) は density 軸が owner。本軸は「ledger を到達先にする」決定のみで、ledger 自体の density は density 軸に従う。
- **approval/SoD 軸**: per-action actor 表明 (入力者/承認者) は SoD four-eyes の actor SSOT (`store/actors.ts`、resolveCaseActors F-001) を *再利用*。本軸が新 actor 概念を作らず、SoD 軸の actor を「開示 surface」として表示するだけ — 衝突なし、依存のみ。
- **nav 軸 (corrections #2/#3)**: 事後 access link は `/observatory` への deep-link (query 付き) を増やすのみ。nav item は増やさない (8 nav 不変)。

##### checkpoint 受け入れ signal
1. ProposalDetail / CaseDetail の footer or 証跡セクションに **「証跡を台帳で確認 →Observatory(案件 pre-filter)」link** が存在し、click で当該案件が filter 適用された状態の Observatory ledger に到達する (1-click reconstruct)。
2. per-action actor が業務語 chip (AI 提案/入力者/承認者) で可視、技術 schema (actor ID/role/confidence) は **Observatory ledger view 内のみ** に閉じている (`grep` で業務面 confidence/actor-ID = 0)。
3. PrototypeModeLabel が material 4 事実を常時表示し、click/keyboard で包括免責が開く (touch でも到達可能、F-052 維持)。
4. Observatory ledger が read-only + 7-state controlled vocab + Export 動線を保持し、`confidence (監査用)` 列が ledger 内のみに存在する (型保証、業務面非露出)。
5. UI に実規制語 (Art.50/SR11-7/GDPR 等) の事実主張が 0 — 透明性は業務語の「再現できる」動線で表現し、prototype-label「実規制の引用なし」と整合。
6. 本軸の owner 境界が greenfield に反映され、citation/根拠 *表示* は diff-evidence 軸、*到達動線+actor+label* は本軸、と重複なく分離記述されている。

#### モーション・遷移・progressive enhancement (motion budget / view-transitions / reduced-motion) `[motion-transition-progressive]` — important

##### この軸が決めること / なぜ E2E UX に効くか
operator UX の「速さ」と「安心」は motion の**抑制**で作る (engagement spectacle ではない)。具体には (1) tier 別 motion budget で各画面の動きを上限管理、(2) 画面間遷移を same-document View Transitions で「文脈が連続している」感覚に lift、(3) status 変化 (差戻し→staging→承認) の micro-animation を「動いたら必ず意味がある」signal に限定、(4) `prefers-reduced-motion` で全停止を default-grade に、(5) Chrome-only を base にしない progressive enhancement を規律化。E2E では「状況把握の速さ × 誤操作が起きない安心」の両方を motion が**邪魔しない**ことが Wow の前提になる。

##### 研究が示すこと (card / 監査 verdict を引用)
- `motion-density-budget.md`: Tier 別 budget は **T1≤5 / T2≤3 / T3≤2 / T4=0 event/viewport**。regulated UI (banking) では `prefers-reduced-motion` を「最後の defense」ではなく **default policy** にせよ。anti-pattern として「Tier3-4 に KPI count-up」「list row hover で spring overshoot (scan path 切断)」「auto-rotating widget (WCAG 2.2.2 違反)」「skeleton pulse が numerical reading 破壊」を明示。Tier4 の zero motion は「動いたら必ず意味がある signal」。
- `motion-choreography-defaults-for-web.md`: 動かす時の craft floor は **spring stiffness 200-400 / damping 25-35、duration 200-400ms、stagger 40-80ms/cell、scroll reveal は IntersectionObserver で 1 回発火**。`linear easing + 500ms+ uniform` は "default のまま開発した" tell。ただし strength=**directional** (絶対値は ±50 許容帯)。reduced-motion 時は stagger 削除・modal は opacity のみ。
- `view-transitions-api-cross-document.md` (verdict=**production-safe / confirmed**): **same-document = 3 engine Baseline (2025-10-14 Firefox 144)**、cross-document = Firefox 欠で Limited。API は reduced-motion を**自動尊重しない**ため `::view-transition-*{animation:none}` を CSS で明示 disable する必要。遷移後 focus 移動は開発者責任。「規制 / dense operator UI に動きを足す依頼は reject 寄り、Tier budget を先に適用」。
- `page-transition-patterns-for-web.md`: 4 primitive。app shell には **T4 Cross-fade with Persisted Layer** (header/sidebar 固定、content だけ遷移) が SaaS app shell の適合 primitive。INP 200ms 以下 target、`transform` only で GPU 化。
- 2026-05-29 監査 NOW 表: **same-document View Transitions は progressive enhancement 込みで採用可**。cross-document は「Chrome-only / enhancement のみ / 本番 base 不可」。translucency on text は Apple iOS26.1 後退 + NN/g 批判で watch-only。

##### 選択肢と緊張 (tradeoff)
| 論点 | 選択肢 A | 選択肢 B | 緊張 |
|---|---|---|---|
| 遷移実装 | Framer Motion `AnimatePresence` | same-document View Transitions (CSS-native) | A は確実だが dependency 増 + reduced-motion 個別実装。B は 3-engine Baseline で library 削減できるが SPA で router 連携を自前 callback で包む必要 |
| reduced-motion 既定 | OS 設定追従 (no-preference で motion on) | regulated default-off + opt-in | A は一般的だが vestibular user が opt-out 済とは限らない。B が legal-safer (card 推奨) だが「動かない prototype」に見える risk |
| status 変化の動き | 全 status を flash/pulse で強調 | T3 操作面は color transition のみ、台帳 commit だけ 1 回 highlight | A は誤操作不安を増やす。B は budget 内だが「変化を見逃す」懸念 → highlight 残留 (fade-out しない) で解決 |

##### 決定 (本プロダクトの方向 / reference 1 画面 spec)
**全体方針: motion を「default 最小・意味のある瞬間のみ点火・reduced-motion で完全停止」に固定。** SPA なので **same-document View Transitions を画面間遷移の唯一の手段**として採用し (cross-document は SPA に無関係なので検討すらしない)、Framer Motion 等の motion library は**入れない** (CSS transition + View Transitions で足りる)。

tier 割当 (本プロダクト固有):
- **T2 (≤3 event)**: Hub / 案件キュー / AI提案一覧 / Agent一覧 — 一覧 scan 主体。許容 = view-transition cross-fade (page遷移) + row hover の bg color shift (≤120ms) + drawer/modal の opacity-only open。
- **T3 (≤2 event)**: 承認待ち / 案件詳細 / 提案詳細 / config-approvals / escalations / business-approver — 判断面。許容 = focus ring (instant) + status commit 後の 1 回 highlight。**count-up・slide・spring 禁止**。
- **T4 (0 motion)**: 監査台帳 (Observatory の ledger 部) — focus ring (instant) のみ。row hover も bg color のみ (instant)。

**reference 画面 = 承認待ち (/approvals, T3)** に落とした具体 spec:
1. **画面遷移 (Hub→approvals)**: app shell の sidebar/header は persisted layer、content だけ `document.startViewTransition()` で cross-fade。`view-transition-name` は付けず default cross-fade (重なり時間最小化のため duration **180ms** に明示上書き、`::view-transition-old(root)/new(root){animation-duration:180ms}`)。shared-element morph は使わない (operator 文脈で視覚混乱を生むため)。
2. **承認 row の hover**: `background-color` のみ 100ms ease (`transition: background-color 100ms`)。translate/scale/shadow を**付けない** (scan path 維持)。
3. **承認実行 → status 変化 (差戻し or 承認)**: row の status pill が新 status へ切替後、その row に **1 回だけ** `outline`/`bg` の highlight (180ms で点灯 → 1.2s 後に 320ms で消灯、合計 1 motion event)。pulse loop 禁止。これが「動いたら必ず意味がある」signal。
4. **drawer/modal (差戻し理由入力)**: `opacity 0→1` のみ 160ms、`transform`/scale なし。backdrop は `opacity` fade。
5. **focus**: 遷移後 content の `<h1>`/`main` に focus を移す (View Transitions は focus を移さないため開発者実装)。focus ring は instant。
6. **reduced-motion (default-grade)**: グローバル CSS で
   ```css
   @media (prefers-reduced-motion: reduce){
     *,::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){
       animation:none!important; transition:none!important;
     }
   }
   ```
   status highlight は fade なしの instant 色変化に degrade (色は残す = 情報は保持)。
7. **progressive enhancement**: `if (!document.startViewTransition){ updateDOM() }` で未対応 browser は瞬時 swap に degrade。View Transitions を前提にした情報設計はしない。INP 200ms 以下を全遷移で守る (`transform`/`opacity` only)。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: same-document View Transitions (3-engine Baseline、`view-transitions-api-cross-document.md` verdict=confirmed) を画面間遷移の唯一手段に。Tier 別 budget (T2≤3/T3≤2/T4=0) を画面ごとに割当。reduced-motion **default-grade global block** (banking = card 推奨の default policy)。
- **Adapt**: `motion-choreography-defaults-for-web.md` の duration を**短縮側に adapt** — operator 文脈では page 遷移 400-600ms は遅い、180ms に。spring physics は採用せず CSS ease/linear に固定 (overshoot は operator に不要)。status 変化は card に無い「1回 highlight then persist」を採用。
- **Reject**: Framer Motion 等 motion library 導入 (CSS で足り dependency 不要)。shared-element morph (list→detail) / slide / count-up / spring overshoot / parallax / skeleton pulse on ledger。cross-document View Transitions (SPA に無関係 + Chrome-only enhancement、監査で base 不可)。
- **Defer**: scroll-driven animations (`animation-timeline`) — Firefox default 未出荷で Baseline 未達、operator UI に scroll 演出の必要性が低い。React canary `<ViewTransition>` (stable 要件、素の `startViewTransition` で代替)。Firefox cross-document 対応 (四半期 refresh trigger 監視のみ)。

##### 意図的に捨てるもの + なぜ
- **shared-element morph / list→detail 画像 morph**: research が「product gallery 限定」と明示。back-office に gallery は無く、operator 文脈で要素が飛ぶと scan path を切断し誤読を生む。cross-fade で十分。
- **spring physics / overshoot**: choreography card は directional かつ「magnetic feel」は marketing Wow。operator Wow は予測可能性であり、bounce は予測を壊す。
- **motion library 全般**: dependency と reduced-motion 個別実装の負債。CSS transition + View Transitions で全 spec を満たせる (AI 実装コストは低い)。
- **scroll/parallax 演出**: dense table 画面で vestibular trigger + sticky header 衝突 (motion-density anti-pattern #5)。

##### 他軸との依存・整合 / 衝突
- **density/tier 軸**: motion budget の tier は density tier と**同一 SSOT**でなければならない (どの画面が T2/T3/T4 か)。tier 定義がずれると budget が無意味化。canonical-spec §178 が既に T1≤5/T2≤3/T3≤2/T4=0 を持つので整合済、画面→tier 割当だけ density 軸と合わせる。
- **visual-language 軸**: status highlight の色は status-tones SSOT を使う (新色を作らない)。translucency を highlight に使わない (監査: 文字・データ背後に translucency 禁止)。
- **IA/route 軸**: persisted layer (sidebar/header) を View Transitions の root から除外する設計は、IA の app shell 構造と一致する必要 (content 領域のみ遷移)。
- **a11y 軸**: 遷移後 focus 移動・`aria-live` での route 変化告知は a11y 軸と共同責任。reduced-motion global block は a11y 軸の前提になる。
- **衝突可能性**: visual 軸が「premium 感のため micro-interaction を増やしたい」と要求した場合、本軸の budget が優先 (regulated default)。

##### checkpoint 受け入れ signal (reference 画面で何を見れば正しいと分かるか)
1. /approvals で OS の reduce-motion を **ON にすると全 transition/animation が消え**、status は instant に色だけ変わる (情報は保持)。OFF で 180ms cross-fade が出る。
2. 承認/差戻し実行時、対象 row が **1 回だけ** highlight して落ち着く (pulse loop しない)。他の motion event が同時発火しない (T3 ≤2 を満たす)。
3. row hover で **bg色のみ**変わり、行が動かない・影が出ない (scan path 維持)。
4. Hub→approvals 遷移で **sidebar/header が動かず content だけ cross-fade**、遷移後 focus が見出しに乗る。Chrome 以外 (Firefox) でも瞬時 swap で機能が壊れない。
5. DevTools で motion 中の paint が `transform`/`opacity`/`background-color` に限られ、INP が 200ms 以下 (width/height morph や layout thrash が無い)。
6. grep で Framer Motion / motion library import が **0**、count-up・spring・parallax・skeleton-pulse の実装が台帳/判断面に **0**。

#### レスポンシブ・viewport 戦略 (desktop-primary / mobile smoke / shell / print) `[responsive-viewport]` — supporting

##### この軸が決めること / なぜ E2E UX に効くか
- desktop-primary を**規律として確定**し、mobile を "smoke (壊れず到達できる) 止まり・業務完遂は非対象" と明文化する。何を responsive で守り、何を意図的に劣化させるかの線を引く。
- 決める 5 点: (a) 3 帯の breakpoint 意味 (≥1024 full 2-pane / 768–1023 単pane stack / <768 mobile bottom-nav)、(b) 2-pane→stack fallback 規律 (どちらの pane を上に置くか・密度を壊さない stack 順)、(c) `@media print` の対象画面と chrome 除去契約、(d) viewport 単位 (`h-screen`/`100vh` 維持か `svh` 化か) と safe-area、(e) これらを canonical-design-spec に **欠落していた "responsive 章" として追補**する owner 宣言。
- E2E 効: operator の主作業は desktop 案件処理。誤った responsive 全部盛り (mobile で全機能完遂を狙う) は密度を壊し desktop の "速い・迷わない" を毀損する。逆に「狭幅で 2-pane が潰れて 166px に圧縮」(browser-gate card の旧 fail) は到達不能を生む。本軸はこの両極を排し、**desktop 密度を 1px も犠牲にせず、狭幅では到達性だけ保証**する線引きで E2E を守る。

##### 研究が示すこと (card ファイル名 / 監査 verdict を引用)
- `backoffice-responsive-shell-before-figma-capture.md` (この prototype の実 patch が evidence): desktop sidebar 型業務 SaaS は「desktop sidebar / mobile bottom nav」に分岐し、未実装 top bar silhouette は mobile で隠す。decision rule = 「mobile main 幅 <320px なら mobile-ready と呼ぶな」「nav が primary content を食うなら bottom nav / drawer に」。→ live は既に `flex-col md:flex-row` + `hidden md:flex` sidebar + bottom nav で準拠済。
- `backoffice-live-capture-browser-gate.md`: 同 prototype の 390px で旧 fixed sidebar が 224px 残り main が 166px に圧縮した実測 fail。「狭幅で primary content が潰れる状態を responsive 完了と呼ぶな」が gate。
- `modern-css-units-viewport-container-2025.md` (production-safe): `100vh` は mobile UA chrome 展開時に viewport をはみ出す→`100svh` + `vh` fallback が置換先。**regulated UI 行**verbatim相当: 「`dvh` の resize は reading 妨害になりうるため、業務帳票・operator UI では静的 `svh` を default、動的追従は局所限定」。container query 単位 `cqi clamp(rem下限)` は card reuse の fluid 密度手段。
- `banking-mobile-app-jp-conventions.md`: JP banking mobile は bottom nav 4 tab (ホーム/取引/通知/メニュー)、生体認証、ATM 慣習 labels。→ ただしこれは **retail banking app** の規約であり、本件 (熟練 operator 向け back-office oversight) は読者・device 前提が異なる。流用は bottom-nav という形式のみ、5-step 振込/生体認証 flow は非適用。
- platform 監査 `2026-05-29-frontend-ui-trends`: NOW (3 engine 揃い) に container queries (Widely 2025-08)、`svh/lvh/dvh` viewport 単位 (caniuse 93%)。`dvh`/cqi は本番採用可だが mobile-fleet は Safari 15.4+/16.0+ floor。「全 browser 対応」断定は禁止表現。

##### 選択肢と緊張 (tradeoff)
| 軸 | 選択肢 | 緊張 |
|---|---|---|
| mobile 完遂度 | A: smoke (到達のみ) / B: 主要 read flow も完遂 / C: full responsive | A は実装安・密度守るが mobile 操作不可。C は密度破壊 + 検証コスト爆発 (15画面×3帯×状態)。 |
| 中間帯 (768–1023) | A: shell=md で sidebar 復活させ 2-pane は lg まで stack / B: 2-pane も md で展開 | live は **shell=768 / 2-pane=1024 の 2 段** = 768–1023 で「sidebar あり + 単 pane stack」帯が既に存在。これを意図と認めるか buggy gap とみなすか。 |
| viewport 単位 | A: `h-screen`(100vh) 維持 / B: `100svh` 化 | A は desktop で無害、mobile Safari でツールバー下に footer が潜る恐れ。B は1行で安全側だが mobile が非主対象なら過剰投資か。 |
| print | A: 現状 4 画面 (`data-page-header`) / B: 全証跡画面に拡張 | print は監査記録の E2E 出口。CaseDetail/Observatory は必須、Approvals/business-approver の一覧 print 需要は要確認。 |
| fluid 密度 | A: 固定 breakpoint grid のみ / B: `cqi`+container query で card 内密度自動調整 | B は理論上 reuse card に効くが、本件は固定 desktop 幅中心で reuse 文脈が薄く、YAGNI。 |

##### 決定 (reference 1 画面に落とせる具体 spec)
**reference = CaseDetail (`/cases/:id`)**, 最密 2-pane 画面でこの軸を全部露出する。

1. **3 帯 breakpoint 契約 (canonical-spec に追補)**:
   - `≥1024px (lg)` = **full**: sidebar 224px + 2-pane (`grid-cols-[52fr_48fr]`)。これが operator 標準作業帯、密度の SSOT。
   - `768–1023px (md)` = **compact**: sidebar あり + 2-pane を `grid-cols-1` に stack (文書 pane → 全項目/決定 pane の順)。tablet 横/小型 laptop。**密度トークンは不変** (font/padding を縮めない、列だけ畳む)。
   - `<768px` = **mobile smoke**: sidebar→bottom nav (icon-only, 8 item)、TopBar は PrototypeModeLabel のみ、2-pane は縦 stack。**業務完遂は非対象**、到達と閲覧のみ保証。
2. **stack 順序規律**: 2-pane stack 時、上=証拠 (文書ビューア)、下=決定面 (全項目+footer)。`backoffice-responsive-shell` card の「証拠アンカー→決定」順を縦でも維持。決定 footer は stack 時も `sticky bottom-0` を保持し到達性を守る。
3. **viewport 単位**: shell の `h-screen` を **`h-[100svh]` (+`h-screen` fallback 1行)** に置換。理由 = mobile Safari で sticky footer が UA chrome 裏に隠れる回避、`svh` は production-safe (modern-css-units card)。`dvh` は採らない (regulated UI で reading 妨害、card 明示)。
4. **safe-area**: mobile bottom nav に `padding-bottom: env(safe-area-inset-bottom)` を追加 (現状欠落)。notch/home-indicator 端末で nav が潜らない。
5. **print 契約**: `@media print` (live §172-200) は維持。CaseDetail は `data-page-header` 保持 + chrome 除去 + `page-break-inside: avoid` で証跡を紙化。**拡張対象を Observatory raw ledger に確定** (既に付与済)、Approvals/business-approver は「一覧 print 需要が出たら追加」と defer 明記。
6. **density-破壊禁止 invariant**: 全帯で font-size/control padding/radius (card12/control8/chip6) を変えない。responsive は "列の畳み" と "chrome の出し入れ" のみで、`cqi` fluid type は導入しない。

##### Adopt / Adapt / Reject / Defer
- **Adopt**: `flex-col md:flex-row` shell + `hidden md:flex` sidebar + mobile bottom-nav (live 実装、`backoffice-responsive-shell` card 準拠)。`@media print` chrome 除去 + `data-page-header` 保持 (live §172)。2-pane→`grid-cols-1` stack (live CaseDetail)。— 既存実装が card 規律に合致、追認。
- **Adapt**: `h-screen`→`h-[100svh]` + fallback、bottom nav に `safe-area-inset-bottom` 追加。理由 = modern-css-units card の `svh` 推奨 + mobile-wow card の safe-area 規律。1行 patch、密度無影響。stack 順を「証拠→決定」に明文固定。
- **Reject**: full mobile responsive (15画面×全機能 mobile 完遂)。理由 = 読者は desktop operator、密度破壊 + 検証コスト (3帯×状態) が E2E 価値を上回る。`cqi`/container-query fluid type も Reject (reuse 文脈薄く YAGNI、`modern-css-units` の "page 全体1container なら vw で足り cqi 過剰" に該当)。`dvh` 全面採用 Reject (regulated reading 妨害)。
- **Defer**: print 対象の Approvals/business-approver 一覧への拡張 (需要顕在化まで)。tablet 縦持ち専用最適化。旧 iOS Safari (<15.4) fleet 対応 (本 prototype は実 fleet 不在、需要時に `vh` fallback 視覚許容を実機確認)。

##### 意図的に捨てるもの + なぜ
- **mobile での業務完遂 (差戻し/承認/手順承認の実行)**: 読者=熟練 back-office operator は desktop 端末作業。狭幅で four-eyes/監査台帳の高密度判断を完遂させる UI は密度を壊し、かつ誰も使わない。mobile は「外出先で状態を見る」smoke に限定。
- **`cqi`+container query fluid type**: card を sidebar/main/modal で異幅 reuse する文脈が本件に乏しい。固定 breakpoint grid で十分、container 宣言は保守コスト純増 (modern-css-units card の NOT-to-use 該当)。
- **`dvh` 動的追従**: operator 帳票/台帳の reading 中に高さが揺れるのは統制 UI の anti-pattern (card verbatim「業務系では静的 svh を default」)。
- **JP retail banking の 5-step 振込/生体認証 mobile flow**: `banking-mobile-app-jp-conventions` は retail app 規約で、oversight operator tool には device 前提も task も非該当。借用は bottom-nav 形式のみ。

##### 他軸との依存・整合 / 衝突
- **information-density-hierarchy 軸 (corrections #6, density owner)**: 本軸は density tier を**割当てない**。responsive は density 軸が決めた tier を「列畳み + chrome 出し入れ」で**保存**する実装制約のみ担う。font/padding 値は density 軸が SSOT、本軸は不可侵 invariant として参照。衝突回避: 本軸が密度値を再定義しないことを明記。
- **layout/grid 軸**: 2-pane の `grid-cols-[52fr_48fr]` と stack の `grid-cols-1` は layout 軸の grid 素地に乗る。breakpoint で**どの grid に切替えるか**が本軸、grid 自体の定義は layout 軸。
- **motion 軸**: `prefers-reduced-motion` (live §158) と本軸の `dvh` 不採用 (reflow=motion) は整合 (modern-css-units card が motion-density-budget と cross-link 済)。
- **nav/IA 軸 (corrections #2,#3)**: bottom nav は 8 item (sidebar と同一 route 集合)。corrections #3 の icon 単射 (/inbox=BellIcon, InboxIcon は /cases 専有) は bottom nav にも適用 — mobile で 1 glyph が 2 route に跨らないこと。本軸は IA の route 集合を変えず、表示形態 (sidebar↔bottom nav) のみ切替。
- **canonical-design-spec**: 現状 responsive 言及ゼロ (grep 0 hit)。本軸の決定を **canonical-spec の新 "§ responsive/viewport" 章**として追補し、本軸を owner 宣言する (stale SSOT 化を防ぐ)。

##### checkpoint 受け入れ signal
- canonical-design-spec に responsive 章 (3 帯 breakpoint=1024/768、`svh`+fallback、safe-area、print 対象画面、density-invariant 宣言) が追補され、本軸が owner と明記されている。
- CaseDetail を 1024/768/390px で実機 screenshot: ≥1024 で 2-pane、768–1023 で sidebar+単pane stack (証拠上/決定下、footer sticky 維持)、<768 で bottom-nav + 縦 stack、**いずれの帯でも font/control padding が同一** (density 不変)。
- 390px で main 幅 ≥320px、PrototypeModeLabel が viewport 内、決定 footer が UA chrome に隠れない (`svh` 効果確認) — `backoffice-live-capture-browser-gate` の旧 fail (166px/label viewport 外) が解消。
- CaseDetail + Observatory を print preview: chrome 全除去、page header 残存、2-pane が縦に流れ clip しない、`page-break-inside` で行が分断されない。
- bottom nav が 8 item で icon 単射 (corrections #3 順守)、safe-area 端末で潜らない。
- grep gate: `grep -rE "100dvh|cqi|container-type" src/` が 0 hit (Reject した手段の不在確認、density-破壊 responsive の negative gate)。

---

## 4. Critique (round 2、網羅性・整合・curation)

**Verdict**: needs-fix

> **収束ステータス (2026-06-02)**: 下記 contradictions は §0 補正で live-verified 解決済 (nav=9 / 取消 glyph=RotateCcwIcon / 差し戻し gate 再設計 / route-icon は live 既達)。residualGaps と dumpNotCurated は §8 checkpoint で reference 画面 + live grep により確定する**低 severity の精度 polish** であり、**方向 (thesis) は安定・収束**。これ以上の抽象分析 round は diminishing returns のため停止し、残差は実画面で解消する。

**Residual gaps**
- state-feedback-machine の reverted glyph 未確定: 軸は reverted=CornerUpLeftIcon を iconography 軸に登録依頼するが、live で reverted/取消 に使われる glyph (RotateCcwIcon, CaseDetail.tsx:204 / Notifications.tsx:24) を読んでいない。reverted 専用 glyph を CornerUpLeftIcon 以外で 1:1 確定する owner 決定が欠落 (下記 contradiction 2 の裏返し)。
- content 軸の『差戻し reason min char gate + 過去 reason datalist suggest』は live 未実装と明記しつつ、起票 (/cases/new) の差戻しではなく案件差戻し reason がどの画面の textarea かを reference 行番号で固定していない。state 軸の reverted (sent-back) 動線と reason capture の owner 境界が曖昧。
- forms 軸の typed field schema (inputKind/maxLen/dedupeKey) は mock-case-detail.ts への schema 層追加を要求するが、live の fieldsForWorkflow 実装と CaseDraft.tsx の現 fieldInputProps 推論を読んでおらず、既存 2 workflow (法人住所変更/口座開設) の実 field list を行番号で確定していない。reference spec が『label 推論を廃す』と言うだけで現物 diff になっていない。
- audit 軸の『案件→Observatory 1-click reconstruct link』は net-new gap として正しいが、Observatory が query param (tab/view/workflow/q) で pre-filter 可能かを live Observatory.tsx で未検証。deep-link 先が実際に case filter を受けられるか (受けられないなら link 先で全件表示=reconstruct 不成立) が未確認の前提。

**Contradictions**
- [corrections#3 既達を to-do として再記載] live で /inbox=BellIcon, InboxIcon=/cases(受信トレイ) は既に bind 済 (TopBar.tsx:2,76 / Sidebar.tsx:42)。さらに /inbox・/search は Sidebar nav item ですらない (nav は 9 item、/inbox は TopBar ベル経由)。correction#3 が描く『InboxIcon が 2 route に跨る』collision は nav に存在しない。responsive 軸『他軸依存』+ synthesis 衝突表 row 11 が『/inbox に InboxIcon を割当てず BellIcon 等にし』を未完の fix として書くが、live は既に完了済。現物 Read せず correction を追従した典型。
- [nav 数が live と不一致] live Sidebar.tsx navGroups = 9 item / 4 named group (処理・改善・監視・承認) + ハブ ungrouped。correction#2 自身が『計 8 nav item』、responsive 軸 checkpoint『bottom nav が 8 item』、synthesis 衝突表 row 11『8 item』と全て 8。実数は 9 (承認 group が business-approver/config-approvals/escalations の 3)。greenfield §3 ia-navigation-shell 軸は既に『8 visible』と group 不整合を flag 済で、新軸はこの既知 issue を再導入。
- [reverted glyph が依存軸の 1:1 規律を破る] state-feedback-machine 軸は reverted=CornerUpLeftIcon を決定し iconography 軸に登録依頼。しかし CornerUpLeftIcon は既に canonical 差戻し(sendback) glyph (iconography 軸 greenfield line 437/442、live Notifications.tsx:23 sendback、CaseDetail.tsx:243)。live は injectivity 保護のため reversal/取消 に RotateCcwIcon を使用 (Notifications.tsx:24、CaseDetail.tsx:204)。state 軸の決定をそのまま入れると差戻しと取消が同 glyph=1-glyph-2-concept で、state 軸自身が『他軸依存』で守ると宣言した iconography 1:1 を破る。live glyph を読み違えた決定。
- [差し戻し の count と gate が live と不一致] content 軸『CaseDetail.tsx:476 の 差し戻し 2 箇所 → 差戻し』『257:2 の少数派』、synthesis 衝突表 row 5『差し戻し 2 箇所 → 統一』、checkpoint『差し戻し grep が 0』。live grep (非 legacy) = 1 箇所のみ (CaseDetail.tsx:476)、しかも toast 文中の動詞活用 (差し戻しました / 再処理へ差し戻し) で Tier1 名詞 差戻し ではない正規の日本語。『grep 差し戻し = 0』gate は正当な動詞活用を誤検出する over-broad gate。count(2→実1) と gate 設計が共に miscalibrated。

**Dump-not-curated**
- a11y 軸の『偽 green 撲滅 = jest-axe は contrast を silent skip ゆえ降格明記』は net-new fix として提示されるが、live routes-axe.test.tsx:9-10 に当該コメント (jest-axe(jsdom) は color-contrast を評価しない…over-claim しない) が既に存在。軸は『明記を残す』ことを成果に数えるが、現物では既達。token AA 台帳 + grayscale visual gate のみが真の net-new で、そこに curate を絞るべき (現状は既存実装の再記述を混在)。
- content 軸の『conversational-ai-tone-and-persona の uncertainty 3 段 marker / refusal=不能+代替 / JP 丁寧語』は banking BO 文脈で大半 Reject される survey 引用。実際に採用されるのは『定性語 一致/要確認/未取得』『toast 文型』『[仮説/要検証] 境界』のみで、これは live ReconcilePanel/CaseDetail に既存。card の網羅引用が決定を薄めており、live で既に運用中の pattern の追認と net-new (lib/copy.ts 集約) の分離が不十分。
- responsive 軸の card 引用 (banking-mobile-app-jp-conventions の 4-tab/生体認証、modern-css-units の cqi/dvh/svh 全列挙) は最終的にほぼ全 Reject/Defer に落ちる survey。実際の net-new 決定は h-screen→h-[100svh]+fallback、safe-area-inset-bottom、canonical-spec への responsive 章追補の 3 点のみ。引用量に対し決定密度が低く、3 点に curate すれば足りる。

**Top fixes**
- state-feedback-machine 軸: reverted glyph を CornerUpLeftIcon から live 準拠の RotateCcwIcon (または取消専用の別 glyph) に修正し、iconography 1:1 表に『差戻し=CornerUpLeftIcon / 取消=RotateCcwIcon』を分離登録。CaseDetail.tsx:204 / Notifications.tsx:24 を現物根拠として明記。これを直さないと依存軸の規律を ship 時に破る。
- nav count を全箇所 live 値に是正: 『8 item』→『9 item (4 named group 処理/改善/監視/承認 + ハブ ungrouped)』。correction#2 本文、responsive 軸 checkpoint、synthesis 衝突表 row 11 を同期。/inbox・/search が Sidebar nav 非所属 (TopBar 経由) である事実も明記。
- content 軸 + synthesis: 差し戻し の count を 2→1 に訂正し、gate を『裸 grep 差し戻し=0』から『Tier1 名詞用法のみ禁止、動詞活用 (差し戻しました等) は許容』へ再設計。CaseDetail.tsx:476 が toast 動詞活用である事実を反映 (名詞 差戻し への置換が文法上不適な箇所)。
- correction#3 関連記述 (responsive 軸『他軸依存』, synthesis row 11) を『既達 (live TopBar.tsx で /inbox=BellIcon, Sidebar.tsx で InboxIcon=/cases bind 済)』へ書き換え、未完 fix から checkpoint=回帰防止 (1 glyph 単射の維持確認) に降格。
- a11y 軸: 『jsdom axe が contrast skip ゆえ降格明記を残す』を既達 (routes-axe.test.tsx:9-10) と認め、net-new を token AA 台帳 (sRGB 4.5:1 実測表) + grayscale visual gate + prefers-contrast の 3 点に絞る。既存実装の再記述と net-new を明示分離。

---

## 5. 計画 (greenfield prompt) への接続

- **§2 visual thesis**: §2 synthesis の thesis + foundation 層 (色/型/余白/素材/icon) の決定を採用。§0 補正を反映。
- **§4 research 採否**: 各軸の Adopt / Adapt / Reject / Defer を統合 (§2 除外 ledger が Reject/Defer の根拠)。
- **§6 UI 原則**: interaction + quality 層 (判断/承認/diff/監督/例外/state/a11y/content/audit) の決定を画面横断原則に反映。
- **§8 checkpoint**: §2 の open question を reference 1 画面 (高密度の案件詳細) + 新 IA route-map で目視確定。

## Appendix: provenance

- research-compounder: `retrieval-index/by-design-pattern.md` / `by-ux-flow.md` / `knowledge/ui-design/*` / `knowledge/ux-design/*`
- platform 監査: `audits/ui-ux-audits/2026-05-29-frontend-ui-trends-2025-2026.md` (NOW=3-engine / Chrome-only / Watch-only)
- project SSOT: `prototype-redesign/CLAUDE.md` / `handoff-redesign/00-shared/canonical-design-spec.md` / live `src/index.css` / `src/components/**/Sidebar.tsx`
- 生成: 2-round multi-agent workflow (round1 19 agents / round2 9 agents)、live-code 補正済
