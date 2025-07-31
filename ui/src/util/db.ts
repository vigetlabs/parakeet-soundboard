export async function fetchSounds() {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/sounds`
    );
    if (!res.ok) {
      throw new Error("Failed to fetch sounds");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching sounds:", error);
    return [];
  }
}
