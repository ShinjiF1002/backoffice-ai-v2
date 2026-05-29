// エージェント一覧 (/agents) — Process-First v2, typology B ★新設, role AI 管理者.
// data: mock-fixture §1 (2 Agent) / §5 (承認率)。row click → エージェント詳細。
const { useState } = React;

/* Trust Level badge tone */
const TRUST = {
  Supervised: { tone: 'inset',   desc: '全件を人が確認' },
  Checkpoint: { tone: 'primary', desc: '高信頼は自動、要確認のみ人' },
  Autonomous: { tone: 'success', desc: '原則すべて自動' },
};

/* §1 + §5 */
const AGENTS = [
  {
    id: 'agent-corporate-address-change', name: '法人住所変更 Agent', process: '法人住所変更', icon: 'building',
    trust: 'Supervised',
    rate: 92, spark: [88, 89, 90, 90, 91, 90, 92], // 直近 30 日 承認率推移 (mock)
    promote: { ok: false, reason: '承認率が基準 95% に未達のため昇格保留' },
    detail: '../08-agent-detail/AgentDetail.html',
  },
  {
    id: 'agent-account-opening', name: '口座開設書類完備 Agent', process: '口座開設書類完備', icon: 'wallet',
    trust: 'Supervised',
    rate: 96, spark: [93, 94, 94, 95, 95, 96, 96],
    promote: { ok: true, reason: '全指標が基準達成 — 昇格を申請可' },
    detail: '#',
  },
];

/* ---------- Sparkline (承認率 30日 mock) ---------- */
function Sparkline({ data, ok }) {
  const w = 96, h = 28, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const color = ok ? 'var(--success)' : 'var(--alert)';
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

function PromoteCell({ p }) {
  if (p.ok) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <MetaChip tone="success" icon="check">申請可</MetaChip>
        <span className="caption">{p.reason}</span>
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <MetaChip tone="alert" icon="alert">保留</MetaChip>
      <span className="caption">{p.reason}</span>
    </span>
  );
}

function App() {
  const [hover, setHover] = useState(null);
  return (
    <div className="app-shell" style={{ gridTemplateAreas: '"side main"' }}>
      <Sidebar active="agents" />
      <main style={{ gridArea: 'main', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <TopBar processLabel="全業務" />

        <header className="sticky-top" style={{ minHeight: 72, padding: '14px 24px', background: 'var(--panel)', borderBottom: '1px solid var(--border)', top: 44 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <h1 className="h1" style={{ margin: 0 }}>Agent 設定 — エージェント一覧</h1>
            <span className="caption"><span className="mono" style={{ color: 'var(--fg)' }}>{AGENTS.length}</span> 件</span>
          </div>
          <div className="caption" style={{ marginTop: 4 }}>業務別 AI Agent の自動化レベルと直近のパフォーマンス</div>
        </header>

        <div style={{ flex: 1, padding: 16, background: 'var(--canvas)' }}>
          <div className="panel" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 150px 160px 1.6fr 40px', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--panel-inset)' }}>
              {['Agent 名', '業務', '自動化レベル', '直近の承認率', '昇格の可否', ''].map((h, i) => (
                <span key={i} className="caption" style={{ fontWeight: 600, color: 'var(--fg-muted)', fontSize: 11 }}>{h}</span>
              ))}
            </div>
            {AGENTS.map((a) => (
              <a
                key={a.id}
                href={a.detail}
                onMouseEnter={() => setHover(a.id)}
                onMouseLeave={() => setHover(null)}
                style={{
                  display: 'grid', gridTemplateColumns: '1.4fr 1fr 150px 160px 1.6fr 40px', gap: 12,
                  padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center',
                  textDecoration: 'none', color: 'var(--fg)',
                  background: hover === a.id ? 'var(--panel-inset)' : 'transparent',
                  transition: 'background 150ms var(--ease)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--panel-inset)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                    <Icon name="agent" size={15} color="var(--fg-muted)" />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</span>
                </span>
                <span style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Icon name={a.icon} size={14} color="var(--fg-subtle)" />
                  {a.process}
                </span>
                <span>
                  <MetaChip tone={TRUST[a.trust].tone}>{a.trust}</MetaChip>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Sparkline data={a.spark} ok={a.promote.ok} />
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: a.promote.ok ? 'var(--success-soft-fg)' : 'var(--alert-soft-fg)' }}>{a.rate}%</span>
                </span>
                <PromoteCell p={a.promote} />
                <span style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--fg-subtle)' }}>
                  <Icon name="arrowRight" size={16} />
                </span>
              </a>
            ))}
          </div>
          <div className="caption" style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="agent" size={13} color="var(--fg-subtle)" />
            行をクリックで実績 (4 指標) と昇格の帰結を確認できます · 承認率は <span className="chip meta" style={{ fontSize: 10 }}>仮説/要検証</span> mock 値
          </div>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
