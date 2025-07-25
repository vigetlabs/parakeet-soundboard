import { fetchSounds } from "./db";

const db = (await fetchSounds()).data;

export type SoundType = Array<{
  name: string;
  color: string;
  emoji: string;
  url: string;
  folders: Array<string>;
}>;

export const tempButtons: SoundType = [
  {
    name: "Applause",
    color: "var(--color-preset-4)",
    emoji: "👏",
    url: db[2].attributes.audio_file_url,
    folders: [],
  },
  {
    name: "Airhorn",
    color: "var(--color-preset-1)",
    emoji: "🔉",
    url: db[0].attributes.audio_file_url,
    folders: ["Jokes"],
  },
  {
    name: "Anime Wow",
    color: "var(--color-preset-12)",
    emoji: "🎉",
    url: db[1].attributes.audio_file_url,
    folders: ["Jokes"],
  },
  {
    name: "Crickets",
    color: "var(--color-preset-3)",
    emoji: "🦗",
    url: db[4].attributes.audio_file_url,
    folders: ["Misc"],
  },
  {
    name: "Explosion",
    color: "var(--color-preset-8)",
    emoji: "💥",
    url: db[6].attributes.audio_file_url,
    folders: ["Favorites"],
  },
  {
    name: "Duck",
    color: "var(--color-preset-7)",
    emoji: "🦆",
    url: db[7].attributes.audio_file_url,
    folders: ["Favorites"],
  },
  {
    name: "Splat",
    color: "var(--color-preset-11)",
    emoji: "♠️",
    url: db[8].attributes.audio_file_url,
    folders: ["Favorites"],
  },
  {
    name: "Drumroll",
    color: "var(--color-preset-5)",
    emoji: "🥁",
    url: db[5].attributes.audio_file_url,
    folders: ["Misc"],
  },
  {
    name: "Yippee",
    color: "var(--color-preset-9)",
    emoji: "🏳️‍🌈",
    url: db[9].attributes.audio_file_url,
    folders: ["Favorites"],
  },
  {
    name: "Deltarune Music",
    color: "var(--color-preset-10)",
    emoji: "🎵",
    url: db[3].attributes.audio_file_url,
    folders: ["Favorites", "Misc"],
  },
];

export const tempButtonsNoFolders = structuredClone(tempButtons).forEach(
  (sound) => (sound.folders = [])
);

export const tempFolders = ["Favorites", "Jokes", "Dungeons & Dragons", "Misc"];
