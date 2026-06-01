/**
 * 承認待ち (Approvals) mock — screen-contracts-v2 §3 / screens-v2/03-approvals
 * status = business-approval-waiting の案件。row → CaseDetail (承認者ビュー)。
 * 別担当者による確認 (承認者 ≠ 入力者) を明示。
 */
export interface ApprovalRow {
  id: string
  workflow: string
  /** 入力者の判断 */
  judgement: 'approved' | 'modified'
  modifiedCount: number
  inputter: string
  approver: string
  elapsed: string
}

export const APPROVAL_LIST: ApprovalRow[] = [
  { id: 'CASE-2026-0128', workflow: '法人住所変更', judgement: 'modified', modifiedCount: 1, inputter: '山田太郎', approver: '鈴木課長', elapsed: '5時間30分' },
  { id: 'CASE-2026-0210', workflow: '口座開設書類完備', judgement: 'approved', modifiedCount: 0, inputter: '佐藤花子', approver: '高橋部長', elapsed: '1時間05分' },
]
