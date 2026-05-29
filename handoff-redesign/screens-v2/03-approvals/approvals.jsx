// 承認待ち (/approvals) — Process-First v2, typology B ★新設, role 承認者.
// data: mock-fixture §3 (business-approval-waiting: UC-BO-01 1 件 / UC-BO-02 1 件)。
// row click → CaseDetail 承認者 mode (?mode=checker)。SoD (承認者 ≠ 入力者) 明示。
const { useState } = React;

const CASES = [
  {
    id: 'CASE-2026-0142', process: '法人住所変更', icon: 'building',
    inputter: '山田太郎', approver: '鈴木課長',
    judgement: 'modified',          // 承認 / 修正あり
    modifiedCount: 1, modifiedField: 'ビル名',
    resolvedAll: true,
    elapsed: '32分',
  },
  {
    id: 'CASE-2026-0118', process: '口座開設書類完備', icon: 'wallet',
    inputter: '山田太郎', approver: '鈴木課長',
    judgement: 'approved',          // 修正なしで確認
    modifiedCount: 0, modifiedField: null,
    resolvedAll: true,
    elapsed: '1時間05分',
  },
];

/* ---------- 入力者の判断 cell ---------- */
function JudgementCell({ c }) {
  if (c.judgement === 'modified') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <MetaChip tone="primary" icon="pencil-dot" style={{ alignSelf: 'flex-start' }}>修正あり {c.modifiedCount} 件</MetaChip>
        <span className="caption">{c.modifiedField} を申請書類値で確定</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <MetaChip tone="success" icon="check" style={{ alignSelf: 'flex-start' }}>確認のみ (修正なし)</MetaChip>
      <span className="caption">全項目を確認し承認</span>
    </div>
  );
}

/* ---------- 確認結果サマリ cell ---------- */
function ResultCell({ c }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        <Icon name="check-circle" size={14} color="var(--success-soft-fg)" />
        要確認は解消済
      </span>
      <span className="caption">
        {c.modifiedCount > 0 ? `修正 ${c.modifiedCount} 件 / 残り全項目一致` : '全項目が申請書類と一致'}
      </span>
    </div>
  );
}

/* ---------- App ---------- */
function App() {
  const [hover, setHover] = useState(null);
  return (
    <div className="app-shell" style={{ gridTemplateAreas: '"side main"' }}>
      <Sidebar active="approvals" />
      <main style={{ gridArea: 'main', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <TopBar processLabel="全業務" />

        {/* Header */}
        <header className="sticky-top" style={{ minHeight: 72, padding: '14px 24px', background: 'var(--panel)', borderBottom: '1px solid var(--border)', top: 44 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <h1 className="h1" style={{ margin: 0 }}>承認待ち</h1>
            <span className="caption"><span className="mono" style={{ color: 'var(--fg)' }}>{CASES.length}</span> 件</span>
          </div>
          <div className="caption" style={{ marginTop: 4 }}>入力者が確認済の案件を最終承認します</div>
        </header>

        {/* Body */}
        <div style={{ flex: 1, padding: 16, background: 'var(--canvas)' }}>
          {/* SoD banner */}
          <div className="panel" style={{ padding: '10px 14px', marginBottom: 12, background: 'var(--primary-soft)', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="shield" size={16} color="var(--primary-hover)" />
            <span style={{ fontSize: 13, color: 'var(--primary-hover)', fontWeight: 500 }}>
              職務分離 — あなた (承認者 鈴木課長) は、自分が入力した案件は承認できません。
            </span>
          </div>

          <div className="panel" style={{ overflow: 'hidden' }}>
            {/* header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '150px 150px 1fr 1fr 220px 90px 40px', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--panel-inset)' }}>
              {['案件 ID', '業務', '入力者の判断', '確認結果サマリ', '担当 (入力者 → 承認者)', '経過', ''].map((h, i) => (
                <span key={i} className="caption" style={{ fontWeight: 600, color: 'var(--fg-muted)', fontSize: 11 }}>{h}</span>
              ))}
            </div>
            {/* rows */}
            {CASES.map((c) => {
              const url = `../04-case-detail/CaseDetail.html?mode=checker`;
              return (
                <a
                  key={c.id}
                  href={url}
                  onMouseEnter={() => setHover(c.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    display: 'grid', gridTemplateColumns: '150px 150px 1fr 1fr 220px 90px 40px', gap: 12,
                    padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center',
                    textDecoration: 'none', color: 'var(--fg)',
                    background: hover === c.id ? 'var(--panel-inset)' : 'transparent',
                    transition: 'background 150ms var(--ease)',
                  }}
                >
                  <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{c.id}</span>
                  <span style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon name={c.icon} size={14} color="var(--fg-subtle)" />
                    {c.process}
                  </span>
                  <JudgementCell c={c} />
                  <ResultCell c={c} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <span>{c.inputter}</span>
                    <Icon name="arrowRight" size={13} color="var(--fg-subtle)" />
                    <strong style={{ fontWeight: 600 }}>{c.approver}</strong>
                    <MetaChip tone="success" icon="shield" style={{ marginLeft: 2 }}>≠</MetaChip>
                  </span>
                  <span className="mono caption" style={{ fontSize: 12 }}>{c.elapsed}</span>
                  <span style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--fg-subtle)' }}>
                    <Icon name="arrowRight" size={16} />
                  </span>
                </a>
              );
            })}
          </div>

          <div className="caption" style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="shield" size={13} color="var(--fg-subtle)" />
            行をクリックすると、入力者の判断と申請書類との照合結果を確認して最終承認できます (承認者 mode)
          </div>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
