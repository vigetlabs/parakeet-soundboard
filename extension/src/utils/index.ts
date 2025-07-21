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

export async function playAudio(file: PublicPath) {
  const fileURL = browser.runtime.getURL(file);
  browser.scripting.executeScript({
    target: { tabId: await getActiveTabID() },
    func: function (fileURL: string) {
      const audio = new Audio(fileURL);
      audio.currentTime = 0;
      audio.play().catch((err) => console.error("Playback failed:", err));
    },
    args: [fileURL],
  });
}
