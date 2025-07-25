export async function fetchSounds() {
  try {
    const res = await fetch("http://localhost:3001/sounds");
    if (!res.ok) {
      throw new Error("Failed to fetch sounds");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching sounds:", error);
    return [];
  }
}
