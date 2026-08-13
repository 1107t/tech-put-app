type PageErrorProps = {
  message: string;
  onRetry?: () => void;
};

export default function PageError({ message, onRetry = () => window.location.reload() }: PageErrorProps) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 gap-3">
      <p className="text-danger mb-0">{message}</p>
      <button className="btn btn-secondary btn-sm" onClick={onRetry}>再試行</button>
    </div>
  );
}
