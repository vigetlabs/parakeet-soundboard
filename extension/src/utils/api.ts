export const API_URL = `${import.meta.env.VITE_API_HOST}:${
  import.meta.env.VITE_API_PORT
}`;

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: { email, password } }),
  });
  const data = await res.json();
  if (res.ok && res.headers.get("Authorization")) {
    const jwt = res.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    await browser.storage.local.set({ jwt });
    return jwt;
  }
  throw new Error(data.status?.message || "Login failed");
}

export async function getMySounds() {
  const { jwt } = await browser.storage.local.get("jwt");
  if (!jwt) throw new Error("Not logged in");
  const res = await fetch(`${API_URL}/my_sounds`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok) throw new Error("Failed to fetch sounds");
  return res.json();
}

export async function getDefaultSounds() {
  const res = await fetch(`${API_URL}/sounds`);
  if (!res.ok) throw new Error("Failed to fetch default sounds");
  return res.json();
}
