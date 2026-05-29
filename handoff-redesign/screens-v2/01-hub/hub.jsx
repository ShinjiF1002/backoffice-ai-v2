// Hub (/) — Process-First v2, typology A.
// data: mock-fixture §3 (status 分布) + §5 (metric). status は業務語に翻訳。
const { useState } = React;

/* status enum → 業務語 (UI には enum を出さない) */
const STATUS_JP = {
  pending: '受付済',
  ready: '確認待ち',
  'sent-back': '差戻し再処理',
  'business-approval-waiting': '承認待ち',
  reflected: '反映済',
};

/* mock-fixture §3 */
const PROCESSES = [
  {
    id: 'UC-BO-01', name: '法人住所変更', icon: 'building',
    agent: 'Supervised', approvalRate: 92, approvalRateOk: false,
    dist: { pending: 2, ready: 3, 'sent-back': 1, 'business-approval-waiting': 1, reflected: 1 },
    total: 8,
  },
  {
    id: 'UC-BO-02', name: '口座開設書類完備', icon: 'wallet',
    agent: 'Supervised', approvalRate: null, approvalRateOk: null,
    dist: { pending: 1, ready: 2, 'business-approval-waiting': 1, reflected: 1 },
    total: 5,
  },
];

/* Headline KPI — §3 から導出 (要対応の注意 = 確認待ち+差戻し再処理 / 承認待ち = business-approval-waiting) */
function attentionCount(p)  { return (p.dist['ready'] || 0) + (p.dist['sent-back'] || 0); }
function approvalCount(p)   { return p.dist['business-approval-waiting'] || 0; }

const HEADLINE = [
  {
    key: 'attention',
    label: '要対応の注意',
    icon: 'alert', tone: 'alert',
    total: PROCESSES.reduce((s, p) => s + attentionCount(p), 0),
    breakdown: PROCESSES.map((p) => ({ name: p.name, n: attentionCount(p) })),
    drill: '確認待ち・差戻し再処理の案件を見る',
    hypothetical: false,
  },
  {
    key: 'sla',
    label: 'SLA 経過',
    icon: 'clock', tone: 'alert',
    total: 1,
    breakdown: [{ name: '法人住所変更', n: 1 }, { name: '口座開設書類完備', n: 0 }],
    drill: '経過時間の長い案件を見る',
    hypothetical: true,
  },
  {
    key: 'approval',
    label: '承認待ち',
    icon: 'inboxStack', tone: 'primary',
    total: PROCESSES.reduce((s, p) => s + approvalCount(p), 0),
    breakdown: PROCESSES.map((p) => ({ name: p.name, n: approvalCount(p) })),
    drill: '承認待ちの案件を見る',
    hypothetical: false,
  },
];

/* ---------- KPI card ---------- */
function KpiCard({ kpi }) {
  const toneColor = kpi.tone === 'alert' ? 'var(--alert)' : kpi.tone === 'primary' ? 'var(--primary)' : 'var(--fg)';
  const toneSoft  = kpi.tone === 'alert' ? 'var(--alert-soft)' : kpi.tone === 'primary' ? 'var(--primary-soft)' : 'var(--panel-inset)';
  return (
    <a href="#" className="panel" style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      padding: 16, textDecoration: 'none', color: 'var(--fg)',
      transition: 'border-color 150ms var(--ease), box-shadow 150ms var(--ease)',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 6, background: toneSoft, color: toneColor, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={kpi.icon} size={16} color={toneColor} />
          </span>
          <span className="h2">{kpi.label}</span>
        </div>
        <Icon name="arrowRight" size={16} color="var(--fg-subtle)" />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span className="mono" style={{ fontSize: 32, fontWeight: 600, lineHeight: 1, color: toneColor }}>{kpi.total}</span>
        <span className="caption">件</span>
        {kpi.hypothetical && <span className="chip meta" style={{ marginLeft: 4, fontSize: 10 }}>仮説/要検証</span>}
      </div>
      {/* Process breakdown tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {kpi.breakdown.map((b) => (
          <span key={b.name} className="chip meta" style={{ fontSize: 11 }}>
            {b.name} <span className="mono" style={{ fontWeight: 600, marginLeft: 2 }}>{b.n}</span>
          </span>
        ))}
      </div>
      <div className="caption" style={{ color: 'var(--fg-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {kpi.drill}
      </div>
    </a>
  );
}

/* ---------- Process status card ---------- */
function ProcessCard({ p, urgent }) {
  const order = ['ready', 'business-approval-waiting', 'sent-back', 'pending', 'reflected'];
  const toneOf = { ready: 'alert', 'business-approval-waiting': 'primary', 'sent-back': 'alert', pending: 'inset', reflected: 'success' };
  return (
    <section className="panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--panel-inset)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={p.icon} size={18} color="var(--fg-muted)" />
          </span>
          <div>
            <h3 className="h1" style={{ fontSize: 16, margin: 0 }}>{p.name}</h3>
            <span className="caption">案件 <span className="mono" style={{ color: 'var(--fg)', fontWeight: 600 }}>{p.total}</span> 件</span>
          </div>
        </div>
        {urgent && <MetaChip tone="alert" icon="alert">要対応あり</MetaChip>}
      </div>

      {/* status breakdown */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {order.filter((s) => p.dist[s]).map((s) => (
          <div key={s} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 'var(--r-control)',
            background: 'var(--panel-inset)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 4, background:
              toneOf[s] === 'alert' ? 'var(--alert)' : toneOf[s] === 'primary' ? 'var(--primary)' : toneOf[s] === 'success' ? 'var(--success)' : 'var(--fg-subtle)' }} />
            <span style={{ fontSize: 12 }}>{STATUS_JP[s]}</span>
            <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{p.dist[s]}</span>
          </div>
        ))}
      </div>

      {/* agent + approval rate */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="agent" size={15} color="var(--fg-muted)" />
          <span className="caption">担当 Agent</span>
          <MetaChip tone="primary">{p.agent}</MetaChip>
        </div>
        {p.approvalRate != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="caption">承認率</span>
            <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: p.approvalRateOk ? 'var(--success-soft-fg)' : 'var(--alert-soft-fg)' }}>{p.approvalRate}%</span>
            {!p.approvalRateOk && <MetaChip tone="alert">基準 95% 未達</MetaChip>}
            <span className="chip meta" style={{ fontSize: 10 }}>仮説/要検証</span>
          </div>
        )}
      </div>

      {/* drill actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn size="sm" iconRight="arrowRight" href="../02-cases/Cases.html">案件一覧へ</Btn>
        <Btn size="sm" variant="ghost" iconRight="arrowRight" href="#">Agent 設定へ</Btn>
      </div>
    </section>
  );
}

/* ---------- PrimaryAnchor ---------- */
function PrimaryAnchor() {
  return (
    <a href="../03-approvals/Approvals.html" style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 20px',
      background: 'var(--primary)', color: 'var(--primary-fg)',
      borderRadius: 'var(--r-card)', textDecoration: 'none',
      boxShadow: '0 2px 8px rgba(99, 91, 255, 0.25)',
    }}>
      <span style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.16)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
        <Icon name="bolt" size={20} color="#fff" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 500, letterSpacing: 0.5 }}>最優先のアクション</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>法人住所変更の承認待ち 1 件を確認</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>入力者確認が完了し、承認者の最終承認を待っています</div>
      </div>
      <Icon name="arrowRight" size={20} color="#fff" />
    </a>
  );
}

/* ---------- App ---------- */
function App() {
  const [diagOpen, setDiagOpen] = useState(false);
  return (
    <div className="app-shell" style={{ gridTemplateAreas: '"side main"' }}>
      <Sidebar active="hub" />
      <main style={{ gridArea: 'main', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <TopBar processLabel="全業務" />

        {/* Header */}
        <header className="sticky-top" style={{ minHeight: 72, padding: '16px 24px', background: 'var(--panel)', borderBottom: '1px solid var(--border)', top: 44, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 className="h1" style={{ margin: 0, fontSize: 20 }}>ハブ</h1>
            <div className="caption" style={{ marginTop: 2 }}>業務別の注意点と次のアクション</div>
          </div>
          <div className="caption">最終更新 <span className="mono">2026-05-31 11:42</span></div>
        </header>

        {/* Body */}
        <div style={{ flex: 1, padding: 24, background: 'var(--canvas)', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1120 }}>
          {/* PrimaryAnchor */}
          <PrimaryAnchor />

          {/* Headline KPI */}
          <div>
            <h2 className="h3" style={{ marginBottom: 10 }}>全業務の注意 — クリックで該当画面へ</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {HEADLINE.map((k) => <KpiCard key={k.key} kpi={k} />)}
            </div>
          </div>

          {/* Process cards */}
          <div>
            <h2 className="h3" style={{ marginBottom: 10 }}>業務別の状況</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {PROCESSES.map((p) => <ProcessCard key={p.id} p={p} urgent={attentionCount(p) > 0} />)}
            </div>
          </div>

          {/* Diagnostic L3 */}
          <section className="panel" style={{ padding: '12px 16px' }}>
            <Disclosure open={diagOpen} onToggle={() => setDiagOpen(!diagOpen)} header="今日の処理サマリ" level="">
              <div className="caption" style={{ paddingTop: 8, lineHeight: 1.8 }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <span>本日の受付 <span className="mono" style={{ color: 'var(--fg)', fontWeight: 600 }}>13</span> 件</span>
                  <span>反映済 <span className="mono" style={{ color: 'var(--fg)', fontWeight: 600 }}>2</span> 件</span>
                  <span>差戻し再処理 <span className="mono" style={{ color: 'var(--fg)', fontWeight: 600 }}>1</span> 件</span>
                  <span className="chip meta" style={{ fontSize: 10 }}>仮説/要検証</span>
                </div>
              </div>
            </Disclosure>
          </section>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
