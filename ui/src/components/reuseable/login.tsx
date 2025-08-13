import { Cross2Icon, UpdateIcon } from "@radix-ui/react-icons";
import { Dialog, Form } from "radix-ui";
import * as React from "react";
import { PasswordInput, TextInput } from ".";
import { useAuth } from "../../util/auth/useAuth";
import "./login.css";

export interface LoginDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Content> {
  newAccount: boolean;
}

const LoginDialog = ({
  newAccount,
  className = "",
  children,
  ...props
}: LoginDialogProps) => {
  const classes = `loginModal ${className}`.trim();
  const [createAccount, setCreateAccount] = React.useState(newAccount);
  const { login, loading } = useAuth();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // setIsSaving(true);
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));

    if (createAccount && data.password !== data.reenteredPassword) {
      event.preventDefault();

      const reenteredPasswordElement = event.currentTarget.elements.namedItem(
        "reenteredPassword"
      ) as HTMLInputElement | null;

      if (reenteredPasswordElement) {
        reenteredPasswordElement.setCustomValidity("passwordMismatch");
        reenteredPasswordElement.reportValidity();
      }
      return;
    }

    if (createAccount) {
      // TODO
    } else {
      const success = login({
        email: data.email as string,
        password: data.password as string,
      });
      if (!success) {
        alert("Login failed!");
      }
    }
  }

  // async function handleLogin(e: React.FormEvent) {
  //   e.preventDefault();
  //   setLoginError(null);
  //   try {
  //     const res = await fetch("http://localhost:3001/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         user: { email: loginEmail, password: loginPassword },
  //       }),
  //     });
  //     const response = await res.json();
  //     const authHeader = res.headers.get("Authorization");
  //     let token;
  //     if (authHeader && authHeader.startsWith("Bearer ")) {
  //       token = authHeader.split(" ")[1];
  //     }
  //     if (!token) throw new Error("No token received");
  //     localStorage.setItem("jwt", token);
  //     setShowLogin(false);
  //     setLoginEmail("");
  //     setLoginPassword("");
  //     setUsername(response.status.data.user.username);
  //     localStorage.setItem("username", response.status.data.user.username);
  //     alert("Logged in!");
  //   } catch {
  //     setLoginError("Login failed");
  //   }
  // }

  return (
    <Dialog.Root onOpenChange={() => setCreateAccount(newAccount)}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialogOverlay" />
        <Dialog.Content className={classes} {...props}>
          <Dialog.Title asChild>
            <h3 className="popoverTitle loginTitle">
              {createAccount ? "New User" : "Returning User"}
            </h3>
          </Dialog.Title>
          <Form.Root onSubmit={handleSubmit} className="loginForm">
            {createAccount && <h4 className="loginSectionTitle">Login Info</h4>}
            <Form.Field className="loginField" name="email">
              <div className="loginMessageContainer">
                <Form.Message className="loginMessage" match="valueMissing">
                  Please enter your email
                </Form.Message>
                <Form.Message className="loginMessage" match="typeMismatch">
                  Please provide a valid email
                </Form.Message>
              </div>
              <Form.Control asChild>
                <TextInput
                  required
                  email
                  className="loginInput"
                  placeholder=""
                />
              </Form.Control>
              <div className="loginLabelContainer">
                <Form.Label className="loginLabel">Email</Form.Label>
              </div>
            </Form.Field>
            {createAccount && (
              <Form.Field className="loginField" name="username">
                <div className="loginMessageContainer">
                  <Form.Message className="loginMessage" match="valueMissing">
                    Please enter a username
                  </Form.Message>
                  <Form.Message className="loginMessage" match="tooShort">
                    Your username must be at least 3 characters long
                  </Form.Message>
                </div>
                <Form.Control asChild>
                  <TextInput
                    required
                    minLength={3}
                    maxLength={32}
                    className="loginInput"
                    placeholder=""
                  />
                </Form.Control>
                <div className="loginLabelContainer">
                  <Form.Label className="loginLabel">Username</Form.Label>
                </div>
              </Form.Field>
            )}
            {createAccount && (
              <h4 className="loginSectionTitle">Create Password</h4>
            )}
            <Form.Field className="loginField" name="password">
              <div className="loginMessageContainer">
                <Form.Message className="loginMessage" match="valueMissing">
                  Please enter a password
                </Form.Message>
                <Form.Message className="loginMessage" match="tooShort">
                  Your password must be at least 6 characters long
                </Form.Message>
              </div>
              <Form.Control asChild>
                <PasswordInput
                  required
                  className="loginInput"
                  placeholder=""
                  minLength={6}
                />
              </Form.Control>
              <div className="loginLabelContainer">
                <Form.Label className="loginLabel">Password</Form.Label>
              </div>
            </Form.Field>
            {createAccount && (
              <Form.Field className="loginField" name="reenteredPassword">
                <div className="loginMessageContainer">
                  <Form.Message className="loginMessage" match="valueMissing">
                    Please confirm your password
                  </Form.Message>
                  <Form.Message
                    className="loginMessage"
                    match={(value, formData) =>
                      value !== formData.get("password")
                    }
                  >
                    Your passwords do not match!
                  </Form.Message>
                </div>
                <Form.Control asChild>
                  <PasswordInput
                    required
                    className="loginInput"
                    placeholder=""
                  />
                </Form.Control>
                <div className="loginLabelContainer">
                  <Form.Label className="loginLabel">
                    Re-Enter Password
                  </Form.Label>
                </div>
              </Form.Field>
            )}
            <Form.Submit asChild>
              <button className="loginButton" disabled={loading}>
                {loading ? (
                  <UpdateIcon className="spinIcon" />
                ) : createAccount ? (
                  "Create Account"
                ) : (
                  "Log In"
                )}
              </button>
            </Form.Submit>
          </Form.Root>
          <p className="loginFooter">
            {createAccount ? "Already have an account? " : "New to Parakeet? "}
            <button
              className="loginFooterButton"
              onClick={() => setCreateAccount(!createAccount)}
            >
              {createAccount ? "Log In" : "Create Account"}
            </button>
          </p>
          <Dialog.Close className="tagPickerClose" aria-label="Close">
            <Cross2Icon className="tagPickerCloseIcon" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { LoginDialog };
