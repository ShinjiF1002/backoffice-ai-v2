# claude-design-bundle — claude.ai/design 用 self-contained bundle

> 残 5 画面 (Queue / CaseDetail / ProposalDetail / AgentDetail / Observatory) を claude.ai/design で wireframe + mockup 生成するための **drag-and-drop ready** な 1 folder bundle。

## 中身 (20 file)

```
claude-design-bundle/
├── README.md                                       # 本 file
├── context/                                        # 9 file — 一度だけ Project に upload
│   ├── 01-design-system.md                         # Operational Premium Light token / chip / chrome
│   ├── 02-ia-overview.md                           # 6 画面 / 5 nav / 3 typology / Disclosure 規範
│   ├── 03-disclosure-rules.md                      # L1/L2/L3/L4 段階規範
│   ├── 04-jp-vocabulary.md                         # Tier 1 / 2 語彙、規制語回避
│   ├── 05-visual-reference.md                      # 旧 prototype 9 画面 改善 narrative
│   ├── 06-charter-summary.md                       # Design Charter v1.0 (4 原則 / 4 IA / 4 layer)
│   ├── 07-research-compounder-refs.md              # 3 card 違反 mapping
│   ├── 08-prototype-current-reference.md           # 旧 9 画面 visual inventory (ASCII layout)
│   └── 09-operational-premium-light-contact-sheet.md  # token contact sheet (再提示)
└── prompts/                                        # 10 file — 1 画面 1 session で paste
    ├── 02-queue-wireframe.md                       # Queue (Inbox 後継) Wireframe
    ├── 02-queue-mockup.md                          # Queue Mockup
    ├── 03-case-detail-wireframe.md                 # CaseDetail Wireframe
    ├── 03-case-detail-mockup.md                    # CaseDetail Mockup
    ├── 04-proposal-detail-wireframe.md
    ├── 04-proposal-detail-mockup.md
    ├── 05-agent-detail-wireframe.md
    ├── 05-agent-detail-mockup.md
    ├── 06-observatory-wireframe.md
    └── 06-observatory-mockup.md
```

---

## Setup 判断 (2 通り)

### 案 A: 既存 Project (Hub pilot 済) に追加

Hub pilot で使った同 Claude Design Project に **`prompts/` の 10 file だけ** を upload (or paste 都度)。context は Project に既に register 済み (Hub pilot 時の Step 1+2 で恒久 register)。

**スキップ**: `context/` 配下 9 file (再 upload 不要)。

### 案 B: 新規 Project に clean slate で

新規 Claude Design Project を作成し、`context/` の 9 file を一度 upload してから `prompts/` を順次 paste。Hub pilot の知見をリセットしたい時のみ採用。

---

## 進行手順 (案 A 推奨、既存 Project)

### Step 1: 残 5 画面を順次進める (各画面 ~25-30 分、計 ~2-2.5 時間)

画面順: **02-queue → 03-case-detail → 04-proposal-detail → 05-agent-detail → 06-observatory**

各画面で以下を **2 session** に分けて実行:

#### 1a. Wireframe session

1. claude.ai/design で 既 Project 内に **New Session** 作成、mode = **"Wireframe"** 選択
2. `prompts/NN-{page}-wireframe.md` の中身を全選択 + paste
3. 生成された wireframe (mono color / 基本形状) を Acceptance check で判定
4. NG なら inline edit、OK なら export → file 名は `{page}-wireframe-output.html` 推奨

#### 1b. Mockup session

1. claude.ai/design で 同 Project 内に **New Session** 作成、mode = **"High Fidelity"** 選択
2. `prompts/NN-{page}-mockup.md` の中身を全選択 + paste
3. 同 Project 共有 context で wireframe が継承される (再 attach 不要)
4. polished mockup の Acceptance check で判定
5. OK なら export → file 名は `{page}-mockup-output.html` 推奨

#### 1c. 私 (Claude Code) に投げる

各画面の 2 file (wireframe-output.html + mockup-output.html) を `~/Downloads/` に保存後、本 chat で **"saved to downloads. please check"** と一言投げてください。Hub pilot と同 flow で verify + `0N-{page}/wireframe-output.html` + `mockup-output.html` に配置します。

### Step 2: 5 画面完了後

5 画面 × 2 file = 10 file の HTML が `~/code/active/backoffice-ai-v2/handoff-redesign/0N-{page}/` 配下に揃ったら、Phase 2 (React 化) に移行。

私 (Claude Code) に **"残 5 画面の export 揃いました、Phase 2 に進んでください"** と投げれば、`handoff-redesign/99-claude-code-handoff/phase-2-instructions.md` の依頼文を起動して `prototype-redesign/` で React 化を開始します。

---

## paste 順 cheat sheet (1 画面ずつ)

| # | 画面 | wireframe paste | mockup paste |
|---|---|---|---|
| 1 | Queue | [02-queue-wireframe.md](prompts/02-queue-wireframe.md) | [02-queue-mockup.md](prompts/02-queue-mockup.md) |
| 2 | CaseDetail | [03-case-detail-wireframe.md](prompts/03-case-detail-wireframe.md) | [03-case-detail-mockup.md](prompts/03-case-detail-mockup.md) |
| 3 | ProposalDetail | [04-proposal-detail-wireframe.md](prompts/04-proposal-detail-wireframe.md) | [04-proposal-detail-mockup.md](prompts/04-proposal-detail-mockup.md) |
| 4 | AgentDetail | [05-agent-detail-wireframe.md](prompts/05-agent-detail-wireframe.md) | [05-agent-detail-mockup.md](prompts/05-agent-detail-mockup.md) |
| 5 | Observatory | [06-observatory-wireframe.md](prompts/06-observatory-wireframe.md) | [06-observatory-mockup.md](prompts/06-observatory-mockup.md) |

---

## 注意

- prompts/ の冒頭 2 行は **session 作成時の mode 選択 + Project 共有 context 経由の wireframe 継承** 注記が含まれます (Hub pilot で確定した patch 反映済)
- context/ は Hub pilot で Project に register 済の内容と同一 (差分なし)
- 案 A 推奨 (既存 Project 継続)。案 B (新規 Project) は context 全 9 file の re-upload + 再 register 必要
- 出典: 本 bundle は `~/code/active/backoffice-ai-v2/handoff-redesign/` から snapshot copy、source の変更は本 bundle に反映されない (Phase 1B/1C 進行中は bundle 不変前提)
