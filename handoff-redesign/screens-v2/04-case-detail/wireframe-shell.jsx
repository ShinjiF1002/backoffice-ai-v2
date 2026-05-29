// Wireframe primitives + CaseDetail shared frame (TopBar / Header / Footer)
// Low-fi sketch style: handwritten font, grayscale ink, minimal state tone.
// Exports to window: W, WBox, WChip, WBtn, WStateBadge, WIcon,
//                    CaseDetailFrame, LifecycleStepper, AuxStandard.
const { useState, useEffect, Fragment } = React;

const W = {
  ink: '#1f2937',
  ink2: '#374151',
  muted: '#6b7280',
  hairline: '#d1d5db',
  inset: '#f3f4f6',
  panel: '#ffffff',
  canvas: '#fafaf9',
  amber: '#d97706',
  amberBg: '#fef3c7',
  amberBgSoft: '#fffbeb',
  amberInk: '#92400e',
  green: '#16a34a',
  greenBg: '#ecfdf5',
  greenInk: '#166534',
  red: '#dc2626',
  redBg: '#fee2e2',
  redInk: '#991b1b',
  primary: '#2937a8',
  font: "'Kalam', 'Architects Daughter', 'Noto Sans JP', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
  border: '1.5px solid #1f2937',
  borderSoft: '1.5px solid #6b7280',
  borderHairline: '1px solid #d1d5db',
  borderDashed: '1.5px dashed #6b7280',
};

function WBox({ children, style, dashed, soft, inset, ...rest }) {
  return (
    <div
      style={{
        border: dashed ? W.borderDashed : soft ? W.borderSoft : W.border,
        background: inset ? W.inset : W.panel,
        borderRadius: 4,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

function WChip({ children, tone = 'default', style }) {
  const tones = {
    default: { bg: '#fff', border: '1.5px solid ' + W.ink2, color: W.ink },
    dark:    { bg: W.ink, border: 'none', color: '#fff' },
    amber:   { bg: W.amberBg, border: '1.5px solid ' + W.amber, color: W.amberInk },
    amberSolid: { bg: W.amber, border: 'none', color: '#fff' },
    green:   { bg: W.greenBg, border: '1.5px solid ' + W.green, color: W.greenInk },
    red:     { bg: W.redBg, border: '1.5px solid ' + W.red, color: W.redInk },
    muted:   { bg: W.inset, border: 'none', color: W.muted },
  };
  const t = tones[tone] || tones.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 3,
      fontSize: 11, fontWeight: 600, lineHeight: 1.3,
      fontFamily: W.font,
      background: t.bg, border: t.border, color: t.color,
      ...style,
    }}>{children}</span>
  );
}

function WBtn({ children, primary, disabled, small, style, ...rest }) {
  const pad = small ? '4px 9px' : '6px 12px';
  const fs = small ? 11 : 12;
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: pad, borderRadius: 4,
    fontSize: fs, fontWeight: 600,
    fontFamily: W.font, cursor: disabled ? 'not-allowed' : 'pointer',
    lineHeight: 1.3, whiteSpace: 'nowrap',
  };
  let s;
  if (disabled) s = { ...base, border: '1.5px dashed #9ca3af', color: '#9ca3af', background: '#fafafa' };
  else if (primary) s = { ...base, background: W.ink, color: '#fff', border: W.border };
  else s = { ...base, background: '#fff', color: W.ink, border: W.border };
  return <span style={{ ...s, ...style }} {...rest}>{children}</span>;
}

function WStateBadge({ state, style }) {
  // 6 states from reconcile-panel-spec
  const map = {
    '一致':       { tone: 'green', dot: '●', label: '一致' },
    '正規化一致': { tone: 'green', dot: '≈', label: '正規化一致' },
    '要確認':     { tone: 'amber', dot: '⚠', label: '要確認' },
    '未取得':     { tone: 'muted', dot: '○', label: '未取得' },
    '手入力確認済': { tone: 'default', dot: '✎', label: '手入力確認済' },
    'エスカレーション': { tone: 'red', dot: '↑', label: 'エスカレーション' },
  };
  const m = map[state] || map['一致'];
  return (
    <WChip tone={m.tone} style={style}>
      <span style={{ fontSize: 11 }}>{m.dot}</span>
      <span>{m.label}</span>
    </WChip>
  );
}

function WSrcLocator({ doc, page, region, style }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 8px',
      border: W.borderDashed,
      borderRadius: 3,
      fontFamily: W.mono,
      fontSize: 10,
      color: W.muted,
      background: '#fafaf9',
      ...style,
    }}>
      <span>📄</span>
      <span style={{ color: W.ink }}>{doc}</span>
      <span>·</span>
      <span>{page}</span>
      <span>·</span>
      <span>{region}</span>
    </div>
  );
}

function LifecycleStepper({ current = 2 }) {
  const steps = ['受付', 'AI処理', '入力者確認', '承認者承認', '反映'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: W.font }}>
      {steps.map((s, i) => (
        <span key={s} style={{ display: 'contents' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              width: 16, height: 16, borderRadius: 8,
              border: '1.5px solid ' + W.ink,
              background: i < current ? W.ink : i === current ? '#fff' : '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 9, fontWeight: 700,
              position: 'relative',
            }}>
              {i === current && <span style={{ width: 7, height: 7, borderRadius: 4, background: W.ink, display: 'inline-block' }} />}
              {i < current && <span style={{ color: '#fff' }}>✓</span>}
            </span>
            <span style={{ color: i === current ? W.ink : i < current ? W.ink2 : W.muted, fontWeight: i === current ? 700 : 400 }}>{s}</span>
          </span>
          {i < steps.length - 1 && (
            <span style={{ flex: 'none', width: 18, height: 0, borderTop: i < current ? '1.5px solid ' + W.ink : '1.5px dashed ' + W.hairline }} />
          )}
        </span>
      ))}
    </div>
  );
}

function TopBar() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 16px',
      borderBottom: W.border,
      background: '#fff',
      fontFamily: W.font, fontSize: 12,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{
          width: 22, height: 22, border: W.border, borderRadius: 4,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11,
        }}>B</div>
        <span style={{ fontWeight: 700 }}>Backoffice AI</span>
        <WChip tone="muted" style={{ fontSize: 9 }}>v2 prototype</WChip>
        <span style={{ width: 1, height: 18, background: W.hairline, marginLeft: 6 }} />
        <span style={{ fontSize: 11, color: W.muted, marginLeft: 4 }}>業務</span>
        <WBox style={{ padding: '3px 10px', display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12, fontWeight: 600 }}>
          法人住所変更 <span style={{ color: W.muted }}>▾</span>
        </WBox>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>🔍 検索</span>
        <span style={{ fontSize: 14, color: '#9ca3af' }}>🔔</span>
        <WChip tone="muted" style={{ fontSize: 10 }}>プロトタイプ表示 — 外部システム未接続 / 証跡はモック</WChip>
        <WBox style={{ width: 22, height: 22, borderRadius: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>山</WBox>
      </div>
    </div>
  );
}

function CaseHeader({ mode, setMode }) {
  return (
    <div style={{ borderBottom: W.border, padding: '10px 20px 12px', background: '#fff', fontFamily: W.font }}>
      <div style={{ fontSize: 11, color: W.muted, marginBottom: 4 }}>
        法人住所変更 › 案件一覧 › <span style={{ color: W.ink, fontWeight: 600, fontFamily: W.mono }}>CASE-2026-0142</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: W.font, display: 'inline-flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: W.mono, fontSize: 17, fontWeight: 700 }}>CASE-2026-0142</span>
            <span>法人住所変更</span>
          </h1>
          <WChip tone="dark">入力者確認待ち</WChip>
          <span style={{ fontSize: 11, color: W.muted }}>受付 2026-05-31 09:00 · 担当 山田太郎</span>
        </div>
        <ModeToggle mode={mode} setMode={setMode} />
      </div>
      <LifecycleStepper current={2} />
    </div>
  );
}

function ModeToggle({ mode, setMode }) {
  const btn = (active) => ({
    padding: '5px 11px', border: 'none', fontFamily: W.font, fontSize: 12, fontWeight: 600,
    background: active ? W.ink : '#fff', color: active ? '#fff' : W.ink, cursor: 'pointer',
  });
  return (
    <div style={{ display: 'inline-flex', border: W.border, borderRadius: 4, overflow: 'hidden' }}>
      <button onClick={() => setMode('input')} style={btn(mode === 'input')}>入力者 mode</button>
      <button onClick={() => setMode('checker')} style={{ ...btn(mode === 'checker'), borderLeft: W.border }}>承認者 mode</button>
    </div>
  );
}

function CaseFooter({ mode, hasOpen }) {
  if (mode === 'input') {
    return (
      <div style={{ borderTop: W.border, padding: '10px 20px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: W.font }}>
        <div style={{ fontSize: 11, color: hasOpen ? W.amberInk : W.greenInk }}>
          {hasOpen ? '⚠ 要確認 1 項目を解消してください' : '✓ 全 field 確認済 — 承認可'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <WBtn>差戻し (コメント付き)</WBtn>
          <WBtn primary disabled={hasOpen} title={hasOpen ? '要確認 1 項目を解消してください' : ''}>承認</WBtn>
        </div>
      </div>
    );
  }
  return (
    <div style={{ borderTop: W.border, padding: '10px 20px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: W.font }}>
      <div style={{ fontSize: 11, color: W.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
        <WChip tone="green" style={{ fontSize: 10 }}>SoD ✓</WChip>
        入力者 <b style={{ color: W.ink }}>山田太郎</b> ≠ 承認者 <b style={{ color: W.ink }}>鈴木課長</b> · 入力者承認 11:30
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <WBtn>差戻し</WBtn>
        <WBtn primary>最終承認</WBtn>
      </div>
    </div>
  );
}

function CaseDetailFrame({ children, defaultMode = 'input', defaultOpen = true, width = 1280, height = 880 }) {
  const [mode, setMode] = useState(defaultMode);
  const [hasOpen, setHasOpen] = useState(defaultOpen);
  // Allow children to flip hasOpen via context-ish callback
  return (
    <div style={{
      width, height, display: 'flex', flexDirection: 'column',
      background: W.canvas, fontFamily: W.font, color: W.ink,
      overflow: 'hidden',
    }}>
      <TopBar />
      <CaseHeader mode={mode} setMode={setMode} />
      <div style={{ flex: 1, padding: 16, overflow: 'hidden' }}>
        {typeof children === 'function' ? children({ mode, hasOpen, setHasOpen }) : children}
      </div>
      <CaseFooter mode={mode} hasOpen={hasOpen} />
    </div>
  );
}

function AuxStandard({ compact = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      <WBox style={{ padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span>引用根拠</span>
          <WChip tone="green" style={{ fontSize: 10 }}>承認済 3 件</WChip>
        </div>
        {[
          { t: '法人住所変更フロー', m: 'KB-FLOW-022 · v3.1' },
          { t: '番地表記正規化ルール', m: 'KB-RULE-008 · v1.4' },
          { t: '効力発生日設定基準', m: 'KB-RULE-014 · v2.0' },
        ].map((c) => (
          <div key={c.t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderTop: W.borderHairline, fontSize: 11 }}>
            <span>{c.t}</span>
            <span style={{ fontFamily: W.mono, color: W.muted, fontSize: 10 }}>{c.m}</span>
          </div>
        ))}
      </WBox>

      <WBox style={{ padding: 10, background: '#fafaf9' }}>
        <div style={{ fontSize: 11, color: W.muted, display: 'flex', justifyContent: 'space-between' }}>
          <span>Alert</span>
          <span>—</span>
        </div>
        <div style={{ fontSize: 12, marginTop: 4 }}>注意なし</div>
      </WBox>

      <WBox style={{ padding: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>未承認ヒント</span>
          <span style={{ fontSize: 11, color: W.muted, cursor: 'pointer' }}>展開 ▾</span>
        </div>
        <div style={{ fontSize: 10, color: W.muted, marginTop: 2 }}>L3 Disclosure · default closed</div>
      </WBox>

      {!compact && (
        <WBox inset style={{ padding: 10, marginTop: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>同 case の audit (要約)</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: W.ink2, lineHeight: 1.6 }}>
            <li>09:00 受付 (system)</li>
            <li>09:02 AI 入力 (agent)</li>
            <li>10:15 入力者確認 開始 (山田太郎)</li>
          </ul>
        </WBox>
      )}
    </div>
  );
}

Object.assign(window, {
  W, WBox, WChip, WBtn, WStateBadge, WSrcLocator,
  LifecycleStepper, CaseDetailFrame, AuxStandard,
});
