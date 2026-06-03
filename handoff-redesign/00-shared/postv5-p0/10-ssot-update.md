## SSOT update gate (P0 承認後 / P1a 前) — required gate 1b

**目的**: postv5 で backend (SQLite + Node API + server-authoritative SoD/execute/audit enforcement) を IN scope に転じる決定を、SSOT 文書が現状の「mock + in-memory only / 外部接続なし / backend scope-out」記述で**否定し続けないように**、最小編集で整合させる。この section は**編集の正確な list を確定するだけ**であり、編集自体は P0 承認後に実行する (本 plan は実行しない)。

**ratified canonical (SD-1..SD-5、user 承認 2026-06-03)**: 本 SSOT 編集が反映すべき backend decision は SD-1..SD-5 で確定済。SSOT 文言は以下を前提に narrowing する — (SD-1) **dual-ID identity** (`session_operator_id` = token 由来の実 operator、`effective_actor_id` = body `actorId` の demo persona。header = `X-Operator-Token` HMAC-signed、secret env = `BOAI_SESSION_SECRET`、issuer = `POST /api/session/operator`)、(SD-2) **governance-boundary RBAC** (governance role = READ-ONLY、operational 24 mutation は identity-SoD + prior-state のみ、cross-actor は denialReason='NOT_FOUND' / HTTP 404)、(SD-3) **`schema_migrations` ledger** (forward-only、boot-apply、`db:reset-demo` で再適用)、(SD-4) **denialReason enum** が truth (test は enum を assert、default HTTP 403、IDOR のみ 404)、(SD-5) **zod** を全 endpoint boundary で `.strict()` 検証。全 endpoint は `/api/` prefix。本 gate はこれらを**実装しない** (下記 §責務境界) が、SSOT 文言が上記決定と矛盾しないことを保証する。

**gate 性質 (blocking)**: 本 section が定義する SSOT 編集が**全件 land するまで P1a (backend scaffold) を開始しない**。理由 — SSOT が「外部接続なし / backend 実装しない (scope-out)」と明言したまま backend code を足すと、文書が code を即座に lie 化し、以後の全 contract の "regulatory reviewer が coherent と感じる" 前提が崩れる。SSOT 整合は backend 実装の**前提条件**であって後追い更新ではない。

**本 gate の責務境界 (誤読防止)**: 本 gate は **doc-edit-list の確定と doc 整合のみ**を責務とする。secret 機構 (`X-Operator-Token` HMAC-signed header + `BOAI_SESSION_SECRET`)・server script・`db:reset-demo`・enforcement test の**実装は一切要求しない** (それらは #1/#auth contract と P1a backend scaffold contract の責務)。README へ追加する手順 section 内の secret/script 名 (canonical: `BOAI_SESSION_SECRET` / `db:reset-demo` / `POST /api/session/operator`) はすべて P1a への **forward reference (placeholder)** であり、本 gate は「手順 section の text が存在すること」のみを blocking 判定にする。本 gate 単体では新 framework / IdP / monitoring / 新 infra / 新 CI を一切持ち込まない。

**right-size 原則**: 既存 doc を in-place 編集するのみ。新 SSOT system / 新 doc / 新 frontmatter schema は作らない。`docs/_SSOT.md` の mapping 構造も変えない (新規 row 追加は P1a 以降の backend doc 登場時に別途判断)。

---

### 保持する不変条項 (narrowing の境界 = これらは編集で消さない)

backend を IN scope にしても、以下の 4 mock 事実は postv5 でも**完全に維持**する。narrowing は「backend なし」の 1 点のみに限定し、下記まで巻き込んで削除するのは DEFECT。

| 保持する事実 | live 文言 (出典、verbatim) | postv5 での扱い |
|---|---|---|
| 実顧客データなし | 「実 customer data / 実 PDF (mock のみ…)」ROOT/CLAUDE.md:78 | 不変 (seed は架空 fixture) |
| 実 AI なし | 「実 LLM / Computer use … 完全自動化」prototype-redesign/CLAUDE.md:60 | 不変 (AI 判定は mock) |
| 実外部接続・実送金・実台帳更新なし | 「実送金 trigger / 実 master data 更新」ROOT/CLAUDE.md:80・「外部システム接続」ROOT/CLAUDE.md:77。pill 文言の正準出典は `PrototypeModeLabel.tsx:38` (component 常時文言「外部未接続 / 実データなし / AI・証跡はモック」)、実 render は `V2Shell.tsx:202` (両者 drift は編集 list 4 で reconcile)。`PrototypeModeLabel.tsx:59` は pill ではなく disclosure 本文行 (「AI の入力・分析・自動化は模擬…」) — 出典に使わない。 | 不変 (SQLite は demo 内部 store のみ、実 core banking 非接続) |
| 実規制 cite なし | 「実規制 cite (Tier 3 規制語…事実主張せず)」ROOT/CLAUDE.md:79 | 不変 |

narrowing 対象は**ただ 1 つ**: 「backend / SQLite / API / server-authoritative enforcement は実装しない」という記述。これを「実装する (ただし demo-scope、上記 4 mock 事実は保持)」へ転じる。

---

### 編集 list 1 — ROOT/CLAUDE.md

table 名: `ROOT-CLAUDE-EDITS` / 必須列: file / section / 現 live 文言 (引用) / 意図する変更 / 編集種別

| file | section / 行 | 現 live 文言 (verbatim 引用) | 意図する変更 | 編集種別 |
|---|---|---|---|---|
| `CLAUDE.md` (ROOT) | §Connectivity L27 | 「v2 prototype はフロントエンド Web UI のみ、実接続は scope-out (Phase 1 で実設計予定)。」 | 「v2 prototype の UI は mock data 駆動。**postv5 から SoD/execute/audit の enforcement を server-authoritative 化するため demo-scope backend (SQLite + API) を追加** (postv5-p0 contract 群)。**実 core banking 等への実接続は引き続き scope-out** (Phase 1 で実設計予定)。」 | narrow (実接続 scope-out は維持、demo backend のみ IN へ) |
| `CLAUDE.md` (ROOT) | §UI Scope L48 | 「backend / external connection / real automation は実装しない (scope-out)。」 | 「**demo-scope backend (SQLite + API、control enforcement 目的) は postv5 で実装する**。real external connection / real automation は引き続き実装しない (scope-out)。」 | narrow (backend を例外として切り出し) |
| `CLAUDE.md` (ROOT) | §scope-out L77 | 「実 LLM API 呼び出し / Computer use / desktop control / 外部システム接続 / 完全自動化」 | **保持 (変更なし)**。`外部システム接続` = 実 core banking 接続を指す解釈を維持。誤読防止のため §Connectivity / §UI Scope 側の narrowing 文に「demo backend ≠ 外部システム接続」を明記する (上 2 行で対応済)。 | 不変 (誤読防止は他 section で吸収) |
| `CLAUDE.md` (ROOT) | §scope-out L78-79 | 「実 customer data / 実 PDF (mock のみ…)」「実規制 cite…」 | **保持 (変更なし)** — 4 mock 事実の core。 | 不変 |

OPEN DECISION: L77「外部システム接続」を残すか「実外部システム接続 (demo backend は除く)」へ明示修飾するか → 下記 Open decisions D2 参照。

### 編集 list 2 — prototype-redesign/CLAUDE.md

table 名: `PROTO-CLAUDE-EDITS` / 必須列: file / section / 現 live 文言 (引用) / 意図する変更 / 編集種別

| file | section / 行 | 現 live 文言 (verbatim 引用) | 意図する変更 | 編集種別 |
|---|---|---|---|---|
| `prototype-redesign/CLAUDE.md` | §scope-out / JP-only L60 | 「実 LLM / Computer use / 外部接続 / 完全自動化 / 実 customer data / 実 PDF / 実規制 cite なし。**mock data + in-memory state のみ**。」 | 「実 LLM / Computer use / **実外部接続** / 完全自動化 / 実 customer data / 実 PDF / 実規制 cite なし。**UI は mock data 駆動**。**postv5 から SoD/execute/audit の enforcement は demo-scope backend (SQLite + API) が server-authoritative に担う** (**旧: in-memory → 現: SQLite 永続化**、reducer は client cache 層に降格)。」 ※replacement text には旧 denial 句 (`in-memory state` + `のみ`) を**連結して書かない** — negative grep gate (0-hit) を通すため supersede は「旧: in-memory → 現: SQLite 永続化」表現に置換する。 | narrow (旧 in-memory 記述を supersede 明記、banned exact 句は replacement に残さない) |
| `prototype-redesign/CLAUDE.md` | §scope-out L63 / pill | 「PrototypeModeLabel「プロトタイプ表示 — 外部システム未接続 / 証跡はモック」を全画面 TopBar に常時表示。」 | pill **文言整合と live 実体の特定**を要する (下記 編集 list 4 = 必須付帯)。SSOT が指す `PrototypeModeLabel` component と実レンダされる V2Shell inline pill が live で乖離している。 | 要 reconcile (list 4) |
| `prototype-redesign/CLAUDE.md` | top banner 群 (L5-28 の REBASELINE/ROUTE-SWAP) | (backend 言及なし) | **postv5 REBASELINE banner を 1 本追記** (既存 banner と同形式): 「postv5: demo-scope backend (SQLite+API) IN scope、SoD/execute/audit を server-authoritative 化、実装 SSOT = `handoff-redesign/00-shared/postv5-p0/`」。 | add (1 banner、既存 pattern 踏襲) |

### 編集 list 3 — .github/workflows/pages.yml (#1 decision に従属)

table 名: `PAGES-WORKFLOW-DECISION` / 必須列: 対象 / 現状 (live) / 取りうる対応 / blocking 完了基準

> **path 確定 (誤読防止)**: live pages.yml は **リポジトリ ROOT の `.github/workflows/pages.yml`** に唯一存在する (`git ls-files | grep pages.yml` = ROOT 1 件のみ)。`prototype-redesign/.github/` は**存在しない**。以下「pages.yml」と書く箇所はすべてこの ROOT path を指す。

live 状態 (`.github/workflows/pages.yml` (ROOT)): 静的 SPA を GitHub Pages へ deploy。redesign を root (`/backoffice-ai-v2/`、L56 `VITE_BASE_PATH`)、prototype v1 を `/backoffice-ai-v2/v1/` subpath に配置 (L71 `VITE_BASE_PATH` + L83-84 `_site/v1/`)。`actions/upload-pages-artifact@v4` (L86-89) + `actions/deploy-pages@v4` (L99-101) で static `_site` を publish。**server 概念ゼロ** — backend が入ると「静的 SPA を Pages に上げれば動く」前提が崩れる。

> **#1 decision に従属 (DEFER)**: pages.yml の処理方向は本 gate が独自に決めず **#1 contract (`01-deploy.md`) option ② = Node host 移行** に従う。#1 option ② = dev=localhost (`dev:full`)、stakeholder demo=単一 Node host、**Pages workflow の redesign job を archive**。「archive」の mechanical 定義は **#1 A-3 が SSOT** = (file 削除 `git rm` OR redesign 関連 step 削除し v1 job のみ残置) のいずれか。本 gate はこの archive 処理を SSOT 文書側へ反映する責務のみを負い、選択 (file 削除 / step 削除) は **OPEN DECISION D-2 (v1 Pages の存続) が #1 側で確定**してから移送する。**「Pages を UI-only として温存」default は採らない** (#1 option ② が canonical、postv5 本体は server 常駐ゆえ静的 Pages 配信不能)。

| 対象 | 現状 (live) | 取りうる対応 (#1 option ② = canonical) | blocking 完了基準 |
|---|---|---|---|
| `.github/workflows/pages.yml` (ROOT) redesign job | static-only deploy (L1「Deploy redesign (root) + prototype v1 to GitHub Pages」、redesign build = `pages.yml:45-61`) | **#1 option ② に従い redesign job を archive** = #1 A-3 mechanical 定義に従う ((a) workflow file 削除 `git rm` / (b) redesign 関連 step 削除し v1 job のみ残置)。選択は #1 側 D-2 (v1 retention = OPEN) 確定後に移送。 | **本 contract は #1 option ② に DEFER**。本 gate の SSOT 反映は「server deploy へ切替・Pages redesign-job は archive」を README/CLAUDE.md に明記すること。pages.yml 実体の archive (file 削除 or step 削除) は #1 A-3 + D-2 確定値の移送として実施し、`grep -n "prototype-redesign" .github/workflows/pages.yml` が **0 hit** (file 削除なら file 不在) を完了基準とする。**「Pages を UI-only 温存」option は不採用**。 |

`pages.yml` 反映 (#1 option ② archive 採用) — 必須列: file / section / 現 live 文言 / 意図する変更:

| file | section | 現 live 文言 | 意図する変更 (#1 A-3 mechanical 定義に従う) |
|---|---|---|---|
| `.github/workflows/pages.yml` (ROOT) redesign job | redesign build/deploy step 群 (`pages.yml:45-61` install/build/SPA fallback + `82` redesign cp + `7-8` `prototype-redesign/**` trigger path) | 「Deploy redesign (root) + prototype v1 to GitHub Pages」(L1) + redesign build (L53-57) 等 | **#1 A-3 の archive を移送**: (a) D-2 で v1 を残さない → `pages.yml` を `git rm` (file 削除) / (b) D-2 で v1 を残す → redesign 関連 step (`pages.yml:45-61` + `82` redesign cp + `7-8` trigger path) を削除し v1 job のみ残置。いずれも完了基準 = `grep -n "prototype-redesign" .github/workflows/pages.yml` が **0 hit**。「server deploy へ切替えた旨」を README/CLAUDE.md に明記。**「UI-only 温存 comment 追記」は不採用** (#1 option ② が archive を canonical 指定)。 |

### 編集 list 4 — PrototypeModeLabel 文言の live drift reconcile (必須付帯)

table 名: `PROTOTYPE-PILL-RECONCILE` / 必須列: 事象 / live 出典 / リスク / 必要対応

**live drift 検出 (LIVE code が SSOT doc と乖離)**: prototype-redesign/CLAUDE.md L63 と ROOT/CLAUDE.md L46 は `PrototypeModeLabel` component を pill の SSOT とするが、live で**実際に user に見える pill は別実体**:

- `src/v2/V2Shell.tsx:202` の inline `<span>` = 「プロトタイプ表示 — **外部システム未接続 / 証跡はモック**」(これが render される実 pill)。
- `src/components/shared/PrototypeModeLabel.tsx:38` の component pill 文言 = 「プロトタイプ表示 — **外部未接続 / 実データなし / AI・証跡はモック**」(4 mock 事実)。同 component:49-59 が disclosure 本文 (:59 = 「AI の入力・分析・自動化は模擬…」)。**V2Shell は import していない** (`grep PrototypeModeLabel src/v2/V2Shell.tsx` = 0 hit)。component は live で `src/legacy/*` (DetailDrawer / Inbox / Dashboard、quarantined) + test 3 file からのみ参照 (production route 0 hit)。
- test `__tests__/components/prototype-mode-label.test.tsx:11` は component を**単体 render** して検証 — V2Shell 経由の実 pill は test 網羅外。

| 事象 | live 出典 | リスク | 必要対応 |
|---|---|---|---|
| user-visible pill が 4 mock 事実のうち「実データなし / AI モック」を**省略** | V2Shell.tsx:202 | backend 投入後「証跡はモック」が誤読される (server audit は real enforcement、しかし customer data は依然 mock)。法的 material 事実の欠落。 | postv5 で実 pill を「実顧客データなし / 外部システム未接続 / AI 判定はモック。**証跡 enforcement は demo backend が実行**」相当へ更新 (実装は postv5 UI contract)。SSOT (両 CLAUDE.md) は「pill SSOT = V2Shell render 実体」へ訂正する (= doc が live を指す)。**component を V2Shell に統合するか否かは実装 contract の判断であり本 gate の blocking には含めない** (D3 参照)。 |
| test が実 pill を検証しない | prototype-mode-label.test.tsx | pill 文言変更が test green を通過 (false safety) | 実 pill 文言を assert する test を P1 系 contract に委譲 (本 SSOT contract は edit list 化のみ)。 |

> NOTE: この pill 文言の**実装変更 (および component 統合) は postv5 の disclaimer/UI contract の責務**。本 SSOT contract の責務は「SSOT doc が指す pill 実体 (= V2Shell render) を live と一致させる」doc 訂正 + drift の明文化まで。実 pill の確定文言は OPEN DECISION D3 (本 gate の blocking は文言確定ではなく「doc が live 実体を指す訂正」のみ)。

### 編集 list 5 — README (server 起動 + db:reset-demo + smoke path、すべて forward reference)

table 名: `README-EDITS` / 必須列: file / 追加 section / 現状 / 追加内容 / blocking 完了基準

live 状態 (実測):
- `prototype-redesign/README.md` (postv5 demo 手順の追加先) = Vite template boilerplate のまま (L1「# React + TypeScript + Vite」、project 固有手順ゼロ、`npm run dev`/`localhost`/`deploy` = 0 hit)。
- `README.md` (ROOT) = Day 10 status の構想 README。§Status L11-13 が「Day 10 / 22」「Day 11 から prototype/ UI 実装着手」、L15-21「## 開発手順 (prototype は Day 11+ で立ち上げ)」に **v1 用** `cd prototype/ → npm install → npm run dev # Vite dev server (Day 11+)` を持つ (`npm run dev` = **1 hit、L20**。ROOT README に「0 hit」と書くのは誤り)。L30-37 が scope-out (L32「実 LLM…/ 外部接続 / 完全自動化」)。この L15-21 は **v1 起動手順かつ Day 10 段階の stale 記述**であり、postv5 demo (server enforcement) を再現する手順は ROOT/proto いずれにも存在しない。

| file | 追加 section | 現状 (live) | 追加内容 | blocking 完了基準 |
|---|---|---|---|---|
| `prototype-redesign/README.md` | 「## 開発・demo 手順 (postv5)」 | Vite template boilerplate (固有手順 0、`npm run dev` 0 hit) | (1) `npm install` (2) `npm run dev` (UI、port 5174) (3) **server 起動** (postv5: `npm run server` 相当、SQLite + Node API、全 endpoint `/api/` prefix) (4) **`npm run db:reset-demo`** (seed を deterministic に初期化、`schema_migrations` を再適用、stakeholder demo 前) (5) `.env` に enforcement secret 1 個 (`BOAI_SESSION_SECRET`、`X-Operator-Token` HMAC 署名用。§ #1/#auth contract が定義) | **本 gate の判定 = この section text が存在すること (mechanical)**。script 名・secret 機構は P1a forward reference (canonical: `BOAI_SESSION_SECRET` / `db:reset-demo`)。**実走 (起動→reset→smoke 通過) の確認は P1a backend scaffold gate へ委譲** — server 未実装の本 gate 段階では実走しない。本 gate は secret 機構を実装しない。 |
| `prototype-redesign/README.md` | 「### stakeholder smoke path」 | なし | server 起動 → persona=入力者 (body `actorId` で `effective_actor_id` を設定) で `POST /api/cases/:id/approve` → persona=承認者で reflect (identity-SoD 成立) → **同一 persona の self-approve が server から `{ ok: false, denialReason: <ENUM> }` (default HTTP 403) で reject される**ことを確認 → 他 actor の case を直接 ID 指定すると denialReason='NOT_FOUND' (HTTP 404、IDOR existence-hiding) → `GET /api/audit-events` 等で append-only audit が `session_operator_id` + `effective_actor_id` 両列付きで増えるのを確認、の最短再現手順 (regulatory reviewer 向け)。reject が server 由来 (client guard 迂回でも拒否) であり、test は bare HTTP code でなく denialReason enum を assert する旨を手順 text に明記。 | **本 gate の判定 = この smoke path section text が存在すること (mechanical)**。**実走確認 (server が denialReason enum で実際に reject されること) は P1a gate へ委譲** (server 未実装の本 gate では実走不能)。 |
| `README.md` (ROOT) | §Status / §scope-out / §開発手順 | §Status L11-13 (Day 10、v1 前提)、L15-21 v1 起動手順 (stale)、§scope-out L32 | scope-out L32「実 LLM…/ 外部接続 / 完全自動化」は**保持**。§Status に「postv5: demo backend で control enforcement を server 化 (詳細 = `prototype-redesign/README.md` + `handoff-redesign/00-shared/postv5-p0/`)。**deploy は #1 option ② = Node host へ切替、GitHub Pages redesign-job は archive** (静的 Pages 配信は postv5 server に非対応)」の 1-2 行追記。**§開発手順 L15-21 の stale 表現 (Day 11+ で立ち上げ / v1 用 `cd prototype/`) には postv5 手順を混ぜず**、postv5 demo の起動先は `prototype-redesign/README.md` 側へ pointer を張るに留める (ROOT README の v1 手順と矛盾させない)。 | scope-out の 4 mock 事実が ROOT README でも保持 (grep gate) + §Status に postv5 1 行 + 「server deploy へ切替・Pages redesign-job archive」の明記が存在 (#1 A-3 完了基準) + L15-21 が引き続き v1 手順を指す (postv5 server 手順を ROOT に二重記載しない)。 |

> placeholder script 名 (`npm run server` / `npm run db:reset-demo`) と secret 機構 (`BOAI_SESSION_SECRET` / `X-Operator-Token`) は **#1 decision + P1a backend scaffold contract が確定値を pin / 実装** (SD-1..SD-5 で canonical 文字列は確定済、実装は P1a)。本 SSOT plan は「README にこの 3 手順 section の text が要る」ことを blocking 化するだけで、script 名・実走・secret 実装はいずれも P1a 確定後に reconcile (forward reference)。

---

### gate 完了基準 (P1a 開始の前提、blocking)

table 名: `GATE-1B-EXIT` / 必須列: gate item / 完了判定 (mechanical、falsifiable) / approval owner

| gate item | 完了判定 (mechanical、falsifiable) | approval owner |
|---|---|---|
| ROOT/CLAUDE.md narrowing | L27/L48 が backend IN scope を反映 + L77-79 の 4 mock 事実 verbatim 残存 (`grep "実 customer data"` 等 hit) | user (SSOT owner) |
| prototype-redesign/CLAUDE.md narrowing | L60 の旧 in-memory 記述を supersede (replacement text は「旧: in-memory → 現: SQLite 永続化」表現で、banned exact 句 `in-memory state のみ` を**含まない**こと = 下記 negative grep gate と整合) + postv5 REBASELINE banner 1 本追加 | user (SSOT owner) |
| pages.yml 決定反映 (#1 option ② に DEFER) | #1 contract option ② (Node host) の archive 処理が **`.github/workflows/pages.yml` (ROOT)** に #1 A-3 mechanical 定義 (file 削除 OR redesign step 削除) で反映済、live と doc が一致。完了基準 = `grep -n "prototype-redesign" .github/workflows/pages.yml` が **0 hit** + 「server deploy へ切替・Pages redesign-job archive」が README/CLAUDE.md に明記済。**「UI-only 温存」では未達**。v1 retention は #1 側 D-2 (OPEN) 確定に従属。 | user (#1 decision owner、D-2 確定) |
| README 手順 section の text 存在 (実走は不問) | `prototype-redesign/README.md` に「## 開発・demo 手順 (postv5)」「### stakeholder smoke path」の 2 section + ROOT README §Status に postv5 1 行が **text として存在**。script 名は P1a forward reference と明記済。**実走 (server 4xx reject / reset) 確認は本 gate の判定対象外 (P1a gate)** | user |
| pill drift 明文化 (doc が live を指す訂正、D3 と独立) | 両 CLAUDE.md の「pill SSOT = `PrototypeModeLabel` component」記述が「pill SSOT = V2Shell render 実体 (`V2Shell.tsx:202`)」へ訂正済。**この訂正は D3 (文言確定) と無関係に実施可** — D3 未決でも本 item は green にできる。component 統合は本 item の判定に**含めない** | user |
| pill 確定文言 (D3 従属、本 gate では非 blocking) | 実 pill の確定文言は D3 決定後に postv5 UI contract で実装。**本 SSOT gate の blocking には含めない** (D3 未決が本 gate を永久ブロックしないための分離) | user (D3 owner) |
| 4 mock 事実 grep gate | 編集後に `grep -rnE "実顧客データ\|実 customer data\|実 LLM\|実規制 cite\|外部.*未接続" CLAUDE.md prototype-redesign/CLAUDE.md` が**全 4 事実 hit** (narrowing が mock 事実を巻き込み削除していない証明) | 自動 (CI/手動 grep) |
| 否定文 残存 0 gate | 編集後に `grep -rnE "demo.*backend.*実装しない\|backend.*SQLite.*実装しない\|in-memory state のみ\|backend not implemented" CLAUDE.md prototype-redesign/CLAUDE.md README.md prototype-redesign/README.md` が **0 hit** (= demo backend を否定する文が SSOT に残っていない証明) | 自動 (negative-pattern grep) |

> negative-pattern grep (最終行) は MEMORY 教訓「完了 verify は許容しない pattern で universe-bounded check」に従う。**保持してよい否定 (`実外部接続なし` / `real automation は実装しない` / `外部システム接続`) は pattern に含めない** — pattern を「**demo backend を否定する文**」に anchor (`demo.*backend.*実装しない` / `in-memory state のみ` の単独語 / `backend not implemented`) し、緩い `外部接続なし` 単独語を入れて 4 mock 事実側を false-positive で叩かないようにする。

---

### Open decisions

| id | 論点 | 推奨 default | rationale | reversibility |
|---|---|---|---|---|
| D1 | pages.yml (`.github/workflows/pages.yml` ROOT) の処理方向 | **#1 contract option ② (Node host) に DEFER = Pages redesign-job を archive** (本 gate は独自決定せず #1 に従属) | postv5 本体は server 常駐ゆえ静的 Pages 配信不能。#1 option ② が canonical (Node host 移行 + Pages workflow archive)。本 gate は archive 処理を SSOT 文書へ反映するのみ。**archive の mechanical 定義 (file 削除 OR redesign step 削除) と v1 retention は #1 A-3 / D-2 (OPEN) が SSOT**。 | 容易 (#1 reversibility に従う。Pages workflow archive→復活は容易、v1 build artifact 残存) |
| D2 | ROOT/CLAUDE.md L77「外部システム接続」を明示修飾するか | **修飾しない (L77 保持)**、誤読防止は §Connectivity/§UI Scope の narrowing 文で吸収 | L77 は scope-out 列挙の core 表現。文言を弄ると Day 10 lock 済 scope-out の意味が揺れる。誤読防止は隣接 section で足りる。 | 容易 (1 語追加で可逆) |
| D3 | pill 実体: V2Shell inline span を SSOT とするか / component を V2Shell に統合するか | **V2Shell render 実体 (`V2Shell.tsx:202`) を SSOT と認定 + 文言を 4 mock 事実へ更新** (実装は postv5 UI contract、本 gate は doc 訂正のみ) | live で見えるのは V2Shell span のみ。component 統合は実装 contract の責務。**本 gate の blocking は「doc が live を指す」訂正だけで、文言確定 (D3) と component 統合は非 blocking** — D3 未決が本 gate を永久未充足にしないため分離。 | 中 (component 統合は別 PR、doc 訂正のみなら容易) |
| D4 | README server/db script 名 + secret 機構を本 plan で pin/実装するか | **pin/実装しない (placeholder + forward reference)** | script 名と secret 機構は #1/#auth + P1a backend scaffold contract が確定/実装。SSOT gate で先に固定すると二重管理 (drift 源)。本 gate は手順 section の text 存在のみ blocking。 | 容易 (P1a 確定後に reconcile) |
| D5 | postv5 で `docs/_SSOT.md` に backend 行を新設するか | **本 gate では新設しない (defer to P1a)** | backend doc がまだ存在しない段階で SSOT mapping に行を足すと dangling reference。backend doc 登場時に追加が正しい順序。 | 容易 (P1a で追加) |

### Right-sizing notes

- **編集は in-place のみ** — 新 SSOT system / 新 doc / 新 frontmatter を作らない。既存 2 CLAUDE.md + 2 README + 1 workflow (`.github/workflows/pages.yml` ROOT) の局所編集に限定。
- **narrowing は 1 軸** — 「demo backend なし」だけを反転。4 mock 事実 (顧客データ / AI / 実外部接続 / 規制 cite) は verbatim 保持し、grep gate で巻き込み削除を検出。これを越えて mock 事実まで narrow するのは DEFECT。
- **pages.yml は #1 option ② に DEFER (archive)** — 本 gate は deploy 方向を独自決定せず #1 contract option ② (Node host + Pages redesign-job archive) に従属する。本 gate の責務は「server deploy へ切替・Pages redesign-job archive」を SSOT 文書 (README/CLAUDE.md) に反映することのみ。pages.yml 実体の archive 機構 (file 削除 OR redesign step 削除) と v1 retention は #1 A-3 / D-2 (OPEN) が SSOT。本 gate 単独で server-deploy CI を新設はしない (production hardening は #1 の領域)。
- **script 名・secret 機構・実走は本 gate で扱わない** — P1a と二重管理を避け forward reference 化。本 gate は「手順 section の text 存在」のみ blocking 化し、値・実装・実走 (server 4xx reject 確認) はすべて P1a が担う。本 gate 単体に production hardening drift なし。
- **本 plan は edit を実行しない** — list 化と gate 定義のみ。実行は P0 承認後。これにより P0 承認前に SSOT が prematurely backend 化して code と乖離する事故を防ぐ。
- **pill drift は明文化に留める** — 実 pill の文言・component 統合は postv5 UI contract の責務。本 gate の blocking は「doc が live 実体 (`V2Shell.tsx:202`) を指す訂正」のみ (scope creep 回避、D3 文言確定とは分離)。
