// src/lib/useFlash.ts【新規作成】
// フラッシュメッセージ（成功=緑 / エラー=赤）の表示状態を管理するカスタムフック。
// 表示から3秒で自動的に消え、手動で閉じることもできる。
// 表示部分は src/components/admin/FlashMessage.tsx が担当し、このフックは状態だけを持つ。
//
// 【このフックの契約】返す3つのコールバック（showSuccessFlash / showErrorFlash / clearFlash）は
// useCallback により参照が安定しており、呼び出し側は useEffect の依存配列にそのまま入れてよい。
// この保証を壊す変更（useCallback を外す・依存に不安定な値を足す）をしないこと。
// 壊れると、依存配列に入れているページ側で useEffect が毎レンダー再実行され、API取得が無限に走る。
// 壊れる場所（ページ）と原因の場所（このファイル）が離れているため、ここに契約として明記しておく。

import { useCallback, useEffect, useRef, useState } from "react"

// フラッシュメッセージの種別。成功=緑・エラー=赤という配色ルールに対応する
export type FlashType = "success" | "error"

// 画面に表示するフラッシュメッセージ1件分のデータ。
// 表示コンポーネント側の名前（FlashMessage）と衝突しないよう、型は末尾に Data を付けて区別する
export interface FlashMessageData {
  type: FlashType  // メッセージの種別（success=成功・緑 / error=エラー・赤）
  message: string  // 実際に画面へ表示する文言
}

// フラッシュメッセージの自動消滅までの時間（ミリ秒）。受講生側つぶやき画面の実装と揃えている
const AUTO_HIDE_DELAY_MS = 3000

export function useFlash() {
  // 表示中のフラッシュメッセージ。null のときは何も表示しない
  const [flash, setFlash] = useState<FlashMessageData | null>(null)

  // 自動消滅タイマーのIDを保持する。連続表示時に前のタイマーを取り消すために使う
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 実行中の自動消滅タイマーを取り消す。
  // これを挟まないと、前のメッセージのタイマーが後から発火して新しいメッセージを即座に消してしまう
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  // フラッシュメッセージを表示し、3秒後に自動で消えるタイマーを仕掛ける
  const showFlash = useCallback(
    (type: FlashType, message: string) => {
      clearHideTimer()
      setFlash({ type, message })
      hideTimerRef.current = setTimeout(() => setFlash(null), AUTO_HIDE_DELAY_MS)
    },
    [clearHideTimer],
  )

  // 成功メッセージ（緑）を表示する
  const showSuccessFlash = useCallback(
    (message: string) => showFlash("success", message),
    [showFlash],
  )

  // エラーメッセージ（赤）を表示する
  const showErrorFlash = useCallback(
    (message: string) => showFlash("error", message),
    [showFlash],
  )

  // 閉じるボタン用。タイマーも一緒に片付けてから非表示にする
  const clearFlash = useCallback(() => {
    clearHideTimer()
    setFlash(null)
  }, [clearHideTimer])

  // アンマウント時にタイマーを片付ける。
  // 残しておくと、既に消えたコンポーネントに対して setState が走ってしまう
  useEffect(() => clearHideTimer, [clearHideTimer])

  return { flash, showSuccessFlash, showErrorFlash, clearFlash }
}
