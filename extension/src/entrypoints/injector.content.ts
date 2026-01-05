import { CrossFunctions } from "@/utils/constants";

export default defineContentScript({
  matches: ["https://meet.google.com/*"],
  runAt: "document_start",
  main() {
    const s = document.createElement("script");
    s.src = browser.runtime.getURL("/inject.js");
    (document.head || document.documentElement).appendChild(s);
    s.onload = () => s.remove();

    let iconElement: HTMLImageElement | null = null;
    let muteButtonElement: HTMLImageElement | null = null;

    async function injectButton() {
      const hideIcon = await storage.getItem("local:hideMeetIcon") ?? false;

      if (hideIcon) {
        return;
      }

      const img = document.createElement("img");
      img.src = browser.runtime.getURL("/images/parakeetLogo.png");
      img.alt = "Open Parakeet Soundboard";
      img.classList.add("parakeetIconButton");
      document.body.appendChild(img);
      iconElement = img;

      const style = document.createElement("style");
      style.textContent = `
        .parakeetIconButton {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 64px;
          height: 64px;
          z-index: 9999;
          cursor: pointer;
          border: 2px solid #faf9f2;
          border-radius: 16px;
          transition: border-color 0.2s ease-in-out;
          transform: scale(1.1);
        }
        .parakeetIconButton:hover {
          border-color: #008573;
        }
      `;
      document.head.appendChild(style);

      img.addEventListener("click", () =>
        browser.runtime.sendMessage({ type: CrossFunctions.OPEN_POPUP })
      );
    }

    function removeButton() {
      if (iconElement) {
        iconElement.remove();
        iconElement = null;
      }
    }

    async function injectMuteButton() {
      const hideMuteButton = await storage.getItem("local:hideMuteButton") ?? false;

      if (hideMuteButton) {
        return;
      }

      const img = document.createElement("img");
      const currentlyMuted = await browser.runtime.sendMessage({
        type: CrossFunctions.GET_MIC_MUTED
      });
      if (currentlyMuted) {
        img.src = browser.runtime.getURL("/images/TempMuted.png");
      } else {
        img.src = browser.runtime.getURL("/images/TempUnmuted.png");
      }
      img.alt = "Mute/Unmute Microphone through Parakeet";
      img.classList.add("parakeetMuteButton");
      document.body.appendChild(img);
      muteButtonElement = img;

      const style = document.createElement("style");
      style.textContent = `
        .parakeetMuteButton {
          position: fixed;
          bottom: 80px;
          left: 20px;
          width: 64px;
          height: 64px;
          z-index: 9999;
          cursor: pointer;
          border: 2px solid #faf9f2;
          border-radius: 16px;
          transition: border-color 0.2s ease-in-out;
          transform: scale(1.1);
        }
        .parakeetMuteButton:hover {
          border-color: #008573;
        }
      `;
      document.head.appendChild(style);
      img.addEventListener("click", async () => {
        console.log("Button clicked, sending GET_MIC_MUTED");
        const currentlyMuted = await browser.runtime.sendMessage({
          type: CrossFunctions.GET_MIC_MUTED
        });
        console.log("Current mic muted state:", currentlyMuted);
        if (currentlyMuted) {
          browser.runtime.sendMessage({ type: CrossFunctions.UNMUTE_MICROPHONE });
          img.src = browser.runtime.getURL("/images/TempUnmuted.png");
        } else {
          browser.runtime.sendMessage({ type: CrossFunctions.MUTE_MICROPHONE });
          img.src = browser.runtime.getURL("/images/TempMuted.png");
        }
      });
    }

    function removeMuteButton() {
      if (muteButtonElement) {
        muteButtonElement.remove();
        muteButtonElement = null;
      }
    }

    browser.runtime.onMessage.addListener((message) => {
      if (message.type === CrossFunctions.TOGGLE_MEET_ICON) {
        if (message.hide) {
          removeButton();
        } else {
          injectButton();
        }
      }
      if (message.type === CrossFunctions.TOGGLE_MUTE_BUTTON) {
        if (message.hide) {
          removeMuteButton();
        } else {
          injectMuteButton();
        }
      }
      if (message.type === CrossFunctions.MUTE_MICROPHONE) {
        if (muteButtonElement) {
          muteButtonElement.src = browser.runtime.getURL("/images/TempMuted.png");
        }
      }

      if (message.type === CrossFunctions.UNMUTE_MICROPHONE) {
        if (muteButtonElement) {
          muteButtonElement.src = browser.runtime.getURL("/images/TempUnmuted.png");
        }
      }
    });

    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", injectButton);
      window.addEventListener("DOMContentLoaded", injectMuteButton);
    } else {
      injectButton();
      injectMuteButton();
    }
  },
});
