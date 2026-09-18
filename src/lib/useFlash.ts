import { useCallback, useEffect, useRef, useState } from "react"

export type FlashType = "success" | "error"

export interface FlashMessageData {
  type: FlashType
  message: string
}

const AUTO_HIDE_DELAY_MS = 3000

// 呼び出し側のEffectが通知の更新で再実行されないよう、返す関数の参照をuseCallbackで維持する。
export function useFlash() {
  const [flash, setFlash] = useState<FlashMessageData | null>(null)

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 前の通知のタイマーが、新しく表示した通知を消さないようにする。
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const showFlash = useCallback(
    (type: FlashType, message: string) => {
      clearHideTimer()
      setFlash({ type, message })
      hideTimerRef.current = setTimeout(() => setFlash(null), AUTO_HIDE_DELAY_MS)
    },
    [clearHideTimer],
  )

  const showSuccessFlash = useCallback(
    (message: string) => showFlash("success", message),
    [showFlash],
  )

  const showErrorFlash = useCallback(
    (message: string) => showFlash("error", message),
    [showFlash],
  )

  const clearFlash = useCallback(() => {
    clearHideTimer()
    setFlash(null)
  }, [clearHideTimer])

  useEffect(() => clearHideTimer, [clearHideTimer])

  return { flash, showSuccessFlash, showErrorFlash, clearFlash }
}
