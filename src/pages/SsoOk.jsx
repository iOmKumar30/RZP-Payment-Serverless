import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SsoOk() {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.setItem("relf_admin", "true");
    navigate("/admin/donations", { replace: true });
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      Signing in…
    </div>
  );
}
