import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../util/auth";
import { LoginDialog } from "./reuseable";

const LoginPage = () => {
  const [loginOpen, setLoginOpen] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      window.postMessage({ command: "parakeet-openPopup" }, origin);
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      <LoginDialog
        newAccount={false}
        open={loginOpen}
        onOpenChange={setLoginOpen}
        closeable={false}
      />
    </>
  );
};

export default LoginPage;
