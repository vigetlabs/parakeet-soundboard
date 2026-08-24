import { UpdateIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import { Dialog, Form } from "radix-ui";
import * as React from "react";
import { useAuth } from "../../util/auth";
import { queryClient } from "../../util/db";
import { TextInput } from ".";
import "./login.css";

const SetUsernameDialog = () => {
  const { fetchWithAuth } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const setUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await fetchWithAuth("/users/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.status?.message || "Failed to set username");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      setServerError(error.message);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setUsernameMutation.mutate(data.username as string);
  }

  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay className="dialogOverlay" />
        <Dialog.Content className="loginModal" onEscapeKeyDown={(e) => e.preventDefault()}>
          <Dialog.Title asChild>
            <h3 className="popoverTitle loginTitle">Choose a Username</h3>
          </Dialog.Title>
          <Form.Root onSubmit={handleSubmit} className="loginForm">
            <p className="loginSectionTitle">
              What should Parakeet call you?
            </p>
            <Form.Field className="loginField" name="username">
              <div className="loginMessageContainer">
                <Form.Message className="loginMessage" match="valueMissing">
                  Please enter a username
                </Form.Message>
                <Form.Message className="loginMessage" match="tooShort">
                  Your username must be at least 3 characters long
                </Form.Message>
                {serverError && (
                  <span className="loginMessage">{serverError}</span>
                )}
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
            <Form.Submit asChild>
              <button
                className="loginButton"
                disabled={setUsernameMutation.isPending}
              >
                {setUsernameMutation.isPending ? (
                  <UpdateIcon className="spinIcon" />
                ) : (
                  "Save Username"
                )}
              </button>
            </Form.Submit>
          </Form.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { SetUsernameDialog };
