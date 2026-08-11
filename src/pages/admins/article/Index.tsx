import { useEffect, useState, useMemo, type MouseEvent as ReactMouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCurrentAdmin,
  adminLogout,
  getAdminArticles,
  deleteAdminArticle,
  type Admin,
  type AdminArticle,
} from "../../../lib/adminApi";
import { getApiErrorMessage } from "../../../lib/api";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  compareByCreatedAt,
  isSortOrder,
  DEFAULT_SORT_ORDER,
  SORT_ORDER_OPTIONS,
  type SortOrder,
} from "../../../lib/sort";
import { useModalA11y } from "../../../lib/useModalA11y";

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${mo}/${day} ${h}:${min}`;
}

export default function AdminArticleIndexPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // 並べ替えモーダルの表示状態とモーダル内の選択値（一時的な入力値）
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOrderInput, setSortOrderInput] = useState<SortOrder>(DEFAULT_SORT_ORDER);
  // 実際に一覧に適用されている並べ替え順序（「並べ替える」ボタン押下で確定される）
  const [appliedSortOrder, setAppliedSortOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const currentAdmin = await getCurrentAdmin();
        if (cancelled) return;
        if (!currentAdmin) {
          navigate("/admin/login", { replace: true });
          return;
        }
        setAdmin(currentAdmin);
        const data = await getAdminArticles();
        if (!cancelled) {
          setArticles(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("読み込みに失敗しました。再読み込みしてください。");
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  useEffect(() => {
    if (openMenuId === null) return;
    const closeMenu = () => setOpenMenuId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [openMenuId]);

  // 並べ替えを適用した表示用記事一覧を算出する。元のarticles配列は変更しない
  const displayedArticles = useMemo(
    () => [...articles].sort(compareByCreatedAt(appliedSortOrder)),
    [articles, appliedSortOrder]
  );

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("この記事を削除しますか？")) return;
    try {
      await deleteAdminArticle(id);
      setOpenMenuId(null);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setOpenMenuId(null);
      setError(getApiErrorMessage(err, "記事の削除に失敗しました。"));
    }
  };

  // 並べ替えモーダルを開く。現在の適用済み順序をモーダルの初期値として設定する
  const openSortModal = () => {
    setSortOrderInput(appliedSortOrder);
    setShowSortModal(true);
  };

  // 並べ替えモーダルを閉じる共通処理。
  // 「戻る」ボタン・背景クリック・Escキーに加え、並べ替え確定後（applySortModal）からも呼ばれる
  const closeSortModal = () => {
    setShowSortModal(false);
  };

  // 並べ替えモーダルの「並べ替える」ボタン処理。入力値を適用済み順序として確定して閉じる
  const applySortModal = () => {
    setAppliedSortOrder(sortOrderInput);
    closeSortModal();
  };

  // モーダルのEsc・フォーカス制御（初期フォーカス／トラップ／閉じたあとの復帰）を委譲する
  const sortModalRef = useModalA11y(showSortModal, closeSortModal);

  // ダブルクリックの2打目かどうか。
  // モーダルのボタンを素早く2回押すと、1打目でモーダルが開閉するため2打目は別の要素に届く。
  // 開くときは手前に出現した.modalへ、閉じるときは背後に露出した記事行へ着弾し、
  // どちらもユーザーが意図していない操作を起こしてしまう。
  // event.detailはブラウザが数えた連続クリック回数で、着弾した要素が変わっても引き継がれるため、
  // これで「ひとつのジェスチャの2打目」だけを弾ける。
  // キーボード（Enter/Space）由来のclickはdetailが0になるので、detail !== 1 と書いてはいけない
  const isSecondClickOfDoubleClick = (clickEvent: ReactMouseEvent) => clickEvent.detail > 1;

  // 記事詳細への遷移。モーダルを閉じた2打目が背後の行に届いた場合は無視する
  const handleRowClick = (articleId: string, clickEvent: ReactMouseEvent) => {
    if (isSecondClickOfDoubleClick(clickEvent)) return;
    navigate(`/admin/articles/${articleId}`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      admin={admin}
      onLogout={handleLogout}
      headerTitle="投稿した記事一覧"
      headerAction={
        <Link to="/admin/articles/new" className="header-action-link">
          記事投稿
        </Link>
      }
    >
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">記事一覧</h4>
        <button className="btn btn-success btn-sm" onClick={openSortModal}>
          並べ替え
        </button>
        {/* TODO: 絞り込み検索機能は別タスクで実装予定。ここではUI配置のみ */}
        <button className="btn btn-success btn-sm">絞り込み検索</button>
      </div>

      {error && <p className="text-danger">{error}</p>}

      <div className="card shadow-sm">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>タイトル</th>
              <th>サブタイトル</th>
              {/* 並べ替えが適用されている列であることと現在の順序を支援技術に伝える */}
              <th aria-sort={appliedSortOrder === "asc" ? "ascending" : "descending"}>投稿日時</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayedArticles.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">
                  記事がありません
                </td>
              </tr>
            ) : (
              displayedArticles.map((article) => (
                <tr
                  key={article.id}
                  style={{ cursor: "pointer" }}
                  onClick={(clickEvent) => handleRowClick(article.id, clickEvent)}
                >
                  <td>{article.title}</td>
                  <td>{article.subTitle}</td>
                  <td>{formatDate(article.createdAt)}</td>
                  <td className="position-relative" onClick={(e) => e.stopPropagation()}>
                    <>
                      <button
                        className="btn btn-sm text-secondary p-0"
                        style={{ textDecoration: "none" }}
                        onClick={() =>
                          setOpenMenuId(openMenuId === article.id ? null : article.id)
                        }
                      >
                        ⋮
                      </button>
                      {openMenuId === article.id && (
                        <ul className="dropdown-menu show position-absolute">
                          <li>
                            <Link
                              className="dropdown-item"
                              to={`/admin/articles/${article.id}`}
                            >
                              閲覧
                            </Link>
                          </li>
                          <li>
                            <Link
                              className="dropdown-item"
                              to={`/admin/articles/${article.id}/edit`}
                            >
                              編集
                            </Link>
                          </li>
                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => handleDelete(article.id)}
                            >
                              削除
                            </button>
                          </li>
                        </ul>
                      )}
                    </>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 並べ替えモーダル */}
      {showSortModal && (
        <>
          {/*
            .modalは画面全体を覆いz-indexも.modal-backdropより前面にあるため、
            背景クリックで閉じる処理は.modal-backdrop側ではなく.modal側に付け、
            クリックされた要素がダイアログ自身（.modal自体）かどうかを判定する
          */}
          <div
            ref={sortModalRef}
            className="modal show d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sort-modal-title"
            onClick={(clickEvent) => {
              // モーダルを開いた2打目がこのオーバーレイに届いた場合は背景クリックとみなさない。
              // .modalはトリガーボタンの上に重なるため、これがないと素早い2回押しで
              // 開いた直後のモーダルが即座に閉じてしまう
              if (isSecondClickOfDoubleClick(clickEvent)) return;
              if (clickEvent.target === clickEvent.currentTarget) {
                closeSortModal();
              }
            }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="sort-modal-title">
                    並べ替え
                  </h5>
                </div>
                <div className="modal-body d-grid gap-3">
                  {/* 並べ替え順セレクトボックス（新しい順=降順 or 古い順=昇順） */}
                  <div>
                    <label htmlFor="sort-order-select" className="form-label fw-semibold">
                      並べ替え順
                    </label>
                    <select
                      id="sort-order-select"
                      className="form-select"
                      value={sortOrderInput}
                      onChange={(changeEvent) => {
                        // DOM由来の値（string）を型アサーションなしでSortOrderへ絞り込む。
                        // 想定外の値は黙って捨てられるため、選択肢を増やすときは
                        // sort.tsのSORT_ORDERSにも必ず追加すること
                        const selectedValue = changeEvent.target.value;
                        if (isSortOrder(selectedValue)) setSortOrderInput(selectedValue);
                      }}
                    >
                      {SORT_ORDER_OPTIONS.map((sortOrderOption) => (
                        <option key={sortOrderOption.value} value={sortOrderOption.value}>
                          {sortOrderOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeSortModal}>
                    戻る
                  </button>
                  <button className="btn btn-success" onClick={applySortModal}>
                    並べ替える
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* 純粋な視覚的背景。クリックハンドラは.modal側に付けたためここでは不要 */}
          <div className="modal-backdrop fade show" />
        </>
      )}
    </AdminLayout>
  );
}
