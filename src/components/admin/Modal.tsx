// 講師側のモーダルUIの骨格と、閉じる際の挙動（背景クリック・Escキー・
// フォーカス制御・ダブルクリック対策）を1箇所に集約する共通コンポーネント。

import { useEffect, type ReactNode } from "react";
import { useModalA11y } from "../../lib/useModalA11y";

// モーダルを閉じた直後、同じジェスチャの2打目を背後の要素に着弾させないための処理。
// NOTE: Reactのイベント委譲より先に止めるため、documentのキャプチャ段に張る
// NOTE: キーボード由来のclickはdetailが0。detail !== 1 と書くと全部握り潰す
function suppressSecondClickOfDoubleClick() {
  const suppressClick = (mouseEvent: MouseEvent) => {
    document.removeEventListener("click", suppressClick, true);
    if (mouseEvent.detail > 1) {
      mouseEvent.stopPropagation();
      mouseEvent.preventDefault();
    }
  };
  document.addEventListener("click", suppressClick, true);
}

type ModalProps = {
  isOpen: boolean;
  /** 背景クリック・Escキー・フッターの「戻る」など、閉じる操作から呼ばれる */
  onClose: () => void;
  title: string;
  /** 見出しのid。同一ページに複数のモーダルが並ぶため、呼び出し側が一意な値を指定する */
  titleId: string;
  /** modal-bodyの中身 */
  children: ReactNode;
  /** modal-footerの中身（ボタン類） */
  footer: ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  titleId,
  children,
  footer,
}: ModalProps) {
  // Escでのクローズ・初期フォーカス・フォーカストラップ・閉じたあとのフォーカス復帰
  const modalRef = useModalA11y(isOpen, onClose);

  // 表示中は背後のスクロールを止める
  useEffect(() => {
    if (!isOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  // 2打目の握り潰しは「閉じたとき」のクリーンアップで仕掛ける。
  // 背景クリック・Escキー・「戻る」ボタン・確定ボタンのいずれで閉じても
  // このクリーンアップは必ず走るため、閉じる経路を呼び出し側が増やしても漏れない。
  // 特定の経路（背景クリックの分岐など）に書くと、他の経路が素通りする
  useEffect(() => {
    if (!isOpen) return;
    return () => {
      suppressSecondClickOfDoubleClick();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/*
        .modalは画面全体を覆いz-indexも.modal-backdropより前面（1055対1050）にあるため、
        背景クリックで閉じる処理は.modal-backdrop側ではなく.modal側に付け、
        クリックされた要素がこのオーバーレイ自身かどうかで判定する
      */}
      <div
        ref={modalRef}
        className="modal show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(clickEvent) => {
          // 開いた2打目がここに届いた場合は背景クリックとみなさない
          // （detailの扱いは suppressSecondClickOfDoubleClick のコメントを参照）
          if (clickEvent.detail > 1) return;
          if (clickEvent.target === clickEvent.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={titleId}>
                {title}
              </h5>
            </div>
            <div className="modal-body d-grid gap-3">{children}</div>
            <div className="modal-footer">{footer}</div>
          </div>
        </div>
      </div>
      {/* 視覚的な背景。クリック判定は上の.modal側が担うため、ここにハンドラは持たせない */}
      <div className="modal-backdrop fade show" />
    </>
  );
}
