import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserLayout, { dashboardMenu } from "../../../components/user/UserLayout";
import ArticleFolderList from "../../../components/user/ArticleFolderList";
import ArticleTableRow from "../../../components/user/ArticleTableRow";
import FolderNameModal from "../../../components/user/FolderNameModal";
import MoveFolderModal from "../../../components/user/MoveFolderModal";
import FlashMessage from "../../../components/shared/FlashMessage";
import Modal from "../../../components/shared/Modal";
import { getAllArticles, deleteArticle, moveArticleToFolder, type Article } from "../../../lib/articleApi";
import { fetchFolders, createFolder, renameFolder, deleteFolder, type Folder } from "../../../lib/folderApi";
import { getApiErrorMessage } from "../../../lib/api";
import { useFlash } from "../../../lib/useFlash";
import "../../../styles/pages/articleList.css";

// 追加と名前変更で同じモーダルを使う。null は閉じている状態
type FolderNameModalState = { mode: "create" } | { mode: "rename"; folder: Folder } | null;

export default function ArticleIndexPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  // null は「すべての記事」
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderNameModal, setFolderNameModal] = useState<FolderNameModalState>(null);
  const [movingArticle, setMovingArticle] = useState<Article | null>(null);
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);
  const [draggingArticle, setDraggingArticle] = useState<Article | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { flash, showSuccessFlash, showErrorFlash, clearFlash } = useFlash();

  const load = async () => {
    try {
      // フォルダ API が「未分類」を用意してから記事を取らないと、folderId が null で返る
      const loadedFolders = await fetchFolders();
      const loadedArticles = await getAllArticles();
      setArticles(loadedArticles);
      setFolders(loadedFolders);
    } catch {
      setError("記事の読み込みに失敗しました。");
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (openMenuId === null) return;
    const closeMenu = () => setOpenMenuId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [openMenuId]);

  const visibleArticles =
    selectedFolderId === null ? articles : articles.filter((article) => article.folderId === selectedFolderId);

  const handleDelete = async (id: string) => {
    if (!window.confirm("この記事を削除しますか？")) return;
    try {
      await deleteArticle(id);
      setOpenMenuId(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "記事の削除に失敗しました。"));
    }
  };

  // 失敗はモーダルの入力欄の下に出すため、ここでは catch しない
  const handleSubmitFolderName = async (name: string) => {
    if (folderNameModal === null) return;
    if (folderNameModal.mode === "create") {
      await createFolder(name);
    } else {
      await renameFolder(folderNameModal.folder.id, name);
    }
    setFolderNameModal(null);
    try {
      setFolders(await fetchFolders());
    } catch {
      showErrorFlash("フォルダの読み込みに失敗しました。");
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    const confirmMessage = `フォルダ「${folder.name}」を削除しますか？中の記事（${folder.articlesCount}件）は「未分類」に移ります。記事は削除されません。`;
    if (!window.confirm(confirmMessage)) return;
    try {
      await deleteFolder(folder.id);
      if (selectedFolderId === folder.id) setSelectedFolderId(null);
      await load();
    } catch (deleteError) {
      showErrorFlash(getApiErrorMessage(deleteError, "フォルダの削除に失敗しました。"));
    }
  };

  // ︙ の「フォルダ移動」とドラッグの両方から呼ぶ
  const moveArticle = async (article: Article, destinationFolder: Folder) => {
    let movedArticle: Article;
    try {
      movedArticle = await moveArticleToFolder(article.id, destinationFolder.id);
    } catch (moveError) {
      showErrorFlash(getApiErrorMessage(moveError, "フォルダの移動に失敗しました。"));
      return;
    }
    setArticles((currentArticles) =>
      currentArticles.map((currentArticle) => (currentArticle.id === movedArticle.id ? movedArticle : currentArticle))
    );
    showSuccessFlash(`「${destinationFolder.name}」に移動しました。`);
    // 件数を更新するため、フォルダだけ取り直す
    try {
      setFolders(await fetchFolders());
    } catch {
      showErrorFlash("フォルダの読み込みに失敗しました。");
    }
  };

  // 左の一覧とフォルダ管理のモーダルで共通。afterChoose は管理のモーダルを閉じる処理
  const renderFolderList = (afterChoose: () => void) => (
    <ArticleFolderList
      folders={folders}
      allArticlesCount={articles.length}
      selectedFolderId={selectedFolderId}
      onSelect={(folderId) => {
        setSelectedFolderId(folderId);
        afterChoose();
      }}
      onCreate={() => {
        afterChoose();
        setFolderNameModal({ mode: "create" });
      }}
      onRename={(folder) => {
        afterChoose();
        setFolderNameModal({ mode: "rename", folder });
      }}
      onDelete={handleDeleteFolder}
      draggingArticleFolderId={draggingArticle?.folderId ?? null}
      onDropArticle={(folder) => {
        if (draggingArticle !== null) moveArticle(draggingArticle, folder);
      }}
    />
  );

  return (
    <UserLayout
      menu={dashboardMenu}
      headerTitle="投稿した記事一覧"
      headerAction={<Link to="/articles/new" className="header-action-link">記事投稿</Link>}
    >
      {(me) => (
        <>
          <div className="article-list-flash">
            <FlashMessage flash={flash} onClose={clearFlash} />
          </div>
          {error && <p className="text-danger">{error}</p>}
          <h2 className="article-list-title mb-4">記事一覧</h2>

          <div className="article-folder-picker d-xl-none">
            <label htmlFor="article-folder-select" className="visually-hidden">
              表示するフォルダ
            </label>
            <select
              id="article-folder-select"
              className="form-select"
              value={selectedFolderId ?? ""}
              onChange={(changeEvent) => setSelectedFolderId(changeEvent.target.value || null)}
            >
              <option value="">すべての記事（{articles.length}）</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}（{folder.articlesCount}）
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-outline-secondary text-nowrap"
              onClick={() => setIsFolderManagerOpen(true)}
            >
              フォルダ管理
            </button>
          </div>

          <div className="article-list-layout">
            <aside className="article-folder-sidebar d-none d-xl-block">
              {renderFolderList(() => {})}
            </aside>

            <div className="articles-table-wrapper">
              <table className="table articles-table table-hover">
                <thead>
                  <tr>
                    <th>タイトル</th>
                    <th>サブタイトル</th>
                    <th>投稿者</th>
                    <th>いいね</th>
                    <th>投稿日時</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFolderId !== null && visibleArticles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        このフォルダに記事はありません
                      </td>
                    </tr>
                  )}
                  {visibleArticles.map((article) => (
                    <ArticleTableRow
                      key={article.id}
                      article={article}
                      isOwnArticle={article.userId === me.id}
                      isDragging={draggingArticle?.id === article.id}
                      isMenuOpen={openMenuId === article.id}
                      onToggleMenu={() => setOpenMenuId(openMenuId === article.id ? null : article.id)}
                      onMoveFolder={() => {
                        setOpenMenuId(null);
                        setMovingArticle(article);
                      }}
                      onDelete={() => handleDelete(article.id)}
                      onDragStart={() => setDraggingArticle(article)}
                      onDragEnd={() => setDraggingArticle(null)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {folderNameModal !== null && (
            <FolderNameModal
              mode={folderNameModal.mode}
              initialName={folderNameModal.mode === "rename" ? folderNameModal.folder.name : ""}
              onClose={() => setFolderNameModal(null)}
              onSubmit={handleSubmitFolderName}
            />
          )}

          {movingArticle !== null && (
            <MoveFolderModal
              article={movingArticle}
              folders={folders}
              onClose={() => setMovingArticle(null)}
              onSubmit={async (destinationFolder) => {
                await moveArticle(movingArticle, destinationFolder);
                setMovingArticle(null);
              }}
            />
          )}

          {isFolderManagerOpen && (
            <Modal
              isOpen
              onClose={() => setIsFolderManagerOpen(false)}
              title="フォルダ管理"
              titleId="folder-manager-modal-title"
              footer={
                <button type="button" className="btn btn-secondary" onClick={() => setIsFolderManagerOpen(false)}>
                  閉じる
                </button>
              }
            >
              {renderFolderList(() => setIsFolderManagerOpen(false))}
            </Modal>
          )}
        </>
      )}
    </UserLayout>
  );
}
