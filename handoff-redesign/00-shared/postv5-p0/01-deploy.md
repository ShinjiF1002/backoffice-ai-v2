## P0 #1 — Deploy decision + exposure baseline (#9-7)

**目的**: postv5 で server 常駐が必須化 (静的 Pages 単体では動かない、selector-prompt §1.5) するのに先立ち、deploy 方式を 1 案に確定し、その案の下で「実顧客データ・実 AI・実外部接続なし (mock)」を維持する最小の exposure baseline (#9-7) を contract 化する。この section が green でない限り server 実装 (P1a) に入らない。

> **本 contract の SSOT 位置づけ**: deploy 方式 (1 択) と exposure baseline 列の SSOT は本 file。確定後の SSOT 整合 (pages.yml / README / CLAUDE.md ×2 への反映) は P0 承認後・P1a 前の「SSOT 更新 gate」で実施し、本 file の確定値を移送する (selector-prompt §1b)。

---

### live baseline (確定の出発点、main @ `1e45ea7` = postv4)

| 項目 | live 実態 | 出典 (file:line) |
|------|----------|------------------|
| ホスティング | GitHub Pages のみ。server 不在。static SPA。 | `.github/workflows/pages.yml:1`, `deploy:91-102` |
| deploy 単位 | redesign を root path、prototype **v1 を `/v1/` subpath** に combine して 1 site 配信 | `pages.yml:79-84` (Assemble combined site = `_site/` + `_site/v1/`)。upload は別 step `pages.yml:86-89`。 |
| base path | redesign=`/backoffice-ai-v2/`、v1=`/backoffice-ai-v2/v1/` | `pages.yml:56,71`; `vite.config.ts:8` (`base: VITE_BASE_PATH ?? '/'`) |
| SPA fallback | `cp dist/index.html dist/404.html` (両 build) | `pages.yml:59-61,74-76` |
| install 方式 | redesign は **`npm install`** (cross-platform lockfile の optional dep 取りこぼしで `npm ci` が EUSAGE fail するため)。v1 は `npm ci`。 | `pages.yml:46-51,64-66` |
| trigger | `push` to `main` (paths: `prototype-redesign/**` / `prototype/**` / `pages.yml`) + `workflow_dispatch` | `pages.yml:3-11` |
| Node | 24 (CI) | `pages.yml:36` |
| state / 永続化 | React reducer + localStorage (`STORAGE_KEY='bo-ai-v2:store'`, `SCHEMA_VERSION=8`)。**secret なし・mock data のみ**。version 不一致は seed fallback。 | `prototype-redesign/src/store/persist.ts:12,25,89-100` |
| secret 管理 | `.env` / `.env.*` は repo-root `.gitignore` で除外済 (現状 server 不在ゆえ未使用) | repo-root `.gitignore:5-6` |
| dist 除外 | repo-root + client 両 `.gitignore` で `dist/` 除外済 | repo-root `.gitignore:2`; `prototype-redesign/.gitignore:11` |

> **drift note**: ルート `CLAUDE.md` / `prototype-redesign/CLAUDE.md` は現在「mock + in-memory only / 外部接続なし」と記述。これは postv5 で「app 状態永続化 + 実 API + server-authoritative 統制実証」へ変わる (selector-prompt §1.3) ため SSOT 更新 gate で改訂する。**ただし「実顧客データ・実 AI・実外部接続なし (mock)」の核は不変** — 本 contract の exposure baseline #9-7 もこの不変条件を守る privacy safeguard として設計する。

---

### Contract A — Deploy decision (P0 #1)

**deliverable**: 下表で 3 案を比較し **1 案を確定**。確定案について CI/build/deploy 手順 + stakeholder 閲覧手段が書けることが blocking 完了基準。

| table 名 | 内容 |
|----------|------|
| **deploy-option-comparison** | 3 案 (①②③) × 評価軸の比較表 → 1 案確定 |
| **chosen-deploy-runbook** | 確定案の CI / build / deploy / stakeholder 閲覧手順 |
| **pages-yml-disposition** | 現 `pages.yml` を「どう archive/置換するか」の確定処理 |

#### A-1. deploy-option-comparison (必須列: option / 仕組み / server 常駐 / stakeholder 閲覧 / CI 変更 / 旧 v1 Pages / right-sizing 適合 / 採否 / approval owner)

| option | 仕組み | server 常駐 | stakeholder 閲覧 | CI 変更 | 旧 v1 Pages | right-sizing 適合 | 採否 | approval owner |
|--------|--------|-------------|------------------|---------|-------------|-------------------|------|----------------|
| **① Pages 維持 + static mock API fallback** | SQLite/API を入れず Pages に MSW 等の static fallback を載せる | なし | 現 Pages URL | 小 | 維持 | server-authoritative SoD/execute を **実証できない** (client が untrusted のまま) → postv5 中核価値 (#9 統制実証) と矛盾 | **却下** (架構決定 §「SQLite/server は統制実証のために導入」と非両立、selector-prompt §3) | user (deploy 方向 = judgement gate) |
| **② Node host 移行 (推奨 default)** | dev=localhost (`dev:full`)、stakeholder demo=単一 Node host (簡易 PaaS or 一時 URL) | あり (単一 Node process) | hosted URL **または** localhost smoke | 中 (Pages workflow を archive/置換) | **archive** | 単一 process + 1 host で server-authoritative 統制を最小実証。infra 最小。 | **採用 (default)** | user (deploy 方向 = judgement gate) |
| **③ Pages を v1 archive + postv5 は hosted server URL** | Pages を「過去 demo の凍結 archive (v1 のみ)」化し、postv5 本体は別 hosted URL | あり | hosted URL (Pages は v1 archive 閲覧のみ) | 中〜大 (Pages を v1-only に縮小 + 別 host) | **archive 兼 配信** | ② と実質同等だが Pages 二重運用 (v1 配信 + 別 host) が残り運用面が増える | 条件付き候補 (v1 を残す要件が立った時のみ) | user (deploy 方向 = judgement gate) |

> **②③ の差は「旧 Pages を完全停止するか / v1 archive 配信として残すか」のみ**。本体 (postv5 server) を hosted URL で見せる点は共通。**推奨 = ②**: postv5 本体を Pages から外し、Pages workflow は archive。stakeholder には hosted URL か localhost smoke で見せる (selector-prompt §1 推奨 default に一致)。

#### A-2. chosen-deploy-runbook (② 採用時、必須列: 環境 / 起動コマンド / build / deploy / 閲覧手段 / 前提 / approval owner)

| 環境 | 起動コマンド | build | deploy | 閲覧手段 | 前提 | approval owner |
|------|--------------|-------|--------|---------|------|----------------|
| **dev (local)** | `npm run dev:full` (client `vite` + server concurrently、script は P0 #7 で確定) | 不要 (HMR) | 不要 | `localhost:5174` (client) + server port (P0 #7) | Node 24 + better-sqlite3 native build OK (P0 #7) | AI 実装 |
| **stakeholder demo** | 単一 Node process が built client (静的 asset) を同一 origin で配信 + API | `npm run build` (client) → server が `dist/` を静的配信 | 簡易 PaaS の単一 service **または** 一時 URL (tunnel) を一時起動。常設インフラ化しない。 | hosted URL **または** localhost 共有 smoke (最低 3 route × 3 role、selector-prompt §Demo) | DB file は host 上 `DB_PATH` (repo tree 外)、secret は host の env `BOAI_SESSION_SECRET` 1 個 (#9-7) | user (常設 hosted を立てるかは judgement gate) |
| **CI** | `npm run check:all` (client) + `check:server` (server types + unit/API test、P0 #7) | client build は check:all 内 | **deploy は CI 化しない** (推奨)。`pages.yml` の archive 機構 = **A-3 で確定** (redesign job の停止方式は A-3 の「postv5 処理」列に従う)。hosted は手動 or PaaS 既定の deploy。 | — | CI は build/test gate のみ。deploy 自動化は production hardening ゆえ右サイズ上 **除外**。archive の mechanical 定義は A-3 に SSOT、本行は重複定義しない。 | AI 実装 |

> **同一 origin 配信を推奨する根拠**: client と API を同一 origin にすると CORS allowlist が不要 (#9-7) になり、exposure surface が縮む。別 origin 配信を選ぶ場合のみ CORS allowlist を明示する (下記 #9-7)。

#### A-3. pages-yml-disposition (確定処理、必須列: 対象 / 現挙動 / postv5 処理 (archive 機構の mechanical 定義) / 完了基準 / approval owner)

> **「archive」の mechanical 定義 (SSOT、A-2 CI 行が参照)**: D-2 で v1 を残さない場合 = **workflow file を削除** (`.github/workflows/pages.yml` を `git rm`)。D-2 で v1 を残す場合 = **redesign 関連 step (`pages.yml:45-61` の install/build/SPA fallback + `82` の redesign cp + `7-8` の `prototype-redesign/**` trigger path) を削除し v1 job のみ残す**。「無効化」「凍結」等の曖昧語は使わず、上記いずれかを D-2 確定時に選択する。

| 対象 | 現挙動 (live) | postv5 処理 (② 採用、archive 機構) | 完了基準 | approval owner |
|------|---------------|----------------------|----------|----------------|
| `.github/workflows/pages.yml` redesign job | redesign を root path で Pages 配信 (`pages.yml:45-61`) | **archive = 上記 mechanical 定義に従う** (D-2 で「file 削除」or「redesign step 削除し v1 job のみ残置」を選択)。理由: postv5 本体は server 常駐ゆえ静的配信不能 (selector-prompt §1.5)。 | `grep -n "prototype-redesign" .github/workflows/pages.yml` が **0 hit** (file 削除なら file 不在) かつ postv5 commit 後 Pages が redesign を再配信しないこと + 「server deploy へ切替えた旨」を README/CLAUDE.md に明記 (selector-prompt §Demo) | user (D-2 で確定) |
| `pages.yml` prototype v1 job | v1 を `/v1/` subpath 配信 (`pages.yml:63-76`) | **保持判断は OPEN**: (a) v1 Pages を停止 = file 削除 (②) / (b) v1 だけ Pages archive として残す (③ 寄り)。Plan v1.3 lock の v1 demo を残すかは strategic。 | OPEN DECISION D-2 で確定 | user (strategic) |
| trigger paths | `prototype-redesign/**` push で Pages re-deploy (`pages.yml:7-10`) | redesign job archive 後は postv5 push が Pages を更新しないこと (誤配信防止) | postv5 commit で Pages が更新されない (or workflow 削除済) を確認 | AI 実装 → user (D-2 確定後) |

**blocking 完了基準 (Contract A)**: ① 1 案 (= ②) に確定 + ② A-2 の dev/demo/CI 手順が記述済 + ③ A-3 で pages.yml の archive 処理が **mechanical 定義** (file 削除 or redesign step 削除) で確定 + `grep -n "prototype-redesign" .github/workflows/pages.yml` が 0 hit (v1 残置は D-2 で別途確定) + ④ stakeholder 閲覧手段が **最低 3 route × 3 role の smoke path を実際に通過** (hosted URL or localhost smoke、selector-prompt §Demo の 3×3 threshold)。④ は「閲覧手段を 1 文書く」では未達、3 route × 3 role の smoke が green であることを要する。**approval owner (Contract A 全体): user (最終 ship/infra 方向は judgement gate)**。

---

### Contract B — Exposure baseline (#9-7)

**deliverable**: 下表の 9 統制を「mock-only を守る privacy/exposure safeguard」として最小実装する。各行は「実証に必要な最小実装 + falsifiable な確認手段」を持ち、production hardening は除外する。selector-prompt §9-7 の 9 項目を全て被覆。

#### B-1. exposure-baseline-matrix (必須列: 統制 / 最小実装 (right-sized) / falsifiable 確認 / 完了基準 / approval owner)

| # | 統制 | 最小実装 (right-sized) | falsifiable 確認 | blocking 完了基準 | approval owner |
|---|------|------------------------|------------------|-------------------|----------------|
| 1 | **server default `127.0.0.1` bind** | server listen を `127.0.0.1` に固定。public host (`0.0.0.0`) は env flag + 明示承認時のみ。 | server unit test: bind host が `127.0.0.1` (env 未設定時) / `0.0.0.0` は明示 env でのみ true | default bind が loopback、public 化に明示 flag を要する test pass | AI 実装 → user 承認 (public 化方針) |
| 2 | **CORS allowlist (wildcard 禁止)** | **同一 origin 配信なら CORS 不要** (A-2 推奨)。別 origin の場合のみ allowlist (env のホスト list)。credentialed request で `*` 禁止。 | API test: 許可外 origin の credentialed request が拒否 / `Access-Control-Allow-Origin: *` を返さない | 同一 origin 配信採用なら「CORS 不要」を記録 / 別 origin なら allowlist test pass | AI 実装 → user (origin 方針) |
| 3 | **error sanitizer (stack/SQL 非露出)** | error handler が client へ `{ ok:false, error: <安全 message> }` のみ返す。stack trace / SQL / better-sqlite3 例外文を返さない。 | API test: 強制 error 時の response body に stack/`SQLITE`/SQL 断片が含まれない | sanitized error の test pass (内部詳細は server log のみ) | AI 実装 |
| 4 | **security headers** | 最小: `X-Content-Type-Options: nosniff` / `Referrer-Policy: no-referrer` / CSP。CSP は Vite (built asset は self-host) + Tailwind v4 (build 時 CSS、inline `<style>` injection なし) 前提。**ただし live V2 は dynamic な inline `style={{...}}` を使用** (例: `src/v2/AgentDetailV2.tsx:176` の trend bar `height`) ため **`style-src 'self' 'unsafe-inline'` に緩める** (demo-right-sized、inline style 全廃は scope-out の UI 作業)。**exact 文字列**: `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`。helmet 等の薄い middleware 可、監視/レポート (`report-uri`/CSP report endpoint) は不要。 | API test: response の `Content-Security-Policy` header が上記 **緩めた exact 文字列と一致** (`style-src 'self' 'unsafe-inline'` を含む value を assert、presence だけでなく value を assert) / 他 2 header も存在 | 最小 header set が全 response に付与 + CSP value が exact 一致する test pass | AI 実装 |
| 5 | **rate limit** | **P0 #4/#9-1 mutation matrix の SoD/execute mutation endpoint 集合** (`POST /api/cases/:id/approve`・`POST /api/cases/:id/override`・`POST /api/cases/:id/sendback`・`POST /api/proposals/:id/approve`・`POST /api/agent/promotions/:id/approve`・`POST /api/agent/emergency-stop` 等、server-authoritative な mutation すべて) に簡易固定-window limiter (in-memory)。read-only/GET は対象外。閾値 = **同一 actor あたり 60 req/min** (demo 実証用の固定値、production tuning ではない)。分散 store / Redis は不要 (単一 process)。 | API test: named mutation endpoint で 60 req/min 超過 → `429` (`denialReason='RATE_LIMITED'`)、read-only endpoint は limiter 非適用 | mutation matrix の全 SoD/execute endpoint に limiter 適用 + 閾値超過 429 test pass | AI 実装 |
| 6 | **DB file は commit-safe + permission 最小** | env-driven `DB_PATH`。dev default = `prototype-redesign/server/data/dev.sqlite` (gitignored)。hosted/stakeholder demo は `DB_PATH` を repo tree 外に向ける。file mode は所有者のみ (`0600` 相当)。`.gitignore` に DB 拡張子追記 (`*.sqlite` / `*.db`)。 | startup test: **DB file が gitignored かつ `git ls-files` に出現しない** (commit-safety) / file mode が所有者のみ | DB file が commit-safe (gitignored + not tracked) + 最小 permission | AI 実装 |
| 7 | **secret は env (bundle 非混入)** | identity 署名 secret (P0 #3、`X-Operator-Token` HMAC-SHA256 署名用) は **env 1 個 = `BOAI_SESSION_SECRET`**。client bundle に secret を含めない (`VITE_` prefix 経由で露出させない)。 | build artifact grep: `BOAI_SESSION_SECRET` 値が `dist/` に出現しない / server 起動時 env 欠落で fatal exit (selector-prompt §架構 observability) | secret が server env (`BOAI_SESSION_SECRET`) のみ + bundle grep 0 hit | AI 実装 → user (secret 運用) |
| 8 | **log は allowlist のみ** | structured log は `session_operator_id / effective_actor_id / action / ok\|deny (deny 時 denialReason enum)` の allowlist field のみ (selector-prompt §架構、P0 #3 dual-ID model)。before_json/after_json の生 row dump や PII を log しない。 | server unit test: log payload key が allowlist と一致 / 非許可 field (顧客値等) が出ない | allowlist log の test pass | AI 実装 |
| 9 | **README + CLAUDE.md に mock-only 明記 (= privacy safeguard)** | README / ルート CLAUDE.md / prototype-redesign CLAUDE.md に **逐語固定句**「実顧客データ・実 PDF・実規制 cite なし、mock-only」を明記。これ自体が exposure を抑える privacy safeguard。**現 live README は stock Vite template で mock-only 文言 0 hit** (verified: `grep -nE "mock\|外部\|顧客\|証跡" README.md` exit 1) ゆえ追記必須。 | doc grep: 3 doc に **exact 句** `実顧客データ・実 PDF・実規制 cite なし、mock-only` が存在 (`grep -Fn "実顧客データ・実 PDF・実規制 cite なし、mock-only" README.md ルート/CLAUDE.md prototype-redesign/CLAUDE.md` が 3 file とも hit)。paraphrase では gate 不通過。 | SSOT 更新 gate で 3 doc に exact 句を明記 (Contract A の pages.yml 処理と同 gate) | AI 実装 → user 承認 |

> **#9-7 の核は「mock だから exposure が本質的に低い」を壊さないこと**。本 baseline は full security stack ではなく、mock-only 前提の下で「うっかり stack/secret/PII を外に出さない」最小防御線。selector-prompt §9-7 の文言「mock-only = privacy safeguard」に一致。

#### B-2. 明示的に除外する production hardening (right-sizing、入れたら DEFECT)

| 除外項目 | 理由 |
|----------|------|
| Kubernetes / Docker swarm / 複数 process orchestration | 単一 Node process が target (selector-prompt §設計原則)。over-engineering signal。 |
| CDN / WAF / DDoS 防御 | mock demo に production edge infra は不要。stakeholder demo は単一 host。 |
| observability stack (APM / metrics 収集 / tracing / 監視 dashboard) | 最小 observability = structured log + `GET /api/health` + DB open 失敗時 fatal exit のみ (selector-prompt §架構)。それ以上は production hardening。 |
| OAuth / JWT issuer / IdP / RBAC engine | identity は demo-only `X-Operator-Token` (HMAC-SHA256 署名) + secret env 1 個 (`BOAI_SESSION_SECRET`、P0 #3)。auth framework は禁止。 |
| 自動 deploy pipeline (CI deploy) | CI は build/test gate のみ。deploy 自動化は infra hardening ゆえ手動 or PaaS 既定で足りる。 |
| 分散 rate limit store (Redis 等) | 単一 process の in-memory limiter で実証十分。 |

---

### Open decisions

- **D-1 (deploy option ②/③)** — 採否: postv5 本体を **②=Pages 完全停止して hosted/localhost** か、**③=Pages を v1 archive 配信として残す**か。
  - 推奨 default: **②**。理由: Pages 二重運用 (v1 配信 + 別 host) を避け infra を単一 host に収斂。selector-prompt §1 推奨に一致。
  - reversibility: **reversible** (Pages workflow は archive→復活が容易、v1 build artifact は残存)。
- **D-2 (prototype v1 Pages の存続)** — 採否: `pages.yml` の v1 job (`/v1/` 配信) を停止するか、v1 archive として残すか。
  - 推奨 default: **停止 (= ②)**。Plan v1.3 lock の v1 demo を Session 4 後も配信する要件が現時点で立っていないため。残置要件があれば ③ 寄りに切替。
  - reversibility: **reversible** (job 再有効化で復活)。
- **D-3 (stakeholder 閲覧 = hosted URL か localhost か)** — 採否: 簡易 PaaS の一時 hosted URL を立てるか、localhost 共有 smoke で済ますか。
  - 推奨 default: **localhost smoke を primary、hosted は必要時のみ一時起動**。理由: hosted を常設するとそれ自体が exposure surface + secret/DB の host 運用負荷。demo は最低 3 route × 3 role の smoke path で足りる (selector-prompt §Demo)。
  - reversibility: **reversible**。
- **D-4 (CORS の要否)** — 採否: 同一 origin 配信 (CORS 不要) か別 origin (allowlist 必要) か。
  - 推奨 default: **同一 origin 配信 (server が built client を配信)**。CORS surface を消せる。
  - reversibility: **reversible** (別 origin 化は後から allowlist 追加で可)。

> D-1〜D-4 はいずれも reversible。本 prompt の「irreversible fork でのみ user に問う」原則に従い、右サイズ default は提示済。strategic な infra 方向 (常設 hosted を立てるか等) のみ user 承認 gate に残す。

### Right-sizing notes

- deploy は **単一 Node process + 1 host** が上限。CI は build/test gate のみで deploy 自動化しない (A-2 CI 行)。Pages workflow は archive する (A-3)。
- exposure baseline 9 項目は全て「mock-only を壊さない最小防御線」であり、auth framework / monitoring stack / edge infra は **明示除外** (B-2)。selector-prompt §設計原則「統制の実証 ≠ production hardening」に整合。
- secret は **env 1 個 = `BOAI_SESSION_SECRET`** (B-1 #7)。OAuth/JWT issuer 等は P0 #3 に委ね、本 contract では bundle 非混入のみ担保。
- rate limit / CORS は単一 process / 同一 origin 前提で最小化 (B-1 #2,#5)。分散 store・wildcard 緩和は不採用。
- DB file は env `DB_PATH` + gitignore (commit-safe) + `0600` (B-1 #6)。WORM/保持/改竄統制の本格主張はしない (audit immutability は P0 #8b の DB trigger に委ねる)。
- **過剰設計の stop signal**: 新規 deploy framework・複数 service・監視 stack・自動 deploy pipeline のいずれかが提案に現れたら、本 contract に反するため再 right-size する。
