# backoffice-ai-v2 / prototype-redesign — ユーザー目線 UI 監査

**日付**: 2026-05-29  **対象**: `prototype-redesign/` (React19 + Vite + TS + Tailwind v4, 9 画面)  **スコープ**: フロントエンド本番 Readiness (バックエンド不在は不問)

## 監査メソッド

multi-agent workflow (141 agent): persona 5 系統 (入力者 / 承認者 / AI改善担当 / モニタリング担当 / 初回横断) × dimension 9 系統 (IA網羅 / データ整合 / ルーティング / 操作・状態 / 状態網羅 / デザイン / a11y・responsive / コピー / build健全性) の二系統 fan-out → 各 finding を独立 skeptic が引用コード再読で確認/反証 → completeness critic → synthesis。raw 121 → verify 通過 **confirmed 112** (major 33 / minor 79)、refuted 12。契約 docs (ia-overview-v2 / screen-contracts-v2 / allowed-actions-and-state-transitions / canonical-design-spec) は「意図を知る input」かつ「批判対象」として扱い、契約自体の不備 (検索 / 通知 / 設定 / 承認者専用面の欠落等) も指摘対象に含めた。

## ★ 監査者注記 — severity 再判定 (workflow の blocker:0 を上書き)

verify 段は「prototype だから mock 許容」に引かれ全件を major/minor に倒した。しかし本監査の Goal は **「フロントエンドとして本番 Ready」**。その基準では下記 4 クラスターを **blocker (本番不可)** に再分類する。いずれも技術 crash ではなく「正しく見えるが内容が嘘 / 誤データで判断が進む」型で、監査者が実コードで**独立に裏取り済み**。

| 再分類 | 元 # | 問題 | なぜ blocker か | 独立検証 (監査者) |
|---|---|---|---|---|
| **B1** | R1 | override「手入力で上書き」が訂正値を保存しない | 入力者が正値を入れても reducer は `resolvedFieldIds` に足すだけ。画面は元の AI 値を「確認済」バッジ付きで残し、誤値が承認・反映へ流れる。突合修正という中核業務のサイレント破綻 | `reducer.ts:51-58` を確認 — value を引数で受け取らず一切格納しない |
| **B2** | R2/R3/R5 | 証拠リンクが別業務の汎用明細に着地 (=「**別明細なのに同じデータ**」) | `buildCaseDetail` が全 case を `workflow:'法人住所変更'` 固定で量産。口座開設提案 PROP-2026-024 が「本人確認書類」の根拠として参照する CASE-2026-0112/0104/0101 を開くと**法人住所変更届**が出る。原則 B (証拠アンカー) が実質破綻し、承認者は無関係案件を根拠に判断 | `mock-case-detail.ts:205-244` (factory 固定 workflow + document.title=`${workflow}届`)、`mock-proposal-detail.ts:166-169` を確認 |
| **B3** | M1/M2/D1/D2 | 同一 entity が画面間で別データ / 口座開設案件 fixture ゼロ | 口座開設 承認率 96% の分母が Observatory=**820 件** / AgentDetail=**980 件** で矛盾。さらに `CASE_LIST` 全 28 件が法人住所変更で口座開設案件が 0 → store 派生画面は「0 件」, static mock 画面は「実績あり」と同一業務で矛盾。デモの数値が画面間で食い違う信頼性 blocker | `mock-observatory.ts:89` (820) vs `mock-agent-detail.ts:91` (980)、`mock-case-list.ts` 全行 法人住所変更 を確認 |
| **B4** | C5 | SoD (入力者≠承認者) が画面・data 両層で未強制 | role が単一「入力者」hardcode + mode toggle 自己切替 + reducer に actor identity 不在。同一人物が入力→承認を連続実行でき、規制業務の四眼原則が成立しない | `reducer.ts:38-43` (approve に actor 検査なし)、ProposalDetail / CaseDetail の mode 自己 toggle を確認 |

**→ 本番 Ready 判定: 不可。** 技術 blocker 0 ではなく、production-ready frontend 基準では **blocker 4 クラスター + major 群**。これらを残したまま本番設計に進むと、誤データで承認判断が進む構造を温存する。

## ユーザー指摘 2 バグの所在 (確認済)

- **「別明細なのに同じものが表示される」** → **B2**。全非 canonical 明細が status/flags 違いの同一テンプレ + cross-workflow 証拠リンクの着地ずれ。加えて EXTRA_CASES 20 件は申請書類も完全汎用 (§4 参照)。
- **「一覧が無く明細だけ」** → 主要 entity (Cases/Proposals/Agents) の list 自体は存在する。該当は **Observatory 監査タブが単一 case (CASE-2026-0142) 固定**で横断 list / 検索 / 期間・actor・action 絞り込み / ページングが無い類型 (§4 Observatory、§5a 監査台帳)。

## 既知の限界

- workflow の**承認者ペルソナ finder が構造化出力に失敗し脱落**。承認者論点は dimension agent (proposal mode toggle / Approvals の pageSize 欠落 / SoD=B4) と §8 残存 gap「承認者 end-to-end journey の構造欠落」で部分カバーするが、承認者 journey の独立 finder は欠。次サイクルで補完推奨。
- §8 の残存 7 gap は probe 仮説段階 (実 file 裏取り未完)。

---

# backoffice-ai-v2 / prototype-redesign 本番 Readiness 監査レポート

## 1. 結論

**判定: 本番化 不可 (条件付きでも不可)。** 技術的 blocker (severity=blocker) は 0 件だが、`major` 33 件のうち複数が「中核命題が UI で観測不能」「証拠アンカーが別業務へ着地」「KPI 分母が画面間で矛盾」という、プロトタイプとしての説得力そのものを崩す欠陥であり、これらを残したまま本番設計に進むと誤データで承認判断が進む構造を温存する。blocker は 0 だが、本番 ship には major 群の大半 (特に P0 指定の 8 件) の解消が前提条件。

- blocker: **0 件**
- major: **33 件**
- minor: **79 件**

判定根拠を 1 文で: AI 値の上書きが capture されず元の AI 値を「確認済」として残す (突合修正の中核がサイレント破綻)、提案・Agent の証拠リンクが別業務の汎用 detail に着地する、Flywheel (差戻し→提案→設定昇格) の各 leg が UI で追跡不能 — 中核 thesis を体現する経路が動かないため、現状は「動くモック」ではなく「動いて見えるモック」である。

---

## 2. Blockers (本番不可)

**severity=blocker は 0 件。** 入力 finding に blocker 区分の項目は存在しない。

ただし `major` のうち、デモ/レビュー時に「同一 ID が画面間で別データ・別状態を表示する」「証拠リンクが無関係な案件を開く」系は、blocker に準じる代表バグとして §3 冒頭で先頭扱いする。これらは技術 crash ではなく「正しく見えるが内容が嘘」という、監査・承認の信頼を根底から壊す型である。

---

## 3. Major (33 件) — user-journey 別

### 3.0 代表バグ (画面間データ不整合 / 証拠アンカー破綻) — 最優先

中核 thesis (原則 B 証拠アンカー、Flywheel) を直接壊す major を冒頭に集約する。

| # | 画面 | 要旨 | evidence (file:line) |
|---|---|---|---|
| R1 | /cases/:id | override「手入力で上書き」が訂正値を capture/persist/display せず、原 AI 値を「確認済」バッジ付きで残す。突合修正のサイレント破綻 | CaseDetail.tsx:83-87 (reason=値 を捨てる) / reducer.ts:51-58 (値を格納せず resolvedFieldIds 追加のみ) / CaseDetail.tsx:64-67 (overlay は aiValue 不変) / types.ts:314 humanValue 未 set |
| R2 | /proposals/:id, /agents/:id, /cases/:id | evidence link 先が文面と無関係な factory 量産 detail を開く (口座開設の根拠 0112 → 法人住所変更届)。原則 B 実質破綻 | mock-proposal-detail.ts:166-169 / mock-case-list.ts:49 (全 EXTRA workflow=法人住所変更) / mock-case-detail.ts:226-242 (factory generic) |
| R3 | /proposals/:id (根拠 case 乖離) | 口座開設提案 PROP-2026-024 の根拠 case を開くと法人住所変更の汎用 detail に着地、cross-workflow で証拠検証破綻 | mock-proposal-detail.ts:166-169 / ProposalDetail.tsx:256-257 / EXTRA_CASES mock-case-list.ts:45-55 |
| R4 | /agents/:id | account-opening Agent の sample ラベル (自動入力/success・要確認/alert) がリンク先 case 実 status (sent-back/reflected) と反転矛盾、Trust 昇格の証拠が虚偽 | mock-agent-detail.ts:107-108 / mock-case-detail.ts 経由 EXTRA (0112=sent-back, 0104=reflected) / AgentDetail.tsx:114-127 |
| R5 | /cases/:id | 提案根拠の「元の案件を開く」が口座開設提案でも generic factory で workflow=法人住所変更 + 固定 5 項目、要確認の中身が業務無関係 | mock-case-detail.ts:212-214 / baseFields 143-153 / CASE-2026-0101 (ready,flags1) 先頭=法人名が needs_review |

### 3.1 入力者 journey

| # | 画面 | userImpact 要旨 | evidence (file:line) |
|---|---|---|---|
| I1 | /cases/:id | 変更系業務で旧値→新値の before/after が detail に欠落 (list mock の change.from/to が detail で死蔵)、reconcile が「正しく変わるか」軸を支援せず | mock-case-list.ts:18-24 (change.from/to) / CaseDetail・ReconcilePanel・DocumentViewer に表示 0 / types.ts:308-320 (oldValue 相当なし) / ReconcilePanel.tsx:62-71 |
| I2 | /cases/:id | case/sendback に status precondition が無く、終端 reflected 案件まで差戻しで sent-back に巻き戻せる (approveCase との gate 非対称) | reducer.ts:60-61 (無条件遷移) / reducer.ts:38-44 (approve は gate あり) / CaseDetail.tsx:185-196,74 |

### 3.2 AI改善担当 journey

| # | 画面 | userImpact 要旨 | evidence (file:line) |
|---|---|---|---|
| A1 | global (proposals↔agents) | 提案詳細⇄Agent詳細の双方向 link/データ参照が contract レベルで欠落、flywheel 最終 leg (提案→設定昇格) を画面上で追跡不能 | mock-proposal-detail.ts:28-40 (agentId なし) / mock-agent-detail.ts:27-37 (relatedProposals なし) / ProposalDetail.tsx:256-261 / AgentDetail.tsx:108-129 |
| A2 | global (proposal approve) | Approved proposal PROP-2026-024 の lineage が AgentDetail config / Observatory knowledge に出ず、Flywheel 中核 thesis が UI で観測不能 | reducer.ts:70-73 (status patch のみ) / mock-agent-detail.ts:111-115 (static) / mock-observatory.ts:96-114 / types.ts:28-33 |
| A3 | global (kill-switch) | 手動コントロール (緊急停止/Agent 降格) が reducer/state に半完成 (agent/togglePause, paused) だが UI 未配線。「人によるコントロールは渡さない」命題が体現されず | reducer.ts:78-81 / types.ts:44 / pages 内 dispatch・表示 0 件 / AgentDetail.tsx:155-189 (昇格申請のみ) / types.ts:43,61 (Phase 7 deferred と明記) |
| A4 | proposals/:id | 提案の却下・差戻しが状態遷移を実装せず: reject 理由は破棄、sendback は dispatch 無し (action union 欠落) で status 不変 | ProposalDetail.tsx:355-358 (reason 渡さず) / reducer.ts:74-75 / ProposalDetail.tsx:367-368 (showToast のみ) / ReasonDialog.tsx:46 |
| A5 | proposals/:id (差戻し state) | 業務責任者 mode の提案差戻しが toast-only (proposal/sendback action 不在)、forwarded→pending-triage を約束するが store 非接続で triage キューに戻らない | ProposalDetail.tsx:360-368 / types.ts:63-74 (union に sendback なし) / reducer.ts:66-75 / トースト文言 368 |
| A6 | /proposals/:id (根拠 case 乖離) | (R3 と同根、AI改善担当視点) PROP-2026-024 の本人確認書類根拠 case が法人住所変更 detail を開き、証拠検証成立せず | mock-proposal-detail.ts:166-169 / ProposalDetail.tsx:256-257 / PROP-2026-028 の 0118/0106 も同様 |

### 3.3 モニタリング担当 journey

| # | 画面 | userImpact 要旨 | evidence (file:line) |
|---|---|---|---|
| M1 | /observatory↔/agents/:id | 同一 Agent・同一 KPI (口座開設 AI 入力承認率 96%, 直近 30 日) の分母が 820 vs 980 と矛盾、共有 metrics source 不在 | mock-observatory.ts:89 (820 件) / mock-agent-detail.ts:91 (980 件) / 承認者差戻し率 mock-agent-detail.ts:94 (910 件、Observatory 側に行なし) |
| M2 | /observatory, /agents/:id | (M1 同根、data-integrity 視点) UC-BO-02 KPI 分母 820 vs 980・前月差 +1pt vs +2pt・指標数 2 行 vs 4 行 drift、契約 §5 が UC-BO-02 KPI 未定義 | mock-observatory.ts:89-90 / mock-agent-detail.ts:91-94 / UC-BO-01 は 1,240/1,140 で一致 |
| M3 | /observatory | モニタリング画面に entity drill 導線が無い (証跡 case ID / 未達 KPI / process 別 KPI いずれも /cases・/agents へ非リンク) | Observatory.tsx:247 (唯一の外向き link は /proposals) / Observatory.tsx:130 (case ID は plain span) / MetricVsThreshold.tsx:66-83 (行クリック/href なし) |

### 3.4 横断 / 初回・IA completeness journey

| # | 画面 | userImpact 要旨 | evidence (file:line) |
|---|---|---|---|
| X1 | global | ProcessSelector が ViewContext 非接続 (local useState)、4 list hook も filter 引数なしで業務切替が全 list/Hub に非伝播 (useView consumer 0) | ProcessSelector.tsx:19 / hooks.ts:31-37 / Cases.tsx:63 (引数なし呼び出し) / ViewContext.process consumer grep 0 |
| X2 | global (routing-nav) | (X1 同根、routing 視点) ProcessSelector が no-op: ViewProvider・hooks filter 口が実装済なのに配線されず、route/list/Hub いずれも非連動 | ProcessSelector.tsx:19,47-50 / hooks.ts:31-37,45-54 / TopBar.tsx:18 |
| X3 | global | 通知/ワークインボックス画面が screen contract に不在、差戻し受領・エスカレーション・SLA 警告の能動通知の受け手面なし、ベルは cosmetic | TopBar.tsx:32-38 (aria-hidden span) / App.tsx 9 route に不在 / CaseDetail.tsx:88-90 / FieldActionModal.tsx:23 |
| X4 | global (Hub→list drill) | Hub の KPI/プロセスカード drill が遷移先 list に filter 意図 (状態/業務) を query 引き継がず、breakdown が約束した絞り込みが消える。カードの「案件一覧へ」も p.id 非依存ハードコード | Hub.tsx:102-104,193-194 / mock-hub.ts:91/106/119 (query なし) / Cases.tsx:84-95 / DataTable.tsx:100 (内部 useState) |
| X5 | global (TopBar↔observatory) | (X1 同根、Observatory 視点) ProcessSelector 未接続で Observatory スコープ連動が未実装、契約 §124/§128 が Process scoped + required 規定 | ProcessSelector.tsx:19,47-50 / Observatory.tsx:225,251 / screen-contracts-v2.md:124,128 |
| C1 | global | config-approval surface missing: 業務責任者が設定承認/設定差戻しする画面が無く、Trust 昇格が申請で永久停止 | reducer.ts:76-77 (承認 action なし) / AgentDetail.tsx:174-188 / Agents.tsx:58-68 / allowed-actions §38-41 |
| C2 | global | escalate が UI 選択肢のみで store 化されず、受信側 (業務責任者判断 lane) の queue 画面が scope 外 | FieldActionModal.tsx:23 / CaseDetail.tsx:91-93 (showToast のみ) / allowed-actions §15,22,58 |
| C3 | global | 反映済 (reflected) 案件の訂正・取消 workflow が契約・実装ともに不在 + reflected guard なしで差戻しで終端から逆行可能 | allowed-actions §19 / CaseDetail.tsx:176-182 / reducer.ts (reversal action なし) / App.tsx:27-41 |
| C4 | global | 案件の人手起票/手動全項目入力の入口が contract・route・state machine に無く、AI 障害時の degraded 業務継続パスが UI として不成立 | App.tsx:27-41 (作成系 0) / Cases.tsx (起票 UI なし) / mock-case-detail.ts factory は AI 処理済前提 |
| C5 | global | role が単一ユーザ「入力者」ハードコード + mode toggle 自己切替 + reducer に actor identity 不在で SoD (入力者≠承認者の system 強制) が画面・data 両層で未充足 | Sidebar.tsx:119-123 / CaseDetail.tsx:119-133 / ProposalDetail.tsx:103-115 / reducer.ts:38-43 / allowed-actions §16,21 |
| C6 | observatory | Flywheel 中間状態 (staging/未承認ヒント) の lineage view が contract に不在、knowledge tab は compiled-only | Observatory.tsx:240-272 / staging/compiled 語が store/pages/mock に 0 件 / Tier 2 語彙に定義あるが画面に無し |
| D1 | global | 検証用 fixture (EXTRA_CASES 20 件) が業務 KPI source を汚染、Hub/Cases/承認の実数が契約と全数乖離 + store に UC-BO-02 case 0 件で Hub 口座開設業務が全項目 0 に潰れる | mock-case-list.ts:45-55,57 / seed.ts:23-35 / Cases.tsx:80 (28 件) / hooks.ts:98-110 / 契約 mock-fixture-spec-v2.md:20 (8 件), mock-hub.ts:85/99/114 |
| D2 | global | UC-BO-02 (口座開設書類完備) 案件 fixture が CASE_LIST にゼロ、store 派生画面は「0 件」/ static mock 画面は「実績あり」で同一業務矛盾。契約 §21 の 5 件 fixture 欠落 | mock-case-list.ts:22-57 (全行 法人住所変更) / seed.ts:16 / hooks.ts:99-102 / mock-hub.ts:72-73 / mock-agent-detail.ts:84-95 / mock-observatory.ts:89 |
| RN1 | global (新規起票/訂正) | (C3+C4 同根、routing 視点) 反映済の訂正/取消 (reversal) と AI 障害時の手動起票が route・状態遷移・screen-contract のいずれにも不在 (前進のみの契約) | App.tsx:27-41 / reducer.ts (reversal なし) / CaseDetail.tsx:177 / Cases.tsx:75-81 |

### 3.5 design / a11y / state — 非機能 major

| # | 画面 | userImpact 要旨 | evidence (file:line) |
|---|---|---|---|
| DC1 | /cases/:id | CaseDetail ヘッダ status バッジが tone="primary" リテラル固定、status→tone resolver SSOT を唯一 bypass、reflected/承認待ち/差戻し案件で indigo 誤色 | CaseDetail.tsx:116 / mock-case-detail.ts:229,251-258 / 対照 Cases.tsx:34, Proposals.tsx:31, ProposalDetail.tsx:99 (resolver 経由) |
| AR1 | global (token) | fg-subtle (#94a3b8) が意味テキストに使われコントラスト 2.56:1 で WCAG AA 未達、fg-muted も非白背景で AA 境界割れ、design SSOT にコントラスト基準不在 | index.css:18 / Cases.tsx:18-19,42 / Agents.tsx:51 / Observatory.tsx:266 / ProposalDetail.tsx:280 |
| AR2 | global (TopBar/ProcessSelector) | ProcessSelector dropdown が Esc/外側クリックで dismiss 不可、arrow-key roving 未実装、role=option を button にネストする invalid ARIA pattern | ProcessSelector.tsx:18-19,43 / Modal.tsx:66-93 (対照の close 処理) |
| SC1 | /cases/:id (DocumentViewer/ReconcilePanel) | document rows と attention cards が div onClick でキーボード選択不可、4-eyes チェック完遂不能 (JIS X 8341/WCAG 未達) | DocumentViewer.tsx:78-80 / ReconcilePanel.tsx:47-49 (要確認カード) vs 109 (確認済は button、非対称) |
| RD1 | /observatory | 「表示データを初期化」が confirm 無しで全操作状態を不可逆破棄、低 stakes な昇格申請には confirm Modal があるのに最も破壊的な全消去に保護なし (保護の逆転) | Observatory.tsx:78-86,60-64 / reducer.ts:82-83 (無条件 seed) / 対照 AgentDetail.tsx:178,192-224 (confirm Modal) |

---

## 4. Minor (79 件) — 領域別サマリ

minor は全 79 件。修正容易性が高く ship blocker ではないが、本番設計で集約解消すべき。代表群を領域別に圧縮列挙する (件数内訳は各 finding の sources で追跡可能)。

**ナビゲーション / 動線 (≈10 件)**
- CaseDetail パンくず中段「案件一覧」が非リンク plain span、ProposalDetail/AgentDetail (Link) と非対称、?view=checker 由来時の /approvals 戻り path 欠落 (CaseDetail.tsx:106 vs ProposalDetail.tsx:89, AgentDetail.tsx:65)。複数 dim で重複観察。
- 承認待ち由来 detail で sidebar が「受信トレイ」点灯 (pathname-only prefix match、Sidebar.tsx:58)。
- 未知 path は silent redirect、detail 未知 id の明示 not-found と非対称 (App.tsx:38)。
- 詳細→一覧 round-trip で filter/sort/page/scroll が remount 初期化、戻り導線が前向き Link (履歴 push) (AppShell.tsx:18, DataTable.tsx:98-102)。
- Hub プロセスカード agentTo 非対称: UC-BO-01 は個別 AgentDetail 直行、UC-BO-02 は /agents 止まり (mock-hub.ts:62 vs :74)。
- detail role/承認者 view が URL と一方向同期で desync、リロードで初期 view 巻き戻り (CaseDetail.tsx:48,124 / ProposalDetail.tsx:53)。

**差戻し理由・コメントの破棄 (≈4 件、Flywheel 入口データ欠落)**
- 差戻しコメント・上書き理由が modal で収集されるが dispatch 引数 mismatch で store 非到達 (CaseDetail.tsx:88-90,230-233 / FieldActionModal.tsx:66-76)。
- 差戻し理由が store にも詳細画面にも保持/再表示されず、受領側入力者が前回理由を読む面が contract に無い (FieldActionModal.tsx:35 / CaseDetail.tsx:230-233)。

**header/status の store 非連動 (≈2 件)**
- CaseDetail header StatusBadge と LifecycleStepper が store でなく mock dict 参照、差戻し後に reconcile されず footer と矛盾 (CaseDetail.tsx:116,135 / mock-case-detail.ts:229,240)。

**提案 / Agent footer の状態非連動 (≈4 件)**
- ProposalDetail footer が p.status 非連動、承認済/送付済でも決定ボタン活性 + 無条件成功トーストで no-op を成功誤認 (ProposalDetail.tsx:300-344)。
- 提案 forward button が無条件 enabled、契約 §30/§48 の「実績値確認後 enable」gate 未実装 (ProposalDetail.tsx:310-320 vs CaseDetail.tsx:199, AgentDetail.tsx:176)。
- 未達 Agent の昇格ブロック footer が dead-end、改善提案 PROP-2026-031 への forward link / 失敗類型集約なし (AgentDetail.tsx:52,162-166,176 / mock-agent-detail.ts:64-69)。
- Trust 昇格申請後の取消・申請追跡が片側欠落 (AgentDetail.tsx:176,187 / reducer.ts:76-77)。
- paused/降格状態の表示が一覧・詳細に無く、TrustLevel enum も降格を表現できない (types.ts:44 / Agents.tsx:31-70 / AgentDetail.tsx:76-79)。
- 提案承認の mode toggle 自己切替 + reducer actor 無検査で同一人物が forward→approve 連続実行可 (ProposalDetail.tsx:103-115 / reducer.ts:67-72)。

**queue / 検索 / list (≈8 件)**
- queue 所有・割当の概念が UI/契約に無く、入力者の「自分の担当」default view が contract-silent、recommended flag 死蔵 (Cases.tsx:62-72,80 / DataTable.tsx:194-219 / mock-case-list.ts:23)。
- 過去案件 free-text 検索 (案件 ID/法人名) 動線が UI・契約とも不在、searchQuery state は ViewProvider に配線済のまま全画面未 consume 死蔵 (TopBar.tsx:19-27 / ViewProvider.tsx:11,19 / DataTable.tsx)。複数 dim で重複。
- 検索 zero-result が screen contract に未定義、filtered-empty と structurally-empty が未分離 (screen-contracts-v2.md grep 0)。
- list ヘッダ件数文言が DataTable filter 後件数と乖離、Cases は業務名も hardcode (Cases.tsx:80 / Approvals.tsx:80)。
- R0-6 (list sort/filter/page) が Cases のみ部分実装、Approvals/Proposals/Agents は pageSize 未付与 (Cases.tsx:93 のみ / DataTable 仮想化なし)。

**Observatory (≈8 件)**
- metrics タブ KPI が store 非接続の静的 literal、母集団 1,240 件 vs 実 28 件の出所が画面に未注記 (Observatory.tsx:225-236 / mock-observatory.ts:74-93 / mock-case-list.ts:57)。
- 期間/時系列 view なしで KPI が固定断面 1 枚 (Observatory.tsx:50-52 / mock-observatory.ts:79-92)。
- 証跡台帳が単一案件 (CASE-2026-0142) 固定で案件選択・横断検索・絞り込み・ページングなし (mock-observatory.ts:50,56-71 / Observatory.tsx:130,199-211)。複数 dim で重複。
- 証跡台帳の exemplar が in-flight pilot と同一 case ID を完了状態で再利用、案件側の未承認状態と矛盾 (mock-observatory.ts:60-61,68-70 vs mock-case-detail.ts:51,57-62,119 / mock-case-list.ts:23)。複数 dim で重複観察。
- 証跡台帳エクスポートが toast のみで実出力なし、client-side CSV/JSON は実装可能 (Observatory.tsx:180 / mock-observatory.ts:65-71)。
- 証跡台帳の列見出しが英語 schema field 名 (actor/role/action/policy/approval id) のまま JP-only UI に露出 (Observatory.tsx:39,191-194)。
- 証跡台帳 SoD チップ label に禁止 emoji `✓` 残存 (Observatory.tsx:163 / canonical-design-spec.md:120)。
- lifecycle/ledger/metrics/knowledge が無条件 map で空状態分岐なし (Observatory.tsx:138-161,199-211,225-236,251-271)。
- 3-tab とサブビュー切替に tab/radio semantic (role=tablist/tab/aria-selected) なし (Observatory.tsx:88-104,114-128)。

**state coverage / loading・error (≈5 件)**
- Error/Loading 状態が全 list 画面で到達不能、caller が status 不渡しで構造的に発火不能 (DataTable.tsx:140-141,249,251 / 4 list 画面が status/onRetry 不渡し / async path 0)。
- detail 3 画面の not-found が共有 EmptyState を迂回した独自 inline 実装 (role=status 欠落) (CaseDetail.tsx:30-39 / ProposalDetail.tsx:38-47 / AgentDetail.tsx:19-28)。
- EmptyState permission-empty が dead branch (EmptyState.tsx:11-12,16,26-30 / DataTable.tsx:253-254)。
- ReconcilePanel 確認済値が title/tooltip/展開なしで truncate、正規化差の住所が全文読めず (ReconcilePanel.tsx:119,108-121 / mock-case-list.ts:24)。
- MetricVsThreshold の 6 列 table が狭幅で列圧縮・判読困難、overflow-x-auto/min-width なし (MetricVsThreshold.tsx:54,57-62 vs Observatory.tsx:187-188)。

**design consistency (≈5 件)**
- 復活 4 component (PrototypeModeLabel/EmptyState/ErrorState/LoadingState) が lucide を非 Icon-suffix import で §1/§5 違反、§8 gate に suffix 機械検査欠落 (各 .tsx:1 / canonical-design-spec.md:16)。
- Trust tone が r.trust から resolve されず MetaChip primary 固定、現データ全件 supervised で実害 latent (Agents.tsx:39 / AgentDetail.tsx:77 / Hub.tsx:176 / canonical-design-spec.md:102)。
- 否定的アクション (却下/差戻し/エスカレーション) 完了 toast が status-tones SSOT に反して success 色固定 (CaseDetail.tsx:236-243,90,232 / ProposalDetail.tsx:371-378)。
- canonical-design-spec §4 内部矛盾: 却下が error semantic 定義 (L85) と inset 割当表 (L97) に二重出現 (status-tones.ts:47-48 / canonical-design-spec.md:97,85)。
- Agents MiniTrend が tone で昇格可否を色のみ encode (aria-hidden, 数値ラベル無)、tone 軸流用が prop 規律違反 (Agents.tsx:49 / MiniTrend.tsx:13)。

**a11y / responsive (≈9 件)**
- CaseDetail 2-pane が lg 未満で overflow-hidden + grid h-full により下段 (ReconcilePanel) を clip、ページ scroll も効かず全項目確認不能 (CaseDetail.tsx:139-142 vs ProposalDetail overflow-auto)。
- 検索/通知ベルが意図的・開示済の非機能 silhouette、未読ドットのみ軽度誤誘導 (TopBar.tsx:19-27,32-38,37)。複数 dim で重複。
- list/detail の responsive 閾値が単一 md/lg のみ、md-lg タブレット帯の列間引きなし (DataTable.tsx:272,365 / CaseDetail.tsx:140)。
- 成功 toast が role=status を条件 mount、表示 2.4-2.6s 自動消滅、4 画面 inline 重複 (CaseDetail.tsx:80,238 / ProposalDetail.tsx:76 等)。
- MiniTrend スパークラインが aria-hidden で推移方向が SR に伝わらない (MiniTrend.tsx:13 / Agents.tsx:48)。
- CaseDetail のモバイル縦予算圧迫 (88px header + sticky footer + bottom-nav の三重占有) (index.css:67 / CaseDetail.tsx:101,135,163)。

**content / copy (≈10 件)**
- PrototypeModeLabel tooltip が「一括操作 / フィルタは次段階」と告知するが両機能とも実装済 (検索/通知のみ真に未実装)、hover/focus 専用でタッチ環境で読めず (PrototypeModeLabel.tsx:50 / Approvals.tsx:92-101 / DataTable filter)。複数 dim で重複。
- ProposalDetail footer が status 非依存で「判定基準は実測値で確認済」(緑チェック付き) を断定、pending-triage でも検証完了と読める (ProposalDetail.tsx:296-299 / mock-proposal-detail.ts:46)。
- Observatory 証跡日・Hub 最終更新が 2026-05-31 (現在日 2026-05-29 より未来) + 同一案件の時間軸不整合 (Hub.tsx:71 / mock-observatory.ts:57-70)。
- ProposalDetail stepper の step1 ラベル「Manual 確認」に英語 1 語混在 (JP-only stepper 系に違反) (ProposalDetail.tsx:21)。
- metrics table 内で承認率 (%/pt) と精度・率系 (裸の 0-1 小数) 表記混在 (mock-proposal-detail.ts:49,98,140 / mock-agent-detail.ts:48 / MetricVsThreshold.tsx:42)。

**build health (≈6 件)**
- TypeScript strict mode 全 tsconfig で無効、active source は strict-clean (probe exit 0) で即時有効化可能 (tsconfig.app.json:1-31)。
- noUncheckedIndexedAccess 未設定で dict/array lookup 24 箇所が possibly-undefined 抑制、persist drift 経路で white screen 化リスク (probe 24 error / hooks.ts:33-34,47-51 等 / persist.ts)。
- test file が build typecheck (tsc -b) から除外、型 regression が check:all 素通り (tsconfig.json:3-6 / tsconfig.app.json:30 / tsconfig.test.json:2-4)。
- 9 画面 screen-level axe 未実装 (R0 deferral として明示追跡)、現状は 2 component の単体 axe のみ (smoke.test.tsx:6-17 / routes.test.tsx:35-39)。
- コード分割なし、9 route が単一 401KB chunk に eager bundle (vite build / React.lazy 0 / vite.config.ts に manualChunks なし)。

**modal / 破壊操作 (critic 由来、≈2 件)**
- 差戻し理由・上書き理由の記入途中テキストが overlay クリック/Esc/route 遷移で無警告破棄、unsaved-input guard 不在 (Modal.tsx:101,69-73 / FieldActionModal.tsx:169-186 / App.tsx に useBlocker なし)。
- Modal 表示中に背景 page を inert/aria-hidden 化せず body scroll もロックせず、SR が背景の機微 PII を読め、背景がスクロール (Modal.tsx:97-113 / body lock・inert grep 0)。

**Hub / data SSOT (≈3 件)**
- Hub「今日の処理サマリ」が store 非派生 static 値で業務カード (store 派生) と矛盾 (mock-hub.ts:131-135 / Hub.tsx:228-230)。
- mock-hub.ts の static dist/total/breakdown が dead かつ store 派生実値と矛盾 (UC-BO-01 定義 8 vs 実 28) (mock-hub.ts:60/67/85/99 / hooks.ts:98-110)。
- APPROVAL_LIST dead code; CASE-2026-0210 orphan id; approver names が factory と分裂 (mock-approvals.ts:17-20 / CASE_LIST 最大 0150 / mock-case-detail.ts:138-139)。
- sent-back→ready 遷移が未実装 (AI 再処理=backend step)、案件が sent-back で永久滞留 (reducer.ts:60-61 / Cases.tsx:19 / allowed-actions §18)。
- truly-empty 状態が seed 固定で構造的に到達不能、EmptyState truly-empty primary CTA が undefined 死蔵 (StoreProvider.tsx:14 / EmptyState.tsx:11-12 / Hub.tsx:71)。
- sidebar ユーザー領域が非インタラクティブな div、role/ログアウト/個人設定の入口が prototype に不在 (Sidebar.tsx:117-125 / App.tsx 9 route)。
- ヘルプ/用語集/操作ガイド導線が active 実装に皆無 (旧 PageHelpDisclosure は legacy 隔離) (PrototypeModeLabel.tsx:40-50 / 各 header)。

---

## 5. 契約自体の不備 (contract-itself-flawed / contract-silent)

「画面/機能が契約に無いこと自体が問題」な構造欠落。本番 SaaS として欠ける横断機能を明示する。

### 5a. 本番 SaaS に必須だが契約に screen が無い横断機能

| 欠落機能 | 状態 | 根拠 |
|---|---|---|
| **横断 free-text 検索** (案件 ID/法人名) | screen 未定義。TopBar 検索は aria-hidden silhouette、searchQuery state は配線済だが consumer 0、zero-result 状態も未定義 | TopBar.tsx:19-27 / ViewProvider.tsx:11,19 / screen-contracts-v2 検索要件なし |
| **通知 / ワークインボックス** | screen 未定義。差戻し受領・エスカレーション・SLA 警告の能動受け手面なし、ベルは cosmetic | TopBar.tsx:32-38 / App.tsx 9 route / DD-4.6/C-2 |
| **設定 / プロフィール / ログアウト** | screen・route 未定義。sidebar ユーザー領域は死んだ div、role landing/saved view を設定する面なし | Sidebar.tsx:117-125 / App.tsx 9 route |
| **ヘルプ / 用語集 / 操作ガイド** | active 実装に皆無、業務ヘルプ導線なし | grep 0 / PrototypeModeLabel.tsx:40-50 |
| **業務責任者 (承認 persona) の専用面** | 提案承認・Agent 設定承認・エスカレーション裁定 の主体 persona の landing/inbox/queue が 9 画面に 1 つもなく、Manual 管理者画面の mode toggle に間借り (critic gap、major 相当) | ProposalDetail owner mode / AgentDetail mode toggle / config-approval surface (C1) |
| **設定承認 queue (config_approve/sendback)** | 業務責任者の承認/差戻し実行面が画面欠落、Trust 昇格が申請で永久停止 | reducer.ts:76-77 / allowed-actions §38-41 (C1) |
| **エスカレーション受信 queue** | 受け手の判断 lane 画面が scope 外、難案件が宙に消える | FieldActionModal.tsx:23 / CaseDetail.tsx:91-93 (C2) |
| **手動起票 (degraded entry)** | 作成系 route 0、AI 障害時の業務継続パスが UI 不成立 | App.tsx:27-41 (C4) |
| **反映済の訂正/取消 (reversal)** | 前進のみの状態遷移、誤反映の訂正導線がプロダクト全体に不在 | reducer.ts / CaseDetail.tsx:177 (C3) |
| **Flywheel 中間状態 (staging) lineage view** | knowledge tab が compiled-only、差戻し→staging→提案の昇格前パイプラインが不可視 (中核 message が観測不能) | Observatory.tsx:240-272 / staging grep 0 (C6) |
| **監査台帳の案件横断 traceability** | 単一案件 (CASE-2026-0142) 固定、案件選択・横断検索・期間/actor/action 絞り込みなし | mock-observatory.ts:50,56-71 (M3 関連) |
| **期間/時系列 view (Observatory)** | 期間セレクタなし、KPI 固定断面 1 枚で異常の起点特定不能 | Observatory.tsx:50-52 |

### 5b. 契約と reality の乖離 / 契約内部矛盾

- **SoD が契約 mode toggle 設計自体と矛盾** (C5): 契約は入力者≠承認者の system 強制を要求するが、同一画面の mode toggle で自己切替でき四眼原則が画面・data 両層で破れる。契約の mode toggle 設計を role-scoped に再定義する必要 (Sidebar.tsx:119-123 / allowed-actions §16,21)。
- **KPI 分母の SSOT 不在**: 契約 §5 が UC-BO-02 KPI を未定義のため Observatory と AgentDetail が独立手書きで drift (M1/M2/D2)。
- **EXTRA_CASES 検証 fixture と業務 fixture の責務分離が契約に未明記** (D1): 契約 mock-fixture-spec-v2.md に「検証 fixture を業務数値に混ぜない」2 層分離が無い。
- **canonical-design-spec §4 内部矛盾**: 却下が error semantic (L85) と inset 割当表 (L97) に二重出現、spec 内で先に確定が必要。
- **証拠アンカー (原則 B) の検証可能条件が契約に無い** (R2): test は link 存在のみ検証し内容整合 (リンク元説明とリンク先 detail の業務種別一致) を見ていない。

---

## 6. 新規性

**novelty=new: 24 件** (major 9 + minor 15)。既存 audit (production-readiness-audit / production-remediation-plan / digest) が見落としていた領域:

1. **画面間データ整合 (data-integrity)** — KPI 分母 drift (820 vs 980)、UC-BO-02 案件 fixture ゼロ、EXTRA_CASES の KPI 汚染、APPROVAL_LIST dead code/orphan id、sample ラベルと case status の反転。既存 audit は機能・状態遷移を見ていたが「同一 entity が画面間で別データ・別状態」という整合性軸を体系的に検査していなかった。これが今回最大の新規発見クラスター。
2. **証拠アンカー (原則 B) の内容整合破綻** (R2/R3/R4/R5) — link が NotFound にならないため既存 test/audit を通過していたが、開く detail の中身が文面と無関係。
3. **override が訂正値を capture しない** (R1) — 突合修正の中核機能のサイレント破綻。as-designed として見過ごされていた。
4. **destructive reset に confirm 欠落** (RD1) — undo 不在 (D9) は既知だが「全消去 button に保護がなく低 stakes 操作には保護がある」保護の逆転は未指摘 (critic 由来)。
5. **build health の具体化** — strict mode OFF だが strict-clean、noUncheckedIndexedAccess 24 箇所、test typecheck 除外、コード分割なし。
6. **token コントラスト基準の SSOT 不在** (AR1)、design SSOT の icon-suffix 機械検査欠落、§4 内部矛盾、否定アクション toast の success 色固定 — design 一貫性の未検査面。
7. **Hub drill の query 引き継ぎ欠落、agentTo 非対称、未知 path silent redirect** — routing-nav の新規。

残り 88 件は partially-known (51) / already-in-existing-audit (37 相当)。既存 audit が把握していた論点 (検索/通知/SoD/Process 連動/状態遷移) を、今回 persona journey と実 file:line で再 articulate・裏取りした。

---

## 7. 是正の優先順位 (P0/P1/P2)

工数感は AI coding agent 基準 (S=数分〜30分, M=半日〜1日, L=複数 session)。AI work と human review/judgement を分離する。

### P0 — 本番設計に進む前に解消必須 (中核 thesis を壊す / 誤データ誘発)

| 項目 | finding | 工数 | 内訳 |
|---|---|---|---|
| 1. override が訂正値を capture/persist/display | R1 | M | AI work M (action に value 追加 + reducer + overlay 表示) / review 小 |
| 2. 証拠アンカー: 提案/Agent の根拠 case を文面整合の専用 detail に登録 + 双方向 link | R2/R3/R4/R5/A1 | L | AI work L (専用 case 登録 + agentId/relatedProposals + lineage 表示) / judgement 中 (どこまで実体化するか) |
| 3. KPI 分母 SSOT 単一化 + UC-BO-02 案件 fixture 追加 + EXTRA_CASES 責務分離 | M1/M2/D1/D2 | M | AI work M (mock dict 集約 + 5 件追加 + 検証 tag 分離) / 契約 §5/§20-21 更新 judgement 小 |
| 4. Flywheel 観測可能化 (proposal approve lineage + staging view + agent kill-switch UI) | A2/A3/C6 | L | AI work L / judgement 中 (どこまで prototype scope に含めるか) |
| 5. destructive reset に confirm Modal | RD1 | S | AI work S (既存 Modal 流用) |
| 6. sendback/reject 理由を store 保持 + reflected guard (差戻し終端逆行防止) | I2/A4/A5 | M | AI work M (action 引数 + precondition) |
| 7. CaseDetail status バッジ resolver 経由化 | DC1 | S | AI work S (1 行 + model に status 追加) |

### P1 — 本番 SaaS として欠かせない横断機能・状態整合

| 項目 | finding | 工数 |
|---|---|---|
| 8. ProcessSelector → ViewContext 配線 + list hook に process 伝播 | X1/X2/X5 | S (hooks 側 filter 口は実装済) |
| 9. 横断検索 + 通知/ワークインボックス screen 契約化・配線 | X3 / §5a 検索・通知 | L |
| 10. 業務責任者 persona の専用 queue/landing + config-approval surface + escalation 受信 queue | C1/C2 / critic 業務責任者 gap | L (judgement 大: IA 再設計) |
| 11. SoD を identity に束ね role-scoped gating (mode toggle を demo 専用と分離) | C5 | M (contract 再定義 judgement 大) |
| 12. fg-subtle をテキストから排除 + コントラスト基準を SSOT 明文化 | AR1 | M |
| 13. Loading/Error 状態を到達可能化 (mock 遅延/失敗トグル + status/onRetry 配線) | SC state-coverage | M |
| 14. DocumentViewer/ReconcilePanel 行を keyboard selectable に + ProcessSelector dropdown の Esc/roving | SC1/AR2 | M |
| 15. Observatory drill 導線 (case ID/未達 KPI/process → /cases・/agents) + 案件横断台帳 | M3 / §5a | M |
| 16. before/after (旧値→新値) を ReconcilePanel に表示 | I1 | S |
| 17. strict mode + noUncheckedIndexedAccess 有効化 (active source は strict-clean) | build health | S〜M |

### P2 — polish / 本番化前の整備

CaseDetail 2-pane の lg 未満 overflow 修正、共有 Toast component 集約 (色意味 + 永続 aria-live)、icon-suffix 統一 + §8 gate に機械検査追加、Observatory tab semantic、コード分割、test typecheck を check:all に追加、@media print、タイムスタンプ整合、PrototypeModeLabel tooltip 文言修正、emoji `✓` 除去、reversal/手動起票 (C3/C4) の本番設計、APPROVAL_LIST dead code 整理 等。

**推奨着手順**: P0 を 1 sprint で一括解消 (中核 thesis を観測可能にしないとレビューが成立しない) → P1 で横断機能と SoD の IA 再設計に判断を要するため critical-review を挟む → P2 は本番実装フェーズに melt-in。P0 の項目 2・項目 10・項目 11 は judgement gate (実体化範囲 / IA 再設計 / contract 再定義) を含むため、AI 実装前に Shinji の scope 確認が必要。

---

## 8. 監査カバレッジ & 残存 gap

### カバレッジ
- 検査次元: persona (入力者/承認者/AI改善担当/モニタリング担当/初回横断) + dim (ia-completeness / data-integrity / routing-nav / state-coverage / design-consistency / a11y-responsive / content-copy / build-health) + critic。
- 全 finding が verify 通過 + 重複検出済 (dup=1)。evidence は file:line で裏取り済み、入力に無い主張は本レポートに追加していない。

### critic が提起した未検査 gap の扱い

確定 finding に統合済み (本レポート反映):
- destructive reset confirm 欠落 → RD1 (major)
- Modal 背景 inert/scroll-lock 欠落 → minor 反映
- unsaved-input guard 不在 → minor 反映

**残存 gap (今回の finding 群に未統合、追加検査推奨)**:

| gap | likelySeverity | なぜ残るか |
|---|---|---|
| 業務責任者 persona の受け口画面そのものの不在 (persona 単位の統合欠落) | major | 個別 finding (C1/C2/A5) の共通根として §5a に記載したが、persona 単位の IA 欠落としては未だ独立 finding 化されていない。P1 項目 10 で IA 再設計時に正式論点化が必要 |
| 承認者 (checker) の queue→detail→承認→次の1件 end-to-end journey の構造欠落 | minor | 承認後 page に留まり queue 復帰 CTA 不在 + remount リセット。個別 finding の合算でなく journey 連結の欠落として未検査 |
| DataTable 一括承認の選択 scope と pinTop/pagination 相互作用 (select-all が pageRows 基準 / flagged の silent skip / partial-success 不可視) | minor | pageSize 未指定 Approvals では未顕在化、配線後に表面化する latent (DataTable.tsx:170,226 / reducer.ts:64-65) |
| 印刷 / PDF / @media print の物理証跡保全 modality | minor | index.css に @media print なし、sticky/overflow 2-pane が print で崩壊。export toast-only (D4) と別 modality |
| セッション継続性 / マルチタブ整合 (単一 localStorage + last-write-wins、storage event 未購読) | minor | SoD 2-persona 設計と端末単一 store の矛盾。StoreProvider が storage listener 持たず楽観ロックなし |
| long-content / 複数ページ申請書類の DocumentViewer 実用性 (DETAIL_PAGE=2 ハードコード、zoom 2 段のみ) | minor | 口座開設の複数書類 modality を構造的に表示できず、原則 B の前提を狭める |
| 時刻/SLA 計算の実体 (elapsedLabel が static literal、SLA KPI が静的仮説、案件滞留で数字不動) | minor | hooks.ts:84,106 が SLA static 維持を明言。承認者の優先順位判断 (中核 journey) を支えられない |

これら 7 gap は本監査では probe 仮説の段階で、実 file 裏取りまでは未完。次サイクルで検査対象とすべき。特に「業務責任者 persona の受け口不在」は P1 の IA 再設計判断に直結するため優先度が高い。

---

(レポート末尾) 関連ファイル: 主要 evidence は `/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/src/` 配下 (pages/CaseDetail.tsx, ProposalDetail.tsx, AgentDetail.tsx, Observatory.tsx, Cases.tsx, Hub.tsx; store/reducer.ts, hooks.ts, types.ts; data/mock-*.ts; components/cross-cutting/ReconcilePanel.tsx, MetricVsThreshold.tsx, DocumentViewer.tsx; components/shared/Modal.tsx, EmptyState.tsx 等) と契約文書 (screen-contracts-v2.md, allowed-actions-and-state-transitions.md, mock-fixture-spec-v2.md, canonical-design-spec.md)。
