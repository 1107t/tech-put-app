import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "./usersStore";
import type { User } from "./users";

export function useRequireAuth(): { me: User | null; handleLogout: () => Promise<void> } {
  const [me, setMe] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate("/login", { replace: true });
        return;
      }
      setMe(currentUser);
    })();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return { me, handleLogout };
}
