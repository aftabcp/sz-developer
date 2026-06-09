import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const localToken = localStorage.getItem("admin_token");
    if (!localToken) {
      router.push("/admin/login");
    } else {
      setToken(localToken);
    }
    setLoading(false);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  return { token, loading, logout };
}
