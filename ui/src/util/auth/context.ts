// src/auth/context.ts
import { createContext } from "react";

export type User = { id: string; email: string; username: string };

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (creds: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<boolean>;
};

// createContext in its own non-component file
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
