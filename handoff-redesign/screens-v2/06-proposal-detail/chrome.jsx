// Shared chrome for v2 screens — parameterized Sidebar / TopBar + Icon + primitives.
// Sidebar(activeNav), TopBar(processLabel). Reusable across all 9 screens.
const { useState, useEffect, useMemo, useRef } = React;

/* ---------- icons ---------- */
function Icon({ name, size = 14, color = 'currentColor', strokeWidth = 1.5, style }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  switch (name) {
    case 'hub':       return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
    case 'inbox':     return <svg {...props}><path d="M3 13l2.5-7A2 2 0 0 1 7.4 5h9.2a2 2 0 0 1 1.9 1.4L21 13"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/><path d="M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></svg>;
    case 'sparkles':  return <svg {...props}><path d="M12 3l1.7 4.6L18.3 9 13.7 10.7 12 15.3 10.3 10.7 5.7 9l4.6-1.4z"/><path d="M19 14v3"/><path d="M17.5 15.5h3"/><path d="M5 17v3"/><path d="M3.5 18.5h3"/></svg>;
    case 'agent':     return <svg {...props}><circle cx="12" cy="8" r="3.2"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>;
    case 'eye':       return <svg {...props}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'chevR':     return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevD':     return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case 'alert':     return <svg {...props}><path d="M12 4l10 17H2L12 4z"/><path d="M12 10v4"/><circle cx="12" cy="18" r="0.6" fill="currentColor"/></svg>;
    case 'clock':     return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'inboxStack':return <svg {...props}><path d="M4 8l1.5-3.5A1.5 1.5 0 0 1 7 3.6h10a1.5 1.5 0 0 1 1.5 1L20 8"/><path d="M4 8h4l1.2 2h5.6L16 8h4v4H4z"/><path d="M4 12v6a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 18v-6"/></svg>;
    case 'check':     return <svg {...props}><path d="M5 13l4 4L19 7"/></svg>;
    case 'check-circle':return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>;
    case 'x':         return <svg {...props}><path d="M6 6l12 12M6 18L18 6"/></svg>;
    case 'doc':       return <svg {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h6"/></svg>;
    case 'search':    return <svg {...props}><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg>;
    case 'bell':      return <svg {...props}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16z"/><path d="M10.5 21a1.5 1.5 0 0 0 3 0"/></svg>;
    case 'arrowRight':return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'reload':    return <svg {...props}><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></svg>;
    case 'shield':    return <svg {...props}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>;
    case 'building':  return <svg {...props}><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></svg>;
    case 'wallet':    return <svg {...props}><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16.5" cy="13.5" r="1.2" fill="currentColor"/></svg>;
    case 'bolt':      return <svg {...props}><path d="M13 3L5 13h6l-1 8 8-10h-6l1-8z"/></svg>;
    default: return null;
  }
}

/* ---------- StatusBadge / FilterChip / MetaChip ---------- */
function StatusBadge({ children, tone = 'slate', style }) {
  return <span className="chip status" data-tone={tone} style={style}>{children}</span>;
}
function FilterChip({ children, pressed = false, onClick, style }) {
  return <button className="chip filter" aria-pressed={pressed} onClick={onClick} style={style}>{children}</button>;
}
function MetaChip({ children, tone, style, icon }) {
  return <span className="chip meta" data-tone={tone} style={style}>{icon && <Icon name={icon} size={12} />}{children}</span>;
}

/* ---------- Btn ---------- */
function Btn({ children, variant = 'default', size = 'md', disabled, tooltip, icon, iconRight, onClick, style, href }) {
  const cls = ['btn'];
  if (variant === 'primary') cls.push('btn-primary');
  if (variant === 'danger')  cls.push('btn-danger');
  if (variant === 'ghost')   cls.push('btn-ghost');
  if (size === 'sm') cls.push('btn-sm');
  if (size === 'xs') cls.push('btn-xs');
  const extra = {};
  if (disabled && tooltip) extra['data-tooltip'] = tooltip;
  const content = <>{icon && <Icon name={icon} size={size === 'xs' ? 12 : 14} />}{children}{iconRight && <Icon name={iconRight} size={size === 'xs' ? 12 : 14} />}</>;
  if (href) {
    return <a href={href} className={cls.join(' ')} style={{ textDecoration: 'none', ...style }} {...extra}>{content}</a>;
  }
  return (
    <button type="button" className={cls.join(' ')} aria-disabled={disabled || undefined} onClick={disabled ? undefined : onClick} style={style} {...extra}>{content}</button>
  );
}

/* ---------- Disclosure ---------- */
function Disclosure({ open, onToggle, header, children, level = '', count, style }) {
  return (
    <div style={{ ...style }}>
      <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '6px 0', color: 'var(--fg-muted)', fontSize: 12, fontWeight: 500 }}>
        <Icon name="chevR" size={12} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms var(--ease)' }} />
        <span style={{ color: 'var(--fg)' }}>{header}</span>
        {count != null && <span className="muted">({count})</span>}
        {level && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--fg-subtle)' }}>{level}</span>}
      </button>
      {open && <div className="fade-in">{children}</div>}
    </div>
  );
}

/* ---------- Sidebar (parameterized) ---------- */
function Sidebar({ active = 'hub' }) {
  const nav = [
    { k: 'hub',         label: 'ハブ',           icon: 'hub',      href: '../01-hub/Hub.html', group: null },
    { k: 'queue',       label: '受信トレイ',     icon: 'inbox',    href: '../02-cases/Cases.html', group: '処理' },
    { k: 'approvals',   label: '承認待ち',       icon: 'inboxStack', href: '../03-approvals/Approvals.html', group: '処理' },
    { k: 'proposals',   label: 'AI 提案レビュー', icon: 'sparkles', href: '../05-proposals/Proposals.html', group: '改善' },
    { k: 'agents',      label: 'Agent 設定',     icon: 'agent',    href: '../07-agents/Agents.html', group: '改善' },
    { k: 'observatory', label: 'モニタリング',   icon: 'eye',      href: '../09-observatory/Observatory.html', group: '監視' },
  ];
  let lastGroup = null;
  return (
    <aside style={{ gridArea: 'side', background: 'var(--panel)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
      <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--fg)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>B</div>
          <div className="sidebar-label" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Backoffice AI</span>
            <span className="caption mono" style={{ fontSize: 9, color: 'var(--fg-subtle)' }}>v2 prototype</span>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '10px 8px', overflow: 'auto' }}>
        {nav.map((n) => {
          const showGroup = n.group && n.group !== lastGroup;
          lastGroup = n.group;
          const isActive = n.k === active;
          return (
            <div key={n.k}>
              {showGroup && (
                <div className="sidebar-label" style={{ fontSize: 10, fontWeight: 600, color: 'var(--fg-subtle)', letterSpacing: 1, padding: '10px 10px 4px' }}>{n.group}</div>
              )}
              <a href={n.href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6,
                color: isActive ? 'var(--primary-hover)' : 'var(--fg)',
                background: isActive ? 'var(--primary-soft)' : 'transparent',
                textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 600 : 500, marginBottom: 2,
              }}>
                <Icon name={n.icon} size={16} />
                <span className="sidebar-label">{n.label}</span>
              </a>
            </div>
          );
        })}
      </nav>
      <div style={{ padding: 10, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px' }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: 'var(--panel-inset)', color: 'var(--fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 11 }}>山田</div>
          <div className="sidebar-label" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25, minWidth: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>山田太郎</span>
            <span className="caption" style={{ fontSize: 10 }}>入力者</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ---------- ProcessSelector + TopBar ---------- */
function ProcessSelector({ label = '全業務' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className="caption">業務</span>
      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 28, padding: '0 10px', border: '1px solid var(--border-strong)', borderRadius: 6, background: 'var(--panel)', fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
        {label}
        <Icon name="chevD" size={12} color="var(--fg-muted)" />
      </button>
    </div>
  );
}

function PrototypeModeLabel() {
  return (
    <span data-tooltip="本プロトタイプはメモリ上のモック状態です。永続化なし / 外部システム未接続 / 実顧客データ未使用 / 実規制の引用なし"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 22, padding: '0 8px', borderRadius: 6, background: 'var(--panel-inset)', color: 'var(--fg-muted)', fontSize: 11, fontWeight: 500 }}>
      プロトタイプ表示 — 外部システム未接続 / 証跡はモック
    </span>
  );
}

function TopBar({ processLabel = '全業務' }) {
  return (
    <div className="sticky-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44, padding: '0 16px', borderBottom: '1px solid var(--border)', background: 'var(--panel)' }}>
      <ProcessSelector label={processLabel} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="search" size={16} color="var(--fg-subtle)" aria-hidden />
        <Icon name="bell" size={16} color="var(--fg-subtle)" aria-hidden />
        <PrototypeModeLabel />
        <div style={{ width: 28, height: 28, borderRadius: 14, background: 'var(--panel-inset)', color: 'var(--fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 11 }}>山田</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, StatusBadge, FilterChip, MetaChip, Btn, Disclosure,
  Sidebar, TopBar, ProcessSelector, PrototypeModeLabel,
});
