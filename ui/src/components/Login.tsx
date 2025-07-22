import { useEffect } from "react";
import { Form } from "radix-ui";
import { PasswordInput, TextInput } from "./reuseable";

const Login = () => {
  useEffect(() => {
    console.log(`Login mounted`);
  }, []);

  return (
    <div className="Login-component">
      Login
      <Form.Root
        className="FormRoot"
        onSubmit={(e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget));
          console.log(data);
        }}
      >
        <Form.Field className="FormField" name="email">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Form.Label className="FormLabel">Email</Form.Label>
            <Form.Message className="FormMessage" match="valueMissing">
              Please enter your email
            </Form.Message>
            <Form.Message className="FormMessage" match="typeMismatch">
              Please provide a valid email
            </Form.Message>
          </div>
          <Form.Control asChild>
            <TextInput required email />
          </Form.Control>
        </Form.Field>
        <Form.Field className="FormField" name="password">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Form.Label className="FormLabel">Password</Form.Label>
            <Form.Message className="FormMessage" match="valueMissing">
              Please enter a password
            </Form.Message>
          </div>
          <Form.Control asChild>
            <PasswordInput required />
          </Form.Control>
        </Form.Field>
        <Form.Submit asChild>
          <button className="Button" style={{ marginTop: 10 }}>
            Login
          </button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
};

export default Login;
