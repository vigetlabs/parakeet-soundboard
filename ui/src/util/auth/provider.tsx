// src/auth/provider.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { API_URL } from "../db";
import { AuthContext, type AuthContextValue, type User } from "./context";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const qc = useQueryClient();

  const loginMut = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { email: credentials.email, password: credentials.password },
        }),
      });

      if (!res.ok) {
        setLoading(false);
        setSuccess(false);
        alert("Login failed");
      }

      const data = await res.json();
      const authHeader = res.headers.get("Authorization");

      return { data, authHeader };
    },
    onSuccess: (res) => {
      let token;
      if (res.authHeader && res.authHeader.startsWith("Bearer ")) {
        token = res.authHeader.split(" ")[1];
      }
      if (!token) throw new Error("No token received");
      setToken(token);
      localStorage.setItem("jwt", token);

      setUser(res.data.status.data.user);
      qc.setQueryData(["auth", "user"], res.data.status.data.user ?? null);
      qc.invalidateQueries();
      setLoading(false);
      setSuccess(true);
    },
  });

  // logout mutation
  const logoutMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        setLoading(false);
        setSuccess(false);
        throw new Error("Logout failed");
      }

      return res.json();
    },
    onSuccess: () => {
      setToken(null);
      setUser(null);
      qc.removeQueries();
      qc.invalidateQueries();
      setLoading(false);
      setSuccess(true);
    },
  });

  const login = async (creds: { email: string; password: string }) => {
    setLoading(true);
    await loginMut.mutateAsync(creds);
    return success;
  };

  const logout = async () => {
    setLoading(true);
    await logoutMut.mutateAsync();
    return success;
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
