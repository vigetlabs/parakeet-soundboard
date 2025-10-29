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

    browser.runtime.onMessage.addListener((message) => {
      if (message.type === CrossFunctions.TOGGLE_MEET_ICON) {
        if (message.hide) {
          removeButton();
        } else {
          injectButton();
        }
      }
    });

    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", injectButton);
    } else {
      injectButton();
    }
  },
});
