import { CrossFunctions } from "@/utils/constants";

export default defineContentScript({
  matches: ["https://meet.google.com/*"],
  exclude: ["firefox"],
  runAt: "document_start",
  main() {
    function injectButton() {
      const img = document.createElement("img");
      img.src = browser.runtime.getURL("/images/parakeetLogo.png");
      img.alt = "Open Parakeet Soundboard";
      img.classList.add("parakeetIconButton");
      document.body.appendChild(img);

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

    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", injectButton);
    } else {
      injectButton();
    }
  },
});
