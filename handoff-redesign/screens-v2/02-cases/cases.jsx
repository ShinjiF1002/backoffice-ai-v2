// 案件一覧 (/cases) — Process-First v2, typology B.
// data: mock-fixture §3 (UC-BO-01 法人住所変更 8 件、status 分布厳守)。
// row click → drawer (default 非表示)、drawer の「詳細を開く」→ CaseDetail。
const { useState } = React;

/* status (業務語) → tone + filter group */
const STATUS = {
  pending:   { jp: '受付済',       tone: 'inset',   group: 'other' },
  ready:     { jp: '確認待ち',     tone: 'primary', group: 'review' },
  sentback:  { jp: '差戻し再処理', tone: 'alert',   group: 'review' },
  approval:  { jp: '承認待ち',     tone: 'slate',   group: 'other' },
  reflected: { jp: '反映済',       tone: 'success', group: 'done' },
};

/* §3: pending 2 / ready 3 / sent-back 1 / business-approval-waiting 1 / reflected 1 = 8 件 */
const CASES = [
  { id: 'CASE-2026-0142', status: 'ready',     elapsed: '1時間20分', owner: '山田太郎', flags: 1, recommended: true,
    change: { field: '新住所', from: '東京都千代田区丸の内 1 丁目 1 番 1 号', to: '東京都千代田区丸の内 2 丁目 3 番 5 号' }, attentionField: 'ビル名' },
  { id: 'CASE-2026-0145', status: 'ready',     elapsed: '38分',      owner: '山田太郎', flags: 2,
    change: { field: '新住所', from: '大阪市北区梅田 1-2', to: '大阪市北区梅田 3-4-5' }, attentionField: 'ビル名 / 効力発生日' },
  { id: 'CASE-2026-0139', status: 'ready',     elapsed: '2時間05分', owner: '山田太郎', flags: 0,
    change: { field: '新住所', from: '名古屋市中区栄 2-1', to: '名古屋市中区栄 4-1-1' } },
  { id: 'CASE-2026-0131', status: 'sentback',  elapsed: '4時間12分', owner: '山田太郎', flags: 0, reprocessing: true,
    change: { field: '法人名', from: '株式会社旧商号', to: '株式会社サンプル商事' } },
  { id: 'CASE-2026-0128', status: 'approval',  elapsed: '5時間30分', owner: '鈴木課長', flags: 0,
    change: { field: '新住所', from: '福岡市博多区 1-1', to: '福岡市博多区博多駅前 2-2-2' } },
  { id: 'CASE-2026-0150', status: 'pending',   elapsed: '8分',       owner: '—',
    change: null },
  { id: 'CASE-2026-0149', status: 'pending',   elapsed: '14分',      owner: '—',
    change: null },
  { id: 'CASE-2026-0120', status: 'reflected', elapsed: '昨日 16:40', owner: '山田太郎', flags: 0,
    change: { field: '新住所', from: '札幌市中央区 1-2', to: '札幌市中央区大通西 3-1' } },
];

const FILTERS = [
  { k: 'all',       label: 'すべて' },
  { k: 'ready',     label: '確認待ち' },
  { k: 'sentback',  label: '差戻し再処理' },
  { k: 'approval',  label: '承認待ち' },
  { k: 'pending',   label: '受付済' },
  { k: 'reflected', label: '反映済' },
];

/* ---------- Attention summary cell ---------- */
function AttentionCell({ c }) {
  if (c.status === 'pending') return <span className="caption subtle">AI 処理待ち</span>;
  if (c.status === 'sentback') return <span className="caption subtle">AI 再処理中</span>;
  if (c.status === 'reflected') return <span className="caption" style={{ color: 'var(--success-soft-fg)' }}>完了</span>;
  if (c.flags > 0) return <MetaChip tone="alert" icon="alert">要確認 {c.flags} 項目</MetaChip>;
  return <MetaChip tone="success" icon="check">全項目一致</MetaChip>;
}

/* ---------- Drawer ---------- */
function CaseDrawer({ c, onClose }) {
  const open = !!c;
  return (
    <div aria-hidden={!open} style={{ position: 'fixed', inset: 0, zIndex: 90, pointerEvents: open ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.30)', opacity: open ? 1 : 0, transition: 'opacity 200ms var(--ease)' }} />
      <aside style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '92vw',
        background: 'var(--panel)', borderLeft: '1px solid var(--border)', boxShadow: '-12px 0 32px rgba(15,23,42,0.12)',
        transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 250ms var(--ease)',
        display: 'flex', flexDirection: 'column',
      }}>
        {c && (<>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div className="mono" style={{ fontSize: 15, fontWeight: 600 }}>{c.id}</div>
              <div className="caption" style={{ marginTop: 2 }}>法人住所変更 · 担当 {c.owner}</div>
            </div>
            <Btn variant="ghost" size="xs" icon="x" onClick={onClose}>閉じる</Btn>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="caption">状態</span>
              <StatusBadge tone={STATUS[c.status].tone}>{STATUS[c.status].jp}</StatusBadge>
              <span className="caption" style={{ marginLeft: 'auto' }}>経過 <span className="mono" style={{ color: 'var(--fg)' }}>{c.elapsed}</span></span>
            </div>

            {/* 何が変わったか */}
            {c.change && (
              <section className="panel" style={{ padding: 12 }}>
                <div className="h3" style={{ marginBottom: 8, color: 'var(--fg)' }}>何が変わったか</div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>{c.change.field}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 12, color: 'var(--diff-del-fg)', background: 'var(--diff-del-bg)', borderRadius: 4, padding: '4px 8px' }}>− {c.change.from}</div>
                  <div style={{ fontSize: 12, color: 'var(--diff-add-fg)', background: 'var(--diff-add-bg)', borderRadius: 4, padding: '4px 8px' }}>＋ {c.change.to}</div>
                </div>
              </section>
            )}

            {/* 要確認サマリ */}
            <section className="panel" style={{ padding: 12 }}>
              <div className="h3" style={{ marginBottom: 8, color: 'var(--fg)' }}>確認状況</div>
              {c.status === 'pending' ? (
                <div className="caption">AI が入力処理中です。完了後に確認できます。</div>
              ) : c.status === 'sentback' ? (
                <div className="caption">差戻し後、AI が再処理しています。完了後に再び確認待ちに入ります。</div>
              ) : c.flags > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MetaChip tone="alert" icon="alert">要確認 {c.flags} 項目</MetaChip>
                  <span className="caption">{c.attentionField}</span>
                </div>
              ) : (
                <MetaChip tone="success" icon="check">全項目が申請書類と一致</MetaChip>
              )}
            </section>
          </div>
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--panel-inset)', display: 'flex', justifyContent: 'flex-end' }}>
            <Btn variant="primary" iconRight="arrowRight" href="../04-case-detail/CaseDetail.html">詳細を開く</Btn>
          </div>
        </>)}
      </aside>
    </div>
  );
}

/* ---------- App ---------- */
function App() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const rows = CASES.filter((c) => filter === 'all' ? true : c.status === filter);

  return (
    <div className="app-shell" style={{ gridTemplateAreas: '"side main"' }}>
      <Sidebar active="queue" />
      <main style={{ gridArea: 'main', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <TopBar processLabel="法人住所変更" />

        {/* Header */}
        <header className="sticky-top" style={{ minHeight: 72, padding: '14px 24px', background: 'var(--panel)', borderBottom: '1px solid var(--border)', top: 44 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <h1 className="h1" style={{ margin: 0 }}>受信トレイ — 案件一覧</h1>
            <span className="caption">法人住所変更 · <span className="mono" style={{ color: 'var(--fg)' }}>{CASES.length}</span> 件</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map((f) => {
              const n = f.k === 'all' ? CASES.length : CASES.filter((c) => c.status === f.k).length;
              return (
                <FilterChip key={f.k} pressed={filter === f.k} onClick={() => setFilter(f.k)}>
                  {f.label} <span className="mono" style={{ marginLeft: 4, fontWeight: 600 }}>{n}</span>
                </FilterChip>
              );
            })}
          </div>
        </header>

        {/* Table */}
        <div style={{ flex: 1, padding: 16, background: 'var(--canvas)' }}>
          <div className="panel" style={{ overflow: 'hidden' }}>
            {/* header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 120px 110px 110px 150px 40px', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--panel-inset)' }}>
              {['案件 ID', '業務', '状態', '経過時間', '担当', '確認サマリ', ''].map((h, i) => (
                <span key={i} className="caption" style={{ fontWeight: 600, color: 'var(--fg-muted)', fontSize: 11 }}>{h}</span>
              ))}
            </div>
            {/* rows */}
            {rows.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                style={{
                  display: 'grid', gridTemplateColumns: '150px 1fr 120px 110px 110px 150px 40px', gap: 12,
                  padding: '12px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center',
                  cursor: 'pointer',
                  background: c.recommended ? 'var(--alert-soft)' : 'transparent',
                  borderLeft: c.recommended ? '3px solid var(--alert)' : '3px solid transparent',
                  transition: 'background 150ms var(--ease)',
                }}
                onMouseEnter={(e) => { if (!c.recommended) e.currentTarget.style.background = 'var(--panel-inset)'; }}
                onMouseLeave={(e) => { if (!c.recommended) e.currentTarget.style.background = 'transparent'; }}
              >
                <span className="mono" style={{ fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {c.recommended && <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--alert)', flex: '0 0 auto' }} />}
                  {c.id}
                </span>
                <span style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="building" size={14} color="var(--fg-subtle)" />
                  法人住所変更
                </span>
                <span><StatusBadge tone={STATUS[c.status].tone}>{STATUS[c.status].jp}</StatusBadge></span>
                <span className="mono caption" style={{ fontSize: 12 }}>{c.elapsed}</span>
                <span style={{ fontSize: 12 }}>{c.owner}</span>
                <span><AttentionCell c={c} /></span>
                <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <a href="../04-case-detail/CaseDetail.html" onClick={(e) => e.stopPropagation()} title="詳細を開く" style={{ display: 'inline-flex', color: 'var(--fg-subtle)' }}>
                    <Icon name="arrowRight" size={16} />
                  </a>
                </span>
              </div>
            ))}
            {rows.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center' }} className="caption">該当する案件はありません</div>
            )}
          </div>

          {/* recommended hint */}
          <div className="caption" style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--alert)' }} />
            次に処理を推奨する案件 — 行をクリックで概要、詳細で確認・承認できます
          </div>
        </div>
      </main>

      <CaseDrawer c={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
