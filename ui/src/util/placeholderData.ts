import type { Group } from "./types";

export type SoundType = Array<{
  name: string;
  color: string;
  emoji: string;
  folders: Array<string>;
  tags: Array<string>;
}>;

export const placeholderButtons: SoundType = [
  {
    name: "Applause",
    color: "#BB27FF",
    emoji: "👏",
    folders: [],
    tags: ["Positive", "Crowd", "Classic", "Celebration"],
  },
  {
    name: "Airhorn",
    color: "#E90C13",
    emoji: "🔉",
    folders: ["Jokes"],
    tags: ["Funny", "Sharp", "Meme", "Celebration"],
  },
  {
    name: "Anime Wow",
    color: "#FF4BD8",
    emoji: "🎉",
    folders: ["Jokes"],
    tags: ["Positive", "Funny", "Cute", "Voice", "Meme"],
  },
  {
    name: "Crickets",
    color: "#FF6E42",
    emoji: "🦗",
    folders: ["Misc"],
    tags: ["Negative", "Gentle", "Nature", "Animal"],
  },
  {
    name: "Explosion",
    color: "#008573",
    emoji: "💥",
    folders: ["Favorites"],
    tags: ["Funny", "Sharp", "Impact"],
  },
  {
    name: "Duck",
    color: "#00D5B8",
    emoji: "🦆",
    folders: ["Favorites"],
    tags: ["Funny", "Animal", "Meme"],
  },
  {
    name: "Splat",
    color: "#6200AD",
    emoji: "♠️",
    folders: ["Favorites"],
    tags: ["Funny", "Smooth", "Meme"],
  },
  {
    name: "Drumroll",
    color: "#FFC53D",
    emoji: "🥁",
    folders: ["Misc"],
    tags: ["Impact", "Classic", "Celebration"],
  },
  {
    name: "Yippee",
    color: "#00C8FF",
    emoji: "🏳️‍🌈",
    folders: ["Favorites"],
    tags: ["Positive", "Funny", "Cute", "Voice", "Meme", "Celebration"],
  },
  {
    name: "Background Music",
    color: "#5373F2",
    emoji: "🎵",
    folders: ["Favorites", "Misc"],
    tags: ["Positive", "Smooth", "Musical", "Electronic", "Celebration"],
  },
];

export const placeholderButtonsNoFolders = structuredClone(
  placeholderButtons
).forEach((sound) => (sound.folders = []));

export const placeholderFolders = [
  { name: "Favorites", slug: "favorites" },
  { name: "Jokes", slug: "jokes" },
  { name: "Dungeons & Dragons", slug: "dungeons-and-dragons" },
  { name: "Misc", slug: "misc" },
];

export const placeholderGroups: Group[] = [
  {
    name: "Game Night",
    slug: "game-night",
    emoji: "🎲",
    color: "#BB27FF",
    code: "GAME1334",
    numMembers: 5,
  },
  {
    name: "Game Night",
    slug: "game-night",
    emoji: "🎲",
    color: "#BB27FF",
    code: "GAME42",
    numMembers: 5,
  },
  {
    name: "Game Night",
    slug: "game-night",
    emoji: "🎲",
    color: "#BB27FF",
    code: "GAME43",
    numMembers: 5,
  },
  {
    name: "Game Night",
    slug: "game-night",
    emoji: "🎲",
    color: "#BB27FF",
    code: "GAME44",
    numMembers: 5,
  },
  {
    name: "Game Night",
    slug: "game-night",
    emoji: "🎲",
    color: "#BB27FF",
    code: "GAME45",
    numMembers: 5,
  },
  {
    name: "Game Night",
    slug: "game-night",
    emoji: "🎲",
    color: "#BB27FF",
    code: "GAME46",
    numMembers: 5,
  },
  {
    name: "Game Night",
    slug: "game-night",
    emoji: "🎲",
    color: "#BB27FF",
    code: "GAME47",
    numMembers: 5,
  },
  {
    name: "Game Night",
    slug: "game-night",
    emoji: "🎲",
    color: "#BB27FF",
    code: "GAME42",
    numMembers: 5,
  },
  {
    name: "Game Night",
    slug: "game-night",
    emoji: "🎲",
    color: "#BB27FF",
    code: "GAME48",
    numMembers: 5,
  },
  {
    name: "Office",
    slug: "office",
    emoji: "💼",
    color: "#5373F2",
    code: "WORK11",
    numMembers: 12,
  },
  {
    name: "Family",
    slug: "family",
    emoji: "🏡",
    color: "#00D5B8",
    code: "FAM777",
    numMembers: 4,
  },
];

export const placeholderTags = [
  { name: "Negative", color: "green" },
  { name: "Positive", color: "green" },
  { name: "Funny", color: "green" },
  { name: "Scary", color: "green" },
  { name: "Cute", color: "green" },
  { name: "Sad", color: "green" },
  { name: "Gentle", color: "blue" },
  { name: "Sharp", color: "blue" },
  { name: "Smooth", color: "blue" },
  { name: "Impact", color: "blue" },
  { name: "Voice", color: "pink" },
  { name: "Musical", color: "pink" },
  { name: "Electronic", color: "pink" },
  { name: "Nature", color: "pink" },
  { name: "Animal", color: "pink" },
  { name: "Crowd", color: "orange" },
  { name: "Retro", color: "orange" },
  { name: "Classic", color: "orange" },
  { name: "Meme", color: "orange" },
  { name: "Celebration", color: "orange" },
  { name: "Holiday", color: "orange" },
];

export const placeholderAdmins = [
  { name: "Alice Johnson", email: "alice@example.com" },
  { name: "Bob Smith", email: "bob@example.com" },
  { name: "Carol White", email: "carol@example.com" },
  { name: "David Lee", email: "david@example.com" },
  { name: "Eve Martinez", email: "eve@example.com" },
  { name: "Frank Chen", email: "frank@example.com" },
  { name: "Grace Kim", email: "grace@example.com" },
];

export const defaultColors = [
  "#BB27FF",
  "#008573",
  "#5373F2",
  "#FF4BD8",
  "#FFC53D",
  "#E90C13",
  "#6200AD",
  "#FF6E42",
  "#00D5B8",
  "#00C8FF",
];
