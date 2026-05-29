// CaseDetail rev.3 — 文書アンカー型 2-pane app composition
// ① 申請書類ビューア (左) を読めるサイズで常時表示
// ② AI 入力項目 全件 default 表示 (確認済を折りたたまない)
// ③ standing button は footer 1 セットのみ (field 行に 2 個目ボタンなし)
//    field 補正は要確認行クリック → 統合 modal「項目の対応」
const { useState, useEffect, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "caseState": "ideal",
  "showAuxDrawer": false
}/*EDITMODE-END*/;

/* ---------- Mock data: CASE-2026-0142 (mock-fixture §4 + §11) ---------- */
const LOC_ADDR   = { doc: 'CASE-2026-0142.pdf', page: 'P.2', region: '住所欄' };
const LOC_BRANCH = { doc: 'CASE-2026-0142.pdf', page: 'P.2', region: '支店コード欄' };

const ATTENTION_IDEAL = [
  {
    kind: '要確認',
    field: 'ビル名',
    aiValue: 'サンプルビル',
    ocrValue: 'サンプルビルディング',
    ocrDiffParts: [{ text: 'サンプル' }, { text: 'ビルディング', alert: true }],
    locator: LOC_ADDR,
    hint: 'AI 入力と申請書類で値が違います。正しい方を確認してください。',
  },
];

const ATTENTION_PARTIAL = [
  ...ATTENTION_IDEAL,
  { kind: '未取得', field: '新住所', locator: LOC_ADDR },
  { kind: '未取得', field: '支店コード', locator: LOC_BRANCH },
];

const MATCHED_IDEAL = [
  { field: '法人名', value: '株式会社サンプルHD',
    autoCorrect: { before: '株式会社サンプルＨＤ', after: '株式会社サンプルHD', rule: '全角英数を半角に統一 (ＨＤ → HD)' } },
  { field: '新住所', value: '東京都千代田区丸の内 2 丁目 3 番 5 号',
    autoCorrect: { before: '千代田区丸の内２－３－５', after: '東京都千代田区丸の内 2 丁目 3 番 5 号', rule: '丁目番地表記を統一 / 都名を補完' } },
  { field: '支店コード', value: '042', mono: true },
  { field: '効力発生日', value: '2026-06-15', mono: true },
];

const MATCHED_PARTIAL = [ MATCHED_IDEAL[0], MATCHED_IDEAL[3] ];

/* ---------- Aux drawer (引用根拠 / 経過 / 未承認ヒント) ---------- */
function AuxDrawer({ open, onClose }) {
  const [hintOpen, setHintOpen] = useState(false);
  return (
    <div
      aria-hidden={!open}
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      {/* scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,23,42,0.35)',
          opacity: open ? 1 : 0,
          transition: 'opacity 200ms var(--ease)',
        }}
      />
      {/* panel */}
      <aside
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 380, maxWidth: '90vw',
          background: 'var(--panel)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-12px 0 32px rgba(15,23,42,0.12)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 250ms var(--ease)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="h2" style={{ margin: 0 }}>参考情報</h2>
          <Btn variant="ghost" size="xs" icon="x" onClick={onClose}>閉じる</Btn>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 引用根拠 */}
          <section className="panel" style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <h3 className="h2" style={{ margin: 0, fontSize: 13 }}>引用根拠</h3>
              <MetaChip tone="success" icon="check">承認済 3 件</MetaChip>
            </div>
            <div className="caption" style={{ marginBottom: 8 }}>この案件で参照した、承認済の手順・ルール</div>
            {[
              { t: '法人住所変更フロー',   id: 'KB-FLOW-022', v: 'v3.1', date: '2026-04-12' },
              { t: '番地表記正規化ルール', id: 'KB-RULE-008', v: 'v1.4', date: '2026-03-08' },
              { t: '効力発生日設定基準',   id: 'KB-RULE-014', v: 'v2.0', date: '2026-05-02' },
            ].map((c, i) => (
              <a key={c.id} href="#" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', textDecoration: 'none', color: 'var(--fg)' }}>
                <div style={{ width: 22, height: 22, borderRadius: 4, background: 'var(--success-soft)', color: 'var(--success-soft-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', marginTop: 1 }}>
                  <Icon name="check" size={13} strokeWidth={2.2} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{c.t}</div>
                  <div className="caption mono" style={{ marginTop: 2, fontSize: 10 }}>{c.id} · {c.v} · {c.date}</div>
                </div>
                <Icon name="arrowRight" size={13} color="var(--fg-subtle)" />
              </a>
            ))}
          </section>

          {/* 経過 */}
          <section className="panel" style={{ padding: 14 }}>
            <h3 className="h2" style={{ margin: 0, fontSize: 13, marginBottom: 8 }}>この案件の経過</h3>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { t: '09:00', a: 'システム',          e: '受付' },
                { t: '09:02', a: 'AI 担当 Agent',     e: 'AI 入力 (申請書類の読み取り・登録値の照合)' },
                { t: '10:15', a: '山田太郎 (入力者)', e: '確認開始' },
              ].map((r, i) => (
                <li key={i} style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 10, fontSize: 12, alignItems: 'flex-start' }}>
                  <span className="mono caption" style={{ paddingTop: 1 }}>{r.t}</span>
                  <div><div style={{ fontWeight: 500 }}>{r.e}</div><div className="caption" style={{ marginTop: 1 }}>{r.a}</div></div>
                </li>
              ))}
            </ol>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <Btn variant="ghost" size="xs" icon="eye">すべての経過をモニタリングで見る</Btn>
            </div>
          </section>

          {/* 未承認ヒント */}
          <section className="panel" style={{ padding: 14 }}>
            <Disclosure open={hintOpen} onToggle={() => setHintOpen(!hintOpen)} header="参考: 過去の類似事例" level="">
              <div className="caption" style={{ paddingTop: 8, lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--fg)' }}>このヒントは AI の推測で、承認の根拠にはなりません。</strong><br />
                ・同住所の過去案件 2 件では「サンプルビルディング」表記が登録されています。
              </div>
            </Disclosure>
          </section>
        </div>
      </aside>
    </div>
  );
}

/* ---------- Tweaks ---------- */
function CaseDetailTweaks({ t, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="案件の状態" />
      <TweakRadio
        label="表示する状態"
        value={t.caseState}
        options={['ideal', 'loading', 'partial', 'error']}
        onChange={(v) => setTweak('caseState', v)}
      />
    </TweaksPanel>
  );
}

/* ---------- App ---------- */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [mode, setMode] = useState('input');
  const [activeField, setActiveField] = useState(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionField, setActionField] = useState(null);
  const [actionDefault, setActionDefault] = useState(null);
  const [resolved, setResolved] = useState({});  // { field: { kind, value, reason } }
  const [removed, setRemoved] = useState({});     // { field: true }
  const [auxOpen, setAuxOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const caseState = t.caseState;
  const baseAttention = caseState === 'partial' ? ATTENTION_PARTIAL : ATTENTION_IDEAL;
  const baseMatched   = caseState === 'partial' ? MATCHED_PARTIAL   : MATCHED_IDEAL;

  const attentionItems = baseAttention.filter((a) => !resolved[a.field] && !removed[a.field]);
  const resolvedItems  = baseAttention
    .filter((a) => resolved[a.field])
    .map((a) => ({ field: a.field, value: resolved[a.field].value, kind: resolved[a.field].kind, reason: resolved[a.field].reason }));

  const openCount = attentionItems.length;

  // reset transient state when case state changes
  useEffect(() => { setResolved({}); setRemoved({}); setActiveField(null); }, [caseState]);

  const showToast = (msg, tone = 'success') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2800);
  };

  const handleOpenAction = (item) => {
    setActionField(item);
    setActionDefault(null);
    setActionOpen(true);
  };
  const handleOpenCaseLevelSendback = () => {
    setActionField(null);
    setActionDefault('sendback');
    setActionOpen(true);
  };

  const handleActionSubmit = (payload) => {
    if (payload.action === 'accept' && payload.field) {
      setResolved((p) => ({ ...p, [payload.field]: { kind: 'accepted', value: payload.value } }));
      showToast(`${payload.field} を申請書類の値で確定しました`);
    } else if (payload.action === 'override' && payload.field) {
      setResolved((p) => ({ ...p, [payload.field]: { kind: 'overridden', value: payload.value, reason: payload.reason } }));
      showToast(`${payload.field} を手入力で確定しました`);
    } else if (payload.action === 'sendback') {
      const label = SENDBACK_CATEGORIES.find((c) => c.k === payload.category)?.label || '差戻し';
      showToast(`案件を差戻しました — ${label}。再処理後、再び確認待ちに戻ります`, 'alert');
    } else if (payload.action === 'escalate') {
      const label = ESCALATE_TARGETS.find((x) => x.k === payload.target)?.label || '業務責任者';
      showToast(`${label}へ送りました`, 'alert');
    }
  };

  const handleApprove = () => showToast(mode === 'checker' ? '最終承認しました — 反映に進みます' : '承認しました — 承認者の確認待ちに進みます');

  return (
    <div className="app-shell" style={{ gridTemplateAreas: '"side main"' }}>
      <Sidebar />
      <main style={{ gridArea: 'main', display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
        <TopBar />
        <CaseHeader mode={mode} setMode={setMode} openCount={openCount} />

        {/* aux trigger strip */}
        <div style={{ padding: '6px 24px', background: 'var(--canvas)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: '0 0 auto' }}>
          <span className="caption">申請書類 (左) と AI 入力 (右) を見比べて確認してください</span>
          <Btn size="sm" variant="ghost" icon="doc" onClick={() => setAuxOpen(true)}>参考情報 (引用根拠・経過)</Btn>
        </div>

        {/* 2-pane body */}
        <div style={{ flex: 1, minHeight: 0, padding: '0 16px 16px', background: 'var(--canvas)' }}>
          {mode === 'checker' && (
            <div className="panel" style={{ padding: '8px 14px', marginBottom: 12, background: 'var(--primary-soft)', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="shield" size={16} color="var(--primary-hover)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-hover)' }}>承認者の最終確認</div>
                <div className="caption" style={{ marginTop: 1 }}>入力者 <strong style={{ color: 'var(--fg)', fontWeight: 500 }}>山田太郎</strong> の確認結果と申請書類との照合結果を確認してください。</div>
              </div>
              <MetaChip tone="success" icon="shield">承認者 ≠ 入力者</MetaChip>
            </div>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 52fr) minmax(0, 48fr)',
            gap: 16,
            height: mode === 'checker' ? 'calc(100% - 56px)' : '100%',
            minHeight: 0,
          }}>
            <DocumentViewer
              activeField={activeField}
              onRegionClick={(regionId) => {
                // map region → first field matching
                const map = { corp: '法人名', branch: '支店コード', address: 'ビル名', effective: '効力発生日' };
                setActiveField(map[regionId] || null);
              }}
            />
            <InputPane
              caseState={caseState}
              attentionItems={attentionItems}
              matchedItems={baseMatched}
              resolvedItems={resolvedItems}
              activeField={activeField}
              setActiveField={setActiveField}
              onOpenAction={handleOpenAction}
              onRetry={() => setTweak('caseState', 'ideal')}
            />
          </div>
        </div>

        <CaseFooter
          mode={mode}
          openCount={openCount}
          onApprove={handleApprove}
          onSendback={handleOpenCaseLevelSendback}
        />
      </main>

      <FieldActionModal
        open={actionOpen}
        field={actionField}
        defaultAction={actionDefault}
        onClose={() => setActionOpen(false)}
        onSubmit={handleActionSubmit}
      />

      <AuxDrawer open={auxOpen} onClose={() => setAuxOpen(false)} />

      {toast && (
        <div role="status" style={{
          position: 'fixed', bottom: 76, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 16px',
          background: toast.tone === 'alert' ? 'var(--alert-soft)' : 'var(--success-soft)',
          color: toast.tone === 'alert' ? 'var(--alert-soft-fg)' : 'var(--success-soft-fg)',
          border: '1px solid ' + (toast.tone === 'alert' ? 'var(--alert)' : 'var(--success)'),
          borderRadius: 'var(--r-card)',
          boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
          fontSize: 13, fontWeight: 500, zIndex: 110,
          animation: 'fadeIn 200ms var(--ease)',
        }}>
          <Icon name={toast.tone === 'alert' ? 'alert' : 'check-circle'} size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          {toast.msg}
        </div>
      )}

      <CaseDetailTweaks t={t} setTweak={setTweak} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
