import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./util/auth/useAuth";

export default function AuthCallback() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("token");
    const refreshToken = params.get("refresh_token");
    if (token) {
      // Clear the token out of the URL before applyAuthSuccess's reload()
      // fires, or the reloaded page re-reads the same hash and loops.
      window.history.replaceState(null, "", "/");
      loginWithToken(token, refreshToken ?? undefined);
    } else {
      navigate("/login?error=sso_failed");
    }
  }, []);

  return (
    <div>
      Signing you in…
    </div>
  );
}
