export async function fetchSounds() {
  try {
    const res = await fetch("http://localhost:3001/sounds");
    if (!res.ok) {
      throw new Error("Failed to fetch toppings");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching toppings:", error);
    return [];
  }
}
