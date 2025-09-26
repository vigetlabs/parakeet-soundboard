export const API_URL = `${import.meta.env.VITE_API_HOST}${
  import.meta.env.VITE_API_PORT ? `:${import.meta.env.VITE_API_PORT}` : ""
}`;

async function fetchWithAuth(
  token: string | null,
  path: string,
  init?: RequestInit
) {
  let res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 && token) {
    // This means the token has expired

    const refreshToken = await storage.getItem("local:refresh");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_URL}/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newToken = refreshData.access_token;
          
          await storage.setItem("local:jwt", newToken);
          
          // Retry the original request with new token
          let new_res = await fetch(`${API_URL}${path}`, {
            ...init,
            headers: {
              ...(init?.headers || {}),
              Authorization: `Bearer ${newToken}`,
            },
          });
          return new_res
        }
      } catch (error) {
        console.log("Token refresh failed:", error);
      }
    }

    // If refresh fails - log out
    alert("You've been logged out!");
    storage.removeItem("local:jwt");
    storage.removeItem("local:refresh");
    res = await fetchWithAuth(null, path, init);
  }
  return res;
}

export async function login(token: string) {
  if (!token) {
    return null;
  }

  let user: User = null;

  const res = await fetchWithAuth(token, "/users/show");

  // TODO: Handle if the server is down
  const json = await res.json();
  if (json.username) {
    user = json;
  }

  return user;
}

export async function getSounds() {
  const token = (await storage.getItem("local:jwt")) ?? null;
  const res = await fetchWithAuth(token as string, "/sounds");

  if (!res.ok) throw new Error("Failed to fetch sounds");
  return res.json();
}
