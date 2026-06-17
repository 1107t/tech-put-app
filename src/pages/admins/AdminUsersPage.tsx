// src/pages/admins/AdminUsersPage.tsx【修正】
// 登録ユーザー一覧ページ。管理者ログイン確認後、ユーザー一覧とつぶやき投稿数を表示する。
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentAdmin,
  adminLogout,
  type Admin,
} from "../../lib/adminStore";
import { getUsers } from "../../lib/usersStore";
import { getTweets } from "../../lib/tweetsStore";
import type { User } from "../../lib/users";
import type { Tweet } from "../../lib/tweets";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  // 全つぶやきを保持し、ユーザーごとの件数集計に使用する
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const currentAdmin = await getCurrentAdmin();
      if (cancelled) return;
      if (!currentAdmin) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setAdmin(currentAdmin);

      // ユーザー一覧とつぶやき一覧を並列取得してロード時間を短縮する
      const [allUsers, allTweets] = await Promise.all([getUsers(), getTweets()]);
      if (!cancelled) {
        setUsers(allUsers);
        setTweets(allTweets);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  // ユーザーIDをキーに、つぶやき件数を集計するマップを生成する
  const tweetCountByUserId = tweets.reduce<Record<string, number>>((accumulator, tweet) => {
    accumulator[tweet.userId] = (accumulator[tweet.userId] ?? 0) + 1;
    return accumulator;
  }, {});

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
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">登録ユーザー一覧</h4>
        <button className="btn btn-success btn-sm">並べ替え</button>
        <button className="btn btn-success btn-sm">絞り込み検索</button>
      </div>

      <div className="card shadow-sm">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>名前</th>
              <th>email</th>
              <th>記事投稿数</th>
              <th>動画投稿数</th>
              {/* つぶやき投稿数列を追加 */}
              <th>つぶやき投稿数</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                {/* colSpan をつぶやき投稿数列の追加に合わせて6に更新 */}
                <td colSpan={6} className="text-center text-muted py-4">
                  登録されているユーザーがいません
                </td>
              </tr>
            ) : (
              users.map((user) => {
                // 対象ユーザーのつぶやき件数（投稿がなければ0）
                const tweetCount = tweetCountByUserId[user.id] ?? 0;
                return (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td className="text-muted">0</td>
                    <td className="text-muted">0</td>
                    <td>
                      {/* クリックでユーザー別つぶやき一覧ページへ遷移する */}
                      <button
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={() => navigate(`/admin/users/${user.id}/tweets`)}
                      >
                        {tweetCount}
                      </button>
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-link text-secondary p-0">
                        ⋮
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}