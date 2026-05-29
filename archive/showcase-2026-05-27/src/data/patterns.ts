/**
 * Pattern catalog — SSOT for showcase routes.
 *
 * Each Pattern entry embeds the research-compounder knowledge card excerpt
 * (use-when / avoid-when / audit-notes / customization / retrieval-tags / evidence /
 * freshness) so the catalog itself becomes the consumable surface of the card.
 *
 * Source files (research-compounder bindings):
 *   - knowledge/ui-design/<id>.md
 *   - samples/ui-patterns/<id>.md
 */

export type PatternStatus = 'live' | 'preview' | 'planned'
export type EvidenceStrength = 'production-safe' | 'directional' | 'unverified'
export type Freshness = 'breaking' | 'monthly' | 'quarterly' | 'stable'

export type Pattern = {
  id: string
  title: string
  tagline: string
  problem: string
  category: 'governance' | 'review' | 'evidence' | 'control' | 'overview'
  status: PatternStatus

  /** research-compounder bindings */
  knowledgeCard?: string
  sample?: string

  /** UI primitives used (primitive coverage audit) */
  primitives: string[]

  /** Figma SSOT */
  figmaNodeId?: string

  /** Knowledge card content (excerpt) */
  evidence: EvidenceStrength
  freshness: Freshness
  refreshTrigger: string
  useWhen: string[]
  avoidWhen: string[]
  auditNotes: string[]
  customization: {
    mustReplace: string[]
    mustNotChange: string[]
  }
  retrievalTags: string[]
  /** Evidence Strength rationale — 1 line */
  evidenceWhy: string
}

export const patterns: Pattern[] = [
  {
    id: 'hil-approval',
    title: 'HIL Approval',
    tagline: 'Table + Detail Drawer + 5-state Timeline',
    problem:
      'AI agent が draft を作り、human operator が承認する queue UI。actor-band / 5-state timeline / audit separation で「誰が・何時・何を・どうしたか」を 1 画面に圧縮する。',
    category: 'governance',
    status: 'live',
    knowledgeCard: 'knowledge/ui-design/ai-native-hil-approval-ui.md',
    sample: 'samples/ui-patterns/hil-approval-table-and-detail.md',
    primitives: ['Table', 'Drawer', 'TimelineDots', 'StateBadge', 'ActorBand', 'SLAChip', 'ActionBar'],
    evidence: 'production-safe',
    freshness: 'quarterly',
    refreshTrigger: 'BO 業務 vocab / SLA 値 / banking compliance second-factor 要件が変わった時',
    useWhen: [
      'AI agent が draft を作り、human が approve / reject する全 SaaS / 業務 (KYC, AML, 法人住所変更, refund 等)',
      'Actor (agent / human / system) を audit log で明示分離したい',
      '5 state (pending / approved / rejected / failed / escalated) を 1 画面に圧縮したい',
    ],
    avoidWhen: [
      'agent が単独で execute 完結する read-only workflow',
      '承認段が 1 段で済む単純 ticket (オーバースペック)',
      'banking compliance で keyboard shortcut approve を要求される文脈 (誤操作 risk)',
    ],
    auditNotes: [
      'approve の keyboard shortcut 1-stroke は banking compliance で誤操作 risk、second-factor 推奨',
      'Drawer 外クリック close は context loss、明示 close + ESC のみ',
      '5 state を 3 state に merge すると failed と rejected の recovery 不能',
      'audit log JSON dump 1 列はだめ、actor-type 別列必須',
    ],
    customization: {
      mustReplace: ['列名 (ID/type)', 'enum の JP label', 'SLA 閾値 (業務種別)', 'Action Bar primary action 数'],
      mustNotChange: ['agent UI からの approve button 追加', '5 state を 3 state へ merge', 'audit log の column 統合'],
    },
    retrievalTags: ['hil-approval', '5-state-timeline', 'actor-band', 'audit-separation', 'banking-bo', 'queue-table'],
    evidenceWhy: 'banking BO 業務 + AI agent 系で複数 PJ で deploy 経験あり、Figma + React 実装パターン確立',
  },
  {
    id: 'operator-cockpit',
    title: 'Operator Cockpit',
    tagline: '3 viewport: KPI strip + Agent grid + Detail rail',
    problem:
      'Multi-agent fleet を 1 operator が監督する cockpit。aggregate KPI / per-agent grid / selected agent drill-down を同時に持ち、intervention は T1-T4 の tier gate を通す。',
    category: 'overview',
    status: 'live',
    knowledgeCard: 'knowledge/ui-design/operator-cockpit-multi-agent-oversight-ui.md',
    sample: 'samples/ui-patterns/operator-cockpit-3-viewport-layout.md',
    primitives: ['KpiCard', 'AgentCard', 'StatusDot', 'TimelineRow', 'InterventionButton'],
    evidence: 'production-safe',
    freshness: 'monthly',
    refreshTrigger: 'Agent fleet size の運用閾値 / kill switch policy / 2-person approval 要件',
    useWhen: [
      '10+ AI agent を 1 operator が監督する fleet management',
      'aggregate KPI / per-agent grid / selected agent drill-down を同時に見せたい',
      'intervention を T1-T4 tier gate (read / local / external / critical) で扱う必要がある',
    ],
    avoidWhen: [
      'Agent が 3 以下 (single-agent dashboard で足りる)',
      'Operator が常駐せず on-call 通知のみで運用する場合 (alert-first UI へ)',
      'kill switch を視覚的に強調するだけで tier / audit / reason code を持たせない実装',
    ],
    auditNotes: [
      'Cockpit を mobile に押し込まない。mobile は alert triage + confirm に絞る',
      'Kill switch を視覚強調だけにせず tier + audit + reason code を持たせる',
      'state 爆発は Figma 静的画面では扱えない → State Matrix page を別に持つ',
      'fleet 全 agent を 1 grid に flat 化せず、status priority sort + filter',
    ],
    customization: {
      mustReplace: ['KPI 項目 (running / failed / queue / SLO)', 'agent persona name', '権限 role (operator / on-call / lead)'],
      mustNotChange: ['T1-T4 4 tier の granularity', 'detail rail に出す intervention 必須項目 (kill / pause / re-route)'],
    },
    retrievalTags: ['agent-cockpit', 'multi-agent', '3-viewport', 't1-t4-tier', 'fleet-management', 'kill-switch'],
    evidenceWhy: 'AI-native dashboard 系の標準 layout、Figma MCP agent-cockpit workflow card と同 evidence chain',
  },
  {
    id: 'diff-preview',
    title: 'Diff & Change Preview',
    tagline: 'Before / After + field-level highlight + reason capture',
    problem:
      'Agent proposal の Before / After を field-level で並べ、operator が「何が変わるか」を秒で読める形にする。承認前の最終 sanity gate。',
    category: 'review',
    status: 'live',
    knowledgeCard: 'knowledge/ui-design/diff-and-change-preview-ui.md',
    primitives: ['DiffPair', 'FieldRow', 'ReasonInput', 'ConfirmFooter'],
    evidence: 'production-safe',
    freshness: 'stable',
    refreshTrigger: 'banking BO の reason 入力必須化 policy / diff visualization tool 変更',
    useWhen: [
      'Agent proposal の Before / After を 1 画面で operator が判断する必要がある',
      'field-level に highlight して「何が変わるか」を秒で読めるようにする',
      '変更点が複数ある時、changes-only filter で集中レビューしたい',
    ],
    avoidWhen: [
      '変更が単一 field の単純承認 (overkill、inline diff で足りる)',
      'free-form text (long description) 主体の change (text diff tool へ)',
      'reason 入力を必須化せずに approve させたい (audit 観点 NG)',
    ],
    auditNotes: [
      'reason 必須は文字数 gate (10 字以上等) で UX バランス',
      '同一値の field を hide すると user が「何も変わらない」と誤解する可能性、show all を default',
      'long text の word-level diff は別 tool、本 pattern は field-level に絞る',
    ],
    customization: {
      mustReplace: ['field の label (vocabularies)', 'reason 最小文字数', 'audit attach の format'],
      mustNotChange: ['Before/After 2 列の並び', 'changed/unchanged の視覚分離'],
    },
    retrievalTags: ['diff', 'before-after', 'field-level', 'reason-capture', 'sanity-gate'],
    evidenceWhy: 'BO 系業務で繰り返し validated、文字列 diff tool より judgement use case に fit',
  },
  {
    id: 'citation-disclosure',
    title: 'Citation & Source Disclosure',
    tagline: 'Evidence panel: source / passage / freshness / boundary',
    problem:
      'Agent claim を support する citation を、staging hint と「確定 source」が混在しない形で表示する。Evidence Strength × Freshness × source tier を 1 panel で。',
    category: 'evidence',
    status: 'live',
    knowledgeCard: 'knowledge/ui-design/citation-and-source-disclosure-ui.md',
    primitives: ['SourceCard', 'FreshnessBadge', 'EvidenceTier', 'StagingDivider'],
    evidence: 'production-safe',
    freshness: 'monthly',
    refreshTrigger: '規制 audit の source tier 要件 / freshness policy / staging boundary 定義',
    useWhen: [
      'Agent の判断根拠を operator / regulator に開示する必要がある',
      'Evidence Strength (T1 primary / T2 secondary / T3 derived) × Freshness で source 信頼度を可視化',
      '確定 source と staging hint (未承認暫定 memo) を視覚分離して evidence 誤用を防ぐ',
    ],
    avoidWhen: [
      'Free-text 「自然言語の根拠説明」だけで済む文脈 (audit 観点で source URL がない)',
      'source を 1 つにまとめて要約表示 (regulator review で actor / source 不能)',
      '「AI が判断したので」と source 開示なしで approve させる (compliance 違反)',
    ],
    auditNotes: [
      'T1 / T2 / T3 を色とラベル両方で区別 (色のみは色覚多様性で fail)',
      'staging hint を citation 同列に混ぜない、明示 divider 必須',
      'freshness は label + 期間 (e.g., monthly · 1ヶ月) で意味明示',
      'source URL は必ず click 可能、screenshot only は audit 不可',
    ],
    customization: {
      mustReplace: ['tier 名 (T1/T2/T3 の社内用語化)', 'freshness 期間表記', 'staging label の社内呼称'],
      mustNotChange: ['verified / staging の divider', 'tier + freshness の 2 badge 並列'],
    },
    retrievalTags: ['citation', 'evidence-tier', 'freshness', 'staging-hint', 'source-disclosure', 'regulator-readable'],
    evidenceWhy: 'research-compounder 自体が source-ledger を持つ運用、規制 review の audit 要件に validated',
  },
  {
    id: 'action-confirmation',
    title: 'Agent Action Confirmation (T1-T4)',
    tagline: '4-tier gate: read-only / local / external / critical',
    problem:
      'Agent が取りうる action を T1 read-only から T4 critical/destructive まで 4 tier に分け、各 tier に対応する確認 UI を fixed contract として持つ。',
    category: 'control',
    status: 'live',
    knowledgeCard: 'knowledge/ui-design/agent-action-confirmation-ui.md',
    primitives: ['TierBadge', 'ConfirmDialog', 'TypedConfirm', 'AuditAttach'],
    evidence: 'production-safe',
    freshness: 'quarterly',
    refreshTrigger: '2-person approval policy / kill switch authority / 2FA fallback',
    useWhen: [
      'Agent / operator が取りうる action を read-only から critical まで 4 段階で扱う',
      '誤操作リスクと audit retention を tier ごとに揃える',
      'banking compliance で 2-person approval / second factor を明示要求される文脈',
    ],
    avoidWhen: [
      '全 action を同じ confirmation 1 通り (T1 が click 必須でフリクション過剰)',
      'T4 を visual だけ強調して typed / 2FA を省略 (誤操作で重大事故)',
      'audit attach 要件を tier に紐付けず action ごとに ad-hoc 決定',
    ],
    auditNotes: [
      'T3 の typed confirm は culture-dependent (英語 CONFIRM / 日本語 確認 / カスタム動詞)、社内 vocab に合わせる',
      'T4 の 2-person approval は別 operator の sign-off を実装、self-approval block 必須',
      'tier 数を 4 から増減させない (3 or 5 は audit retention 設計が破綻)',
    ],
    customization: {
      mustReplace: ['action label (社内 vocab)', 'typed confirm の動詞', 'audit attach の format'],
      mustNotChange: ['4 tier の境界線 (read/local/external/critical)', 'T4 の 2-person approval', 'T3 の typed confirm 必須'],
    },
    retrievalTags: ['action-confirmation', 't1-t4-tier', 'typed-confirm', '2-person-approval', 'kill-switch', 'audit-attach'],
    evidenceWhy: 'banking compliance + AI agent governance の交点で複数 PJ で validated、Figma MCP playbook 引用',
  },
  {
    id: 'audit-trail',
    title: 'Action History / Audit Trail',
    tagline: 'Timestamp × actor-type × action × before/after × reason',
    problem:
      'Compliance grade audit log。actor-type を別 column に持ち、agent / human / system を視覚分離。regulator-readable な形式を default。',
    category: 'evidence',
    status: 'live',  // demo 追加で live に昇格
    knowledgeCard: 'knowledge/ui-design/action-history-timeline-audit-trail-ui.md',
    primitives: ['AuditRow', 'ActorTypeIcon', 'TimestampCell', 'DiffSnippet'],
    evidence: 'production-safe',
    freshness: 'stable',
    refreshTrigger: 'audit retention policy / PII redaction rule / 規制 export format',
    useWhen: [
      '規制対象業務で「誰が・何時・何を・どうしたか」を不可逆 log として残す必要がある',
      'agent / human / system の actor を column 分離して compliance review 可能にする',
      'reason code + diff snippet を 1 行に圧縮、export 可能な tabular 形式が必要',
    ],
    avoidWhen: [
      '内部 debugging だけの軽い log (audit retention 不要なら overhead 過剰)',
      'free-form text dump (regulator review で actor / source / 差分が不能)',
      'PII を redact せずに full data を出す (compliance 違反)',
    ],
    auditNotes: [
      'actor-type を別 column 必須 (混在は regulator で actor 判定不能)',
      'timestamp は ISO 8601 + tz、display は localized OK だが export は raw',
      'before/after が長い時は snippet + "show full" link、1 row に dump しない',
      'PII redaction policy を pattern と別 spec で持つ',
    ],
    customization: {
      mustReplace: ['column 名 (社内 vocab)', 'reason code 体系', 'export format (CSV/XLSX/JSONL)'],
      mustNotChange: ['actor-type 別 column', 'timestamp/actor/action/before/after/reason の 6 列骨格'],
    },
    retrievalTags: ['audit-trail', 'compliance-log', 'actor-type', 'before-after', 'reason-code', 'regulator-readable'],
    evidenceWhy: 'banking + healthcare 系の標準 audit log layout、規制 export 要件で繰り返し validated',
  },
]

export function getPattern(id: string): Pattern | undefined {
  return patterns.find((p) => p.id === id)
}

export const categoryLabels: Record<Pattern['category'], string> = {
  governance: 'Governance',
  review: 'Review',
  evidence: 'Evidence',
  control: 'Control',
  overview: 'Overview',
}

export const evidenceLabels: Record<EvidenceStrength, { label: string; description: string }> = {
  'production-safe': { label: 'production-safe', description: 'primary source 確認済 + 複数源整合 + freshness 内' },
  directional: { label: 'directional', description: '業界共通知識 / craft / 強い二次源、固有数値は要再確認' },
  unverified: { label: 'unverified', description: '主張は記録、source 確認未完了' },
}

export const freshnessLabels: Record<Freshness, { label: string; period: string; weight: number }> = {
  breaking: { label: 'breaking', period: '数日〜数週', weight: 1 },
  monthly: { label: 'monthly', period: '1 ヶ月', weight: 2 },
  quarterly: { label: 'quarterly', period: '3 ヶ月', weight: 3 },
  stable: { label: 'stable', period: '1〜3 年', weight: 4 },
}

/** Aggregate stats (used by Landing 蓄積ステータス board) */
export function getCatalogStats() {
  const total = patterns.length
  const live = patterns.filter((p) => p.status === 'live').length
  const cardsBound = patterns.filter((p) => p.knowledgeCard).length
  const samplesBound = patterns.filter((p) => p.sample).length
  const productionSafe = patterns.filter((p) => p.evidence === 'production-safe').length

  const freshnessDist: Record<Freshness, number> = { breaking: 0, monthly: 0, quarterly: 0, stable: 0 }
  for (const p of patterns) freshnessDist[p.freshness] += 1

  const categoryDist = patterns.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1
    return acc
  }, {})

  const allTags = Array.from(new Set(patterns.flatMap((p) => p.retrievalTags))).length

  return { total, live, cardsBound, samplesBound, productionSafe, freshnessDist, categoryDist, allTags }
}
