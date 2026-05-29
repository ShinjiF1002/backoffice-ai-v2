// 提案詳細 (/proposals/:id) — Process-First v2, typology C.
// 原則 A (手順全体 before/after) / B (根拠 case 原文) / C (mode で決定 1 セット)。
// data: mock-fixture §6 (PROP-2026-031)。
const { useState } = React;

/* ---------- §6 mock ---------- */
const METRIC_ROWS = [
  { metricLabel: '番地表記の読み取り精度', actualValue: '0.93', threshold: '> 0.90', judgment: '達成 (+0.03)', achieved: true,
    period: '直近 30 日', denominator: '12 case 相当', previousDelta: '前回 +0.01', exclusions: 'エスカレーション case 除く' },
  { metricLabel: '影響件数', actualValue: '12 件', threshold: '≤ 20 件', judgment: '達成 (余裕 8 件)', achieved: true,
    period: '過去案件で試算', denominator: '12 case 相当', previousDelta: '—' },
];

const CONSEQUENCE = {
  before: '判定基準 現行',
  after: '判定基準 厳しめ',
  scope: '法人住所変更の住所読み取り、過去 12 case 相当に試算',
  impacts: [
    { dir: 'down', text: '誤って自動確定してしまう見逃しが減る' },
    { dir: 'up',   text: '人の要確認が増える可能性 (過剰な要確認のリスク)' },
    { dir: 'hold', text: '非遡及: すでに承認済の案件には適用しない' },
  ],
};

/* 手順全体 (原則 A): changed step を全文の中で示す */
const PROCEDURE = [
  { n: 1, text: '申請書類を受け付ける' },
  { n: 2, text: 'AI が住所欄を読み取る' },
  { n: 3, text: '読み取り結果を判定基準と照合する', changed: true,
    before: '判定基準が現行のとき、基準以上を自動確定・未満を要確認に振り分け',
    after:  '判定基準を厳しめにし、より多くを入力者の要確認に回す' },
  { n: 4, text: '自動確定、または入力者の確認へ振り分ける' },
  { n: 5, text: '入力者が確認し、承認または差戻しする' },
];

/* 根拠 case (原則 B): 差戻しコメント原文 */
const EVIDENCE = [
  { id: 'CASE-2026-0098', date: '2026-05-22', field: 'ビル名',
    comment: 'ビル名が申請書類と異なっていたが、自動確定されていた。「サンプルビルディング」が正しい。判定基準が甘く見逃された。' },
  { id: 'CASE-2026-0087', date: '2026-05-18', field: '新住所',
    comment: '番地の枝番 (2-3-5 の「5」) が欠落したまま自動確定。読み取りが微妙な精度だったが基準を超えて確定していた。' },
  { id: 'CASE-2026-0079', date: '2026-05-14', field: 'ビル名',
    comment: 'カナ表記の揺れを誤読。要確認に回すべきだったが自動確定された。基準引き上げで防げる類型。' },
];

/* ---------- App ---------- */
function App() {
  const [mode, setMode] = useState('manual'); // manual | owner
  const [openEvidence, setOpenEvidence] = useState({ 'CASE-2026-0098': true });
  const [dialog, setDialog] = useState(null);  // 'reject' | 'sendback' | null
  const [toast, setToast] = useState(null);

  const showToast = (msg, tone = 'success') => { setToast({ msg, tone }); setTimeout(() => setToast(null), 2800); };

  const stepperCurrent = 1; // 生成(0) → triage(1) → 上長承認(2) → 反映(3)

  return (
    <div className="app-shell" style={{ gridTemplateAreas: '"side main"' }}>
      <Sidebar active="proposals" />
      <main style={{ gridArea: 'main', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <TopBar processLabel="法人住所変更" />

        {/* Header */}
        <header className="sticky-top" style={{ minHeight: 88, padding: '14px 24px 12px', background: 'var(--panel)', borderBottom: '1px solid var(--border)', top: 44 }}>
          <div className="caption" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span>法人住所変更</span><Icon name="chevR" size={10} color="var(--fg-subtle)" />
            <a href="../05-proposals/Proposals.html" style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>AI 提案レビュー</a>
            <Icon name="chevR" size={10} color="var(--fg-subtle)" />
            <span className="mono" style={{ color: 'var(--fg)', fontWeight: 500 }}>PROP-2026-031</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0 }}>
              <h1 className="h1" style={{ margin: 0, display: 'inline-flex', alignItems: 'baseline', gap: 10 }}>
                <span className="mono" style={{ fontSize: 15, fontWeight: 600 }}>PROP-2026-031</span>
                <span>住所読み取りの判定基準を厳しめに調整</span>
              </h1>
              <StatusBadge tone="primary">確認待ち</StatusBadge>
            </div>
            <div className="seg" role="tablist">
              <button role="tab" aria-pressed={mode === 'manual'} onClick={() => setMode('manual')}>Manual 管理者</button>
              <button role="tab" aria-pressed={mode === 'owner'} onClick={() => setMode('owner')}>業務責任者</button>
            </div>
          </div>
          <StepperGeneric steps={['生成', 'Manual 確認', '上長承認', '反映']} current={stepperCurrent} />
        </header>

        {/* Body 2-col */}
        <div style={{ flex: 1, padding: 16, background: 'var(--canvas)' }}>
          {mode === 'owner' && (
            <div className="panel" style={{ padding: '8px 14px', marginBottom: 12, background: 'var(--primary-soft)', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="shield" size={16} color="var(--primary-hover)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-hover)' }}>業務責任者の最終承認</div>
                <div className="caption" style={{ marginTop: 1 }}>Manual 管理者 <strong style={{ color: 'var(--fg)', fontWeight: 500 }}>佐藤</strong> が上長へ送付した提案です。実績値と帰結を確認してください。</div>
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: 16, alignItems: 'start' }}>
            {/* 主列 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <MetricVsThreshold
                title="判定基準 vs 実績"
                subtitle="この改定が判定基準を満たすか、過去案件で試算した実測値"
                rows={METRIC_ROWS}
              />
              <ConsequencePanel
                title="改定の帰結"
                before={CONSEQUENCE.before}
                after={CONSEQUENCE.after}
                scope={CONSEQUENCE.scope}
                impacts={CONSEQUENCE.impacts}
              />
              {/* 手順全体 (原則 A) */}
              <section className="panel" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <h2 className="h2" style={{ margin: 0 }}>手順の変更箇所 (全体の中で確認)</h2>
                  <div className="caption" style={{ marginTop: 2 }}>変わるのは 1 ステップのみ。前後の手順は変わりません。</div>
                </div>
                <ol style={{ margin: 0, padding: '8px 0', listStyle: 'none' }}>
                  {PROCEDURE.map((s) => (
                    <li key={s.n} style={{ padding: s.changed ? '0' : '8px 16px' }}>
                      {!s.changed ? (
                        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--fg-muted)' }}>
                          <span className="mono" style={{ color: 'var(--fg-subtle)' }}>{s.n}.</span>
                          <span>{s.text}</span>
                        </div>
                      ) : (
                        <div style={{ background: 'var(--primary-soft)', borderLeft: '3px solid var(--primary)', padding: '10px 16px', margin: '4px 0' }}>
                          <div style={{ display: 'flex', gap: 12, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                            <span className="mono" style={{ color: 'var(--primary-hover)' }}>{s.n}.</span>
                            <span>{s.text} <MetaChip tone="primary" style={{ marginLeft: 6 }}>変更箇所</MetaChip></span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 28 }}>
                            <div style={{ fontSize: 12, color: 'var(--diff-del-fg)', background: 'var(--diff-del-bg)', borderRadius: 4, padding: '5px 8px' }}>− {s.before}</div>
                            <div style={{ fontSize: 12, color: 'var(--diff-add-fg)', background: 'var(--diff-add-bg)', borderRadius: 4, padding: '5px 8px' }}>＋ {s.after}</div>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            {/* 補助列: 根拠 (原則 B) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <section className="panel" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 className="h2" style={{ margin: 0 }}>この提案の根拠</h2>
                    <MetaChip>{EVIDENCE.length} 件</MetaChip>
                  </div>
                  <div className="caption" style={{ marginTop: 2 }}>日次提案分析が拾った、差戻しの実例。コメント原文で確認できます。</div>
                </div>
                {EVIDENCE.map((e, i) => {
                  const open = openEvidence[e.id];
                  return (
                    <div key={e.id} style={{ borderTop: i ? '1px solid var(--border)' : 'none' }}>
                      <button onClick={() => setOpenEvidence((p) => ({ ...p, [e.id]: !p[e.id] }))} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <Icon name="chevR" size={12} color="var(--fg-subtle)" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms var(--ease)' }} />
                        <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{e.id}</span>
                        <MetaChip tone="alert" style={{ marginLeft: 2 }}>{e.field}</MetaChip>
                        <span className="caption mono" style={{ marginLeft: 'auto' }}>{e.date}</span>
                      </button>
                      {open && (
                        <div className="fade-in" style={{ padding: '0 16px 12px 36px' }}>
                          <div style={{ padding: '10px 12px', background: 'var(--panel-inset)', borderRadius: 'var(--r-control)', fontSize: 12, lineHeight: 1.7, color: 'var(--fg)' }}>
                            <div className="caption" style={{ marginBottom: 4 }}>差戻しコメント (原文)</div>
                            「{e.comment}」
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <Btn variant="ghost" size="xs" iconRight="arrowRight" href="../04-case-detail/CaseDetail.html">元の案件を開く</Btn>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>

              <section className="panel" style={{ padding: 14 }}>
                <HintBody />
              </section>
            </div>
          </div>
        </div>

        {/* Footer — mode で 1 セットのみ (原則 C) */}
        <footer className="sticky-bottom" style={{ padding: '10px 24px', borderTop: '1px solid var(--border)', background: 'var(--panel)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="caption" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Icon name="check-circle" size={14} color="var(--success-soft-fg)" />
            <span>判定基準は実測値で確認済 — {mode === 'manual' ? '上長へ送るか却下を選べます' : '承認または差戻しを選べます'}</span>
          </div>
          {mode === 'manual' ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn icon="x" onClick={() => setDialog('reject')}>却下 (理由必須)</Btn>
              <Btn variant="primary" iconRight="arrowRight" onClick={() => showToast('上長へ送付しました — 業務責任者の承認待ちに進みます')}>上長へ送付</Btn>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn icon="reload" onClick={() => setDialog('sendback')}>差戻し (理由必須)</Btn>
              <Btn variant="primary" icon="check" onClick={() => showToast('提案を承認しました — 反映に進みます')}>承認</Btn>
            </div>
          )}
        </footer>
      </main>

      <ReasonDialog
        open={dialog === 'reject'} title="提案を却下" label="却下の理由 (必須)"
        placeholder="なぜ却下するか、提案元 (日次提案分析) の改善に役立つよう具体的に。例: 過剰な要確認が増える懸念が大きく、現時点では見送る。"
        submitLabel="却下する" tone="danger" outcome="却下すると、この提案は反映されません。"
        onClose={() => setDialog(null)} onSubmit={() => showToast('提案を却下しました', 'alert')}
      />
      <ReasonDialog
        open={dialog === 'sendback'} title="提案を差戻し" label="差戻しの理由 (必須)"
        placeholder="Manual 管理者が再検討できるよう、何を直してほしいか具体的に。例: 影響件数の試算根拠を追記してほしい。"
        submitLabel="差戻す" tone="danger" outcome="差戻すと Manual 管理者の確認に戻ります。"
        onClose={() => setDialog(null)} onSubmit={() => showToast('提案を差戻しました — Manual 管理者の確認に戻ります', 'alert')}
      />

      {toast && (
        <div role="status" style={{ position: 'fixed', bottom: 76, left: '50%', transform: 'translateX(-50%)', padding: '10px 16px', background: toast.tone === 'alert' ? 'var(--alert-soft)' : 'var(--success-soft)', color: toast.tone === 'alert' ? 'var(--alert-soft-fg)' : 'var(--success-soft-fg)', border: '1px solid ' + (toast.tone === 'alert' ? 'var(--alert)' : 'var(--success)'), borderRadius: 'var(--r-card)', boxShadow: '0 8px 20px rgba(15,23,42,0.12)', fontSize: 13, fontWeight: 500, zIndex: 80, animation: 'fadeIn 200ms var(--ease)' }}>
          <Icon name={toast.tone === 'alert' ? 'alert' : 'check-circle'} size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function HintBody() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '6px 0', color: 'var(--fg-muted)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
        <Icon name="chevR" size={12} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms var(--ease)' }} />
        <span style={{ color: 'var(--fg)' }}>参考: AI の補足</span>
        <span className="caption" style={{ marginLeft: 'auto' }}>承認の根拠にはなりません</span>
      </button>
      {open && (
        <div className="fade-in caption" style={{ paddingTop: 8, lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--fg)' }}>この補足は AI の推測で、承認の根拠にはなりません。</strong><br />
          ・同種の差戻しは直近 30 日で増加傾向。基準引き上げで同類型の見逃しを抑制できる見込み。
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
