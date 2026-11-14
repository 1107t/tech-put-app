import { useState, type FormEvent } from "react";
import Modal from "../shared/Modal";
import { getApiErrorMessage } from "../../lib/api";
import { FOLDER_NAME_MAX_LENGTH } from "../../lib/folderApi";

type FolderNameModalProps = {
  mode: "create" | "rename";
  initialName: string;
  onClose: () => void;
  // 失敗したら throw する（エラー文は入力欄の下に出す）
  onSubmit: (name: string) => Promise<void>;
};

const FORM_ID = "folder-name-form";
const INPUT_ID = "folder-name-input";

export default function FolderNameModal({ mode, initialName, onClose, onSubmit }: FolderNameModalProps) {
  const [name, setName] = useState(initialName);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labels =
    mode === "create"
      ? { title: "フォルダの追加", submit: "追加する", submitting: "追加中..." }
      : { title: "フォルダ名の変更", submit: "保存する", submitting: "保存中..." };

  const handleSubmit = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "フォルダの保存に失敗しました。"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={labels.title}
      titleId="folder-name-modal-title"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            キャンセル
          </button>
          <button type="submit" form={FORM_ID} className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? labels.submitting : labels.submit}
          </button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit}>
        <label htmlFor={INPUT_ID} className="form-label">
          フォルダ名
        </label>
        <input
          id={INPUT_ID}
          type="text"
          maxLength={FOLDER_NAME_MAX_LENGTH}
          className={`form-control ${errorMessage ? "is-invalid" : ""}`}
          value={name}
          onChange={(changeEvent) => setName(changeEvent.target.value)}
        />
        {errorMessage && <div className="invalid-feedback">{errorMessage}</div>}
      </form>
    </Modal>
  );
}
