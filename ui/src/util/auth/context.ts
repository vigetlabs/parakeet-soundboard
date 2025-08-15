import { createContext } from "react";

export type User = { id: string; email: string; username: string };

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  userLoading: boolean;
  loginLoading: boolean;
  login: (creds: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchWithAuth: (path: string, init?: RequestInit) => Promise<Response>;
};

// createContext in its own non-component file
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
