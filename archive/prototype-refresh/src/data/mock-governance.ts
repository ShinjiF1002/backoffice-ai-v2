/**
 * モデルガバナンス mock (F-039) — モデル台帳 / 独立検証 / drift・bias 監視を表現する参照データ。
 *
 * 規制 framing (honest、SR 26-2 = OCC/FRB/FDIC 3 機関合同 MRM guidance, 2026-04-17):
 * - 本 prototype は **統制を represent する**ものであり、規制準拠 (compliance) を主張しない。
 * - 帳票 OCR / 項目分類 などの **embedded な非生成 model** には SR 26-2 の MRM 原則を適用した governance を表す。
 * - 申請項目の照合 (reconcile) は **deterministic な rule-based 処理**で、SR 26-2 上の「model」ではない (定義除外)。
 * - 生成・agentic な orchestration 層は **SR 26-2 が明示的に scope 外** (脚注3: generative/agentic AI は本 guidance の対象外)。
 *   ゆえに「MRM 準拠」は主張せず、組織が先んじて governance を可視化する forward-looking な good practice として表す。
 * - 実体 (model registry / 独立検証 pipeline / drift 監視) は **本番の別 module (layer-B backend)**。本画面は mock の参照表現。
 */

export type ValidationStatus = '独立検証済' | '検証中' | '要再検証'

/** モデル台帳 1 行 (embedded な非生成 model)。版/用途/所有者/検証状況 + 直近独立検証日。 */
export interface ModelInventoryRow {
  /** 紐づく Agent (route 連携) */
  agentId: string
  process: string
  /** モデル名 (embedded、非生成) */
  model: string
  /** 版 (policy:v3.1 を分解した個別 model 版、決定 lineage の版分解を支える) */
  version: string
  purpose: string
  owner: string
  validation: ValidationStatus
  /** 直近の独立検証日 (challenger/検証チームによる、mock) */
  lastValidated: string
  /** SR 26-2 scope 区分 (honest framing) */
  scope: 'MRM 適用 (非生成 model)' | 'rule-based (model 定義外)' | '生成・agentic (SR 26-2 scope 外)'
}

export const MODEL_INVENTORY: ModelInventoryRow[] = [
  { agentId: 'agent-corporate-address-change', process: '法人住所変更', model: '帳票 OCR', version: 'ocr-2.4', purpose: '申請書類の文字読み取り', owner: 'モデル管理部', validation: '独立検証済', lastValidated: '2026-04-30', scope: 'MRM 適用 (非生成 model)' },
  { agentId: 'agent-corporate-address-change', process: '法人住所変更', model: '項目分類', version: 'cls-1.8', purpose: '読み取り値の項目割当', owner: 'モデル管理部', validation: '要再検証', lastValidated: '2025-12-15', scope: 'MRM 適用 (非生成 model)' },
  { agentId: 'agent-corporate-address-change', process: '法人住所変更', model: '照合ルール', version: 'rule-v3.1', purpose: '登録情報との突合 (確定的)', owner: '業務部', validation: '独立検証済', lastValidated: '2026-05-10', scope: 'rule-based (model 定義外)' },
  { agentId: 'agent-account-opening', process: '口座開設書類完備', model: '帳票 OCR', version: 'ocr-2.4', purpose: '本人確認書類の読み取り', owner: 'モデル管理部', validation: '独立検証済', lastValidated: '2026-04-30', scope: 'MRM 適用 (非生成 model)' },
  { agentId: 'agent-account-opening', process: '口座開設書類完備', model: '項目分類', version: 'cls-1.9', purpose: '書類種別・項目の割当', owner: 'モデル管理部', validation: '検証中', lastValidated: '2026-05-20', scope: 'MRM 適用 (非生成 model)' },
  { agentId: 'agent-account-opening', process: '口座開設書類完備', model: '照合ルール', version: 'rule-v2.7', purpose: '完備チェック (確定的)', owner: '業務部', validation: '独立検証済', lastValidated: '2026-05-10', scope: 'rule-based (model 定義外)' },
]

export const VALIDATION_TONE: Record<ValidationStatus, 'success' | 'primary' | 'alert'> = {
  独立検証済: 'success',
  検証中: 'primary',
  要再検証: 'alert',
}

/** drift / bias 監視 指標 1 行 (mock、すべて [仮説/要検証])。 */
export interface DriftMonitorRow {
  process: string
  metric: string
  /** 監視値 (mock) */
  value: string
  /** 閾値 */
  threshold: string
  status: '安定' | '監視中' | '要確認'
}

export const DRIFT_MONITORS: DriftMonitorRow[] = [
  { process: '法人住所変更', metric: '入力分布 drift (PSI)', value: '0.07', threshold: '< 0.10', status: '安定' },
  { process: '法人住所変更', metric: 'OCR 信頼度の低下傾向', value: '−1.2pt / 30日', threshold: '> −3pt', status: '監視中' },
  { process: '口座開設書類完備', metric: '入力分布 drift (PSI)', value: '0.11', threshold: '< 0.10', status: '要確認' },
  { process: '口座開設書類完備', metric: '書類種別の構成変化', value: '+4pt / 30日', threshold: '< +5pt', status: '監視中' },
]

export const DRIFT_TONE: Record<DriftMonitorRow['status'], 'success' | 'primary' | 'alert'> = {
  安定: 'success',
  監視中: 'primary',
  要確認: 'alert',
}
