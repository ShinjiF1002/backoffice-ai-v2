// Variants A & B for CaseDetail wireframe pilot.
// A. Table 型 reconcile (audit-friendly, dense)
// B. Field card stack (spaced cards, breathing room)

// ---------------- Variant A: Table 型 ----------------
function VariantA() {
  return (
    <CaseDetailFrame width={1280} height={880}>
      {({ mode, hasOpen }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 16, height: '100%' }}>
          {/* Primary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
            <WBox style={{ padding: 14, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>AI 入力結果 — Reconcile</div>
                  <span style={{ fontSize: 11, color: W.muted }}>AI 入力 vs 申請書類 (OCR) の突合</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <WChip tone="amber">⚠ 要確認 1</WChip>
                  <WChip tone="green">≈ 正規化一致 2</WChip>
                  <WChip tone="green">● 一致 2</WChip>
                </div>
              </div>

              {/* Priority: 要確認 */}
              <WBox style={{
                borderLeft: '4px solid ' + W.amber,
                background: W.amberBgSoft,
                padding: 12, marginBottom: 12,
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 110px', gap: 10, alignItems: 'start' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>ビル名</div>
                    <div style={{ fontSize: 10, color: W.muted, marginTop: 2 }}>独立ソース突合</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: W.muted }}>AI 入力</div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>サンプルビル</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: W.muted }}>申請書類 (OCR)</div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>
                      サンプル<span style={{ background: '#fde68a', borderBottom: '2px solid ' + W.amber, padding: '0 2px' }}>ビルディング</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <WStateBadge state="要確認" />
                  </div>
                </div>
                <WSrcLocator
                  doc="corp-address-change-CASE-2026-0142.pdf"
                  page="P.2"
                  region="住所欄"
                  style={{ marginTop: 8 }}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
                  <WBtn small primary>accept (申請書類値)</WBtn>
                  <WBtn small>override (理由必須)</WBtn>
                  <WBtn small>差戻し</WBtn>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: W.muted }}>
                    note: AI=master「サンプルビル」, OCR「サンプルビルディング」— confidence では拾えない
                  </span>
                </div>
              </WBox>

              {/* Matched (collapsed by default, here shown expanded for pilot) */}
              <WBox inset style={{ padding: 10, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                  <span>✓ 一致 / 正規化一致 (4)</span>
                  <span style={{ color: W.muted, fontSize: 11, cursor: 'pointer' }}>折りたたむ ▴</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ color: W.muted, textAlign: 'left', fontSize: 10 }}>
                      <th style={{ padding: '4px 6px', fontWeight: 500, width: '14%' }}>項目</th>
                      <th style={{ padding: '4px 6px', fontWeight: 500, width: '36%' }}>AI 入力</th>
                      <th style={{ padding: '4px 6px', fontWeight: 500, width: '36%' }}>申請書類 (OCR)</th>
                      <th style={{ padding: '4px 6px', fontWeight: 500, width: '14%', textAlign: 'right' }}>状態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { f: '法人名', a: '株式会社サンプルHD', o: '株式会社サンプルＨＤ', s: '正規化一致', diff: 'ＨＤ→HD' },
                      { f: '新住所', a: '東京都千代田区丸の内 2 丁目 3 番 5 号', o: '千代田区丸の内２－３－５', s: '正規化一致', diff: '２－３－５→2 丁目 3 番 5 号' },
                      { f: '支店コード', a: '042', o: '042', s: '一致', mono: true },
                      { f: '効力発生日', a: '2026-06-15', o: '2026-06-15', s: '一致', mono: true },
                    ].map((r) => (
                      <tr key={r.f} style={{ borderTop: W.borderHairline }}>
                        <td style={{ padding: '7px 6px', fontWeight: 600 }}>{r.f}</td>
                        <td style={{ padding: '7px 6px', fontFamily: r.mono ? W.mono : 'inherit' }}>{r.a}</td>
                        <td style={{ padding: '7px 6px', fontFamily: r.mono ? W.mono : 'inherit', color: r.s === '正規化一致' ? W.ink2 : W.ink }}>
                          {r.o}
                          {r.diff && <div style={{ fontSize: 9, color: W.muted, marginTop: 1 }}>正規化: {r.diff}</div>}
                        </td>
                        <td style={{ padding: '7px 6px', textAlign: 'right' }}><WStateBadge state={r.s} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 6, fontSize: 10, color: W.muted, borderTop: W.borderHairline, paddingTop: 6 }}>
                  「正規化内容を見る」: 全角→半角 / 丁目番地表記統一 (詳細 L3 expand)
                </div>
              </WBox>
            </WBox>
          </div>

          {/* Aux */}
          <AuxStandard />
        </div>
      )}
    </CaseDetailFrame>
  );
}

// ---------------- Variant B: Field card stack ----------------
function VariantB() {
  return (
    <CaseDetailFrame width={1280} height={880}>
      {({ mode, hasOpen }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 16, height: '100%' }}>
          {/* Primary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>AI 入力結果 — Reconcile</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <WChip tone="amber">⚠ 要確認 1</WChip>
                <WChip tone="green">≈ 正規化一致 2</WChip>
                <WChip tone="green">● 一致 2</WChip>
              </div>
            </div>

            {/* 要確認 card (expanded) */}
            <WBox style={{
              borderLeft: '4px solid ' + W.amber,
              background: W.amberBgSoft,
              padding: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: W.muted, marginBottom: 2 }}>項目 1 / 5 · 要確認</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>ビル名</div>
                </div>
                <WStateBadge state="要確認" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <WBox inset style={{ padding: 10 }}>
                  <div style={{ fontSize: 10, color: W.muted, marginBottom: 4 }}>AI 入力 (= master)</div>
                  <div style={{ fontSize: 14 }}>サンプルビル</div>
                </WBox>
                <WBox inset style={{ padding: 10, borderLeft: '3px solid ' + W.amber }}>
                  <div style={{ fontSize: 10, color: W.muted, marginBottom: 4 }}>申請書類 OCR</div>
                  <div style={{ fontSize: 14 }}>
                    サンプル<span style={{ background: '#fde68a', borderBottom: '2px solid ' + W.amber, padding: '0 3px' }}>ビルディング</span>
                  </div>
                </WBox>
              </div>
              <WSrcLocator
                doc="corp-address-change-CASE-2026-0142.pdf"
                page="P.2"
                region="住所欄"
                style={{ marginTop: 10 }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                <WBtn primary>申請値で accept</WBtn>
                <WBtn>override (理由必須)</WBtn>
                <WBtn>差戻し</WBtn>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: W.muted }}>
                  AI も OCR も高 confidence — 独立ソース突合で検出
                </span>
              </div>
            </WBox>

            {/* 正規化一致 cards */}
            <WBox style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, borderBottom: W.borderHairline, color: W.muted, display: 'flex', justifyContent: 'space-between' }}>
                <span>≈ 正規化一致 (2)</span>
                <span style={{ cursor: 'pointer' }}>折りたたむ ▴</span>
              </div>
              {[
                { f: '法人名', a: '株式会社サンプルHD', o: '株式会社サンプルＨＤ', diff: '全角ＨＤ → 半角HD' },
                { f: '新住所', a: '東京都千代田区丸の内 2 丁目 3 番 5 号', o: '千代田区丸の内２－３－５', diff: '２－３－５ → 2 丁目 3 番 5 号 / 都名補完' },
              ].map((r, i) => (
                <div key={r.f} style={{ padding: '8px 12px', borderTop: i ? W.borderHairline : 'none', display: 'grid', gridTemplateColumns: '110px 1fr 1fr auto', gap: 10, alignItems: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{r.f}</div>
                  <div style={{ fontSize: 12 }}>{r.a}</div>
                  <div style={{ fontSize: 12, color: W.ink2 }}>
                    {r.o}
                    <div style={{ fontSize: 9, color: W.muted, marginTop: 1 }}>{r.diff}</div>
                  </div>
                  <WStateBadge state="正規化一致" />
                </div>
              ))}
            </WBox>

            {/* 一致 cards */}
            <WBox style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, borderBottom: W.borderHairline, color: W.muted, display: 'flex', justifyContent: 'space-between' }}>
                <span>● 一致 (2)</span>
                <span style={{ cursor: 'pointer' }}>展開 ▾</span>
              </div>
              <div style={{ padding: '6px 12px', display: 'flex', gap: 16, fontSize: 11, color: W.ink2 }}>
                <span><b>支店コード</b> <span style={{ fontFamily: W.mono }}>042</span></span>
                <span style={{ color: W.hairline }}>·</span>
                <span><b>効力発生日</b> <span style={{ fontFamily: W.mono }}>2026-06-15</span></span>
              </div>
            </WBox>
          </div>

          {/* Aux */}
          <AuxStandard />
        </div>
      )}
    </CaseDetailFrame>
  );
}

Object.assign(window, { VariantA, VariantB });
