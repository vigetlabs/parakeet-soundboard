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
  if (await checkIfRestricted()) {
    return;
  }

  const fileURL = browser.runtime.getURL(file);
  browser.scripting.executeScript({
    target: { tabId: await getActiveTabID() },
    func: function (
      fileURL: string,
      volume: number,
      endCommand: CrossFunctions
    ) {
      if (window.localAudio) {
        const audio = window.localAudio;
        audio.pause();
        audio.remove();
      }
      const audio = new Audio(fileURL);
      audio.currentTime = 0;
      audio.volume = volume / 100;
      audio.onended = () => {
        window.postMessage(
          {
            command: endCommand,
          },
          "*"
        );
      };
      audio.play().catch((err) => console.error("Playback failed:", err));
      window.localAudio = audio;
    },
    args: [fileURL, volume, CrossFunctions.AUDIO_ENDED],
  });
}

export async function stopLocalAudio() {
  if (await checkIfRestricted()) {
    return;
  }

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

export async function checkIfRestricted() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const url = tab.url ?? "";
  if (restrictedSchemes.some((scheme) => url.startsWith(scheme))) {
    console.log("Can't play audio in this tab"); // TODO: Change this to a toast
    return true;
  }
  return false;
}
