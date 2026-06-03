## P0 #5 — Test migration plan (31 files)

postv5 で store (React reducer + localStorage) を Node + better-sqlite3 + API backend に置換した時、現行 31 test を「どの層で何を検証し続けるか」を file 単位で確定し、SoD / propose-execute / append-only audit の falsifiable な server test を新設する移行契約。**right-sizing 原則**: 既存 vitest + 既存 Playwright probe (`audit-v3-probe.mjs`) を再利用し、別 e2e framework を新設しない。enforcement の真偽値は server test が握り、UI test は「server が拒否した結果 (`{ ok: false, denialReason: <ENUM> }`) が画面に正しく出る」だけを見る。

> **採用済 default (canonical、prompt arch note 整合)**: component test の API mock は **MSW を採用** (devDep)。client cache は **@tanstack/react-query を採用** (client runtime dep、arch note「client は API + cache (TanStack Query 等)」)。identity は **operator≠persona の dual-ID 署名トークンモデル** — `session_operator_id` (検証済 `X-Operator-Token` 由来の実 operator) と `effective_actor_id` (body `actorId` 由来の demo persona、**`allowed_actors` (= seeded `actors` table 全行 = 3 operational + ≥2 governance = 5 actors) に対し server 検証**、unknown は UNKNOWN_ACTOR で reject) を分離する。**persona 検証 (actorId ∈ allowed_actors=5) と authorization (governance role は全 mutation を read-only reject、operational role は identity-SoD + state) は別 layer** — governance actorId は layer 1 を通過してこそ governance-boundary test が layer 2 (governance reject) に到達できる。**UI persona switcher は 3 operational actor (`DEMO_ACTORS`、live const、actors.ts:17-21、unchanged) のまま**で、governance は P3 governance view 経由 (operational switcher 非経由)。「UI 切替 subset (3)」を server effective-actor 検証 universe として再利用しない。署名秘密鍵 env は単一名 `BOAI_SESSION_SECRET`。endpoint は全て `/api/` prefix。endpoint 境界は zod `.strict()` schema で検証 (unknown-field reject = mass-assignment 防御)。schema lifecycle は `schema_migrations` 台帳 (forward-only、boot 適用) が担う。

> Ground truth は **live main @ 1e45ea7 (postv4)**。dated roadmap doc (remediation-roadmap-*, p0-remediation-plan-*) は HISTORICAL。本契約は 31 file を直接 Read して分類。

---

### 0. 現状の構造的事実 (live 引用)

| 事実 | 根拠 |
|---|---|
| test runner = vitest 4.1 + jsdom 29、**単一 project (`environment: 'jsdom'`、`globals: true`、`include: src/__tests__/**`)**、setup は jest-dom + jest-axe 登録 | `prototype-redesign/vitest.config.ts:9-14`、`src/__tests__/setup.ts:3-7` |
| **setup.ts が `localStorage` を in-memory `LocalStorageMock` に差し替え + `afterEach` で `localStorage.clear()`** | `src/__tests__/setup.ts:18-44`、`:12-14` |
| 本番 provider 順 = `BrowserRouter > StoreProvider > ViewProvider > App` | `src/main.tsx:12-18` |
| 15 route は `V2Shell` layout 配下 (`/`,`/hub`,`/cases`,`/cases/new`,`/cases/:id`,`/approvals`,`/proposals`,`/proposals/:id`,`/agents`,`/agents/:id`,`/observatory`,`/search`,`/inbox`,`/business-approver`,`/config-approvals`,`/escalations`) | `src/App.tsx:35-53` |
| store は client reducer、永続は localStorage、hydrate は lazy reducer initializer + StorageEvent listener | `src/store/StoreProvider.tsx:14`,`:23-30` |
| SoD / state transition / append-only audit (`logEvent`) の authority は `store/reducer.ts` | (本契約の主たる移行対象) |
| **`loading-error.test` は `describe.skip`**、理由は honesty 判断: 「v2 は in-memory 同期で fetch を伴わず loading/error 状態が**構造的に発生しない**。`?demo` seam は v1 の取得縮退デモ機構で v2 に存在しない (偽の loading/error UI を作らない = honest)」 | `src/__tests__/pages/loading-error.test.tsx:23-25` |
| **`routes-axe` は構造 a11y のみを検証 (color-contrast は jest-axe/jsdom が評価せず silent skip、contrast は `check:design` が別途担保)** | `src/__tests__/a11y/routes-axe.test.tsx:9-11` |
| Playwright probe は再利用 helper `audit-v3-probe.mjs` 経由で **preview server を stateless に叩く** (per-context app state)、BASE default = `http://localhost:4174` | `prototype-redesign/audit-v3-probe.mjs:12`,`:17`,`:18`,`:22-26`、consumer 例 `probes/verify-_cases__id.mjs:1` |
| **`playwright` / `axe-core` は package.json に未宣言** (node_modules に transitive 存在のみ: playwright は別途 install 済、axe-core は jest-axe 経由)。**`vite preview` は port flag を持たず default 4173 で起動 (probe default 4174 と不一致)**、dev server は 5174 | `package.json:19-` (deps に playwright/axe-core なし)、`package.json:10` (preview に port flag なし)、`vite.config.ts:16` (dev 5174) |
| `@tanstack/react-query` / `msw` / `zod` / `better-sqlite3` / `supertest` は **現 package.json に不在** (postv5 で `@tanstack/react-query`=client dep、`msw`/`playwright`/`axe-core`=devDep、`zod`/`better-sqlite3`=server dep を追加、`supertest` は EXCLUDE)。これら dep 追加と `preview --port 4174` script 追加は **#7 (deps/scripts 表) が SSOT**、本契約は cross-reference のみ | `grep` 結果 NONE (現状)、追加先は #7 |
| build = `tsc -b && vite build`、`check:all` = lint→no-op→types→types:test→design→test→build | `package.json:8`,`:17` |

**移行の核心的 break 源 (3 つ)**:
1. **dispatch-capture + `act(dispatch(...))` で state を前提条件として注入する pattern** — page test の過半 (approvals-permission, business-approver, escalation-arbitration, reversal, search-notify) が render 途中で `useStoreDispatch` を capture し `act()` で `case/escalate` 等を流して fixture を作る。store が server になると dispatch は同期 reducer ではなく非同期 API mutation になり、この同期 state 注入が成立しない。
2. **localStorage 永続前提**: setup.ts の mock、`clearPersisted`/`savePersisted`/`loadPersisted` 直接呼び出し、SCHEMA_VERSION fallback test、w3-remediation の unmount/remount hydrate、multi-tab の StorageEvent。
3. **seed() が in-memory で即時に decision-ready state を返す前提**: server では seed は DB fixture となり、test は API 経由か直接 DB query で読む。

---

### 1. 移行後の test 層 (4 層) と定義

| 層 | 実行環境 | 何を検証 | 新規 dep | 既存からの由来 |
|---|---|---|---|---|
| **server unit** | vitest (node env project)、in-memory or tmpfile sqlite | reducer 由来の SoD / transition / audit-append ロジックを **server 関数で** falsifiable に検証 (自己承認 reject、precondition no-op、append-only) | better-sqlite3 (P0 #1)、API service module。**新 test dep 0** | store.test / audit-events.test / persist.test / selectors.test のロジック contract |
| **API (integration) test** | vitest (node env project)、**HTTP server を立てず handler 関数を in-process で直接呼ぶ (invariant 層は real-HTTP を使わない)** | handler が `X-Operator-Token` 由来 `session_operator_id` + body `actorId` 由来 `effective_actor_id` を見て denial を返す、append-only 違反を拒否、GET が seeded fixture を返す。**assertion は `denialReason` enum** (bare HTTP code ではない、§4 denial 規約) | API server module、demo session helper、zod `.strict()` 境界 schema。**新 test dep 0 (supertest 等 HTTP-client default は EXCLUDE、real-HTTP smoke は S4 Playwright のみ、下記 OD-5)** | dispatch-capture 系 page test の「reducer precondition と整合」assertion |
| **component test (API mock)** | vitest + jsdom | 画面が API response (loading / data / error / denial) を正しく render、操作後の再 fetch 反映 | **MSW を採用 (devDep、node interceptor mode、OD-1 resolved=adopt)**。client cache は **@tanstack/react-query を採用 (client runtime dep、OD-2 resolved=adopt)** | render-full-App / renderHook 系 (smoke, routes-axe, cases-triage, detail-routing, observatory-drill, search-notify UI, w3-remediation UI) |
| **Playwright probe (e2e)** | 既存 `audit-v3-probe.mjs` + 実 server (sqlite seeded) | end-to-end で SoD / 操作 / 画面遷移が実 backend 込みで成立、a11y sweep | **新 framework 0**。ただし playwright / axe-core を devDependencies へ**明示宣言する作業が必要** (現状 transitive 依存、§4 S4 blocking 基準) | audit-v3-axe-sweep / 手動 probe。**別 e2e framework を新設しない** |

post-migration の **期待分布** (31 file → 重複再配置あり、後述の per-file 表が SSOT):
- server unit: 4 file 由来 (store, audit-events, persist, selectors の論理) → server test 4〜5 file。
- API test: 新規 ~3 file (case SoD / proposal SoD+execute / agent promotion+killswitch、escalation 含む)。
- component (API mock): ~14 file (UI render 系)。
- pure (React 非依存・移行不要): 4 file (view-persist は localStorage 用途次第で要再判断、lineage-coherence, manual-honesty, datatable の一部)。
- Playwright e2e: SoD / 操作系の薄い happy-path 1〜2 probe を server 込みで追加 (既存 fleet に乗せる)。

---

### 2. file-by-file 移行表 (31 file)

凡例: **層** = server-unit / API / component(API mock) / pure / e2e。**判定** = keep (ほぼそのまま) / rewrite (層移動・大改修) / delete (役目消滅)。**unskip phase** = どの postv5 phase で green を要求するか (S* は本契約内 sub-phase、定義は §4)。

> **網羅性 gate**: 本表の 31 file が SSOT。§5 ledger 群は本表を 1:1 で受け、ledger 横断の coverage が **count=31** であることを §5 の mechanical gate で保証する。下表「ledger 帰属」列が各 file の出力先 ledger を固定する。

#### store/ (4 file) — SoD / transition / audit / persist の authority、最優先移行

| test file | 現 dependency | expected break | new layer | keep / rewrite / delete | unskip phase | ledger 帰属 |
|---|---|---|---|---|---|---|
| `store/store.test.ts` | 直 import `seed`/`storeReducer`/`savePersisted`/`loadPersisted`/`clearPersisted`、localStorage SCHEMA_VERSION fallback、`session/switchActor` で SoD 切替 (`store.test.ts` 該当多数) | reducer 消滅。localStorage SCHEMA fallback test (v1/v2/v4/v5/shape guard) は store 撤去で全消滅。SoD 遷移は server 関数へ移動。client の `session/switchActor` は dual-ID では persona 切替 (= client state + per-write body `{ actorId }`) に対応、専用 server switch endpoint は無い | **server-unit** (SoD/transition/audit append) + **API** (denialReason enum を返す) | **rewrite** — 遷移・SoD・冪等 no-op の assertion を server service test に 1:1 移植。API 側は `effective_actor_id` を body `actorId` から検証し SoD 違反を `denialReason` で拒否。SCHEMA fallback 群 (`store.test.ts` の v1/v2/v4/v5/shape guard 7+ test) は **delete** (`schema_migrations` 台帳 + boot 適用が代替、§3) | S1 | server-unit + API |
| `store/audit-events.test.ts` | `storeReducer` で操作 → `auditEvents` append、actor は `currentActorId` 由来 (owner 非依存)、SoD block 時は no-event、append-only (先頭 event 不変)、ts は `auditTs(auditSeq)` 決定的 (`reducer.ts:54`、18:00 base) | reducer 消滅。append-only の immutability は DB INSERT-only で担保 | **server-unit** (audit_events table append-only) + **API** (操作 endpoint が監査行を 1 件だけ追記) | **rewrite** — 「SoD block → no state change → no audit row」「`actor_id` (=`effective_actor_id`) は検証済 body actorId 由来、owner free-name に引きずられない」「同時に `session_operator_id` を token 由来で NOT NULL 記録」「先頭行 immutable」「ts は **`auditTs(auditSeq)` を live reducer から port、tz-aware ISO-8601 に正規化した決定的値** (runtime wall-clock 禁止)」を server test に移植。**append-only の最強 falsifiable test** ゆえ最優先 | S1 | server-unit + API |
| `store/persist.test.ts` | `loadPersisted`/`savePersisted`/`clearPersisted`、malformed auditEvents fallback、shape guard | persist 層が server では「`schema_migrations` 台帳 + boot 適用 + schema 検証」に置換。malformed localStorage という概念が消滅 | **server-unit** (DB open / `schema_migrations` 適用 / 壊れ row の扱い) — 縮小 | **rewrite (縮小)** — localStorage shape guard は delete。代わりに「`schema_migrations` を forward-only で順に適用し旧 schema → 新 schema」「`db:reset-demo` が全 migration を再適用」「壊れた row を読んでも crash しない」を最小限 1〜2 test に。**production hardening (網羅的 corruption matrix) は EXCLUDE** | S2 | server-unit |
| `store/selectors.test.ts` | `resolveCaseActors`、`DEMO_ACTORS`、pure 関数 (React/localStorage 非依存) | actor identity 解決は server でも必要だが、`resolveCaseActors` が client に残るか server に移るかは P0 #2 (identity) 次第 | **server-unit** (actor 解決が server なら) / **pure** (client lib に残るなら) | **keep (条件付き、下記 §4 暫定 assertion)** — `resolveCaseActors` の置き場所は P0 #2 で確定。pure logic ゆえ最小改修。four-eyes (入力者≠承認者) の不変条件 assertion は維持。**fixture 規約: operational mutation test は 3 operational actor (`DEMO_ACTORS`) を使い、governance-boundary test は governance actorId (∈ `allowed_actors`=5、live `DEMO_ACTORS`=3 には非含) を使う。`DEMO_ACTORS` は UI persona switch subset であり server effective-actor 検証 universe (allowed_actors=5) ではない** | S1 | pure (暫定) / server-unit (#2 確定後) |
| `store/hub-model.test.tsx` | `renderHook(useHubModel, { wrapper: StoreProvider })`、`seed()` の即時 store 値で KPI 算出 (`hub-model.test.tsx:15`) | `StoreProvider` が同期 seed を返す前提が崩れる。useHubModel が API fetch を待つ | **component (API mock)** (hook が API response から KPI 算出) | **rewrite** — wrapper を API-mock provider に。`useHubModel` の **算出式 (workflowId filter / baw count / attention 合算)** は不変、入力 source だけ API に。UC-BO-02=5 の契約 assertion は seeded DB fixture で維持 | S3 | component |
| `store/multi-tab.test.tsx` | `MemoryRouter > StoreProvider > ViewProvider > App`、StorageEvent dispatch で last-write-wins hydrate (`multi-tab.test.tsx:34`,`StoreProvider.tsx:23-30`) | **StorageEvent による cross-tab 同期は store 撤去で完全消滅**。server backend では multi-tab 同期は「再 fetch / WebSocket / polling」で、postv5 scope 外 | (なし) | **delete (judgement gate、前提条件 co-located、下記)** — multi-tab 同期は localStorage 専用機構。server 化でこの機構自体が消える。**再実装は production hardening ゆえ EXCLUDE**、この test も廃止。**delete 実行の前提条件**: P0 #1 (DB/persistence model) が localStorage 永続を sqlite へ完全置換し、cross-tab 同期を postv5 scope-out として確定すること。**#1 が multi-tab 同期を retain する判断をした場合は本 delete を撤回し component(API mock) 層へ再分類**。delete は #1 確定後に実行 | S1 (削除、#1 従属) | (delete、ledger 出力なし — count gate は §5 で 31 から除外せず "delete" status で計上) |

#### context/ (1 file)

| test file | 現 dependency | expected break | new layer | keep / rewrite / delete | unskip phase | ledger 帰属 |
|---|---|---|---|---|---|---|
| `context/view-persist.test.ts` | `persistProcess`/`loadProcess`、localStorage round-trip + fallback (`view-persist.test.ts:1`,`:21`) | ViewContext (選択業務 filter) は **UI-local preference** で server 化対象外。localStorage に残してよい | **pure** (localStorage UI pref として残置) | **keep** — 選択業務は server entity ではなく client 表示設定。setup.ts の localStorage mock を維持すれば不変。**server 化しない (right-size: filter UI pref を DB に置くのは over-engineering)** | 変更なし | pure |

#### components/ (3 file) — UI primitive、store 非依存が多い

| test file | 現 dependency | expected break | new layer | keep / rewrite / delete | unskip phase | ledger 帰属 |
|---|---|---|---|---|---|---|
| `components/datatable.test.tsx` | `MemoryRouter` + `DataTable` を **inline ROWS fixture** で driving (sort/filter/pagination/selection/Link)。store 非依存 | breakなし (store も API も触らない、Link 用 Router のみ) | **pure (component)** | **keep** — DataTable は presentational。inline fixture ゆえ移行不要。axe assertion 維持 | 変更なし | pure |
| `components/modal.test.tsx` | `Modal`/`ReasonDialog` を local harness で driving (focus trap/Esc/scroll-lock/dirty-guard)。store 非依存 | breakなし | **pure (component)** | **keep** — overlay primitive。submit gate validation は API 化後も client-side、不変 | 変更なし | pure |
| `components/prototype-mode-label.test.tsx` | `PrototypeModeLabel` のみ。store 非依存。live pill 文言は **「プロトタイプ表示 — 外部未接続 / 実データなし / AI・証跡はモック」** (`prototype-mode-label.test.tsx:11`) | breakなし | **pure (component)** | **keep** — disclosure 文言は live verbatim で維持。**server 接続後も文言は維持** (right-sizing 原則: mock data / 実 AI なしは PRESERVE)。文言更新の要否・両 CLAUDE.md との drift 是正は **#9 doc 契約** が SSOT | 変更なし | pure |

#### data/ (3 file) — mock fixture の整合性、純データ

| test file | 現 dependency | expected break | new layer | keep / rewrite / delete | unskip phase | ledger 帰属 |
|---|---|---|---|---|---|---|
| `data/lineage-coherence.test.ts` | `CASE_DETAILS`/`PROPOSAL_DETAILS` を直 import、純データ整合 (sourceCases ↔ detail、% 表記 guard) | mock fixture が server seed の source になるなら break なし。fixture が DB seed script に移ると import path 変更のみ | **pure** (fixture が client にも残る) / **server-unit** (seed script の整合 test に移植) | **keep (path 調整、下記 §4 暫定 assertion)** — fixture が「DB seed の source of truth」になる場合、同じ assertion を seed script 検証として再利用。logic 不変 | S2 | pure (暫定) / server-unit (#2 確定後) |
| `data/manual-honesty.test.ts` | `buildManualCaseDetail`/`CASE_DETAILS`、純データ (manual 案件が AI 処理を捏造しない) | fixture builder が client に残るか server に移るか次第 | **pure** / **server-unit** | **keep (下記 §4 暫定 assertion)** — honesty 契約 (origin=manual は AI step なし、押印=サンプル明示) は **規制上 material**。fixture がどこへ移っても assertion 維持。**falsifiable な mock-honesty gate として優先保持** | S2 | pure (暫定) / server-unit (#2 確定後) |
| `data/pv2b-seed.test.tsx` | `renderHook(useEscalations/usePendingPromotions/useNotifications, { wrapper: StoreProvider })`、fresh `seed()` の reset 状態で薄画面が表示される (`pv2b-seed.test.tsx:9`,`:16`) | StoreProvider 同期 seed 前提が崩れる | **component (API mock)** | **rewrite** — wrapper を API-mock provider に、seeded DB fixture で「escalation/promotion/notification が空でない」を検証。selector logic 不変 | S3 | component |

#### pages/ (14 file) — 画面 + 操作。dispatch-capture pattern の主戦場

| test file | 現 dependency | expected break | new layer | keep / rewrite / delete | unskip phase | ledger 帰属 |
|---|---|---|---|---|---|---|
| `pages/approvals-permission.test.tsx` | render-App + dispatch-capture + `act(dispatch(session/switchActor))` で承認者面の権限提示を検証 (`approvals-permission.test.tsx:43`) | dispatch-capture が API mutation 化で同期注入不能。persona 切替は dual-ID では client state + per-write body `{ actorId }` (専用 server switch endpoint 無し) | **API** (操作系 = identity-SoD + prior-state、role gate 無し) + **component (API mock)** (画面の権限提示文言) | **rewrite** — 「checker persona で承認可能の事前提示」を ① server: `POST /api/cases/:id/approve` が `effective_actor_id`≠inputter かつ prior-state OK のとき許可、自己承認は `denialReason` で拒否 ② component: API mock で persona 切替時の UI 文言。**SoD の core 契約ゆえ S1 で server 側、S3 で UI 側** | S1 (server) / S3 (UI) | API + component |
| `pages/business-approver.test.tsx` | renderHook + dispatch-capture 多数 (`proposal/forward`→別actor承認, `agent/requestPromotion`, `case/escalate`→`resolveEscalation`)、`AgentDetailV2` 承認者 mode (`business-approver.test.tsx:22-98`) | dispatch-capture で SoD 経路を作る pattern が全滅 | **API** (forward→approve の四眼、promotion 申請≠承認、escalation 起票≠裁定、いずれも identity-SoD で `denialReason` 拒否) + **component (API mock)** (業務責任者 inbox 表示) | **rewrite** — propose/execute + escalation SoD の **最重要 server test 群** (`/api/proposals/:id/...`、`/api/agents/:id/promotion-approve` 等、`session_operator_id` 一定でも `effective_actor_id` 同一なら拒否)。inbox selector logic は API mock。**S1 で server SoD、S3 で UI** | S1 (server) / S3 (UI) | API + component |
| `pages/cases-triage.test.tsx` | render-App + userEvent で受信トレイ sort / 一括操作 (`cases-triage.test.tsx:25`,`:36`) | App が API fetch 待ち。一括承認は server mutation | **component (API mock)** (sort UI) + **API** (`POST /api/cases/:id/approve` 群が flags>0 を skip) | **rewrite** — sort は component。bulkApprove の「flagged skip」は server test (prior-state precondition は server authority、skip は state 不変 = denialReason precondition) | S3 (UI) / S1 (bulkApprove server) | API + component |
| `pages/detail-contract.test.tsx` | render `CaseDetailV2`/`ProposalDetailV2`/`AgentDetailV2` + `StoreProvider` + Routes、C 型 単一決定面 contract、`CASE_DETAILS` fixture | StoreProvider 同期前提。detail data が API fetch | **component (API mock)** | **rewrite** — C 型 contract (単一決定面) は UI 構造契約ゆえ API-mock-backed で維持。fixture を API response 化 | S3 | component |
| `pages/detail-routing.test.tsx` | render-App + 全 list/detail fixture import、`:id` 連動 / 未知 id → not-found / dict coverage / 証拠アンカー整合 / 承認ボタンが reducer precondition と整合 (`detail-routing.test.tsx:95`) | App fetch 待ち。**「承認ボタンが reducer precondition と整合」は reducer 消滅で server precondition 整合に置換**。cross-actor 直 ID access は IDOR で `denialReason='NOT_FOUND'` (HTTP 404, existence-hiding) | **component (API mock)** (routing/not-found/anchor) + **API** (approve precondition + IDOR 404) | **rewrite** — routing/coverage/anchor は component。承認 gate 整合は ① server precondition test ② UI が gate を反映 (useCanApprove → API)。他 actor の case を直 ID で引くと `denialReason='NOT_FOUND'` を返す IDOR test を追加 | S3 (UI) / S1 (gate server) | API + component |
| `pages/escalation-arbitration.test.tsx` | render `CaseDetailV2` + dispatch-capture、`case/escalate`→`session/switchActor`→`resolveEscalation`、**起票者は self-arbitration 不可 (SoD lock)** (`escalation-arbitration.test.tsx:38-77`) | dispatch-capture 全滅。self-arbitration block は `reducer.ts` の `escalation.to===currentActorId` guard (= identity-SoD、role gate ではない) | **API** (escalation 起票者 ≠ 裁定者の identity-SoD lock) + **component (API mock)** (裁定面 UI / 理由空 error) | **rewrite** — **self-arbitration block は falsifiable な identity-SoD 契約**、S1 で server test (起票 `effective_actor_id` が resolve を試みると `denialReason` で拒否、HTTP 403)。理由空 validation は client + zod 境界、component | S1 (server) / S3 (UI) | API + component |
| `pages/loading-error.test.tsx` | **現在 `describe.skip`** (`loading-error.test.tsx:23-25`)。**skip は honesty 判断: v2 は in-memory 同期で loading/error が構造的に発生しない、`?demo` seam は v1 の機構で v2 に存在しない (偽の loading/error UI を作らない)** | 現状 skip ゆえ break しない。**API 化で loading/error が初めて実在化する** — この skip 理由 (loading/error が今は構造的に存在しない) が、まさに「postv5 で unskip 本命」の論拠を直接支える | **component (API mock)** (API pending → loading、API 5xx → error UI) | **rewrite + unskip** — postv5 で最も価値が出る test。API mock を delay/fail させ loading/error UI を検証。`?demo` seam を捨て実 API state に | **S3 (unskip 本命)** | component |
| `pages/manual-entry.test.tsx` | render-App + userEvent で `/cases/new` form 起票 (`manual-entry.test.tsx:26`) | form submit が `case/create` dispatch → API POST | **component (API mock)** (form 入力 → POST → 一覧反映) + **API** (`POST /api/cases` で draft 作成 + 監査 append) | **rewrite** — form UX は component。`POST /api/cases` は zod `.strict()` 境界で unknown-field を拒否、起票が `audit_events` 1 行 append (`actor_id`=`effective_actor_id`、`session_operator_id` も記録) は server test (audit-events 系と重複担保) | S3 (UI) / S1 (create server) | API + component |
| `pages/observatory-drill.test.tsx` | render `ObservatoryV2` + StoreProvider、drill + axe (`observatory-drill.test.tsx:20`) | StoreProvider 同期前提。台帳 data が API | **component (API mock)** | **rewrite** — drill UI / axe は API-mock-backed。台帳 (cross-ledger) を API response 化 | S3 | component |
| `pages/process-filter.test.tsx` | render-App + `ViewProvider`、ProcessSelector → /cases filter 伝播 (`process-filter.test.tsx:23`) | filter は client-side ViewContext (server 化しない)、ただし list data は API | **component (API mock)** | **rewrite (軽)** — ProcessSelector は client pref のまま。list を API mock にし「選択業務で list が絞られる」を検証 | S3 | component |
| `pages/reversal.test.tsx` | render `CaseDetailV2` + dispatch-capture、approver 切替→`case/reverse` 訂正/取消、不可逆 guard、`useNotifications`/`useCanReverse` (`reversal.test.tsx:44-111`) | dispatch-capture 全滅。**reflected→sent-back の不可逆 guard / 二重 reverse no-op は reducer authority** | **API** (`POST /api/cases/:id/reverse`: reflected 以外の reverse 拒否、二重 reverse 拒否、identity-SoD、いずれも `denialReason` 返却) + **component (API mock)** (反映済 badge / 理由空 error / 通知反映) | **rewrite** — 不可逆 guard は **falsifiable な状態遷移契約**、S1 server (precondition 違反は HTTP 403 + denialReason)。reversal の identity-SoD (approver persona のみ) も server。UI は component | S1 (server) / S3 (UI) | API + component |
| `pages/search-notify.test.tsx` | renderHook (`useSearchResults`/`useNotifications`/`useUnreadCount`) + dispatch-capture (`sendback`/`escalate`→notification 生成、markRead) + `SearchV2` page render (`search-notify.test.tsx:15-107`) | renderHook 同期前提。notification 生成は server 派生 | **component (API mock)** (search UI / notification 一覧 / 未読 badge) + **API** (markRead 冪等、`effective_actor_id` 厳密 notification) | **rewrite** — search/notification の selector logic を API-mock-backed で。markRead 冪等は server test (read 集合は server state、他 actor の通知への直 access は IDOR `denialReason='NOT_FOUND'`) | S3 (UI) / S1 (markRead server) | API + component |
| `pages/sla-elapsed.test.tsx` | `elapsedLabelFrom`/`caseElapsedLabel`/`NOW_ISO` 純関数 (`dates.ts`、`sla-elapsed.test.tsx:11`) + render-App で経過列 render | **純関数部は break なし** (`lib/dates.ts` は server 化非対象)。render-App 部のみ API 化 | **pure** (dates 計算) + **component (API mock)** (一覧の経過列 render) | **keep (純関数) + rewrite (render 部)** — `elapsedLabelFrom`/`caseElapsedLabel` の datetime 計算 test は不変。一覧 render は API mock。**NOW_ISO=2026-05-30T18:00 固定は server seed でも維持** (決定的 fixture) | S3 (render 部) | pure + component |
| `pages/w3-remediation.test.tsx` | render-App + dispatch-capture + **unmount → remount で localStorage persist hydrate** (`w3-remediation.test.tsx:183-197`)、override→humanValue 表示、persona SoD、sendback read-only、reset confirm Modal、flywheel | **unmount/remount localStorage hydrate は store→server で完全に成立しない** (persist が DB へ、client が plain `<a>` で再 nav するという前提が消える) | **component (API mock)** (override 表示 / SoD UI / sendback read-only / reset confirm) + **API** (override→監査、identity-SoD、reset) | **rewrite (重)** — 機能別に分割。unmount/remount hydrate assertion は **delete** し、代わりに「mutation→再 fetch (@tanstack/react-query invalidate) で UI 反映」を MSW backed で。緊急停止→一覧反映は ① server `emergencyStop`/`resume` = **state-only (role gate 無し、live reducer 準拠)** ② UI 再 fetch。reset は **P0 = CLI `db:reset-demo` のみ** (HTTP `POST /api/admin/reset` は OUT-OF-P0、admin/system role、governance は READ-ONLY ゆえ不可)。**最も改修コストが高い file** | S1 (server) / S3 (UI) | API + component |

#### a11y/ (3 file)

| test file | 現 dependency | expected break | new layer | keep / rewrite / delete | unskip phase | ledger 帰属 |
|---|---|---|---|---|---|---|
| `a11y/keyboard-a11y.test.tsx` | `ProcessSelector` + `ViewProvider` のみ (roving listbox / Esc / outside-click)、store 非依存 | breakなし | **pure (component)** | **keep** — client UI pref、store 非依存。axe 維持 | 変更なし | pure |
| `a11y/routes-axe.test.tsx` | render-App 15 route 全 axe sweep + skip-link/main landmark (`routes-axe.test.tsx:42`)。**構造 a11y のみ (color-contrast は jsdom で評価されず silent skip、contrast は `check:design` 担保)** (`routes-axe.test.tsx:9-11`) | App が API fetch 待ち → axe 実行前に data 必要 | **component (API mock)** | **rewrite (軽)** — wrapper を API-mock-backed に。**15 route の axe 0 violation gate を維持 (但し scope = 構造 a11y role/label/name/landmark/dup-id のみ、color-contrast は対象外で over-claim しない)**。各 route が seeded API data で render。route list は `App.tsx:35-53` を SSOT に再導出 | S3 | component |
| `a11y/smoke.test.tsx` | `PrototypeModeLabel`/`StatusBadge` のみ、store 非依存 | breakなし | **pure (component)** | **keep** — primitive a11y harness 検証、不変 | 変更なし | pure |

#### smoke/ (1 file)

| test file | 現 dependency | expected break | new layer | keep / rewrite / delete | unskip phase | ledger 帰属 |
|---|---|---|---|---|---|---|
| `smoke/routes.test.tsx` | render-App 15 route no-white-screen smoke (`smoke/routes.test.tsx:42`) | App fetch 待ち | **component (API mock)** | **rewrite (軽)** — wrapper を API-mock-backed に。15 route が seeded API data で white screen しない smoke を維持。`App.tsx` route と count gate (15) を整合 | S3 | component |

---

### 3. server unit test の最小 contract (DDL / rule)

store.test / audit-events.test / persist.test が検証していた不変条件を **server で falsifiable に** 再現する最小要件。better-sqlite3 schema は P0 #1、identity (dual-ID `session_operator_id`/`effective_actor_id`) は P0 #2/#3、authorization は P0 #4 が SSOT。本契約は **test が要求する不変条件** のみ定義。**denial 規約**: 拒否は `{ ok: false, denialReason: <ENUM> }` を返し、test は **`denialReason` enum を assert** (bare HTTP code ではない)。authz/SoD/precondition denial は HTTP 403、IDOR existence-hiding のみ HTTP 404 + `denialReason='NOT_FOUND'`。

| 検証対象 (server) | 由来 test | falsifiable assertion (server test が必ず拒否する破壊試行) |
|---|---|---|
| case approve four-eyes (identity-SoD) | store.test:153-163, audit-events.test:53-61 | 同一 `effective_actor_id` が input 承認後に checker 承認を試みる → **server が `denialReason` で拒否** (status 不変)。`session_operator_id` が同一でも persona (`effective_actor_id`) で判定。`isSelfApproval(inputApprovedBy, effectiveActor)` 相当を server で |
| proposal propose/execute 分離 (identity-SoD) | store.test:91-95, business-approver.test | forward した `effective_actor_id` 自身が approve → **denialReason 拒否** (`forwardedBy===effectiveActor` block) |
| agent promotion SoD (identity-SoD) | store.test:225-233 | promotion 申請 `effective_actor_id` が自分で approve → **denialReason 拒否** (`promotionRequestedBy===effectiveActor`)。**role gate ではない** (operational execute は identity-SoD + prior-state のみ) |
| escalation self-arbitration lock (identity-SoD) | store.test:266-280, escalation-arbitration.test | `escalation.to` 以外 (= 起票者 `effective_actor_id`) が resolve → **denialReason 拒否** (resolution 未確定のまま) |
| emergencyStop / resume (state-only) | store.test, w3-remediation.test | precondition 違反の停止/再開 → **denialReason 拒否** (state 不変)。**role gate なし** (live reducer 準拠の state-only) |
| governance read-only gate | audit-events.test, observatory-drill.test | governance role が **任意の mutation** を試みる → **denialReason 拒否**。逆に `GET /api/audit-events` 等の governance-only READ を inputter/checker/business-approver が叩く → **denialReason 拒否** |
| object-level IDOR | detail-routing.test, search-notify.test | 他 actor の case/通知を直 ID で access → **`denialReason='NOT_FOUND'` (HTTP 404, existence-hiding)** |
| append-only audit | audit-events.test:40-61 | (a) 既存 `audit_events` 行の UPDATE/DELETE を試みる → **DB trigger (`BEFORE UPDATE` / `BEFORE DELETE` → `RAISE(ABORT,'immutable')`) が ABORT で拒否** (INSERT-only、prompt #8b 必須)。(b) SoD block 時に audit 行が **増えない**。(c) `actor_id` (=`effective_actor_id`) は検証済 body actorId 由来、owner free-name に引きずられない。`session_operator_id` も NOT NULL で同時記録 |
| audit_events 不変 DB trigger (P0 required、prompt #8b) | audit-events.test:40-61 | `audit_events` の `BEFORE UPDATE` trigger を経由する行更新 → **`RAISE(ABORT,'immutable')` で ABORT**。`BEFORE DELETE` trigger を経由する行削除 → **同じく ABORT**。**この 2 trigger の存在と発火は必須 P0 test** (コード経路の不在だけでなく DB 層強制を falsifiable に検証)。hash-chain / WORM / retention / 署名 は EXCLUDE |
| 不可逆 reverse guard | store.test:296-319, reversal.test | (a) 非 reflected case の reverse → **denialReason 拒否**。(b) 二重 reverse → **denialReason 拒否** |
| precondition no-op | store.test 多数 | flags>0 case の input 承認、pending case の sendback → いずれも **state 不変 (denialReason precondition)** |

**決定的 fixture (server seed)**: server seed は client と同じ決定的時刻を再現する — base 時刻 `2026-05-30T18:00:00+09:00` を seed に固定し、audit 行の `occurred_at` は **live reducer の `auditTs(auditSeq)` (`reducer.ts:54`、18:00 base + auditSeq 単調増加) を server へ port し、tz-aware ISO-8601 に正規化した決定的値** を再現する。これにより server-seed test / audit-order test / sla-elapsed が依存する「決定的な順序・経過時間」が server test で再現可能。**server-seed / audit-order test は wall-clock を一切 assert せず `auditTs(seq)` 由来の tz-ISO 値のみを assert する** — runtime wall-clock (`Date.now()`) を seed/audit に使わない (test 非決定化を防ぐ)。

**audit append-only の必須実装 (P0 evidence、prompt #8b mandates)** = `audit_events` table を INSERT-only に運用 + 「UPDATE/DELETE 経路を server コードに持たない」+ **DB trigger による強制を必須とする**: `audit_events` に `BEFORE UPDATE` / `BEFORE DELETE` の 2 trigger を置き、いずれも `RAISE(ABORT, 'immutable')` で abort する (prompt #8b 必須)。**この 2 trigger は P0 required test 対象** — server-unit test が「既存行の UPDATE/DELETE が trigger により ABORT で拒否される」ことを falsifiable に検証する。**ただし hash-chain (前行 hash 連鎖) / external WORM ストレージ / retention policy / 署名 (signature) は production hardening ゆえ EXCLUDE** (regulatory reviewer には「コードに変更経路が無い + DB trigger が変更を ABORT + test が変更を拒否」で coherent)。

**`audit_events` columns (canonical、DDL は #8 が SSOT)**: `id` / `seq` (INTEGER UNIQUE) / `entity_type` / `entity_id` / `case_id` (FK) / `actor_id` (FK = `effective_actor_id`) / `session_operator_id` / `action` / `occurred_at` (tz ISO) / `before_json` / `after_json`。role は `actor_id->roles.label` で DERIVED (NOT stored)。**operational `audit_events` に confidence column は無し** (live logEvent は '—' を埋める)。confidence は static OBS_LEDGER / CROSS_LEDGER の governance table 側 (confidence が real) のみに存在。

**schema migration test (persist.test 後継)**: 「旧 sqlite file を開いて `schema_migrations` を forward-only で当て、起動が crash しない」を 1 test。`schema_migrations(version, name, applied_at, checksum)` 台帳は boot 時に順適用、各 migration は rollback NOTE を持つ (auto-rollback ではない)、`db:reset-demo` で全 migration を再適用。**localStorage SCHEMA_VERSION の v1/v2/v4/v5/shape-guard 網羅 (store.test の 7+ test) は delete** — localStorage という layer ごと消えるため移植不要。

---

### 4. unskip phase の定義 (本契約内 sub-phase)

| phase | 内容 | blocking 完了基準 |
|---|---|---|
| **S1** | server unit + API test 新設 (SoD / propose-execute / append-only / 不可逆 guard)。store.test / audit-events.test の論理移植。multi-tab.test delete (**P0 #1 が multi-tab scope-out を確定後に実行**) | server test が §3 の全 falsifiable 破壊試行を **拒否** で green。`vitest run` の node project が green。**selectors.test / lineage-coherence / manual-honesty は P0 #2 未確定の間 pure 層 (client lib + setup.ts localStorage mock) のまま暫定 keep し、four-eyes / honesty assertion を現 import path で green に保つ。#2 が server identity を確定した時点で server-unit へ再分類**。どちらの分岐でも S1 を green にできる (暫定 default = client 残置) |
| **S2** | persist.test → migration test 縮小移植。data/ fixture test の path 調整 | migration test green、fixture 整合 test green |
| **S3** | component test (API mock、MSW backed) 全 rewrite (render-App / renderHook 系)、client cache は @tanstack/react-query。**loading-error.test を unskip**。15 route axe / smoke を MSW-backed で復帰 | 全 component test green、**15 route axe 0 violation (scope = 構造 a11y のみ、color-contrast は `check:design` 担保で本 gate 対象外)**、loading-error green、**postv5 後の `check:all` script chain が green (具体 chain は S1 で確定、下記)** |
| **S4 (e2e、薄)** | 既存 `audit-v3-probe.mjs` fleet に SoD happy-path probe 1〜2 を実 server (sqlite seeded、`DB_PATH` driven) 込みで追加 | probe が server seeded state で SoD / 操作 / a11y sweep を pass。**別 e2e framework 新設なし**。**`playwright` / `axe-core` の devDependencies 明示宣言、および preview を probe BASE と一致する `--port 4174` で起動する script は #7 (deps/scripts 表) が SSOT に持つ** — 本契約は cross-reference し、S4 完了基準として「#7 が宣言した devDep + port 4174 script で probe が green」を要求する (現 `vite preview` default 4173 との不一致は #7 の port 4174 script で解消) |

**postv5 後の `check:all` script chain (S1 で確定)**: 現 `check:all` = `lint && check:no-op && check:types && check:types:test && check:design && test && build` (`package.json:17`)。server/API test を node env の vitest project に分けるため、postv5 では **(案 A 推奨) 単一 vitest config を `projects` で jsdom + node の 2 project に分け、`npm test` (= `vitest run`) で両 project を一括実行** する。この場合 `check:all` の `test` step は不変で両 project を走らせる。代替 (案 B) は `test:server` script を別立てし `check:all` に挿入するが、step が増え忘れやすいため非推奨。**どちらを採るかは S1 開始時に確定し、本表 S3 の「`check:all` script chain」に反映する** (「相当」という曖昧表現は禁止、確定した script 列を書く)。

---

### 5. 移行後 test 配置の deliverable 表 (契約 4 列)

| 表名 (test 層 grouping) | 必須列 | blocking 完了基準 | approval owner |
|---|---|---|---|
| server-unit test ledger | test file / 検証 SoD・transition・audit 不変条件 / falsifiable 破壊試行 (denialReason enum) / 由来 client test / **決定的 fixture (18:00 base + `auditTs(auditSeq)` tz-ISO の再現方法、wall-clock 不使用)** | §3 の全行が server test で green (破壊試行を `denialReason` で拒否)、`vitest` node project green | backend 実装 owner + user (SoD 契約承認) |
| API integration test ledger | `/api/` endpoint / 期待 denialReason enum (default HTTP 403、IDOR のみ 404 `NOT_FOUND`) / `session_operator_id` + `effective_actor_id` / 由来 page test / **決定的 seed fixture (18:00 base、`auditTs(seq)` tz-ISO) 由来** | 各 SoD endpoint が self-approval / governance mutation / IDOR を `denialReason` で拒否、append-only 違反を拒否、zod `.strict()` で unknown-field 拒否、green | backend 実装 owner |
| component test (API mock、MSW) ledger | test file / MSW handler endpoint (`/api/...`) / 検証 UI state (loading/data/error/denial) / 由来 client test | 全 component test green、loading-error unskip green、15 route axe 0 violation (構造 a11y scope) | frontend 実装 owner |
| pure / unchanged test ledger | test file / 残置理由 (component primitive / 純関数 / UI pref) / 不変確認 | 移行不要 file が postv5 後も green (回帰なし) | frontend 実装 owner |
| Playwright e2e probe ledger | probe file / 実 server seed 前提 / 検証シナリオ / a11y sweep | 既存 fleet + 新 SoD probe が server 込みで pass、新 framework 0、playwright/axe-core devDep 宣言済、preview port 4174 起動済 | frontend 実装 owner + user |

**§2 ↔ §5 mechanical coverage gate (count=31)**: §2 per-file 表の 31 file それぞれの「ledger 帰属」列が、上記 ledger 群のいずれか (または delete status) に 1 つ以上 mapping される。移行漏れを falsifiable に検出するため、**ledger 横断で 31 file 全てが (a) いずれかの ledger に出現する、または (b) delete status で計上される、ことを `count=31` assertion で検証**する (例: scripts/check-test-migration.mjs が §2 の file 集合と ledger 群の file 集合 + delete 集合の和集合を突合し、欠落 0 / 二重計上は server-unit+API+component の意図的重複のみ許容)。**この count gate を満たさない限り移行完了と宣言しない**。

---

### Open decisions (OD-1 / OD-2 は resolved=adopt、canonical)

- **OD-1: component test の driving 方式 — resolved = ADOPT MSW (devDep)**。prompt arch note 整合の canonical 決定。MSW は node interceptor mode (service worker 不要) で component 層に閉じて導入し、`/api/...` handler を共有定義する。本番 bundle を汚染しない test-only devDep ゆえ right-sizing と両立し、Playwright (e2e) は実 server を使うため MSW は component 層に閉じる。reversibility 高 (撤去は per-test stub に戻すだけ)。dep 宣言は **#7 (deps 表) が SSOT**。
  - **(rejected alternative)** per-test の薄い fetch stub を default に固定し MSW を kill-gate 越えのみ採用する案 — canonical 決定で却下 (arch note が API + cache を前提とし、~9 file が `/api/cases` `/api/proposals` `/api/agents` を共有 render するため共有 handler が初めから保守上有利)。
- **OD-2: client cache — resolved = ADOPT @tanstack/react-query (client runtime dep)**。prompt arch note「client は API + cache (TanStack Query 等)」整合の canonical 決定。mutation 後の再 fetch は Query invalidate で行い、component test (MSW backed) はこの cache 挙動を含めて検証する。dep 宣言は **#7 (deps 表) が SSOT**。
  - **(rejected alternative)** fetch + useState + 手動 invalidate で見送る案 — canonical 決定で却下 (arch note が cache 層を明示)。
- **OD-3: server unit test の DB は in-memory か tmpfile sqlite か** — 推奨 default = **in-memory (`:memory:`) を per-test 生成**。rationale: 決定的 seed + 高速 + cleanup 不要。tmpfile は migration test (S2) でのみ必要。reversibility = 高。
- **OD-4: `resolveCaseActors` / `lib/dates.ts` / ViewContext を client 残置か server 移管か** — 推奨 default = **client 残置** (経過時間計算・選択業務 filter は表示ロジック)。rationale: これらは entity の真偽ではなく表示派生で、server 化は over-engineering。ただし **最終 identity (誰が承認したか) は server audit 行 (`actor_id`=`effective_actor_id` + `session_operator_id`) が SSOT**。reversibility = 高。**この fork は P0 #2 (dual-ID identity) の確定に従属** — #2 が server identity を持つ場合は selectors.test / lineage-coherence / manual-honesty を server-unit に再分類 (§4 S1 の暫定 assertion 参照)。
- **OD-5: server invariant (server-unit + API integration) test の driving 方式 (in-process handler 直呼び vs supertest/HTTP-client)** — 確定 default = **HTTP server を立てず handler 関数を in-process で直接呼ぶ Vitest node project (新 test dep 0)**。server invariant 層 (SoD / propose-execute / append-only / 不可逆 guard) は **すべて in-process handler invocation** で検証し、**supertest 等の HTTP-client default は採らない (EXCLUDE)**。rationale: supertest 等の HTTP client を入れると HTTP server framework + test client の二重導入に drift する。handler を service module として export し、`X-Operator-Token` 由来 session / body `{ actorId }` を引数で渡して `denialReason` enum (HTTP 403 / IDOR 404) を assert すれば HTTP layer 抜きで SoD/append-only を falsifiable に検証できる。**real-HTTP smoke は invariant 層に置かず、薄い Playwright/e2e 層 (§4 S4、既存 `audit-v3-probe.mjs` fleet) でのみ担保する** — invariant 層と HTTP-transport 層を混ぜない。この方式は P0 #1/#3/#4 が定義する API service module の形状に従属する (handler が in-process call 可能な shape で export されること)。reversibility = 中 (real-HTTP は後から S4 Playwright で別途担保)。

---

### Right-sizing notes

- **component driving は MSW を採用 (devDep、node interceptor mode)** (OD-1 resolved=adopt、prompt arch note 整合)。`/api/...` handler を共有定義し、本番 bundle を汚染しない test-only dep として component 層に閉じる。dep 宣言は #7 が SSOT。
- **client cache は @tanstack/react-query を採用 (client runtime dep)** (OD-2 resolved=adopt、arch note「client は API + cache」整合)。mutation 後の再 fetch は Query invalidate、component test (MSW) がこの挙動を検証。dep 宣言は #7 が SSOT。
- **server invariant test (server-unit + API) は in-process handler 直呼び (Vitest node project) を default とし、supertest 等 HTTP-client default は EXCLUDE** (OD-5、#9 と整合)。HTTP server framework + test client の二重導入を防ぐ。assertion は `denialReason` enum (bare HTTP code ではない)。**real-HTTP smoke は invariant 層ではなく薄い Playwright/e2e 層 (S4) でのみ担保する**。
- **multi-tab.test を delete** にしたのは、StorageEvent cross-tab 同期が localStorage 専用機構で、server 化で機能自体が消えるため。WebSocket/polling での再実装は **demonstrate に不要な production hardening** ゆえ EXCLUDE。**ただし delete は judgement gate** — P0 #1 が multi-tab 同期を postv5 scope-out として確定した後に実行し、#1 が retain 判断をした場合は component 層へ再分類する (§2 store/ 表 + §4 S1)。
- **localStorage SCHEMA_VERSION fallback test 群 (store.test 7+ test) を delete**。localStorage layer ごと消えるため移植は無意味。`schema_migrations` 台帳 + boot 適用の migration test 1〜2 本で右サイズ的に代替。
- **append-only audit は DB trigger で強制する (P0 required、prompt #8b 必須)**。`audit_events` の `BEFORE UPDATE` / `BEFORE DELETE` → `RAISE(ABORT,'immutable')` の 2 trigger を必須 P0 evidence とし、server-unit test が「既存行の UPDATE/DELETE が ABORT で拒否される」を検証する。「変更経路を server コードに持たない + DB trigger が UPDATE/DELETE を ABORT + test が拒否」で regulatory reviewer に coherent。**hash-chain / external WORM / retention / 署名 は引き続き EXCLUDE (production hardening = DEFECT)**。
- **Playwright e2e は既存 `audit-v3-probe.mjs` fleet を再利用**、別 framework を新設しない。新 SoD probe も既存 helper の上に薄く乗せる。**`playwright` / `axe-core` の devDependencies 明示宣言と preview `--port 4174` script は #7 (deps/scripts 表) が SSOT に持つ** — 現状これらは package.json 未宣言で transitive 依存に乗っているのみ、preview default は 4173 と probe BASE 4174 が不一致。本契約 S4 は #7 が宣言した devDep + port 4174 script で probe が green になることを cross-reference して要求する。
- **`lib/dates.ts`・ViewContext・component primitive (datatable/modal/prototype-mode-label/keyboard-a11y/smoke) は移行不要で keep**。これらを server 化するのは scope 逸脱。**18:00 base + `auditTs(auditSeq)` を tz-aware ISO-8601 に正規化した決定的 ts は server seed でも再現** (server-seed / audit-order test はこの値のみを assert、wall-clock 不使用、§3)。
- **routes-axe の「0 violation」は構造 a11y scope のみ** (role/label/name/landmark/dup-id)。color-contrast は jest-axe/jsdom が評価しない (silent skip) ため本 gate の対象外で、contrast は `check:design` が別途担保。API mock 化後も over-claim しない。
- **mock data / 実 AI なし / 実外部接続なしは PRESERVE**。PrototypeModeLabel 文言 (live verbatim「プロトタイプ表示 — 外部未接続 / 実データなし / AI・証跡はモック」、文言是正は #9 doc 契約)・honesty test (manual-honesty) は server 接続後も維持。enforcement (SoD/execute/audit) だけが real になる。
