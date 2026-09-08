// src/components/admin/PageError.tsx【修正】
// ページ全体の読み込みに失敗したときに、本文の代わりに表示するエラー画面。
// 3秒で消えるフラッシュメッセージとは役割が違い、失敗した状態が続くかぎり表示され続ける。

// PageError コンポーネントが受け取る props
type PageErrorProps = {
  message: string;        // 画面に表示するエラー文言
  onRetry?: () => void;   // 再試行ボタンの動作。省略時はページ全体を再読み込みする
};

// エラー文言と再試行ボタンを画面中央に表示する
export default function PageError({ message, onRetry = () => window.location.reload() }: PageErrorProps) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 gap-3">
      {/* 読み込み失敗の文言と再試行操作 */}
      <p className="text-danger mb-0">{message}</p>
      <button className="btn btn-secondary btn-sm" onClick={onRetry}>再試行</button>
    </div>
  );
}
