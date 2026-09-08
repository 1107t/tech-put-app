// src/components/admin/FlashMessage.tsx【新規作成】
// 管理者画面共通のフラッシュメッセージ表示コンポーネント。
// 状態は useFlash フックが持ち、このコンポーネントは受け取った値を描画するだけの presentational な役割に徹する。

import type { FlashMessageData, FlashType } from "../../lib/useFlash"

// 種別ごとの Bootstrap アラートクラス。成功=緑 / エラー=赤 という配色は仕様で決まっている。
// Record<FlashType, string> にしておくと、FlashType に種別を足したときにここが未定義でビルドが落ちる。
// 「success でなければ赤」という条件式にすると、追加した種別が無言で赤くなり、間違いに気づけない
const FLASH_COLOR_CLASS_NAMES: Record<FlashType, string> = {
  success: "alert-success",
  error: "alert-danger",
}

// FlashMessage コンポーネントが受け取る props
interface FlashMessageProps {
  flash: FlashMessageData | null  // 表示するフラッシュメッセージ。null のときは何も描画しない
  onClose: () => void             // 閉じるボタン押下時に呼ぶコールバック（呼び出し元の clearFlash を渡す）
}

export default function FlashMessage({ flash, onClose }: FlashMessageProps) {
  // 表示するメッセージが無いときは何も描画しない（呼び出し側で条件分岐を書かなくて済むようにする）
  if (!flash) return null

  return (
    // アラート本体。余白は詰める指定（py-2 mb-3）。role="alert" でスクリーンリーダーに即時通知する
    <div
      className={`alert ${FLASH_COLOR_CLASS_NAMES[flash.type]} d-flex align-items-center justify-content-between py-2 mb-3`}
      role="alert"
    >
      {/* メッセージ本文 */}
      <span>{flash.message}</span>
      {/* 閉じるボタン。押すと呼び出し元のフラッシュ状態をクリアする */}
      <button
        type="button"
        className="btn-close"
        aria-label="閉じる"
        onClick={onClose}
      />
    </div>
  )
}
