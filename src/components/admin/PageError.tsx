// 読み込み失敗中はエラーと再試行ボタンを表示し続ける。
type PageErrorProps = {
  message: string;        // 画面に表示するエラー文言
  onRetry?: () => void;   // 再試行ボタンの動作。省略時はページ全体を再読み込みする
};

export default function PageError({ message, onRetry = () => window.location.reload() }: PageErrorProps) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 gap-3">
      <p className="text-danger mb-0">{message}</p>
      <button className="btn btn-secondary btn-sm" onClick={onRetry}>再試行</button>
    </div>
  );
}
