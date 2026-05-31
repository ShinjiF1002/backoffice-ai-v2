import { useRef, useState } from 'react'

/**
 * Toast state + 制御 (F-027)。Toast 表示 primitive は `components/shared/Toast`。
 * 非 sticky は 2.8s で自動消滅、sticky は手動 dismiss まで残る (統制重要 event の見落とし防止)。
 * show 既定は success / 非 sticky (既存 confirmation 挙動を踏襲)。
 */
export type ToastTone = 'success' | 'alert' | 'error'
export interface ToastState {
  message: string
  tone: ToastTone
  /** auto-dismiss を無効化し手動 dismiss を要求 (統制重要 event)。 */
  sticky: boolean
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const dismiss = () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = undefined
    setToast(null)
  }
  const show = (message: string, opts?: { tone?: ToastTone; sticky?: boolean }) => {
    if (timer.current) window.clearTimeout(timer.current)
    const sticky = opts?.sticky ?? false
    setToast({ message, tone: opts?.tone ?? 'success', sticky })
    timer.current = sticky ? undefined : window.setTimeout(() => setToast(null), 2800)
  }
  return { toast, show, dismiss }
}
