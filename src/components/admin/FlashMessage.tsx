// 管理画面の操作結果を表示する。状態と表示時間はuseFlashが管理する。
import type { FlashMessageData, FlashType } from "../../lib/useFlash"

// 種別追加時の配色漏れを型で検出する。
const FLASH_COLOR_CLASS_NAMES: Record<FlashType, string> = {
  success: "alert-success",
  error: "alert-danger",
}

interface FlashMessageProps {
  flash: FlashMessageData | null  // 表示するフラッシュメッセージ。null のときは何も描画しない
  onClose: () => void             // 閉じるボタン押下時に呼ぶコールバック（呼び出し元の clearFlash を渡す）
}

export default function FlashMessage({ flash, onClose }: FlashMessageProps) {
  if (!flash) return null

  return (
    <div
      className={`alert ${FLASH_COLOR_CLASS_NAMES[flash.type]} d-flex align-items-center justify-content-between py-2 mb-3`}
      role="alert"
    >
      <span>{flash.message}</span>
      <button
        type="button"
        className="btn-close"
        aria-label="閉じる"
        onClick={onClose}
      />
    </div>
  )
}
