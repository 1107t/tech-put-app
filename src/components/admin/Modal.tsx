// src/components/admin/Modal.tsx【新規作成】
// 講師側のモーダルUIを1箇所にまとめた共通コンポーネント。
// 骨格（.modal → .modal-dialog → .modal-content → header/body/footer）に加え、
// 背景クリックでのクローズ・Escキー・フォーカス制御・ダブルクリック対策を内包する。
//
// 共通化前は同じ骨格が3コピー存在し、記事一覧だけが背景クリックとフォーカス制御を持ち、
// 受講生一覧の2つは持たない、という「見た目は同じなのに挙動が違う」状態になっていた。
// ここに集約することで、モーダルを増やしても挙動が分岐しないようにする。

import { useEffect, type ReactNode } from "react";
import { useModalA11y } from "../../lib/useModalA11y";

// モーダルを閉じた直後、同じジェスチャの2打目を背後の要素に着弾させないための処理。
//
// モーダルは画面全体を覆うため、1打目で閉じると2打目はその下に露出した要素へ届く。
// 露出しうるのはサイドバー・ヘッダー・一覧の行・各種ボタンなど画面上のほぼ全てで、
// 着弾する側それぞれにガードを配ると、要素が増えるたびに漏れる。
// そのため「閉じる」側で1回だけ握り潰し、対象範囲を1箇所に閉じ込める。
//
// Reactのイベントはルート要素に委譲されるため、それより先に走るdocumentのキャプチャ段で止める。
// リスナは次のclickで自ら外れるので、閉じたあとの通常の操作には影響しない。
// キーボード（Enter/Space）由来のclickはdetailが0になるので、detail !== 1 と書いてはいけない
function swallowNextClickOfGesture() {
  const swallowClick = (mouseEvent: MouseEvent) => {
    document.removeEventListener("click", swallowClick, true);
    if (mouseEvent.detail > 1) {
      mouseEvent.stopPropagation();
      mouseEvent.preventDefault();
    }
  };
  document.addEventListener("click", swallowClick, true);
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
      swallowNextClickOfGesture();
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
          // モーダルを開いた2打目がこのオーバーレイに届いた場合は背景クリックとみなさない。
          // .modalはトリガーボタンの上に重なるため、これがないと素早い2回押しで
          // 開いた直後のモーダルが即座に閉じてしまう。
          // キーボード由来のclickはdetailが0になるので、detail !== 1 と書いてはいけない
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
