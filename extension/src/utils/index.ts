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

export async function playLocalAudio(base64Audio: string, volume: number) {
  if (!(await URLIsValid())) {
    return false;
  }

  browser.scripting.executeScript({
    target: { tabId: await getActiveTabID() },
    func: function (
      base64Audio: string,
      volume: number,
      endCommand: CrossFunctions
    ) {
      function base64ToBlob(base64: string, mimeType = "audio/mpeg") {
        const real_base64 = base64.split(',')[1];
        const byteCharacters = atob(real_base64);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, { type: mimeType });
      }

      if (window.localAudio) {
        const audio = window.localAudio;
        audio.pause();
        audio.remove();
      }

      try {
        const blob = base64ToBlob(base64Audio);
        const objectUrl = URL.createObjectURL(blob);
        const audio = new Audio(objectUrl);
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
      } catch (e) {
        console.error("Failed to decode and play base64 audio:", e);
      }
    },
    args: [base64Audio, volume, CrossFunctions.AUDIO_ENDED],
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
  console.log("Can't control audio in this tab"); // TODO: Change this to a toast
  return false;
}
