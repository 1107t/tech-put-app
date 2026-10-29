// モーダルのキーボード操作まわり（Escで閉じる・初期フォーカス・フォーカストラップ・
// 閉じたあとのフォーカス復帰）を集約したカスタムフック。
// aria-modal="true" を宣言したモーダルは「開いている間フォーカスが外へ出ない」ことが
// 前提になるため、宣言と実挙動が食い違わないようにここで実装をまとめている。
import { useEffect, useRef, type RefObject } from "react";

// モーダル内でフォーカスを受け取れる要素のセレクタ。
// tabindex="-1"（プログラムからのみフォーカス可能）はTab移動の対象外なので除外する。
// type="hidden" のinputは見えないままフォーカス対象として拾われ、初期フォーカスが
// 無反応になる原因になるため明示的に外す
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const focusableElements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );
  // CSSボックスを持たない要素はfocus()しても何も起きず、フォーカス制御を静かに壊すため除外する。
  // offsetParent は position:fixed にもnullを返すので使わない（固定配置の要素まで落ちる）
  return focusableElements.filter((element) => element.getClientRects().length > 0);
}

/**
 * モーダルのフォーカス制御（初期フォーカス・トラップ・閉じたあとの復帰）とEscによるクローズを担う。
 *
 * @param isOpen モーダルが表示中かどうか
 * @param onClose Escキーが押されたときに呼ぶクローズ処理
 * @returns モーダルのルート要素（.modal）に渡す参照
 */
export function useModalA11y(isOpen: boolean, onClose: () => void): RefObject<HTMLDivElement> {
  const modalRef = useRef<HTMLDivElement>(null);
  // モーダルを開く直前にフォーカスがあった要素（＝モーダルを開いたボタン）。
  // 閉じたときにここへフォーカスを戻さないと、フォーカスがbodyに落ちて
  // キーボード操作の位置を見失うため保持しておく
  const triggerElementRef = useRef<HTMLElement | null>(null);
  // 最新のonCloseを保持する。onCloseを直接effectの依存に入れると、呼び出し側が
  // useCallbackを書いたかどうかでリスナの張り直し頻度が変わってしまうため、
  // 参照だけを毎レンダー更新し、effectの依存はisOpenに揃える
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // フォーカスのライフサイクル。開いたときに移し、閉じたときに元へ戻す
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocusedElement = document.activeElement;
    triggerElementRef.current =
      previouslyFocusedElement instanceof HTMLElement ? previouslyFocusedElement : null;

    // 開いた直後はモーダル内の先頭要素へフォーカスを移す。
    // フォーカスがページ側に残ったままだとキーボード操作でモーダル内に到達できない
    const [firstFocusableElement] = getFocusableElements(modalRef.current);
    firstFocusableElement?.focus();

    return () => {
      // 既にDOMから外れている要素へのfocus()は何も起きないため、条件分岐は不要
      // （ページ遷移によるアンマウント時はトリガー要素も同時に消えるので何も起きない）
      triggerElementRef.current?.focus();
    };
  }, [isOpen]);

  // キーボード操作。Escで閉じ、Tab/Shift+Tabをモーダル内で循環させる
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (keyboardEvent.key !== "Tab") return;

      const focusableElements = getFocusableElements(modalRef.current);
      if (focusableElements.length === 0) return;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Tabは末尾に達したら先頭へ、Shift+Tabは先頭に達したら末尾へ折り返す。
      // 進行方向で「端」と「折り返し先」が入れ替わるだけなので、対称に扱って条件を1つにまとめる
      const isBackward = keyboardEvent.shiftKey;
      const edgeElement = isBackward ? firstElement : lastElement;
      const wrapTargetElement = isBackward ? lastElement : firstElement;
      // モーダル外にフォーカスがある場合も含めて端を越える移動を検出し、モーダル内へ引き戻す
      const isFocusOutside = !modalRef.current?.contains(document.activeElement);
      // モーダルの余白をクリックすると、ブラウザは最も近いフォーカス可能な祖先である
      // .modal自身（tabindex="-1"）へフォーカスを移す。containsは自分自身にtrueを返すため
      // これはisFocusOutsideで拾えず、放置するとShift+Tabがネイティブ動作で
      // 文書順ひとつ前＝モーダル外の要素へ抜けてしまう
      const isFocusOnContainer = document.activeElement === modalRef.current;

      if (isFocusOutside || isFocusOnContainer || document.activeElement === edgeElement) {
        keyboardEvent.preventDefault();
        wrapTargetElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return modalRef;
}
