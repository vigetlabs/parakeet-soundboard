import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../util/auth";
import { LoginDialog } from "./reuseable";

const SSO_ERROR_MESSAGES: Record<string, string> = {
  email_exists:
    "An account with this email already exists. Log in with your password instead.",
  untrusted_google_account:
    "We can't verify that Google account's email. Please sign up with a password instead.",
  sso_failed: "Something went wrong signing in with Google. Please try again.",
};

const LoginPage = () => {
  const [loginOpen, setLoginOpen] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const errorCode = searchParams.get("error");
  const errorMessage = errorCode
    ? SSO_ERROR_MESSAGES[errorCode] ?? SSO_ERROR_MESSAGES.sso_failed
    : undefined;

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
        errorMessage={errorMessage}
      />
    </>
  );
};

export default LoginPage;
