import { useState } from "react";
import { getArticle, likeArticle, unlikeArticle, type Article } from "../../lib/articleApi";
import { getApiErrorMessage } from "../../lib/api";

type ArticleLikeButtonProps = {
  article: Article;
  onChange: (article: Article) => void;
};

export default function ArticleLikeButton({ article, onChange }: ArticleLikeButtonProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [likeError, setLikeError] = useState("");

  const handleLikeToggle = async () => {
    setIsLiking(true);
    setLikeError("");
    try {
      if (article.likedByCurrentUser) {
        await unlikeArticle(article.id);
      } else {
        await likeArticle(article.id);
      }
      // いいね数は他の受講生の操作でも変わるため、サーバーの値を取り直す
      const latestArticle = await getArticle(article.id);
      if (latestArticle) onChange(latestArticle);
    } catch (err) {
      setLikeError(getApiErrorMessage(err, "いいねの更新に失敗しました。"));
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`btn btn-sm ${article.likedByCurrentUser ? "btn-danger" : "btn-outline-danger"}`}
        onClick={handleLikeToggle}
        disabled={isLiking}
        aria-pressed={article.likedByCurrentUser}
      >
        <i className={`${article.likedByCurrentUser ? "fa-solid" : "fa-regular"} fa-heart me-1`} aria-hidden="true" />
        いいね {article.likesCount}
      </button>
      {likeError && <p className="text-danger small mt-2 mb-0">{likeError}</p>}
    </>
  );
}
