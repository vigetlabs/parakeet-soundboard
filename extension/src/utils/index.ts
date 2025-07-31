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

export async function playLocalAudio(file: PublicPath, volume: number) {
  if (!(await URLIsValid())) {
    return false;
  }

  const fileURL = browser.runtime.getURL(file);
  browser.scripting.executeScript({
    target: { tabId: await getActiveTabID() },
    func: function (
      fileURL: string,
      volume: number,
      endCommand: CrossFunctions
    ) {
      let audio;
      if (window.localAudio) {
        audio = window.localAudio;
        audio.pause();
        audio.currentTime = 0;
        audio.src = fileURL;
      } else {
        audio = new Audio(fileURL);
        window.localAudio = audio;
      }
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
  return true;
}

export async function stopLocalAudio() {
  if (!(await URLIsValid())) {
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

const allowedSchemes = ["http:", "https:"];

export async function URLIsValid() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const url = tab.url ?? "";
  if (allowedSchemes.some((scheme) => url.startsWith(scheme))) {
    return true;
  }
  alert(
    "Can't control audio in this tab! You're probably in an empty or settings tab. Try going to an actual website."
  ); // TODO: Change this to a toast
  return false;
}
