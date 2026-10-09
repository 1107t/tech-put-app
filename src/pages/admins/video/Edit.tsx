// src/pages/admins/video/Edit.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getAdminPost, updateAdminPost } from "../../../lib/adminApi";
import { getApiErrorMessage } from "../../../lib/api";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageSpinner from "../../../components/admin/PageSpinner";
import PageError from "../../../components/admin/PageError";
import VideoForm, { EMPTY_VIDEO_FORM, validateVideoForm } from "../../../components/admin/VideoForm";
import { useRequireAdmin } from "../../../lib/useRequireAdmin";

export default function AdminVideoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { admin, loading, error: networkError, handleLogout } = useRequireAdmin();

  const [values, setValues] = useState(EMPTY_VIDEO_FORM);
  const [isLoadFinished, setIsLoadFinished] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!admin || !id) return;
    let cancelled = false;
    getAdminPost(id)
      .then((post) => {
        if (cancelled) return;
        setValues({ title: post.title, body: post.body, youtubeUrl: post.youtubeUrl });
      })
      .catch((err) => {
        if (cancelled) return;
        const isNotFound = axios.isAxiosError(err) && err.response?.status === 404;
        setLoadErrorMessage(isNotFound ? "動画が見つかりません。" : getApiErrorMessage(err, "動画の読み込みに失敗しました。"));
      })
      .finally(() => {
        if (!cancelled) setIsLoadFinished(true);
      });
    return () => { cancelled = true; };
  }, [admin, id]);

  const handleSubmit = async () => {
    if (isSubmitting || !id) return;

    const validationMessage = validateVideoForm(values);
    if (validationMessage) { setSubmitError(validationMessage); return; }

    setIsSubmitting(true);
    try {
      await updateAdminPost(id, values);
      navigate("/admin/videos");
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "動画の更新に失敗しました。"));
      setIsSubmitting(false);
    }
  };

  if (networkError) {
    return <PageError message={networkError} />;
  }

  if (loading || !isLoadFinished) {
    return <PageSpinner />;
  }

  if (loadErrorMessage) {
    return (
      <AdminLayout admin={admin} onLogout={handleLogout}>
        <p className="text-danger">{loadErrorMessage}</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <VideoForm
        heading="動画編集"
        values={values}
        onChange={setValues}
        submitLabel="更新する"
        submittingLabel="更新中..."
        isSubmitting={isSubmitting}
        errorMessage={submitError}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/videos")}
      />
    </AdminLayout>
  );
}
