// エージェント詳細 (/agents/:id) — Process-First v2, typology C, role AI 管理者.
// 原則 A (4 KPI 全件) / B (裏付け sample 参照) / C (申請 1 ボタン)。
// data: mock-fixture §5 (4 KPI) / §7 (consequence)。
const { useState } = React;

/* §5: 4 KPI */
const KPI_ROWS = [
  { metricLabel: 'AI 入力承認率', actualValue: '92%', threshold: '≥ 95%', judgment: '未達 (-3pt)', achieved: false,
    period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 +2pt', exclusions: 'エスカレーション case 除く' },
  { metricLabel: '人手上書き率', actualValue: '0.12', threshold: '≤ 0.15', judgment: '達成', achieved: true,
    period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 -0.01' },
  { metricLabel: 'Alert 発生率', actualValue: '0.08', threshold: '≤ 0.10', judgment: '達成', achieved: true,
    period: '直近 30 日', denominator: '1,240 件', previousDelta: '前月 ±0' },
  { metricLabel: '承認者差戻し率', actualValue: '0.05', threshold: '≤ 0.07', judgment: '達成', achieved: true,
    period: '直近 30 日', denominator: '1,140 件', previousDelta: '前月 -0.01' },
];

/* §7: consequence (Supervised → Checkpoint) */
const CONSEQUENCE = {
  before: 'Supervised',
  after: 'Checkpoint',
  scope: '法人住所変更 Agent の自動化レベルを引き上げ',
  impacts: [
    { dir: 'down', text: '人レビュー 80 件/日 → 約 30 件/日 (要確認のみに集中)' },
    { dir: 'up',   text: '自動入力 0 件/日 → 約 50 件/日' },
    { dir: 'hold', text: 'rollback: 承認率が 7 日連続で基準割れ → Supervised に自動降格' },
  ],
};

/* 裏付け sample (原則 B) */
const SAMPLES = [
  { id: 'CASE-2026-0142', outcome: '要確認', tone: 'alert',  note: 'ビル名が申請書類と不一致 → 入力者が確認', kpi: '承認率' },
  { id: 'CASE-2026-0139', outcome: '自動入力', tone: 'success', note: '全項目一致、人の修正なし', kpi: '上書き率' },
  { id: 'CASE-2026-0131', outcome: '差戻し', tone: 'alert', note: '法人名の旧商号を誤入力 → 入力者が差戻し', kpi: '承認率' },
  { id: 'CASE-2026-0120', outcome: '自動入力', tone: 'success', note: '住所変更を正しく入力、承認済', kpi: '上書き率' },
];

const CONFIG = [
  { k: 'モデル', v: '書類読み取り + 値生成モデル', meta: '法人住所変更 専用' },
  { k: '権限',   v: '住所・支店コード・効力発生日の自動入力', meta: '要確認は入力者へ' },
  { k: 'ツール', v: '書類の文字読み取り / 登録情報の照合', meta: '読み取り結果を判定基準で振り分け' },
];

function App() {
  const [applyOpen, setApplyOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (m, t = 'success') => { setToast({ m, t }); setTimeout(() => setToast(null), 2800); };

  const hasUnmet = KPI_ROWS.some((r) => !r.achieved);

  return (
    <div className="app-shell" style={{ gridTemplateAreas: '"side main"' }}>
      <Sidebar active="agents" />
      <main style={{ gridArea: 'main', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <TopBar processLabel="法人住所変更" />

        {/* Header */}
        <header className="sticky-top" style={{ minHeight: 80, padding: '14px 24px', background: 'var(--panel)', borderBottom: '1px solid var(--border)', top: 44 }}>
          <div className="caption" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span>法人住所変更</span><Icon name="chevR" size={10} color="var(--fg-subtle)" />
            <a href="../07-agents/Agents.html" style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>Agent 設定</a>
            <Icon name="chevR" size={10} color="var(--fg-subtle)" />
            <span className="mono" style={{ color: 'var(--fg)', fontWeight: 500 }}>法人住所変更 Agent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--panel-inset)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="agent" size={20} color="var(--fg-muted)" />
            </span>
            <div style={{ flex: 1 }}>
              <h1 className="h1" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                法人住所変更 Agent
                <MetaChip tone="primary">現在 Supervised</MetaChip>
              </h1>
              <div className="caption" style={{ marginTop: 2 }}>自動化レベルの昇格を判断します</div>
            </div>
          </div>
        </header>

        {/* Body 2-col */}
        <div style={{ flex: 1, padding: 16, background: 'var(--canvas)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: 16, alignItems: 'start' }}>
            {/* 主列 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <MetricVsThreshold
                title="実績 vs 閾値 (4 指標すべて)"
                subtitle="昇格の判断材料。1 指標でも未達なら、基準到達まで昇格は保留します。"
                rows={KPI_ROWS}
              />
              <ConsequencePanel
                title="昇格の帰結 (Supervised → Checkpoint)"
                before={CONSEQUENCE.before}
                after={CONSEQUENCE.after}
                scope={CONSEQUENCE.scope}
                impacts={CONSEQUENCE.impacts}
              />
            </div>

            {/* 補助列: 裏付け (原則 B) + Config */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <section className="panel" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <h2 className="h2" style={{ margin: 0 }}>実績の裏付け</h2>
                  <div className="caption" style={{ marginTop: 2 }}>上の数字は、これらの実行履歴の集計です。案件をクリックで詳細へ。</div>
                </div>
                {SAMPLES.map((s, i) => (
                  <a key={s.id} href="../04-case-detail/CaseDetail.html" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 16px', borderTop: i ? '1px solid var(--border)' : 'none', textDecoration: 'none', color: 'var(--fg)' }}>
                    <MetaChip tone={s.tone} style={{ flex: '0 0 auto', marginTop: 1 }}>{s.outcome}</MetaChip>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{s.id}</div>
                      <div className="caption" style={{ marginTop: 1 }}>{s.note}</div>
                    </div>
                    <Icon name="arrowRight" size={14} color="var(--fg-subtle)" style={{ marginTop: 2 }} />
                  </a>
                ))}
                <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)' }}>
                  <Btn variant="ghost" size="xs" iconRight="arrowRight" href="#">すべての実行履歴をモニタリングで見る</Btn>
                </div>
              </section>

              <section className="panel" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <h2 className="h2" style={{ margin: 0 }}>設定</h2>
                </div>
                {CONFIG.map((c, i) => (
                  <div key={c.k} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12, padding: '10px 16px', borderTop: i ? '1px solid var(--border)' : 'none', alignItems: 'start' }}>
                    <span className="caption" style={{ paddingTop: 1 }}>{c.k}</span>
                    <div>
                      <div style={{ fontSize: 13 }}>{c.v}</div>
                      <div className="caption" style={{ marginTop: 1 }}>{c.meta}</div>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          </div>
        </div>

        {/* Footer — 申請 1 ボタンのみ (原則 C) */}
        <footer className="sticky-bottom" style={{ padding: '10px 24px', borderTop: '1px solid var(--border)', background: 'var(--panel)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="caption" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {hasUnmet ? (
              <>
                <Icon name="alert" size={14} color="var(--alert-soft-fg)" />
                <span style={{ color: 'var(--alert-soft-fg)', fontWeight: 500 }}>承認率が基準 (95%) に未達のため、現時点では昇格を申請できません</span>
              </>
            ) : (
              <>
                <Icon name="check-circle" size={14} color="var(--success-soft-fg)" />
                <span style={{ color: 'var(--success-soft-fg)', fontWeight: 500 }}>全指標が基準達成 — 昇格を申請できます</span>
              </>
            )}
          </div>
          <Btn variant="primary" icon="agent" disabled={hasUnmet} tooltip={hasUnmet ? '承認率が基準に未達です' : undefined} onClick={() => setApplyOpen(true)}>
            設定変更を申請
          </Btn>
        </footer>
      </main>

      {/* 申請 confirm dialog */}
      {applyOpen && (
        <div role="dialog" aria-modal="true" onClick={() => setApplyOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn 200ms var(--ease)' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 480, maxWidth: '100%', background: 'var(--panel)', borderRadius: 'var(--r-card)', boxShadow: '0 24px 48px rgba(15,23,42,0.18), 0 0 0 1px var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}><h2 className="h2" style={{ margin: 0 }}>設定変更を申請</h2></div>
            <div style={{ padding: 18, fontSize: 13, lineHeight: 1.7 }}>
              Supervised → Checkpoint への昇格を申請します。承認後、人レビューが減り自動入力が増えます (帰結を参照)。
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--panel-inset)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Btn onClick={() => setApplyOpen(false)}>キャンセル</Btn>
              <Btn variant="primary" icon="check" onClick={() => { setApplyOpen(false); showToast('昇格を申請しました'); }}>申請する</Btn>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div role="status" style={{ position: 'fixed', bottom: 76, left: '50%', transform: 'translateX(-50%)', padding: '10px 16px', background: toast.t === 'alert' ? 'var(--alert-soft)' : 'var(--success-soft)', color: toast.t === 'alert' ? 'var(--alert-soft-fg)' : 'var(--success-soft-fg)', border: '1px solid ' + (toast.t === 'alert' ? 'var(--alert)' : 'var(--success)'), borderRadius: 'var(--r-card)', boxShadow: '0 8px 20px rgba(15,23,42,0.12)', fontSize: 13, fontWeight: 500, zIndex: 80, animation: 'fadeIn 200ms var(--ease)' }}>
          <Icon name="check-circle" size={14} style={{ verticalAlign: -2, marginRight: 6 }} />{toast.m}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
