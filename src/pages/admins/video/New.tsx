// src/pages/admins/video/New.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminPost } from "../../../lib/adminApi";
import { getApiErrorMessage } from "../../../lib/api";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageSpinner from "../../../components/admin/PageSpinner";
import PageError from "../../../components/admin/PageError";
import VideoForm, { EMPTY_VIDEO_FORM, validateVideoForm } from "../../../components/admin/VideoForm";
import { useRequireAdmin } from "../../../lib/useRequireAdmin";

export default function AdminVideoPostPage() {
  const navigate = useNavigate();
  const { admin, loading, error: networkError, handleLogout } = useRequireAdmin();

  const [values, setValues] = useState(EMPTY_VIDEO_FORM);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const validationMessage = validateVideoForm(values);
    if (validationMessage) { setSubmitError(validationMessage); return; }

    setIsSubmitting(true);
    try {
      await createAdminPost(values);
      navigate("/admin/videos");
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "動画の投稿に失敗しました。"));
      setIsSubmitting(false);
    }
  };

  if (networkError) {
    return <PageError message={networkError} />;
  }

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <VideoForm
        heading="動画投稿"
        values={values}
        onChange={setValues}
        submitLabel="投稿する"
        submittingLabel="投稿中..."
        isSubmitting={isSubmitting}
        errorMessage={submitError}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/videos")}
      />
    </AdminLayout>
  );
}
