// Variants C & D for CaseDetail wireframe pilot.
// C. Triage hero — 要確認 1 件が primary col の上部を占有、一致は 1 行 summary
// D. Document-anchored split — primary col 内左 = 申請書類 mini preview、右 = 抽出 field

// ---------------- Variant C: Triage hero ----------------
function VariantC() {
  return (
    <CaseDetailFrame width={1280} height={880}>
      {({ mode, hasOpen }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 16, height: '100%' }}>
          {/* Primary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
            {/* Triage banner: 今やること */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 11, color: W.muted, letterSpacing: 1 }}>今やること</span>
                <span style={{ fontSize: 22, fontWeight: 700 }}>要確認 1 項目</span>
              </div>
              <div style={{ display: 'flex', gap: 6, fontSize: 11 }}>
                <WChip tone="green">≈ 正規化一致 2 / ● 一致 2 (全 OK)</WChip>
              </div>
            </div>

            {/* Hero: 要確認 1 項目 */}
            <WBox style={{
              borderLeft: '6px solid ' + W.amber,
              background: W.amberBgSoft,
              padding: 18,
              flex: 1,
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: W.amberInk, marginBottom: 2, fontWeight: 600 }}>⚠ AI 入力 と 申請書類 (OCR) が一致しない</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>ビル名</div>
                  <div style={{ fontSize: 11, color: W.muted, marginTop: 3 }}>
                    検出経路: 独立ソース突合 (AI=master だが OCR 異なる、業務ルール: 番地・ビル名は OCR を一次ソースとする)
                  </div>
                </div>
                <WStateBadge state="要確認" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <WBox inset style={{ padding: 14 }}>
                  <div style={{ fontSize: 11, color: W.muted, marginBottom: 6 }}>AI 入力 (= master 旧値)</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>サンプルビル</div>
                </WBox>
                <WBox inset style={{ padding: 14, borderLeft: '4px solid ' + W.amber }}>
                  <div style={{ fontSize: 11, color: W.muted, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span>申請書類 OCR</span>
                    <span style={{ fontFamily: W.mono, fontSize: 9 }}>OCR raw</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    サンプル<span style={{ background: '#fde68a', borderBottom: '2.5px solid ' + W.amber, padding: '0 3px' }}>ビルディング</span>
                  </div>
                </WBox>
              </div>

              <WSrcLocator
                doc="corp-address-change-CASE-2026-0142.pdf"
                page="P.2"
                region="住所欄 — ビル名行"
              />

              <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: W.borderHairline, display: 'flex', gap: 10, alignItems: 'center' }}>
                <WBtn primary>申請値で accept</WBtn>
                <WBtn>override (理由必須)</WBtn>
                <WBtn>差戻し (コメント付き)</WBtn>
                <WBtn small style={{ marginLeft: 'auto' }}>↑ escalate</WBtn>
              </div>
            </WBox>

            {/* Compact summary of OK fields */}
            <WBox style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 14, fontSize: 11, color: W.ink2, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600 }}>確認済</span>
                <span><WStateBadge state="正規化一致" /> 法人名</span>
                <span><WStateBadge state="正規化一致" /> 新住所</span>
                <span><WStateBadge state="一致" /> 支店コード</span>
                <span><WStateBadge state="一致" /> 効力発生日</span>
              </div>
              <span style={{ fontSize: 11, color: W.muted, cursor: 'pointer' }}>詳細 ▾</span>
            </WBox>
          </div>

          {/* Aux */}
          <AuxStandard compact />
        </div>
      )}
    </CaseDetailFrame>
  );
}

// ---------------- Variant D: Document-anchored split ----------------
function VariantD() {
  return (
    <CaseDetailFrame width={1280} height={880}>
      {({ mode, hasOpen }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 16, height: '100%' }}>
          {/* Primary: doc preview (left) + field list (right) */}
          <WBox style={{ padding: 0, overflow: 'hidden', display: 'flex' }}>
            {/* Doc preview */}
            <div style={{
              width: '45%', borderRight: W.border, background: '#fafaf9',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ padding: '8px 12px', borderBottom: W.borderHairline, fontSize: 11, fontWeight: 600, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: W.mono, fontSize: 10 }}>📄 CASE-2026-0142.pdf · P.2 / 3</span>
                <div style={{ display: 'flex', gap: 4, fontSize: 10, color: W.muted }}>
                  <span style={{ cursor: 'pointer' }}>◀</span>
                  <span style={{ cursor: 'pointer' }}>▶</span>
                  <span style={{ marginLeft: 6, cursor: 'pointer' }}>⊕</span>
                </div>
              </div>
              <div style={{ flex: 1, padding: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Faux PDF page */}
                <div style={{ background: '#fff', border: '1.5px solid ' + W.hairline, padding: 16, fontFamily: '"Noto Serif JP", serif', fontSize: 11, color: W.ink2, lineHeight: 1.8, position: 'relative', flex: 1, overflow: 'hidden' }}>
                  <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: W.ink, marginBottom: 12, fontFamily: 'inherit' }}>法人住所変更届</div>
                  <div style={{ borderBottom: '1px dotted ' + W.hairline, paddingBottom: 6, marginBottom: 6 }}>
                    <span style={{ color: W.muted, fontSize: 10 }}>法人名 </span>株式会社サンプルＨＤ
                  </div>
                  <div style={{ borderBottom: '1px dotted ' + W.hairline, paddingBottom: 6, marginBottom: 6 }}>
                    <span style={{ color: W.muted, fontSize: 10 }}>支店コード </span><span style={{ fontFamily: W.mono }}>042</span>
                  </div>
                  <div style={{
                    border: '2px solid ' + W.amber,
                    borderRadius: 3,
                    background: '#fffbeb',
                    padding: '8px 10px',
                    marginBottom: 6,
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute', top: -10, left: -2,
                      background: W.amber, color: '#fff', fontSize: 9, padding: '1px 6px', borderRadius: 2, fontFamily: W.font, fontWeight: 700,
                    }}>住所欄 — 突合中</span>
                    <div style={{ fontSize: 10, color: W.muted, marginBottom: 2 }}>新住所</div>
                    千代田区丸の内２－３－５<br />
                    サンプル<span style={{ background: '#fde68a', borderBottom: '2px solid ' + W.amber }}>ビルディング</span>８Ｆ
                  </div>
                  <div style={{ borderBottom: '1px dotted ' + W.hairline, paddingBottom: 6, marginBottom: 6 }}>
                    <span style={{ color: W.muted, fontSize: 10 }}>効力発生日 </span><span style={{ fontFamily: W.mono }}>2026-06-15</span>
                  </div>
                  <div style={{ marginTop: 10, color: W.muted, fontSize: 10 }}>—— 押印 / 署名欄 ——</div>
                  <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 9, color: W.muted, fontFamily: W.mono }}>P.2 / 3</div>
                </div>
              </div>
            </div>

            {/* Field list */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ padding: '10px 14px', borderBottom: W.borderHairline, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>AI 入力 (5 field)</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <WChip tone="amber">⚠ 1</WChip>
                  <WChip tone="green">≈ 2</WChip>
                  <WChip tone="green">● 2</WChip>
                </div>
              </div>
              <div style={{ flex: 1, overflow: 'auto' }}>
                {[
                  { f: '法人名', v: '株式会社サンプルHD', src: 'P.2 法人名欄', s: '正規化一致' },
                  { f: '新住所', v: '東京都千代田区丸の内 2 丁目 3 番 5 号', src: 'P.2 住所欄', s: '正規化一致' },
                  { f: 'ビル名', v: 'サンプルビル', src: 'P.2 住所欄', s: '要確認', active: true,
                    ocr: 'サンプルビルディング' },
                  { f: '支店コード', v: '042', src: 'P.2 支店コード欄', s: '一致', mono: true },
                  { f: '効力発生日', v: '2026-06-15', src: 'P.2 効力日欄', s: '一致', mono: true },
                ].map((r) => (
                  <div key={r.f} style={{
                    padding: '10px 14px',
                    borderBottom: W.borderHairline,
                    background: r.active ? W.amberBgSoft : 'transparent',
                    borderLeft: r.active ? '4px solid ' + W.amber : '4px solid transparent',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{r.f}</div>
                      <WStateBadge state={r.s} />
                    </div>
                    <div style={{ fontSize: 12, fontFamily: r.mono ? W.mono : 'inherit', color: W.ink }}>{r.v}</div>
                    {r.ocr && (
                      <div style={{ fontSize: 11, color: W.ink2, marginTop: 2 }}>
                        申請: サンプル<span style={{ background: '#fde68a', borderBottom: '2px solid ' + W.amber, padding: '0 2px' }}>ビルディング</span>
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: W.muted, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: W.mono, cursor: 'pointer', textDecoration: 'underline dotted', textUnderlineOffset: 2 }}>↪ {r.src}</span>
                      {r.active && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <WBtn small primary>accept</WBtn>
                          <WBtn small>override</WBtn>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </WBox>

          {/* Aux (narrower) */}
          <AuxStandard compact />
        </div>
      )}
    </CaseDetailFrame>
  );
}

Object.assign(window, { VariantC, VariantD });
