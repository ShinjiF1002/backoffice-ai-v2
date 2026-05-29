# ⚠️ SUPERSEDED (履歴・実装入力にしない) — Phase 2 target structure

> **本 file は Phase 2 React 実装の入力にしない (Contract Freeze)。**
> 以下は旧 plan revision の `PageShell + 3 Body + 5 nav (`/queue`) + legacy-ready + 6 route + 旧 bundle` scaffold 案で、**superseded**。
> 現行の正準・実装入力は:
> - **計画**: `~/.claude/plans/hashed-conjuring-spark.md` の「Phase 2 — React 集約 & 新規正準」
> - **canonical**: `00-shared/canonical-design-spec.md` (prototype/ デザイン層継承 + lucide + status-tones.ts + 9 画面 6-nav grouped + 4 cross-cutting)
> - **chrome SSOT**: `00-shared/ia-overview-v2.md` §2 (6-nav grouped、`/cases` 等)
> - **pixel-parity reference**: `screens-v2/0N-*/canonical-export.md`
>
> 下記の旧 scaffold 記述 (PageShell / 5 nav / `/queue` / legacy-ready / 6 route) は **historical**。React 実装では canonical-design-spec.md に従うこと。

---

<details><summary>(旧 scaffold 案、履歴・参考のみ)</summary>

# (旧) Phase 2 target structure — `prototype-redesign/` の最終 file 構造 (前 plan revision の知見を継承)

> 本 file は Phase 2 起動時 (Claude Code が `phase-2-instructions.md` を受領後) に参照する scaffold spec。旧 plan revision (案 B 修正 5 点反映版) の React scaffold 内容を保存。

## Vite project scaffold (Phase 1 で作る)

**配置**: `/Users/shinjifujiwara/code/active/backoffice-ai-v2/prototype-redesign/`

旧 `prototype/` の scaffold を snapshot copy + name 変更で sibling project を作る。`node_modules/` は新規 install (旧と独立)。

### File 構造

```
prototype-redesign/
├── CLAUDE.md               # 新 IA SSOT (9 画面 / typology lock / Disclosure 規範、現行は ../00-shared/ia-overview-v2.md + screen-contracts-v2.md)
├── README.md               # port 5174 / 並走目的 / 9 画面 route 説明
├── package.json            # 旧 copy、name="prototype-redesign"
├── package-lock.json       # ★ 旧 copy (install drift 防止)
├── vite.config.ts          # 旧 copy + port: 5174, strictPort: true
├── tsconfig.json
├── tsconfig.app.json       # 旧 copy
├── tsconfig.node.json      # 旧 copy
├── eslint.config.js        # 旧 copy
├── index.html              # 旧 copy + title="Backoffice AI v2 — Redesign Prototype"
├── .gitignore              # 旧 copy
├── scripts/
│   └── check-no-op.mjs     # ★ 旧 copy (package.json `check:no-op` 参照先)
└── src/
    ├── main.tsx            # 旧 copy
    ├── App.tsx             # 9 routes (現行 SSOT ia-overview-v2.md。横断 component ProcessSelector/ReconcilePanel/MetricVsThreshold/ConsequencePanel 追加、詳細は Phase 2 session で screens-v2 + spec から精緻化)
    ├── index.css           # 旧 @theme inline を snapshot copy (token keep)
    ├── components/
    │   ├── shell/
    │   │   ├── PageShell.tsx       # ★ Phase 2 で実装
    │   │   ├── HubBody.tsx         # ★ Phase 2、A 型
    │   │   ├── QueueBody.tsx       # ★ Phase 2、B 型
    │   │   ├── DetailBody.tsx      # ★ Phase 2、C 型
    │   │   ├── Sidebar.tsx         # 旧 Sidebar.tsx を 5 nav に再編
    │   │   ├── TopBar.tsx          # 旧をそのまま copy
    │   │   └── AppShell.tsx        # 旧をそのまま copy
    │   └── shared/
    │       ├── PrototypeModeLabel.tsx
    │       ├── StatusBadge.tsx
    │       ├── MetaChip.tsx
    │       ├── ActorBand.tsx
    │       ├── Sparkline.tsx
    │       ├── Disclosure.tsx
    │       ├── EmptyState.tsx
    │       ├── LoadingState.tsx
    │       ├── PrimaryAnchor.tsx   # ★ Phase 2 新設 (旧 NextActionStrip 昇格)
    │       └── legacy-ready/       # ★ Wave 2 / Gate 1 由来 primitive 温存
    │           ├── DiffPreviewBlock.tsx     # Phase 5 (CaseDetail) で再評価
    │           ├── MetadataStrip.tsx        # Phase 6 (ProposalDetail) 流用候補
    │           └── TrustLevelBadge.tsx      # Phase 7 (AgentDetail) 流用候補
    ├── pages/
    │   ├── Hub.tsx                 # Phase 1: placeholder、Phase 3 で本実装
    │   ├── Queue.tsx               # Phase 1: placeholder、Phase 4 で本実装
    │   ├── CaseDetail.tsx          # Phase 1: placeholder、Phase 5 で本実装
    │   ├── ProposalDetail.tsx      # Phase 1: placeholder、Phase 6 で本実装
    │   ├── AgentDetail.tsx         # Phase 1: placeholder、Phase 7 で本実装
    │   └── Observatory.tsx         # Phase 1: placeholder、Phase 8 で本実装
    ├── data/                       # 旧 data/ から snapshot copy (drift 検出のため)
    │   ├── types.ts
    │   ├── mock-cases.ts
    │   ├── mock-knowledge.ts
    │   ├── mock-agents.ts
    │   ├── mock-audit.ts
    │   ├── mock-metrics.ts
    │   └── mock-proposals.ts
    └── lib/                        # 旧 lib/ から snapshot copy
        ├── cn.ts
        ├── elapsed.ts
        ├── status-tones.ts
        ├── actor-mapping.ts        # ★ ActorBand keep の必須依存
        └── (他、Phase 2 で必要なもののみ pull)
```

### 旧 shared/ から drop する 8 file (再評価不要)

`BusinessApprovalChip.tsx` / `DetailDrawer.tsx` (QueueBody 内で再実装) / `DisabledAction.tsx` (Disclosure / footer hint に置換) / `ErrorState.tsx` (EmptyState variant) / `FilterChip.tsx` (filter は L3 Disclosure 化) / `HypothesisChip.tsx` (Header 1 chip 規範) / `NextActionStrip.tsx` (PrimaryAnchor.tsx に rename + 昇格) / `PageFooter.tsx` (`<PageShell.Footer>` 統合) / `PageHelpDisclosure.tsx` (Disclosure 統合)

## Phase 2 で実装する primitive

### PageShell.tsx (★ 中核)

```tsx
type PageShellType = 'hub' | 'queue' | 'detail'

interface PageShellProps {
  type: PageShellType
  children: React.ReactNode
}

// Sub-components: PageShell.Header, PageShell.PrimaryAnchor, PageShell.Body, PageShell.Footer
// 規範 (runtime dev assert + grep gate で保証、TypeScript 強制ではない):
//  - Header: breadcrumb + h1 + 1 chip まで (chip 複数禁止 dev assert)
//  - PrimaryAnchor: 1 画面 1 つ (Children.toArray でカウント、dev mode で 2 個以上 console.error + dev banner)
//  - Body: type discriminated union、HubBody / QueueBody / DetailBody を内側で switch
//  - Footer: caption: ReactNode 1 つ only (action 禁止、TS 型で caption only)
```

### HubBody.tsx (A 型)

```tsx
interface HubBodyProps {
  headline: HeadlineKpi[]    // length 3-5、runtime assert
  drill: DrillCard[]         // 2-3 個
  diagnostic?: React.ReactNode  // Disclosure で wrapped
}
```

### QueueBody.tsx (B 型)

```tsx
interface QueueBodyProps<T> {
  rows: T[]
  columns: ColumnDef<T>[]
  recommendedRowId?: string  // alert-soft highlight
  renderDrawer: (row: T) => React.ReactNode
}
```

### DetailBody.tsx (C 型)

```tsx
interface DetailBodyProps {
  primary: React.ReactNode  // 7/12 col
  aux: React.ReactNode      // 5/12 col
}
```

### PrimaryAnchor.tsx (旧 NextActionStrip 昇格)

```tsx
interface PrimaryAnchorProps {
  label: string
  summary?: string
  actionHref: string
  actionLabel?: string  // default: "開く"
}
// 規範: 1 画面 1 つ、PageShell.PrimaryAnchor slot にのみ使用
```

### Disclosure.tsx (旧 copy + PageHelpDisclosure 統合)

L3 (default closed) / L4 (Observatory tab 内側で permanently expanded option) を prop で表現。

### Sidebar.tsx 再編 (5 nav)

```tsx
const navItems = [
  { to: '/',           label: 'ハブ',        icon: LayoutDashboard },
  { to: '/queue',      label: '受信トレイ',   icon: InboxIcon },
  { to: '/proposals/PROP-2026-031', label: 'AI 提案レビュー', icon: Sparkles, activePrefix: '/proposals/' },
  { to: '/agents/agent-corporate-address-change', label: 'Agent 設定', icon: Cog, activePrefix: '/agents/' },
  { to: '/observatory?tab=audit', label: '観測', icon: Gauge, activePrefix: '/observatory' },
]
// CaseDetail は Queue row click から navigate、sidebar 非表示
```

## App.tsx routes (6 + 1 child)

```tsx
function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/" replace />} />
        <Route path="/" element={<Hub />} />
        <Route path="queue" element={<Queue />} />
        <Route path="cases/:id" element={<CaseDetail />} />
        <Route path="cases/:id/comment" element={<CaseDetail />} />  {/* section 切替で同 page */}
        <Route path="proposals/:id" element={<ProposalDetail />} />
        <Route path="agents/:id" element={<AgentDetail />} />
        <Route path="observatory" element={<Observatory />} />
      </Route>
    </Routes>
  )
}
```

## Mechanical gates (Phase 1+2 完了判定)

```bash
cd ~/code/active/backoffice-ai-v2/prototype-redesign

# 1. Scaffold 健全性
npm ci
npm run dev   # port 5174、旧 5173 と並走
npm run build
npm run check:all

# 2. PrimaryAnchor 1 画面 1 つ規範
for f in src/pages/*.tsx; do
  count=$(grep -c '<PageShell.PrimaryAnchor' "$f" || true)
  test "$count" -le 1 || { echo "VIOLATION: $f has $count PrimaryAnchor"; exit 1; }
done

# 3. Header chip 1 つ規範
grep -rEn '<PageShell\.Header[^/]*chip=' src/pages/ | awk -F: '{print $1":"$2}' | sort | uniq -c | awk '$1>1{print "VIOLATION:", $0; exit 1}'

# 4. 旧 primitive 残存 = 0
grep -rn 'PageFooter\|NextActionStrip\|HypothesisChip\|PageHelpDisclosure' src/pages/ src/components/shell/ src/components/shared/ \
  | grep -v 'legacy-ready/' \
  && { echo "VIOLATION: 旧 primitive 残存"; exit 1; } || true

# 5. Typology lock
for f in src/pages/*.tsx; do
  count=$(grep -cE 'type="(hub|queue|detail)"' "$f")
  test "$count" -eq 1 || { echo "VIOLATION: $f has $count typology"; exit 1; }
done

# 6. legacy-ready/ は build に含まれるが、Phase 1+2 では未使用
grep -rn "from.*legacy-ready" src/pages/ src/components/shell/ \
  && { echo "VIOLATION: legacy-ready/ from non-Phase 3-7 location"; exit 1; } || true

# 7. 旧 prototype 不変性
cd ~/code/active/backoffice-ai-v2
git status --porcelain prototype/ > /tmp/handoff-after.txt
diff /tmp/handoff-baseline.txt /tmp/handoff-after.txt
# 出力空 = pass
```

## Phase 構成 (Phase 1-9)

| Phase | scope | session 想定 |
|---|---|---|
| **Phase 1** | scaffold (Vite project + 6 routes 骨 + token / mock data snapshot + chrome) | ★ phase-2-instructions paste で起動 |
| **Phase 2** | primitive (`<PageShell>` + 3 Body 型 + Disclosure + PrimaryAnchor + legacy-ready 温存) | ★ phase-2-instructions paste で起動 |
| Phase 3 | Hub 実装 + mockup pixel parity | 別 session |
| Phase 4 | Queue + Table + Drawer | 別 session |
| Phase 5 | CaseDetail + child route section 切替 | 別 session |
| Phase 6 | ProposalDetail | 別 session |
| Phase 7 | AgentDetail | 別 session |
| Phase 8 | Observatory (3-tab) | 別 session |
| Phase 9 | Final QC (Mechanical gates 再実行 + pixel parity + Charter sign-off + baseline diff) | 別 session |

各 Phase 3-9 は前 Phase 完了後、Claude Code 別 session で起動 (依頼文は per-Phase に user が書く)。

## 注: 本 file 自体は handoff bundle ではない

Claude Design の handoff bundle は `99-claude-code-handoff/bundle/` 配下に user が保存 (Phase 1A/B/C 完了時)。本 `target-structure.md` は Phase 2 の React scaffold spec のみ。Phase 3 以降の per-screen 実装は bundle + mockup-output.html + spec.md (handoff-redesign/0N-{page}/) を主 input とする。

</details>

> (再掲) 上記 `<details>` 内は **superseded、実装入力にしない**。現行は `canonical-design-spec.md` + plan「Phase 2 — React 集約」。
