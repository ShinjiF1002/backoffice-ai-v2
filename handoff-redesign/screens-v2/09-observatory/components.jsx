// 横断 component — MetricVsThreshold / ConsequencePanel / LifecycleStepperGeneric /
//   ReasonDialog / DiffText。ProposalDetail / AgentDetail で共用。
// chrome.jsx の Icon / MetaChip / Btn / StatusBadge / Disclosure に依存。
const { useState, useEffect, useRef } = React;

/* ====================================================================
   MetricVsThreshold (R-AGENT-02 / R-PROP-02)
   実績値 vs 閾値 vs 達成判定。L1: 指標/実績/閾値/判定/期間/分母。
   ==================================================================== */
function MetricVsThreshold({ title, subtitle, rows, hypothesis = true }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <section className="panel" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className="h2" style={{ margin: 0 }}>{title}</h2>
          {subtitle && <div className="caption" style={{ marginTop: 2 }}>{subtitle}</div>}
        </div>
        {hypothesis && <span className="chip meta" style={{ fontSize: 10 }}>仮説/要検証 · mock 値</span>}
      </div>

      {/* column header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.1fr', gap: 12, padding: '8px 16px', background: 'var(--panel-inset)', borderBottom: '1px solid var(--border)' }}>
        {['指標', '実績値', '基準', '判定'].map((h, i) => (
          <span key={i} className="caption" style={{ fontWeight: 600, fontSize: 11, color: 'var(--fg-muted)', textAlign: i === 0 ? 'left' : 'right' }}>{h}</span>
        ))}
      </div>

      {rows.map((r, i) => {
        const ok = r.achieved;
        const open = expanded === i;
        return (
          <div key={r.metricLabel} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div
              onClick={() => setExpanded(open ? null : i)}
              style={{
                display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.1fr', gap: 12,
                padding: '12px 16px', alignItems: 'center', cursor: 'pointer',
                background: ok ? 'transparent' : 'var(--alert-soft)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
                <Icon name="chevR" size={11} color="var(--fg-subtle)" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms var(--ease)' }} />
                {r.metricLabel}
              </span>
              <span className="mono" style={{ fontSize: 14, fontWeight: 600, textAlign: 'right' }}>{r.actualValue}</span>
              <span className="mono caption" style={{ fontSize: 12, textAlign: 'right' }}>{r.threshold}</span>
              <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <MetaChip tone={ok ? 'success' : 'alert'} icon={ok ? 'check' : 'alert'}>{r.judgment}</MetaChip>
              </span>
            </div>
            {open && (
              <div className="fade-in" style={{ padding: '0 16px 12px 38px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div><div className="caption">対象期間</div><div style={{ fontSize: 12 }}>{r.period || '—'}</div></div>
                <div><div className="caption">分母 (母数)</div><div style={{ fontSize: 12 }} className="mono">{r.denominator || '—'}</div></div>
                <div><div className="caption">前回差</div><div style={{ fontSize: 12 }}>{r.previousDelta || '—'}</div></div>
                {r.exclusions && <div style={{ gridColumn: '1 / -1' }}><div className="caption">除外条件</div><div style={{ fontSize: 12 }}>{r.exclusions}</div></div>}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

/* ====================================================================
   ConsequencePanel (R-AGENT-03 / R-PROP-03)
   before/after の 2 列 + 影響サマリ (減る↓ / 増える↑ / 止められる🛡)。
   ==================================================================== */
function ConsequencePanel({ title, before, after, impacts, scope, hypothesis = true }) {
  return (
    <section className="panel" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="h2" style={{ margin: 0 }}>{title}</h2>
        {hypothesis && <span className="chip meta" style={{ fontSize: 10 }}>仮説/要検証 · mock 値</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* before / after */}
        <div style={{ padding: 16, borderRight: '1px solid var(--border)' }}>
          <div className="caption" style={{ marginBottom: 8 }}>変更前 → 変更後</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 12px', background: 'var(--panel-inset)', borderRadius: 'var(--r-control)', fontSize: 13, fontWeight: 500 }}>{before}</span>
            <Icon name="arrowRight" size={16} color="var(--fg-subtle)" />
            <span style={{ padding: '6px 12px', background: 'var(--primary-soft)', color: 'var(--primary-hover)', borderRadius: 'var(--r-control)', fontSize: 13, fontWeight: 600 }}>{after}</span>
          </div>
          {scope && (
            <div style={{ marginTop: 12 }}>
              <div className="caption" style={{ marginBottom: 4 }}>適用対象</div>
              <div style={{ fontSize: 12 }}>{scope}</div>
            </div>
          )}
        </div>

        {/* impacts */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="caption">影響</div>
          {impacts.map((im, i) => {
            const color = im.dir === 'down' ? 'var(--success-soft-fg)' : im.dir === 'up' ? 'var(--alert-soft-fg)' : 'var(--primary-hover)';
            const bg    = im.dir === 'down' ? 'var(--success-soft)' : im.dir === 'up' ? 'var(--alert-soft)' : 'var(--primary-soft)';
            const sym   = im.dir === 'down' ? '↓' : im.dir === 'up' ? '↑' : '🛡';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 10px', background: bg, borderRadius: 'var(--r-control)' }}>
                <span style={{ color, fontWeight: 700, fontSize: 13, flex: '0 0 auto' }}>{sym}</span>
                <span style={{ fontSize: 12, color: 'var(--fg)' }}>{im.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ====================================================================
   Generic Lifecycle Stepper (proposal / agent などで共用)
   ==================================================================== */
function StepperGeneric({ steps, current }) {
  return (
    <ol style={{ display: 'flex', alignItems: 'center', gap: 0, margin: 0, padding: 0, listStyle: 'none' }}>
      {steps.map((s, i) => {
        const done = i < current, here = i === current;
        return (
          <li key={s} style={{ display: 'flex', alignItems: 'center', flex: i === steps.length - 1 ? '0 0 auto' : 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
              <span style={{
                width: 18, height: 18, borderRadius: 9,
                border: '1.5px solid ' + (done || here ? 'var(--primary)' : 'var(--border-strong)'),
                background: done ? 'var(--primary)' : 'var(--panel)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
              }}>
                {done && <Icon name="check" size={11} color="#fff" strokeWidth={2.4} />}
                {here && <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--primary)' }} />}
              </span>
              <span style={{ fontSize: 12, fontWeight: here ? 600 : 500, color: here ? 'var(--primary-hover)' : done ? 'var(--fg)' : 'var(--fg-muted)' }}>{s}</span>
            </div>
            {i < steps.length - 1 && <span style={{ flex: 1, height: 0, borderTop: '1.5px ' + (done ? 'solid var(--primary)' : 'dashed var(--border-strong)'), margin: '0 12px', minWidth: 20 }} />}
          </li>
        );
      })}
    </ol>
  );
}

/* ====================================================================
   ReasonDialog — reject / 差戻し の理由必須入力 (即 error + focus)
   ==================================================================== */
function ReasonDialog({ open, title, label, placeholder, submitLabel, tone = 'danger', onClose, onSubmit, outcome }) {
  const [comment, setComment] = useState('');
  const [err, setErr] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (open) { setComment(''); setErr(false); } }, [open]);
  useEffect(() => { if (err && comment.trim()) setErr(false); }, [comment]);
  if (!open) return null;
  const submit = () => {
    if (!comment.trim()) { setErr(true); requestAnimationFrame(() => ref.current?.focus()); return; }
    onSubmit(comment.trim()); onClose();
  };
  return (
    <div role="dialog" aria-modal="true" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn 200ms var(--ease)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 520, maxWidth: '100%', background: 'var(--panel)', borderRadius: 'var(--r-card)', boxShadow: '0 24px 48px rgba(15,23,42,0.18), 0 0 0 1px var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="h2" style={{ margin: 0 }}>{title}</h2>
          <Btn variant="ghost" size="xs" icon="x" onClick={onClose}>閉じる</Btn>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div className="h3" style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--fg)' }}>
              <span>{label}</span>
              {err && <span style={{ color: 'var(--error-soft-fg)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}><Icon name="alert" size={12} color="var(--error)" />理由を入力してください</span>}
            </div>
            <textarea
              ref={ref} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={placeholder} rows={4} aria-invalid={err || undefined}
              style={{ width: '100%', padding: 10, fontSize: 13, lineHeight: 1.6, border: '1px solid ' + (err ? 'var(--error)' : 'var(--border-strong)'), borderRadius: 'var(--r-control)', outline: 'none', resize: 'vertical', background: err ? 'var(--error-soft)' : 'var(--panel)', color: 'var(--fg)', fontFamily: 'var(--font-sans)' }}
            />
          </div>
          {outcome && (
            <div style={{ padding: '8px 10px', background: 'var(--panel-inset)', borderRadius: 'var(--r-control)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="reload" size={14} color="var(--fg-muted)" />
              <span className="caption" style={{ color: 'var(--fg)' }}>{outcome}</span>
            </div>
          )}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--panel-inset)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn onClick={onClose}>キャンセル</Btn>
          <Btn variant={tone} icon="reload" onClick={submit}>{submitLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MetricVsThreshold, ConsequencePanel, StepperGeneric, ReasonDialog });
