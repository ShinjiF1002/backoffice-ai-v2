// rev.3 — 文書アンカー型 2-pane: DocumentViewer (左) + InputPane (右)
// 左右リンク: activeField を共有し、行 click → PDF 該当欄ハイライト + scroll、
//             PDF 欄 click → 行ハイライト。
// reconcile.jsx の AlertDiff / SourceLocator / CategoryTag を再利用。
const { useState, useEffect, useRef } = React;

/* ====================================================================
   左 pane: 申請書類ビューア (読めるサイズ、faux PDF — mock §11)
   ==================================================================== */
function DocumentViewer({ activeField, onRegionClick, page = 2, totalPages = 3 }) {
  const regionRefs = useRef({});
  const scrollRef = useRef(null);

  // field → PDF region key
  const fieldToRegion = {
    '法人名': 'corp',
    '新住所': 'address',
    'ビル名': 'address',
    '支店コード': 'branch',
    '効力発生日': 'effective',
  };
  const activeRegion = activeField ? fieldToRegion[activeField] : null;

  useEffect(() => {
    if (activeRegion && regionRefs.current[activeRegion] && scrollRef.current) {
      const el = regionRefs.current[activeRegion];
      const container = scrollRef.current;
      const top = el.offsetTop - container.offsetTop - 24;
      container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  }, [activeRegion]);

  const Region = ({ id, label, children, highlight }) => {
    const isActive = activeRegion === id;
    const isHL = highlight; // 住所欄は常時 amber 枠
    return (
      <div
        ref={(el) => { regionRefs.current[id] = el; }}
        onClick={() => onRegionClick && onRegionClick(id)}
        style={{
          position: 'relative',
          padding: isHL ? '10px 12px' : '7px 10px',
          margin: isHL ? '10px 0' : '2px 0',
          border: isHL
            ? '2px solid var(--alert)'
            : isActive ? '2px solid var(--primary)' : '2px solid transparent',
          background: isActive
            ? 'var(--primary-soft)'
            : isHL ? 'var(--alert-soft)' : 'transparent',
          borderRadius: 4,
          cursor: onRegionClick ? 'pointer' : 'default',
          transition: 'background 200ms var(--ease), border-color 200ms var(--ease)',
        }}
      >
        {(isHL || isActive) && label && (
          <span style={{
            position: 'absolute', top: -10, left: 8,
            background: isActive ? 'var(--primary)' : 'var(--alert)',
            color: '#fff',
            fontSize: 9, fontWeight: 700,
            padding: '1px 7px', borderRadius: 2,
            fontFamily: 'var(--font-sans)',
            letterSpacing: 0.3,
          }}>{label}</span>
        )}
        {children}
      </div>
    );
  };

  return (
    <section className="panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      {/* viewer header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--panel-inset)',
        flex: '0 0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="doc" size={14} color="var(--fg-muted)" />
          <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>CASE-2026-0142.pdf</span>
          <span className="caption mono">P.{page} / {totalPages}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="btn btn-xs btn-ghost" aria-label="前のページ"><Icon name="chevR" size={13} style={{ transform: 'rotate(180deg)' }} /></button>
          <button className="btn btn-xs btn-ghost" aria-label="次のページ"><Icon name="chevR" size={13} /></button>
          <span style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 2px' }} />
          <button className="btn btn-xs btn-ghost" aria-label="拡大"><span style={{ fontSize: 14, lineHeight: 1 }}>⊕</span></button>
        </div>
      </div>

      {/* paper */}
      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', background: '#E9EBEF', padding: 20 }}>
        <div style={{
          maxWidth: 480, margin: '0 auto',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(15,23,42,0.12)',
          borderRadius: 2,
          padding: '32px 36px',
          fontFamily: "'Noto Serif JP', serif",
          color: '#1a1a1a',
          minHeight: 620,
          position: 'relative',
        }}>
          {/* title */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: 4 }}>法人住所変更届</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 6, fontFamily: 'var(--font-sans)' }}>受付番号 CASE-2026-0142 ／ 提出日 2026-05-30</div>
            <div style={{ width: 60, height: 2, background: '#1a1a1a', margin: '12px auto 0' }} />
          </div>

          <div style={{ fontSize: 13, lineHeight: 2 }}>
            <Region id="corp" label="法人名">
              <span style={{ color: '#666', fontSize: 11, fontFamily: 'var(--font-sans)' }}>法人名　</span>
              株式会社サンプルＨＤ
            </Region>

            <Region id="branch" label="支店コード">
              <span style={{ color: '#666', fontSize: 11, fontFamily: 'var(--font-sans)' }}>支店コード　</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>０４２</span>
            </Region>

            <Region id="address" label="住所欄" highlight>
              <div style={{ color: '#666', fontSize: 11, fontFamily: 'var(--font-sans)', marginBottom: 2 }}>新所在地</div>
              <div>東京都千代田区丸の内２－３－５</div>
              <div>サンプル<span style={{ background: '#FDE68A', borderBottom: '2px solid var(--alert)', padding: '0 2px' }}>ビルディング</span>８Ｆ</div>
            </Region>

            <Region id="effective" label="効力発生日">
              <span style={{ color: '#666', fontSize: 11, fontFamily: 'var(--font-sans)' }}>効力発生日　</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>２０２６年６月１５日</span>
            </Region>

            <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px dashed #ccc', display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#666', fontSize: 11, fontFamily: 'var(--font-sans)', marginBottom: 6 }}>代表者署名</div>
                <div style={{ height: 44, border: '1px solid #d0d0d0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 11, fontFamily: 'var(--font-sans)' }}>署名欄</div>
              </div>
              <div style={{ width: 80 }}>
                <div style={{ color: '#666', fontSize: 11, fontFamily: 'var(--font-sans)', marginBottom: 6 }}>印</div>
                <div style={{ height: 44, border: '1px solid #d0d0d0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 10, fontFamily: 'var(--font-sans)' }}>㊞</div>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 12, right: 18, fontSize: 10, color: '#999', fontFamily: 'var(--font-mono)' }}>P.{page} / {totalPages}</div>
        </div>
      </div>
    </section>
  );
}

/* ====================================================================
   右 pane: AI 入力項目 全件 (隠さない)
   ==================================================================== */
function InputAttentionRow({ item, active, onActivate, onOpen }) {
  return (
    <div
      onMouseEnter={() => onActivate(item.field)}
      onClick={() => onOpen(item)}
      style={{
        background: active ? 'var(--alert-soft)' : 'var(--panel)',
        border: '1px solid ' + (active ? 'var(--alert)' : '#FDE68A'),
        borderLeft: '3px solid var(--alert)',
        borderRadius: 'var(--r-card)',
        padding: 14,
        cursor: 'pointer',
        transition: 'background 150ms var(--ease), border-color 150ms var(--ease)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <CategoryTag kind={item.kind} />
        <div style={{ fontSize: 15, fontWeight: 600 }}>{item.field}</div>
        <Icon name="chevR" size={14} color="var(--fg-subtle)" style={{ marginLeft: 'auto' }} />
      </div>
      {item.hint && (
        <div className="caption" style={{ marginBottom: 10, color: 'var(--alert-soft-fg)' }}>{item.hint}</div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div style={{ background: 'var(--panel-inset)', borderRadius: 'var(--r-control)', padding: '8px 10px' }}>
          <div className="caption" style={{ marginBottom: 3, display: 'flex', justifyContent: 'space-between' }}>
            <span>AI 入力</span><span style={{ fontSize: 10, color: 'var(--fg-subtle)' }}>現在の登録値</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{item.aiValue}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #FDE68A', borderRadius: 'var(--r-control)', padding: '8px 10px' }}>
          <div className="caption" style={{ marginBottom: 3 }}>申請書類</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            {item.ocrDiffParts
              ? item.ocrDiffParts.map((p, i) => p.alert ? <AlertDiff key={i}>{p.text}</AlertDiff> : <span key={i}>{p.text}</span>)
              : item.ocrValue}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <SourceLocator
          doc={item.locator.doc} page={item.locator.page} region={item.locator.region}
          onClick={(e) => { e.stopPropagation(); onActivate(item.field); }}
        />
        <span className="caption" style={{ color: 'var(--alert-soft-fg)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          クリックで対応 <Icon name="chevR" size={12} />
        </span>
      </div>
    </div>
  );
}

function InputMissingRow({ item, active, onActivate, onOpen }) {
  return (
    <div
      onMouseEnter={() => onActivate(item.field)}
      onClick={() => onOpen(item)}
      style={{
        background: active ? 'var(--panel-inset)' : 'var(--panel)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--border-strong)',
        borderRadius: 'var(--r-card)',
        padding: 14, cursor: 'pointer',
        transition: 'background 150ms var(--ease)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <CategoryTag kind="未取得" />
        <div style={{ fontSize: 15, fontWeight: 600 }}>{item.field}</div>
        <Icon name="chevR" size={14} color="var(--fg-subtle)" style={{ marginLeft: 'auto' }} />
      </div>
      <div className="caption" style={{ marginBottom: 8 }}>
        申請書類のこの欄を読み取れませんでした。再取得を依頼するか、手入力で確定してください。
      </div>
      <SourceLocator
        doc={item.locator.doc} page={item.locator.page} region={item.locator.region}
        onClick={(e) => { e.stopPropagation(); onActivate(item.field); }}
      />
    </div>
  );
}

function InputMatchedRow({ item, active, onActivate }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onMouseEnter={() => onActivate(item.field)}
      style={{
        border: '1px solid ' + (active ? 'var(--primary)' : 'var(--border)'),
        borderRadius: 'var(--r-card)',
        background: active ? 'var(--primary-soft)' : 'var(--panel)',
        transition: 'background 150ms var(--ease), border-color 150ms var(--ease)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 12, alignItems: 'center', padding: '10px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-muted)' }}>{item.field}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontFamily: item.mono ? 'var(--font-mono)' : 'inherit', fontWeight: 500 }}>{item.value}</span>
          {item.autoCorrect && (
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
              style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--fg-muted)', fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }}
            >
              表記を自動補正
              <Icon name="chevR" size={10} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms var(--ease)' }} />
            </button>
          )}
        </div>
        <MetaChip tone="success" icon="check">一致</MetaChip>
      </div>
      {item.autoCorrect && open && (
        <div className="fade-in" style={{ margin: '0 12px 10px 132px', padding: '8px 10px', background: 'var(--success-soft)', border: '1px solid #A7F3D0', borderRadius: 'var(--r-control)', fontSize: 12, lineHeight: 1.6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '3px 10px' }}>
            <span className="caption">申請書類</span><span style={{ fontFamily: item.mono ? 'var(--font-mono)' : 'inherit' }}>{item.autoCorrect.before}</span>
            <span className="caption">調整後</span><span style={{ fontFamily: item.mono ? 'var(--font-mono)' : 'inherit', color: 'var(--success-soft-fg)' }}>{item.autoCorrect.after}</span>
            <span className="caption">補正</span><span style={{ color: 'var(--fg-muted)' }}>{item.autoCorrect.rule}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function InputResolvedRow({ item, active, onActivate }) {
  return (
    <div
      onMouseEnter={() => onActivate(item.field)}
      style={{
        border: '1px solid ' + (active ? 'var(--primary)' : '#C7D2FE'),
        borderLeft: '3px solid var(--primary)',
        borderRadius: 'var(--r-card)',
        background: 'var(--primary-soft)',
        padding: '10px 12px',
        display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 12, alignItems: 'center',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.field}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{item.value}</div>
        <div className="caption" style={{ marginTop: 1 }}>
          {item.kind === 'accepted' ? '申請書類の値で確定' : `手入力で確定 — ${item.reason}`}
        </div>
      </div>
      <MetaChip tone="primary" icon="pencil-dot">確認済</MetaChip>
    </div>
  );
}

function InputPane({ caseState, attentionItems, matchedItems, resolvedItems, activeField, setActiveField, onOpenAction, onRetry }) {
  if (caseState === 'loading') {
    return (
      <section className="panel" style={{ padding: 14, height: '100%' }}>
        <div className="skeleton" style={{ height: 16, width: 160, marginBottom: 16 }} />
        {[0,1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: i === 0 ? 92 : 44, marginBottom: 10, borderRadius: 8 }} />)}
      </section>
    );
  }
  if (caseState === 'error') {
    return (
      <section className="panel" style={{ padding: 14, height: '100%' }}>
        <EmptyState
          tone="error" icon="alert"
          title="AI 入力の取得に失敗しました"
          body="しばらく経ってから再試行してください。解決しない場合は業務責任者へ送ってください。"
          action={<div style={{ display: 'flex', gap: 8 }}><Btn icon="reload" onClick={onRetry}>再試行</Btn><Btn variant="ghost" icon="esc">業務責任者へ送る</Btn></div>}
        />
      </section>
    );
  }

  const openCount = attentionItems.length;
  const doneCount = matchedItems.length + resolvedItems.length;

  return (
    <section className="panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      {/* header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: '0 0 auto' }}>
        <h2 className="h2" style={{ margin: 0 }}>AI 入力項目</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {openCount > 0 && <MetaChip tone="alert" icon="alert">要確認 {openCount}</MetaChip>}
          <MetaChip tone="success" icon="check">確認済 {doneCount}</MetaChip>
        </div>
      </div>

      {/* scroll body — all items default visible */}
      <div style={{ flex: 1, overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 対応が必要な項目 */}
        {openCount > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon name="alert" size={15} color="var(--alert)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--alert-soft-fg)' }}>対応が必要な項目</span>
              <span className="mono caption" style={{ color: 'var(--alert-soft-fg)' }}>({openCount})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {attentionItems.map((it) => (
                it.kind === '未取得'
                  ? <InputMissingRow key={it.field} item={it} active={activeField === it.field} onActivate={setActiveField} onOpen={onOpenAction} />
                  : <InputAttentionRow key={it.field} item={it} active={activeField === it.field} onActivate={setActiveField} onOpen={onOpenAction} />
              ))}
            </div>
          </div>
        )}

        {openCount === 0 && (
          <div style={{ background: 'var(--success-soft)', border: '1px solid #A7F3D0', borderRadius: 'var(--r-card)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="check-circle" size={18} color="var(--success-soft-fg)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--success-soft-fg)' }}>確認が必要な項目はありません — 承認できます</span>
          </div>
        )}

        {/* 確認済 (resolved by operator) */}
        {resolvedItems.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon name="pencil-dot" size={15} color="var(--primary-hover)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-hover)' }}>あなたが確定した項目</span>
              <span className="mono caption">({resolvedItems.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {resolvedItems.map((it) => (
                <InputResolvedRow key={it.field} item={it} active={activeField === it.field} onActivate={setActiveField} />
              ))}
            </div>
          </div>
        )}

        {/* 確認済 (一致) — 全件可視、折りたたまない */}
        {matchedItems.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon name="check" size={15} color="var(--success-soft-fg)" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>確認済 (一致)</span>
              <span className="mono caption">({matchedItems.length})</span>
              <span className="caption" style={{ marginLeft: 'auto' }}>行をクリックすると左の書類で位置を確認できます</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {matchedItems.map((it) => (
                <InputMatchedRow key={it.field} item={it} active={activeField === it.field} onActivate={setActiveField} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

Object.assign(window, { DocumentViewer, InputPane });
