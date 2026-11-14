import { Link, useNavigate } from "react-router-dom";
import type { Article } from "../../lib/articleApi";
import { formatSlashDateTime } from "../../lib/formatDate";

type ArticleTableRowProps = {
  article: Article;
  isOwnArticle: boolean;
  isDragging: boolean;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMoveFolder: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
};

export default function ArticleTableRow({
  article,
  isOwnArticle,
  isDragging,
  isMenuOpen,
  onToggleMenu,
  onMoveFolder,
  onDelete,
  onDragStart,
  onDragEnd,
}: ArticleTableRowProps) {
  const navigate = useNavigate();

  return (
    <tr
      className={`article-row ${isDragging ? "is-dragging" : ""}`}
      onClick={() => navigate(`/articles/${article.id}`)}
    >
      <td className="link-td title-td">
        {isOwnArticle && (
          <span
            className="drag-handle d-none d-xl-inline"
            draggable
            title="ドラッグして左のフォルダへ移動"
            aria-hidden="true"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
            onDragStart={(dragEvent) => {
              dragEvent.dataTransfer.effectAllowed = "move";
              // Firefox は setData が無いとドラッグを始めない
              dragEvent.dataTransfer.setData("text/plain", article.id);
              const row = dragEvent.currentTarget.closest("tr");
              if (row) dragEvent.dataTransfer.setDragImage(row, 0, 0);
              onDragStart();
            }}
            onDragEnd={onDragEnd}
          >
            ⋮⋮
          </span>
        )}
        {article.title}
      </td>
      <td className="link-td">{article.subTitle}</td>
      <td className="link-td"></td>
      <td className="link-td">{article.likesCount}</td>
      <td className="link-td">{formatSlashDateTime(article.createdAt)}</td>
      <td className="menu-td" onClick={(clickEvent) => clickEvent.stopPropagation()}>
        {isOwnArticle && (
          <>
            <button className="btn menu-btn" onClick={onToggleMenu}>
              ︙
            </button>
            {isMenuOpen && (
              <ul className="dropdown-menu show">
                <li>
                  <Link className="nav-link" to={`/articles/${article.id}/edit`}>
                    編集
                  </Link>
                </li>
                <li>
                  <button className="nav-link move-folder-btn" onClick={onMoveFolder}>
                    フォルダ移動
                  </button>
                </li>
                <li>
                  <button className="nav-link delete-btn" onClick={onDelete}>
                    削除
                  </button>
                </li>
              </ul>
            )}
          </>
        )}
      </td>
    </tr>
  );
}
