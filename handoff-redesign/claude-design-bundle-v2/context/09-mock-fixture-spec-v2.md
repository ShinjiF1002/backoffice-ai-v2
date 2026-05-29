# Mock Fixture Spec v2 (Claude Design 固定数値)

> Claude Design が prompt 量産時に**勝手な数字を作らない**よう、全 mock 値を固定する。すべて **mock / synthetic**、実銀行データ非投入 (`claude-design-upload-manifest.md`)。

## 1. 業務 Process (2)

| ID | 名称 | Agent |
|---|---|---|
| UC-BO-01 | 法人住所変更 | agent-corporate-address-change |
| UC-BO-02 | 口座開設書類完備 | agent-account-opening |

(国際送金等の restricted boundary は UI / mock に含めない)

## 2. role (6、mock 担当者名)

入力者 山田太郎 / 承認者 鈴木課長 / Manual 管理者 佐藤 / 業務責任者 田中部長 / AI 管理者 高橋 / 監査者 渡辺

## 3. 案件 status 分布 (UC-BO-01)

pending 2 / ready 3 / sent-back 1 / business-approval-waiting 1 / reflected 1 (計 8 件)
UC-BO-02: pending 1 / ready 2 / business-approval-waiting 1 / reflected 1 (計 5 件)

## 4. field review examples (CASE-2026-0142、ReconcilePanel)

| field | AI 値 | OCR raw | 正規化 | master | reconcile state |
|---|---|---|---|---|---|
| 法人名 | 株式会社サンプルHD | 株式会社サンプルＨＤ | 株式会社サンプルHD | 株式会社サンプルHD | **一致** (正規化後) |
| 新住所 | 東京都千代田区丸の内 2 丁目 3 番 5 号 | 千代田区丸の内２－３－５ | 東京都千代田区丸の内 2 丁目 3 番 5 号 | (新規、master なし) | **正規化一致** |
| 支店コード | 042 | 042 | 042 | 042 | **一致** |
| 効力発生日 | 2026-06-15 | 2026-06-15 | 2026-06-15 | — | **一致** |
| ビル名 | サンプルビル | サンプルビルディング | サンプルビルディング | サンプルビル | **要確認** (AI=master だが OCR 異なる、独立ソース突合で検出) |

→ pilot で「要確認 1 / 正規化一致 1 / 一致 3」の混在を見せ、ReconcilePanel の 6 状態を実証。要確認の「ビル名」は confidence では拾えない (AI も OCR も高 confidence だが値が違う = 独立ソース突合で検出)。

## 5. metric values (Agent KPI、すべて `[仮説 / 要検証]` mock)

| 指標 | 実績値 | 閾値 | 判定 | 期間 | 分母 | 前回差 |
|---|---|---|---|---|---|---|
| AI 入力承認率 | 92% | ≥ 95% | 未達 (-3pt) | 直近 30 日 | 1,240 件 | 前月 +2pt |
| 人手上書き率 | 0.12 | ≤ 0.15 | 達成 | 直近 30 日 | 1,240 件 | 前月 -0.01 |
| Alert 発生率 | 0.08 | ≤ 0.10 | 達成 | 直近 30 日 | 1,240 件 | 前月 ±0 |
| 承認者差戻し率 | 0.05 | ≤ 0.07 | 達成 | 直近 30 日 | 1,140 件 | 前月 -0.01 |

→ 1 指標 (承認率) のみ未達 = Trust 昇格は「承認率が閾値到達するまで保留」が示せる。

## 6. proposal before-after (PROP-2026-031)

| 項目 | 値 |
|---|---|
| 提案 | OCR 信頼度閾値 0.85 → 0.88 引き上げ |
| 適用対象 | UC-BO-01 OCR 抽出、過去 12 case 相当 |
| 判定基準 vs 実績 | 「番地表記精度 > 0.90」: 実測 0.93 達成 / 「影響 ≤ 20 case」: 12 件 達成 |
| trade-off | 閾値↑ → 見逃し↓ (人確認に多く回す) / 誤検知 (過剰要確認)↑ |
| 非遡及 | 既存承認済 case には適用しない |

## 7. agent trust consequence (Supervised → Checkpoint)

| 項目 | before | after |
|---|---|---|
| review coverage | 全件人レビュー (80 件/日) | 高信頼度自動、人は要確認のみ (~30 件/日) |
| 自動入力 | 0 件/日 | ~50 件/日 |
| rollback | — | 承認率が 7 日連続で閾値割れ → Supervised 自動降格 |

## 8. audit lifecycle events (CASE-2026-0142、業務順、Observatory lifecycle view)

| # | 時刻 | actor | event | 内容 |
|---|---|---|---|---|
| 1 | 2026-05-31 09:00 | system | 受付 | PDF intake |
| 2 | 2026-05-31 09:02 | Agent (AI) | **AI 入力** | OCR 抽出 + master 照合 + 値生成 (AI 入力時刻明示、R-OBS-02) |
| 3 | 2026-05-31 10:15 | 入力者 山田太郎 | 入力者確認 | reconcile 4 field accept + ビル名 override |
| 4 | 2026-05-31 11:30 | 承認者 鈴木課長 | **承認者承認** | 最終承認 (R-OBS-02 で承認者 event 追加) |
| 5 | 2026-05-31 11:31 | system | 反映 | master 更新 (mock) |

→ 旧の論理矛盾 (Human 確認後に AI が OCR、承認者 event 欠落) を解消。AI 入力時刻明示 + 承認者承認を業務順に。

## 9. raw event ledger (Observatory raw view、exportable schema)

各 event: `timestamp / actor / role / action / before-after / source_doc / policy_version / approval_id / ocr_confidence (audit metadata)`
→ confidence は raw ledger (監査 view) でのみ表示、業務 UI (ReconcilePanel) では非表示。

## 10. 日次提案分析 (cron trigger 置換、R-OBS-03)

「日次提案分析」(毎日 02:00 自動実行)。**内部用語「cron trigger」は UI に出さない**。Observatory では「日次提案分析が N 件の差戻しパターンから提案を生成」と業務語で表示。

## 11. 申請書類 mock (CASE-2026-0142、CaseDetail 左 pane の文書ビューア)

CaseDetail rev.3 の文書アンカー型 layout 用。**faux PDF (実 PDF 非投入、synthetic な届出フォーム描画)**。明朝体 (Noto Serif JP)、3 ページ構成、現在表示 = P.2。

**法人住所変更届 — P.2 / 3 (記載内容)**

| 欄 | 記載値 (申請書類 = OCR raw 相当) | 対応 field | 該当 field の状態 |
|---|---|---|---|
| 法人名 | 株式会社サンプルＨＤ (全角) | 法人名 | 一致 (正規化後) |
| 支店コード | 042 | 支店コード | 一致 |
| 新住所 | 千代田区丸の内２－３－５ | 新住所 | 一致 (正規化後) |
| ビル名 (住所欄内) | サンプル**ビルディング**８Ｆ | ビル名 | **要確認** (該当欄を枠ハイライト) |
| 効力発生日 | 2026-06-15 | 効力発生日 | 一致 |
| 押印 / 署名欄 | (押印済の枠、内容描画は簡略) | — | — |

- **ハイライト欄**: 住所欄 (ビル名行) を amber 枠 + ラベルで強調 = 右 pane の「要確認: ビル名」と相互リンク。
- ページ: P.1 = 申請者情報 (簡略)、P.2 = 変更内容 (上表、default 表示)、P.3 = 添付・確認欄 (簡略)。ページ送りは P.1-3 を切替可 (中身は P.2 のみ詳細、他は枠のみで可)。
- **実顧客名・実住所は使わない** (「株式会社サンプルHD」「丸の内2-3-5」等の synthetic のみ)。

## 利用規範

Claude Design prompt の "Data" section は本 fixture の値のみ使う。prompt に明示のない数値を Claude Design が生成した場合、本 fixture に照らして修正。
モニタリング画面 (旧 Observatory) の UI ラベルは「モニタリング」、spec/route 内部名は `Observatory` を維持 (本 fixture §8/§9 の「Observatory ... view」は内部名)。
