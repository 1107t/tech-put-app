import { useState, type FormEvent } from "react";
import Modal from "../shared/Modal";
import type { Article } from "../../lib/articleApi";
import type { Folder } from "../../lib/folderApi";

type MoveFolderModalProps = {
  article: Article;
  folders: Folder[];
  onClose: () => void;
  // 成功・失敗の通知とモーダルを閉じるのは呼び出し側
  onSubmit: (destinationFolder: Folder) => Promise<void>;
};

const FORM_ID = "move-folder-form";
const SELECT_ID = "move-folder-select";

export default function MoveFolderModal({ article, folders, onClose, onSubmit }: MoveFolderModalProps) {
  const [destinationFolderId, setDestinationFolderId] = useState(article.folderId ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCurrentFolderSelected = destinationFolderId === article.folderId;

  const handleSubmit = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const destinationFolder = folders.find((folder) => folder.id === destinationFolderId);
    if (!destinationFolder || isCurrentFolderSelected) return;
    setIsSubmitting(true);
    try {
      await onSubmit(destinationFolder);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="フォルダを移動"
      titleId="move-folder-modal-title"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            キャンセル
          </button>
          <button
            type="submit"
            form={FORM_ID}
            className="btn btn-primary"
            disabled={isSubmitting || isCurrentFolderSelected}
          >
            {isSubmitting ? "移動中..." : "移動する"}
          </button>
        </>
      }
    >
      <p className="mb-0 text-break">記事：{article.title}</p>
      <form id={FORM_ID} onSubmit={handleSubmit}>
        <label htmlFor={SELECT_ID} className="form-label">
          移動先のフォルダ
        </label>
        <select
          id={SELECT_ID}
          className="form-select"
          value={destinationFolderId}
          onChange={(changeEvent) => setDestinationFolderId(changeEvent.target.value)}
        >
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </form>
    </Modal>
  );
}
