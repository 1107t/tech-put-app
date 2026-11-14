import { useEffect, useState, type DragEvent, type ReactNode } from "react";
import type { Folder } from "../../lib/folderApi";

type ArticleFolderListProps = {
  folders: Folder[];
  allArticlesCount: number;
  // null は「すべての記事」
  selectedFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  onCreate: () => void;
  onRename: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
  // ドラッグ中の記事が今入っているフォルダ。null はドラッグしていない
  draggingArticleFolderId: string | null;
  onDropArticle: (folder: Folder) => void;
};

type FolderRowProps = {
  label: string;
  iconClassName: string;
  articlesCount: number;
  isSelected: boolean;
  onSelect: () => void;
  badge?: ReactNode;
  menu?: ReactNode;
  isDropTarget?: boolean;
  onDragOver?: (dragEvent: DragEvent<HTMLLIElement>) => void;
  onDragLeave?: (dragEvent: DragEvent<HTMLLIElement>) => void;
  onDrop?: (dragEvent: DragEvent<HTMLLIElement>) => void;
};

function FolderRow({
  label,
  iconClassName,
  articlesCount,
  isSelected,
  onSelect,
  badge,
  menu,
  isDropTarget = false,
  onDragOver,
  onDragLeave,
  onDrop,
}: FolderRowProps) {
  return (
    <li
      className={`list-group-item folder-row ${isSelected ? "active" : ""} ${isDropTarget ? "is-drop-target" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <button type="button" className="folder-select-button" onClick={onSelect} aria-pressed={isSelected}>
        <i className={iconClassName} aria-hidden="true" />
        <span className="folder-name">{label}</span>
        {badge}
        <span className="folder-count">{articlesCount}</span>
      </button>
      {menu}
    </li>
  );
}

export default function ArticleFolderList({
  folders,
  allArticlesCount,
  selectedFolderId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  draggingArticleFolderId,
  onDropArticle,
}: ArticleFolderListProps) {
  const [openMenuFolderId, setOpenMenuFolderId] = useState<string | null>(null);

  const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(null);

  // 落とせるのはドラッグ中で、記事が今入っているフォルダ以外だけ
  const dropProps = (folder: Folder) => {
    if (draggingArticleFolderId === null || folder.id === draggingArticleFolderId) return {};
    return {
      isDropTarget: dropTargetFolderId === folder.id,
      onDragOver: (dragEvent: DragEvent<HTMLLIElement>) => {
        // preventDefault しないとブラウザが drop を受け付けない
        dragEvent.preventDefault();
        dragEvent.dataTransfer.dropEffect = "move";
        setDropTargetFolderId(folder.id);
      },
      onDragLeave: (dragEvent: DragEvent<HTMLLIElement>) => {
        // 行の中のボタンや文字へ移っただけのときは青を消さない
        if (dragEvent.currentTarget.contains(dragEvent.relatedTarget as Node | null)) return;
        setDropTargetFolderId(null);
      },
      onDrop: (dragEvent: DragEvent<HTMLLIElement>) => {
        dragEvent.preventDefault();
        setDropTargetFolderId(null);
        onDropArticle(folder);
      },
    };
  };

  // メニューの外を押したら閉じる（記事の ︙ と同じ動き）
  useEffect(() => {
    if (openMenuFolderId === null) return;
    const closeMenu = () => setOpenMenuFolderId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [openMenuFolderId]);

  const renderMenu = (folder: Folder) => (
    <div onClick={(clickEvent) => clickEvent.stopPropagation()}>
      <button
        type="button"
        className="btn btn-sm folder-menu-button"
        aria-label={`「${folder.name}」のメニュー`}
        aria-expanded={openMenuFolderId === folder.id}
        onClick={() => setOpenMenuFolderId(openMenuFolderId === folder.id ? null : folder.id)}
      >
        ︙
      </button>
      {openMenuFolderId === folder.id && (
        <ul className="dropdown-menu show folder-dropdown">
          <li>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => {
                setOpenMenuFolderId(null);
                onRename(folder);
              }}
            >
              名前を変更
            </button>
          </li>
          <li>
            <button
              type="button"
              className="dropdown-item text-danger"
              onClick={() => {
                setOpenMenuFolderId(null);
                onDelete(folder);
              }}
            >
              削除
            </button>
          </li>
        </ul>
      )}
    </div>
  );

  return (
    <div>
      <div className="article-folder-list-heading">
        <i className="fa-regular fa-folder-open me-1" aria-hidden="true" />
        記事フォルダ
      </div>
      <ul className="list-group mb-2">
        <FolderRow
          label="すべての記事"
          iconClassName="fa-solid fa-layer-group"
          articlesCount={allArticlesCount}
          isSelected={selectedFolderId === null}
          onSelect={() => onSelect(null)}
        />
        {folders.map((folder) => (
          <FolderRow
            key={folder.id}
            label={folder.name}
            iconClassName="fa-regular fa-folder"
            articlesCount={folder.articlesCount}
            isSelected={selectedFolderId === folder.id}
            onSelect={() => onSelect(folder.id)}
            badge={folder.isDefault && <span className="badge bg-secondary">固定</span>}
            menu={!folder.isDefault && renderMenu(folder)}
            {...dropProps(folder)}
          />
        ))}
      </ul>
      <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={onCreate}>
        ＋ フォルダ新規作成
      </button>
    </div>
  );
}
