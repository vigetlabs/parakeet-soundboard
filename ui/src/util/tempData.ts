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
    color: "#BB27FF",
    emoji: "👏",
    url: db[2].attributes.audio_file_url,
    folders: [],
    tags: ["Positive", "Crowd", "Classic", "Celebration"],
  },
  {
    name: "Airhorn",
    color: "#E90C13",
    emoji: "🔉",
    url: db[0].attributes.audio_file_url,
    folders: ["Jokes"],
    tags: ["Funny", "Sharp", "Meme", "Celebration"],
  },
  {
    name: "Anime Wow",
    color: "#FF4BD8",
    emoji: "🎉",
    url: db[1].attributes.audio_file_url,
    folders: ["Jokes"],
    tags: ["Positive", "Funny", "Cute", "Voice", "Meme"],
  },
  {
    name: "Crickets",
    color: "#FF6E42",
    emoji: "🦗",
    url: db[4].attributes.audio_file_url,
    folders: ["Misc"],
    tags: ["Negative", "Gentle", "Nature", "Animal"],
  },
  {
    name: "Explosion",
    color: "#008573",
    emoji: "💥",
    url: db[6].attributes.audio_file_url,
    folders: ["Favorites"],
    tags: ["Funny", "Sharp", "Impact"],
  },
  {
    name: "Duck",
    color: "#00D5B8",
    emoji: "🦆",
    url: db[7].attributes.audio_file_url,
    folders: ["Favorites"],
    tags: ["Funny", "Animal", "Meme"],
  },
  {
    name: "Splat",
    color: "#6200AD",
    emoji: "♠️",
    url: db[8].attributes.audio_file_url,
    folders: ["Favorites"],
    tags: ["Funny", "Smooth", "Meme"],
  },
  {
    name: "Drumroll",
    color: "#FFC53D",
    emoji: "🥁",
    url: db[5].attributes.audio_file_url,
    folders: ["Misc"],
    tags: ["Impact", "Classic", "Celebration"],
  },
  {
    name: "Yippee",
    color: "#00C8FF",
    emoji: "🏳️‍🌈",
    url: db[9].attributes.audio_file_url,
    folders: ["Favorites"],
    tags: ["Positive", "Funny", "Cute", "Voice", "Meme", "Celebration"],
  },
  {
    name: "Background Music",
    color: "#5373F2",
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
