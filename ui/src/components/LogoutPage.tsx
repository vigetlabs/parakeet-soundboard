import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../util/auth";

const LogoutPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    window.postMessage({ command: "parakeet-openPopup" }, origin);
    navigate("/");
  }, [logout, navigate]);

  return <></>;
};

export default LogoutPage;
