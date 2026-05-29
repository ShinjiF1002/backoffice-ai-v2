// 提案一覧 (/proposals) — Process-First v2, typology B ★新設, role Manual 管理者.
// data: mock-fixture §6 (PROP-2026-031) + 同種 synthetic。
// 「日次提案分析」表記 (cron / trigger は使わない)。row click → 提案詳細。
const { useState } = React;

const STATUS = {
  triage:    { jp: '確認待ち',     tone: 'primary' },
  forwarded: { jp: '上長へ送付済', tone: 'slate' },
};

const PROPOSALS = [
  {
    id: 'PROP-2026-031', process: '法人住所変更', icon: 'building',
    change: '住所読み取りの判定基準を厳しめに調整',
    detail: '誤りの見逃しを減らすため、自動確定の基準を引き上げ、判断が微妙なものは人の確認に回す',
    impact: 12, status: 'triage', generated: '2026-05-31', recommended: true,
  },
  {
    id: 'PROP-2026-029', process: '法人住所変更', icon: 'building',
    change: '効力発生日の自動補完ルールを追加',
    detail: '申請書類に効力発生日の記載がない場合の補完手順を整備',
    impact: 6, status: 'forwarded', generated: '2026-05-28',
  },
  {
    id: 'PROP-2026-024', process: '口座開設書類完備', icon: 'wallet',
    change: '本人確認書類の有効期限チェックを強化',
    detail: '期限切れ間近の書類を早めに要確認へ振り分ける',
    impact: 9, status: 'triage', generated: '2026-05-27',
  },
];

const FILTERS = [
  { k: 'all',       label: 'すべて' },
  { k: 'triage',    label: '確認待ち' },
  { k: 'forwarded', label: '上長へ送付済' },
];

function App() {
  const [filter, setFilter] = useState('all');
  const [hover, setHover] = useState(null);
  const rows = PROPOSALS.filter((p) => filter === 'all' ? true : p.status === filter);

  return (
    <div className="app-shell" style={{ gridTemplateAreas: '"side main"' }}>
      <Sidebar active="proposals" />
      <main style={{ gridArea: 'main', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <TopBar processLabel="全業務" />

        <header className="sticky-top" style={{ minHeight: 72, padding: '14px 24px', background: 'var(--panel)', borderBottom: '1px solid var(--border)', top: 44 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <h1 className="h1" style={{ margin: 0 }}>AI 提案レビュー — 提案一覧</h1>
            <span className="caption"><span className="mono" style={{ color: 'var(--fg)' }}>{PROPOSALS.length}</span> 件</span>
          </div>
          <div className="caption" style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="sparkles" size={13} color="var(--fg-subtle)" />
            日次提案分析が差戻しパターンから生成した、手順改定の候補
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            {FILTERS.map((f) => {
              const n = f.k === 'all' ? PROPOSALS.length : PROPOSALS.filter((p) => p.status === f.k).length;
              return (
                <FilterChip key={f.k} pressed={filter === f.k} onClick={() => setFilter(f.k)}>
                  {f.label} <span className="mono" style={{ marginLeft: 4, fontWeight: 600 }}>{n}</span>
                </FilterChip>
              );
            })}
          </div>
        </header>

        <div style={{ flex: 1, padding: 16, background: 'var(--canvas)' }}>
          <div className="panel" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 150px 1fr 120px 130px 40px', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--panel-inset)' }}>
              {['提案 ID', '業務', 'どの部分の改定か', '影響件数', '状態', ''].map((h, i) => (
                <span key={i} className="caption" style={{ fontWeight: 600, color: 'var(--fg-muted)', fontSize: 11 }}>{h}</span>
              ))}
            </div>
            {rows.map((p) => (
              <a
                key={p.id}
                href="../06-proposal-detail/ProposalDetail.html"
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                style={{
                  display: 'grid', gridTemplateColumns: '150px 150px 1fr 120px 130px 40px', gap: 12,
                  padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center',
                  textDecoration: 'none', color: 'var(--fg)',
                  background: p.recommended ? 'var(--primary-soft)' : hover === p.id ? 'var(--panel-inset)' : 'transparent',
                  borderLeft: p.recommended ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'background 150ms var(--ease)',
                }}
              >
                <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{p.id}</span>
                <span style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Icon name={p.icon} size={14} color="var(--fg-subtle)" />
                  {p.process}
                </span>
                <span style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.change}</div>
                  <div className="caption" style={{ marginTop: 2 }}>{p.detail}</div>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{p.impact}</span>
                  <span className="caption">case 相当</span>
                </span>
                <span><StatusBadge tone={STATUS[p.status].tone}>{STATUS[p.status].jp}</StatusBadge></span>
                <span style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--fg-subtle)' }}>
                  <Icon name="arrowRight" size={16} />
                </span>
              </a>
            ))}
            {rows.length === 0 && <div style={{ padding: 40, textAlign: 'center' }} className="caption">該当する提案はありません</div>}
          </div>
          <div className="caption" style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--primary)' }} />
            影響件数が大きく確認待ちの提案を上に推奨 — 行をクリックで実績値と改定の影響を確認
          </div>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
