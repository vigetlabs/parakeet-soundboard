import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./auth";
import { placeholderGroups } from "./placeholderData";
import type { Group } from "./types";

/**
 * Single source of truth for loading groups.
 *
 * Right now this returns placeholder data. When the `/groups` endpoint is live,
 * the ONLY change needed here is the queryFn body:
 *
 *   const { userLoading, fetchWithAuth } = useAuth();
 *   ...
 *   queryFn: () =>
 *     fetchWithAuth("/groups").then(async (res) => {
 *       if (!res.ok) throw new Error("Failed to fetch groups");
 *       return (await res.json()).data.map(normalizeGroup);
 *     }),
 *
 * Everything downstream binds to the `Group` type, so no component changes.
 */
export function useGroups() {
  const { userLoading } = useAuth();

  return useQuery<Group[]>({
    queryKey: ["groups", "allGroups"],
    // TODO: swap for a real fetch + .map(normalizeGroup) once the endpoint exists
    queryFn: async () => placeholderGroups,
    enabled: !userLoading,
  });
}

/**
 * Adapter from the (not-yet-finalized) API shape to the internal `Group` type.
 * This is the one place that knows about the wire format — fill it in once the
 * endpoint exists. The `Group` return type makes the compiler flag any field
 * the UI relies on that the API doesn't yet provide.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeGroup(apiGroup: any): Group {
  return {
    name: apiGroup.attributes.name,
    slug: apiGroup.attributes.slug,
    emoji: apiGroup.attributes.emoji,
    color: apiGroup.attributes.color,
    code: apiGroup.attributes.code,
    numMembers: apiGroup.attributes.members?.length,
  };
}
