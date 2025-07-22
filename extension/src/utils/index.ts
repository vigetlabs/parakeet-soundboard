import { PublicPath } from "wxt/browser";
import { CrossFunctions } from "./constants";

export async function getActiveTabID() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab.id ?? -1;
}

export async function postMessage(command: CrossFunctions, args?: {}) {
  browser.scripting.executeScript({
    target: { tabId: await getActiveTabID() },
    func: function (command: string, args?: {}) {
      window.postMessage(
        {
          command: command,
          ...args,
        },
        "*"
      );
    },
    args: [command, args ?? {}],
  });
}

declare global {
  interface Window {
    localAudio: HTMLAudioElement;
  }
}

const restrictedSchemes = [
  "chrome:",
  "chrome-extension:",
  "edge:",
  "about:",
  "moz-extension:",
];

export async function playLocalAudio(file: PublicPath, volume: number) {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const url = tab.url ?? "";
  if (restrictedSchemes.some((scheme) => url.startsWith(scheme))) {
    console.log("Can't play audio in this tab");
    return;
  }

  const fileURL = browser.runtime.getURL(file);
  browser.scripting.executeScript({
    target: { tabId: await getActiveTabID() },
    func: function (fileURL: string, volume: number) {
      if (window.localAudio) {
        const audio = window.localAudio;
        audio.pause();
        audio.remove();
      }
      const audio = new Audio(fileURL);
      audio.currentTime = 0;
      audio.volume = volume / 100;
      audio.play().catch((err) => console.error("Playback failed:", err));
      window.localAudio = audio;
    },
    args: [fileURL, volume],
  });
}

export async function stopLocalAudio() {
  browser.scripting.executeScript({
    target: { tabId: await getActiveTabID() },
    func: function () {
      if (window.localAudio) {
        const audio = window.localAudio;
        audio.pause();
        audio.remove();
      }
    },
  });
}
