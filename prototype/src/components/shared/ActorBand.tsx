import { Bot, User, Cog } from 'lucide-react'
import type { Actor } from '@/data/types'
import { actorColorClass, actorLabelJa } from '@/lib/actor-mapping'
import { cn } from '@/lib/cn'

/**
 * ActorBand — F-5 Wave 2 PR 2 Commit 5 (Implementation Plan v3.0、gate1-decision.md F-5 採用案 A spec)
 *
 * Card 1 ai-native-hil-approval-ui の "icon prefix + color band で agent/human/system 区別" 部分:
 *  - 4px ::before 風 left color band + lucide icon prefix
 *  - agent=indigo Bot / human=slate-600 User / system=slate-400 Cog
 *  - size: sm (h-5、Inbox queue 高密度行) / md (h-7、AuditTrail row 等)
 *
 * Operational Premium Light 規範:
 *  - 新規 token 0 (既存 --color-primary / slate-600 / slate-400 binding)
 *  - row height 不変 (4px band は ::before pseudo ではなく flex item で表現、icon size に依存)
 *  - 装飾要素 0 (avatar halo / gradient / 3D 全禁止)
 *
 * Day 19 EvidenceTimeline actor paraphrase との整合: actor enum を `lib/actor-mapping.ts` で 3-enum に normalize
 */

const actorIcons = { agent: Bot, human: User, system: Cog }

interface ActorBandProps {
  /** Actor (3-enum、`lib/actor-mapping.ts` の mapping table 経由) */
  actor: Actor
  /** Display label (e.g. '田中 美咲' / 'AI 抽出 v2.3' / '反映 system')、未指定なら actorLabelJa default */
  label?: string
  /** size variant */
  size?: 'sm' | 'md'
  /** aria-label / tooltip 用、role 詳細 (入力者 / 承認者 等) を補足 */
  role?: string
  className?: string
}

export function ActorBand({ actor, label, size = 'sm', role, className }: ActorBandProps) {
  const Icon = actorIcons[actor]
  const isMd = size === 'md'
  const displayLabel = label ?? actorLabelJa[actor]
  const aria = role ? `${actorLabelJa[actor]} (${role}): ${displayLabel}` : displayLabel

  return (
    <span
      aria-label={aria}
      title={role ? `${role}` : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md pl-0 pr-1.5',
        isMd ? 'h-7' : 'h-5',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn('block h-full w-[3px] flex-shrink-0 rounded-sm', actorColorClass[actor])}
      />
      <Icon
        aria-hidden="true"
        className={cn(
          'flex-shrink-0',
          isMd ? 'h-3.5 w-3.5' : 'h-3 w-3',
          actor === 'agent' ? 'text-[var(--color-primary)]' : actor === 'human' ? 'text-slate-600' : 'text-slate-400'
        )}
      />
      <span
        className={cn(
          'min-w-0 truncate text-slate-700',
          isMd ? 'text-[12px]' : 'text-[11px]'
        )}
      >
        {displayLabel}
      </span>
    </span>
  )
}
