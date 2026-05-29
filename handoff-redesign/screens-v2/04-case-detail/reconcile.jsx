// ReconcilePanel + FieldRow primitives for CaseDetail rev.2.
// Changes for pilot review ①②:
//  - 単一 attention band「対応が必要な項目」(要確認/未取得/業務ルール抵触/異常値を統合)
//  - 「正規化一致」badge は UI から削除、「一致」に集約 (表記を自動補正の控えめ注記 + 詳細 expand)
//  - 内部語 (OCR raw, master, 突合, 3 者, confidence) / R-ID / audit event 名 を画面に出さない
//  - aux に独立 Alert panel を置かない
// Exports: ReconcilePanel, AttentionCard, MatchedSection, SourceLocator,
//          AlertDiff, ReconcileLoading.

const { useState, useEffect, useMemo } = React;

/* ---------- AlertDiff: highlight a fragment as "要確認" diff ---------- */
function AlertDiff({ children }) {
  return (
    <span style={{
      background: '#FDE68A',
      color: 'var(--alert-soft-fg)',
      padding: '1px 4px', borderRadius: 3,
      fontWeight: 600,
      borderBottom: '2px solid var(--alert)',
    }}>{children}</span>
  );
}

/* ---------- SourceLocator chip ---------- */
function SourceLocator({ doc, page, region, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 24, padding: '0 10px',
      background: 'var(--panel)',
      border: '1px dashed var(--border-strong)',
      borderRadius: 'var(--r-control)',
      color: 'var(--fg-muted)',
      fontSize: 11,
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
    }}>
      <Icon name="doc" size={12} />
      <span className="mono" style={{ color: 'var(--fg)' }}>{doc}</span>
      <span style={{ color: 'var(--fg-subtle)' }}>·</span>
      <span className="mono">{page}</span>
      <span style={{ color: 'var(--fg-subtle)' }}>·</span>
      <span>{region}</span>
    </button>
  );
}

/* ---------- Category tag for attention band items ---------- */
function CategoryTag({ kind }) {
  const map = {
    '要確認':         { bg: 'var(--alert)',  fg: '#fff' },
    '未取得':         { bg: 'var(--fg)',     fg: '#fff' },
    '業務ルール抵触': { bg: 'var(--error)',  fg: '#fff' },
    '異常値':         { bg: 'var(--error)',  fg: '#fff' },
  };
  const c = map[kind] || map['要確認'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: 20, padding: '0 8px',
      background: c.bg, color: c.fg,
      borderRadius: 'var(--r-chip)',
      fontSize: 11, fontWeight: 600,
      letterSpacing: 0.3,
    }}>[{kind}]</span>
  );
}

/* ---------- Attention card (要確認 / 未取得 / 業務ルール抵触 / 異常値 統合) ---------- */
function AttentionCard({ item, onAcceptApply, onOpenAction }) {
  // item shape:
  //  { kind: '要確認' | '未取得' | '業務ルール抵触' | '異常値',
  //    field, aiValue, ocrValue, ocrDiffParts, locator, hint }
  const isMissing = item.kind === '未取得';

  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderLeft: '3px solid ' + (isMissing ? 'var(--border-strong)' : 'var(--alert)'),
      borderRadius: 'var(--r-card)',
      padding: 14,
    }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <CategoryTag kind={item.kind} />
        <div style={{ fontSize: 15, fontWeight: 600 }}>{item.field}</div>
      </div>

      {/* Hint (平易 JP) */}
      {item.hint && (
        <div className="caption" style={{ marginBottom: 10, color: 'var(--alert-soft-fg)' }}>
          {item.hint}
        </div>
      )}

      {/* AI vs 申請書類 2-col */}
      {!isMissing && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          {/* AI */}
          <div style={{
            background: 'var(--panel-inset)',
            borderRadius: 'var(--r-control)',
            padding: '10px 12px',
          }}>
            <div className="caption" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>AI 入力</span>
              <span style={{ fontSize: 10, color: 'var(--fg-subtle)' }}>現在の登録値</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{item.aiValue}</div>
          </div>
          {/* 申請書類 */}
          <div style={{
            background: 'var(--alert-soft)',
            border: '1px solid #FDE68A',
            borderRadius: 'var(--r-control)',
            padding: '10px 12px',
          }}>
            <div className="caption" style={{ marginBottom: 4 }}>申請書類</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {item.ocrDiffParts
                ? item.ocrDiffParts.map((p, i) => p.alert ? <AlertDiff key={i}>{p.text}</AlertDiff> : <span key={i}>{p.text}</span>)
                : item.ocrValue}
            </div>
          </div>
        </div>
      )}

      {/* Missing — only locator + reason note */}
      {isMissing && (
        <div className="caption" style={{
          marginBottom: 10,
          padding: '8px 10px',
          background: 'var(--panel-inset)',
          borderRadius: 'var(--r-control)',
        }}>
          申請書類のこの欄を読み取れませんでした。再取得を依頼するか、手入力で確定してください。
        </div>
      )}

      {/* Locator + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <SourceLocator doc={item.locator.doc} page={item.locator.page} region={item.locator.region} />
        <div style={{ display: 'flex', gap: 8 }}>
          {!isMissing && (
            <Btn variant="primary" size="sm" icon="check" onClick={() => onAcceptApply(item)}>
              申請値で確定
            </Btn>
          )}
          {isMissing && (
            <Btn size="sm" icon="reload" onClick={() => onOpenAction(item, 'retake')}>
              再取得を依頼
            </Btn>
          )}
          <Btn size="sm" iconRight="chevR" onClick={() => onOpenAction(item)}>
            対応
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------- AttentionBand: single attention surface ---------- */
function AttentionBand({ items, onAcceptApply, onOpenAction }) {
  if (!items || items.length === 0) {
    return (
      <section style={{
        background: 'var(--success-soft)',
        border: '1px solid #A7F3D0',
        borderRadius: 'var(--r-card)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon name="check-circle" size={18} color="var(--success-soft-fg)" />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--success-soft-fg)' }}>
            確認が必要な項目はありません — 承認できます
          </div>
          <div className="caption" style={{ marginTop: 1 }}>
            全項目が AI 入力と申請書類で一致しています。
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{
      background: 'var(--panel)',
      border: '1px solid var(--alert)',
      borderRadius: 'var(--r-card)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 16px',
        background: 'var(--alert-soft)',
        borderBottom: '1px solid #FDE68A',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon name="alert" size={16} color="var(--alert)" />
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--alert-soft-fg)' }}>
          対応が必要な項目 <span className="mono" style={{ color: 'var(--alert-soft-fg)' }}>({items.length})</span>
        </h2>
        <div className="caption" style={{ marginLeft: 'auto', color: 'var(--alert-soft-fg)' }}>
          すべて解消すると承認できます
        </div>
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((it, i) => (
          <AttentionCard
            key={it.field + '-' + i}
            item={it}
            onAcceptApply={onAcceptApply}
            onOpenAction={onOpenAction}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------- Matched row (with optional 表記補正 detail) ---------- */
function MatchedRow({ field, value, mono, autoCorrect }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr auto',
        gap: 16,
        alignItems: 'center',
        padding: '10px 16px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{field}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>{value}</span>
          {autoCorrect && (
            <button
              onClick={() => setOpen(!open)}
              style={{
                background: 'transparent', border: 'none', padding: 0,
                color: 'var(--fg-muted)', fontSize: 11, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 3,
              }}
            >
              <Icon name="check" size={10} color="var(--fg-muted)" />
              表記を自動補正
              <Icon name="chevR" size={10} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms var(--ease)' }} />
            </button>
          )}
        </div>
        <MetaChip tone="success" icon="check">一致</MetaChip>
      </div>
      {autoCorrect && open && (
        <div className="fade-in" style={{
          margin: '0 16px 10px 156px',
          padding: '10px 12px',
          background: 'var(--success-soft)',
          border: '1px solid #A7F3D0',
          borderRadius: 'var(--r-card)',
          fontSize: 12, lineHeight: 1.7,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px 12px' }}>
            <span className="caption">申請書類</span>
            <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>{autoCorrect.before}</span>
            <span className="caption">調整後</span>
            <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'inherit', color: 'var(--success-soft-fg)' }}>{autoCorrect.after}</span>
            <span className="caption">補正ルール</span>
            <span style={{ color: 'var(--fg-muted)' }}>{autoCorrect.rule}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- MatchedSection (default collapsed, single 一致 group) ---------- */
function MatchedSection({ items, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!items || items.length === 0) return null;

  return (
    <section className="panel" style={{ overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', textAlign: 'left',
          padding: '10px 16px',
          background: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', gap: 10,
          color: 'var(--fg)',
        }}
      >
        <Icon name="chevR" size={12} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms var(--ease)' }} />
        <Icon name="check" size={14} color="var(--success-soft-fg)" />
        <span style={{ fontWeight: 600, fontSize: 13 }}>一致</span>
        <span className="muted" style={{ fontSize: 12 }}>({items.length})</span>
        {!open && (
          <span className="caption" style={{ marginLeft: 'auto', display: 'inline-flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {items.map((f) => (
              <span key={f.field} style={{ display: 'inline-flex', gap: 4 }}>
                <span style={{ color: 'var(--fg-muted)' }}>{f.field}</span>
                <span className={f.mono ? 'mono' : ''} style={{ color: 'var(--fg)' }}>{f.value}</span>
                {f.autoCorrect && <Icon name="check" size={10} color="var(--fg-subtle)" />}
              </span>
            ))}
          </span>
        )}
      </button>
      {open && (
        <div className="fade-in">
          {items.map((f) => <MatchedRow key={f.field} {...f} />)}
        </div>
      )}
    </section>
  );
}

/* ---------- Resolved (確認済) row — for items operator overrode ---------- */
function ResolvedSection({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="panel" style={{ overflow: 'hidden', borderColor: 'var(--primary)' }}>
      <div style={{
        padding: '10px 16px',
        background: 'var(--primary-soft)',
        borderBottom: '1px solid #C7D2FE',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon name="pencil-dot" size={14} color="var(--primary-hover)" />
        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary-hover)' }}>確認済</span>
        <span className="muted" style={{ fontSize: 12 }}>({items.length})</span>
        <span className="caption" style={{ marginLeft: 'auto' }}>あなたが確定した項目</span>
      </div>
      {items.map((r) => (
        <div key={r.field} style={{
          display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 16,
          padding: '10px 16px',
          borderTop: '1px solid var(--border)',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{r.field}</div>
          <div>
            <div style={{ fontSize: 13 }}>{r.value}</div>
            <div className="caption" style={{ marginTop: 2 }}>{r.kind === 'accepted' ? '申請書類の値で確定' : `手入力で確定 — 理由: ${r.reason}`}</div>
          </div>
          <MetaChip tone="primary" icon="pencil-dot">確認済</MetaChip>
        </div>
      ))}
    </section>
  );
}

/* ---------- ReconcileLoading skeleton ---------- */
function ReconcileLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="panel" style={{ padding: 14 }}>
        <div className="skeleton" style={{ height: 14, width: 180, marginBottom: 14 }} />
        <div style={{
          padding: 14,
          background: 'var(--panel-inset)',
          borderRadius: 'var(--r-card)',
          marginBottom: 12,
        }}>
          <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 12 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="skeleton" style={{ height: 56 }} />
            <div className="skeleton" style={{ height: 56 }} />
          </div>
        </div>
      </div>
      <div className="panel" style={{ padding: 14 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px', gap: 16, padding: '10px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
            <div className="skeleton" style={{ height: 12, width: 80 }} />
            <div className="skeleton" style={{ height: 12, width: '85%' }} />
            <div className="skeleton" style={{ height: 18, width: 50 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- ReconcilePanel (composes attention band + matched section + resolved) ---------- */
function ReconcilePanel({
  caseState,
  attentionItems,     // unified band items
  matchedItems,       // 一致 (collapsed by default)
  resolvedItems,      // 確認済 (override / accepted)
  matchedOpenDefault,
  onAcceptApply,
  onOpenAction,
  onRetry,
}) {
  if (caseState === 'loading') return <ReconcileLoading />;

  if (caseState === 'error') {
    return (
      <section className="panel" style={{ padding: 14 }}>
        <EmptyState
          tone="error"
          icon="alert"
          title="AI 入力の取得に失敗しました"
          body="しばらく経ってから再試行してください。再試行しても解決しない場合は、業務責任者へ送ってください。"
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn icon="reload" onClick={onRetry}>再試行</Btn>
              <Btn variant="ghost" icon="esc">業務責任者へ送る</Btn>
            </div>
          }
        />
      </section>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 1. 単一 attention band */}
      <AttentionBand
        items={attentionItems}
        onAcceptApply={onAcceptApply}
        onOpenAction={onOpenAction}
      />

      {/* 2. 確認済 (override/accepted by operator) */}
      <ResolvedSection items={resolvedItems} />

      {/* 3. 一致 (default collapsed) */}
      <MatchedSection items={matchedItems} defaultOpen={matchedOpenDefault} key={matchedOpenDefault ? 'o' : 'c'} />
    </div>
  );
}

Object.assign(window, {
  AlertDiff, SourceLocator, CategoryTag,
  AttentionCard, AttentionBand, MatchedRow, MatchedSection, ResolvedSection,
  ReconcileLoading, ReconcilePanel,
});
