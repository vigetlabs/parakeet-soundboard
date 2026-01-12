import { CrossFunctions } from "@/utils/constants";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  main() {
    window.addEventListener("message", async (event) => {
      if (event.source !== window) return;
      if (event.data.command === CrossFunctions.GET_MIC_MUTED) {
        const micMuted = await browser.runtime.sendMessage({
          type: CrossFunctions.GET_MIC_MUTED,
        });
        let toPost = CrossFunctions.UNMUTE_MICROPHONE;
        if (micMuted) {
          toPost = CrossFunctions.MUTE_MICROPHONE;
        }
        window.postMessage(
          {
            command: toPost,
          },
          "*"
        );
      } else if (event.data.command === CrossFunctions.AUDIO_ENDED) {
        browser.runtime.sendMessage({
          type: CrossFunctions.AUDIO_ENDED,
        });
      } else if (event.data.command === CrossFunctions.OPEN_POPUP) {
        browser.runtime.sendMessage({
          type: CrossFunctions.OPEN_POPUP,
        });
      } else if (event.data.command === CrossFunctions.SET_AUTH_TOKEN) {
        if (event.origin !== `${import.meta.env.VITE_WEBSITE_URL}`) return;
        await browser.runtime.sendMessage({
          type: CrossFunctions.SET_AUTH_TOKEN,
          token: event.data.token,
          refreshToken: event.data.refreshToken
        });
      } else if (event.data.command === CrossFunctions.REMOVE_AUTH_TOKEN) {
        if (event.origin !== `${import.meta.env.VITE_WEBSITE_URL}`) return;
        await browser.runtime.sendMessage({
          type: CrossFunctions.REMOVE_AUTH_TOKEN,
        });
      }
    });
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === CrossFunctions.MUTE_MICROPHONE) {
        window.postMessage({
          command: CrossFunctions.MUTE_MICROPHONE
        }, "*");
      } else if (message.type === CrossFunctions.UNMUTE_MICROPHONE) {
        window.postMessage({
          command: CrossFunctions.UNMUTE_MICROPHONE
        }, "*");
      }
    });
  },
});
