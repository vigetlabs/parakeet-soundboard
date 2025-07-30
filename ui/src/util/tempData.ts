import { fetchSounds } from "./db";

const db = (await fetchSounds()).data;

export type SoundType = Array<{
  name: string;
  color: string;
  emoji: string;
  url: string;
  folders: Array<string>;
  tags: Array<string>;
}>;

export const tempButtons: SoundType = [
  {
    name: "Applause",
    color: "var(--color-preset-4)",
    emoji: "👏",
    url: db[2].attributes.audio_file_url,
    folders: [],
    tags: ["Positive", "Crowd", "Classic", "Celebration"],
  },
  {
    name: "Airhorn",
    color: "var(--color-preset-1)",
    emoji: "🔉",
    url: db[0].attributes.audio_file_url,
    folders: ["Jokes"],
    tags: ["Funny", "Sharp", "Meme", "Celebration"],
  },
  {
    name: "Anime Wow",
    color: "var(--color-preset-12)",
    emoji: "🎉",
    url: db[1].attributes.audio_file_url,
    folders: ["Jokes"],
    tags: ["Positive", "Funny", "Cute", "Voice", "Meme"],
  },
  {
    name: "Crickets",
    color: "var(--color-preset-3)",
    emoji: "🦗",
    url: db[4].attributes.audio_file_url,
    folders: ["Misc"],
    tags: ["Negative", "Gentle", "Nature", "Animal"],
  },
  {
    name: "Explosion",
    color: "var(--color-preset-8)",
    emoji: "💥",
    url: db[6].attributes.audio_file_url,
    folders: ["Favorites"],
    tags: ["Funny", "Sharp", "Impact"],
  },
  {
    name: "Duck",
    color: "var(--color-preset-7)",
    emoji: "🦆",
    url: db[7].attributes.audio_file_url,
    folders: ["Favorites"],
    tags: ["Funny", "Animal", "Meme"],
  },
  {
    name: "Splat",
    color: "var(--color-preset-11)",
    emoji: "♠️",
    url: db[8].attributes.audio_file_url,
    folders: ["Favorites"],
    tags: ["Funny", "Smooth", "Meme"],
  },
  {
    name: "Drumroll",
    color: "var(--color-preset-5)",
    emoji: "🥁",
    url: db[5].attributes.audio_file_url,
    folders: ["Misc"],
    tags: ["Impact", "Classic", "Celebration"],
  },
  {
    name: "Yippee",
    color: "var(--color-preset-9)",
    emoji: "🏳️‍🌈",
    url: db[9].attributes.audio_file_url,
    folders: ["Favorites"],
    tags: ["Positive", "Funny", "Cute", "Voice", "Meme", "Celebration"],
  },
  {
    name: "Background Music",
    color: "var(--color-preset-10)",
    emoji: "🎵",
    url: db[3].attributes.audio_file_url,
    folders: ["Favorites", "Misc"],
    tags: ["Positive", "Smooth", "Musical", "Electronic", "Celebration"],
  },
];

export const tempButtonsNoFolders = structuredClone(tempButtons).forEach(
  (sound) => (sound.folders = [])
);

export const tempFolders = [
  { name: "Favorites", slug: "favorites" },
  { name: "Jokes", slug: "jokes" },
  { name: "Dungeons & Dragons", slug: "dungeons-and-dragons" },
  { name: "Misc", slug: "misc" },
];

export const tempTags = [
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
