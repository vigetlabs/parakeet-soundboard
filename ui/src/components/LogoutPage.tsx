import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../util/auth";

const LogoutPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function startLogout() {
      await logout();
      window.postMessage({ command: "parakeet-openPopup" }, origin);
      navigate("/");
    }
    startLogout();
  }, [logout, navigate]);

  return <></>;
};

export default LogoutPage;
