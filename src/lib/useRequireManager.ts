import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentManager, managerLogout, type Manager } from "./managerApi";

export function useRequireManager(): {
  manager: Manager | null;
  loading: boolean;
  error: string | null;
  handleLogout: () => Promise<void>;
} {
  const [manager, setManager] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const currentManager = await getCurrentManager();
        if (cancelled) return;
        if (!currentManager) {
          navigate("/manager/login", { replace: true });
          return;
        }
        setManager(currentManager);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setError("読み込みに失敗しました。時間をおいて再試行してください。");
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await managerLogout();
    } finally {
      navigate("/manager/login", { replace: true });
    }
  };

  return { manager, loading, error, handleLogout };
}
