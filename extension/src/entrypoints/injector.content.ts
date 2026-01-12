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
    let muteMutationObserver: MutationObserver | null = null;
    let muteResizeObserver: ResizeObserver | null = null;

    if (!document.getElementById('parakeet-styles')) {
      const style = document.createElement("style");
      style.id = 'parakeet-styles';
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
        .parakeetMuteButton {
          position: fixed;
          width: 47px;
          height: 47px;
          cursor: pointer;
          z-index: 9999;
        }
        .parakeetMuteButton:hover {
          transform: scale(1.1);
        }
        `;
      document.documentElement.appendChild(style);
    }

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

      let buttonInjected = false;

      // Add the Parakeet mute button next to Google Meet controls when DOM changes and control bar is present
      // and update its position on resize to stay next to controls
      function tryInjectButton() {

        const controlBar = document.querySelector('[aria-label="Call controls"][role="region"]');

        if (controlBar && !buttonInjected) {
          buttonInjected = true;

          (async () => {

            const img = document.createElement("img");
            const currentlyMuted = await browser.runtime.sendMessage({
              type: CrossFunctions.GET_MIC_MUTED
            });

            const micOnUrl = browser.runtime.getURL("/images/parakeet-mic-on.svg");
            const micOffUrl = browser.runtime.getURL("/images/parakeet-mic-off.svg");

            img.src = currentlyMuted ? micOffUrl : micOnUrl;
            img.alt = "Mute/Unmute Microphone through Parakeet";
            img.classList.add("parakeetMuteButton");

            document.body.appendChild(img);
            muteButtonElement = img;

            // update position based on control bar
            function updatePosition() {
              if (!controlBar) return;
              const controlBarRect = controlBar.getBoundingClientRect();
              // Position to the left of the control bar
              img.style.left = Math.max(controlBarRect.left - 50, 10) + "px";
              img.style.bottom = `${window.innerHeight - controlBarRect.bottom}px`;
            }

            // Update position initially and on changes
            updatePosition();
            window.addEventListener('resize', updatePosition);

            // Watch for control bar position changes
            if (!muteResizeObserver) {
              muteResizeObserver = new ResizeObserver(updatePosition);
              muteResizeObserver.observe(controlBar);
            }

            img.addEventListener("click", async () => {
              const currentlyMuted = await browser.runtime.sendMessage({
                type: CrossFunctions.GET_MIC_MUTED
              });

              if (currentlyMuted) {
                browser.runtime.sendMessage({ type: CrossFunctions.UNMUTE_MICROPHONE });
                img.src = micOnUrl;
              } else {
                browser.runtime.sendMessage({ type: CrossFunctions.MUTE_MICROPHONE });
                img.src = micOffUrl;
              }
            });
          })();
        }
        else if (!controlBar && buttonInjected) {
          cleanupMuteButton();
          buttonInjected = false;
        }
      }

      if (!muteMutationObserver) {
        // Use MutationObserver to watch for control bar appearing in DOM
        muteMutationObserver = new MutationObserver(() => {
          tryInjectButton();
        });

        // Start observing the document for changes
        muteMutationObserver.observe(document.body, {
          childList: true,
          subtree: true
        });
      }

      // Initial try
      tryInjectButton();
    }

    function cleanupMuteButton() {
      // Remove button
      if (muteButtonElement) {
        muteButtonElement.remove();
        muteButtonElement = null;
      }

      // Disconnect ResizeObserver
      if (muteResizeObserver) {
        muteResizeObserver.disconnect();
        muteResizeObserver = null;
      }
    }

    function removeMuteButton() {
      cleanupMuteButton();

      // Disconnect MutationObserver
      if (muteMutationObserver) {
        muteMutationObserver.disconnect();
        muteMutationObserver = null;
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
          muteButtonElement.src = browser.runtime.getURL("/images/parakeet-mic-off.svg");
        }
      }

      if (message.type === CrossFunctions.UNMUTE_MICROPHONE) {
        if (muteButtonElement) {
          muteButtonElement.src = browser.runtime.getURL("/images/parakeet-mic-on.svg");
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
