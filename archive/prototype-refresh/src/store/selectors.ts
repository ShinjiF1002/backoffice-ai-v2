import type { CaseEntity } from './types'
import { actorById, DEMO_ACTORS } from './actors'

/**
 * 案件 actor の単一 SSOT 解決 (F-001、四眼原則の identity 一貫性)。
 *
 * 設計:
 * - **入力者-of-record = `entity.inputApprovedBy` (actorId)** を actor 名に解決する。
 *   一覧の `owner` (= `assignee`、案件担当) は別概念であり、入力者承認を行った actor とは限らない
 *   (例: CASE-2026-0128 は owner=鈴木課長 だが入力者承認は actor-inputter=山田太郎)。
 * - **承認者-of-record = 案件承認 (四眼後半) を担う checker actor (鈴木課長)** に固定。
 *   `Observatory` の `OBS_SOD` と同一 identity になり、一覧/詳細/台帳の表示が収束する。
 * - actor 解決不能時のみ呼び出し側の名前 (mock detail) に fallback。
 *
 * これにより `Approvals` / `CaseDetail` / `Observatory` が同一案件で同一の入力者・承認者名を示し、
 * 表示 identity と reducer の SoD 判定 (`isSelfApproval(inputApprovedBy, currentActorId)`) が一致する。
 */
export interface ResolvedCaseActors {
  inputterActorId?: string
  inputterName: string
  approverActorId?: string
  approverName: string
}

const CHECKER = DEMO_ACTORS.find((a) => a.role === 'checker')

export function resolveCaseActors(
  entity: CaseEntity | undefined,
  fallback?: { inputter?: string; approver?: string },
): ResolvedCaseActors {
  const inputter = actorById(entity?.inputApprovedBy ?? '')
  return {
    inputterActorId: inputter?.id,
    inputterName: inputter?.name ?? fallback?.inputter ?? '—',
    approverActorId: CHECKER?.id,
    approverName: CHECKER?.name ?? fallback?.approver ?? '—',
  }
}
