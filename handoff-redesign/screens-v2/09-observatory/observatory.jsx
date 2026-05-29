// モニタリング (/observatory) — Process-First v2, typology A, 3-tab, role 監査者.
// 監査 tab = lifecycle view (業務順) + raw ledger view (confidence は本 view のみ可)。
// data: mock-fixture §8 (lifecycle) / §9 (ledger) / §5 (metrics) / §10 (日次提案分析)。
const { useState } = React;

/* §8: lifecycle events (業務順) */
const LIFECYCLE = [
  { t: '2026-05-31 09:00', actor: 'システム', role: 'system', tone: 'inset',   title: '受付', body: '申請書類を受け付けました。' },
  { t: '2026-05-31 09:02', actor: 'AI 担当 Agent', role: 'AI', tone: 'primary', title: 'AI 入力', body: '申請書類を読み取り、登録情報と照合して値を生成しました。' },
  { t: '2026-05-31 10:15', actor: '山田太郎', role: '入力者', tone: 'alert',     title: '入力者確認', body: 'ビル名を申請書類の値で確定し、他の項目を確認しました。' },
  { t: '2026-05-31 11:30', actor: '鈴木課長', role: '承認者', tone: 'success',   title: '承認者承認', body: '入力者の確認結果と申請書類を確認し、最終承認しました。' },
  { t: '2026-05-31 11:31', actor: 'システム', role: 'system', tone: 'inset',     title: '反映', body: '登録情報を更新しました。' },
];

/* §9: raw event ledger (exportable schema, confidence は本 view のみ) */
const LEDGER = [
  { ts: '2026-05-31 09:00:04', actor: 'system',       role: 'system',  action: 'intake',          ba: '—',                                       doc: 'CASE-2026-0142.pdf',     pol: '—',     appr: '—',       conf: '—' },
  { ts: '2026-05-31 09:02:11', actor: 'agent-corp-addr', role: 'AI',    action: 'ai_input',        ba: '(値生成) 法人名/新住所/支店/効力日/ビル名', doc: 'CASE-2026-0142.pdf P.2', pol: 'v3.1',  appr: '—',       conf: '法人名 0.98 / 住所 0.95 / ビル名 0.84' },
  { ts: '2026-05-31 10:15:42', actor: '山田太郎',     role: 'inputter', action: 'field_override',  ba: 'ビル名: サンプルビル → サンプルビルディング', doc: 'CASE-2026-0142.pdf P.2', pol: 'v3.1',  appr: '—',       conf: '—' },
  { ts: '2026-05-31 11:30:08', actor: '鈴木課長',     role: 'approver', action: 'business_approve', ba: 'status: 確認済 → 承認済',                  doc: '—',                      pol: 'v3.1',  appr: 'A-7731',  conf: '—' },
  { ts: '2026-05-31 11:31:00', actor: 'system',       role: 'system',  action: 'reflect',          ba: 'master 更新',                              doc: '—',                      pol: 'v3.1',  appr: 'A-7731',  conf: '—' },
];

/* §5: Process 別 KPI */
const KPI_CORP = [
  { metricLabel: 'AI 入力承認率', actualValue: '92%', threshold: '≥ 95%', judgment: '未達 (-3pt)', achieved: false, period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 +2pt' },
  { metricLabel: '人手上書き率', actualValue: '0.12', threshold: '≤ 0.15', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 -0.01' },
  { metricLabel: 'Alert 発生率', actualValue: '0.08', threshold: '≤ 0.10', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 ±0' },
  { metricLabel: '承認者差戻し率', actualValue: '0.05', threshold: '≤ 0.07', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '1,140 件', previousDelta: '前月 -0.01' },
];
const KPI_ACCT = [
  { metricLabel: 'AI 入力承認率', actualValue: '96%', threshold: '≥ 95%', judgment: '達成 (+1pt)', achieved: true, period: '直近 30 日', denominator: '820 件', previousDelta: '前月 +1pt' },
  { metricLabel: '人手上書き率', actualValue: '0.09', threshold: '≤ 0.15', judgment: '達成', achieved: true, period: '直近 30 日', denominator: '820 件', previousDelta: '前月 ±0' },
];

/* ナレッジ (Process 別 grouping) */
const KNOWLEDGE = [
  { process: '法人住所変更', icon: 'building', items: [
    { t: '法人住所変更フロー',   id: 'KB-FLOW-022', v: 'v3.1' },
    { t: '番地表記正規化ルール', id: 'KB-RULE-008', v: 'v1.4' },
    { t: '効力発生日設定基準',   id: 'KB-RULE-014', v: 'v2.0' },
  ]},
  { process: '口座開設書類完備', icon: 'wallet', items: [
    { t: '口座開設書類チェックリスト', id: 'KB-FLOW-031', v: 'v2.2' },
    { t: '本人確認書類の有効期限基準', id: 'KB-RULE-019', v: 'v1.1' },
  ]},
];

/* ---------- Tab 1: 監査 ---------- */
function AuditTab() {
  const [view, setView] = useState('lifecycle');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="seg">
          <button aria-pressed={view === 'lifecycle'} onClick={() => setView('lifecycle')}>案件の経過</button>
          <button aria-pressed={view === 'ledger'} onClick={() => setView('ledger')}>証跡台帳 (詳細)</button>
        </div>
        <div className="caption" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span className="mono" style={{ color: 'var(--fg)' }}>CASE-2026-0142</span> 法人住所変更
        </div>
      </div>

      {view === 'lifecycle' ? (
        <section className="panel" style={{ padding: '18px 20px' }}>
          <h2 className="h2" style={{ margin: 0, marginBottom: 16 }}>案件の経過 (業務の流れ順)</h2>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', position: 'relative' }}>
            {LIFECYCLE.map((e, i) => (
              <li key={i} style={{ display: 'grid', gridTemplateColumns: '160px 24px 1fr', gap: 12, paddingBottom: i < LIFECYCLE.length - 1 ? 18 : 0 }}>
                <div style={{ textAlign: 'right', paddingTop: 1 }}>
                  <div className="mono caption" style={{ color: 'var(--fg)' }}>{e.t}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ width: 12, height: 12, borderRadius: 6, border: '2px solid ' + (e.tone === 'primary' ? 'var(--primary)' : e.tone === 'alert' ? 'var(--alert)' : e.tone === 'success' ? 'var(--success)' : 'var(--border-strong)'), background: 'var(--panel)', flex: '0 0 auto', marginTop: 2 }} />
                  {i < LIFECYCLE.length - 1 && <span style={{ flex: 1, width: 0, borderLeft: '1.5px solid var(--border)', marginTop: 2 }} />}
                </div>
                <div style={{ paddingBottom: 2 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{e.title}</span>
                    <MetaChip tone={e.tone === 'inset' ? undefined : e.tone}>{e.role}</MetaChip>
                    <span className="caption">{e.actor}</span>
                  </div>
                  <div className="caption" style={{ marginTop: 3 }}>{e.body}</div>
                </div>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MetaChip tone="success" icon="shield">職務分離 ✓</MetaChip>
            <span className="caption">入力者 <strong style={{ color: 'var(--fg)', fontWeight: 500 }}>山田太郎</strong> と承認者 <strong style={{ color: 'var(--fg)', fontWeight: 500 }}>鈴木課長</strong> は別人です。</span>
          </div>
        </section>
      ) : (
        <section className="panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 className="h2" style={{ margin: 0 }}>証跡台帳</h2>
              <div className="caption" style={{ marginTop: 2 }}>監査用の詳細記録。出力 (エクスポート) 可能な形式です。</div>
            </div>
            <Btn size="sm" icon="doc">エクスポート</Btn>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, minWidth: 980 }}>
              <thead>
                <tr style={{ background: 'var(--panel-inset)' }}>
                  {['時刻', 'actor', 'role', 'action', 'before → after', '参照文書', 'policy', 'approval id', 'confidence (監査用)'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: 'var(--fg-muted)', fontSize: 10.5, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LEDGER.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }} className="mono">{r.ts}</td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }} className="mono">{r.actor}</td>
                    <td style={{ padding: '8px 10px' }}>{r.role}</td>
                    <td style={{ padding: '8px 10px' }} className="mono">{r.action}</td>
                    <td style={{ padding: '8px 10px' }}>{r.ba}</td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }} className="mono">{r.doc}</td>
                    <td style={{ padding: '8px 10px' }} className="mono">{r.pol}</td>
                    <td style={{ padding: '8px 10px' }} className="mono">{r.appr}</td>
                    <td style={{ padding: '8px 10px' }} className="mono">{r.conf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)' }}>
            <span className="caption">confidence は監査記録としてこの台帳にのみ残し、業務画面には表示しません。</span>
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- Tab 2: メトリクス (Process 別) ---------- */
function MetricsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 className="h3" style={{ marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="building" size={14} color="var(--fg-muted)" /> 法人住所変更
        </h2>
        <MetricVsThreshold title="AI 精度・処理 KPI" subtitle="この業務の直近 30 日の実績" rows={KPI_CORP} />
      </div>
      <div>
        <h2 className="h3" style={{ marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="wallet" size={14} color="var(--fg-muted)" /> 口座開設書類完備
        </h2>
        <MetricVsThreshold title="AI 精度・処理 KPI" subtitle="この業務の直近 30 日の実績" rows={KPI_ACCT} />
      </div>
    </div>
  );
}

/* ---------- Tab 3: ナレッジ (Process 別 grouping) ---------- */
function KnowledgeTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--primary-soft)', border: '1px solid #C7D2FE' }}>
        <Icon name="sparkles" size={16} color="var(--primary-hover)" />
        <span className="caption" style={{ color: 'var(--fg)' }}>
          日次提案分析が差戻しパターンから手順改定の提案を生成しています。提案は「AI 提案レビュー」で確認できます。
        </span>
      </div>
      {KNOWLEDGE.map((g) => (
        <section key={g.process} className="panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name={g.icon} size={16} color="var(--fg-muted)" />
            <h2 className="h2" style={{ margin: 0 }}>{g.process}</h2>
            <MetaChip style={{ marginLeft: 'auto' }}>承認済 {g.items.length} 件</MetaChip>
          </div>
          {g.items.map((it, i) => (
            <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderTop: i ? '1px solid var(--border)' : 'none' }}>
              <span style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--success-soft)', color: 'var(--success-soft-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                <Icon name="check" size={14} strokeWidth={2.2} />
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{it.t}</span>
              <span className="mono caption">{it.id} · {it.v}</span>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

/* ---------- App ---------- */
function App() {
  const [tab, setTab] = useState('audit');
  const TABS = [
    { k: 'audit',     label: '監査' },
    { k: 'metrics',   label: 'メトリクス' },
    { k: 'knowledge', label: 'ナレッジ' },
  ];
  return (
    <div className="app-shell" style={{ gridTemplateAreas: '"side main"' }}>
      <Sidebar active="observatory" />
      <main style={{ gridArea: 'main', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <TopBar processLabel="全業務" />

        <header className="sticky-top" style={{ minHeight: 72, padding: '14px 24px 0', background: 'var(--panel)', borderBottom: '1px solid var(--border)', top: 44 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <h1 className="h1" style={{ margin: 0 }}>モニタリング</h1>
            <span className="caption">Process 別に証跡・AI 精度・ナレッジを監視 (read-only)</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {TABS.map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{
                padding: '8px 16px', border: 'none', background: 'transparent',
                fontSize: 13, fontWeight: tab === t.k ? 600 : 500,
                color: tab === t.k ? 'var(--primary-hover)' : 'var(--fg-muted)',
                borderBottom: '2px solid ' + (tab === t.k ? 'var(--primary)' : 'transparent'),
                cursor: 'pointer', marginBottom: -1,
              }}>{t.label}</button>
            ))}
          </div>
        </header>

        <div style={{ flex: 1, padding: 20, background: 'var(--canvas)', maxWidth: 1080 }}>
          {tab === 'audit' && <AuditTab />}
          {tab === 'metrics' && <MetricsTab />}
          {tab === 'knowledge' && <KnowledgeTab />}
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
