import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import { API_URL, queryClient } from "../db";
import { AuthContext, type AuthContextValue, type User } from "./context";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const loginMut = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { email: credentials.email, password: credentials.password },
        }),
      });

      if (res.status === 401) {
        // TODO: Make this a toast
        alert("Incorrect username or password");
      }

      if (!res.ok) {
        throw new Error("Failed to create user");
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
      window.postMessage({ command: "parakeet-setAuthToken", token }, origin);

      setUser(res.data.status.data.user);
      queryClient.setQueryData(
        ["auth", "user"],
        res.data.status.data.user ?? null
      );
      queryClient.invalidateQueries();

      window.location.reload();
    },
  });

  //   const logoutMut = useMutation({
  //     mutationFn: async () => {
  //       const res = await fetch(`${API_URL}/logout`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //       });

  //       if (!res.ok) {
  //         setLoading(false);
  //         throw new Error("Logout failed");
  //       }

  //       return res.json();
  //     },
  //     onSuccess: () => {
  //       setToken(null);
  //       setUser(null);
  //       queryClient.removeQueries();
  //       queryClient.invalidateQueries();
  //       setLoading(false);
  //     },
  //   });

  async function fetchWithoutAuth(path: string, init?: RequestInit) {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.headers || {}),
      },
    });

    return res;
  }

  const fetchWithAuth = useCallback(
    async (path: string, init?: RequestInit, overrideToken?: string) => {
      let res;
      if (!overrideToken && !token) {
        res = await fetchWithoutAuth(path, init);
      } else {
        res = await fetch(`${API_URL}${path}`, {
          ...init,
          headers: {
            ...(init?.headers || {}),
            Authorization: `Bearer ${overrideToken ?? token}`,
          },
        });

        if (res.status === 401) {
          // This means the token has expired, so remove it
          alert("You've been logged out!");
          setUser(null);
          setToken(null);
          localStorage.removeItem("jwt");
          window.postMessage({ command: "parakeet-removeAuthToken" }, origin);
          queryClient.setQueryData(["auth", "user"], null);
          res = fetchWithoutAuth(path, init);
        }
      }
      return res;
    },
    [token]
  );

  // Get the current user on page load
  const userQuery = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const token = localStorage.getItem("jwt");
      if (!token) {
        return null;
      }
      setToken(token);
      window.postMessage({ command: "parakeet-setAuthToken", token }, origin);

      const res = await fetchWithAuth(
        "/users/show",
        undefined,
        token ?? undefined
      );

      // TODO: Handle if the server is down
      const json = await res.json();
      if (!json.username) {
        setUser(null);
      } else {
        setUser(json);
      }
      return json;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const login = useCallback(
    async (creds: { email: string; password: string }) => {
      await loginMut.mutateAsync(creds);
    },
    [loginMut]
  );

  const logout = useCallback(async () => {
    // Enable these when we have tokens that last more than 30 mins
    // setLoading(true);
    // await logoutMut.mutateAsync();
    // return success;

    setUser(null);
    localStorage.removeItem("jwt");
    window.postMessage({ command: "parakeet-removeAuthToken" }, origin);
    queryClient.setQueryData(["auth", "user"], null);
    window.location.reload();
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    userLoading: userQuery.isLoading,
    loginLoading: loginMut.isPending,
    login,
    logout,
    fetchWithAuth,
  };

  //   if (userQuery.isLoading) {
  //     return <UpdateIcon className="spinIcon spinIconLarge" />;
  //   }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
