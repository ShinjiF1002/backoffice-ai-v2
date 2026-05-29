# 本番業務利用 Production-Readiness 監査 (E2E + Gap 分析)

> 対象: `prototype-redesign/` (Phase 2、9 画面 Process-First React、localhost:5174 / GitHub Pages root)。
> 目的: 銀行バックオフィス (BO) ユーザが本番業務で使う前提で、E2E でブラウザ全機能を網羅実走し、**現場ユーザから出る不満をゼロにする**ための gap を徹底列挙する。
> 監査日: 2026-05-29。方法: Claude_Preview (headless Chromium) で `window.location` を ground-truth 化した実走 + DOM/a11y tree 検査 + console/network 監視 + responsive 検証 + ソース知識照合。

---

## 0. 重要な前提 (この監査の読み方)

`prototype-redesign/` は **高忠実度の mock prototype** であり、設計上 backend / 実 LLM・OCR / 実データ / 認証 / 永続化を持たない (`CLAUDE.md` scope-out)。したがって gap は 2 層に分かれる:

- **層 A — Demo/プロトタイプ文脈でも不満になる欠陥**: mock のままでも「押せるのに動かない」「キーボードで操作できない」「狭幅で崩れる」等、**今すぐ直さないと Session 4 demo や stakeholder レビューで不満が出る**もの。
- **層 B — 本番運用に必須だが prototype では意図的に未実装**: backend / 認証 / 永続化 / 実統合 / 監査書込 / セキュリティ。**本番利用には必須**で、工数の大半はここ。

「不満ゼロ」には**両層を塞ぐ**必要がある。本監査は両方を severity 付きで列挙する。

Severity: **P0** = 本番運用不可の構造欠落 / **P1** = 通常利用で確実に不満が出る / **P2** = 中程度・回避可 / **P3** = polish。

---

## 1. E2E 実測サマリ (健全な点)

実走で確認できた**正しく動く**点 (これらは維持):

| 項目 | 実測 |
|---|---|
| console error / warning | 全画面 **0** (runtime crash なし) |
| `<html lang="ja">` / `document.title="Backoffice AI"` | 設定済 (default Vite title でない) |
| ルーティング | row→detail 遷移・browser back とも動作 (SPA history 健全) |
| 承認 gating | CaseDetail で要確認 1 残 → 承認 button `disabled` + title「要確認 1 項目を解消してください」明示 ✓ |
| 理由必須 | sendback/reject modal 未入力で送信不可 (実装確認) |
| prototype mode label | 全画面 TopBar に常時表示 ✓ |
| 一貫性 | off-token hex 0 / lucide only / status-tone SSOT (P2B-4 gate green) |

→ **プロトタイプとしての内部品質は高い**。以下の gap は「未実装/未配線」が主で、「壊れている」ものは少ない。

---

## 2. 横断 (全画面) 欠陥 — E2E 実測

TopBar・table・modal は全画面共有のため、影響が 9 画面に波及。

| ID | 欠陥 | 層 | Sev | 実測根拠 |
|----|------|----|-----|---------|
| X-1 | **ProcessSelector が cosmetic** — 業務を選んでも label が変わるだけでデータ非連動。Hub で「口座開設書類完備」選択後も両 process card 表示・KPI も全業務集計のまま | A | **P1** | 選択前後で process card = 2 件不変、KPI 6/1/2 不変 |
| X-2 | **検索が icon のみ** — `<input>` 不在。検索 UI を見せているのに機能ゼロ | A | **P1** | `input[type=search]` 0、matched は `<svg>` |
| X-3 | **通知ベルが非クリック** — button でなく装飾。未読ドットがあるのに開けない | A | **P2** | bell は `<button>` でない |
| X-4 | **modal に focus が移らない** — 開いても activeElement=BODY。キーボード/SR ユーザが modal 外に取り残される | A | **P1** | FieldActionModal open 時 `focusInDialog=false` |
| X-5 | **modal が Esc で閉じない** — Escape handler 不在 (FieldActionModal / ReasonDialog / 申請 dialog 共通) | A | **P1** | Esc dispatch で非閉鎖、handler 無し |
| X-6 | **modal に focus trap / focus 復帰なし** — Tab で背後に抜ける、閉じても trigger に戻らない | A | **P2** | code 上 trap 未実装 |
| X-7 | **table 行が `<a>` link でなくキーボード到達不可** — `<tr onClick cursor-pointer>`、role/tabindex なし。Cmd+click で新規タブ不可、Tab+Enter 不可 | A | **P1** | `a[href^="/cases/"]`=0、row の role/tabindex=null |
| X-8 | **list に sort / filter / 検索 / ページング無し** — 固定順表示のみ。実 inbox 数百件で破綻 | A/B | **P1** | `th button`/`select`/sort 0 |
| X-9 | **list table が mobile (375px) で文字単位に縦折り** — horizontal scroll も card fallback も無し。tablet/狭幅で判読不能 | A | **P2** | mobile screenshot で「法/人/住/所…」縦積み確認 |
| X-10 | **全 case 行が同一 CASE-2026-0142 を開く** — detail が `:id` に非連動 (単一 mock)。demo で「別案件を開いたのに同じ」が露見 | A | **P2** | row click → 常に `/cases/CASE-2026-0142` |
| X-11 | **Empty / Error / Loading 状態が一切ない** — `EmptyState`/`ErrorState`/`LoadingState` は P2B-4 で dormant 隔離。空 inbox・通信失敗・読込中の表示が存在しない | A/B | **P1** | active 参照 0 (import-graph) |

---

## 3. 多次元 Production Gap 分析

| # | 次元 | 現状 | 本番要件との gap | 層 | Sev |
|---|------|------|------------------|----|-----|
| D1 | 状態管理・永続化 | 画面ローカル `useState`、mock 固定 | リロード/画面遷移で全リセット。承認しても list に反映されない。**永続化層 (DB/API) 皆無** | B | **P0** |
| D2 | Backend / 実統合 | mock data のみ | 実 OCR/LLM 入力、master 照合、system-of-record 書込、業務システム接続 (API/MQ/RPA) すべて未接続 | B | **P0** |
| D3 | 認証・認可・SoD | mode toggle で role を**自己切替** (誰でも入力者⇄承認者) | 実 SSO/IdP、RBAC、session、SoD の**強制** (入力者≠承認者をシステムが担保) が無い。現状 SoD は表示のみ | B | **P0** |
| D4 | 監査証跡 (書込) | Observatory ledger は read-only mock | 実操作が監査 event を**書き込まない**。改竄防止・WORM・保持期間・e-discovery 出力なし。「エクスポート」は toast のみ | B | **P0** |
| D5 | Empty/Error/Loading | 無し (X-11) | 通信失敗時の再試行、空状態の導線、読込スケルトン、楽観更新の rollback | A/B | **P1** |
| D6 | 検索・絞込・ソート・ページング | 無し (X-8) | 列ソート、status/担当/期間 filter、全文検索、ページング/仮想化 (数百〜数千件) | A/B | **P1** |
| D7 | アクセシビリティ | aria-label/role/aria-modal は付与、lang=ja。但し X-4/5/6/7 の focus・キーボード欠陥 | WCAG 2.1 AA: focus 管理、Esc、focus trap、table キーボード操作、フォーム error の `aria-describedby` 連携、可視 focus ring の全要素担保、SR 通知 (`aria-live`) | A | **P1** |
| D8 | レスポンシブ | desktop 最適化。mobile bottom nav 有。但し table 崩れ (X-9) | tablet (iPad、現場で多用) での table card 化 or 横スクロール、TopBar 折返し整理 | A | **P2** |
| D9 | フィードバック・取消 | toast (2.6s) のみ | 取り消し (undo)、確定の永続確認、二重送信防止 (button は連打可)、楽観更新失敗時の通知 | A/B | **P1** |
| D10 | セキュリティ・プライバシー | mock、PII なし | session timeout、画面ロック、PII マスキング権限、操作の再認証 (高リスク)、CSP/XSS/CSRF、機密データの clipboard/印刷制御 | B | **P0** |
| D11 | 性能・スケール | bundle ~371KB gzip 107KB、mock 数件 | 実データ量での list 仮想化、コード分割 (現状単一 bundle、全画面 eager)、初期表示・操作応答の SLA | B | **P2** |
| D12 | 国際化・文言 | JP-only、内部語 gate 済 | 文言の現場検証 (実務語との一致)、エラー文言の網羅、日付/数値 locale、敬語/トーン統一、ヘルプ/ツールチップの充実 | A | **P2** |
| D13 | 運用・可観測性 | 無し | front 監視 (error tracking/RUM)、操作ログ、feature flag、バージョン表示、障害時の degraded mode | B | **P2** |
| D14 | compliance/規制 | hedge 表現で回避 (prototype) | 規制要件の traceability、保持/廃棄ポリシー、変更管理 (Agent/ルール改定の承認履歴の法的有効性)、4-eyes の証跡完全性 | B | **P1** |
| D15 | データ整合・業務ルール | 画面間で非共有 (X-10、D1) | 案件 status 遷移の一貫性、楽観ロック/同時編集競合、業務ルール validation (サーバ側) | B | **P0** |

---

## 4. 6-role Day-in-the-Life 不満予測

各 role が**実業務で 1 日使ったときに出す具体的不満**(現場目線):

### 入力者 (AI 入力結果を確認/差戻し)
- 「受信トレイが多くなると**並べ替えも絞り込みもできず**、期限が近い案件を探せない」(X-8)
- 「マウス必須。**Tab とテンキーで高速処理できない**」(X-7) — BO は片手キーボード操作が常
- 「項目の対応 modal を**Esc で閉じられない**、開いても入力欄に**カーソルが入っていない**」(X-4/5)
- 「**全案件が同じ内容**に見える」(X-10、mock 制約)
- 「確認後に一覧へ戻ると**さっきの処理が反映されていない**」(D1)

### 承認者 (入力者確認後の最終承認)
- 「承認待ちを開いても**誰が入力者か・SoD が本当に効いているか**が表示だけで、自分で承認者ビューに切替できてしまう」(D3)
- 「差戻し理由を書いたが**送信後に記録が残るのか不安**」(D4)
- 「一括承認できない」(D9/D6)

### Manual 管理者 (提案の triage)
- 「提案の根拠 case を開くと**全部同じ案件**」(X-10)
- 「却下/差戻し後**提案一覧から消えない・状態が変わらない**」(D1/D15)

### 業務責任者 (提案の最終承認)
- 「ProcessSelector で自部署を選んでも**他業務の数字が混ざったまま**」(X-1)
- 「承認の**法的有効性・証跡**が見えない」(D4/D14)

### AI 管理者 (Agent の昇格判断)
- 「昇格申請したが**本当に申請されたのか・取り消せるのか**分からない (toast だけ)」(D9)
- 「未達理由 KPI の**実データソース・更新時刻**が不明、`[仮説/要検証]` のまま本番判断できない」(D2)

### 監査者 (証跡確認)
- 「証跡台帳の**エクスポートが効かない** (toast のみ)」(D4)
- 「証跡が**read-only mock** で、実操作と紐づいていない・改竄検知がない」(D4)
- 「期間/actor/action で**台帳を検索/絞込できない**」(D6)

---

## 5. Severity 集計 & Production-Readiness 判定

| Sev | 件数 (主) | 内容 |
|-----|----------|------|
| **P0** | 6 | D1 永続化 / D2 backend統合 / D3 認証-認可-SoD / D4 監査書込 / D10 セキュリティ / D15 データ整合 |
| **P1** | 9 | X-1 ProcessSelector / X-2 検索 / X-4 focus / X-5 Esc / X-7 row key操作 / X-8 sort-filter / X-11 状態欠如 / D7 a11y / D9 feedback / D14 compliance |
| **P2** | 6+ | X-3 bell / X-6 trap / X-9 mobile table / X-10 mock id / D8 responsive / D11 perf / D13 ops |

**判定**:
- **プロトタイプ/demo 品質**: 高い (内部一貫・crash なし・主要 flow 動作)。ただし **層 A の P1 (TopBar cosmetic・modal a11y・list 操作性・状態欠如) を放置すると Session 4 demo / stakeholder レビューで確実に不満が出る**。
- **本番業務利用**: **不可**。層 B の P0 (永続化・backend・認証・監査書込・セキュリティ・データ整合) が構造的に未実装。これは prototype の設計範囲外であり、本番化には別アーキテクチャ (backend + IdP + DB + 統合層 + 監査基盤) の構築が前提。

→ 「不満ゼロ」のロードマップは **§ 是正計画** (`production-remediation-plan.md`) に定義。層 A を短期で塞ぎ demo 品質を完成させ、層 B を本番化フェーズで段階構築する。

---

## 6. Codex Adversarial Review (round 1) 反映 — 規制根拠付き追加 gap

Codex (FSA Model Risk Principles / FSA AI Discussion Paper / Basel Operational Resilience / OWASP LLM Top 10 / FISC 安全対策基準 を参照) による adversarial review で**監査が見落とした/過小評価した gap** を確定。特に **LLM 固有セキュリティ・モデルリスク管理・障害時継続** が手薄だった。

### 6.1 規制・コンプライアンス (REG)
| ID | gap | Sev | 修正方向 |
|----|-----|-----|---------|
| REG-01 | **3 層 (案件/手順/設定) 横断 SoD matrix 不在** — 同一職掌が差戻し→設定昇格まで牽制なく閉じられる | **P0** | 各層に maker/checker/owner/2LoD/IT承認を定義、同一人物・同一所属を workflow engine で禁止 |
| REG-02 | 反映後の**訂正・取消 workflow 不在** (= DD-2.1 cross-validated) | **P0** | 旧値/新値・影響システム・二重承認・再照合を台帳化した別 workflow |
| REG-03 | 例外エスカレーションが toast で**所有者付き SLA queue でない** | P1 | 例外に owner/severity/SLA/escalation ladder/breach event |
| REG-04 | **閲覧アクセスログ不在** (誰が"見たか"=書類/PII/AI根拠) — 監査は"変更"だけでなく"閲覧"を問う | P1 | 書込台帳と別に閲覧ログ (actor/purpose/timestamp) |
| REG-05 | **FISC 安全対策基準等への control mapping 不在** (prototype→本番 handoff の統制対応) | P1 | FISC/システム監査/コンティンジェンシー基準への control matrix |

### 6.2 AI ガバナンス・モデルリスク (AI) — FSA MRM/AI DP
| ID | gap | Sev | 修正方向 |
|----|-----|-----|---------|
| AI-01 | **model inventory / owner / risk rating 不在** | **P0** | model ID/owner/risk格付/use case/制限/停止条件を登録 |
| AI-02 | decision ledger に **model/prompt/OCR/KB 版の lineage なし** (`policy v3.1` のみ) | **P0** | 各 AI 出力に model_version/prompt_hash/OCR_version/KB_snapshot/threshold_set 必須 |
| AI-03 | Trust 昇格/降格の**独立検証・承認なし** (業務部門申請のみで統制低下) | **P0** | 2LoD validation + 業務責任者 + IT リリース承認に分離 |
| AI-04 | **drift/segment/bias 監視なし** (集約承認率のみ) | P1 | KPI を process/帳票/支店/法人属性/model版で分解、drift KRI |
| AI-05 | **「自信を持って誤る」false-negative 統制が運用化されていない** | **P0** | 高信頼自動処理の抜取検証/challenger/承認後サンプリング/FN KRI |
| AI-06 | **vendor/外部モデルリスク不在** | **P0** | due diligence/責任分界/データ利用制限/代替/終了計画/監査権 |

### 6.3 運用レジリエンス・BCP (OPS) — Basel
| ID | gap | Sev | 修正方向 |
|----|-----|-----|---------|
| OPS-01 | AI/OCR 障害時の **degraded/手動 mode なし** (= DD-3.1) | **P0** | AI unavailable 時の手入力 queue + 証跡 + AI 再同期 |
| OPS-02 | **依存マップ・RTO/RPO なし** (OCR/LLM/API/MQ/RPA/DB tier) | **P0** | critical operation map に依存先/RTO/RPO/代替/復旧順 |
| OPS-03 | reprocess/reflect の **冪等性・replay 防止なし** (= DD-3.2) | **P0** | command ID/idempotency key/transition guard/safe replay log |
| OPS-04 | **approve→reflect の照合なし** — 反映前後の障害で画面/台帳/顧客マスタ不整合 | **P0** | approve と reflect を分離、反映結果照合、失敗時補償、未反映一覧 |
| OPS-05 | **AI 運用の incident severity taxonomy なし** | P1 | AI/IT/業務例外を severity/顧客影響/復旧期限/報告先で分類 |

### 6.4 セキュリティ (SEC) — OWASP LLM (監査の最大盲点)
| ID | gap | Sev | 修正方向 |
|----|-----|-----|---------|
| SEC-01 | **文書経由 prompt injection 未モデル化** — 悪意ある PDF/OCR 文字列が AI を誤誘導 | **P0** | PDF/OCR/RAG 入力を untrusted 化、prompt isolation/instruction stripping/tool-call allowlist |
| SEC-02 | **excessive agency** — AI が API/MQ/RPA/DB に書込可能だと誤出力が直接業務更新 | **P0** | agent 権限最小化、書込 tool は承認済 command のみ、credential 金庫化、human release gate |
| SEC-03 | **PII 統制が UI マスキング止まり** (prompt/log/vector store に残る) | **P0** | PII 分類/prompt redaction/log minimization/retention TTL/vendor no-training |
| SEC-04 | raw 台帳に **field 単位 entitlement なし** (actor/confidence/policy 露出) | P1 | Observatory を監査/リスク/業務管理で権限分割、列マスキング、閲覧ログ |
| SEC-05 | **AI supply-chain integrity 不在** (model/OCR/RAG index/ルール改竄) | P1 | SBOM/MBOM、署名済 model artifact、KB index hash、deployment attestation |

### 6.5 IA/UX 構造 (UX)
| ID | gap | Sev | 修正方向 |
|----|-----|-----|---------|
| UX-01 | **横断 例外 command center 不在** (process-scoped のみ) (= DD-4.3) | P1 | SLA/例外/担当/影響度で並ぶ横断 command queue |
| UX-02 | **flywheel lineage view 不在** — 差戻し→staging→提案→手順→設定→将来案件の双方向追跡なし | **P0** | ケース起点/ルール起点の双方向 lineage graph を監査画面に |
| UX-03 | **role mode toggle が部署境界を崩す** — 画面で役割切替できる設計自体が SoD と衝突 (= D3 深掘り) | P1 | role は IdP claim + workflow assignment で決定、画面は権限結果のみ表示 |
| UX-04 | detail が **power-user 効率に欠ける** (100 項目級で全件走査が重い) | P2 | 全件可視を維持しつつ risk-ranked jump/差分 hotkey/未確認 navigation |
| UX-05 | **「今すぐ自動化停止」可視コントロールなし** — 異常時に全件確認へ即戻せない | **P0** | Agent 別 pause/force-supervised/revoke を承認付き緊急停止面に |

### 6.6 監査自身の severity 是正 (Codex 指摘、採用)
- **D13 運用/degraded を P2 → P0** (MIS-01): AI が BO 基幹に入るなら障害時継続は polish でなく本番可否条件。
- **D14 compliance を P1 → P0** (MIS-02): 規制/監査/証跡/説明可能性は後付け不可の production baseline。
- **モデルリスクを §5 P0 count に追加** (MIS-04): backend/auth と同格以上に model inventory/validation/lineage/drift/vendor が問われる。

---

## 7. E2E Coverage Matrix (MIS-03 是正 — 網羅性の honest 開示)

「網羅実走」claim を裏付ける coverage を明示。**△ = 共有 component から一般化 (個別未実走)**、**◎ = 個別実走確認**、**○ = build-phase screenshot で render 確認**。

| 画面 | 個別 E2E | 確認内容 | 未実走 (本番前に要実走) |
|------|---------|---------|----------------------|
| Hub | ◎ | nav/KPI/ProcessSelector/検索/bell/サマリ collapse | — |
| Cases | ◎ | 行 click→detail/back/row 非link/sort無/mobile崩れ | filter UI 不在のため filter 実走不能 |
| CaseDetail | ◎ | mode toggle/承認 gating/対応 modal/focus/Esc/doc 2-pane | sendback modal の category 選択別 path |
| AgentDetail | ◎ | 昇格 gating (承認率<95%→申請 disabled+title)/4 KPI/Trust chip | 申請成功 path (達成時) |
| Approvals | △ | (Cases と同一 table component) | 行→checker view 遷移、SoD link |
| Proposals | △ | (同 table component) | 行→提案詳細 |
| Agents | △ | (同 table + MiniTrend) | MiniTrend render 個別確認 |
| ProposalDetail | ○ | build-phase screenshot で 2-pane/手順 diff/根拠/footer mode | reject/sendback modal の focus/Esc (FieldActionModal と同パターンで一般化) |
| Observatory | ◎/○ | 4 view (lifecycle/ledger/metrics/knowledge) screenshot + tab click 実走 | export 後の実挙動 (toast のみ確認) |

**正直な限界**: 個別実走 = Hub/Cases/CaseDetail/AgentDetail/Observatory の 5 画面 + 共有 component。残り 4 画面 (Approvals/Proposals/Agents/ProposalDetail) は**同一 component pattern からの一般化 + screenshot** で、全操作×全権限×全状態×全 viewport の組合せは未網羅。**本番受入前に 9 画面 × 操作 × 権限 × 状態 × viewport の coverage matrix を完全実走**すること (是正計画 R0 受入 gate に追加)。

---

## 8. 改訂 Production-Readiness 判定 (Codex 反映後)

**P0 (本番不可の構造欠落) 改訂版** — 当初 6 → **拡張**:
- 永続化 (D1) / backend統合 (D2) / 認証-認可-SoD (D3) / データ整合 (D15)
- 監査書込 (D4) / **3層横断SoD (REG-01)** / **訂正取消 (REG-02)** / **閲覧ログは P1だが監査必須**
- **AI モデルリスク群 (AI-01 inventory / AI-02 lineage / AI-03 Trust検証 / AI-05 FN統制 / AI-06 vendor)**
- **LLM セキュリティ (SEC-01 prompt injection / SEC-02 excessive agency / SEC-03 PII)**
- **障害時継続 (OPS-01 degraded / OPS-02 依存map / OPS-03 冪等 / OPS-04 reflect照合 / D13→P0)**
- **flywheel lineage (UX-02) / kill switch (UX-05) / compliance baseline (D14→P0)**

**結論 (改訂)**: プロトタイプ品質は高いが、**本番業務利用には FSA モデルリスク管理原則・AI ディスカッションペーパー・Basel オペレーショナルレジリエンス・OWASP LLM・FISC 基準が要求する統制が体系的に未実装**。特に **LLM 固有リスク (prompt injection / excessive agency)** と **AI モデルガバナンス (inventory/validation/lineage/監視)** は、銀行の AI 本番審査で永続化・認証と同格の go/no-go 条件。是正計画でこれらを R3 (ガバナンス/セキュリティ) の最重量級として構築する。

---

## 監査メモ
- 本監査は localhost (GitHub Pages root と同一 build) で実施。deploy 済 build と機能同一。
- E2E は代表画面 (Hub / Cases / CaseDetail) で実走し、共有 component (TopBar / Table / Modal) の欠陥を全画面に一般化。残り 6 画面は同一 component pattern + build-phase screenshot で render 確認済。
- 次工程: Codex adversarial review で本監査の盲点・銀行特有漏れを叩き、是正計画を確定する。
