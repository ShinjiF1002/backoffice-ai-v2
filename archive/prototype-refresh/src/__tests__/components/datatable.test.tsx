import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { DataTable } from '@/components/shared/DataTable'
import type { DataTableColumn, DataTableFilter } from '@/components/shared/DataTable'
import { VERIFICATION_EXTRA_CASES } from '@/data/mock-case-list'
import type { CaseListRow } from '@/data/mock-case-list'

// Phase 3 — DataTable keystone の契約検証 (sort / filter+reset / pagination / selection / empty / Link)。
// jsdom は CSS media query 非適用 → desktop table と mobile card が両方 DOM に出るため、
// desktop の assertion は within(table) で scope する。
interface Row {
  id: string
  name: string
  status: string
  owner: string
}
const ROWS: Row[] = [
  { id: 'A-1', name: 'アルファ', status: 'open', owner: '山田' },
  { id: 'A-2', name: 'ベータ', status: 'done', owner: '鈴木' },
  { id: 'A-3', name: 'ガンマ', status: 'open', owner: '山田' },
]
const columns: DataTableColumn<Row>[] = [
  { key: 'id', header: 'ID', cell: (r) => r.id, sortValue: (r) => r.id },
  { key: 'name', header: '名前', cell: (r) => r.name },
  { key: 'status', header: '状態', cell: (r) => r.status, sortValue: (r) => r.status },
  { key: 'owner', header: '担当', cell: (r) => r.owner },
]
const filters: DataTableFilter<Row>[] = [
  {
    id: 'status',
    label: '状態',
    options: [
      { value: 'open', label: '対応中' },
      { value: 'done', label: '完了' },
    ],
    predicate: (r, v) => v.includes(r.status),
  },
]

function renderTable(extra: Record<string, unknown> = {}) {
  return render(
    <MemoryRouter>
      <DataTable
        rows={ROWS}
        columns={columns}
        rowKey={(r: Row) => r.id}
        rowHref={(r: Row) => `/x/${r.id}`}
        ariaLabel="テスト表"
        filters={filters}
        {...extra}
      />
    </MemoryRouter>,
  )
}

describe('DataTable (Phase 3)', () => {
  it('行を render し、先頭セルが正しい href の Link になる', () => {
    renderTable()
    const table = screen.getByRole('table', { name: 'テスト表' })
    expect(within(table).getByRole('link', { name: 'A-1' })).toHaveAttribute('href', '/x/A-1')
  })

  it('filter で絞り込み、解除で復元', async () => {
    const user = userEvent.setup()
    renderTable()
    const table = screen.getByRole('table', { name: 'テスト表' })
    await user.click(screen.getByText('完了'))
    expect(within(table).getByText('A-2')).toBeInTheDocument()
    expect(within(table).queryByText('A-1')).not.toBeInTheDocument()
    await user.click(screen.getByText('絞り込みを解除'))
    expect(within(table).getByText('A-1')).toBeInTheDocument()
  })

  it('filter 0 件で filtered-empty + 解除 action', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DataTable
          rows={[{ id: 'A-1', name: 'a', status: 'open', owner: '山田' }]}
          columns={columns}
          rowKey={(r: Row) => r.id}
          rowHref={(r: Row) => `/x/${r.id}`}
          ariaLabel="テスト表"
          filters={filters}
        />
      </MemoryRouter>,
    )
    await user.click(screen.getByText('完了')) // open 行のみ → 0 件
    expect(screen.getByText('条件に一致する項目がありません')).toBeInTheDocument()
  })

  it('sort: 状態 header click で並び替え (done→open)', async () => {
    const user = userEvent.setup()
    renderTable()
    const table = screen.getByRole('table', { name: 'テスト表' })
    await user.click(within(table).getByRole('button', { name: /状態/ }))
    const linkOrder = within(table)
      .getAllByRole('link')
      .map((l) => l.textContent)
    expect(linkOrder).toEqual(['A-2', 'A-1', 'A-3']) // done(A-2) 先頭、open は安定順
  })

  it('pagination: pageSize=2 で 2 行 + pager、次へ で残り', async () => {
    const user = userEvent.setup()
    renderTable({ pageSize: 2 })
    const table = screen.getByRole('table', { name: 'テスト表' })
    expect(within(table).getAllByRole('link')).toHaveLength(2)
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    await user.click(screen.getByText('次へ'))
    expect(within(screen.getByRole('table', { name: 'テスト表' })).getAllByRole('link')).toHaveLength(1)
  })

  it('selection: 全選択で一括バー + 件数表示', async () => {
    const user = userEvent.setup()
    renderTable({ selection: { actions: [{ label: '一括承認', onRun: vi.fn() }] } })
    await user.click(screen.getByLabelText('表示中をすべて選択'))
    expect(screen.getByText('3 件選択中')).toBeInTheDocument()
    expect(screen.getByText('一括承認')).toBeInTheDocument()
  })

  it('selection: filter で hidden になった選択は件数・payload から除外 (scope 正規化)', async () => {
    const user = userEvent.setup()
    const onRun = vi.fn()
    renderTable({ selection: { actions: [{ label: '一括承認', onRun }] } })
    await user.click(screen.getByLabelText('表示中をすべて選択'))
    expect(screen.getByText('3 件選択中')).toBeInTheDocument()
    await user.click(screen.getByText('完了')) // A-2 のみ表示、A-1/A-3 は hidden
    expect(screen.getByText('1 件選択中')).toBeInTheDocument()
    await user.click(screen.getByText('一括承認'))
    expect(onRun).toHaveBeenCalledWith(['A-2']) // hidden 行は payload に混入しない
  })

  it('selection: mobile card にも checkbox がある', () => {
    renderTable({ selection: { actions: [{ label: '一括承認', onRun: vi.fn() }] } })
    const list = screen.getByRole('list') // mobile の ul
    expect(within(list).getAllByRole('checkbox')).toHaveLength(3)
  })

  it('pinTop: 固定行が先頭、filter とも両立', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DataTable
          rows={ROWS}
          columns={columns}
          rowKey={(r: Row) => r.id}
          rowHref={(r: Row) => `/x/${r.id}`}
          ariaLabel="テスト表"
          filters={filters}
          pinTop={(r: Row) => r.id === 'A-3'}
        />
      </MemoryRouter>,
    )
    const order = () =>
      within(screen.getByRole('table', { name: 'テスト表' }))
        .getAllByRole('link')
        .map((l) => l.textContent)
    expect(order()[0]).toBe('A-3') // pinned 先頭
    await user.click(screen.getByText('対応中')) // open のみ → A-1, A-3 (A-2=done は除外)
    const after = order()
    expect(after[0]).toBe('A-3') // filter 後も pinned 先頭
    expect(after).toContain('A-1')
    expect(after).not.toContain('A-2')
  })

  it('axe violations なし (selection 込み)', async () => {
    const { container } = renderTable({ selection: { actions: [{ label: '一括承認', onRun: vi.fn() }] } })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('empty: rows=[] で EmptyState', () => {
    render(
      <MemoryRouter>
        <DataTable rows={[]} columns={columns} rowKey={(r: Row) => r.id} rowHref={(r: Row) => `/x/${r.id}`} ariaLabel="空表" />
      </MemoryRouter>,
    )
    expect(screen.getByText('該当する項目がありません')).toBeInTheDocument()
  })
})

// remediation B3 / gate 3=案A — 検証 fixture (VERIFICATION_EXTRA_CASES) は業務 CASE_LIST から分離され
// seed/Hub/KPI 母数 (=13) に混ざらない。pagination の実動検証は「test-only 注入」で担保する契約のため、
// 当該 fixture を実 DataTable に注入して 20 行 → 2 ページの pagination が回ることを本 test で閉じる。
describe('DataTable × VERIFICATION_EXTRA_CASES (gate 3A: pagination を test-only 注入で担保)', () => {
  const vrfColumns: DataTableColumn<CaseListRow>[] = [
    { key: 'id', header: '案件 ID', cell: (r) => r.id, sortValue: (r) => r.id },
    { key: 'status', header: '状態', cell: (r) => r.status, sortValue: (r) => r.status },
    { key: 'owner', header: '担当', cell: (r) => (r.owner === '—' ? '未割当' : r.owner) },
  ]

  it('検証 fixture 20 行を注入すると pageSize=10 で 2 ページに pagination する', async () => {
    const user = userEvent.setup()
    expect(VERIFICATION_EXTRA_CASES).toHaveLength(20)
    render(
      <MemoryRouter>
        <DataTable
          rows={VERIFICATION_EXTRA_CASES}
          columns={vrfColumns}
          rowKey={(r) => r.id}
          rowHref={(r) => `/cases/${r.id}`}
          ariaLabel="検証案件"
          pageSize={10}
        />
      </MemoryRouter>,
    )
    const table = screen.getByRole('table', { name: '検証案件' })
    expect(within(table).getAllByRole('link')).toHaveLength(10) // page 1 = 10 行
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    await user.click(screen.getByText('次へ'))
    // page 2 = 残り 10 行 (注入 fixture が DataTable contract 上で pagination 可能なことを担保)
    expect(within(screen.getByRole('table', { name: '検証案件' })).getAllByRole('link')).toHaveLength(10)
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })
})
