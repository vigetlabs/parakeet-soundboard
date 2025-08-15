import { Cross2Icon, UpdateIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import { Dialog, Form, Popover } from "radix-ui";
import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, PasswordInput, TextInput } from ".";
import { useAuth } from "../../util/auth";
import "./login.css";

export interface LoginDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Content> {
  newAccount: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeable?: boolean;
}

const LoginDialog = ({
  newAccount,
  open,
  onOpenChange,
  closeable = true,
  className = "",
  children,
  ...props
}: LoginDialogProps) => {
  const classes = `loginModal ${className}`.trim();
  const [createAccount, setCreateAccount] = React.useState(newAccount);
  const [isLoading, setIsLoading] = React.useState(false);
  const { login, loginLoading, fetchWithAuth } = useAuth();
  const navigate = useNavigate();

  const signUpMutation = useMutation({
    mutationFn: async (user: {
      email: string;
      username: string;
      password: string;
    }) => {
      const formData = new FormData();
      formData.append("user[email]", user.email);
      formData.append("user[username]", user.username);
      formData.append("user[password]", user.password);

      const res = await fetchWithAuth("/signup", {
        method: "POST",
        body: formData,
      });

      if (res.status === 422) {
        // TODO: Make this a toast
        alert("That email or username already exists!");
      }

      if (!res.ok) {
        setIsLoading(false);
        throw new Error("Failed to create user");
      }

      return res.json();
    },
    onSuccess: (_, vars) => {
      login({
        email: vars.email,
        password: vars.password,
      });
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));

    if (createAccount && data.password !== data.reenteredPassword) {
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
      setIsLoading(true);
      signUpMutation.mutate({
        email: data.email as string,
        username: data.username as string,
        password: data.password as string,
      });
    } else {
      login({
        email: data.email as string,
        password: data.password as string,
      });
    }
  }

  useEffect(() => {
    if (open) {
      setCreateAccount(newAccount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        if (!closeable) {
          navigate("/");
        }
        onOpenChange(open);
        setCreateAccount(newAccount);
      }}
    >
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialogOverlay" />
        <Dialog.Content
          className={classes}
          {...props}
          onEscapeKeyDown={(e) => {
            if (!closeable) e.preventDefault();
            navigate("/");
          }}
          onPointerDownOutside={(e) => {
            if (!closeable) e.preventDefault();
            navigate("/");
          }}
          onInteractOutside={(e) => {
            if (!closeable) e.preventDefault();
            navigate("/");
          }}
        >
          <Dialog.Title asChild>
            <h3 className="popoverTitle loginTitle">
              {createAccount ? "Create Account" : "Log In"}
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
              <button
                className="loginButton"
                disabled={loginLoading || isLoading}
              >
                {loginLoading || isLoading ? (
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

const LogoutPopover = ({
  className = "",
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Popover.Content>) => {
  const classes = `logoutPopover ${className}`.trim();
  const { logout, loginLoading } = useAuth();

  return (
    <Popover.Root>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          collisionPadding={16}
          className={classes}
          side="right"
          {...props}
        >
          <h3 className="popoverTitle">Log out?</h3>
          <div className="confirmDeleteButtons">
            <Button
              className="dangerButton"
              onClick={() => {
                logout();
                window.location.reload();
              }}
              disabled={loginLoading}
            >
              {loginLoading ? <UpdateIcon className="spinIcon" /> : "Log Out"}
            </Button>
            <Popover.Close asChild>
              <Button>Cancel</Button>
            </Popover.Close>
          </div>
          <Popover.Close className="tagPickerClose" aria-label="Close">
            <Cross2Icon className="tagPickerCloseIcon" />
          </Popover.Close>
          <Popover.Arrow className="tagPickerArrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export { LoginDialog, LogoutPopover };
