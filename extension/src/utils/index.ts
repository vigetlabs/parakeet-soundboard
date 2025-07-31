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
  let returnValue = true;

  const fileURL = browser.runtime.getURL(file);
  await browser.scripting
    .executeScript({
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
      },
      args: [fileURL, volume, CrossFunctions.AUDIO_ENDED],
    })
    .catch((err) => {
      alert(
        "Can't control audio in this tab! You're probably on an empty page or a settings tab. Try going to an actual website."
      ); // TODO: Change this to a toast
      console.warn(
        'Can\'t control audio in this tab. This is expected behavior on certain "empty" pages:\n\n',
        err
      );
      returnValue = false;
    });
  return returnValue;
}

export async function stopLocalAudio() {
  if (!(await URLIsValid())) {
    return;
  }

  browser.scripting
    .executeScript({
      target: { tabId: await getActiveTabID() },
      func: function () {
        if (window.localAudio) {
          const audio = window.localAudio;
          audio.pause();
          audio.currentTime = 0;
        }
      },
    })
    .catch((err) => {
      console.warn(
        'Can\'t control audio in this tab. This is expected behavior on certain "empty" pages:\n\n',
        err
      );
    });
}

export async function setLocalVolume(volume: number) {
  browser.scripting
    .executeScript({
      target: { tabId: await getActiveTabID() },
      func: function (volume: number) {
        if (window.localAudio) {
          const audio = window.localAudio;
          audio.volume = volume / 100;
        }
      },
      args: [volume],
    })
    .catch((err) => {
      console.warn(
        'Can\'t control audio in this tab. This is expected behavior on certain "empty" pages:\n\n',
        err
      );
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
    "Can't control audio in this tab! You're probably on an empty page or a settings tab. Try going to an actual website."
  ); // TODO: Change this to a toast
  return false;
}
