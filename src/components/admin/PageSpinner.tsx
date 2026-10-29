export default function PageSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">読み込み中...</span>
      </div>
    </div>
  );
}
