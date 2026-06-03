## P0 #7 — Package Layout & Scripts + Dependency Vetting (#9-8)

**目的**: postv5 で SoD / propose-execute / append-only audit を「server で falsifiable に実証する」ための最小バックエンドを、既存 client (`prototype-redesign`) のビルド・型・test 規律を壊さずに追加するための、ディレクトリ構成・TS project・npm scripts・依存承認の単一 contract。production hardening (auth framework / IdP / monitoring / prod infra) は本 contract の対象外であり、混入は DEFECT として flag する。

> Ground truth は LIVE code (main @ 1e45ea7 = postv4)。dated roadmap doc は HISTORICAL。本 contract が成立すると `prototype-redesign/CLAUDE.md` の「mock + in-memory only / 外部接続なし」記述は **SoD/execute/audit enforcement に限り server-backed** へ更新が必要 (記述 drift。本 contract §7 完了基準で同期を blocking 化)。

---

### 1. ディレクトリ構成 (DECIDED — server は client サブディレクトリ `prototype-redesign/server/`)

| 項目 | 決定 | 根拠 (file:line) |
|------|------|------|
| client root | `prototype-redesign/` (現状維持) | `package.json:2` name=prototype-redesign / `App.tsx` 15 route |
| server root | **`prototype-redesign/server/`** (client の子) | 後述「config 共有」「CI working-directory 単一」の点で sibling 案より優位 |
| server source | `prototype-redesign/server/src/` | client `src/` (`tsconfig.app.json:33` include `["src"]`) と物理分離、互いの include に入らない |
| server SQLite ファイル | env `DB_PATH` 駆動、**dev default = `prototype-redesign/server/data/dev.sqlite`** (gitignore 追加) | mock データ。再生成可能 (seed から regenerate)。hosted/stakeholder demo は `DB_PATH` を repo tree 外へ向ける。WORM/保持の本番主張はしない (`persist.ts:4-5` の disclaimer 哲学を継承)。startup test 完了基準 = 「DB file が gitignored かつ `git ls-files` に出ない」(commit-safety) であり、厳密な「物理的に repo tree 外」は要求しない |
| server schema 適用 (SD-3 canonical) | `schema_migrations(version, name, applied_at, checksum)` ledger を持つ **forward-only migration runner を boot 時に順序適用**。各 migration は rollback NOTE を持つ (auto-rollback ではない)。`db:reset-demo` が全 migration を再適用 | SD-3: schema_migrations は data-model table #20。boot-apply step で forward-only に適用。migration runner 不採用 **(旧 rejected alternative)** は撤回し採用へ。append-only audit の credibility は schema 版管理を持つ方が高い |

**なぜ sibling (`prototype-redesign-server/` や repo 直下 `server/`) を選ばないか**:
- 現 CI (`/.github/workflows/pages.yml`) の redesign step は `working-directory: prototype-redesign` 単位で install → build を回す (`pages.yml:46-57`)。子ディレクトリなら **client の単一 install で済むか、server だけ別 install するかを後で選べる** (可逆)。sibling にすると install step・cache key が独立に増える。
- `tsconfig.app.json:34` は既に `src/legacy` / `src/__tests__` を exclude する慣習を持つ。`server/` を client の include 外 (`include: ["src"]`、`tsconfig.app.json:33`) に置けば、client tsc は server を一切見ない (現 build 不変が保証)。
- ただし **依存の混在を避けるため、server 専用依存 (better-sqlite3 + HTTP framework + zod) は `prototype-redesign/server/package.json` (独立 manifest + 独立 lockfile) に置く** ことを強く推奨 (§7 OPEN-1)。これにより client bundle に server 依存が漏れず、native module が Vite/Vitest に混入しない。

> 注意 (LIVE 制約): client tsconfig は bundler mode + `verbatimModuleSyntax` + `allowImportingTsExtensions` (`tsconfig.app.json:11-13`)。server は Node 実行で tsx 経由のため **別 module 解決前提**。client tsconfig を server で extends しないこと (後述 §2)。

---

### 2. Server TS project (DECIDED — 新規 `tsconfig.server.json`、既存 node config は流用不可)

| 項目 | 決定 | 根拠 (file:line) |
|------|------|------|
| 新規 file | `prototype-redesign/server/tsconfig.server.json` | 下記理由で `tsconfig.node.json` 流用不可 |
| なぜ `tsconfig.node.json` を使わないか | 同 file は `include: ["vite.config.ts"]` のみ (`tsconfig.node.json:23`)、`noEmit: true` (line 15)、`allowImportingTsExtensions` (line 12)。Vite config 専用で server source を1行も含まない | `tsconfig.node.json:12,15,23` |
| module / moduleResolution | `module: nodenext` / `moduleResolution: nodenext` (client は `esnext`+`bundler`、`tsconfig.app.json:6,11`) | Node 実行は bundler mode 不可、`.ts` 拡張子 import 不可 |
| strict 系継承 | `strict` / `noUncheckedIndexedAccess` (`tsconfig.app.json:24-25`) / `noUnusedLocals` / `noUnusedParameters` / `noFallthroughCasesInSwitch` (`tsconfig.app.json:28-31`) を **同等に再宣言** | 規律を server にも適用 (SoD ロジックの型安全が credibility の核) |
| types | `["node"]` | server は DOM 不要 (client は `["vite/client"]` + DOM lib、`tsconfig.app.json:5,7`) |
| 型チェック手段 | `tsc -p server/tsconfig.server.json --noEmit` を `check:server` の1段に組み込む | client `check:types` (`package.json:14`) と対称 |
| 実行手段 | `tsx` (dev) — トランスパイル emit せず Node 直実行。本番 build は postv5 scope 外 (demo backend) | YAGNI: dist 化は demo に不要 |
| root tsconfig references | `tsconfig.json` (`tsconfig.json:3-6`) には **追加しない** | `tsc -b` (= `package.json:8` build) が server を巻き込むのを防ぐ。server は独立 `tsc -p` で個別検査 (test 用 `tsconfig.test.json:3-4` が「references に載せない」のと同じ設計) |

---

### 3. EXACT npm scripts (DECIDED — script 名と段構成は確定。OPEN-1 が決めるのは「配置先 manifest」のみ、本数・名前・順序は不変)

配置: server 依存を独立 manifest にする前提 (§7 OPEN-1 recommended) でも、開発者の入口は **client `package.json` の scripts** に集約する (single entry)。server 専用 manifest 側に置くのは **build/run tool が必要とする最小限の同名 script のみ** であり、root から `--prefix server` で委譲する。OPEN-1 の分離/同居は **どの manifest に物理配置するか** だけを決め、下表の script 名・定義・段構成・`check:all` 挿入位置は OPEN-1 の結論に依らず確定とする (= SCRIPTS deliverable は OPEN-1 未決でも falsifiable)。

| script (client package.json に追加) | 定義 | 役割 |
|------|------|------|
| `server:dev` | `tsx watch server/src/index.ts` | server をホットリロード起動 (port = §5c で **5180 に DECIDED**) |
| `server:migrate` | `tsx server/src/migrate.ts` | forward-only migration runner を CLI 単体実行 (boot-apply と同一 runner を再利用)。`schema_migrations(version, name, applied_at, checksum)` ledger に未適用 migration を順序適用 (§1 SD-3、checksum は migration file hash を apply 時計算して記録) |
| `db:reset-demo` | `tsx server/src/reset-demo.ts` | demo DB を破棄して再生成 = 全 migration 再適用 + seed 再投入 (`seed:validate` 前提)。**env-gated (`DEMO_RESET_ENABLED=true` 必須)、default disabled、HTTP 経由ではない** (§7 RESET deliverable)。`DB_PATH` の dev sqlite を destructive に再構築する開発専用 op |
| `server:test` | `vitest run -c server/vitest.server.config.ts` | server 専用 vitest config (node environment、jsdom 不要)。client `vitest.config.ts` (jsdom、`vitest.config.ts:10`) と分離。**最初の2 smoke = (a) better-sqlite3 native exec (§4)、(b) db:startup PRAGMA smoke (migration runner boot-apply 後に `PRAGMA foreign_keys` / `schema_migrations` 行存在を確認)** |
| `server:audit` | `npm audit --audit-level=high --prefix server` (server manifest 上) | #9-8 の npm-audit gate。high 以上で非0 exit = blocking。**`--omit=dev` は付けない** (理由は §6 横断ポリシー) |
| `dev:full` | `concurrently -k "npm run dev" "npm run server:dev"` (concurrently は devDep) | client (Vite 5174) + server (tsx watch 5180) を1コマンドで並走起動 (prompt #7 で列挙)。`-k` で片方 exit 時に他方も kill。**追加 dep = concurrently 1点のみ** (`&` shell 並走の OS 差を避ける、単一 entry の開発 UX) |
| `preview` | `vite preview --port 4174 --strictPort` | build 済 client を 4174 で配信 (Playwright/axe E2E の serving target、client dev 5174 と非衝突) |
| `e2e` | `playwright test` (devDep) | Playwright E2E。`check:all` には混ぜない (flaky 回避、§3 完了基準) |
| `check:server` | `tsc -p server/tsconfig.server.json --noEmit && npm run server:test && npm run server:audit` | server gate。client `check:types`+`test` (`package.json:14,11`) と対称、+ 依存監査。下記「段の正確な順序」を参照 |

> **scripts 一覧の prompt #7 整合**: prompt #7 が列挙する `server:dev` / `server:test` / `check:server` / `server:migrate` / `db:reset-demo` / `dev:full` を全て上表に含める (取りこぼし防止)。`server:migrate` / `db:reset-demo` は §7 SCHEMA-LIFECYCLE / RESET deliverable と同一 runner / 同一 env-gate を共有し、別実装を作らない。`dev:full` は OPEN-2 の旧 "追加 script を作らない" 方針を撤回して **採用** する (下記 OPEN-2 参照)。

**`check:server` の段の正確な順序 (曖昧さ排除)**:
1. `tsc -p server/tsconfig.server.json --noEmit` — 型 gate
2. `npm run server:test` — vitest。**この vitest suite の最初の2 smoke が (a) better-sqlite3 native smoke** (`new Database(':memory:').exec('create table t(x)')` が throw しない、§4 NATIVE-VERIFY) **と (b) db:startup PRAGMA smoke** (forward-only migration runner を boot-apply し `PRAGMA foreign_keys=ON` + `schema_migrations` に行が入ることを確認) を兼ねる。いずれも別 script ではなく server:test 内の smoke test として存在する (名前衝突を避けるため `server:audit` とは別物)。
3. `npm run server:audit` — npm audit (supply-chain gate)。`server:test` の native smoke とは別命令であり混同しない。

**`check:all` の吸収方法** (現定義: `package.json:17` = `lint && check:no-op && check:types && check:types:test && check:design && test && build`):

```
"check:all": "npm run lint && npm run check:no-op && npm run check:types && npm run check:types:test && npm run check:design && npm run check:server && npm run test && npm run build"
```

挿入位置 = `check:design` の後・`test` の前 (client 静的検査群の末尾、client unit test の前)。理由: server gate は client build と独立に失敗を早期表面化させたいが、client の重い `build` (`tsc -b && vite build`) より前に置き fail-fast。

> **blocking 完了基準 (falsifiable)**: `npm run check:all` を **(a) server プロセス未起動 (5180 で listen しているものが無い) かつ (b) identity 用 env var を一切 export していない fresh checkout** で実行して exit 0。すなわち `check:server` は live server を立てず tsc + in-process vitest + audit のみで完走し、port binding にも env var にも依存しない (E2E 起動 test は check:all に混ぜない = flaky 回避、`MEMORY: Silent lint bypass` の実走 verify 原則は満たす)。identity env var の扱いは §5c を参照。

---

### 4. Node version + better-sqlite3 native install verification (DECIDED)

| 項目 | 決定 | 根拠 (file:line / 実測) |
|------|------|------|
| Node ピン | `engines.node: ">=22"` を **両 manifest に追加** (上限ピン無し) + `.nvmrc` = `24` 新規追加 | 現 `package.json` に `engines` 無し (実測)。CI は Node 24 (`pages.yml:36`)。ローカルは **25.2.1 (実測)**。`>=22` は CI 24 / ローカル 25.2.1 の双方を許容し、`.nvmrc`=24 が CI/再現環境を 24 に揃える。**上限を 25 未満にしない** — local dev (25.2.1) を `engines-strict` で EBADENGINE にしてしまうため (内部矛盾になる) |
| なぜ上限ピン無し | better-sqlite3 は ABI 追従だが、上限を切ると live dev (25.2.1) が即 fail する。再現性は `.nvmrc`=24 (= CI と同一) で吸収し、`engines` は下限のみで「古すぎる Node を弾く」役割に限定 | `pages.yml:36` node-version: 24 / 実測 local 25.2.1 |
| native build 検証手順 | server manifest で install 後、`new Database(':memory:').exec('create table t(x)')` が throw せず exit 0 | better-sqlite3 は prebuild-install で OS/ABI 一致時 prebuilt を取得、無ければ node-gyp で C++ コンパイル (Python + C toolchain 必要)。**検証は `server:test` の最初の smoke test として実装** (§3、別 script を作らない) |
| native 検証の場所 | **ローカル `check:all` で必須 (blocking)。CI は OPEN-3 で defer (CI に server を載せる場合のみ CI でも実行)** | §4 の CI cross-platform リスクが flagged のため、native smoke の MUST-pass 面は当面ローカルに限定 (CI は OPEN-3 解決後に追加)。曖昧さ排除: 「in-memory exec exit 0」は **ローカル check:all で必須・CI では OPEN-3 まで非必須** |
| CI 既知リスク | 現 CI redesign step は `npm install --no-audit --no-fund` を使う (`pages.yml:51`、macOS 生成 lockfile の linux optional dep [@emnapi] 取りこぼしで `npm ci` が EUSAGE fail する既知問題 `pages.yml:48-50`)。better-sqlite3 を入れると **同じ cross-platform 問題が native binary でも起き得る** | `pages.yml:48-51` |
| CI 方針 | postv5 で server を CI に載せる場合、server install も `npm install` (not `npm ci`)、もしくは server を CI から除外し **client deploy (Pages) は server に依存しないまま** にする | OPEN-3 (§7) |

> 右サイズ判定: better-sqlite3 を選ぶ理由 = 同期 API で「1 transaction = 1 SoD enforcement」が test で読みやすく、外部 DB プロセス不要 (demo infra ゼロ)。`@libsql`/postgres は外部接続 or daemon を呼び込むため production hardening 寄り → 却下。

---

### 5. 採用 stack 提案 + ネットワーク + identity 配線

#### 5a. HTTP framework: **Express vs Fastify** (applied default = Express 5、user override 可)

| 軸 | Express 5 | Fastify 5 | 判定 |
|----|-----------|-----------|------|
| 最小性 (依存数) | core 1 dep、超薄 | 本体 + schema engine 同梱 | Express 僅差 |
| 入力 validation | route handler で zod schema (`.strict()`) を呼ぶ (§6、SD-5) | 内蔵 JSON schema | 引き分け (本 contract は zod で統一) |
| demo の「規制 reviewer が読んで coherent」 | route handler が素直、SoD 拒否を `{ ok:false, denialReason }` で直書き、test が読みやすい | hook/lifecycle 概念が1段増える | Express が読みやすい |
| TS 型統合 | 素朴 (zod infer で型付け) | 型推論強いが学習面 | demo 規模では差小 |

**Applied default = Express 5 (user override 可)**。rationale: 本 contract のゴールは「SoD 拒否を server test で falsify する最小実装」。Express の handler は abstraction が最も浅く、`isSelfApproval` 相当の拒否ロジック (LIVE `reducer.ts` の SoD 権威) を1 route = 1 拒否条件で写経でき、reviewer/test 双方が直読できる。Fastify の性能・schema 機能は demo backend に不要 (production hardening 寄り)。**reversibility = 高** (route 数が少ない P0 段階での framework 差し替えは数 PR、route handler 署名のみ変更)。全 endpoint は `/api/` prefix を持つ (e.g. `POST /api/cases/:id/approve`、`GET /api/audit-events`、`POST /api/session/operator`)。

#### 5b. API style: **REST vs tRPC** (OPEN)

| 軸 | REST (Express route + JSON) | tRPC | 判定 |
|----|------|------|------|
| 追加 dep | zod のみ (framework + validation) | @trpc/server + @trpc/client + (client 統合) | REST が最小 |
| client 結線 | `@tanstack/react-query` で `/api/*` を fetch/cache、既存 store action を server 呼び出しに置換 | 型共有が強力だが client/server を1 monorepo 型境界に縛る | REST が疎結合 |
| falsifiability | `curl -X POST .../api/cases/:id/approve` で SoD 拒否 (`{ ok:false, denialReason }`) を CLI から再現可 (test に書きやすい) | RPC は tooling 前提 | REST が demo 向き |
| 型安全 | request body を zod `.strict()` schema で検証 (§6、SD-5) | コンパイル時型共有 | tRPC 優位だが過剰 |

**Applied default = REST (Express + JSON + zod `.strict()` validation)**。rationale: tRPC の主価値 = client/server 間の compile-time 型共有だが、これは「client を server に型結合する」= 現 client (静的 SPA、store=reducer) の独立性を犠牲にする。postv5 は client 全面書き換えではなく **SoD/execute/audit の endpoint を `/api/` 配下に足して実証する** のがゴールゆえ、REST + zod validation で十分かつ最小。`curl`/server-test で拒否を直接 falsify できる点が control credibility の核。denial response は `{ ok:false, denialReason:<ENUM> }` (SD-4、test は bare HTTP code でなく denialReason を assert)。**reversibility = 中** (REST→tRPC は endpoint 数が少ないうちなら可、ただし client 結線方式を変えるため中)。

#### 5c. ネットワーク / port / identity env var (DECIDED — packaging contract が所有する layout 決定)

| 項目 | 決定 | 根拠 / 衝突回避基準 |
|------|------|------|
| server listen port | **5180 (DECIDED)** | 客側 Vite dev は `port: 5174, strictPort: true` (`vite.config.ts:16-17`) で 5174 を hard-pin。5180 は 5174 と非衝突 (no-collision criterion: `server:dev` 起動時 5180 が他プロセスで使用中なら即 fail / 既存 client port 5174 とは別値)。port は env `SERVER_PORT` で上書き可、default 5180 |
| DB file path env | env var 名 = **`DB_PATH`** (dev default = `prototype-redesign/server/data/dev.sqlite`、gitignored)。hosted/stakeholder demo は repo tree 外を指す | startup test = 「DB file が gitignored かつ `git ls-files` 不在」(commit-safety)。read 箇所 = server boot の DB open |
| identity 用 secret env var (SD-1 canonical) | env var 名 = **`BOAI_SESSION_SECRET`** (HMAC-SHA256 署名鍵、SINGLE name everywhere)。`BOAI_ACTOR_SECRET` / `DEMO_ACTOR_SECRET` / `BO_DEMO_SIGNING_SECRET` は **(rejected alternatives)** で全廃。read 箇所 = server boot 時の identity middleware (機構本体は #1〜#6 の SoD contract 側) | secret = ONE env var (§Right-sizing)。本 contract は「名前・read 箇所・gate の前提」を所有し、署名検証ロジックは #1〜#6 |
| identity header / token (SD-1 canonical) | header = **`X-Operator-Token`** (HMAC-signed)。payload = `operator_id.issued_at.expires_at.jti`、HMAC-SHA256、expiry 30 min、replay reject = in-memory `Set<jti>` (DB table ではない)。dual-identity = `session_operator_id` (verified token から) ≠ `effective_actor_id` (request body `{ actorId }` を `allowed_actors` で server validate)。`allowed_actors` = 全 seeded `actors` 行 = **5 actor (3 operational [actor-inputter/checker/approver] + ≥2 governance [actor-gov-legal/compliance、role='governance'])**。actorId が allowed_actors 不在なら reject (UNKNOWN_ACTOR)。governance actorId も layer 1 (persona validation) を pass し、layer 2 (authorization = governance は全 mutation reject、read-only) に到達する (governance-boundary test の到達性を確保)。**UI persona switcher は 3 operational actor のまま** (governance は P3 governance view 経由で operational switcher では切替えない、live `DEMO_ACTORS` const 不変)。body actorId は **effective_actor_id のみ** を設定し session_operator_id は決して上書きしない | 旧 `X-Actor-Id` plain header は **(rejected alternative)**。operator login = `POST /api/session/operator` (op-demo-1 / op-demo-2 は CODE CONSTANT、DB table ではない)。persona switch 用の `POST /session/switch` / `POST /session/actor` server endpoint は **(rejected alternative)** で不採用 (persona = client state + per-write body validate) |
| identity env の gate 前提 (blocking) | `check:server` (= `check:all` の一段) は **`BOAI_SESSION_SECRET` 未設定でも exit 0** で完走すること。server:test は (a) secret 未設定時の degrade 動作 (例: 全 request を未認証扱いで拒否) と (b) secret 設定時の正常署名検証 を両方 in-process で検証し、env 設定を test 前提にしない | fresh checkout で `npm run check:all` が壊れない (§3 完了基準)。falsifiable: env を export せず check:all → exit 0 |

---

### 6. Dependency vetting テーブル (#9-8 — 全必須列を充足)

scope: SoD/execute/audit を server で実証するための最小依存のみ。「不要な dep を足さない」を default。**server runtime dep = 3 (better-sqlite3 + HTTP framework + zod) を上限の目安とする** (SD-5 で 2→3 に引き上げ。旧上限 2 は **rejected alternative**)。client runtime dep に `@tanstack/react-query` を1つ追加 (prompt arch note: client は API + cache)。

| package | version (非確定 placeholder) | reason | license | native build | npm audit 結果 (取得手順) | lockfile policy |
|---------|---------|--------|---------|--------------|---------------------------|-----------------|
| `better-sqlite3` | `^11` (install 時に解決し本表へ記録) | 同期 SQLite。append-only audit table + case state を1 transaction で enforce、外部 DB プロセス不要 | MIT | **あり** (prebuilt 優先、fallback で node-gyp。§4 検証必須) | `npm audit --prefix server --audit-level=high` を `server:audit` で実行、high 以上 = block | server lockfile に pin、commit 必須 |
| `express` | `^5` (5b で REST 採用時、install 時に解決し本表へ記録) | 最小 HTTP framework、SoD 拒否を素直に表現 (§5a default) | MIT | なし | 同上 gate | 同上 |
| `tsx` | `^4` (devDep、install 時に解決) | server を emit なしで Node 実行 (`server:dev`) | MIT | なし | 同上 gate | 同上 |
| `@types/better-sqlite3` | 対応版 (devDep) | better-sqlite3 の型 (TS strict 維持) | MIT | なし | 同上 gate | 同上 |
| `@types/express` | 対応版 (devDep、Express 採用時) | Express の型 | MIT | なし | 同上 gate | 同上 |
| `zod` | `^3` (install 時に解決し本表へ記録) | **ADOPT (SD-5)**: 全 endpoint 境界を zod schema + `.strict()` で validate。unknown-field reject = mass-assignment defense (#4 UNKNOWN_FIELD invariant を満たす)。`{ actorId }` body validation の SSOT | MIT | なし | `npm audit --prefix server --audit-level=high` を `server:audit` で実行、high 以上 = block | server lockfile に pin、commit 必須 |
| `@tanstack/react-query` | `^5` (client runtime dep、install 時に解決) | **ADOPT**: client cache 層 (prompt arch note「client は API + cache (TanStack Query 等)」)。server-backed API への fetch/cache を担う | MIT | なし | client `npm audit` gate | client lockfile に pin |
| `msw` | 対応版 (devDep、install 時に解決) | **ADOPT**: component/client test で server API を mock (現 client test glob `vitest.config.ts:13`)。MSW handler で fetch を intercept | MIT | なし | client `npm audit` gate | client lockfile に pin |
| `@playwright/test` | 対応版 (devDep) | **ADOPT**: E2E (preview --port 4174 を serving target)。`e2e` script から起動、`check:all` には混ぜない | Apache-2.0 | binary download | client `npm audit` gate | client lockfile に pin |
| `@axe-core/playwright` | 対応版 (devDep) | **ADOPT**: Playwright E2E 内 axe accessibility scan (全 route axe 0 violation 維持) | MPL-2.0 | なし | client `npm audit` gate | client lockfile に pin |
| `concurrently` | 対応版 (devDep、install 時に解決) | **ADOPT**: `dev:full` で client (`dev`) + server (`server:dev`) を1コマンド並走起動 (`-k` で連動 kill)。prompt #7 列挙 script の実装手段 | MIT | なし | client `npm audit` gate | client lockfile に pin |

**横断ポリシー (#9-8)**:
- **version は非確定 placeholder**: 上表の `^11`/`^5`/`^4` は net-new dep の提案値であり non-authoritative。**install 時に lockfile を生成し、解決された実バージョンを本表へ書き戻すまで未確定** (DEP-VETTING blocking 完了基準に含む)。
- **lockfile commit + CI 再現性**: server manifest の `package-lock.json` を git track (client の `package-lock.json` は既に commit 済、`pages.yml:39` が cache-dependency-path に指定)。CI は §4 の cross-platform 制約により redesign step が `npm install` 継続 (`pages.yml:51`)。**再現性は lockfile pin + `.nvmrc`/`engines` で担保**、`npm ci` 強制はしない (LIVE 制約)。
- **npm-audit gate**: `server:audit` を `check:server` 内に置き (`§3`)、`--audit-level=high` 非0 で blocking。**`--omit=dev` は付けない**。理由: 上表の devDep (tsx / @types/* / msw / playwright) を `--omit=dev` で除くと、audit が dep table の真部分集合しか見ず gate の意味が痩せる。runtime + dev を含む全 server dep を gate 対象とし、supply-chain の falsifiability を保つ。
- **add no unneeded deps**: zod / @tanstack/react-query / msw / playwright / axe-core は SD-5 + prompt arch note + a11y gate により **ADOPT 済**。concurrently は `dev:full` (prompt #7 列挙 script) の並走実装として **ADOPT 済** (client devDep、server runtime dep には数えない)。ORM 等それ以外は default 却下。新規 dep 追加は本 contract table 更新 + reason/license/audit 記入を blocking 前提とする。
- **license**: server runtime (better-sqlite3 / HTTP framework / zod) は全 MIT。devDep に Apache-2.0 (Playwright) / MPL-2.0 (axe-core) を含むが permissive で closed pitch と両立。GPL/AGPL/strong-copyleft の混入は DEFECT (本 demo は将来 closed pitch 想定、`CLAUDE.md` cowork-workshop Session 4)。

---

### 7. 各 deliverable の table 名 / 必須列 / blocking 完了基準 / approval owner

| deliverable | table 名 | 必須列 | blocking 完了基準 | approval owner |
|------|------|------|------|------|
| ディレクトリ構成 | DIR-LAYOUT | path / role / tsconfig include / gitignore | `server/` が client `tsc -b` (`package.json:8`) の include 外であること (build 不変を `npm run check:all` で確認) + `server/data/*.sqlite` が `.gitignore` 追加済 + (OPEN-1 で分離採用時) `server/node_modules` の ignore 追加済 | user (構成 fork は可逆だが entry 設計に影響) |
| Server TS project | TS-PROJECT | config file / module / strict flags / 実行手段 / check 手段 | `tsc -p server/tsconfig.server.json --noEmit` が 0 error、かつ root `tsc -b` が server を巻き込まない (現 client error 0 維持) | AI (右サイズ default、§2 で決定済) |
| npm scripts | SCRIPTS | script 名 / 定義 / 役割 | `check:all` に `check:server` が挿入され、`npm run check:all` が client 7 gate + server gate を全 pass。挿入で既存 7 gate の挙動不変 (LIVE `package.json:17` 比較)。**§5c の env-var 未設定 fresh checkout でも exit 0**。script 名・定義・段順序は OPEN-1 結論に依らず本 §3 の通り固定 | user (`check:all` は SSOT gate ゆえ可視承認) |
| ネットワーク/identity | NET-IDENTITY | port 値 / 衝突回避基準 / env var 名 / header / read 箇所 / env 無し gate | server port = 5180 (5174 と非衝突)、secret = `BOAI_SESSION_SECRET`、header = `X-Operator-Token` (HMAC-SHA256)、`DB_PATH` env、operator login = `POST /api/session/operator`、`BOAI_SESSION_SECRET` 未設定で `check:server` exit 0 | user (port は layout 決定) + AI (env wiring) |
| Lint coverage (server) | LINT-SERVER | 対象 path / config / check 段 | client `lint` = `eslint .` (`package.json:9`) は tree 全体を glob する。**`server/src/` を lint 対象に含めるか、含めない場合は明示 ignore する**かを決定し、含める場合は server 用 eslint flat-config を追加して SoD ロジックが lint される | AI (規律 default) |
| Node/native 検証 | NATIVE-VERIFY | 項目 / 決定 / 検証コマンド / 検証場所 | server install 後 better-sqlite3 in-memory exec が exit 0 (server:test 最初の smoke、**ローカル check:all で必須・CI は OPEN-3 まで非必須**) + `.nvmrc`=24 / `engines.node:">=22"` が両 manifest に存在 | AI (検証 default) + user (Node ピン値) |
| Stack 採用 | STACK-DECISION | 軸 / Express側 / Fastify側 (REST/tRPC) | OPEN-1a/1b を user が確定 (default = Express+REST)。確定後 §6 table の該当行を pin | **user (irreversible 寄り fork)** |
| 依存承認 | DEP-VETTING | package / version / reason / license / native build / npm audit 結果 / lockfile policy | 全採用 dep が7列充足 + `server:audit` high 0 + 表の version が install 後の実解決値に書き戻し済 + zod (server runtime #3) / @tanstack/react-query (client runtime) / msw + playwright + axe-core (devDep) が ADOPT 行として記入済 | user (依存追加は SSOT・supply chain 判断) |
| DB schema lifecycle | SCHEMA-LIFECYCLE | migration runner / schema_migrations 列 / boot-apply / reset | `schema_migrations(version, name, applied_at, checksum)` が data-model table #20 として存在、forward-only に boot 適用、各 migration が rollback NOTE 保持、`db:reset-demo` が全 migration 再適用 (SD-3) | user (schema は SSOT) |
| Reset | RESET | CLI / gate | **P0 = CLI `db:reset-demo` のみ** (env-gated、default disabled、no HTTP)。HTTP `POST /api/admin/reset` は **OUT-OF-P0** (追加するなら admin/system role、governance は READ-ONLY ゆえ destructive write を authorize 不可、+ `audit_events.entity_type` 拡張が必要 = P0 scope 外)。`/session/reset` は **(rejected alternative)** で不採用 | user (destructive op) |

> **記述 drift の同期 (blocking)**: `prototype-redesign/CLAUDE.md` / root `CLAUDE.md` の「mock + in-memory only / 外部接続なし」は、SoD/execute/audit enforcement に限り server-backed である旨へ更新が必要 (mock 哲学 [real customer data / real AI / real external なし] は保持)。本 contract 完了の一部として同期する。

---

### Open decisions

- **OPEN-1 (server manifest 分離)**: server 依存を `prototype-redesign/server/package.json` (独立 lockfile) に分けるか、client manifest に同居させるか。**Recommended = 分離**。rationale: native module (better-sqlite3) が client Vite/Vitest に混入せず、client bundle に server dep が漏れない。reversibility = 中。**注**: 本決定が左右するのは dep の物理配置と `server/node_modules` 有無のみ。§3 の script 名・定義・段順序・`check:all` 挿入位置は本決定に依らず固定 (= SCRIPTS は OPEN-1 未決でも falsifiable)。分離採用時は `server/node_modules` を `.gitignore` に追加 (root `.gitignore:1` の `node_modules/` は root のみ ignore、nested は別パターン要)。
- **OPEN-2 (dev:full の並走手段) — RESOLVED: ADOPT**: client+server 同時起動を補助 script で提供する。**`dev:full` を採用** (§3 table)。prompt #7 が `server:dev` / `server:test` / `check:server` と並べて `dev:full` を列挙しているため、旧版の「追加 script を作らない」方針は撤回する。定義 = `concurrently -k "npm run dev" "npm run server:dev"` (concurrently を devDep に1点追加)。`-k` で片方 exit 時に他方も停止。「別 terminal で各々起動 / shell `&` で済ます」は **rejected alternative** (OS 差 + 単一 entry の開発 UX で劣る)。reversibility = 高 (script 1行 + devDep 1点)。
- **OPEN-3 (CI に server を載せるか)**: postv5 で server を Pages CI (`/.github/workflows/pages.yml`) に追加するか。**Recommended = 当面 載せない (server test はローカル `check:all` gate のみ)**。rationale: 現 Pages deploy は static SPA で server に依存しない。server を CI に足すと cross-platform native build (§4) の flaky リスクが deploy を巻き込む。control の falsifiability は **ローカル/PR の `check:server` gate** で担保すれば足りる。reversibility = 高 (後で job 追加可)。NATIVE-VERIFY の CI 必須化は本決定が close するまで非必須 (§4)。
- **OPEN-1a (HTTP framework)**: Express vs Fastify。**Recommended = Express 5**。reversibility = 高。
- **OPEN-1b (API style)**: REST vs tRPC。**Applied default = REST + zod `.strict()` validation** (`/api/` prefix、`{ ok:false, denialReason }` denial)。reversibility = 中 (client 結線方式に波及)。
- **OPEN-4 (client cache) — RESOLVED: ADOPT**: @tanstack/react-query を client runtime dep として採用 (prompt arch note「client は API + cache (TanStack Query 等)」)。「入れない」は **rejected alternative**。§6 table に行追加済。
- **OPEN-5 (MSW) — RESOLVED: ADOPT**: msw を devDep として採用 (component/client test の server API mock)。「#5 従属で入れない」は **rejected alternative**。§6 table に行追加済。Playwright + axe-core も E2E/a11y gate 用 devDep として ADOPT (preview --port 4174 を serving target)。
- **OPEN-6 (zod) — RESOLVED: ADOPT (SD-5)**: server 境界 validation に zod を採用。全 endpoint を zod `.strict()` schema で validate (unknown-field reject = mass-assignment defense、#4 UNKNOWN_FIELD invariant 充足)。server runtime dep 上限を 2→3 に引き上げ。「入れない (手書き guard)」は **rejected alternative**。§6 table の zod 行を有効化済。

---

### Right-sizing notes

- **production hardening を意図的に除外** (DEFECT 化を防ぐ): auth framework / IdP / OAuth / JWT issuer / RBAC engine / monitoring stack / 本番 DB daemon / Docker / dist 化された server build / **packageManager (Corepack) pin**。いずれも「control を DEMONSTRATE する」に不要。**注**: schema_migrations migration runner (SD-3) と zod validation (SD-5) は **採用済** (旧版で除外していたのは rejected alternative)。auto-rollback は不採用 (各 migration は rollback NOTE のみ、forward-only)。
- **demo identity は signed token (`X-Operator-Token`, HMAC-SHA256, 30min, in-memory `Set<jti>` replay reject) + 1 secret env var で十分** (本 contract は packaging のみ扱い、identity 機構自体は #1〜#6 の SoD contract 側)。env var 名・read 箇所・「未設定でも check:server exit 0」は §5c で本 contract が所有。secret = `BOAI_SESSION_SECRET` の ONE env var。dual-identity (`session_operator_id` ≠ `effective_actor_id`) を保持し、body actorId は effective_actor_id のみ設定。
- **依存最小化**: 採用 server runtime dep = better-sqlite3 / HTTP framework (Express) / zod の **3 個** (SD-5 で 2→3)、server devDep = tsx + 型2点。client runtime に @tanstack/react-query を1つ追加、client devDep に msw + playwright + axe-core + concurrently (`dev:full` 並走用)。ORM を default 却下。schema は `schema_migrations` ledger を持つ forward-only migration runner で boot 適用 (`db:reset-demo` で全再適用、`server:migrate` で CLI 単体適用)。
- **reproducibility は最小手段で**: `.nvmrc`=24 + `engines.node:">=22"` (下限のみ、上限ピン無しで local 25.2.1 を弾かない)。packageManager pin は採らない (npm 10/12 contributor を壊し、control 実証に無関係)。
- **既存規律の保存**: client の build (`tsc -b && vite build`)・型 gate・31 test file (glob `vitest.config.ts:13`)・lucide/token/JP-only 規律は不変。server は include 外に隔離。
- **LIVE 制約の尊重**: CI redesign step は `npm ci` ではなく `npm install --no-audit --no-fund` (cross-platform lockfile issue `pages.yml:48-51`)。prototype v1 step は別 working-directory で `npm ci` を使う (`pages.yml:64-66`) が、これは別 install 単位の方針であり server には redesign step と同じ `npm install` 方針を継承する (`npm ci` 強制という production-CI 流儀を持ち込まない)。
- **STOP signal (over-engineering)**: server に framework が2つ以上・抽象層 (service/repository/DI container) の増殖・auto-rollback migration・CI への native build 常設・server runtime dep が 3 を超える、が出たら本 contract の右サイズ逸脱として re-scope する。
