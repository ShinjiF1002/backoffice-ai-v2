// 統合「項目の対応」modal (pilot review ③)
// override / 差戻し / エスカレーション を 1 つの modal に統合。window.prompt 廃止。
// case-level の差戻し (footer) も同じ modal を field 未指定で開く。
// Exports: FieldActionModal, SENDBACK_CATEGORIES.

const { useState, useEffect, useRef, useMemo } = React;

const SENDBACK_CATEGORIES = [
  { k: 'doc-defect',    label: '申請書類不備',     desc: '記載漏れ / 押印欠落 / 添付不足 等' },
  { k: 'ocr-fail',      label: '読み取り不能',     desc: 'スキャン品質低 / 該当欄が読めない' },
  { k: 'ai-error',      label: 'AI 入力誤り',      desc: '前回値との大きな乖離 等' },
  { k: 'rule-conflict', label: '業務ルール抵触',   desc: '効力日 < 受付日 / 桁数不正 等' },
  { k: 'other',         label: 'その他',           desc: '上記以外 (理由を詳細に記載)' },
];

const ESCALATE_TARGETS = [
  { k: 'manager',       label: '業務責任者' },
  { k: 'section-head',  label: '担当課長' },
  { k: 'legal',         label: '法務' },
];

function ActionRadio({ active, value, label, desc, icon, onSelect }) {
  return (
    <button
      onClick={() => onSelect(value)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 12px',
        border: '1px solid ' + (active ? 'var(--primary)' : 'var(--border)'),
        background: active ? 'var(--primary-soft)' : 'var(--panel)',
        borderRadius: 'var(--r-control)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'border-color 150ms var(--ease), background 150ms var(--ease)',
      }}
    >
      <span style={{
        width: 16, height: 16, borderRadius: 8,
        border: '1.5px solid ' + (active ? 'var(--primary)' : 'var(--border-strong)'),
        background: active ? 'var(--primary)' : 'var(--panel)',
        flex: '0 0 auto', marginTop: 2,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#fff' }} />}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        {icon && <Icon name={icon} size={14} color={active ? 'var(--primary-hover)' : 'var(--fg-muted)'} />}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--primary-hover)' : 'var(--fg)' }}>{label}</div>
          <div className="caption" style={{ marginTop: 1 }}>{desc}</div>
        </div>
      </div>
    </button>
  );
}

function OutcomeNote({ action }) {
  const map = {
    accept:    { tone: 'primary', icon: 'check',      text: '申請書類の値でこの案件内を確定し、承認へ進みます。' },
    override:  { tone: 'primary', icon: 'pencil-dot', text: 'この案件内で確定し、承認へ進みます。' },
    sendback:  { tone: 'alert',   icon: 'reload',     text: '差戻すと AI が再処理し、再び確認待ちに戻ります。' },
    escalate:  { tone: 'alert',   icon: 'esc',        text: '業務責任者の判断に委ね、案件はその担当へ移ります。' },
  };
  const m = map[action];
  if (!m) return null;
  const bg = m.tone === 'primary' ? 'var(--primary-soft)' : 'var(--alert-soft)';
  const fg = m.tone === 'primary' ? 'var(--primary-hover)' : 'var(--alert-soft-fg)';
  const bd = m.tone === 'primary' ? '#C7D2FE' : '#FDE68A';
  return (
    <div style={{
      padding: '8px 10px',
      background: bg,
      border: '1px solid ' + bd,
      borderRadius: 'var(--r-control)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <Icon name={m.icon} size={14} color={fg} />
      <span style={{ fontSize: 12, color: fg, fontWeight: 500 }}>{m.text}</span>
    </div>
  );
}

function FieldContext({ field }) {
  if (!field) return null;
  return (
    <div style={{
      padding: 12,
      background: 'var(--panel-inset)',
      borderRadius: 'var(--r-card)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CategoryTag kind={field.kind || '要確認'} />
        <span style={{ fontSize: 14, fontWeight: 600 }}>{field.field}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div className="caption" style={{ marginBottom: 2 }}>AI 入力</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{field.aiValue || '—'}</div>
        </div>
        <div>
          <div className="caption" style={{ marginBottom: 2 }}>申請書類</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {field.ocrDiffParts
              ? field.ocrDiffParts.map((p, i) => p.alert ? <AlertDiff key={i}>{p.text}</AlertDiff> : <span key={i}>{p.text}</span>)
              : (field.ocrValue || '—')}
          </div>
        </div>
      </div>
      {field.locator && (
        <SourceLocator doc={field.locator.doc} page={field.locator.page} region={field.locator.region} />
      )}
    </div>
  );
}

function ErrorLine({ show, msg }) {
  if (!show) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      color: 'var(--error-soft-fg)', fontSize: 11, fontWeight: 500,
    }}>
      <Icon name="alert" size={12} color="var(--error)" />
      {msg}
    </div>
  );
}

function Textarea({ value, onChange, placeholder, rows = 4, error, ariaLabel, errKey }) {
  return (
    <textarea
      aria-label={ariaLabel}
      data-error-target={errKey}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      aria-invalid={error || undefined}
      style={{
        width: '100%',
        padding: 10,
        fontSize: 13, lineHeight: 1.6,
        border: '1px solid ' + (error ? 'var(--error)' : 'var(--border-strong)'),
        borderRadius: 'var(--r-control)',
        outline: 'none',
        resize: 'vertical',
        background: error ? 'var(--error-soft)' : 'var(--panel)',
        color: 'var(--fg)',
        fontFamily: 'var(--font-sans)',
        transition: 'border-color 150ms var(--ease), background 150ms var(--ease)',
      }}
      onFocus={(e) => { if (!error) e.target.style.borderColor = 'var(--primary)'; }}
      onBlur={(e) => { e.target.style.borderColor = error ? 'var(--error)' : 'var(--border-strong)'; }}
    />
  );
}

function TextInput({ value, onChange, placeholder, error, ariaLabel, errKey }) {
  return (
    <input
      type="text"
      aria-label={ariaLabel}
      data-error-target={errKey}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-invalid={error || undefined}
      style={{
        width: '100%',
        height: 36,
        padding: '0 12px',
        fontSize: 14,
        border: '1px solid ' + (error ? 'var(--error)' : 'var(--border-strong)'),
        borderRadius: 'var(--r-control)',
        outline: 'none',
        background: error ? 'var(--error-soft)' : 'var(--panel)',
        color: 'var(--fg)',
        fontFamily: 'var(--font-sans)',
      }}
      onFocus={(e) => { if (!error) e.target.style.borderColor = 'var(--primary)'; }}
      onBlur={(e) => { e.target.style.borderColor = error ? 'var(--error)' : 'var(--border-strong)'; }}
    />
  );
}

function FieldActionModal({ open, field, defaultAction, onClose, onSubmit }) {
  // field: { field, aiValue, ocrValue, ocrDiffParts, locator, kind } or null (case-level)
  // defaultAction: 'override' | 'sendback' | 'escalate'
  const isCaseLevel = !field;
  const hasOcr = field && (field.ocrValue || field.ocrDiffParts) && field.kind !== '未取得';
  const [action, setAction] = useState(defaultAction || (isCaseLevel ? 'sendback' : (hasOcr ? 'accept' : 'override')));
  const [overrideValue, setOverrideValue] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [sendbackCategory, setSendbackCategory] = useState('doc-defect');
  const [sendbackComment, setSendbackComment] = useState('');
  const [escalateTarget, setEscalateTarget] = useState('manager');
  const [escalateReason, setEscalateReason] = useState('');
  const [errors, setErrors] = useState({}); // { override_value, override_reason, sendback_comment, escalate_reason }
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setAction(defaultAction || (isCaseLevel ? 'sendback' : (hasOcr ? 'accept' : 'override')));
      setOverrideValue(field?.ocrValue || '');
      setOverrideReason('');
      setSendbackCategory('doc-defect');
      setSendbackComment('');
      setEscalateTarget('manager');
      setEscalateReason('');
      setErrors({});
    }
  }, [open, defaultAction, isCaseLevel, field]);

  // Clear errors as user types
  useEffect(() => { if (errors.override_value && overrideValue.trim()) setErrors((p) => ({ ...p, override_value: false })); }, [overrideValue]);
  useEffect(() => { if (errors.override_reason && overrideReason.trim()) setErrors((p) => ({ ...p, override_reason: false })); }, [overrideReason]);
  useEffect(() => { if (errors.sendback_comment && sendbackComment.trim()) setErrors((p) => ({ ...p, sendback_comment: false })); }, [sendbackComment]);
  useEffect(() => { if (errors.escalate_reason && escalateReason.trim()) setErrors((p) => ({ ...p, escalate_reason: false })); }, [escalateReason]);

  if (!open) return null;

  const handleSubmit = () => {
    const newErrors = {};
    let focusKey = null;
    if (action === 'accept') {
      // 申請書類値で確定 — 入力不要
    } else if (action === 'override') {
      if (!overrideValue.trim())  { newErrors.override_value  = true; focusKey = focusKey || 'override_value'; }
      if (!overrideReason.trim()) { newErrors.override_reason = true; focusKey = focusKey || 'override_reason'; }
    } else if (action === 'sendback') {
      if (!sendbackComment.trim()) { newErrors.sendback_comment = true; focusKey = focusKey || 'sendback_comment'; }
    } else if (action === 'escalate') {
      if (!escalateReason.trim()) { newErrors.escalate_reason = true; focusKey = focusKey || 'escalate_reason'; }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-error-target="${focusKey}"]`);
        el?.focus();
      });
      return;
    }
    if (action === 'accept') {
      onSubmit({ action: 'accept', field: field?.field, value: field?.ocrValue });
    } else if (action === 'override') {
      onSubmit({ action, field: field?.field, value: overrideValue.trim(), reason: overrideReason.trim() });
    } else if (action === 'sendback') {
      onSubmit({ action, field: field?.field, category: sendbackCategory, comment: sendbackComment.trim() });
    } else if (action === 'escalate') {
      onSubmit({ action, field: field?.field, target: escalateTarget, reason: escalateReason.trim() });
    }
    onClose();
  };

  const submitLabel = action === 'accept' ? '申請書類の値で確定'
                    : action === 'override' ? '上書きで確定'
                    : action === 'sendback' ? '差戻しを送信'
                    : '業務責任者へ送る';
  const submitVariant = (action === 'accept' || action === 'override') ? 'primary' : 'danger';
  const submitIcon = action === 'accept' ? 'check' : action === 'override' ? 'check' : action === 'sendback' ? 'reload' : 'esc';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-title"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 200ms var(--ease)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 640, maxWidth: '100%', maxHeight: '90vh',
          background: 'var(--panel)',
          borderRadius: 'var(--r-card)',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18), 0 0 0 1px var(--border)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 id="action-title" className="h2" style={{ margin: 0 }}>
              {isCaseLevel ? '案件の差戻し' : '項目の対応'}
            </h2>
            <div className="caption" style={{ marginTop: 2 }}>
              <span className="mono" style={{ color: 'var(--fg)' }}>CASE-2026-0142</span>
              {!isCaseLevel && <> · 対象 <strong style={{ color: 'var(--fg)', fontWeight: 500 }}>{field.field}</strong></>}
            </div>
          </div>
          <Btn variant="ghost" size="xs" icon="x" onClick={onClose}>閉じる</Btn>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Field context */}
          {!isCaseLevel && <FieldContext field={field} />}

          {/* Action selector */}
          <div>
            <div className="h3" style={{ marginBottom: 8, color: 'var(--fg)' }}>対応の選択</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {!isCaseLevel && hasOcr && (
                <ActionRadio
                  active={action === 'accept'}
                  value="accept"
                  icon="check"
                  label="申請書類の値で確定"
                  desc={'申請書類の値「' + (field.ocrValue || '') + '」でこの項目を確定する。'}
                  onSelect={setAction}
                />
              )}
              {!isCaseLevel && (
                <ActionRadio
                  active={action === 'override'}
                  value="override"
                  icon="pencil-dot"
                  label="手入力で上書き"
                  desc="この項目だけを操作者の判断で確定する。値と理由が必須。"
                  onSelect={setAction}
                />
              )}
              <ActionRadio
                active={action === 'sendback'}
                value="sendback"
                icon="reload"
                label={isCaseLevel ? '差戻し' : 'この項目で差戻し'}
                desc="案件全体を AI / 申請者へ戻し、再処理を依頼する。"
                onSelect={setAction}
              />
              <ActionRadio
                active={action === 'escalate'}
                value="escalate"
                icon="esc"
                label="エスカレーション"
                desc="自分では判断できない。業務責任者の判断を仰ぐ。"
                onSelect={setAction}
              />
            </div>
          </div>

          {/* 申請値で確定 — 入力不要 */}
          {action === 'accept' && !isCaseLevel && (
            <div className="fade-in" style={{ padding: '10px 12px', background: 'var(--panel-inset)', borderRadius: 'var(--r-control)', fontSize: 13, lineHeight: 1.6 }}>
              申請書類の値 <strong>「{field.ocrValue}」</strong> で <strong>{field.field}</strong> を確定します。追加の入力は不要です。
            </div>
          )}

          {/* Per-action form */}
          {action === 'override' && !isCaseLevel && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div className="h3" style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--fg)' }}>
                  <span>上書き値 (必須)</span>
                  <ErrorLine show={errors.override_value} msg="値を入力してください" />
                </div>
                <TextInput
                  ariaLabel="上書き値"
                  errKey="override_value"
                  value={overrideValue}
                  onChange={setOverrideValue}
                  placeholder={field.ocrValue || '値を入力'}
                  error={errors.override_value}
                />
                <div className="caption" style={{ marginTop: 4 }}>
                  申請書類値で確定する場合は band の「申請値で確定」を使う方が早いです。
                </div>
              </div>
              <div>
                <div className="h3" style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--fg)' }}>
                  <span>上書き理由 (必須)</span>
                  <ErrorLine show={errors.override_reason} msg="理由を入力してください" />
                </div>
                <Textarea
                  ariaLabel="上書き理由"
                  errKey="override_reason"
                  value={overrideReason}
                  onChange={setOverrideReason}
                  placeholder="例: 申請書類に押印付きで「サンプルビルディング」と記載あり。AI 入力の旧表記が古い。"
                  rows={3}
                  error={errors.override_reason}
                />
              </div>
            </div>
          )}

          {action === 'sendback' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div className="h3" style={{ marginBottom: 8, color: 'var(--fg)' }}>差戻し理由 (必須・1 つ選択)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {SENDBACK_CATEGORIES.map((c) => (
                    <ActionRadio
                      key={c.k}
                      active={sendbackCategory === c.k}
                      value={c.k}
                      label={c.label}
                      desc={c.desc}
                      onSelect={setSendbackCategory}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="h3" style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--fg)' }}>
                  <span>コメント (必須)</span>
                  <ErrorLine show={errors.sendback_comment} msg="コメントを入力してください" />
                </div>
                <Textarea
                  ariaLabel="差戻しコメント"
                  errKey="sendback_comment"
                  value={sendbackComment}
                  onChange={setSendbackComment}
                  placeholder={'差戻し先 (担当 Agent / 申請者) が読んで直せるよう、具体的に書いてください。\n例: 「ビル名が申請書類と異なります。「サンプルビルディング」で再入力をお願いします。」'}
                  rows={4}
                  error={errors.sendback_comment}
                />
                <div className="caption" style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <span>未入力では送信できません</span>
                  <span className="mono">{sendbackComment.length} / 500</span>
                </div>
              </div>
            </div>
          )}

          {action === 'escalate' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div className="h3" style={{ marginBottom: 8, color: 'var(--fg)' }}>送り先</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ESCALATE_TARGETS.map((t) => (
                    <FilterChip
                      key={t.k}
                      pressed={escalateTarget === t.k}
                      onClick={() => setEscalateTarget(t.k)}
                    >
                      {t.label}
                    </FilterChip>
                  ))}
                </div>
              </div>
              <div>
                <div className="h3" style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--fg)' }}>
                  <span>送付理由 (必須)</span>
                  <ErrorLine show={errors.escalate_reason} msg="理由を入力してください" />
                </div>
                <Textarea
                  ariaLabel="エスカレーション理由"
                  errKey="escalate_reason"
                  value={escalateReason}
                  onChange={setEscalateReason}
                  placeholder="例: 申請書類のビル名表記が登録基準と異なるが、両方とも有効性があり、自分の権限では判断できない。"
                  rows={3}
                  error={errors.escalate_reason}
                />
              </div>
            </div>
          )}

          {/* Outcome */}
          <OutcomeNote action={action} />
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--panel-inset)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="caption">
            {isCaseLevel
              ? '案件全体を差戻します'
              : action === 'accept' ? '対象は ' + field.field + ' のみ'
              : action === 'override' ? '対象は ' + field.field + ' のみ'
              : action === 'sendback' ? '案件全体が差戻されます'
              : '案件は業務責任者へ移ります'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={onClose}>キャンセル</Btn>
            <Btn variant={submitVariant} icon={submitIcon} onClick={handleSubmit}>
              {submitLabel}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FieldActionModal, SENDBACK_CATEGORIES, ESCALATE_TARGETS });
