import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentAdmin, adminLogout, type Admin } from "./adminApi";

export function useRequireAdmin(): {
  admin: Admin | null;
  loading: boolean;
  handleLogout: () => Promise<void>;
} {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  return { admin, loading, handleLogout };
}
