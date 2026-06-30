export type Tag = { name: string; id?: number; color?: string };
export type Folder = { name: string; slug: string };

// Internal shape the groups UI binds to. This is intentionally decoupled from
// the (not-yet-defined) API response — see normalizeGroup in util/groups.ts,
// which is the single place that maps the endpoint's shape onto this type.
export type Group = {
  name: string;
  slug: string;
  emoji?: string;
  color?: string;
  textColor?: string;
  code?: string;
  numMembers?: number;
  isPublic?: boolean;
};
