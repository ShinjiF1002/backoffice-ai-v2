# 本番業務利用 是正計画 (Production Remediation Plan)

> 入力: `production-readiness-audit.md` の gap (層 A demo 欠陥 / 層 B 本番必須)。
> 目的: 銀行 BO ユーザの**不満ゼロ**を達成するため、層 A を短期で完成 (demo 品質) し、層 B を段階構築 (本番化) する網羅的・優先順位付き計画。
> 工数表記 (`CLAUDE.md` AI-native 基準): **AI** = AI coding agent 実装 / **人** = 人間レビュー・判断 / **外部** = 外部承認・調達・接続待ち / **risk** = 不確実性。実装は安く、正確性・外部依存・視覚判断・統合信頼度を重く見積もる。
> ステータス: **v1.1 (収束)** — Codex adversarial review 3 round (R1 audit / R2 plan 構造 / R3 収束確認) 反映済。round 3 で「残存 Critical なし・構造 sound」と判定、収束。

---

## 0. 方針

- **2 トラック並行**: R0 (層 A front-end 完成、backend 不要) を**即着手**して demo/レビュー品質を完成。R1-R4 (層 B 本番化) は backend アーキを伴うため**段階構築**。
- **R0 は `prototype-redesign/` 上で完結** (mock + client-side)。R1 以降は新規 backend repo + 統合層を要し、`prototype-redesign/` は本番 front-end の出発点になる。
- **gate-first**: 各 Phase に受入基準 (falsifiable) を定義。満たすまで次に進まない。
- **scope-0 の明示**: 各項目に「やらない場合の不満」を併記し、drop 判断を可能にする。

---

## R0 — Demo/プロトタイプ完成 (層 A、front-end のみ、backend 不要)

> 目標: mock のままで**現場ユーザ/stakeholder が触っても不満が出ない**水準。Session 4 demo にも直結。`prototype-redesign/` 内で完結。

| # | gap | 対応 | 工数 (AI/人/外部/risk) | 受入基準 |
|---|-----|------|----------------------|---------|
| R0-1 | X-1 ProcessSelector cosmetic | 選択業務を **React context** で保持し、全画面の list/KPI/card を client-side filter。`全業務` は非filter | AI 中 / 人 小 / 外部 0 / risk 低 | 口座開設選択時、Hub card・Cases 行・Observatory が当該業務のみに絞られる |
| R0-2 | X-2 検索 icon のみ | 案件 ID/法人名/担当の **client-side 全文検索** を実装 (TopBar input 活性化)。結果は現在画面の list に適用 | AI 中 / 人 小 / risk 低 | 検索語入力で list が絞り込まれ、0 件時 empty 表示 |
| R0-3 | X-3 通知ベル非機能 | 通知 **panel** (mock 通知 list) を実装、または demo では非表示化 (どちらか明示) | AI 小 / 人 小(要判断) | ベル click で panel 開閉、または非表示 |
| R0-4 | X-4/5/6 modal a11y | **共通 Modal primitive** に集約: open 時 focus 移動 / Esc 閉じ / focus trap / close 時 trigger へ focus 復帰。FieldActionModal・ReasonDialog・申請 dialog を載せ替え | AI 中 / 人 小 / risk 低 | 3 modal すべて Esc 閉じ・focus inside・Tab 循環・復帰を満たす (axe + 手動) |
| R0-5 | X-7 table 行 非link/非keyboard | 行を `<a href>` (または `role=button` + `tabIndex=0` + Enter/Space) 化。Cmd+click 新規タブ可、Tab 到達可、可視 focus ring | AI 中 / 人 小 / risk 低 | キーボードのみで全行を開け、Cmd+click で新規タブ |
| R0-6 | X-8/D6 sort/filter/page 無し | list に **列ソート + status/担当/期間 filter + ページング (or 仮想化)** を client-side 実装。共通 DataTable 化 | AI 大 / 人 中 / risk 中 | 100+ mock 行で sort/filter/page が機能、要確認上部固定は filter と両立 |
| R0-7 | X-9/D8 mobile table 崩れ | list を狭幅で **card layout** に切替 (md 未満)、TopBar 折返し整理 | AI 中 / 人 小(視覚) / risk 低 | iPhone/iPad 幅で list が card で読める、文字単位折返し解消 |
| R0-8 | X-10 全行同一 detail | mock を **id keyed** 化 (案件/提案/Agent ごとに最低 3-5 種の detail mock)、`:id` で出し分け | AI 中 / 人 小 / risk 低 | 異なる行 → 異なる detail。存在しない id は not-found 表示 |
| R0-9 | X-11/D5 Empty/Error/Loading 欠如 | 隔離した `EmptyState`/`ErrorState`/`LoadingState` を token 化して復活 (or 新規)、全 list/detail に配線。mock で空・遅延・失敗をトグル可能に | AI 中 / 人 小 / risk 低 | 空 inbox・読込中・(mock) 通信失敗が各画面で表示 |
| R0-10 | D9 feedback/二重送信 | toast に **undo** (可能な操作)、button に二重送信 guard (submitting 中 disable)、確定後の状態反映 (R0 は client state) | AI 中 / 人 小 / risk 低 | 連打で二重送信されない、承認後 list 即反映 (client) |
| R0-11 | D7 a11y 残 | 全 interactive に可視 focus ring、form error の `aria-describedby` 連携、status 変化の `aria-live`、color のみに依存しない status (icon/text 併記) | AI 中 / 人 中(SR 実機) / risk 中 | axe violations 0、キーボード+SR で全 flow 完了可 |
| R0-12 | D12 文言 | 文言の現場語照合、エラー文言網羅、tooltip/ヘルプ拡充、日付/数値 locale | AI 小 / 人 中(現場確認) / 外部 小 / risk 中 | 現場レビューで用語違和感 0 |
| R0-13 | DD-4.1 一括操作なし | 複数選択 → 一括承認/差戻し/担当割当 (client-side、SoD 範囲内) | AI 中 / 人 小 / risk 中 | 複数行選択して一括処理でき、要確認残は一括承認不可 |
| R0-14 | DD-4.2 キュー割当/ロックなし | 担当割当 UI + 処理中ロック表示 (client mock)、引き継ぎ動線 | AI 中 / 人 小 / risk 低 | 割当・処理中表示が機能 (実 lock は R1) |

**R0 受入 gate**: 9 画面で (a) ProcessSelector/検索が機能、(b) 3 modal a11y 合格、(c) list が keyboard+sort+filter+mobile 対応、(d) Empty/Error/Loading 表示、(e) axe violations 0、(f) Lighthouse a11y 90+ (要 Lighthouse 導入)、(g) prototype mode label 維持、(h) bulk 操作 + キュー割当/ロック (client)、(i) **9 画面 × 操作 × 権限 × 状態 × viewport の coverage matrix 完全実走** (audit §7 の未実走 4 画面 [Approvals/Proposals/Agents/ProposalDetail] を個別実走で埋める、MIS-03)。→ **demo/stakeholder レビューで層 A 不満ゼロ**。

> R0 だけでは**本番業務不可** (永続化・実データ・認証なし)。R0 完了 = 「触って不満の出ない demo」まで。

---

## R1 — Backend Foundation (層 B、永続化 + 認証)

> gap: D1 永続化 / D3 認証-認可-SoD / D15 データ整合。**本番化の土台**。

| 項目 | 内容 | 工数 |
|------|------|------|
| R1-1 API + DB | 案件/提案/Agent/監査の永続化 (RDB)、REST/GraphQL API。状態遷移をサーバ側で管理 | AI 大 / 人 大(設計) / 外部 中(基盤調達) / risk 中 |
| R1-2 認証 (SSO/IdP) | 行内 IdP 連携 (SAML/OIDC)、session 管理、timeout、画面ロック | AI 中 / 人 中 / 外部 大(IdP 連携承認) / risk 中 |
| R1-3 RBAC + SoD 強制 | role 権限をサーバ enforce。**入力者≠承認者をシステム担保** (同一人の承認を拒否)。mode toggle は実 role に置換 | AI 中 / 人 大(権限設計) / 外部 中 / risk 高 |
| R1-4 楽観ロック/競合 | 同時編集競合検知、案件 status の一貫遷移、冪等な操作 | AI 中 / 人 中 / risk 中 |
| R1-5 front 配線 | `prototype-redesign/` の mock を API client に置換、loading/error/楽観更新を実配線 (R0-9/10 の基盤を活用) | AI 大 / 人 中 / risk 中 |

**R1 受入 gate**: ログイン→処理→承認→反映が**永続**し、再ログイン/別端末で同状態。SoD がシステムで強制 (入力者の自己承認不可)。

---

## R2 — 実統合 (層 B、AI + 業務システム)

> gap: D2 backend統合。`CLAUDE.md` Connectivity tier (API/MQ/RPA/DB) に従う。

| 項目 | 内容 | 工数 |
|------|------|------|
| R2-1 AI 入力 (OCR/LLM) | 実 OCR + 値生成モデル接続、confidence の実値化、master 照合 | AI 中 / 人 大(精度検証) / 外部 大(モデル調達/審査) / risk 高 |
| R2-2 system-of-record write | 登録情報更新の実書込 (tier 別: API/MQ/file/RPA)。**write は明示承認 + 限定条件** | AI 中 / 人 大 / 外部 大(接続承認) / risk 高 |
| R2-3 staging→提案 pipeline | 差戻し→staging→日次分析→提案生成の実データ pipeline | AI 大 / 人 中 / risk 中 |

**R2 受入 gate**: 実書類で AI 入力→人確認→system-of-record 反映が end-to-end、誤りは要確認に確実に回る。

---

## R3 — ガバナンス & セキュリティ (層 B、銀行の核心)

> gap: D4 監査書込 / D10 セキュリティ / D14 compliance + (Codex round 1 で AI ガバナンス・運用レジリエンスを補強予定)。

| 項目 | 内容 | 工数 |
|------|------|------|
| R3-1 監査基盤 | 全操作の監査 event 書込、改竄防止 (WORM/hash chain)、保持期間、e-discovery 出力、台帳の実エクスポート | AI 中 / 人 大(規制要件) / 外部 大(監査部承認) / risk 高 |
| R3-2 AI モデルガバナンス **(最重量級)** | **model registry (版管理)** / 説明可能性 / **bias・drift 監視** / **human-override analytics (率・理由分類・feedback loop)** / Trust 昇格-降格の統制・承認履歴・**自動降格** / **shadow-mode / champion-challenger 検証** / モデル変更承認 / third-party モデルリスク (DD-1.1〜1.8) | AI 大 / 人 大 / 外部 大 / risk 高 |
| R3-3 セキュリティ **(LLM 固有を含む、最重量級)** | **SEC-01 文書経由 prompt injection 防御** (PDF/OCR/RAG を untrusted 化・instruction stripping・tool-call allowlist) / **SEC-02 excessive agency 抑止** (agent 権限最小化・書込 tool は承認済 command のみ・human release gate) / **SEC-03 PII を prompt/log/vector store から除去** (redaction・retention TTL・vendor no-training) / SEC-04 台帳 field 単位 entitlement / SEC-05 AI supply-chain integrity (署名 model artifact・KB index hash) / 高リスク操作の再認証・PII マスキング・印刷/clipboard 制御・CSP/XSS/CSRF・脆弱性診断 | AI 大 / 人 大 / 外部 大(セキュリティ審査) / risk 高 |
| R3-4 compliance traceability | 規制要件→画面/操作の traceability matrix、変更管理の法的有効性 | AI 小 / 人 大 / 外部 大 / risk 高 |
| R3-5 **訂正・取消 flow (新設、P0)** | 誤反映の正式な訂正・取消 (reversal/correction) 経路と証跡。status 前進のみの現設計に逆方向遷移を追加 (DD-2.1) | AI 中 / 人 大(規程) / 外部 中 / risk 高 |
| R3-6 confidence 監視 dashboard | UI 非表示を維持しつつ、運用監視・モデル評価のため confidence を集計する dashboard (DD-1.3) | AI 中 / 人 中 / risk 中 |

**R3 受入 gate**: 行内 IT 監査・リスク・コンプラ・情報セキュリティの各 review を通過。AI モデルガバナンス (R3-2) と訂正・取消 (R3-5) は**本番 go の必須条件**。

---

## R4 — スケール & 運用 (層 B)

> gap: D11 性能 / D13 運用。

| 項目 | 内容 | 工数 |
|------|------|------|
| R4-1 スケール | list 仮想化、コード分割 (現状単一 bundle)、実データ量での応答 SLA | AI 中 / 人 中 / risk 中 |
| R4-2 可観測性 | front error tracking/RUM、操作ログ、feature flag、version 表示 | AI 中 / 人 中 / 外部 小 / risk 低 |
| R4-3 レジリエンス/BCP **(P0 要素含む)** | **kill switch (AI 誤判断の一括停止)** / **AI 不能時の全項目手動 fallback** / **冪等性 (二重処理防止)** / 再処理の安全性 / degraded mode / failover / incident response (影響案件特定・遡及訂正) / flywheel 失敗モード遮断 (staging poisoning) (DD-3.1〜3.6) | AI 中 / 人 大 / 外部 中 / risk 高 |

**R4 受入 gate**: 実データ量で SLA 達成、障害注入で degraded mode + kill switch + 手動 fallback が機能、二重送信で重複反映ゼロ。

---

## R+ Codex round 1 反映 — 追加項目 (規制根拠付き、phase 対応)

audit §6 の Codex findings を phase に割付。**監査の最大盲点だった LLM セキュリティ・AI モデルリスク・障害時継続を本番 go の必須統制として明記**。

| ID | 追加項目 | 割付 phase | Sev | 工数 (AI/人/外部/risk) |
|----|---------|-----------|-----|----------------------|
| REG-01 | 3 層 (案件/手順/設定) 横断 SoD matrix を workflow engine で強制 (2LoD/IT承認含む) | R1-3 拡張 | P0 | AI 中 / 人 大 / 外部 中 / risk 高 |
| REG-04 | 閲覧アクセスログ (書類/PII/AI根拠を"見た"記録) を書込台帳と別系統で | R3-1 拡張 | P1 | AI 中 / 人 中 / risk 中 |
| REG-05 | FISC 安全対策/システム監査/コンティンジェンシー基準への control matrix | R3-4 拡張 | P1 | AI 小 / 人 大 / 外部 大 / risk 高 |
| AI-01/02 | model inventory (owner/risk格付/停止条件) + decision ledger に model/prompt/OCR/KB 版 lineage | R3-2 拡張 | P0 | AI 中 / 人 大 / 外部 中 / risk 高 |
| OPS-02 | 依存マップ + RTO/RPO (OCR/LLM/API/MQ/RPA/DB tier) | R4-3 拡張 | P0 | AI 小 / 人 大 / 外部 中 / risk 中 |
| OPS-04 | **approve と reflect を分離** + 反映結果照合 + 失敗時補償 + 未反映一覧 | R1-4 / R2-2 | P0 | AI 中 / 人 中 / risk 高 |
| UX-02 | **flywheel lineage view** (差戻し→staging→提案→手順→設定→将来案件の双方向追跡) を監査画面に | R3 新規 (R3-7) | P0 | AI 大 / 人 中 / risk 中 |
| UX-05 | **kill switch UI** — Agent 別 pause/force-supervised/revoke を承認付き緊急停止面に (AgentDetail 拡張) | R0 (UI 雛形) → R3 (実権限) | P0 | AI 中 / 人 中 / risk 中 |
| UX-03 | role を IdP claim + workflow assignment で決定 (mode toggle 廃止)、画面は権限結果のみ | R1-3 | P1 | AI 中 / 人 中 / risk 中 |

> **MIS-03 (網羅性) 反映**: R0 受入 gate に「9 画面 × 操作 × 権限 × 状態 × viewport の coverage matrix を完全実走」を追加 (audit §7 の未実走 4 画面を含む)。

---

## R++ Codex round 2 反映 — 計画構造の是正 (v1.1、以下は phase tables より優先)

Codex round 2 が計画の**構造的欠陥**を摘出。以下の是正は前掲 phase 順序に**優先**する。

### S1. 本番 write の sequencing 是正 (PH-01 / R2-02 / R1-01、Critical)
- **R2 を分割**: **R2a = sandbox / read-only 統合** (OCR/LLM を試行・照合のみ、書込なし) → **R2b = 本番 system-of-record write**。
- **R2b (本番 write) は次が全合格するまでロック**: R3-2 (AI モデルガバナンス) / R3-3 (LLM セキュリティ: prompt injection・excessive agency) / R3-5 (訂正・取消) / OPS-04 (approve↔reflect 分離 + 照合 + 補償)。→ **AI が PII・業務更新に触れる前に統制を承認済みにする**。
- **R1 の状態遷移は最初から監査 event を発火する前提で設計** (後付けログ禁止)。WORM/hash-chain 強化は R3-1。

### S2. 障害時継続を go/no-go gate に昇格 (PH-02、Critical)
- **R4-3 (kill switch / 手動 fallback / 冪等性 / reflect 照合) を R3 と同格の本番 go gate に**。pilot 前に**障害注入テスト必須**。

### S3. AI ガバナンス・lineage の gate 化 (MG-01 / MG-02、Critical)
- R3-2 の sub-item を gate 化: **AI-03 独立検証 (2LoD validation) / AI-05 false-negative 統制 (抜取・challenger) / AI-06 vendor exit plan**。
- **UX-02 flywheel lineage を R3-7 として正式化し R3 gate に**: 案件起点・ルール起点の双方向 lineage 照会。

### S4. 例外運用 (MG-03、High)
- 横断 **例外 SLA queue** (owner/severity/SLA/escalation ladder/breach event) + **incident severity taxonomy** (AI/IT/業務、顧客影響・復旧期限・報告先) を R4 に追加。

### S5. R5 — Go-live Transition (STRUCT-01、Critical、新設 phase)
本番化は機能完成でなく**業務移行**。R5 を新設:
- **parallel run** (旧運用と新運用の並走 + 差異照合)、**cutover 手順**、**現場 training + 完了率**、**rollback playbook**、**旧プロセス停止基準**。
- 受入 gate: 並走期間の差異が閾値内、training 完了率、rollback 演習成功。

### S6. データ移行・品質 (DATA-01、Critical)
- R1/R2 の前提に: **データ品質 profile / reconciliation report / 例外件数閾値 / 移行リハーサル / 本番前 freeze**。

### S7. Gate の証跡化 (GATE-01 / GATE-02、High/Critical)
- **R0 gate**: 各 test に ID・実行者・日時・期待結果 (権限別)・証跡・pass/fail・fail 時再実走条件 (第三者再実行可能に)。
- **R3 gate**: control matrix / 脅威モデル / model validation report / BCP test 結果 / 監査証跡サンプル を必須成果物に。

### S8. R0 の「非統制」明示 (R0-01、High)
- R0 の client-side SoD・lock・kill-switch・lineage・bulk は**統制ではない**。全画面に「backend/認証/永続化/監査書込なし・SoD/lock/kill-switch は非統制 mock」を**視認可能に表示**し、demo disclaimer を承認済みにする。R0 完了報告に「本番利用不可・R1 開始可否のみ判定・production go-live 承認ではない」と明記。

### S9. 暦日 critical path + 経営 1-pager (EFF-01 / MGMT-01、High)
- 外部承認 (IdP / モデル調達 / セキュリティ審査 / 監査・コンプラ / FISC mapping / 接続先 owner) の**承認主体・提出物・標準 SLA・最短/標準/遅延ケース**を置いた calendar critical path。
- R1 開始前に **TCO / run cost / 必要 FTE / 効果 KPI / 残余リスク受容者** を 1 枚で確定。

### ★ R0 → R1 移行 gate (第三者が yes/no 判定、Codex 指定)
1. 全 9 画面に「非統制 mock」表示がある
2. coverage matrix に test ID・実行者・日時・期待結果・証跡・pass/fail が記録
3. demo disclaimer が承認済み
4. R1 の domain event / state transition / audit event / SoD rule / role source の論理設計がレビュー済み
5. P0 gap 全件の owner・phase・acceptance evidence・go/no-go 判定者が一覧化
6. R2b 本番 write が R3 security/model-gov + R4 resilience gate 合格まで計画上ロック
7. 外部承認の lead time・提出物が明文化
8. R0 完了報告に「本番 go-live 承認ではない」と記載

---

## 優先順位 & 依存

```
R0 (即着手・独立・front mock) ──[R0→R1 gate]──► demo 不満ゼロ (本番不可を明示)
                                                  │
R1 (基盤: API+DB+認証+SoD強制+監査event発火+データ移行)
   │
   ├─► R2a (sandbox/read-only 統合: OCR/LLM 照合のみ)
   │       │
   ├─► R3 (ガバナンス/セキュリティ: AIモデルリスク + LLMセキュリティ + 訂正取消 + lineage)
   │   R4-3 (kill-switch/手動fallback/冪等/reflect照合) ── go/no-go gate ──┐
   │                                                                      ▼
   └────────────────────────► R2b (本番write) ──► R5 (Go-live: 並走/cutover/training/rollback) ──► 本番 go
```

- **R0 は独立・即開始**可 (最大 ROI、demo 直結)。ただし出力は「非統制 demo」で本番 go-live 承認ではない (S8)。
- **R2b (本番 write) は R3 (security/model-gov) + R3-5 (訂正取消) + OPS-04 (reflect照合) + R4-3 (resilience) 合格までロック** (S1/S2)。← Codex round 2 最重要是正。
- **R5 (移行) が本番稼働の最終 gate** — 機能完成 ≠ 本番化。
- 外部依存 (IdP/モデル調達/接続承認/監査・コンプラ/FISC) が critical path。**AI 実装より外部承認 lead time が支配項** → S9 で暦日化。

---

## リスク & stop 条件

- **R0 で IA 自体の限界が露見**したら (例: Process-First が大量業務で破綻) → IA 見直しに pivot。
- **R2 のモデル精度が gate 未達**なら本番自動化を縮小 (全件確認に留める)。
- 外部承認 (IdP/接続/監査) が遅延したら R0 demo + R1 基盤を先行リリースし、統合を後続。

---

## Change Log
| Date | Change |
|---|---|
| 2026-05-29 | DRAFT v0.9 作成 (audit gap → R0-R4 mapping) |
| 2026-05-29 | deep-dive (AI gov/規制/BCP/IA at scale) 反映: R0 bulk/queue、R3-5 訂正取消 P0、R3-2 AI gov 重量化、R4-3 kill-switch P0 |
| 2026-05-29 | **v1.0** — Codex round 1 反映 (FSA MRM/AI DP・Basel・OWASP LLM・FISC 根拠): R3-3 に LLM セキュリティ (prompt injection/excessive agency/PII)、R+ 追加 (3層SoD/lineage/kill-switch UI/依存map/approve-reflect分離/閲覧ログ/FISC mapping)、R0 gate に coverage matrix |
| 2026-05-29 | **v1.1** — Codex round 2 (計画構造) 反映: R2 を sandbox/本番write 分割し write を R3+R4-3 合格までロック (S1)、R4-3 を go/no-go gate 昇格 (S2)、AI gov/lineage の gate 化 (S3)、R5 Go-live Transition 新設 (S5)、データ移行 (S6)、gate 証跡化 (S7)、R0 非統制 disclaimer (S8)、暦日 critical path + TCO 1-pager (S9)、R0→R1 gate 8 条件 |
| 2026-05-29 | **収束** — Codex round 3 検証: round 2 是正 9 項目すべて ✓ 反映、残存 Critical/High なし、構造 sound と判定。本計画を収束版とする |
